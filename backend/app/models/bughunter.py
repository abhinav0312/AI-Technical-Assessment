from datetime import datetime
from typing import TYPE_CHECKING, Optional, List, Dict, Any
from sqlalchemy import (
    String,
    Text,
    DateTime,
    ForeignKey,
    Integer,
    Float,
    Boolean,
    JSON,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, generate_uuid, get_utc_now

if TYPE_CHECKING:
    from app.models.user import User


class BugHunterChallenge(Base):
    """
    Professional debugging challenges with broken starter code, reproduction steps,
    root cause identification, regression tests, and progressive educational hints.
    """
    __tablename__ = "bughunter_challenges"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    bug_report: Mapped[str] = mapped_column(Text, nullable=False)  # Symptoms, stack trace, repro steps
    bug_category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    # Categories: logical_error, runtime_error, boundary_condition, data_handling,
    # algorithmic_inefficiency, sql_error, regression, code_quality
    difficulty: Mapped[str] = mapped_column(String(20), nullable=False)  # easy, medium, hard
    starter_code: Mapped[str] = mapped_column(Text, nullable=False)  # Code containing bug
    expected_behavior: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(String(30), default="python", nullable=False)

    root_cause_options: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    # [{"id": "rc1", "text": "...", "is_correct": bool, "explanation": "..."}]
    hints: Mapped[List[Dict[str, str]]] = mapped_column(JSON, default=list, nullable=False)
    # [{"level": 1, "title": "Inspection Tip", "content": "..."}]
    evaluation_rubric: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    # {"bug_fix_weight": 0.5, "regression_weight": 0.3, "edge_case_weight": 0.2}

    public_test_cases: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    # [{"stdin": "...", "expected_output": "...", "description": "..."}]
    hidden_test_cases: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    # [{"stdin": "...", "expected_output": "...", "description": "...", "is_regression": bool, "is_edge": bool}]

    relevant_skills: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    is_daily: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    daily_date: Mapped[Optional[str]] = mapped_column(String(20), nullable=True, index=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_by_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    submissions: Mapped[List["BugHunterSubmission"]] = relationship(
        "BugHunterSubmission", back_populates="challenge", cascade="all, delete-orphan", lazy="select"
    )


class BugHunterSubmission(Base):
    """
    Candidate debugging attempt capturing code corrections, root cause hypothesis,
    regression/edge test outcomes, and AI debugging advisory review.
    """
    __tablename__ = "bughunter_submissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    challenge_id: Mapped[str] = mapped_column(String(36), ForeignKey("bughunter_challenges.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    submitted_code: Mapped[str] = mapped_column(Text, nullable=False)
    identified_root_cause: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    root_cause_correct: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)

    is_bug_fixed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    regressions_passed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    edge_cases_passed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    passed_tests: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_tests: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    execution_time_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="accepted", nullable=False)
    # accepted, partial_fix, regression_detected, failed, runtime_error, timed_out

    test_results: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    # [{"test_index": 0, "description": "...", "passed": True, "is_public": True, "execution_time_ms": 1.2}]
    ai_review: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    # {"root_cause_explanation": "...", "suggestions": [...], "anti_pattern_flag": "..."}

    time_spent_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    attempt_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    challenge: Mapped["BugHunterChallenge"] = relationship("BugHunterChallenge", back_populates="submissions")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])


class BugHunterStreak(Base):
    """
    Gamification state tracking daily debugging streaks and aggregate counts.
    """
    __tablename__ = "bughunter_streaks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    current_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_activity_date: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    total_bugs_fixed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)


class BugHunterBadge(Base):
    """
    Badges awarded for verified achievements (e.g. Root Cause Detective, Regression Buster).
    """
    __tablename__ = "bughunter_badges"
    __table_args__ = (UniqueConstraint("user_id", "badge_key", name="uq_user_bughunter_badge"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    badge_key: Mapped[str] = mapped_column(String(60), nullable=False)
    badge_name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    icon: Mapped[str] = mapped_column(String(50), default="Award", nullable=False)

    earned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)
