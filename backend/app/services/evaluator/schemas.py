from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum


class EvaluationStatus(str, Enum):
    PENDING = "pending"
    QUEUED = "queued"
    EVALUATING = "evaluating"
    ACCEPTED = "accepted"
    WRONG_ANSWER = "wrong_answer"
    TIME_LIMIT_EXCEEDED = "time_limit_exceeded"
    MEMORY_LIMIT_EXCEEDED = "memory_limit_exceeded"
    RUNTIME_ERROR = "runtime_error"
    COMPILATION_ERROR = "compilation_error"


class SingleTestResult(BaseModel):
    test_case_id: Optional[str] = None
    is_sample: bool = False
    status: str  # passed, failed, timed_out, runtime_error, compilation_error
    stdin: Optional[str] = None  # None for hidden tests
    expected_output: Optional[str] = None  # None for hidden tests
    actual_output: Optional[str] = None  # None for hidden tests
    error_message: Optional[str] = None
    execution_time_ms: Optional[float] = None
    memory_usage_kb: Optional[float] = None
    order_index: int = 0


class EvaluationSummary(BaseModel):
    status: EvaluationStatus
    score: float = 0.0
    total_tests: int = 0
    passed_tests: int = 0
    total_execution_time_ms: float = 0.0
    max_memory_kb: float = 0.0
    error_message: Optional[str] = None
    test_results: List[SingleTestResult] = Field(default_factory=list)
