from typing import List, Dict, Any, Optional
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.activity import UserActivity
from app.models.assessment import AssessmentAttempt
from app.models.submission import Submission


class ActivityRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def log_activity(
        self, user_id: str, activity_type: str, metadata: Optional[Dict[str, Any]] = None
    ) -> UserActivity:
        activity = UserActivity(
            user_id=user_id,
            activity_type=activity_type,
            metadata_json=metadata or {},
        )
        self.db.add(activity)
        await self.db.commit()
        await self.db.refresh(activity)
        return activity

    async def get_user_activities(self, user_id: str, limit: int = 10) -> List[UserActivity]:
        stmt = (
            select(UserActivity)
            .where(UserActivity.user_id == user_id)
            .order_by(desc(UserActivity.created_at))
            .limit(limit)
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def get_completed_assessments_count(self, user_id: str) -> int:
        stmt = (
            select(AssessmentAttempt)
            .where(
                AssessmentAttempt.candidate_id == user_id,
                AssessmentAttempt.status.in_(["submitted", "evaluated"])
            )
        )
        res = await self.db.execute(stmt)
        attempts = list(res.scalars().all())
        return len(attempts)

    async def get_solved_challenges_count(self, user_id: str) -> int:
        stmt = (
            select(Submission)
            .where(
                Submission.user_id == user_id,
                Submission.status == "accepted"
            )
        )
        res = await self.db.execute(stmt)
        submissions = list(res.scalars().all())
        # Unique challenges solved
        unique_challenges = {s.challenge_id for s in submissions}
        return len(unique_challenges)
