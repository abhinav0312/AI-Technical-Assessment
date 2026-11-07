from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class DevSimScenarioSummaryResponse(BaseModel):
    id: str
    title: str
    slug: str
    scenario_type: str
    difficulty: str
    relevant_skills: List[str] = Field(default_factory=list)
    version: int
    created_at: datetime

    class Config:
        from_attributes = True


class DevSimScenarioResponse(BaseModel):
    id: str
    title: str
    slug: str
    scenario_type: str
    business_context: str
    task_description: str
    acceptance_criteria: List[str] = Field(default_factory=list)
    difficulty: str
    relevant_skills: List[str] = Field(default_factory=list)
    starter_files: Dict[str, str] = Field(default_factory=dict)
    read_only_files: List[str] = Field(default_factory=list)
    entrypoint_command: str
    timeout_seconds: float
    version: int
    created_at: datetime

    class Config:
        from_attributes = True


class DevSimRunRequest(BaseModel):
    workspace_files: Dict[str, str] = Field(..., description="Map of relative file paths to content")


class DevSimRunResponse(BaseModel):
    stdout: str
    stderr: str
    exit_code: int
    execution_time_ms: float
    is_timed_out: bool
    passed: bool


class DevSimSubmitRequest(BaseModel):
    workspace_files: Dict[str, str] = Field(..., description="Final project file contents")


class DevSimReportResponse(BaseModel):
    id: str
    attempt_id: str
    scenario_id: str
    scenario_title: str
    scenario_slug: str
    functional_score: float
    acceptance_tests_passed: int
    total_acceptance_tests: int
    regression_safety_passed: bool
    execution_time_ms: float
    test_output: str
    rubric_scores: Dict[str, float] = Field(default_factory=dict)
    successful_requirements: List[str] = Field(default_factory=list)
    major_issues: List[str] = Field(default_factory=list)
    ai_review: Dict[str, Any] = Field(default_factory=dict)
    evaluator_reviewed: bool
    evaluator_notes: Optional[str] = None
    evaluator_score_override: Optional[float] = None
    created_at: datetime


class DevSimEvaluatorReviewRequest(BaseModel):
    evaluator_notes: str = Field(..., min_length=2)
    evaluator_score_override: Optional[float] = Field(None, ge=0.0, le=100.0)


class DevSimScenarioCreate(BaseModel):
    title: str = Field(..., min_length=3)
    slug: str = Field(..., min_length=3)
    scenario_type: str
    business_context: str = Field(..., min_length=10)
    task_description: str = Field(..., min_length=10)
    acceptance_criteria: List[str] = Field(default_factory=list)
    difficulty: str = "medium"
    relevant_skills: List[str] = Field(default_factory=list)
    starter_files: Dict[str, str] = Field(default_factory=dict)
    read_only_files: List[str] = Field(default_factory=list)
    public_tests: Dict[str, str] = Field(default_factory=dict)
    hidden_tests: Dict[str, str] = Field(default_factory=dict)
    entrypoint_command: str = "python -m unittest discover"
    timeout_seconds: float = 6.0
    resource_limits: Dict[str, Any] = Field(default_factory=dict)
    evaluation_rubric: Dict[str, Any] = Field(default_factory=dict)
