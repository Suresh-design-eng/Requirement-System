from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import TimestampMixin, generate_uuid


class Interview(Base, TimestampMixin):
    __tablename__ = "interviews"
    __table_args__ = (
        CheckConstraint(
            "interview_type in ('phone', 'video', 'onsite', 'technical', 'panel')",
            name="ck_interviews_type",
        ),
        CheckConstraint(
            "status in ('scheduled', 'completed', 'cancelled', 'rescheduled')",
            name="ck_interviews_status",
        ),
        Index("ix_interviews_application_id", "application_id"),
        Index("ix_interviews_interviewer_id", "interviewer_id"),
        Index("ix_interviews_scheduled_at", "scheduled_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    application_id: Mapped[str] = mapped_column(ForeignKey("applications.id"), nullable=False)
    interviewer_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    scheduled_by_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=60, nullable=False)
    interview_type: Mapped[str] = mapped_column(String(30), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="scheduled", nullable=False)
    meeting_url: Mapped[str | None] = mapped_column(String(800), nullable=True)
    location: Mapped[str | None] = mapped_column(String(500), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    application = relationship("Application", back_populates="interviews")
    interviewer = relationship("User", foreign_keys=[interviewer_id])
    scheduled_by = relationship("User", foreign_keys=[scheduled_by_id])
    feedback = relationship(
        "InterviewFeedback",
        back_populates="interview",
        cascade="all, delete-orphan",
    )


class InterviewFeedback(Base, TimestampMixin):
    __tablename__ = "interview_feedback"
    __table_args__ = (
        UniqueConstraint("interview_id", "author_id", name="uq_interview_feedback_author"),
        CheckConstraint("rating between 1 and 5", name="ck_interview_feedback_rating"),
        Index("ix_interview_feedback_interview_id", "interview_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    interview_id: Mapped[str] = mapped_column(ForeignKey("interviews.id"), nullable=False)
    author_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    recommendation: Mapped[str | None] = mapped_column(String(40), nullable=True)
    strengths: Mapped[str | None] = mapped_column(Text, nullable=True)
    concerns: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    interview = relationship("Interview", back_populates="feedback")
    author = relationship("User")
