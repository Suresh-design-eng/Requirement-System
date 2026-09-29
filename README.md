# Recruitment & Hiring Management Platform

A structured full-stack recruitment platform for managing requirements, jobs, candidates, applications, resumes, interviews, and evidence-based candidate evaluation in one centralized system.

The **Recruitment & Hiring Management Platform** connects the complete recruitment lifecycle into a single workflow — from defining recruitment requirements and creating job openings to candidate applications, resume analysis, screening, interviews, evaluation, hiring decisions, and analytics.

The platform is built with a modern **React + TypeScript frontend** and **FastAPI + PostgreSQL backend**, with a strong focus on secure authentication, modular architecture, explainable candidate evaluation, and maintainable software design.

---

## Stack

**Frontend:** React + TypeScript + Vite + React Router + Tailwind CSS / Reusable UI Components

**Backend:** FastAPI + Python + Pydantic + SQLAlchemy

**Database:** PostgreSQL

**Database Migrations:** Alembic

**Authentication:** Password hashing + Access Tokens + Role-Based Authorization

**API:** REST

**Testing:** Python Backend Tests + TypeScript Build Verification

**Document Intelligence:** Resume Processing + Requirement/Skill Matching

---

# Main Features

### Requirement Management

* Create and manage recruitment requirements
* Define required skills, qualifications, and job expectations
* Use requirements as the foundation for job creation and evaluation

### Job Management

* Create and manage job openings
* Connect jobs with recruitment requirements
* Track job status and recruitment information

### Candidate Management

* Maintain candidate profiles
* Store candidate-related information
* Connect candidates with applications and resumes

### Application Management

* Submit applications for specific jobs
* Track application status
* Maintain the relationship between candidates and job openings

### Resume Management

* Upload candidate resumes
* Store resume information
* Process resumes for job-specific analysis

### Resume Intelligence

* Extract information from uploaded resumes
* Identify skills, experience, education, and relevant evidence
* Compare candidate information against a selected job

### Candidate Matching

* Analyze candidate-job compatibility
* Compare skills and requirements
* Evaluate relevant experience and education
* Generate explainable matching information

### Screening & Shortlisting

* Support structured candidate screening
* Identify requirement coverage
* Support recruiter shortlisting workflows

### Interview Management

* Track interview stages
* Schedule and manage interview information
* Record interview progress and outcomes

### Candidate Evaluation

* Display structured evaluation information
* Show strengths and requirement gaps
* Provide supporting evidence
* Avoid unsupported candidate scoring

### Authentication & Authorization

* Secure authentication
* Password hashing
* Access-token based authentication
* Role-based access control
* Protected API routes

### Audit & Analytics

* Track important system activities
* Maintain audit records
* Support recruitment-level analytics and reporting

---

# Recruitment Lifecycle

```text
Requirement
     ↓
Job
     ↓
Candidate
     ↓
Application
     ↓
Resume
     ↓
Screening
     ↓
Shortlisting
     ↓
Interview
     ↓
Evaluation
     ↓
Hiring Decision
     ↓
Analytics
```

The platform connects these stages instead of treating recruitment activities as separate systems.

---

# System Architecture

The application follows a layered architecture that separates presentation, API communication, business logic, database operations, and persistence.

```text
Recruiters / Administrators / Candidates
                    ↓
        ┌───────────────────────┐
        │   React + TypeScript  │
        │      Frontend         │
        └───────────┬───────────┘
                    ↓
             REST API Layer
                    ↓
        ┌───────────────────────┐
        │        FastAPI        │
        │ Routes + Auth + API   │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │    Service Layer      │
        │   Business Logic      │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │   Repository Layer    │
        │    Data Access        │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │ SQLAlchemy + PostgreSQL│
        └───────────────────────┘

Supporting Systems:
• Alembic migrations
• Backend tests
• Audit logging
• Resume processing
```

### Architectural Principles

**Presentation Layer**
Handles pages, navigation, reusable components, forms, and user interaction.

**API Layer**
Provides controlled communication between frontend and backend.

**Business Layer**
Handles recruitment workflows, authentication, candidate evaluation, applications, and other business rules.

**Repository Layer**
Separates database operations from application logic.

**Database Layer**
Stores users, requirements, jobs, candidates, applications, resumes, interviews, and audit records.

This separation improves maintainability, testing, extensibility, and scalability.

---

# AI & Resume Intelligence

## Resume Analysis & Job-Specific Matching

A core intelligence capability of the platform is **Resume Intelligence**.

The purpose is to analyze available resume information and compare it with the requirements of a specific job.

```text
Resume Upload
      ↓
Resume Processing
      ↓
Candidate Information
      ↓
Selected Job
      ↓
Requirement Matching
      ↓
Match Evaluation
      ↓
Explainable Insights
```

### Analysis Areas

| Evaluation Area      | Example Evidence                         |
| -------------------- | ---------------------------------------- |
| Skills               | Programming languages, frameworks, tools |
| Experience           | Relevant roles and experience            |
| Education            | Degree and academic background           |
| Job Requirements     | Required and preferred qualifications    |
| Technology Match     | Technologies mentioned in resume         |
| Role Relevance       | Experience related to selected position  |
| Requirement Coverage | Identifiable requirement coverage        |
| Evidence             | Resume sections supporting evaluation    |

The analysis depends on the information available in the uploaded resume and the requirements defined for the selected job.

---

# Candidate Match Evaluation

The platform can generate a **job-specific candidate match evaluation** after a resume has been successfully processed.

The evaluation is designed to consider multiple dimensions rather than relying only on keyword matching.

```text
                 Processed Resume
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
   Skill Match   Experience Match  Education Match
        │              │              │
        └──────────────┼──────────────┘
                       ↓
              Requirement Match
                       ↓
              Match Evaluation
                       ↓
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
    Strengths         Gaps       Explanation
```

### Evaluation Dimensions

* Skill Match
* Experience Match
* Education Match
* Requirement Match
* Overall Match Evaluation
* Strengths
* Requirement Gaps
* Supporting Evidence

The exact weighting and scoring logic should be determined by the implemented evaluation model rather than presented as an unexplained fixed value.

---

# Explainable Candidate Evaluation

A candidate score alone does not provide enough context for recruitment review.

The platform therefore focuses on **evidence-based evaluation**.

A candidate evaluation interface can present information such as:

```text
Overall Match
        ↓
Skill Match
        ↓
Experience Match
        ↓
Education Match
        ↓
Requirement Coverage
        ↓
Strengths + Gaps + Evidence
```

### Example Evaluation Information

* Relevant skills
* Missing or unverified skills
* Relevant experience
* Education compatibility
* Requirement coverage
* Supporting resume evidence
* Structured recruiter review information

### Evidence-Based Rule

```text
No Resume
    ↓
No Resume Analysis
    ↓
No Job Match Score
```

Candidate results must only be displayed after the relevant resume has been uploaded, processed, and evaluated against the selected job.

The system is designed to **support recruiter decision-making rather than replace human judgment**.

---

# Core Application Modules

| Module                 | Purpose                                             |
| ---------------------- | --------------------------------------------------- |
| Requirement Management | Define and manage recruitment requirements          |
| Job Management         | Create and manage job openings                      |
| Candidate Management   | Maintain candidate profiles                         |
| Application Management | Track candidate applications                        |
| Resume Management      | Upload and manage resumes                           |
| Resume Intelligence    | Extract and analyze resume information              |
| Candidate Matching     | Compare candidate information with job requirements |
| Screening              | Support candidate screening                         |
| Shortlisting           | Support recruitment shortlisting                    |
| Interview Management   | Track interviews and outcomes                       |
| Authentication         | Secure user authentication                          |
| Authorization          | Role-based access control                           |
| Audit                  | Track important system activities                   |
| Analytics              | Provide recruitment-level reporting                 |

---

# Data Model

The major entities of the platform are organized around the recruitment lifecycle.

```text
USER
 │
 ├── APPLICATION
 │       │
 │       ├── JOB
 │       │     └── REQUIREMENT
 │       │
 │       ├── CANDIDATE
 │       │     └── RESUME
 │       │
 │       └── INTERVIEW
 │
 └── AUDIT_LOG
```

### Main Entities

* User
* Requirement
* Job
* Candidate
* Application
* Resume
* Interview
* Audit Log

These entities establish the relationships required to connect requirements, jobs, candidates, applications, resumes, interviews, and recruitment activity.

---

# Frontend Architecture

The frontend is developed using modern React and TypeScript practices.

### Responsibilities

* Application routing
* Page rendering
* Reusable components
* Forms and validation
* Authentication state
* Application state
* API communication
* Recruitment workflows
* Candidate interfaces
* Administrative interfaces

### Frontend Flow

```text
React
  ↓
TypeScript
  ↓
Vite
  ↓
React Router
  ↓
Reusable Components
  ↓
Application Services
  ↓
REST API
```

The frontend remains independent from backend implementation details through service-based API communication.

---

# Backend Architecture

The backend follows a modular API, service, repository, and database architecture.

```text
API Routes
    ↓
Authentication / Authorization
    ↓
Service Layer
    ↓
Repository Layer
    ↓
SQLAlchemy Models
    ↓
PostgreSQL
```

### Backend Responsibilities

* REST API
* Authentication
* Authorization
* Requirement management
* Job management
* Candidate management
* Application management
* Resume management
* Interview management
* Candidate evaluation
* Audit logging
* Database access
* Validation
* Testing

---

# Project Structure

```text
Recruitment-System/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── alembic/
│   ├── tests/
│   ├── requirements.txt
│   └── README.md
│
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── styles/
│   └── main.tsx
│
├── README.md
├── CURRENT_BASELINE.md
├── IMPLEMENTATION_PLAN.md
├── TODO.md
├── ATTRIBUTIONS.md
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

# Technology Stack

| Layer               | Technology                            |
| ------------------- | ------------------------------------- |
| Frontend            | React                                 |
| Language            | TypeScript                            |
| Build Tool          | Vite                                  |
| Routing             | React Router                          |
| UI                  | Tailwind CSS / Reusable UI Components |
| Backend             | FastAPI                               |
| Backend Language    | Python                                |
| Validation          | Pydantic                              |
| ORM                 | SQLAlchemy                            |
| Database            | PostgreSQL                            |
| Migrations          | Alembic                               |
| Authentication      | Password Hashing + Access Tokens      |
| API                 | REST                                  |
| Testing             | Python Backend Tests                  |
| Document Processing | Resume Processing & Matching          |

---

# Development Roadmap

The platform is developed incrementally through defined milestones.

```text
Milestone 1
Architecture & Foundation
        ↓
Milestone 2
Recruitment Workflow
        ↓
Milestone 3
Candidate & Resume Intelligence
        ↓
Milestone 4
Evaluation & Analytics
        ↓
Milestone 5
Production Readiness
```

### Milestone 1 — Architecture & Foundation

* Backend architecture
* Database schema
* Authentication
* Authorization
* API foundation
* Repository structure
* Migration setup

### Milestone 2 — Recruitment Workflow

* Requirements
* Jobs
* Candidates
* Applications
* Recruitment status tracking
* Core candidate workflows

### Milestone 3 — Candidate & Resume Intelligence

* Resume upload
* Resume processing
* Resume information extraction
* Candidate profile enrichment
* Job-specific matching
* Skill comparison
* Experience comparison
* Requirement comparison
* Explainable candidate evaluation

### Milestone 4 — Evaluation & Analytics

* Candidate evaluation views
* Screening support
* Shortlisting workflows
* Interview tracking
* Recruitment analytics
* Audit reporting

### Milestone 5 — Production Readiness

* Security hardening
* Performance improvements
* Test coverage
* Deployment preparation
* Monitoring
* Production configuration

---

# Current Development Status

The repository is being developed incrementally from an existing frontend prototype toward a complete recruitment management platform.

### Current Foundation

* React + Vite + TypeScript frontend
* FastAPI backend structure
* PostgreSQL-oriented database architecture
* SQLAlchemy models
* Alembic migrations
* Authentication foundation
* Role-based authorization
* Repository architecture
* Backend test structure
* Recruitment domain models
* Resume upload foundation

### Resume Intelligence Status

Resume Intelligence is being implemented progressively.

The system is designed so that candidate analysis is only displayed when the relevant resume has been uploaded, processed, and evaluated against a selected job.

No fabricated candidate scores or analysis results should be presented.

---

# Security & Environment

Environment-specific secrets must not be committed to the repository.

Local configuration should be maintained using environment files:

```text
.env
.env.local
```

Example configuration templates:

```text
.env.example
backend/.env.example
```

Sensitive values include:

* Database credentials
* Secret keys
* Authentication secrets
* External service credentials

These values should remain outside version control.

---

# Local Development

## Frontend

```bash
npm install
npm run dev
```

### Build Verification

```bash
npm run build
```

### TypeScript Verification

```bash
npx tsc --noEmit
```

---

## Backend

```bash
cd backend
python -m venv .venv
```

### Windows PowerShell

```powershell
.\.venv\Scripts\Activate.ps1
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Create Environment File

```powershell
Copy-Item .env.example .env
```

### Run Database Migrations

```bash
alembic upgrade head
```

### Start FastAPI

```bash
uvicorn app.main:app --reload
```

API documentation will be available through FastAPI's Swagger interface when the server is running.

---

# Documentation

The repository includes supporting project documentation.

| Document               | Purpose                                            |
| ---------------------- | -------------------------------------------------- |
| README.md              | Project overview and development guide             |
| CURRENT_BASELINE.md    | Existing system assessment and baseline            |
| IMPLEMENTATION_PLAN.md | Development milestones and implementation strategy |
| TODO.md                | Pending implementation tasks                       |
| ATTRIBUTIONS.md        | Third-party resources and attribution              |
| backend/README.md      | Backend setup and development information          |

---

# Development Principles

### Modular Architecture

Frontend, API, services, repositories, authentication, and persistence remain separated.

### Secure by Design

Authentication, authorization, password hashing, environment configuration, and server-side controls are treated as core requirements.

### Evidence-Based Evaluation

Candidate evaluation should be based on available candidate and job information rather than unsupported assumptions.

### Explainability

Candidate matching should provide understandable supporting information instead of exposing only an unexplained number.

### Incremental Development

New functionality is introduced through defined milestones instead of attempting to implement the complete platform at once.

### Maintainable Code

The codebase is organized into reusable components and focused modules to support long-term development.

---

# Future Scope

Future versions can extend the platform with:

* Advanced resume parsing
* Semantic skill matching
* Improved job-specific candidate ranking
* Explainable recommendation systems
* Automated screening assistance
* Advanced recruitment analytics
* Candidate communication workflows
* Interview scheduling
* Notification systems
* Recruiter dashboards
* Candidate-job compatibility analysis
* Production deployment
* Monitoring and observability

These capabilities can be introduced progressively without changing the fundamental architecture.

---

# Project Objective

The long-term objective is to build a structured and intelligent recruitment platform that connects:

```text
Requirements
      ↓
Jobs
      ↓
Candidates
      ↓
Applications
      ↓
Resumes
      ↓
Screening
      ↓
Interviews
      ↓
Evaluation
      ↓
Hiring Decisions
      ↓
Analytics
```

The platform combines traditional recruitment management with structured candidate-job analysis while maintaining **transparency, modularity, explainability, and evidence-based evaluation**.

The final system provides recruiters with a centralized environment where recruitment information is connected and major stages of the hiring workflow can be managed within a single platform.
