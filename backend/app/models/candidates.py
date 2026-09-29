from sqlalchemy import Float, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import SoftDeleteMixin, TimestampMixin, generate_uuid


class Candidate(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "candidates"
    __table_args__ = (
        UniqueConstraint("user_id", name="uq_candidates_user_id"),
        Index("ix_candidates_company_id", "company_id"),
        Index("ix_candidates_current_status", "current_status"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    company_id: Mapped[str | None] = mapped_column(ForeignKey("companies.id"), nullable=True)
    full_name: Mapped[str] = mapped_column(String(180), nullable=False)
    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    location: Mapped[str | None] = mapped_column(String(180), nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    experience_years: Mapped[float | None] = mapped_column(Float, nullable=True)
    current_status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)

    user = relationship("User", back_populates="candidate_profile")
    company = relationship("Company")
    resumes = relationship("Resume", back_populates="candidate", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="candidate")
    skills = relationship("CandidateSkill", back_populates="candidate", cascade="all, delete-orphan")
