from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class ContestChallengeItem(BaseModel):
    id: str
    title: str
    slug: str
    difficulty: str
    points: int = 100
    order_index: int = 1


class ContestLeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    display_name: str
    score: int
    penalty_seconds: int


class ContestResponse(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    start_time: datetime
    end_time: datetime
    status: str
    participant_count: int = 0
    challenges: List[ContestChallengeItem] = Field(default_factory=list)
    is_registered: bool = False

    class Config:
        from_attributes = True


class ContestLeaderboardResponse(BaseModel):
    contest_id: str
    contest_title: str
    entries: List[ContestLeaderboardEntry] = Field(default_factory=list)

