from datetime import date, datetime

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import SoftDeleteMixin, TimestampMixin, generate_uuid


class Job(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "jobs"
    __table_args__ = (
        CheckConstraint(
            "status in ('draft', 'published', 'unpublished', 'closed')",
            name="ck_jobs_status",
        ),
        CheckConstraint(
            "employment_type in ('full_time', 'part_time', 'contract', 'internship')",
            name="ck_jobs_employment_type",
        ),
        Index("ix_jobs_company_status", "company_id", "status"),
        Index("ix_jobs_requirement_id", "requirement_id"),
        Index("ix_jobs_recruiter_id", "recruiter_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), nullable=False)
    requirement_id: Mapped[str | None] = mapped_column(ForeignKey("requirements.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(220), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    department: Mapped[str] = mapped_column(String(140), nullable=False)
    location: Mapped[str] = mapped_column(String(180), nullable=False)
    employment_type: Mapped[str] = mapped_column(String(40), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="draft", nullable=False)
    experience_min_years: Mapped[float | None] = mapped_column(Float, nullable=True)
    experience_max_years: Mapped[float | None] = mapped_column(Float, nullable=True)
    salary_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    recruiter_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    hiring_manager_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    posted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    details: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    company = relationship("Company", back_populates="jobs")
    requirement = relationship("Requirement", back_populates="jobs")
    recruiter = relationship("User", foreign_keys=[recruiter_id])
    hiring_manager = relationship("User", foreign_keys=[hiring_manager_id])
    applications = relationship("Application", back_populates="job")
    skills = relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")
