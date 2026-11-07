from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.submission import (
    SubmissionCreate,
    SubmissionResponse,
    PaginatedSubmissionsResponse,
    SubmissionTestCaseResultResponse,
)
from app.repositories.submission_repo import SubmissionRepository
from app.repositories.challenge_repo import ChallengeRepository
from app.repositories.activity_repo import ActivityRepository
from app.services.evaluator import enqueue_submission
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


class SubmissionPayload(BaseModel):
    challenge_id: str
    language: str = Field(..., pattern="^(python|typescript|javascript)$")
    source_code: str = Field(..., min_length=1)


def sanitize_submission_response(sub, current_user: User) -> SubmissionResponse:
    """
    Serializes a submission into a safe response model.
    STRICT CONFIDENTIALITY RULE: Never exposes hidden test case inputs, expected outputs,
    or actual outputs to candidates.
    """
    is_staff = current_user.role in ("admin", "creator")
    safe_results = []

    for tr in sub.test_results:
        # Staff can inspect all outputs for debugging; candidates only get sample test details
        can_view_details = is_staff or tr.is_sample
        safe_results.append(
            SubmissionTestCaseResultResponse(
                id=tr.id,
                test_case_id=tr.test_case_id,
                is_sample=tr.is_sample,
                status=tr.status,
                stdin=tr.stdin if can_view_details else None,
                expected_output=tr.expected_output if can_view_details else None,
                actual_output=tr.actual_output if can_view_details else None,
                error_message=tr.error_message if can_view_details else (tr.error_message if tr.status == "timed_out" else None),
                execution_time_ms=tr.execution_time_ms,
                order_index=tr.order_index,
            )
        )

    return SubmissionResponse(
        id=sub.id,
        challenge_id=sub.challenge_id,
        challenge_title=sub.challenge.title if sub.challenge else None,
        challenge_slug=sub.challenge.slug if sub.challenge else None,
        user_id=sub.user_id,
        user_display_name=sub.user.display_name if sub.user else None,
        language=sub.language,
        source_code=sub.source_code,
        status=sub.status,
        score=sub.score,
        execution_time_ms=sub.execution_time_ms,
        memory_usage_kb=sub.memory_usage_kb,
        error_message=sub.error_message,
        total_tests=sub.total_tests,
        passed_tests=sub.passed_tests,
        is_sample_run=sub.is_sample_run,
        created_at=sub.created_at,
        evaluated_at=sub.evaluated_at,
        test_results=safe_results,
    )


@router.post("", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
async def create_submission(
    payload: SubmissionPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    challenge_repo = ChallengeRepository(db)
    challenge = await challenge_repo.get_by_id(payload.challenge_id) or await challenge_repo.get_by_slug(payload.challenge_id)
    if not challenge or challenge.visibility != "public":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found.")

    sub_repo = SubmissionRepository(db)
    submission = await sub_repo.create_submission(
        user_id=current_user.id,
        challenge_id=challenge.id,
        language=payload.language,
        source_code=payload.source_code,
        is_sample_run=False,
    )

    # Enqueue background evaluation job
    await enqueue_submission(submission.id)

    # Telemetry activity log
    activity_repo = ActivityRepository(db)
    await activity_repo.log_activity(
        user_id=current_user.id,
        activity_type="submission_created",
        metadata={
            "submission_id": submission.id,
            "challenge_id": challenge.id,
            "challenge_title": challenge.title,
            "language": payload.language,
        },
    )

    # Return refreshed submission
    loaded = await sub_repo.get_by_id(submission.id)
    return sanitize_submission_response(loaded, current_user)


@router.get("", response_model=PaginatedSubmissionsResponse)
async def list_submissions(
    challenge_id: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    sub_repo = SubmissionRepository(db)

    # Enforce security boundary: candidates can ONLY access their own submissions
    target_user_id = current_user.id
    if current_user.role in ("admin", "creator") and user_id:
        target_user_id = user_id

    items, total = await sub_repo.list_submissions(
        user_id=target_user_id,
        challenge_id=challenge_id,
        only_formal=True,
        page=page,
        page_size=page_size,
    )

    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return PaginatedSubmissionsResponse(
        items=[sanitize_submission_response(s, current_user) for s in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{submission_id}", response_model=SubmissionResponse)
async def get_submission(
    submission_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    sub_repo = SubmissionRepository(db)
    submission = await sub_repo.get_by_id(submission_id)
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found.")

    # Enforce candidate isolation
    if current_user.role == "candidate" and submission.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot inspect another candidate's private submission.",
        )

    return sanitize_submission_response(submission, current_user)
