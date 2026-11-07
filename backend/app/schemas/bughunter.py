from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class BugHunterChallengeSummaryResponse(BaseModel):
    id: str
    title: str
    slug: str
    bug_category: str
    difficulty: str
    language: str
    is_daily: bool
    daily_date: Optional[str] = None
    relevant_skills: List[str] = Field(default_factory=list)
    created_at: datetime

    class Config:
        from_attributes = True


class BugHunterChallengeResponse(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    bug_report: str
    bug_category: str
    difficulty: str
    language: str
    starter_code: str
    expected_behavior: str
    root_cause_options: List[Dict[str, Any]] = Field(default_factory=list)
    hints: List[Dict[str, Any]] = Field(default_factory=list)
    public_test_cases: List[Dict[str, Any]] = Field(default_factory=list)
    relevant_skills: List[str] = Field(default_factory=list)
    is_daily: bool
    daily_date: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class BugHunterRunRequest(BaseModel):
    code: str
    language: str = "python"


class BugHunterRunResponse(BaseModel):
    passed_tests: int
    total_tests: int
    execution_time_ms: float
    all_passed: bool
    test_results: List[Dict[str, Any]] = Field(default_factory=list)


class BugHunterSubmitRequest(BaseModel):
    code: str
    language: str = "python"
    identified_root_cause: Optional[str] = None
    time_spent_seconds: int = 0


class BugHunterSubmissionResponse(BaseModel):
    id: str
    challenge_id: str
    challenge_title: str
    challenge_slug: str
    status: str
    score: float
    is_bug_fixed: bool
    regressions_passed: bool
    edge_cases_passed: bool
    passed_tests: int
    total_tests: int
    execution_time_ms: Optional[float] = None
    root_cause_correct: Optional[bool] = None
    test_results: List[Dict[str, Any]] = Field(default_factory=list)
    ai_review: Dict[str, Any] = Field(default_factory=dict)
    streak_updated: Optional[Dict[str, Any]] = None
    new_badges_earned: List[str] = Field(default_factory=list)
    created_at: datetime


class BugHunterStreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    last_activity_date: Optional[str] = None
    total_bugs_fixed: int
    points: int
    badges: List[Dict[str, Any]] = Field(default_factory=list)


class BugHunterChallengeCreate(BaseModel):
    title: str = Field(..., min_length=3)
    slug: str = Field(..., min_length=3)
    description: str = Field(..., min_length=10)
    bug_report: str = Field(..., min_length=10)
    bug_category: str
    difficulty: str = "medium"
    starter_code: str = Field(..., min_length=10)
    expected_behavior: str = Field(..., min_length=5)
    language: str = "python"
    root_cause_options: List[Dict[str, Any]] = Field(default_factory=list)
    hints: List[Dict[str, Any]] = Field(default_factory=list)
    evaluation_rubric: Dict[str, Any] = Field(default_factory=dict)
    public_test_cases: List[Dict[str, Any]] = Field(default_factory=list)
    hidden_test_cases: List[Dict[str, Any]] = Field(default_factory=list)
    relevant_skills: List[str] = Field(default_factory=list)
    is_daily: bool = False
    daily_date: Optional[str] = None
