from typing import Optional, List, Tuple, Dict, Any
from datetime import datetime, timezone
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.thinktrace import (
    ReasoningRecord,
    ReasoningRecordVersion,
    ThinkTraceReport,
)
from app.models.challenge import Challenge
from app.models.user import User
from app.schemas.thinktrace import ReasoningRecordCreateOrUpdate


class ThinkTraceRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_reasoning_record(self, user_id: str, challenge_id: str) -> Optional[ReasoningRecord]:
        stmt = (
            select(ReasoningRecord)
            .options(
                selectinload(ReasoningRecord.versions),
                selectinload(ReasoningRecord.reports),
            )
            .where(
                ReasoningRecord.user_id == user_id,
                ReasoningRecord.challenge_id == challenge_id,
            )
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def save_reasoning_record(
        self,
        user_id: str,
        challenge_id: str,
        payload: ReasoningRecordCreateOrUpdate,
    ) -> ReasoningRecord:
        record = await self.get_reasoning_record(user_id, challenge_id)

        if record:
            # Check if approach content has changed significantly to snapshot a version
            content_changed = (
                record.problem_interpretation != payload.problem_interpretation or
                record.proposed_algorithm != payload.proposed_algorithm or
                record.time_complexity != payload.time_complexity or
                record.space_complexity != payload.space_complexity or
                record.edge_cases != payload.edge_cases or
                record.tradeoff_reasoning != payload.tradeoff_reasoning
            )

            if content_changed and not record.is_locked:
                # Save previous version in version history
                ver = ReasoningRecordVersion(
                    record_id=record.id,
                    version_number=record.version,
                    problem_interpretation=record.problem_interpretation,
                    proposed_algorithm=record.proposed_algorithm,
                    time_complexity=record.time_complexity,
                    space_complexity=record.space_complexity,
                    edge_cases=record.edge_cases,
                    tradeoff_reasoning=record.tradeoff_reasoning,
                    change_summary=payload.change_summary or f"Revised to version {record.version + 1}",
                )
                self.db.add(ver)
                record.version += 1

            # Update record values
            record.problem_interpretation = payload.problem_interpretation
            record.proposed_algorithm = payload.proposed_algorithm
            record.time_complexity = payload.time_complexity
            record.space_complexity = payload.space_complexity
            record.edge_cases = payload.edge_cases
            record.tradeoff_reasoning = payload.tradeoff_reasoning
            record.mode = payload.mode
            record.updated_at = datetime.now(timezone.utc)

        else:
            record = ReasoningRecord(
                user_id=user_id,
                challenge_id=challenge_id,
                problem_interpretation=payload.problem_interpretation,
                proposed_algorithm=payload.proposed_algorithm,
                time_complexity=payload.time_complexity,
                space_complexity=payload.space_complexity,
                edge_cases=payload.edge_cases,
                tradeoff_reasoning=payload.tradeoff_reasoning,
                mode=payload.mode,
                version=1,
            )
            self.db.add(record)
            await self.db.flush()

            # Record initial snapshot
            ver = ReasoningRecordVersion(
                record_id=record.id,
                version_number=1,
                problem_interpretation=payload.problem_interpretation,
                proposed_algorithm=payload.proposed_algorithm,
                time_complexity=payload.time_complexity,
                space_complexity=payload.space_complexity,
                edge_cases=payload.edge_cases,
                tradeoff_reasoning=payload.tradeoff_reasoning,
                change_summary="Initial approach formulation",
            )
            self.db.add(ver)

        await self.db.commit()
        await self.db.refresh(record)
        return record

    async def get_versions(self, record_id: str) -> List[ReasoningRecordVersion]:
        stmt = (
            select(ReasoningRecordVersion)
            .where(ReasoningRecordVersion.record_id == record_id)
            .order_by(desc(ReasoningRecordVersion.version_number))
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def save_report(self, report_data: Dict[str, Any]) -> ThinkTraceReport:
        report = ThinkTraceReport(**report_data)
        self.db.add(report)
        await self.db.commit()
        await self.db.refresh(report)
        return report

    async def get_report_by_id(self, report_id: str) -> Optional[ThinkTraceReport]:
        stmt = (
            select(ThinkTraceReport)
            .options(
                selectinload(ThinkTraceReport.challenge),
                selectinload(ThinkTraceReport.user),
                selectinload(ThinkTraceReport.submission),
                selectinload(ThinkTraceReport.reasoning_record),
            )
            .where(ThinkTraceReport.id == report_id)
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def list_reports(
        self,
        user_id: Optional[str] = None,
        challenge_id: Optional[str] = None,
        page: int = 1,
        page_size: int = 10,
    ) -> Tuple[List[ThinkTraceReport], int]:
        query = (
            select(ThinkTraceReport)
            .options(
                selectinload(ThinkTraceReport.challenge),
                selectinload(ThinkTraceReport.user),
                selectinload(ThinkTraceReport.submission),
                selectinload(ThinkTraceReport.reasoning_record),
            )
        )

        if user_id:
            query = query.where(ThinkTraceReport.user_id == user_id)

        if challenge_id:
            query = query.where(ThinkTraceReport.challenge_id == challenge_id)

        count_stmt = select(func.count()).select_from(query.subquery())
        count_res = await self.db.execute(count_stmt)
        total = count_res.scalar_one()

        offset = (page - 1) * page_size
        query = query.order_by(desc(ThinkTraceReport.created_at)).offset(offset).limit(page_size)

        result = await self.db.execute(query)
        items = result.scalars().all()
        return list(items), total

    async def add_human_review(
        self,
        report: ThinkTraceReport,
        reviewer_id: str,
        score_override: Optional[float],
        notes: str,
    ) -> ThinkTraceReport:
        report.human_reviewed = True
        report.human_reviewer_id = reviewer_id
        if score_override is not None:
            report.human_score_override = score_override
        report.human_notes = notes
        report.human_reviewed_at = datetime.now(timezone.utc)
        report.updated_at = datetime.now(timezone.utc)

        await self.db.commit()
        await self.db.refresh(report)
        return report
