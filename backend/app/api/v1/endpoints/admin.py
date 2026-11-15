from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.challenge import Challenge
from app.models.submission import Submission
from app.models.contest import Contest
from app.services.challenge_generator import ChallengeGeneratorService

router = APIRouter()


class GenerateChallengeRequest(BaseModel):
    topic: str = Field(..., min_length=2)
    difficulty: str = Field(default="medium")
    category: str = Field(default="algorithms")


class PublishChallengeRequest(BaseModel):
    challenge_data: Dict[str, Any]


class AdminStatsResponse(BaseModel):
    total_users: int
    total_challenges: int
    total_submissions: int
    accepted_submissions: int
    pass_rate: float
    active_contests: int


def verify_admin_or_creator(current_user: User):
    if current_user.role not in ("admin", "creator"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required.",
        )


@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    verify_admin_or_creator(current_user)

    user_count = (await db.execute(select(func.count(User.id)))).scalar() or 0
    challenge_count = (await db.execute(select(func.count(Challenge.id)))).scalar() or 0
    sub_count = (await db.execute(select(func.count(Submission.id)))).scalar() or 0
    acc_sub_count = (
        await db.execute(select(func.count(Submission.id)).where(Submission.status == "accepted"))
    ).scalar() or 0
    contest_count = (
        await db.execute(select(func.count(Contest.id)).where(Contest.status == "active"))
    ).scalar() or 0

    pass_rate = round((acc_sub_count / sub_count * 100), 1) if sub_count > 0 else 0.0

    return AdminStatsResponse(
        total_users=user_count,
        total_challenges=challenge_count,
        total_submissions=sub_count,
        accepted_submissions=acc_sub_count,
        pass_rate=pass_rate,
        active_contests=contest_count,
    )


@router.post("/generate-challenge")
async def generate_challenge_preview(
    body: GenerateChallengeRequest,
    current_user: User = Depends(get_current_user),
):
    verify_admin_or_creator(current_user)
    generated = await ChallengeGeneratorService.generate_challenge(
        topic=body.topic,
        difficulty=body.difficulty,
        category=body.category,
    )
    return generated


@router.post("/publish-challenge", status_code=status.HTTP_201_CREATED)
async def publish_challenge(
    body: PublishChallengeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    verify_admin_or_creator(current_user)
    challenge = await ChallengeGeneratorService.persist_challenge(
        data=body.challenge_data,
        creator_id=current_user.id,
        db=db,
    )
    return {
        "message": "Challenge successfully published to live arena!",
        "id": challenge.id,
        "slug": challenge.slug,
        "title": challenge.title,
    }

