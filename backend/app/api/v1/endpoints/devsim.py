from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.api.dependencies import get_current_user, require_roles
from app.models.user import User
from app.models.devsim import DevSimScenario, DevSimAttempt, DevSimReport
from app.schemas.devsim import (
    DevSimScenarioSummaryResponse,
    DevSimScenarioResponse,
    DevSimRunRequest,
    DevSimRunResponse,
    DevSimSubmitRequest,
    DevSimReportResponse,
    DevSimEvaluatorReviewRequest,
    DevSimScenarioCreate,
)
from app.services.devsim import devsim_service

router = APIRouter()


@router.get("/scenarios", response_model=List[DevSimScenarioSummaryResponse])
async def list_devsim_scenarios(
    scenario_type: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(DevSimScenario).where(DevSimScenario.is_published == True)
    if scenario_type:
        stmt = stmt.where(DevSimScenario.scenario_type == scenario_type)
    if difficulty:
        stmt = stmt.where(DevSimScenario.difficulty == difficulty)
    stmt = stmt.order_by(desc(DevSimScenario.created_at))

    res = await db.execute(stmt)
    scenarios = res.scalars().all()
    return [DevSimScenarioSummaryResponse.model_validate(s) for s in scenarios]


@router.get("/scenarios/{slug_or_id}", response_model=DevSimScenarioResponse)
async def get_devsim_scenario(
    slug_or_id: str,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(DevSimScenario).where(
        (DevSimScenario.slug == slug_or_id) | (DevSimScenario.id == slug_or_id)
    )
    res = await db.execute(stmt)
    sc = res.scalar_one_or_none()
    if not sc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DevSim scenario not found.")

    return DevSimScenarioResponse.model_validate(sc)


@router.get("/scenarios/{slug_or_id}/attempt")
async def get_or_init_devsim_attempt(
    slug_or_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(DevSimScenario).where(
        (DevSimScenario.slug == slug_or_id) | (DevSimScenario.id == slug_or_id)
    )
    sc = (await db.execute(stmt)).scalar_one_or_none()
    if not sc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DevSim scenario not found.")

    attempt_stmt = (
        select(DevSimAttempt)
        .where(
            DevSimAttempt.scenario_id == sc.id,
            DevSimAttempt.user_id == current_user.id,
        )
        .order_by(desc(DevSimAttempt.created_at))
    )
    attempt = (await db.execute(attempt_stmt)).scalars().first()

    files = attempt.workspace_files if attempt and attempt.workspace_files else sc.starter_files
    return {
        "scenario_id": sc.id,
        "scenario_slug": sc.slug,
        "workspace_files": files,
        "read_only_files": sc.read_only_files,
        "entrypoint_command": sc.entrypoint_command,
    }


@router.post("/scenarios/{slug_or_id}/run-tests", response_model=DevSimRunResponse)
async def run_devsim_tests(
    slug_or_id: str,
    payload: DevSimRunRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(DevSimScenario).where(
        (DevSimScenario.slug == slug_or_id) | (DevSimScenario.id == slug_or_id)
    )
    sc = (await db.execute(stmt)).scalar_one_or_none()
    if not sc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DevSim scenario not found.")

    result = await devsim_service.run_workspace_tests(
        workspace_files=payload.workspace_files,
        entrypoint_command=sc.entrypoint_command,
        timeout_seconds=sc.timeout_seconds,
    )
    return DevSimRunResponse(**result)


@router.post("/scenarios/{slug_or_id}/submit", response_model=DevSimReportResponse)
async def submit_devsim_scenario(
    slug_or_id: str,
    payload: DevSimSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(DevSimScenario).where(
        (DevSimScenario.slug == slug_or_id) | (DevSimScenario.id == slug_or_id)
    )
    sc = (await db.execute(stmt)).scalar_one_or_none()
    if not sc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DevSim scenario not found.")

    report = await devsim_service.evaluate_scenario(
        scenario=sc,
        user_id=current_user.id,
        submitted_files=payload.workspace_files,
        db=db,
    )
    return DevSimReportResponse(**report)


@router.post("/reports/{report_id}/evaluator-review", response_model=DevSimReportResponse)
async def submit_evaluator_review(
    report_id: str,
    payload: DevSimEvaluatorReviewRequest,
    current_user: User = Depends(require_roles(["admin", "creator", "recruiter"])),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(DevSimReport)
        .options(selectinload(DevSimReport.scenario))
        .where(DevSimReport.id == report_id)
    )
    report = (await db.execute(stmt)).scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DevSim report not found.")

    report.evaluator_reviewed = True
    report.evaluator_notes = payload.evaluator_notes
    if payload.evaluator_score_override is not None:
        report.evaluator_score_override = payload.evaluator_score_override

    await db.commit()
    await db.refresh(report)

    return DevSimReportResponse(
        id=report.id,
        attempt_id=report.attempt_id,
        scenario_id=report.scenario_id,
        scenario_title=report.scenario.title if report.scenario else "Scenario",
        scenario_slug=report.scenario.slug if report.scenario else "scenario",
        functional_score=report.functional_score,
        acceptance_tests_passed=report.acceptance_tests_passed,
        total_acceptance_tests=report.total_acceptance_tests,
        regression_safety_passed=report.regression_safety_passed,
        execution_time_ms=report.execution_time_ms,
        test_output=report.test_output,
        rubric_scores=report.rubric_scores,
        successful_requirements=report.successful_requirements,
        major_issues=report.major_issues,
        ai_review=report.ai_review,
        evaluator_reviewed=report.evaluator_reviewed,
        evaluator_notes=report.evaluator_notes,
        evaluator_score_override=report.evaluator_score_override,
        created_at=report.created_at,
    )


@router.post("/scenarios", response_model=DevSimScenarioResponse, status_code=status.HTTP_201_CREATED)
async def create_devsim_scenario(
    payload: DevSimScenarioCreate,
    current_user: User = Depends(require_roles(["admin", "creator"])),
    db: AsyncSession = Depends(get_db),
):
    check_stmt = select(DevSimScenario).where(DevSimScenario.slug == payload.slug)
    if (await db.execute(check_stmt)).scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Scenario slug already exists.")

    sc = DevSimScenario(
        title=payload.title,
        slug=payload.slug,
        scenario_type=payload.scenario_type,
        business_context=payload.business_context,
        task_description=payload.task_description,
        acceptance_criteria=payload.acceptance_criteria,
        difficulty=payload.difficulty,
        relevant_skills=payload.relevant_skills,
        starter_files=payload.starter_files,
        read_only_files=payload.read_only_files,
        public_tests=payload.public_tests,
        hidden_tests=payload.hidden_tests,
        entrypoint_command=payload.entrypoint_command,
        timeout_seconds=payload.timeout_seconds,
        resource_limits=payload.resource_limits,
        evaluation_rubric=payload.evaluation_rubric,
        created_by_id=current_user.id,
        is_published=True,
    )
    db.add(sc)
    await db.commit()
    await db.refresh(sc)
    return DevSimScenarioResponse.model_validate(sc)
