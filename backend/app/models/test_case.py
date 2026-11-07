from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Text, DateTime, ForeignKey, Boolean, Float, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, generate_uuid, get_utc_now

if TYPE_CHECKING:
    from app.models.challenge import Challenge


class TestCase(Base):
    __test__ = False
    __tablename__ = "test_cases"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    challenge_id: Mapped[str] = mapped_column(String(36), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False, index=True)
    stdin: Mapped[str] = mapped_column(Text, default="", nullable=False)
    expected_output: Mapped[str] = mapped_column(Text, nullable=False)
    is_sample: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    # Relationships
    challenge: Mapped["Challenge"] = relationship("Challenge", back_populates="test_cases")
