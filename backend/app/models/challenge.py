from datetime import datetime
from typing import TYPE_CHECKING, List, Optional, Dict
from sqlalchemy import String, Text, DateTime, ForeignKey, Table, Column, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, generate_uuid, get_utc_now

if TYPE_CHECKING:
    from app.models.submission import Submission

challenge_tag_association = Table(
    "challenge_tag_association",
    Base.metadata,
    Column("challenge_id", String(36), ForeignKey("challenges.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", String(36), ForeignKey("challenge_tags.id", ondelete="CASCADE"), primary_key=True),
)


class ProgrammingLanguage(Base):
    __tablename__ = "programming_languages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    identifier: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    supported_status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)  # active, beta, planned


class ChallengeTag(Base):
    __tablename__ = "challenge_tags"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    slug: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)

    challenges: Mapped[List["Challenge"]] = relationship(
        "Challenge", secondary=challenge_tag_association, back_populates="tags"
    )


class Challenge(Base):
    __tablename__ = "challenges"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[str] = mapped_column(String(20), nullable=False)  # easy, medium, hard
    category: Mapped[str] = mapped_column(String(50), nullable=False)  # algorithms, data_structures, system_design, etc.
    constraints: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    starter_code: Mapped[Optional[Dict[str, str]]] = mapped_column(JSON, nullable=True)
    supported_languages: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    visibility: Mapped[str] = mapped_column(String(20), default="public", nullable=False)  # public, private, unlisted
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # Relationships
    tags: Mapped[List[ChallengeTag]] = relationship(
        "ChallengeTag", secondary=challenge_tag_association, back_populates="challenges", lazy="selectin"
    )
    submissions: Mapped[List["Submission"]] = relationship(
        "Submission", back_populates="challenge", cascade="all, delete-orphan", lazy="select"
    )
