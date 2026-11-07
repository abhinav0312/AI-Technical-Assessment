from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class SkillResponse(BaseModel):
    id: str
    domain: str
    name: str
    slug: str
    description: str
    prerequisites: List[str] = Field(default_factory=list)

    class Config:
        from_attributes = True


class UserSkillProficiencyResponse(BaseModel):
    id: str
    skill_id: str
    skill_name: str
    domain: str
    observed_performance: float
    estimated_proficiency: float
    confidence_level: str  # high, medium, low, insufficient_evidence
    evidence_count: int
    status: str  # proficient, developing, needs_evidence
    last_assessed_at: datetime

    class Config:
        from_attributes = True


class SkillEvidenceResponse(BaseModel):
    id: str
    skill_id: str
    skill_name: str
    source_type: str  # submission, thinktrace, bughunter, devsim
    source_id: str
    challenge_title: str
    score: float
    details: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

    class Config:
        from_attributes = True


class ErrorPatternResponse(BaseModel):
    id: str
    pattern_category: str
    title: str
    description: str
    frequency: int
    supporting_evidence: List[Dict[str, Any]] = Field(default_factory=list)
    severity: str
    remediation_advice: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RecommendationResponse(BaseModel):
    id: str
    activity_type: str
    activity_id: str
    title: str
    difficulty: str
    domain: str
    rank_score: float
    reason: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class LearningPlanItemUpdate(BaseModel):
    is_completed: Optional[bool] = None
    is_rejected: Optional[bool] = None


class LearningPlanItemResponse(BaseModel):
    id: str
    title: str
    activity_type: str
    activity_id: Optional[str] = None
    target_skill: str
    estimated_minutes: int
    is_completed: bool
    is_rejected: bool
    completed_at: Optional[datetime] = None
    order_index: int

    class Config:
        from_attributes = True


class LearningPlanResponse(BaseModel):
    id: str
    title: str
    week_start_date: datetime
    target_skills: List[str] = Field(default_factory=list)
    estimated_hours: float
    status: str
    items: List[LearningPlanItemResponse] = Field(default_factory=list)
    created_at: datetime

    class Config:
        from_attributes = True


class CodeTwinDashboardResponse(BaseModel):
    is_onboarding: bool
    total_evidence_count: int
    strongest_skills: List[UserSkillProficiencyResponse] = Field(default_factory=list)
    skills_needing_evidence: List[UserSkillProficiencyResponse] = Field(default_factory=list)
    all_proficiencies: List[UserSkillProficiencyResponse] = Field(default_factory=list)
    recurring_error_patterns: List[ErrorPatternResponse] = Field(default_factory=list)
    recommended_activities: List[RecommendationResponse] = Field(default_factory=list)
    active_learning_plan: Optional[LearningPlanResponse] = None
    historical_improvement: List[Dict[str, Any]] = Field(default_factory=list)
