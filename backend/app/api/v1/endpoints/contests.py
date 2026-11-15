import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.api.dependencies import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.contest import Contest, ContestParticipant, contest_challenge_association
from app.models.challenge import Challenge
from app.schemas.contest import (
    ContestResponse,
    ContestChallengeItem,
    ContestLeaderboardResponse,
    ContestLeaderboardEntry,
)

router = APIRouter()


@router.get("", response_model=List[ContestResponse])
async def list_contests(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Contest)
        .options(selectinload(Contest.participants), selectinload(Contest.challenges))
        .order_by(Contest.start_time.desc())
    )
    res = await db.execute(stmt)
    contests = res.scalars().all()

    user_id = current_user.id if current_user else None
    results = []

    for c in contests:
        is_reg = any(p.user_id == user_id for p in c.participants) if user_id else False

        # Load associated challenges with points and order_index
        assoc_stmt = (
            select(
                Challenge.id,
                Challenge.title,
                Challenge.slug,
                Challenge.difficulty,
                contest_challenge_association.c.points,
                contest_challenge_association.c.order_index,
            )
            .join(contest_challenge_association, Challenge.id == contest_challenge_association.c.challenge_id)
            .where(contest_challenge_association.c.contest_id == c.id)
            .order_by(contest_challenge_association.c.order_index.asc())
        )
        assoc_res = await db.execute(assoc_stmt)
        challenge_items = [
            ContestChallengeItem(
                id=row[0],
                title=row[1],
                slug=row[2],
                difficulty=row[3],
                points=row[4] or 100,
                order_index=row[5] or 1,
            )
            for row in assoc_res.fetchall()
        ]

        results.append(
            ContestResponse(
                id=c.id,
                title=c.title,
                slug=c.slug,
                description=c.description,
                start_time=c.start_time,
                end_time=c.end_time,
                status=c.status,
                participant_count=len(c.participants),
                challenges=challenge_items,
                is_registered=is_reg,
            )
        )

    return results


@router.get("/{slug_or_id}", response_model=ContestResponse)
async def get_contest(
    slug_or_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Contest)
        .options(selectinload(Contest.participants), selectinload(Contest.challenges))
        .where((Contest.slug == slug_or_id) | (Contest.id == slug_or_id))
    )
    res = await db.execute(stmt)
    c = res.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contest not found.")

    user_id = current_user.id if current_user else None
    is_reg = any(p.user_id == user_id for p in c.participants) if user_id else False

    assoc_stmt = (
        select(
            Challenge.id,
            Challenge.title,
            Challenge.slug,
            Challenge.difficulty,
            contest_challenge_association.c.points,
            contest_challenge_association.c.order_index,
        )
        .join(contest_challenge_association, Challenge.id == contest_challenge_association.c.challenge_id)
        .where(contest_challenge_association.c.contest_id == c.id)
        .order_by(contest_challenge_association.c.order_index.asc())
    )
    assoc_res = await db.execute(assoc_stmt)
    challenge_items = [
        ContestChallengeItem(
            id=row[0],
            title=row[1],
            slug=row[2],
            difficulty=row[3],
            points=row[4] or 100,
            order_index=row[5] or 1,
        )
        for row in assoc_res.fetchall()
    ]

    return ContestResponse(
        id=c.id,
        title=c.title,
        slug=c.slug,
        description=c.description,
        start_time=c.start_time,
        end_time=c.end_time,
        status=c.status,
        participant_count=len(c.participants),
        challenges=challenge_items,
        is_registered=is_reg,
    )


@router.post("/{contest_id}/register", status_code=status.HTTP_200_OK)
async def register_contest(
    contest_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Contest).where((Contest.id == contest_id) | (Contest.slug == contest_id))
    res = await db.execute(stmt)
    c = res.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contest not found.")

    part_stmt = select(ContestParticipant).where(
        ContestParticipant.contest_id == c.id, ContestParticipant.user_id == current_user.id
    )
    part_res = await db.execute(part_stmt)
    existing = part_res.scalar_one_or_none()
    if existing:
        return {"message": "Already registered for contest.", "contest_id": c.id}

    participant = ContestParticipant(
        contest_id=c.id,
        user_id=current_user.id,
        score=0,
        penalty_seconds=0,
    )
    db.add(participant)
    await db.commit()

    return {"message": "Successfully registered for contest!", "contest_id": c.id}


@router.get("/{contest_id}/leaderboard", response_model=ContestLeaderboardResponse)
async def get_contest_leaderboard(
    contest_id: str,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Contest).where((Contest.id == contest_id) | (Contest.slug == contest_id))
    res = await db.execute(stmt)
    c = res.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contest not found.")

    lead_stmt = (
        select(ContestParticipant)
        .options(selectinload(ContestParticipant.user))
        .where(ContestParticipant.contest_id == c.id)
        .order_by(ContestParticipant.score.desc(), ContestParticipant.penalty_seconds.asc())
    )
    lead_res = await db.execute(lead_stmt)
    participants = lead_res.scalars().all()

    entries = []
    for rank, p in enumerate(participants, start=1):
        display_name = p.user.display_name if p.user else "Anonymous"
        entries.append(
            ContestLeaderboardEntry(
                rank=rank,
                user_id=p.user_id,
                display_name=display_name,
                score=p.score,
                penalty_seconds=p.penalty_seconds,
            )
        )

    return ContestLeaderboardResponse(
        contest_id=c.id,
        contest_title=c.title,
        entries=entries,
    )

