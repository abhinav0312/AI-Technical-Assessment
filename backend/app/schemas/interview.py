from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class InterviewTurnResponse(BaseModel):
    id: str
    session_id: str
    sender: str  # interviewer, candidate
    message: str
    turn_index: int
    created_at: datetime

    class Config:
        from_attributes = True


class InterviewSessionCreate(BaseModel):
    role_target: str = Field(default="Senior Backend Engineer")
    difficulty: str = Field(default="medium")
    topic: Optional[str] = Field(default="Distributed Systems & Data Structures")


class InterviewMessageRequest(BaseModel):
    message: str = Field(..., min_length=1)
    current_code: Optional[str] = None


class InterviewCodeRequest(BaseModel):
    code: str
    language: Optional[str] = "python"


class InterviewCompleteRequest(BaseModel):
    final_code: Optional[str] = None


class InterviewEvaluationScorecard(BaseModel):
    score: float
    recommendation: str  # Strong Hire, Hire, Lean Hire, No Hire
    problem_solving_score: int  # out of 25
    algorithmic_efficiency_score: int  # out of 25
    code_quality_score: int  # out of 25
    communication_score: int  # out of 25
    summary: str
    strengths: List[str]
    growth_areas: List[str]


class InterviewSessionResponse(BaseModel):
    id: str
    user_id: str
    title: str
    role_target: str
    difficulty: str
    status: str
    duration_seconds: int
    problem_description: str
    initial_code: str
    final_code: Optional[str] = None
    language: str
    score: Optional[float] = None
    recommendation: Optional[str] = None
    feedback: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    turns: List[InterviewTurnResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True

