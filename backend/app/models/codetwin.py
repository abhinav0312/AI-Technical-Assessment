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


class Skill(Base):
    """
    Extensible Skill Taxonomy covering core software engineering,
    algorithms, data structures, testing, and debugging.
    """
    __tablename__ = "skills"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    domain: Mapped[str] = mapped_column(String(60), nullable=False, index=True)
    # domains: programming_fundamentals, data_structures, algorithms,
    # complexity_analysis, debugging, testing, sql_and_databases, software_engineering_fundamentals
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(80), nullable=True, default=None)
    tier: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    hierarchy_path: Mapped[Optional[str]] = mapped_column(String(200), nullable=True, default=None)
    version: Mapped[str] = mapped_column(String(20), default="1.0.0", nullable=False)
    prerequisites: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)


class ChallengeSkillAssociation(Base):
    """
    Associates challenges (standard, bughunter, devsim) with taxonomy skills.
    """
    __tablename__ = "challenge_skill_associations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    challenge_id: Mapped[str] = mapped_column(String(36), index=True, nullable=False)
    challenge_type: Mapped[str] = mapped_column(String(30), default="standard", nullable=False)  # standard, bughunter, devsim
    skill_id: Mapped[str] = mapped_column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)

    skill: Mapped["Skill"] = relationship("Skill")


class UserSkillProficiency(Base):
    """
    User skill estimation distinguishing observed performance from estimated proficiency,
    and explicitly representing insufficient evidence.
    """
    __tablename__ = "user_skill_proficiencies"
    __table_args__ = (UniqueConstraint("user_id", "skill_id", name="uq_user_skill"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id: Mapped[str] = mapped_column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)

    observed_performance: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    estimated_proficiency: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    confidence_level: Mapped[str] = mapped_column(String(30), default="insufficient_evidence", nullable=False)  # high, medium, low, insufficient_evidence
    evidence_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="needs_evidence", nullable=False)  # proficient, developing, needs_evidence
    recent_trend: Mapped[str] = mapped_column(String(30), default="steady", nullable=False)  # improving, declining, steady, new, no_data

    last_assessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    skill: Mapped["Skill"] = relationship("Skill", lazy="joined")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])


class SkillEvidence(Base):
    """
    Verifiable, traceable evidence linking skill changes to actual submissions,
    rubric scores, or debugging evaluations.
    """
    __tablename__ = "skill_evidences"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id: Mapped[str] = mapped_column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)

    source_type: Mapped[str] = mapped_column(String(40), nullable=False)  # submission, thinktrace, bughunter, devsim
    source_id: Mapped[str] = mapped_column(String(60), nullable=False)
    challenge_title: Mapped[str] = mapped_column(String(200), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    details: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    skill: Mapped["Skill"] = relationship("Skill")


class ErrorPatternDetection(Base):
    """
    Recurring error patterns detected in candidate work with traceable citations.
    """
    __tablename__ = "error_pattern_detections"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    pattern_category: Mapped[str] = mapped_column(String(60), nullable=False, index=True)
    # Categories: off_by_one, boundary_conditions, recursion, inefficient_algorithm, poor_sql, edge_case_failure
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    frequency: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    supporting_evidence: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    # [{"source_id": "...", "title": "...", "timestamp": "...", "error_summary": "..."}]
    severity: Mapped[str] = mapped_column(String(30), default="moderate", nullable=False)  # critical, moderate, advisory
    remediation_advice: Mapped[str] = mapped_column(Text, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)


class PersonalizedRecommendation(Base):
    """
    Ranked, explainable activity recommendations tailored to user gaps, goals, and history.
    """
    __tablename__ = "personalized_recommendations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_type: Mapped[str] = mapped_column(String(40), nullable=False)  # challenge, bughunter, devsim, learning_module
    activity_id: Mapped[str] = mapped_column(String(60), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(20), nullable=False)
    domain: Mapped[str] = mapped_column(String(60), nullable=False)
    rank_score: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)  # Transparent explanation of why this was recommended
    status: Mapped[str] = mapped_column(String(30), default="pending", nullable=False)  # pending, accepted, dismissed, completed

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)


class LearningPlan(Base):
    """
    Weekly structured learning plan for targeted skill acquisition.
    """
    __tablename__ = "learning_plans"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    week_start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    target_skills: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    estimated_hours: Mapped[float] = mapped_column(Float, default=3.0, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="active", nullable=False)  # active, completed, archived

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    items: Mapped[List["LearningPlanItem"]] = relationship(
        "LearningPlanItem", back_populates="plan", cascade="all, delete-orphan", lazy="selectin"
    )


class LearningPlanItem(Base):
    """
    Individual activity in a candidate's weekly learning plan.
    """
    __tablename__ = "learning_plan_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    learning_plan_id: Mapped[str] = mapped_column(String(36), ForeignKey("learning_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    activity_type: Mapped[str] = mapped_column(String(40), nullable=False)  # challenge, bughunter, devsim, concept_review
    activity_id: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)
    target_skill: Mapped[str] = mapped_column(String(100), nullable=False)
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_rejected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    plan: Mapped["LearningPlan"] = relationship("LearningPlan", back_populates="items")


class SkillGraphVersion(Base):
    """
    Versioned metadata and configuration for the Technical SkillGraph taxonomy.
    """
    __tablename__ = "skill_graph_versions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    version: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    graph_metadata: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)

