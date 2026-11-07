from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class RunSampleRequest(BaseModel):
    language: str = Field(..., pattern="^(python|typescript|javascript)$")
    source_code: str = Field(..., min_length=1)


class SubmissionCreate(BaseModel):
    language: str = Field(..., pattern="^(python|typescript|javascript)$")
    source_code: str = Field(..., min_length=1)


class SubmissionTestCaseResultResponse(BaseModel):
    id: str
    test_case_id: Optional[str] = None
    is_sample: bool
    status: str
    stdin: Optional[str] = None
    expected_output: Optional[str] = None
    actual_output: Optional[str] = None
    error_message: Optional[str] = None
    execution_time_ms: Optional[float] = None
    order_index: int = 0

    class Config:
        from_attributes = True


class SubmissionResponse(BaseModel):
    id: str
    challenge_id: str
    challenge_title: Optional[str] = None
    challenge_slug: Optional[str] = None
    user_id: str
    user_display_name: Optional[str] = None
    language: str
    source_code: str
    status: str
    score: Optional[float] = None
    execution_time_ms: Optional[float] = None
    memory_usage_kb: Optional[float] = None
    error_message: Optional[str] = None
    total_tests: int = 0
    passed_tests: int = 0
    is_sample_run: bool = False
    created_at: datetime
    evaluated_at: Optional[datetime] = None
    test_results: List[SubmissionTestCaseResultResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


class PaginatedSubmissionsResponse(BaseModel):
    items: List[SubmissionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
