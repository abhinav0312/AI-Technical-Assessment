from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.user import UserResponse, UserProfileUpdate, UserProfileResponse, UserUpdate
from app.repositories.user_repo import UserRepository
from app.repositories.activity_repo import ActivityRepository
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_my_display_name(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user_update.display_name:
        current_user.display_name = user_update.display_name
        await db.commit()
        await db.refresh(current_user)

    activity_repo = ActivityRepository(db)
    await activity_repo.log_activity(
        user_id=current_user.id,
        activity_type="profile_updated",
        metadata={"field": "display_name"},
    )

    return UserResponse.model_validate(current_user)


@router.put("/me/profile", response_model=UserProfileResponse)
async def update_my_user_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_repo = UserRepository(db)
    updated_profile = await user_repo.update_profile(current_user, profile_in)

    activity_repo = ActivityRepository(db)
    await activity_repo.log_activity(
        user_id=current_user.id,
        activity_type="profile_updated",
        metadata={"experience_level": profile_in.experience_level},
    )

    return UserProfileResponse.model_validate(updated_profile)


@router.get("/{user_id}/public", response_model=UserResponse)
async def get_public_user_profile(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Return public profile
    return UserResponse.model_validate(user)
