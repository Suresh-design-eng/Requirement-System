# Backend

FastAPI backend for the Recruitment & Hiring Management Platform.

## Current Machine Baseline

On 2026-08-26, this workspace did not have a usable Python runtime, PostgreSQL CLI, Docker CLI, or Git CLI on PATH. The backend files are scaffolded and ready, but local execution requires installing or repairing those tools first.

## Requirements

- Python 3.12 or newer.
- PostgreSQL 15 or newer.
- Optional: Docker Desktop if you want to run PostgreSQL through `docker compose`.

## Local Setup

From the repository root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `.env` and set a real local `DATABASE_URL` and `SECRET_KEY`.

If Docker is installed, the root `docker-compose.yml` can run PostgreSQL:

```powershell
docker compose up -d db
```

This machine does not currently have Docker available, so PostgreSQL must be installed separately or Docker must be added before that command will work.

## Database

Run migrations from `backend/`:

```powershell
alembic upgrade head
```

The initial schema includes:

- users
- roles
- companies
- requirements
- jobs
- candidates
- resumes
- applications
- application_status_history
- interviews
- interview_feedback
- comments
- notifications
- audit_logs
- skills
- candidate_skills
- job_skills
- token_revocations

## Running

```powershell
uvicorn app.main:app --reload
```

Health checks:

- `GET /health`
- `GET /api/v1/health`

Auth endpoints:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/users/me`

## Security Notes

- Passwords are hashed with bcrypt through Passlib.
- Public registration creates candidate accounts only.
- Access tokens include expiration and a token identifier.
- Logout records token revocation server-side.
- Role checks are enforced in backend dependencies.
- The current logout design revokes access tokens stored by their JWT ID. Future refresh-token support should use rotating refresh tokens stored server-side.
