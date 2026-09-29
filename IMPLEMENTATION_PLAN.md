# Implementation Plan

## Product Identity

Target identity: Recruitment & Hiring Management Platform.

Primary workflow:

Requirement -> Job -> Candidate -> Application -> Screening -> Shortlist -> Interview -> Decision -> Analytics

Supported roles:

- Candidate
- Recruiter
- Hiring Manager
- Admin

## Milestone 1: Architecture, Backend, Database, Authentication

Goals:

- Add a real `backend/` FastAPI service without deleting the existing frontend.
- Establish clean backend package boundaries for API, auth, core config, database, models, schemas, services, repositories, utilities, tests, and Alembic migrations.
- Define PostgreSQL SQLAlchemy models for the requested recruiting entities.
- Add Alembic migration scaffolding and an initial schema migration.
- Implement registration, login, logout, current-user endpoint, password hashing, token expiration, auth dependencies, and server-side RBAC.
- Add backend tests for auth and RBAC using SQLite test storage where possible.
- Document local database requirements because Python, PostgreSQL, and Docker are not currently usable on PATH.

Verification:

- `npm run build`
- `npx tsc --noEmit`
- `npm audit`
- Backend import/test command if Python becomes available
- Migration configuration sanity check

## Milestone 2: Requirements, Jobs, Candidates, Applications API Integration

Goals:

- Add backend APIs for requirements, jobs, candidates, and applications.
- Move frontend data access behind API client modules.
- Keep local demo behavior only as an explicit fallback, not as the default security model.
- Implement server-side validation, status transitions, duplicate application prevention, search/filter/sort/pagination, and role-specific responses.
- Rename product language consistently across browser metadata, navigation, pages, empty states, README, and dashboard headings.

## Milestone 3: Resume Storage, Interviews, Comments, Audit Logs

Goals:

- Replace localStorage resume storage with secure backend file upload.
- Add file type/size validation, safe filenames, storage abstraction, and access-control checks.
- Add interview scheduling, feedback, status transitions, comment APIs, and mutation audit logging.
- Remove fake attachment and map functionality unless it can be backed by real behavior.

## Milestone 4: Dashboard, Analytics, Search, Filter

Goals:

- Replace count-only dashboard with role-aware hiring analytics.
- Add hiring funnel, upcoming interviews, stalled candidates, low-volume jobs, time-to-hire, and conversion metrics from persisted data.
- Add robust search/filter/sort/pagination to jobs, candidates, and requirements.

## Milestone 5: Design System, Responsive Redesign, Accessibility

Goals:

- Consolidate UI into reusable SaaS components.
- Reduce decorative gradients and oversized dashboard typography.
- Improve focus states, labels, dialogs, tables, icon button names, mobile layouts, and empty/error/loading states.
- Preserve working application and pipeline flows while refining layout and density.

## Milestone 6: AI Assistance

Goals:

- Add useful, clearly labeled AI-assisted workflows only after core data is real.
- Requirement quality analysis.
- Resume-to-job matching as recommendation support, not hiring decisions.
- Duplicate requirement detection.
- Missing information detection.
- Avoid chatbot functionality unless there is a concrete workflow need.

## Milestone 7: Testing, Security Audit, Documentation

Goals:

- Add backend and frontend tests for critical flows.
- Run a second security audit.
- Replace README with architecture, setup, API, auth, database, testing, security, limitations, and future improvements.
- Add realistic synthetic seed data.

## Stop Conditions

After each milestone:

- Run available tests.
- Run TypeScript check.
- Run frontend build.
- Run dependency audit.
- Report failures explicitly.
- Do not continue if a critical regression exists.
