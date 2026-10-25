from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field


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
    tags: Optional[List[str]] = None


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
    tags: List[ChallengeTagResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedChallengesResponse(BaseModel):
    items: List[ChallengeResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
