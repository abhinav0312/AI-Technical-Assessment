from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy import select, func, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.submission import Submission, SubmissionTestCaseResult
from app.models.challenge import Challenge
from app.models.user import User


class SubmissionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_submission(
        self,
        user_id: str,
        challenge_id: str,
        language: str,
        source_code: str,
        is_sample_run: bool = False,
    ) -> Submission:
        submission = Submission(
            user_id=user_id,
            challenge_id=challenge_id,
            language=language,
            source_code=source_code,
            status="queued" if not is_sample_run else "evaluating",
            is_sample_run=is_sample_run,
        )
        self.db.add(submission)
        await self.db.commit()
        await self.db.refresh(submission)
        return submission

    async def get_by_id(self, submission_id: str) -> Optional[Submission]:
        stmt = (
            select(Submission)
            .options(
                selectinload(Submission.test_results),
                selectinload(Submission.challenge),
                selectinload(Submission.user),
            )
            .where(Submission.id == submission_id)
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def list_submissions(
        self,
        user_id: Optional[str] = None,
        challenge_id: Optional[str] = None,
        only_formal: bool = True,
        page: int = 1,
        page_size: int = 10,
    ) -> Tuple[List[Submission], int]:
        query = (
            select(Submission)
            .options(
                selectinload(Submission.test_results),
                selectinload(Submission.challenge),
                selectinload(Submission.user),
            )
        )

        if only_formal:
            query = query.where(Submission.is_sample_run == False)

        if user_id:
            query = query.where(Submission.user_id == user_id)

        if challenge_id:
            query = query.where(Submission.challenge_id == challenge_id)

        # Count total
        count_stmt = select(func.count()).select_from(query.subquery())
        count_res = await self.db.execute(count_stmt)
        total = count_res.scalar_one()

        # Paginate
        offset = (page - 1) * page_size
        query = query.order_by(desc(Submission.created_at)).offset(offset).limit(page_size)

        result = await self.db.execute(query)
        items = result.scalars().all()
        return list(items), total

    async def get_challenge_stats(self, challenge_id: str) -> Dict[str, Any]:
        """Calculates acceptance statistics based on actual submission records."""
        total_stmt = (
            select(func.count(Submission.id))
            .where(Submission.challenge_id == challenge_id, Submission.is_sample_run == False)
        )
        accepted_stmt = (
            select(func.count(Submission.id))
            .where(
                Submission.challenge_id == challenge_id,
                Submission.is_sample_run == False,
                Submission.status == "accepted",
            )
        )

        total_res = await self.db.execute(total_stmt)
        accepted_res = await self.db.execute(accepted_stmt)

        total = total_res.scalar_one() or 0
        accepted = accepted_res.scalar_one() or 0

        rate = round((accepted / total * 100.0), 1) if total > 0 else None
        return {
            "total_submissions": total,
            "accepted_submissions": accepted,
            "acceptance_rate": rate,
        }

    async def get_user_challenge_status(self, user_id: str, challenge_id: str) -> str:
        """Determines if user completed, attempted, or unsolved the challenge."""
        stmt = (
            select(Submission.status)
            .where(
                Submission.user_id == user_id,
                Submission.challenge_id == challenge_id,
                Submission.is_sample_run == False,
            )
        )
        res = await self.db.execute(stmt)
        statuses = res.scalars().all()
        if not statuses:
            return "unsolved"
        if any(s == "accepted" for s in statuses):
            return "completed"
        return "attempted"
