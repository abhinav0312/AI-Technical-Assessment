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


class DevSimScenario(Base):
    """
    Realistic software engineering scenario with multi-file project snapshot,
    acceptance criteria, isolated execution parameters, and evaluation rubrics.
    """
    __tablename__ = "devsim_scenarios"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True, nullable=False)
    scenario_type: Mapped[str] = mapped_column(String(60), nullable=False, index=True)
    # Types: backend_endpoint_fix, rest_api_implementation, sql_optimization,
    # error_log_diagnosis, regression_fix, form_validation, performance_tuning
    business_context: Mapped[str] = mapped_column(Text, nullable=False)  # Real-world background & user story
    task_description: Mapped[str] = mapped_column(Text, nullable=False)  # Specific developer tasks
    acceptance_criteria: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    difficulty: Mapped[str] = mapped_column(String(20), nullable=False)  # easy, medium, hard
    relevant_skills: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)

    starter_files: Mapped[Dict[str, str]] = mapped_column(JSON, default=dict, nullable=False)
    # {"app/main.py": "...", "app/service.py": "...", "tests/test_api.py": "..."}
    read_only_files: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    # Files candidate cannot modify (e.g. test harness framework)

    public_tests: Mapped[Dict[str, str]] = mapped_column(JSON, default=dict, nullable=False)
    hidden_tests: Mapped[Dict[str, str]] = mapped_column(JSON, default=dict, nullable=False)

    entrypoint_command: Mapped[str] = mapped_column(String(200), default="python -m unittest discover", nullable=False)
    timeout_seconds: Mapped[float] = mapped_column(Float, default=6.0, nullable=False)
    resource_limits: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    evaluation_rubric: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_by_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    attempts: Mapped[List["DevSimAttempt"]] = relationship(
        "DevSimAttempt", back_populates="scenario", cascade="all, delete-orphan", lazy="select"
    )


class DevSimAttempt(Base):
    """
    Candidate's multi-file workspace state and attempt history for a scenario.
    """
    __tablename__ = "devsim_attempts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    scenario_id: Mapped[str] = mapped_column(String(36), ForeignKey("devsim_scenarios.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    workspace_files: Mapped[Dict[str, str]] = mapped_column(JSON, default=dict, nullable=False)
    # Current snapshot of files edited by candidate
    status: Mapped[str] = mapped_column(String(30), default="in_progress", nullable=False)  # in_progress, evaluated, submitted
    run_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    scenario: Mapped["DevSimScenario"] = relationship("DevSimScenario", back_populates="attempts")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
    reports: Mapped[List["DevSimReport"]] = relationship(
        "DevSimReport", back_populates="attempt", cascade="all, delete-orphan", lazy="selectin"
    )


class DevSimReport(Base):
    """
    Structured DevSim evaluation report: deterministic test results kept separate
    from advisory AI Engineering Review.
    """
    __tablename__ = "devsim_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    attempt_id: Mapped[str] = mapped_column(String(36), ForeignKey("devsim_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    scenario_id: Mapped[str] = mapped_column(String(36), ForeignKey("devsim_scenarios.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # 1. Deterministic Acceptance Tests
    functional_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    acceptance_tests_passed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_acceptance_tests: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    regression_safety_passed: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    execution_time_ms: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    test_output: Mapped[str] = mapped_column(Text, default="", nullable=False)

    # 2. Rubric Breakdown
    rubric_scores: Mapped[Dict[str, float]] = mapped_column(JSON, default=dict, nullable=False)
    # {"acceptance_tests": 85.0, "error_handling": 90.0, "modularity": 80.0}
    successful_requirements: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    major_issues: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)

    # 3. Advisory AI Engineering Review
    ai_review: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    # {"maintainability_observations": [...], "tradeoffs_explained": [...], "fragile_code_flags": [...], "improvement_suggestions": [...]}

    # 4. Human Evaluator Review
    evaluator_reviewed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    evaluator_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    evaluator_score_override: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    attempt: Mapped["DevSimAttempt"] = relationship("DevSimAttempt", back_populates="reports")
    scenario: Mapped["DevSimScenario"] = relationship("DevSimScenario")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
