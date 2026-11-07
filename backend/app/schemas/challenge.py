from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.test_case import SampleTestCaseResponse


class ChallengeTagResponse(BaseModel):
    id: str
    name: str
    slug: str

    class Config:
        from_attributes = True


class ChallengeBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    slug: Optional[str] = None
    description: str = Field(..., min_length=10)
    difficulty: str = Field(..., pattern="^(easy|medium|hard)$")
    category: str = Field(..., min_length=2, max_length=50)
    constraints: Optional[str] = None
    starter_code: Optional[Dict[str, str]] = None
    supported_languages: List[str] = Field(default_factory=lambda: ["python", "typescript"])
    visibility: str = Field(default="public", pattern="^(public|private|unlisted)$")
    reasoning_config: Optional[Dict[str, Any]] = None


class ChallengeCreate(ChallengeBase):
    tags: Optional[List[str]] = Field(default_factory=list)


class ChallengeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    difficulty: Optional[str] = Field(None, pattern="^(easy|medium|hard)$")
    category: Optional[str] = Field(None, min_length=2, max_length=50)
    constraints: Optional[str] = None
    starter_code: Optional[Dict[str, str]] = None
    supported_languages: Optional[List[str]] = None
    visibility: Optional[str] = Field(None, pattern="^(public|private|unlisted)$")
    reasoning_config: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None


class CodeDraftRequest(BaseModel):
    language: str = Field(..., pattern="^(python|typescript|javascript)$")
    code: str


class CodeDraftResponse(BaseModel):
    language: str
    code: str
    updated_at: datetime

    class Config:
        from_attributes = True


class BookmarkToggleResponse(BaseModel):
    challenge_id: str
    is_bookmarked: bool


class ChallengeResponse(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    difficulty: str
    category: str
    constraints: Optional[str] = None
    starter_code: Optional[Dict[str, str]] = None
    supported_languages: List[str]
    visibility: str
    reasoning_config: Optional[Dict[str, Any]] = None
    tags: List[ChallengeTagResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    # Arena enhancements
    acceptance_rate: Optional[float] = None
    total_submissions: Optional[int] = None
    user_status: Optional[str] = None  # completed, attempted, unsolved
    is_bookmarked: bool = False
    sample_test_cases: List[SampleTestCaseResponse] = Field(default_factory=list)
    user_draft: Optional[str] = None
    prev_challenge_slug: Optional[str] = None
    next_challenge_slug: Optional[str] = None

    class Config:
        from_attributes = True


class PaginatedChallengesResponse(BaseModel):
    items: List[ChallengeResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
