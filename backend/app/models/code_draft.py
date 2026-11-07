from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, generate_uuid, get_utc_now

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.challenge import Challenge


class CodeDraft(Base):
    __tablename__ = "code_drafts"
    __table_args__ = (
        UniqueConstraint("user_id", "challenge_id", "language", name="uq_user_challenge_draft"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    challenge_id: Mapped[str] = mapped_column(String(36), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False, index=True)
    language: Mapped[str] = mapped_column(String(30), nullable=False)
    code: Mapped[str] = mapped_column(Text, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="code_drafts")
    challenge: Mapped["Challenge"] = relationship("Challenge", back_populates="code_drafts")
