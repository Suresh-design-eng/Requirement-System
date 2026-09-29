from sqlalchemy import Boolean, Float, ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import TimestampMixin, generate_uuid


class Skill(Base, TimestampMixin):
    __tablename__ = "skills"
    __table_args__ = (
        UniqueConstraint("normalized_name", name="uq_skills_normalized_name"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    normalized_name: Mapped[str] = mapped_column(String(120), index=True, nullable=False)

    candidate_links = relationship("CandidateSkill", back_populates="skill")
    job_links = relationship("JobSkill", back_populates="skill")


class CandidateSkill(Base, TimestampMixin):
    __tablename__ = "candidate_skills"
    __table_args__ = (
        UniqueConstraint("candidate_id", "skill_id", name="uq_candidate_skills_candidate_skill"),
        Index("ix_candidate_skills_skill_id", "skill_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    candidate_id: Mapped[str] = mapped_column(ForeignKey("candidates.id"), nullable=False)
    skill_id: Mapped[str] = mapped_column(ForeignKey("skills.id"), nullable=False)
    years_experience: Mapped[float | None] = mapped_column(Float, nullable=True)

    candidate = relationship("Candidate", back_populates="skills")
    skill = relationship("Skill", back_populates="candidate_links")


class JobSkill(Base, TimestampMixin):
    __tablename__ = "job_skills"
    __table_args__ = (
        UniqueConstraint("job_id", "skill_id", name="uq_job_skills_job_skill"),
        Index("ix_job_skills_skill_id", "skill_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    job_id: Mapped[str] = mapped_column(ForeignKey("jobs.id"), nullable=False)
    skill_id: Mapped[str] = mapped_column(ForeignKey("skills.id"), nullable=False)
    is_required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)

    job = relationship("Job", back_populates="skills")
    skill = relationship("Skill", back_populates="job_links")
