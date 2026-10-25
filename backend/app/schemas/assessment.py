from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class AssessmentBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=5)
    assessment_type: str = Field(default="skill_benchmark")
    duration_seconds: int = Field(default=3600, ge=300, le=86400)
    status: str = Field(default="published", pattern="^(draft|published|archived)$")
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class AssessmentCreate(AssessmentBase):
    pass


class AssessmentResponse(AssessmentBase):
    id: str
    creator_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class AssessmentAttemptResponse(BaseModel):
    id: str
    assessment_id: str
    candidate_id: str
    started_at: datetime
    submitted_at: Optional[datetime] = None
    status: str
    score: Optional[float] = None
    maximum_score: float

    class Config:
        from_attributes = True
