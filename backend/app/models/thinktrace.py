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
    from app.models.challenge import Challenge
    from app.models.submission import Submission
    from app.models.assessment import AssessmentAttempt


class ReasoningRecord(Base):
    """
    Captures candidate's stated problem interpretation, algorithm design,
    complexity analysis, edge cases, and trade-off rationale.
    """
    __tablename__ = "reasoning_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    challenge_id: Mapped[str] = mapped_column(String(36), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_attempt_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("assessment_attempts.id", ondelete="SET NULL"), nullable=True)
    submission_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("submissions.id", ondelete="SET NULL"), nullable=True, index=True)

    # Core Reasoning Artifacts
    problem_interpretation: Mapped[str] = mapped_column(Text, nullable=False, default="")
    proposed_algorithm: Mapped[str] = mapped_column(Text, nullable=False, default="")
    time_complexity: Mapped[str] = mapped_column(String(100), nullable=False, default="O(N)")
    space_complexity: Mapped[str] = mapped_column(String(100), nullable=False, default="O(1)")
    edge_cases: Mapped[str] = mapped_column(Text, nullable=False, default="")
    tradeoff_reasoning: Mapped[str] = mapped_column(Text, nullable=False, default="")

    # Versioning & Status
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    mode: Mapped[str] = mapped_column(String(30), default="practice", nullable=False)  # practice, assessment
    is_locked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
    challenge: Mapped["Challenge"] = relationship("Challenge", foreign_keys=[challenge_id])
    submission: Mapped[Optional["Submission"]] = relationship("Submission", foreign_keys=[submission_id])
    versions: Mapped[List["ReasoningRecordVersion"]] = relationship(
        "ReasoningRecordVersion",
        back_populates="record",
        cascade="all, delete-orphan",
        order_by="ReasoningRecordVersion.version_number",
        lazy="selectin",
    )
    reports: Mapped[List["ThinkTraceReport"]] = relationship(
        "ThinkTraceReport",
        back_populates="reasoning_record",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class ReasoningRecordVersion(Base):
    """
    Preserves snapshot history when a candidate revises or updates their reasoning.
    """
    __tablename__ = "reasoning_record_versions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    record_id: Mapped[str] = mapped_column(String(36), ForeignKey("reasoning_records.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)

    problem_interpretation: Mapped[str] = mapped_column(Text, nullable=False)
    proposed_algorithm: Mapped[str] = mapped_column(Text, nullable=False)
    time_complexity: Mapped[str] = mapped_column(String(100), nullable=False)
    space_complexity: Mapped[str] = mapped_column(String(100), nullable=False)
    edge_cases: Mapped[str] = mapped_column(Text, nullable=False)
    tradeoff_reasoning: Mapped[str] = mapped_column(Text, nullable=False)
    change_summary: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    record: Mapped["ReasoningRecord"] = relationship("ReasoningRecord", back_populates="versions")


class ThinkTraceReport(Base):
    """
    Combined assessment report keeping deterministic code execution results
    strictly separate from AI-assisted rubric evaluation.
    """
    __tablename__ = "thinktrace_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    reasoning_record_id: Mapped[str] = mapped_column(String(36), ForeignKey("reasoning_records.id", ondelete="CASCADE"), nullable=False, index=True)
    submission_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("submissions.id", ondelete="SET NULL"), nullable=True, index=True)
    challenge_id: Mapped[str] = mapped_column(String(36), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    status: Mapped[str] = mapped_column(String(30), default="completed", nullable=False)

    # 1. Deterministic Code Correctness (Preserved directly from execution sandbox)
    code_status: Mapped[str] = mapped_column(String(30), default="untested", nullable=False)
    code_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    passed_tests: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_tests: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    execution_time_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # 2. Reasoning Rubric Scores (0.0 to 100.0)
    problem_understanding_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    algorithm_correctness_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    edge_case_awareness_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    complexity_analysis_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    code_consistency_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    tradeoff_explanation_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    overall_reasoning_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # 3. Qualitative Insights & Observable Evidence
    supporting_evidence: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    missing_or_incorrect_steps: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    strengths: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    areas_for_growth: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    alternative_approaches: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    socratic_guiding_questions: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    recommended_concept_links: Mapped[List[Dict[str, str]]] = mapped_column(JSON, default=list, nullable=False)

    # 4. Evaluation Reliability & Transparency Metadata
    rubric_version: Mapped[str] = mapped_column(String(30), default="thinktrace-rubric-v1.0", nullable=False)
    prompt_version: Mapped[str] = mapped_column(String(30), default="thinktrace-eval-v1", nullable=False)
    ai_provider: Mapped[str] = mapped_column(String(50), nullable=False)
    ai_model: Mapped[str] = mapped_column(String(50), nullable=False)
    is_fallback: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.85, nullable=False)
    confidence_level: Mapped[str] = mapped_column(String(20), default="high", nullable=False)  # high, medium, low
    token_usage: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    # 5. Human Review & Correction
    human_reviewed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    human_reviewer_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    human_score_override: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    human_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    human_reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # Relationships
    reasoning_record: Mapped["ReasoningRecord"] = relationship("ReasoningRecord", back_populates="reports")
    challenge: Mapped["Challenge"] = relationship("Challenge")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
    submission: Mapped[Optional["Submission"]] = relationship("Submission", foreign_keys=[submission_id])
