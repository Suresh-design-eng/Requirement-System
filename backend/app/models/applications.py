from sqlalchemy import CheckConstraint, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import SoftDeleteMixin, TimestampMixin, generate_uuid


APPLICATION_STATUSES = (
    "applied",
    "screening",
    "shortlisted",
    "interview",
    "offer",
    "hired",
    "rejected",
    "withdrawn",
    "not_interested",
)


class Application(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "applications"
    __table_args__ = (
        UniqueConstraint("candidate_id", "job_id", name="uq_applications_candidate_job"),
        CheckConstraint(
            "status in ('applied', 'screening', 'shortlisted', 'interview', 'offer', 'hired', 'rejected', 'withdrawn', 'not_interested')",
            name="ck_applications_status",
        ),
        Index("ix_applications_job_status", "job_id", "status"),
        Index("ix_applications_candidate_id", "candidate_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    candidate_id: Mapped[str] = mapped_column(ForeignKey("candidates.id"), nullable=False)
    job_id: Mapped[str] = mapped_column(ForeignKey("jobs.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="applied", nullable=False)
    cover_letter: Mapped[str | None] = mapped_column(Text, nullable=True)
    resume_id: Mapped[str | None] = mapped_column(ForeignKey("resumes.id"), nullable=True)
    source: Mapped[str | None] = mapped_column(String(120), nullable=True)

    candidate = relationship("Candidate", back_populates="applications")
    job = relationship("Job", back_populates="applications")
    resume = relationship("Resume")
    status_history = relationship(
        "ApplicationStatusHistory",
        back_populates="application",
        cascade="all, delete-orphan",
    )
    interviews = relationship("Interview", back_populates="application")


class ApplicationStatusHistory(Base, TimestampMixin):
    __tablename__ = "application_status_history"
    __table_args__ = (
        CheckConstraint(
            "to_status in ('applied', 'screening', 'shortlisted', 'interview', 'offer', 'hired', 'rejected', 'withdrawn', 'not_interested')",
            name="ck_application_status_history_to_status",
        ),
        Index("ix_application_status_history_application_id", "application_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    application_id: Mapped[str] = mapped_column(ForeignKey("applications.id"), nullable=False)
    from_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    to_status: Mapped[str] = mapped_column(String(30), nullable=False)
    changed_by_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    application = relationship("Application", back_populates="status_history")
    changed_by = relationship("User")
