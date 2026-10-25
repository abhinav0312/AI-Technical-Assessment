from typing import TYPE_CHECKING, Optional, List
from sqlalchemy import String, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, generate_uuid

if TYPE_CHECKING:
    from app.models.user import User


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    biography: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    preferred_programming_languages: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    experience_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # junior, mid, senior, staff
    learning_goals: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC", nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="profile")
