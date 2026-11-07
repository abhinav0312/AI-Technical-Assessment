from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, generate_uuid, get_utc_now

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.challenge import Challenge


class ChallengeBookmark(Base):
    __tablename__ = "challenge_bookmarks"
    __table_args__ = (
        UniqueConstraint("user_id", "challenge_id", name="uq_user_challenge_bookmark"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    challenge_id: Mapped[str] = mapped_column(String(36), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="bookmarks")
    challenge: Mapped["Challenge"] = relationship("Challenge", back_populates="bookmarks")
