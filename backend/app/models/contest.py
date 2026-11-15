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
    Table,
)
from sqlalchemy.orm import relationship
from app.db.base import Base

contest_challenge_association = Table(
    "contest_challenge_association",
    Base.metadata,
    Column("contest_id", String(36), ForeignKey("contests.id", ondelete="CASCADE"), primary_key=True),
    Column("challenge_id", String(36), ForeignKey("challenges.id", ondelete="CASCADE"), primary_key=True),
    Column("points", Integer, default=100),
    Column("order_index", Integer, default=1),
)


class Contest(Base):
    __tablename__ = "contests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(String(30), default="upcoming")  # upcoming, active, finished
    creator_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    challenges = relationship("Challenge", secondary=contest_challenge_association, backref="contests")
    participants = relationship("ContestParticipant", back_populates="contest", cascade="all, delete-orphan")


class ContestParticipant(Base):
    __tablename__ = "contest_participants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    contest_id = Column(String(36), ForeignKey("contests.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Integer, default=0)
    penalty_seconds = Column(Integer, default=0)
    rank = Column(Integer, nullable=True)
    registered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    contest = relationship("Contest", back_populates="participants")
    user = relationship("User", backref="contest_participations")

    __table_args__ = (
        Index("ix_contest_participants_score_rank", "contest_id", "score", "penalty_seconds"),
    )

