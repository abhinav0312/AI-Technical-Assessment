from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel


class ActivityResponse(BaseModel):
    id: str
    user_id: str
    activity_type: str
    metadata: Dict[str, Any] = {}
    created_at: datetime

    class Config:
        from_attributes = True


class SkillScore(BaseModel):
    name: str
    score: int
    total_problems: int


class RecommendedAction(BaseModel):
    id: str
    title: str
    category: str
    difficulty: str
    reason: str
    url: str


class DashboardMetricsResponse(BaseModel):
    assessments_completed: int
    challenges_solved: int
    learning_streak_days: int
    current_score_average: float
    recent_activities: List[ActivityResponse]
    skills: List[SkillScore]
    recommended_actions: List[RecommendedAction]
    learning_goals: List[str]
