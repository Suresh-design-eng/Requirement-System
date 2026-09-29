from sqlalchemy import Boolean, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import SoftDeleteMixin, TimestampMixin, generate_uuid


class Resume(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "resumes"
    __table_args__ = (
        Index("ix_resumes_candidate_id", "candidate_id"),
        Index("ix_resumes_uploaded_by_id", "uploaded_by_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    candidate_id: Mapped[str] = mapped_column(ForeignKey("candidates.id"), nullable=False)
    uploaded_by_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_key: Mapped[str] = mapped_column(String(500), unique=True, nullable=False)
    content_type: Mapped[str] = mapped_column(String(120), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    checksum_sha256: Mapped[str | None] = mapped_column(String(64), nullable=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    candidate = relationship("Candidate", back_populates="resumes")
    uploaded_by = relationship("User")
