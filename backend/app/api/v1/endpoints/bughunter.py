from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.db.session import get_db
from app.api.dependencies import get_current_user, require_roles
from app.models.user import User
from app.models.bughunter import BugHunterChallenge, BugHunterStreak, BugHunterBadge
from app.schemas.bughunter import (
    BugHunterChallengeSummaryResponse,
    BugHunterChallengeResponse,
    BugHunterRunRequest,
    BugHunterRunResponse,
    BugHunterSubmitRequest,
    BugHunterSubmissionResponse,
    BugHunterStreakResponse,
    BugHunterChallengeCreate,
)
from app.services.bughunter import bughunter_service

router = APIRouter()


@router.get("/challenges", response_model=List[BugHunterChallengeSummaryResponse])
async def list_bughunter_challenges(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(BugHunterChallenge).where(BugHunterChallenge.is_published == True)
    if category:
        stmt = stmt.where(BugHunterChallenge.bug_category == category)
    if difficulty:
        stmt = stmt.where(BugHunterChallenge.difficulty == difficulty)
    stmt = stmt.order_by(desc(BugHunterChallenge.is_daily), desc(BugHunterChallenge.created_at))

    res = await db.execute(stmt)
    challenges = res.scalars().all()
    return [BugHunterChallengeSummaryResponse.model_validate(c) for c in challenges]


@router.get("/challenges/{slug_or_id}", response_model=BugHunterChallengeResponse)
async def get_bughunter_challenge(
    slug_or_id: str,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(BugHunterChallenge).where(
        (BugHunterChallenge.slug == slug_or_id) | (BugHunterChallenge.id == slug_or_id)
    )
    res = await db.execute(stmt)
    ch = res.scalar_one_or_none()
    if not ch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Debugging challenge not found.")

    # Strictly protect hidden test cases: hidden_test_cases is NOT in the public response schema!
    return BugHunterChallengeResponse.model_validate(ch)


@router.post("/challenges/{slug_or_id}/run-tests", response_model=BugHunterRunResponse)
async def run_bughunter_tests(
    slug_or_id: str,
    payload: BugHunterRunRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(BugHunterChallenge).where(
        (BugHunterChallenge.slug == slug_or_id) | (BugHunterChallenge.id == slug_or_id)
    )
    res = await db.execute(stmt)
    ch = res.scalar_one_or_none()
    if not ch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Debugging challenge not found.")

    run_result = await bughunter_service.run_permitted_tests(
        challenge=ch,
        code=payload.code,
        language=payload.language,
    )
    return BugHunterRunResponse(**run_result)


@router.post("/challenges/{slug_or_id}/submit", response_model=BugHunterSubmissionResponse)
async def submit_bughunter_fix(
    slug_or_id: str,
    payload: BugHunterSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(BugHunterChallenge).where(
        (BugHunterChallenge.slug == slug_or_id) | (BugHunterChallenge.id == slug_or_id)
    )
    res = await db.execute(stmt)
    ch = res.scalar_one_or_none()
    if not ch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Debugging challenge not found.")

    eval_result = await bughunter_service.evaluate_bug_fix(
        challenge=ch,
        user_id=current_user.id,
        submitted_code=payload.code,
        language=payload.language,
        identified_root_cause=payload.identified_root_cause,
        time_spent_seconds=payload.time_spent_seconds,
        db=db,
    )
    return BugHunterSubmissionResponse(**eval_result)


@router.get("/streak", response_model=BugHunterStreakResponse)
async def get_bughunter_streak(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    streak_stmt = select(BugHunterStreak).where(BugHunterStreak.user_id == current_user.id)
    streak = (await db.execute(streak_stmt)).scalar_one_or_none()

    badges_stmt = select(BugHunterBadge).where(BugHunterBadge.user_id == current_user.id).order_by(desc(BugHunterBadge.earned_at))
    badges = (await db.execute(badges_stmt)).scalars().all()

    formatted_badges = [
        {
            "id": b.id,
            "badge_key": b.badge_key,
            "badge_name": b.badge_name,
            "description": b.description,
            "icon": b.icon,
            "earned_at": b.earned_at.isoformat(),
        }
        for b in badges
    ]

    return BugHunterStreakResponse(
        current_streak=streak.current_streak if streak else 0,
        longest_streak=streak.longest_streak if streak else 0,
        last_activity_date=streak.last_activity_date if streak else None,
        total_bugs_fixed=streak.total_bugs_fixed if streak else 0,
        points=streak.points if streak else 0,
        badges=formatted_badges,
    )


@router.post("/challenges", response_model=BugHunterChallengeResponse, status_code=status.HTTP_201_CREATED)
async def create_bughunter_challenge(
    payload: BugHunterChallengeCreate,
    current_user: User = Depends(require_roles(["admin", "creator"])),
    db: AsyncSession = Depends(get_db),
):
    # Validate unique slug
    check_stmt = select(BugHunterChallenge).where(BugHunterChallenge.slug == payload.slug)
    if (await db.execute(check_stmt)).scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Challenge slug already exists.")

    ch = BugHunterChallenge(
        title=payload.title,
        slug=payload.slug,
        description=payload.description,
        bug_report=payload.bug_report,
        bug_category=payload.bug_category,
        difficulty=payload.difficulty,
        starter_code=payload.starter_code,
        expected_behavior=payload.expected_behavior,
        language=payload.language,
        root_cause_options=payload.root_cause_options,
        hints=payload.hints,
        evaluation_rubric=payload.evaluation_rubric,
        public_test_cases=payload.public_test_cases,
        hidden_test_cases=payload.hidden_test_cases,
        relevant_skills=payload.relevant_skills,
        is_daily=payload.is_daily,
        daily_date=payload.daily_date,
        created_by_id=current_user.id,
        is_published=True,
    )
    db.add(ch)
    await db.commit()
    await db.refresh(ch)
    return BugHunterChallengeResponse.model_validate(ch)
