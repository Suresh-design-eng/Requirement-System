"""Persistent recruitment APIs used by the React application.

The response shapes deliberately use the established frontend field names.  This
keeps the visual layer independent from SQLAlchemy naming and replaces the old
browser-only data store with PostgreSQL-backed records.
"""

from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.auth.dependencies import get_current_user, require_roles
from app.core.rbac import RECRUITING_STAFF_ROLES, ROLE_ADMIN, ROLE_CANDIDATE
from app.db.session import get_db
from app.models.applications import Application, ApplicationStatusHistory
from app.models.audit_logs import AuditLog
from app.models.candidates import Candidate
from app.models.companies import Company
from app.models.interviews import Interview
from app.models.jobs import Job
from app.models.requirements import Requirement
from app.models.skills import CandidateSkill, JobSkill, Skill
from app.models.users import User
from app.schemas.platform import (
    ApplicationStatusWrite,
    ApplicationWrite,
    InterviewWrite,
    JobWrite,
    RequirementWrite,
    UserUpdate,
)
from app.services.audit_service import AuditService

router = APIRouter()

FRONTEND_TO_DB_APPLICATION_STATUS = {
    "applied": "applied", "in_review": "screening", "shortlisted": "shortlisted",
    "interview_scheduled": "interview", "accepted": "hired", "rejected": "rejected",
}
DB_TO_FRONTEND_APPLICATION_STATUS = {value: key for key, value in FRONTEND_TO_DB_APPLICATION_STATUS.items()}
FRONTEND_TO_DB_REQUIREMENT_STATUS = {
    "pending": "draft", "in_progress": "review", "completed": "approved", "rejected": "closed",
}
DB_TO_FRONTEND_REQUIREMENT_STATUS = {value: key for key, value in FRONTEND_TO_DB_REQUIREMENT_STATUS.items()}


def _date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return date.fromisoformat(value[:10])
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="Dates must use ISO-8601 format.") from exc


def _company(db: Session) -> Company:
    company = db.scalar(select(Company).where(Company.slug == "requirement-system"))
    if not company:
        company = Company(name="Requirement System", slug="requirement-system")
        db.add(company)
        db.flush()
    return company


def _skills(db: Session, names: list[str]) -> list[Skill]:
    records: list[Skill] = []
    for name in dict.fromkeys(name.strip() for name in names if name.strip()):
        normalized = name.lower()
        skill = db.scalar(select(Skill).where(Skill.normalized_name == normalized))
        if not skill:
            skill = Skill(name=name, normalized_name=normalized)
            db.add(skill)
            db.flush()
        records.append(skill)
    return records


def _user(user: User) -> dict:
    candidate = user.candidate_profile
    return {
        "id": user.id, "name": user.full_name, "email": user.email,
        "role": "admin" if user.role.name == ROLE_ADMIN else "user", "phone": user.phone,
        "location": candidate.location if candidate else None,
        "experienceYears": candidate.experience_years if candidate else None,
        "skills": [link.skill.name for link in candidate.skills] if candidate else [],
    }


def _requirement(item: Requirement) -> dict:
    return {
        "id": item.id, "title": item.title, "description": item.description,
        "priority": item.priority, "status": DB_TO_FRONTEND_REQUIREMENT_STATUS.get(item.status, "pending"),
        "deadline": item.deadline.isoformat() if item.deadline else "", "createdBy": item.created_by.full_name,
        "createdAt": item.created_at.date().isoformat(),
    }


def _job(item: Job) -> dict:
    return {
        "id": item.id, "title": item.title, "company": item.company.name,
        "adminName": item.recruiter.full_name if item.recruiter else "Requirement System",
        "description": item.description, "department": item.department, "location": item.location,
        "type": item.employment_type.replace("_", "-"),
        "salary": _salary(item.salary_min, item.salary_max, item.salary_currency),
        "requirements": [line for line in item.description.split("\n") if line.strip()][1:] or [],
        "skills": [link.skill.name for link in item.skills],
        "experienceYearsRequired": item.experience_min_years or 0,
        "postedDate": (item.posted_at or item.created_at).date().isoformat(),
        "deadline": item.deadline.isoformat() if item.deadline else "",
    }


def _salary(minimum: int | None, maximum: int | None, currency: str) -> str:
    if minimum is None and maximum is None:
        return "Competitive"
    if minimum is None:
        return f"{currency} {maximum:,}"
    if maximum is None:
        return f"{currency} {minimum:,}"
    return f"{currency} {minimum:,} - {maximum:,}"


def _application(item: Application) -> dict:
    latest_interview = max(item.interviews, key=lambda interview: interview.scheduled_at, default=None)
    candidate = item.candidate
    return {
        "id": item.id, "jobId": item.job_id, "userId": candidate.user_id or candidate.id,
        "status": DB_TO_FRONTEND_APPLICATION_STATUS.get(item.status, "applied"),
        "appliedDate": item.created_at.date().isoformat(), "lastUpdatedAt": item.updated_at.isoformat(),
        "fullName": candidate.full_name, "email": candidate.email, "phone": candidate.phone,
        "skills": [link.skill.name for link in candidate.skills], "experienceYears": candidate.experience_years,
        "coverLetter": item.cover_letter, "interviewType": _interview_type(latest_interview),
        "interviewDate": latest_interview.scheduled_at.isoformat() if latest_interview else None,
        "interviewLink": latest_interview.meeting_url if latest_interview else None,
        "interviewLocation": latest_interview.location if latest_interview else None,
    }


def _interview_type(interview: Interview | None) -> str | None:
    if not interview:
        return None
    return "offline" if interview.interview_type == "onsite" else "online"


def _state(db: Session, current_user: User) -> dict:
    users = db.scalars(select(User).options(joinedload(User.role), joinedload(User.candidate_profile).joinedload(Candidate.skills).joinedload(CandidateSkill.skill)).where(User.deleted_at.is_(None))).unique().all()
    requirements = db.scalars(select(Requirement).options(joinedload(Requirement.created_by)).where(Requirement.deleted_at.is_(None))).unique().all()
    jobs = db.scalars(select(Job).options(joinedload(Job.company), joinedload(Job.recruiter), joinedload(Job.skills).joinedload(JobSkill.skill)).where(Job.deleted_at.is_(None), Job.status == "published")).unique().all()
    if current_user.role.name in RECRUITING_STAFF_ROLES:
        jobs = db.scalars(select(Job).options(joinedload(Job.company), joinedload(Job.recruiter), joinedload(Job.skills).joinedload(JobSkill.skill)).where(Job.deleted_at.is_(None))).unique().all()
    applications_query = select(Application).options(joinedload(Application.candidate).joinedload(Candidate.skills).joinedload(CandidateSkill.skill), joinedload(Application.interviews))
    if current_user.role.name == ROLE_CANDIDATE:
        applications_query = applications_query.join(Candidate).where(Candidate.user_id == current_user.id)
    applications = db.scalars(applications_query).unique().all()
    audits: list[AuditLog] = []
    if current_user.role.name == ROLE_ADMIN:
        audits = db.scalars(select(AuditLog).options(joinedload(AuditLog.actor)).order_by(AuditLog.created_at.desc()).limit(100)).unique().all()
    return {
        "currentUser": _user(current_user), "users": [_user(user) for user in users],
        "requirements": [_requirement(item) for item in requirements], "jobs": [_job(item) for item in jobs],
        "applications": [_application(item) for item in applications],
        "audit": [{"id": item.id, "action": item.action, "entityType": item.entity_type, "createdAt": item.created_at.isoformat(), "actor": item.actor.full_name if item.actor else None} for item in audits],
    }


@router.get("/state")
def state(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    return _state(db, current_user)


@router.patch("/users/me")
def update_me(payload: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    if payload.name is not None:
        current_user.full_name = payload.name.strip()
    if payload.phone is not None:
        current_user.phone = payload.phone.strip() or None
    candidate = current_user.candidate_profile
    if candidate:
        if payload.name is not None:
            candidate.full_name = current_user.full_name
        if payload.phone is not None:
            candidate.phone = current_user.phone
        if payload.location is not None:
            candidate.location = payload.location.strip() or None
        if payload.experience_years is not None:
            candidate.experience_years = payload.experience_years
    AuditService(db).log(action="user.updated", entity_type="user", entity_id=current_user.id, actor_id=current_user.id)
    db.commit()
    return _user(current_user)


@router.post("/requirements", status_code=status.HTTP_201_CREATED)
def create_requirement(payload: RequirementWrite, current_user: User = Depends(require_roles(*RECRUITING_STAFF_ROLES)), db: Session = Depends(get_db)) -> dict:
    item = Requirement(company_id=_company(db).id, created_by_id=current_user.id, title=payload.title.strip(), description=payload.description.strip(), priority=payload.priority, status=FRONTEND_TO_DB_REQUIREMENT_STATUS.get(payload.status, "draft"), deadline=_date(payload.deadline))
    db.add(item); db.flush()
    AuditService(db).log(action="requirement.created", entity_type="requirement", entity_id=item.id, actor_id=current_user.id)
    db.commit(); db.refresh(item)
    return _requirement(item)


@router.patch("/requirements/{requirement_id}")
def update_requirement(requirement_id: str, payload: RequirementWrite, current_user: User = Depends(require_roles(*RECRUITING_STAFF_ROLES)), db: Session = Depends(get_db)) -> dict:
    item = db.get(Requirement, requirement_id)
    if not item or item.deleted_at:
        raise HTTPException(404, "Requirement not found.")
    item.title, item.description, item.priority = payload.title.strip(), payload.description.strip(), payload.priority
    item.status, item.deadline = FRONTEND_TO_DB_REQUIREMENT_STATUS.get(payload.status, "draft"), _date(payload.deadline)
    AuditService(db).log(action="requirement.updated", entity_type="requirement", entity_id=item.id, actor_id=current_user.id)
    db.commit(); db.refresh(item)
    return _requirement(item)


@router.delete("/requirements/{requirement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_requirement(requirement_id: str, current_user: User = Depends(require_roles(*RECRUITING_STAFF_ROLES)), db: Session = Depends(get_db)) -> None:
    item = db.get(Requirement, requirement_id)
    if not item or item.deleted_at:
        raise HTTPException(404, "Requirement not found.")
    item.deleted_at = datetime.now(timezone.utc)
    AuditService(db).log(action="requirement.deleted", entity_type="requirement", entity_id=item.id, actor_id=current_user.id)
    db.commit()


@router.post("/jobs", status_code=status.HTTP_201_CREATED)
def create_job(payload: JobWrite, current_user: User = Depends(require_roles(*RECRUITING_STAFF_ROLES)), db: Session = Depends(get_db)) -> dict:
    item = Job(company_id=_company(db).id, recruiter_id=current_user.id, title=payload.title.strip(), description=payload.description.strip(), department=payload.department.strip(), location=payload.location.strip(), employment_type=payload.type.replace("-", "_"), status=payload.status, experience_min_years=payload.experience_years_required, deadline=_date(payload.deadline), posted_at=datetime.now(timezone.utc) if payload.status == "published" else None)
    db.add(item); db.flush()
    item.skills = [JobSkill(skill_id=skill.id) for skill in _skills(db, payload.skills)]
    AuditService(db).log(action="job.created", entity_type="job", entity_id=item.id, actor_id=current_user.id)
    db.commit(); db.refresh(item)
    return _job(item)


@router.patch("/jobs/{job_id}")
def update_job(job_id: str, payload: JobWrite, current_user: User = Depends(require_roles(*RECRUITING_STAFF_ROLES)), db: Session = Depends(get_db)) -> dict:
    item = db.get(Job, job_id)
    if not item or item.deleted_at:
        raise HTTPException(404, "Job not found.")
    item.title, item.description, item.department, item.location = payload.title.strip(), payload.description.strip(), payload.department.strip(), payload.location.strip()
    item.employment_type, item.status, item.experience_min_years, item.deadline = payload.type.replace("-", "_"), payload.status, payload.experience_years_required, _date(payload.deadline)
    item.skills.clear(); item.skills.extend(JobSkill(skill_id=skill.id) for skill in _skills(db, payload.skills))
    AuditService(db).log(action="job.updated", entity_type="job", entity_id=item.id, actor_id=current_user.id)
    db.commit(); db.refresh(item)
    return _job(item)


@router.delete("/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: str, current_user: User = Depends(require_roles(*RECRUITING_STAFF_ROLES)), db: Session = Depends(get_db)) -> None:
    item = db.get(Job, job_id)
    if not item or item.deleted_at:
        raise HTTPException(404, "Job not found.")
    item.deleted_at = datetime.now(timezone.utc)
    AuditService(db).log(action="job.deleted", entity_type="job", entity_id=item.id, actor_id=current_user.id)
    db.commit()


@router.post("/applications", status_code=status.HTTP_201_CREATED)
def create_application(payload: ApplicationWrite, current_user: User = Depends(require_roles(ROLE_CANDIDATE)), db: Session = Depends(get_db)) -> dict:
    candidate = current_user.candidate_profile
    job = db.get(Job, payload.job_id)
    if not candidate or not job or job.deleted_at or job.status != "published":
        raise HTTPException(404, "Published job or candidate profile not found.")
    existing = db.scalar(select(Application).where(Application.candidate_id == candidate.id, Application.job_id == job.id, Application.deleted_at.is_(None)))
    if existing:
        raise HTTPException(409, "You have already applied to this job.")
    candidate.full_name, candidate.email, candidate.phone, candidate.experience_years = payload.full_name.strip(), payload.email.lower(), payload.phone.strip(), payload.experience_years
    candidate.skills.clear(); candidate.skills.extend(CandidateSkill(skill_id=skill.id) for skill in _skills(db, payload.skills))
    item = Application(candidate_id=candidate.id, job_id=job.id, cover_letter=payload.cover_letter.strip() or None)
    db.add(item); db.flush()
    db.add(ApplicationStatusHistory(application_id=item.id, to_status="applied", changed_by_id=current_user.id))
    AuditService(db).log(action="application.created", entity_type="application", entity_id=item.id, actor_id=current_user.id)
    db.commit(); db.refresh(item)
    return _application(item)


@router.patch("/applications/{application_id}/status")
def update_application_status(application_id: str, payload: ApplicationStatusWrite, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    item = db.get(Application, application_id)
    if not item or item.deleted_at:
        raise HTTPException(404, "Application not found.")
    if current_user.role.name == ROLE_CANDIDATE and item.candidate.user_id != current_user.id:
        raise HTTPException(403, "You cannot update this application.")
    target = FRONTEND_TO_DB_APPLICATION_STATUS.get(payload.status)
    if not target or (current_user.role.name == ROLE_CANDIDATE and target not in {"withdrawn", "rejected"}):
        raise HTTPException(422, "Invalid application status change.")
    previous = item.status; item.status = target
    db.add(ApplicationStatusHistory(application_id=item.id, from_status=previous, to_status=target, changed_by_id=current_user.id))
    AuditService(db).log(action="application.status_updated", entity_type="application", entity_id=item.id, actor_id=current_user.id, event_data={"status": target})
    db.commit(); db.refresh(item)
    return _application(item)


@router.post("/interviews", status_code=status.HTTP_201_CREATED)
def create_interview(payload: InterviewWrite, current_user: User = Depends(require_roles(*RECRUITING_STAFF_ROLES)), db: Session = Depends(get_db)) -> dict:
    application = db.get(Application, payload.application_id)
    if not application or application.deleted_at:
        raise HTTPException(404, "Application not found.")
    type_ = "onsite" if payload.type == "offline" else "video"
    item = Interview(application_id=application.id, interviewer_id=current_user.id, scheduled_by_id=current_user.id, scheduled_at=payload.scheduled_at, interview_type=type_, meeting_url=payload.link_or_location if type_ == "video" else None, location=payload.link_or_location if type_ == "onsite" else None)
    application.status = "interview"
    db.add(item)
    AuditService(db).log(action="interview.scheduled", entity_type="interview", entity_id=item.id, actor_id=current_user.id)
    db.commit()
    return {"id": item.id, "applicationId": item.application_id, "scheduledAt": item.scheduled_at.isoformat()}
