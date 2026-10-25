from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.user import User
from app.models.profile import UserProfile
from app.schemas.user import UserCreate, UserProfileUpdate


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: str) -> Optional[User]:
        stmt = (
            select(User)
            .options(selectinload(User.profile))
            .where(User.id == user_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        stmt = (
            select(User)
            .options(selectinload(User.profile))
            .where(User.email == email.lower())
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_user(self, user_in: UserCreate, hashed_password: str) -> User:
        user = User(
            email=user_in.email.lower(),
            password_hash=hashed_password,
            display_name=user_in.display_name,
            role=user_in.role or "candidate",
            account_status="active",
        )
        self.db.add(user)
        await self.db.flush()

        # Create linked profile
        profile = UserProfile(
            user_id=user.id,
            biography="",
            preferred_programming_languages=["python", "typescript"],
            experience_level="mid",
            learning_goals="Enhance algorithms and system design proficiency",
            timezone="UTC",
        )
        self.db.add(profile)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update_profile(self, user: User, profile_in: UserProfileUpdate) -> UserProfile:
        if not user.profile:
            profile = UserProfile(user_id=user.id)
            self.db.add(profile)
        else:
            profile = user.profile

        if profile_in.biography is not None:
            profile.biography = profile_in.biography
        if profile_in.preferred_programming_languages is not None:
            profile.preferred_programming_languages = profile_in.preferred_programming_languages
        if profile_in.experience_level is not None:
            profile.experience_level = profile_in.experience_level
        if profile_in.learning_goals is not None:
            profile.learning_goals = profile_in.learning_goals
        if profile_in.timezone is not None:
            profile.timezone = profile_in.timezone

        await self.db.commit()
        await self.db.refresh(profile)
        return profile
