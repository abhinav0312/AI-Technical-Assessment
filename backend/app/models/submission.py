from datetime import datetime
from typing import TYPE_CHECKING, Optional, List
from sqlalchemy import String, Text, DateTime, ForeignKey, Float, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, generate_uuid, get_utc_now

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.challenge import Challenge
    from app.models.test_case import TestCase


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    challenge_id: Mapped[str] = mapped_column(String(36), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    language: Mapped[str] = mapped_column(String(30), nullable=False)
    source_code: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="submitted", nullable=False, index=True)
    # Statuses: submitted, queued, evaluating, accepted, wrong_answer, time_limit_exceeded, memory_limit_exceeded, runtime_error, compilation_error
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    execution_time_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    memory_usage_kb: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    total_tests: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    passed_tests: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_sample_run: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    evaluated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    challenge: Mapped["Challenge"] = relationship("Challenge", back_populates="submissions")
    user: Mapped["User"] = relationship("User", back_populates="submissions")
    test_results: Mapped[List["SubmissionTestCaseResult"]] = relationship(
        "SubmissionTestCaseResult",
        back_populates="submission",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="SubmissionTestCaseResult.order_index",
    )


class SubmissionTestCaseResult(Base):
    __tablename__ = "submission_test_case_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    submission_id: Mapped[str] = mapped_column(String(36), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    test_case_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("test_cases.id", ondelete="SET NULL"), nullable=True)
    is_sample: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False)  # passed, failed, timed_out, runtime_error
    stdin: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Only populated/safe for samples
    expected_output: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Only populated/safe for samples
    actual_output: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Only populated/safe for samples
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    execution_time_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    submission: Mapped["Submission"] = relationship("Submission", back_populates="test_results")
