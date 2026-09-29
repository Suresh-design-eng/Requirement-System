# Current Baseline

Date: 2026-08-26

## Project Shape

- Current app: React + Vite + TypeScript frontend prototype.
- Current structure: flat frontend at repository root with source under `src/`.
- Backend: none found.
- Database: none found.
- Test framework: none configured.
- UI foundation: existing shadcn/Radix-style primitives in `src/app/components/ui`, Tailwind CSS v4, lucide icons, motion, recharts.
- State management: a single `AppContext` stores users, requirements, jobs, applications, session state, theme, and resume data in browser `localStorage`.

## Dependency Verification

Command: `npm install`

Status: passed.

Output summary:

- Dependencies were already up to date.
- 218 npm packages audited.
- 0 vulnerabilities reported.

## Build Status

Command: `npm run build`

Initial sandboxed run: failed with `spawn EPERM` while Vite/esbuild loaded config.

Escalated verification run: passed.

Output summary:

- Vite v6.3.5 built successfully.
- 2105 modules transformed.
- Output written to `dist/`.
- Warning: generated JS chunk is larger than 500 kB after minification.

## TypeScript Status

Command: `npx tsc --noEmit`

Status: passed.

## Lint Status

Command: `npm run lint`

Status: not available.

Output summary:

- npm reported `Missing script: "lint"`.

## Test Status

Command: `npm test`

Status: not available.

Output summary:

- npm reported `Missing script: "test"`.

## Dependency Audit

Command: `npm audit`

Status: passed.

Output summary:

- 0 vulnerabilities reported.

## Local Runtime Checks

- Python: not usable. `python --version` and `py --version` invoked Windows Python Manager, attempted to install Python 3.14.6, and failed because it could not access the runtime index.
- PostgreSQL CLI: not found on PATH. `psql --version` failed.
- Docker CLI: not found on PATH. `docker --version` failed.
- Git CLI: not found on PATH. `git status --short` failed.

## Existing Routes

- `/` - landing page.
- `/login` - generic sign in.
- `/register` - candidate registration.
- `/admin-login` - admin sign in wrapper.
- `/candidate-login` - candidate sign in wrapper.
- `/dashboard` - admin dashboard or candidate dashboard based on role.
- `/jobs` - admin job board or candidate job listing based on role.
- `/jobs/:id` - candidate job detail and application.
- `/applications` - candidate applications.
- `/applications/rejected` - candidate rejected/not-interested jobs.
- `/resume` - candidate resume management.
- `/requirements` - admin requirements table.
- `/requirements/:id` - admin requirement detail.
- `/create-requirement` - admin create requirement form.
- `/users` - admin candidate directory and pipeline.
- `/map` - admin-only map page.
- `*` - not found page.

## Existing Features Worth Preserving

- Candidate job browsing and job detail flow.
- Candidate application form with validation and confirmation dialog.
- Skill picker and profile autofill.
- Candidate application draft support.
- Basic candidate profile/settings and resume page.
- Basic admin job create/edit/delete interface.
- Basic candidate pipeline with search and filtering.
- Basic interview scheduling fields.
- Existing UI primitives that can become a shared design system.

## Known Issues

### Security

- Local auth stores plaintext passwords in browser storage.
- Session tokens are generated in frontend code and stored in `localStorage`.
- RBAC is frontend-only and only distinguishes `admin` from `user`.
- Candidate resumes are converted to Data URLs and stored in browser storage.
- Application drafts can also store resume Data URLs in `localStorage`.
- Demo credentials are visible in the login UI and source code.
- Resume preview/download opens browser-stored URLs directly.
- Backend authorization, audit logging, rate limiting, CSRF strategy, secure cookies, and file access control are absent.

### Product And Workflow

- Product naming is inconsistent: `Requirement System`, `RequirementSys`, `Untitled`, generic requirement-management copy, and hiring/recruitment copy are mixed.
- Requirement workflow currently uses `pending`, `in_progress`, `completed`, `rejected`, not the requested hiring workflow of `draft`, `review`, `approved`, `published`, `closed`.
- Application statuses do not distinguish candidate `Not Interested` from recruiter `Rejected`.
- Hiring roles are incomplete: no separate recruiter, hiring manager, candidate, admin model.
- Requirement fields are too thin for recruiting needs.
- Job management lacks publish/unpublish, close, duplicate, pagination, and full status model.

### Broken Or Misleading Functionality

- Map page is a decorative SVG coordinate approximation, not a real map or reliable interview/location experience.
- Requirement attachment UI is present but no secure upload implementation exists.
- Requirement detail edit button is visible but has no edit behavior.
- Browser `confirm()` is used for destructive actions.
- AI/resume insights are rule-based local heuristics, not AI-assisted analysis.

### Maintainability

- Most app behavior is concentrated in `AppContext.tsx`.
- Data normalization, auth, persistence, and workflow transitions are mixed in the same frontend context.
- `readFileAsDataUrl` is duplicated in multiple files.
- There is no API client boundary for jobs, requirements, applications, files, or users.
- There are no automated tests or lint configuration.

### UI And Accessibility

- Visual direction mixes dark premium landing pages, gradient dashboards, and shadcn primitives without a strict design system.
- Cards and rounded containers are overused.
- Some icon-only buttons do not have accessible names.
- Tables rely on horizontal scroll on smaller screens.
- Several dialogs/overlays are custom and need focus/semantics review.
- Some text contains mojibake characters such as `Â·`.

## Baseline Conclusion

The frontend has useful recruitment workflow prototypes, especially candidate application and pipeline screens. The critical gap is the absence of a real backend, database schema, secure authentication, server-side RBAC, secure resume storage, and tests. Milestone 1 should establish backend architecture, database models, authentication, RBAC dependencies, migration scaffolding, environment documentation, and backend tests before deeper frontend rewiring.
