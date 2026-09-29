# Production deployment

This repository deploys the React/Vite frontend to Vercel and the FastAPI API to Render. The frontend uses BrowserRouter, so the root `vercel.json` provides the required SPA fallback.

## Vercel frontend

| Setting | Value |
| --- | --- |
| Root Directory | `.` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Set these Production environment variables. `VITE_*` values are public build-time values:

```env
VITE_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com
VITE_AUTH_LOGIN_PATH=/api/v1/auth/login
VITE_AUTH_REGISTER_PATH=/api/v1/auth/register
```

## Render backend

Create a Python 3 web service from this repository.

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Pre-Deploy Command | `alembic upgrade head` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Health Check Path | `/health` |

`backend/.python-version` pins Python 3.12.11. Set the following Render environment variables; do not upload a `.env` file with real values.

```env
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@INTERNAL_HOST:5432/DATABASE
SECRET_KEY=LONG_RANDOM_SECRET
ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_ALGORITHM=HS256
ENVIRONMENT=production
CORS_ORIGINS=https://YOUR-PROJECT.vercel.app,https://YOUR-CUSTOM-DOMAIN
```

Use the Render Postgres internal URL when the API and database are in the same Render region. Render supplies `postgresql://...`; change only that prefix to `postgresql+psycopg://...` for this Psycopg 3 / SQLAlchemy application. Never use `*` for `CORS_ORIGINS`.

## PostgreSQL and migrations

Create Render PostgreSQL in the same region as the API. The schema is managed only by Alembic:

```sh
cd backend
alembic upgrade head
```

Use the Render pre-deploy command when the service plan supports it. Do not put migrations in the web-service start command.

## Initial administrator

Public registration creates candidate accounts only. After `alembic upgrade head`, use a Render Shell or one-off, access-controlled command with temporary environment variables:

```sh
cd backend
INITIAL_ADMIN_EMAIL=admin@example.com \
INITIAL_ADMIN_NAME="Production Admin" \
INITIAL_ADMIN_PASSWORD='Use-a-long-unique-password-123!' \
python -m app.scripts.create_admin
```

The command refuses to overwrite an existing user and uses the API password policy. Remove `INITIAL_ADMIN_PASSWORD` immediately after it succeeds. It is never read by the web server and no public route can create administrators.

## Resume storage limitation

The schema has `resumes.storage_key`, but no object-storage provider or secure upload/download implementation exists yet. In remote mode, the frontend refuses resume uploads/applications with a selected resume so files are never silently stored in localStorage or on Render's ephemeral filesystem. Configure object storage and signed upload/download flows before enabling production resume submission.
