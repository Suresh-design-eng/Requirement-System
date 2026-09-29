from sqlalchemy import CheckConstraint, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import TimestampMixin, generate_uuid


class Comment(Base, TimestampMixin):
    __tablename__ = "comments"
    __table_args__ = (
        CheckConstraint(
            "entity_type in ('requirement', 'job', 'candidate', 'application', 'interview')",
            name="ck_comments_entity_type",
        ),
        Index("ix_comments_entity", "entity_type", "entity_id"),
        Index("ix_comments_author_id", "author_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    author_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(40), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(36), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    visibility: Mapped[str] = mapped_column(String(30), default="internal", nullable=False)

    author = relationship("User")
