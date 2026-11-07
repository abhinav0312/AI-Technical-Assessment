from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ReasoningRecordCreateOrUpdate(BaseModel):
    problem_interpretation: str = Field(default="", description="Candidate's statement of problem understanding")
    proposed_algorithm: str = Field(default="", description="Algorithmic approach and step-by-step logic")
    time_complexity: str = Field(default="O(N)", description="Stated time complexity in Big-O notation")
    space_complexity: str = Field(default="O(1)", description="Stated space complexity in Big-O notation")
    edge_cases: str = Field(default="", description="Identified boundary conditions and edge cases")
    tradeoff_reasoning: str = Field(default="", description="Rationale for choosing this approach over alternatives")
    mode: str = Field(default="practice", pattern="^(practice|assessment)$")
    change_summary: Optional[str] = None


class ReasoningVersionResponse(BaseModel):
    id: str
    version_number: int
    problem_interpretation: str
    proposed_algorithm: str
    time_complexity: str
    space_complexity: str
    edge_cases: str
    tradeoff_reasoning: str
    change_summary: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReasoningRecordResponse(BaseModel):
    id: str
    user_id: str
    challenge_id: str
    submission_id: Optional[str] = None
    problem_interpretation: str
    proposed_algorithm: str
    time_complexity: str
    space_complexity: str
    edge_cases: str
    tradeoff_reasoning: str
    version: int
    mode: str
    is_locked: bool
    created_at: datetime
    updated_at: datetime
    versions: List[ReasoningVersionResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


class EvaluateReasoningRequest(BaseModel):
    reasoning: Optional[ReasoningRecordCreateOrUpdate] = None
    submission_id: Optional[str] = None
    source_code: Optional[str] = None
    language: Optional[str] = Field(default="python", pattern="^(python|typescript|javascript)$")


class HumanReviewRequest(BaseModel):
    human_score_override: Optional[float] = Field(None, ge=0.0, le=100.0)
    human_notes: str = Field(..., min_length=2)


class ThinkTraceReportResponse(BaseModel):
    id: str
    reasoning_record_id: str
    submission_id: Optional[str] = None
    challenge_id: str
    challenge_title: Optional[str] = None
    challenge_slug: Optional[str] = None
    user_id: str
    user_display_name: Optional[str] = None
    status: str

    # Deterministic Code Correctness
    code_status: str
    code_score: float
    passed_tests: int
    total_tests: int
    execution_time_ms: Optional[float] = None

    # Reasoning Rubric Scores
    problem_understanding_score: float
    algorithm_correctness_score: float
    edge_case_awareness_score: float
    complexity_analysis_score: float
    code_consistency_score: float
    tradeoff_explanation_score: float
    overall_reasoning_score: float

    # Qualitative Feedback
    supporting_evidence: Dict[str, Any] = Field(default_factory=dict)
    missing_or_incorrect_steps: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    areas_for_growth: List[str] = Field(default_factory=list)
    alternative_approaches: List[str] = Field(default_factory=list)
    socratic_guiding_questions: List[str] = Field(default_factory=list)
    recommended_concept_links: List[Dict[str, str]] = Field(default_factory=list)

    # Reliability & Audit Trail
    rubric_version: str
    prompt_version: str
    ai_provider: str
    ai_model: str
    is_fallback: bool
    confidence_score: float
    confidence_level: str
    token_usage: Dict[str, Any] = Field(default_factory=dict)

    # Human Review
    human_reviewed: bool
    human_reviewer_name: Optional[str] = None
    human_score_override: Optional[float] = None
    human_notes: Optional[str] = None
    human_reviewed_at: Optional[datetime] = None

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedReportsResponse(BaseModel):
    items: List[ThinkTraceReportResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
