from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class ThinkTraceEvalInput(BaseModel):
    challenge_title: str
    challenge_description: str
    constraints: Optional[str] = None
    problem_interpretation: str
    proposed_algorithm: str
    time_complexity: str
    space_complexity: str
    edge_cases: str
    tradeoff_reasoning: str
    submitted_code: Optional[str] = None
    code_execution_status: Optional[str] = None  # accepted, wrong_answer, etc.
    passed_tests: Optional[int] = 0
    total_tests: Optional[int] = 0


class RubricDimensionScore(BaseModel):
    dimension: str
    score: float = Field(..., ge=0.0, le=100.0)
    scale_1_to_5: float = Field(..., ge=1.0, le=5.0)
    evidence: str
    feedback: str


class ConceptLink(BaseModel):
    title: str
    category: str
    description: str


class ThinkTraceAIOutput(BaseModel):
    problem_understanding: RubricDimensionScore
    algorithm_correctness: RubricDimensionScore
    edge_case_awareness: RubricDimensionScore
    complexity_analysis: RubricDimensionScore
    code_consistency: RubricDimensionScore
    tradeoff_explanation: RubricDimensionScore
    overall_reasoning_score: float = Field(..., ge=0.0, le=100.0)

    missing_or_incorrect_steps: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    areas_for_growth: List[str] = Field(default_factory=list)
    alternative_approaches: List[str] = Field(default_factory=list)
    socratic_guiding_questions: List[str] = Field(default_factory=list)
    recommended_concepts: List[ConceptLink] = Field(default_factory=list)
    confidence_score: float = Field(default=0.90, ge=0.0, le=1.0)
    confidence_level: str = "high"


class ThinkTraceServiceResult(BaseModel):
    evaluation: ThinkTraceAIOutput
    provider: str
    model: str
    is_fallback: bool
    token_usage: Dict[str, Any] = Field(default_factory=dict)
