from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.thinktrace import (
    ReasoningRecordCreateOrUpdate,
    ReasoningRecordResponse,
    ReasoningVersionResponse,
    EvaluateReasoningRequest,
    ThinkTraceReportResponse,
    PaginatedReportsResponse,
    HumanReviewRequest,
)
from app.repositories.thinktrace_repo import ThinkTraceRepository
from app.repositories.challenge_repo import ChallengeRepository
from app.repositories.submission_repo import SubmissionRepository
from app.services.thinktrace import thinktrace_service, ThinkTraceEvalInput
from app.services.evaluator import EvaluationEngine
from app.api.dependencies import get_current_user, require_roles
from app.models.user import User

router = APIRouter()


def sanitize_report_response(report, current_user: User) -> ThinkTraceReportResponse:
    return ThinkTraceReportResponse(
        id=report.id,
        reasoning_record_id=report.reasoning_record_id,
        submission_id=report.submission_id,
        challenge_id=report.challenge_id,
        challenge_title=report.challenge.title if report.challenge else None,
        challenge_slug=report.challenge.slug if report.challenge else None,
        user_id=report.user_id,
        user_display_name=report.user.display_name if report.user else None,
        status=report.status,
        code_status=report.code_status,
        code_score=report.code_score,
        passed_tests=report.passed_tests,
        total_tests=report.total_tests,
        execution_time_ms=report.execution_time_ms,
        problem_understanding_score=report.problem_understanding_score,
        algorithm_correctness_score=report.algorithm_correctness_score,
        edge_case_awareness_score=report.edge_case_awareness_score,
        complexity_analysis_score=report.complexity_analysis_score,
        code_consistency_score=report.code_consistency_score,
        tradeoff_explanation_score=report.tradeoff_explanation_score,
        overall_reasoning_score=report.overall_reasoning_score,
        supporting_evidence=report.supporting_evidence,
        missing_or_incorrect_steps=report.missing_or_incorrect_steps,
        strengths=report.strengths,
        areas_for_growth=report.areas_for_growth,
        alternative_approaches=report.alternative_approaches,
        socratic_guiding_questions=report.socratic_guiding_questions,
        recommended_concept_links=report.recommended_concept_links,
        rubric_version=report.rubric_version,
        prompt_version=report.prompt_version,
        ai_provider=report.ai_provider,
        ai_model=report.ai_model,
        is_fallback=report.is_fallback,
        confidence_score=report.confidence_score,
        confidence_level=report.confidence_level,
        token_usage=report.token_usage,
        human_reviewed=report.human_reviewed,
        human_reviewer_name=None,
        human_score_override=report.human_score_override,
        human_notes=report.human_notes,
        human_reviewed_at=report.human_reviewed_at,
        created_at=report.created_at,
        updated_at=report.updated_at,
    )


# --- Reasoning Record Endpoints ---

@router.get("/challenges/{slug_or_id}/reasoning", response_model=Optional[ReasoningRecordResponse])
async def get_reasoning_record(
    slug_or_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    challenge_repo = ChallengeRepository(db)
    challenge = await challenge_repo.get_by_slug(slug_or_id) or await challenge_repo.get_by_id(slug_or_id)
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found.")

    tt_repo = ThinkTraceRepository(db)
    record = await tt_repo.get_reasoning_record(current_user.id, challenge.id)
    if not record:
        return None
    return ReasoningRecordResponse.model_validate(record)


@router.post("/challenges/{slug_or_id}/reasoning", response_model=ReasoningRecordResponse)
async def save_reasoning_record(
    slug_or_id: str,
    payload: ReasoningRecordCreateOrUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    challenge_repo = ChallengeRepository(db)
    challenge = await challenge_repo.get_by_slug(slug_or_id) or await challenge_repo.get_by_id(slug_or_id)
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found.")

    tt_repo = ThinkTraceRepository(db)
    record = await tt_repo.save_reasoning_record(current_user.id, challenge.id, payload)
    return ReasoningRecordResponse.model_validate(record)


@router.get("/challenges/{slug_or_id}/reasoning/versions", response_model=List[ReasoningVersionResponse])
async def get_reasoning_versions(
    slug_or_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    challenge_repo = ChallengeRepository(db)
    challenge = await challenge_repo.get_by_slug(slug_or_id) or await challenge_repo.get_by_id(slug_or_id)
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found.")

    tt_repo = ThinkTraceRepository(db)
    record = await tt_repo.get_reasoning_record(current_user.id, challenge.id)
    if not record:
        return []

    versions = await tt_repo.get_versions(record.id)
    return [ReasoningVersionResponse.model_validate(v) for v in versions]


# --- Combined Evaluation Endpoint ---

@router.post("/challenges/{slug_or_id}/evaluate-reasoning", response_model=ThinkTraceReportResponse)
async def evaluate_reasoning_and_solution(
    slug_or_id: str,
    req: EvaluateReasoningRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Executes a combined evaluation:
    1. Deterministic execution of submitted code against test cases (scores preserved).
    2. ThinkTrace AI rubric assessment of candidate's stated problem-solving reasoning.
    3. Produces a unified assessment report without overwriting test-case correctness.
    """
    challenge_repo = ChallengeRepository(db)
    challenge = await challenge_repo.get_by_slug(slug_or_id, load_test_cases=True) or await challenge_repo.get_by_id(slug_or_id, load_test_cases=True)
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found.")

    tt_repo = ThinkTraceRepository(db)
    sub_repo = SubmissionRepository(db)

    # 1. Resolve or Save Reasoning Record
    if req.reasoning:
        record = await tt_repo.save_reasoning_record(current_user.id, challenge.id, req.reasoning)
    else:
        record = await tt_repo.get_reasoning_record(current_user.id, challenge.id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No reasoning record found. Please formulate your problem-solving interpretation and algorithm first.",
        )

    # Creator-configurable required fields validation in assessment mode
    if challenge.reasoning_config and record.mode == "assessment":
        required_fields = challenge.reasoning_config.get("required_fields", [])
        missing_fields = []
        for rf in required_fields:
            val = getattr(record, rf, None)
            if not val or not str(val).strip():
                missing_fields.append(rf.replace("_", " ").title())
        if missing_fields:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Assessment creator requires the following reasoning fields before submission: {', '.join(missing_fields)}.",
            )

    # 2. Resolve Code Execution Results (Deterministic)
    code_status = "untested"
    code_score = 0.0
    passed_tests = 0
    total_tests = len(challenge.test_cases)
    exec_time = 0.0
    submission = None
    submitted_code = req.source_code

    if req.submission_id:
        submission = await sub_repo.get_by_id(req.submission_id)
        if submission:
            code_status = submission.status
            code_score = submission.score or 0.0
            passed_tests = submission.passed_tests
            total_tests = submission.total_tests
            exec_time = submission.execution_time_ms
            submitted_code = submission.source_code

    elif req.source_code:
        # Create formal submission and evaluate immediately
        submission = await sub_repo.create_submission(
            user_id=current_user.id,
            challenge_id=challenge.id,
            language=req.language or "python",
            source_code=req.source_code,
            is_sample_run=False,
        )

        test_cases = await challenge_repo.get_test_cases(challenge.id)
        summary = await EvaluationEngine.evaluate_submission(
            language=req.language or "python",
            source_code=req.source_code,
            test_cases=test_cases,
            is_sample_only=False,
        )

        submission.status = summary.status.value
        submission.score = summary.score
        submission.passed_tests = summary.passed_tests
        submission.total_tests = summary.total_tests
        submission.execution_time_ms = summary.total_execution_time_ms
        await db.commit()

        code_status = summary.status.value
        code_score = summary.score
        passed_tests = summary.passed_tests
        total_tests = summary.total_tests
        exec_time = summary.total_execution_time_ms

    # Link submission to reasoning record
    if submission:
        record.submission_id = submission.id
        await db.commit()

    # 3. Perform ThinkTrace AI Rubric Evaluation
    eval_input = ThinkTraceEvalInput(
        challenge_title=challenge.title,
        challenge_description=challenge.description,
        constraints=challenge.constraints,
        problem_interpretation=record.problem_interpretation,
        proposed_algorithm=record.proposed_algorithm,
        time_complexity=record.time_complexity,
        space_complexity=record.space_complexity,
        edge_cases=record.edge_cases,
        tradeoff_reasoning=record.tradeoff_reasoning,
        submitted_code=submitted_code,
        code_execution_status=code_status,
        passed_tests=passed_tests,
        total_tests=total_tests,
    )

    ai_result = await thinktrace_service.evaluate_reasoning(eval_input)
    ai_out = ai_result.evaluation

    # 4. Construct and Save ThinkTraceReport
    report_dict = {
        "reasoning_record_id": record.id,
        "submission_id": submission.id if submission else None,
        "challenge_id": challenge.id,
        "user_id": current_user.id,
        "status": "completed",
        "code_status": code_status,
        "code_score": code_score,
        "passed_tests": passed_tests,
        "total_tests": total_tests,
        "execution_time_ms": exec_time,
        "problem_understanding_score": ai_out.problem_understanding.score,
        "algorithm_correctness_score": ai_out.algorithm_correctness.score,
        "edge_case_awareness_score": ai_out.edge_case_awareness.score,
        "complexity_analysis_score": ai_out.complexity_analysis.score,
        "code_consistency_score": ai_out.code_consistency.score,
        "tradeoff_explanation_score": ai_out.tradeoff_explanation.score,
        "overall_reasoning_score": ai_out.overall_reasoning_score,
        "supporting_evidence": {
            "problem_understanding": ai_out.problem_understanding.evidence,
            "algorithm_correctness": ai_out.algorithm_correctness.evidence,
            "edge_case_awareness": ai_out.edge_case_awareness.evidence,
            "complexity_analysis": ai_out.complexity_analysis.evidence,
            "code_consistency": ai_out.code_consistency.evidence,
            "tradeoff_explanation": ai_out.tradeoff_explanation.evidence,
        },
        "missing_or_incorrect_steps": ai_out.missing_or_incorrect_steps,
        "strengths": ai_out.strengths,
        "areas_for_growth": ai_out.areas_for_growth,
        "alternative_approaches": ai_out.alternative_approaches,
        "socratic_guiding_questions": ai_out.socratic_guiding_questions,
        "recommended_concept_links": [c.model_dump() for c in ai_out.recommended_concepts],
        "rubric_version": "thinktrace-rubric-v1.0",
        "prompt_version": "thinktrace-eval-v1",
        "ai_provider": ai_result.provider,
        "ai_model": ai_result.model,
        "is_fallback": ai_result.is_fallback,
        "confidence_score": ai_out.confidence_score,
        "confidence_level": ai_out.confidence_level,
        "token_usage": ai_result.token_usage,
    }

    report = await tt_repo.save_report(report_dict)

    # Emit CodeTwin skill evidence for complexity analysis & edge-case coverage
    try:
        from app.models.codetwin import Skill, SkillEvidence
        s_res = await db.execute(select(Skill).where(Skill.slug == "big-o-time-complexity"))
        c_skill = s_res.scalar_one_or_none()
        if c_skill:
            db.add(SkillEvidence(
                user_id=current_user.id,
                skill_id=c_skill.id,
                source_type="thinktrace",
                source_id=report.id,
                challenge_title=challenge.title,
                score=ai_out.complexity_analysis.score,
                details={"stated_complexity": record.time_complexity},
            ))
            await db.commit()
    except Exception:
        pass

    loaded_report = await tt_repo.get_report_by_id(report.id)
    return sanitize_report_response(loaded_report, current_user)


# --- Reports Listing & Inspection ---

@router.get("/reports", response_model=PaginatedReportsResponse)
async def list_reports(
    challenge_id: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tt_repo = ThinkTraceRepository(db)

    # Candidate isolation: candidates can ONLY access their own reports
    target_user_id = current_user.id
    if current_user.role in ("admin", "creator") and user_id:
        target_user_id = user_id

    items, total = await tt_repo.list_reports(
        user_id=target_user_id,
        challenge_id=challenge_id,
        page=page,
        page_size=page_size,
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return PaginatedReportsResponse(
        items=[sanitize_report_response(r, current_user) for r in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/reports/{report_id}", response_model=ThinkTraceReportResponse)
async def get_report_detail(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tt_repo = ThinkTraceRepository(db)
    report = await tt_repo.get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment report not found.")

    # Candidate isolation check: Candidates cannot view another candidate's private report
    if current_user.role == "candidate" and report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You cannot view another candidate's private assessment report.",
        )

    return sanitize_report_response(report, current_user)


@router.post("/reports/{report_id}/human-review", response_model=ThinkTraceReportResponse)
async def submit_human_review(
    report_id: str,
    review_req: HumanReviewRequest,
    current_user: User = Depends(require_roles(["creator", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    tt_repo = ThinkTraceRepository(db)
    report = await tt_repo.get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment report not found.")

    updated = await tt_repo.add_human_review(
        report=report,
        reviewer_id=current_user.id,
        score_override=review_req.human_score_override,
        notes=review_req.human_notes,
    )
    return sanitize_report_response(updated, current_user)
