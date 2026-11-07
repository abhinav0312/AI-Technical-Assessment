from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.test_case import TestCase
from app.schemas.challenge import (
    ChallengeCreate,
    ChallengeUpdate,
    ChallengeResponse,
    PaginatedChallengesResponse,
    BookmarkToggleResponse,
    CodeDraftRequest,
    CodeDraftResponse,
)
from app.schemas.test_case import (
    TestCaseCreate,
    TestCaseUpdate,
    TestCaseResponse,
    SampleTestCaseResponse,
)
from app.schemas.submission import RunSampleRequest
from app.services.evaluator import EvaluationEngine, EvaluationSummary
from app.repositories.challenge_repo import ChallengeRepository
from app.repositories.submission_repo import SubmissionRepository
from app.repositories.activity_repo import ActivityRepository
from app.api.dependencies import (
    get_current_user,
    get_current_user_optional,
    require_roles,
)
from app.models.user import User

router = APIRouter()


@router.get("", response_model=PaginatedChallengesResponse)
async def list_challenges(
    search: Optional[str] = Query(None, min_length=1, max_length=100),
    difficulty: Optional[str] = Query(None, pattern="^(easy|medium|hard)$"),
    category: Optional[str] = Query(None, max_length=50),
    tag: Optional[str] = Query(None, max_length=50),
    language: Optional[str] = Query(None, max_length=30),
    sort_by: Optional[str] = Query("newest", pattern="^(newest|oldest|title_asc|title_desc|difficulty_asc|difficulty_desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    repo = ChallengeRepository(db)
    sub_repo = SubmissionRepository(db)

    items, total = await repo.list_challenges(
        search=search,
        difficulty=difficulty,
        category=category,
        tag=tag,
        language=language,
        sort_by=sort_by,
        page=page,
        page_size=page_size,
        only_public=True,
    )

    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    response_items = []
    for c in items:
        resp = ChallengeResponse.model_validate(c)

        # Real acceptance statistics
        stats = await sub_repo.get_challenge_stats(c.id)
        resp.acceptance_rate = stats["acceptance_rate"]
        resp.total_submissions = stats["total_submissions"]

        # Authenticated user telemetry
        if current_user:
            resp.user_status = await sub_repo.get_user_challenge_status(current_user.id, c.id)
            resp.is_bookmarked = await repo.is_bookmarked(current_user.id, c.id)

        response_items.append(resp)

    return PaginatedChallengesResponse(
        items=response_items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{slug_or_id}", response_model=ChallengeResponse)
async def get_challenge(
    slug_or_id: str,
    language: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    repo = ChallengeRepository(db)
    sub_repo = SubmissionRepository(db)

    challenge = await repo.get_by_slug(slug_or_id, load_test_cases=True)
    if not challenge:
        challenge = await repo.get_by_id(slug_or_id, load_test_cases=True)

    if not challenge or challenge.visibility != "public":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found or is restricted.",
        )

    resp = ChallengeResponse.model_validate(challenge)

    # Attach public sample test cases ONLY (never hidden tests)
    sample_tests = [
        SampleTestCaseResponse.model_validate(tc)
        for tc in challenge.test_cases
        if tc.is_sample
    ]
    resp.sample_test_cases = sample_tests

    # Adjacent challenges for sequence navigation
    prev_slug, next_slug = await repo.get_adjacent_challenges(challenge.created_at)
    resp.prev_challenge_slug = prev_slug
    resp.next_challenge_slug = next_slug

    # Acceptance statistics
    stats = await sub_repo.get_challenge_stats(challenge.id)
    resp.acceptance_rate = stats["acceptance_rate"]
    resp.total_submissions = stats["total_submissions"]

    # User telemetry & drafts
    if current_user:
        resp.user_status = await sub_repo.get_user_challenge_status(current_user.id, challenge.id)
        resp.is_bookmarked = await repo.is_bookmarked(current_user.id, challenge.id)

        draft_lang = language or (challenge.supported_languages[0] if challenge.supported_languages else "python")
        draft = await repo.get_draft(current_user.id, challenge.id, draft_lang)
        if draft:
            resp.user_draft = draft.code

    return resp


@router.post("/{slug_or_id}/bookmark", response_model=BookmarkToggleResponse)
async def toggle_bookmark(
    slug_or_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = ChallengeRepository(db)
    challenge = await repo.get_by_slug(slug_or_id) or await repo.get_by_id(slug_or_id)
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found.")

    is_bookmarked = await repo.toggle_bookmark(current_user.id, challenge.id)
    return BookmarkToggleResponse(challenge_id=challenge.id, is_bookmarked=is_bookmarked)


@router.get("/{slug_or_id}/draft", response_model=Optional[CodeDraftResponse])
async def get_draft(
    slug_or_id: str,
    language: str = Query("python"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = ChallengeRepository(db)
    challenge = await repo.get_by_slug(slug_or_id) or await repo.get_by_id(slug_or_id)
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found.")

    draft = await repo.get_draft(current_user.id, challenge.id, language)
    if not draft:
        return None
    return CodeDraftResponse.model_validate(draft)


@router.put("/{slug_or_id}/draft", response_model=CodeDraftResponse)
async def save_draft(
    slug_or_id: str,
    draft_in: CodeDraftRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = ChallengeRepository(db)
    challenge = await repo.get_by_slug(slug_or_id) or await repo.get_by_id(slug_or_id)
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found.")

    draft = await repo.save_draft(current_user.id, challenge.id, draft_in.language, draft_in.code)
    return CodeDraftResponse.model_validate(draft)


@router.post("/{slug_or_id}/run-sample", response_model=EvaluationSummary)
async def run_sample_tests(
    slug_or_id: str,
    run_req: RunSampleRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Executes solution against public sample tests with immediate feedback in an isolated sandbox.
    """
    repo = ChallengeRepository(db)
    challenge = await repo.get_by_slug(slug_or_id, load_test_cases=True) or await repo.get_by_id(slug_or_id, load_test_cases=True)
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found.")

    sample_tests = [tc for tc in challenge.test_cases if tc.is_sample]
    if not sample_tests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No sample test cases configured for this challenge.",
        )

    summary = await EvaluationEngine.evaluate_submission(
        language=run_req.language,
        source_code=run_req.source_code,
        test_cases=sample_tests,
        is_sample_only=True,
    )
    return summary


# Creator / Admin Test Case Management Endpoints
@router.get("/{slug_or_id}/test-cases", response_model=List[TestCaseResponse])
async def list_test_cases(
    slug_or_id: str,
    current_user: User = Depends(require_roles(["creator", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    repo = ChallengeRepository(db)
    challenge = await repo.get_by_slug(slug_or_id) or await repo.get_by_id(slug_or_id)
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found.")

    test_cases = await repo.get_test_cases(challenge.id)
    return [TestCaseResponse.model_validate(tc) for tc in test_cases]


@router.post(
    "/{slug_or_id}/test-cases",
    response_model=TestCaseResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_test_case(
    slug_or_id: str,
    tc_in: TestCaseCreate,
    current_user: User = Depends(require_roles(["creator", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    repo = ChallengeRepository(db)
    challenge = await repo.get_by_slug(slug_or_id) or await repo.get_by_id(slug_or_id)
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found.")

    tc = await repo.create_test_case(challenge.id, tc_in)
    return TestCaseResponse.model_validate(tc)


@router.put("/{slug_or_id}/test-cases/{test_case_id}", response_model=TestCaseResponse)
async def update_test_case(
    slug_or_id: str,
    test_case_id: str,
    tc_in: TestCaseUpdate,
    current_user: User = Depends(require_roles(["creator", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    repo = ChallengeRepository(db)
    test_cases = await repo.get_test_cases(slug_or_id)
    # search by id
    stmt = (
        select(TestCase)
        .where(TestCase.id == test_case_id)
    )
    res = await db.execute(stmt)
    tc = res.scalar_one_or_none()
    if not tc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test case not found.")

    updated = await repo.update_test_case(tc, tc_in)
    return TestCaseResponse.model_validate(updated)


@router.delete("/{slug_or_id}/test-cases/{test_case_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_test_case(
    slug_or_id: str,
    test_case_id: str,
    current_user: User = Depends(require_roles(["creator", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(TestCase).where(TestCase.id == test_case_id)
    res = await db.execute(stmt)
    tc = res.scalar_one_or_none()
    if not tc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test case not found.")

    repo = ChallengeRepository(db)
    await repo.delete_test_case(tc)


@router.post("", response_model=ChallengeResponse, status_code=status.HTTP_201_CREATED)
async def create_challenge(
    challenge_in: ChallengeCreate,
    current_user: User = Depends(require_roles(["creator", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    repo = ChallengeRepository(db)
    activity_repo = ActivityRepository(db)

    challenge = await repo.create_challenge(challenge_in)

    await activity_repo.log_activity(
        user_id=current_user.id,
        activity_type="challenge_created",
        metadata={"challenge_id": challenge.id, "title": challenge.title},
    )

    return ChallengeResponse.model_validate(challenge)


@router.put("/{challenge_id}", response_model=ChallengeResponse)
async def update_challenge(
    challenge_id: str,
    challenge_in: ChallengeUpdate,
    current_user: User = Depends(require_roles(["creator", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    repo = ChallengeRepository(db)
    challenge = await repo.get_by_id(challenge_id)
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found.",
        )

    updated = await repo.update_challenge(challenge, challenge_in)

    activity_repo = ActivityRepository(db)
    await activity_repo.log_activity(
        user_id=current_user.id,
        activity_type="challenge_updated",
        metadata={"challenge_id": challenge.id, "title": challenge.title},
    )

    return ChallengeResponse.model_validate(updated)
