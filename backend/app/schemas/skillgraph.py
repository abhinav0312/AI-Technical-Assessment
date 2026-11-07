from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class SkillGraphNode(BaseModel):
    id: str
    slug: str
    name: str
    domain: str
    category: Optional[str] = None
    tier: int = 1
    hierarchy_path: Optional[str] = None
    description: str
    prerequisites: List[str] = Field(default_factory=list)
    proficiency: Optional[float] = None  # 0.0 - 1.0 rounded to 2 decimals, or None if unassessed
    observed_performance: Optional[float] = None
    evidence_count: int = 0
    confidence_level: str = "insufficient_evidence"  # high, medium, low, insufficient_evidence
    mastery_level: str = "unassessed"  # mastered, proficient, developing, unassessed
    recent_trend: str = "no_data"  # improving, declining, steady, new, no_data
    last_assessed_at: Optional[str] = None
    is_unlocked: bool = True
    position_x: float = 0.0
    position_y: float = 0.0


class SkillGraphEdge(BaseModel):
    id: str
    source: str  # Prerequisite slug
    target: str  # Dependent skill slug
    status: str  # satisfied, in_progress, unmet


class SkillGraphSummary(BaseModel):
    total_skills: int = 0
    mastered_count: int = 0
    proficient_count: int = 0
    developing_count: int = 0
    unassessed_count: int = 0
    overall_proficiency: float = 0.0


class SkillGraphDomain(BaseModel):
    key: str
    label: str
    count: int = 0


class SkillGraphResponse(BaseModel):
    version: str = "1.0.0"
    nodes: List[SkillGraphNode] = Field(default_factory=list)
    edges: List[SkillGraphEdge] = Field(default_factory=list)
    domains: List[SkillGraphDomain] = Field(default_factory=list)
    categories: List[str] = Field(default_factory=list)
    summary: SkillGraphSummary = Field(default_factory=SkillGraphSummary)


class SupportingEvidenceItem(BaseModel):
    source_id: str
    source_type: str  # submission, thinktrace, bughunter, devsim
    challenge_title: str
    score: float
    timestamp: str
    details: Dict[str, Any] = Field(default_factory=dict)


class RelatedChallengeItem(BaseModel):
    id: str
    slug: str
    title: str
    challenge_type: str  # standard, bughunter, devsim
    difficulty: str


class PrerequisiteDetailItem(BaseModel):
    slug: str
    name: str
    domain: str
    proficiency: Optional[float] = None
    status: str = "unassessed"
    is_satisfied: bool = False


class SkillDetailResponse(BaseModel):
    node: SkillGraphNode
    supporting_evidence: List[SupportingEvidenceItem] = Field(default_factory=list)
    related_challenges: List[RelatedChallengeItem] = Field(default_factory=list)
    prerequisites: List[PrerequisiteDetailItem] = Field(default_factory=list)
    dependents: List[PrerequisiteDetailItem] = Field(default_factory=list)
    recent_mistakes: List[Dict[str, Any]] = Field(default_factory=list)
    progress_history: List[Dict[str, Any]] = Field(default_factory=list)
    recommended_activity: Optional[Dict[str, Any]] = None


class SkillGraphVersionResponse(BaseModel):
    id: str
    version: str
    title: str
    description: str
    is_active: bool
    graph_metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: str
