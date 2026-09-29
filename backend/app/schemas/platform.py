from datetime import datetime

from pydantic import BaseModel, Field


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=180)
    phone: str | None = Field(default=None, max_length=40)
    location: str | None = Field(default=None, max_length=180)
    experience_years: float | None = Field(default=None, ge=0)
    skills: list[str] | None = None
    education: str | None = Field(default=None, max_length=500)
    portfolio_url: str | None = Field(default=None, max_length=500)
    github_url: str | None = Field(default=None, max_length=500)
    linkedin_url: str | None = Field(default=None, max_length=500)
    expected_salary: str | None = Field(default=None, max_length=120)


class RequirementWrite(BaseModel):
    title: str = Field(min_length=1, max_length=220)
    description: str = Field(min_length=1)
    priority: str = "medium"
    status: str = "pending"
    deadline: str | None = None


class JobWrite(BaseModel):
    title: str = Field(min_length=1, max_length=220)
    description: str = Field(min_length=1)
    department: str = Field(min_length=1, max_length=140)
    location: str = Field(min_length=1, max_length=180)
    type: str = "full-time"
    salary: str | None = None
    requirements: list[str] = []
    skills: list[str] = []
    experience_years_required: float = Field(default=0, ge=0)
    deadline: str | None = None
    status: str = "published"


class ApplicationWrite(BaseModel):
    job_id: str
    full_name: str = Field(min_length=2, max_length=180)
    email: str
    phone: str = Field(min_length=1, max_length=40)
    skills: list[str] = []
    experience_years: float = Field(default=0, ge=0)
    cover_letter: str = ""
    availability: str = "immediate"


class ApplicationStatusWrite(BaseModel):
    status: str


class InterviewWrite(BaseModel):
    application_id: str
    type: str
    scheduled_at: datetime
    link_or_location: str = ""
