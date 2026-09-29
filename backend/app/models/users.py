from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import SoftDeleteMixin, TimestampMixin, generate_uuid


class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"
    __table_args__ = (
        Index("ix_users_role_id", "role_id"),
        Index("ix_users_company_id", "company_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(180), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    role_id: Mapped[str] = mapped_column(ForeignKey("roles.id"), nullable=False)
    company_id: Mapped[str | None] = mapped_column(ForeignKey("companies.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    role = relationship("Role", back_populates="users")
    company = relationship("Company", back_populates="users")
    candidate_profile = relationship(
        "Candidate",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    created_requirements = relationship(
        "Requirement",
        foreign_keys="Requirement.created_by_id",
        back_populates="created_by",
    )
    recruited_requirements = relationship(
        "Requirement",
        foreign_keys="Requirement.recruiter_id",
        back_populates="recruiter",
    )
    managed_requirements = relationship(
        "Requirement",
        foreign_keys="Requirement.hiring_manager_id",
        back_populates="hiring_manager",
    )
