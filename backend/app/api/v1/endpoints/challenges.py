from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.challenge import (
    ChallengeCreate,
    ChallengeUpdate,
    ChallengeResponse,
    PaginatedChallengesResponse,
)
from app.repositories.challenge_repo import ChallengeRepository
from app.repositories.activity_repo import ActivityRepository
from app.api.dependencies import get_current_user, require_roles
from app.models.user import User

router = APIRouter()


@router.get("", response_model=PaginatedChallengesResponse)
async def list_challenges(
    search: Optional[str] = Query(None, min_length=1, max_length=100),
    difficulty: Optional[str] = Query(None, pattern="^(easy|medium|hard)$"),
    category: Optional[str] = Query(None, max_length=50),
    tag: Optional[str] = Query(None, max_length=50),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    repo = ChallengeRepository(db)
    items, total = await repo.list_challenges(
        search=search,
        difficulty=difficulty,
        category=category,
        tag=tag,
        page=page,
        page_size=page_size,
        only_public=True,
    )

    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return PaginatedChallengesResponse(
        items=[ChallengeResponse.model_validate(c) for c in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{slug_or_id}", response_model=ChallengeResponse)
async def get_challenge(
    slug_or_id: str,
    db: AsyncSession = Depends(get_db),
):
    repo = ChallengeRepository(db)
    challenge = await repo.get_by_slug(slug_or_id)
    if not challenge:
        challenge = await repo.get_by_id(slug_or_id)

    if not challenge or challenge.visibility != "public":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found or is restricted.",
        )

    return ChallengeResponse.model_validate(challenge)


@router.post(
    "",
    response_model=ChallengeResponse,
    status_code=status.HTTP_201_CREATED,
)
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


@router.put(
    "/{challenge_id}",
    response_model=ChallengeResponse,
)
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
