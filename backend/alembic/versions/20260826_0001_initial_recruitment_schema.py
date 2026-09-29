"""Initial recruitment schema.

Revision ID: 20260826_0001
Revises:
Create Date: 2026-08-26 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "20260826_0001"
down_revision = None
branch_labels = None
depends_on = None


def id_column() -> sa.Column:
    return sa.Column("id", sa.String(length=36), primary_key=True)


def timestamps() -> list[sa.Column]:
    return [
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    ]


def soft_delete() -> sa.Column:
    return sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True)


def upgrade() -> None:
    op.create_table(
        "roles",
        id_column(),
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        *timestamps(),
        sa.UniqueConstraint("name", name="uq_roles_name"),
    )
    op.create_index("ix_roles_name", "roles", ["name"])

    op.create_table(
        "companies",
        id_column(),
        sa.Column("name", sa.String(length=180), nullable=False),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("website", sa.String(length=500), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        *timestamps(),
        soft_delete(),
        sa.UniqueConstraint("name", name="uq_companies_name"),
        sa.UniqueConstraint("slug", name="uq_companies_slug"),
    )
    op.create_index("ix_companies_name", "companies", ["name"])
    op.create_index("ix_companies_slug", "companies", ["slug"])

    op.create_table(
        "users",
        id_column(),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=180), nullable=False),
        sa.Column("phone", sa.String(length=40), nullable=True),
        sa.Column("role_id", sa.String(length=36), nullable=False),
        sa.Column("company_id", sa.String(length=36), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        *timestamps(),
        soft_delete(),
        sa.ForeignKeyConstraint(["role_id"], ["roles.id"]),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_role_id", "users", ["role_id"])
    op.create_index("ix_users_company_id", "users", ["company_id"])

    op.create_table(
        "candidates",
        id_column(),
        sa.Column("user_id", sa.String(length=36), nullable=True),
        sa.Column("company_id", sa.String(length=36), nullable=True),
        sa.Column("full_name", sa.String(length=180), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=40), nullable=True),
        sa.Column("location", sa.String(length=180), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("experience_years", sa.Float(), nullable=True),
        sa.Column("current_status", sa.String(length=50), nullable=False, server_default="active"),
        *timestamps(),
        soft_delete(),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.UniqueConstraint("user_id", name="uq_candidates_user_id"),
    )
    op.create_index("ix_candidates_email", "candidates", ["email"])
    op.create_index("ix_candidates_company_id", "candidates", ["company_id"])
    op.create_index("ix_candidates_current_status", "candidates", ["current_status"])

    op.create_table(
        "requirements",
        id_column(),
        sa.Column("company_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=220), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("department", sa.String(length=140), nullable=False),
        sa.Column("hiring_manager_id", sa.String(length=36), nullable=True),
        sa.Column("recruiter_id", sa.String(length=36), nullable=True),
        sa.Column("created_by_id", sa.String(length=36), nullable=False),
        sa.Column("priority", sa.String(length=20), nullable=False, server_default="medium"),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="draft"),
        sa.Column("required_skills_text", sa.Text(), nullable=True),
        sa.Column("experience_min_years", sa.Float(), nullable=True),
        sa.Column("experience_max_years", sa.Float(), nullable=True),
        sa.Column("location", sa.String(length=180), nullable=True),
        sa.Column("employment_type", sa.String(length=60), nullable=True),
        sa.Column("salary_min", sa.Integer(), nullable=True),
        sa.Column("salary_max", sa.Integer(), nullable=True),
        sa.Column("salary_currency", sa.String(length=3), nullable=False, server_default="USD"),
        sa.Column("positions_count", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("deadline", sa.Date(), nullable=True),
        *timestamps(),
        soft_delete(),
        sa.CheckConstraint("priority in ('low', 'medium', 'high', 'urgent')", name="ck_requirements_priority"),
        sa.CheckConstraint("status in ('draft', 'review', 'approved', 'published', 'closed')", name="ck_requirements_status"),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["hiring_manager_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["recruiter_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
    )
    op.create_index("ix_requirements_company_status", "requirements", ["company_id", "status"])
    op.create_index("ix_requirements_recruiter_id", "requirements", ["recruiter_id"])
    op.create_index("ix_requirements_hiring_manager_id", "requirements", ["hiring_manager_id"])

    op.create_table(
        "jobs",
        id_column(),
        sa.Column("company_id", sa.String(length=36), nullable=False),
        sa.Column("requirement_id", sa.String(length=36), nullable=True),
        sa.Column("title", sa.String(length=220), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("department", sa.String(length=140), nullable=False),
        sa.Column("location", sa.String(length=180), nullable=False),
        sa.Column("employment_type", sa.String(length=40), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="draft"),
        sa.Column("experience_min_years", sa.Float(), nullable=True),
        sa.Column("experience_max_years", sa.Float(), nullable=True),
        sa.Column("salary_min", sa.Integer(), nullable=True),
        sa.Column("salary_max", sa.Integer(), nullable=True),
        sa.Column("salary_currency", sa.String(length=3), nullable=False, server_default="USD"),
        sa.Column("recruiter_id", sa.String(length=36), nullable=True),
        sa.Column("hiring_manager_id", sa.String(length=36), nullable=True),
        sa.Column("posted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deadline", sa.Date(), nullable=True),
        *timestamps(),
        soft_delete(),
        sa.CheckConstraint("status in ('draft', 'published', 'unpublished', 'closed')", name="ck_jobs_status"),
        sa.CheckConstraint("employment_type in ('full_time', 'part_time', 'contract', 'internship')", name="ck_jobs_employment_type"),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["requirement_id"], ["requirements.id"]),
        sa.ForeignKeyConstraint(["recruiter_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["hiring_manager_id"], ["users.id"]),
    )
    op.create_index("ix_jobs_company_status", "jobs", ["company_id", "status"])
    op.create_index("ix_jobs_requirement_id", "jobs", ["requirement_id"])
    op.create_index("ix_jobs_recruiter_id", "jobs", ["recruiter_id"])

    op.create_table(
        "resumes",
        id_column(),
        sa.Column("candidate_id", sa.String(length=36), nullable=False),
        sa.Column("uploaded_by_id", sa.String(length=36), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("storage_key", sa.String(length=500), nullable=False),
        sa.Column("content_type", sa.String(length=120), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("checksum_sha256", sa.String(length=64), nullable=True),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default=sa.true()),
        *timestamps(),
        soft_delete(),
        sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"]),
        sa.ForeignKeyConstraint(["uploaded_by_id"], ["users.id"]),
        sa.UniqueConstraint("storage_key", name="uq_resumes_storage_key"),
    )
    op.create_index("ix_resumes_candidate_id", "resumes", ["candidate_id"])
    op.create_index("ix_resumes_uploaded_by_id", "resumes", ["uploaded_by_id"])

    op.create_table(
        "skills",
        id_column(),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("normalized_name", sa.String(length=120), nullable=False),
        *timestamps(),
        sa.UniqueConstraint("normalized_name", name="uq_skills_normalized_name"),
    )
    op.create_index("ix_skills_normalized_name", "skills", ["normalized_name"])

    op.create_table(
        "applications",
        id_column(),
        sa.Column("candidate_id", sa.String(length=36), nullable=False),
        sa.Column("job_id", sa.String(length=36), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="applied"),
        sa.Column("cover_letter", sa.Text(), nullable=True),
        sa.Column("resume_id", sa.String(length=36), nullable=True),
        sa.Column("source", sa.String(length=120), nullable=True),
        *timestamps(),
        soft_delete(),
        sa.CheckConstraint(
            "status in ('applied', 'screening', 'shortlisted', 'interview', 'offer', 'hired', 'rejected', 'withdrawn', 'not_interested')",
            name="ck_applications_status",
        ),
        sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"]),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"]),
        sa.ForeignKeyConstraint(["resume_id"], ["resumes.id"]),
        sa.UniqueConstraint("candidate_id", "job_id", name="uq_applications_candidate_job"),
    )
    op.create_index("ix_applications_job_status", "applications", ["job_id", "status"])
    op.create_index("ix_applications_candidate_id", "applications", ["candidate_id"])

    op.create_table(
        "application_status_history",
        id_column(),
        sa.Column("application_id", sa.String(length=36), nullable=False),
        sa.Column("from_status", sa.String(length=30), nullable=True),
        sa.Column("to_status", sa.String(length=30), nullable=False),
        sa.Column("changed_by_id", sa.String(length=36), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        *timestamps(),
        sa.CheckConstraint(
            "to_status in ('applied', 'screening', 'shortlisted', 'interview', 'offer', 'hired', 'rejected', 'withdrawn', 'not_interested')",
            name="ck_application_status_history_to_status",
        ),
        sa.ForeignKeyConstraint(["application_id"], ["applications.id"]),
        sa.ForeignKeyConstraint(["changed_by_id"], ["users.id"]),
    )
    op.create_index("ix_application_status_history_application_id", "application_status_history", ["application_id"])

    op.create_table(
        "interviews",
        id_column(),
        sa.Column("application_id", sa.String(length=36), nullable=False),
        sa.Column("interviewer_id", sa.String(length=36), nullable=False),
        sa.Column("scheduled_by_id", sa.String(length=36), nullable=False),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False, server_default="60"),
        sa.Column("interview_type", sa.String(length=30), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="scheduled"),
        sa.Column("meeting_url", sa.String(length=800), nullable=True),
        sa.Column("location", sa.String(length=500), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        *timestamps(),
        sa.CheckConstraint("interview_type in ('phone', 'video', 'onsite', 'technical', 'panel')", name="ck_interviews_type"),
        sa.CheckConstraint("status in ('scheduled', 'completed', 'cancelled', 'rescheduled')", name="ck_interviews_status"),
        sa.ForeignKeyConstraint(["application_id"], ["applications.id"]),
        sa.ForeignKeyConstraint(["interviewer_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["scheduled_by_id"], ["users.id"]),
    )
    op.create_index("ix_interviews_application_id", "interviews", ["application_id"])
    op.create_index("ix_interviews_interviewer_id", "interviews", ["interviewer_id"])
    op.create_index("ix_interviews_scheduled_at", "interviews", ["scheduled_at"])

    op.create_table(
        "interview_feedback",
        id_column(),
        sa.Column("interview_id", sa.String(length=36), nullable=False),
        sa.Column("author_id", sa.String(length=36), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("recommendation", sa.String(length=40), nullable=True),
        sa.Column("strengths", sa.Text(), nullable=True),
        sa.Column("concerns", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        *timestamps(),
        sa.CheckConstraint("rating between 1 and 5", name="ck_interview_feedback_rating"),
        sa.ForeignKeyConstraint(["interview_id"], ["interviews.id"]),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"]),
        sa.UniqueConstraint("interview_id", "author_id", name="uq_interview_feedback_author"),
    )
    op.create_index("ix_interview_feedback_interview_id", "interview_feedback", ["interview_id"])

    op.create_table(
        "comments",
        id_column(),
        sa.Column("author_id", sa.String(length=36), nullable=False),
        sa.Column("entity_type", sa.String(length=40), nullable=False),
        sa.Column("entity_id", sa.String(length=36), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("visibility", sa.String(length=30), nullable=False, server_default="internal"),
        *timestamps(),
        sa.CheckConstraint("entity_type in ('requirement', 'job', 'candidate', 'application', 'interview')", name="ck_comments_entity_type"),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"]),
    )
    op.create_index("ix_comments_entity", "comments", ["entity_type", "entity_id"])
    op.create_index("ix_comments_author_id", "comments", ["author_id"])

    op.create_table(
        "notifications",
        id_column(),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("link", sa.String(length=500), nullable=True),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        *timestamps(),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    )
    op.create_index("ix_notifications_user_read", "notifications", ["user_id", "read_at"])

    op.create_table(
        "audit_logs",
        id_column(),
        sa.Column("actor_id", sa.String(length=36), nullable=True),
        sa.Column("action", sa.String(length=120), nullable=False),
        sa.Column("entity_type", sa.String(length=80), nullable=False),
        sa.Column("entity_id", sa.String(length=36), nullable=True),
        sa.Column("ip_address", sa.String(length=64), nullable=True),
        sa.Column("user_agent", sa.String(length=500), nullable=True),
        sa.Column("metadata", sa.JSON(), nullable=True),
        *timestamps(),
        sa.ForeignKeyConstraint(["actor_id"], ["users.id"]),
    )
    op.create_index("ix_audit_logs_actor_id", "audit_logs", ["actor_id"])
    op.create_index("ix_audit_logs_entity", "audit_logs", ["entity_type", "entity_id"])
    op.create_index("ix_audit_logs_action", "audit_logs", ["action"])

    op.create_table(
        "token_revocations",
        id_column(),
        sa.Column("jti", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        *timestamps(),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.UniqueConstraint("jti", name="uq_token_revocations_jti"),
    )
    op.create_index("ix_token_revocations_jti", "token_revocations", ["jti"])
    op.create_index("ix_token_revocations_expires_at", "token_revocations", ["expires_at"])

    op.create_table(
        "candidate_skills",
        id_column(),
        sa.Column("candidate_id", sa.String(length=36), nullable=False),
        sa.Column("skill_id", sa.String(length=36), nullable=False),
        sa.Column("years_experience", sa.Float(), nullable=True),
        *timestamps(),
        sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"]),
        sa.ForeignKeyConstraint(["skill_id"], ["skills.id"]),
        sa.UniqueConstraint("candidate_id", "skill_id", name="uq_candidate_skills_candidate_skill"),
    )
    op.create_index("ix_candidate_skills_skill_id", "candidate_skills", ["skill_id"])

    op.create_table(
        "job_skills",
        id_column(),
        sa.Column("job_id", sa.String(length=36), nullable=False),
        sa.Column("skill_id", sa.String(length=36), nullable=False),
        sa.Column("is_required", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("weight", sa.Float(), nullable=False, server_default="1.0"),
        *timestamps(),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"]),
        sa.ForeignKeyConstraint(["skill_id"], ["skills.id"]),
        sa.UniqueConstraint("job_id", "skill_id", name="uq_job_skills_job_skill"),
    )
    op.create_index("ix_job_skills_skill_id", "job_skills", ["skill_id"])


def downgrade() -> None:
    op.drop_index("ix_job_skills_skill_id", table_name="job_skills")
    op.drop_table("job_skills")
    op.drop_index("ix_candidate_skills_skill_id", table_name="candidate_skills")
    op.drop_table("candidate_skills")
    op.drop_index("ix_token_revocations_expires_at", table_name="token_revocations")
    op.drop_index("ix_token_revocations_jti", table_name="token_revocations")
    op.drop_table("token_revocations")
    op.drop_index("ix_audit_logs_action", table_name="audit_logs")
    op.drop_index("ix_audit_logs_entity", table_name="audit_logs")
    op.drop_index("ix_audit_logs_actor_id", table_name="audit_logs")
    op.drop_table("audit_logs")
    op.drop_index("ix_notifications_user_read", table_name="notifications")
    op.drop_table("notifications")
    op.drop_index("ix_comments_author_id", table_name="comments")
    op.drop_index("ix_comments_entity", table_name="comments")
    op.drop_table("comments")
    op.drop_index("ix_interview_feedback_interview_id", table_name="interview_feedback")
    op.drop_table("interview_feedback")
    op.drop_index("ix_interviews_scheduled_at", table_name="interviews")
    op.drop_index("ix_interviews_interviewer_id", table_name="interviews")
    op.drop_index("ix_interviews_application_id", table_name="interviews")
    op.drop_table("interviews")
    op.drop_index("ix_application_status_history_application_id", table_name="application_status_history")
    op.drop_table("application_status_history")
    op.drop_index("ix_applications_candidate_id", table_name="applications")
    op.drop_index("ix_applications_job_status", table_name="applications")
    op.drop_table("applications")
    op.drop_index("ix_skills_normalized_name", table_name="skills")
    op.drop_table("skills")
    op.drop_index("ix_resumes_uploaded_by_id", table_name="resumes")
    op.drop_index("ix_resumes_candidate_id", table_name="resumes")
    op.drop_table("resumes")
    op.drop_index("ix_jobs_recruiter_id", table_name="jobs")
    op.drop_index("ix_jobs_requirement_id", table_name="jobs")
    op.drop_index("ix_jobs_company_status", table_name="jobs")
    op.drop_table("jobs")
    op.drop_index("ix_requirements_hiring_manager_id", table_name="requirements")
    op.drop_index("ix_requirements_recruiter_id", table_name="requirements")
    op.drop_index("ix_requirements_company_status", table_name="requirements")
    op.drop_table("requirements")
    op.drop_index("ix_candidates_current_status", table_name="candidates")
    op.drop_index("ix_candidates_company_id", table_name="candidates")
    op.drop_index("ix_candidates_email", table_name="candidates")
    op.drop_table("candidates")
    op.drop_index("ix_users_company_id", table_name="users")
    op.drop_index("ix_users_role_id", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    op.drop_index("ix_companies_slug", table_name="companies")
    op.drop_index("ix_companies_name", table_name="companies")
    op.drop_table("companies")
    op.drop_index("ix_roles_name", table_name="roles")
    op.drop_table("roles")
