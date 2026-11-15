from datetime import datetime, timezone
import uuid
from typing import Optional, List
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Float,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship
from app.db.base import Base


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    role_target = Column(String(100), default="Senior Backend Engineer")
    difficulty = Column(String(20), default="medium")
    status = Column(String(30), default="in_progress")  # in_progress, completed, abandoned
    duration_seconds = Column(Integer, default=0)
    problem_description = Column(Text, nullable=False)
    initial_code = Column(Text, default="")
    final_code = Column(Text, nullable=True)
    language = Column(String(30), default="python")
    score = Column(Float, nullable=True)
    recommendation = Column(String(50), nullable=True)  # strong_hire, hire, lean_hire, no_hire
    feedback = Column(Text, nullable=True)  # JSON formatted feedback report
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", backref="interview_sessions")
    turns = relationship("InterviewTurn", back_populates="session", cascade="all, delete-orphan", order_by="InterviewTurn.turn_index")


class InterviewTurn(Base):
    __tablename__ = "interview_turns"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    sender = Column(String(20), nullable=False)  # interviewer, candidate
    message = Column(Text, nullable=False)
    turn_index = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    session = relationship("InterviewSession", back_populates="turns")

    __table_args__ = (
        Index("ix_interview_turns_session_index", "session_id", "turn_index"),
    )

