# Recruitment & Hiring Management Platform

This project is being transformed from a frontend prototype into a professional recruitment and hiring management SaaS application.

The intended workflow is:

Requirement -> Job -> Candidate -> Application -> Screening -> Shortlist -> Interview -> Decision -> Analytics

## Current Status

Milestone 1 is focused on architecture, backend, database schema, authentication, and server-side RBAC. The existing React + Vite + TypeScript frontend is preserved at the repository root while the new FastAPI backend is added under `backend/`.

Baseline findings are documented in `CURRENT_BASELINE.md`.

The milestone plan is documented in `IMPLEMENTATION_PLAN.md`.

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, Radix UI primitives.
- Backend: FastAPI, Pydantic, SQLAlchemy, Alembic.
- Database target: PostgreSQL.
- Authentication: bcrypt password hashing and expiring access tokens with server-side logout revocation.

## Local Frontend

```powershell
npm install
npm run dev
```

Build verification:

```powershell
npm run build
npx tsc --noEmit
npm audit
```

## Local Backend

The current machine did not have a usable Python runtime, PostgreSQL CLI, or Docker CLI on PATH during baseline capture. Install or repair those tools before running the backend locally.

Backend setup details are in `backend/README.md`.

Short version:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

## Environment

Copy `.env.example` and replace placeholder values. Do not commit real secrets.

## Known Limitations

- The frontend still contains localStorage-based prototype flows that will be replaced in later milestones.
- Frontend linting and tests are not configured yet.
- Backend tests are authored but could not be run on this machine because Python is not currently usable.
- Resume storage APIs are not implemented yet; local Data URL resume behavior remains until Milestone 3.
- Product identity cleanup is only partially complete.
