from datetime import date

from sqlalchemy import (
    CheckConstraint,
    Date,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import SoftDeleteMixin, TimestampMixin, generate_uuid


class Requirement(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "requirements"
    __table_args__ = (
        CheckConstraint(
            "priority in ('low', 'medium', 'high', 'urgent')",
            name="ck_requirements_priority",
        ),
        CheckConstraint(
            "status in ('draft', 'review', 'approved', 'published', 'closed')",
            name="ck_requirements_status",
        ),
        Index("ix_requirements_company_status", "company_id", "status"),
        Index("ix_requirements_recruiter_id", "recruiter_id"),
        Index("ix_requirements_hiring_manager_id", "hiring_manager_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(220), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    department: Mapped[str] = mapped_column(String(140), nullable=False)
    hiring_manager_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    recruiter_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_by_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    priority: Mapped[str] = mapped_column(String(20), default="medium", nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="draft", nullable=False)
    required_skills_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    experience_min_years: Mapped[float | None] = mapped_column(Float, nullable=True)
    experience_max_years: Mapped[float | None] = mapped_column(Float, nullable=True)
    location: Mapped[str | None] = mapped_column(String(180), nullable=True)
    employment_type: Mapped[str | None] = mapped_column(String(60), nullable=True)
    salary_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    positions_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    deadline: Mapped[date | None] = mapped_column(Date, nullable=True)

    company = relationship("Company", back_populates="requirements")
    hiring_manager = relationship(
        "User",
        foreign_keys=[hiring_manager_id],
        back_populates="managed_requirements",
    )
    recruiter = relationship(
        "User",
        foreign_keys=[recruiter_id],
        back_populates="recruited_requirements",
    )
    created_by = relationship(
        "User",
        foreign_keys=[created_by_id],
        back_populates="created_requirements",
    )
    jobs = relationship("Job", back_populates="requirement")
