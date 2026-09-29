"""Add extensible persisted candidate settings.

Revision ID: 20260929_0002
Revises: 20260826_0001
Create Date: 2026-09-29 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260929_0002"
down_revision = "20260826_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("candidates", sa.Column("profile_data", sa.JSON(), nullable=True))
    op.add_column("jobs", sa.Column("details", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("jobs", "details")
    op.drop_column("candidates", "profile_data")
