# Recruitment & Hiring Management Platform

A professional recruitment and hiring management platform designed to manage the complete hiring workflow from requirement creation to candidate selection and analytics.

> **Requirement → Job → Candidate → Application → Screening → Shortlist → Interview → Decision → Analytics**

---

## Overview

This project is being developed as a full-stack recruitment and hiring management system.

The existing React + Vite + TypeScript frontend is being extended with a FastAPI backend, database layer, authentication, authorization, and recruitment workflows.

The goal is to evolve the current frontend prototype into a structured and scalable recruitment management platform.

---

## Architecture

```text
┌──────────────────────────────┐
│       React Frontend         │
│   Vite + TypeScript          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│        REST API              │
│          FastAPI             │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       Service Layer          │
│ Authentication • Business    │
│ Logic • Recruitment          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      Repository Layer        │
│       Data Access            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         PostgreSQL           │
└──────────────────────────────┘
Project Structure

The repository is organized into two main application layers:

Directory	Purpose
src/	React frontend and user interface
backend/	FastAPI backend and application services
backend/app/models/	Database models
backend/app/schemas/	API request and response schemas
backend/app/services/	Business logic
backend/app/repositories/	Database access
backend/app/api/	API routes
backend/app/auth/	Authentication and authorization
backend/alembic/	Database migrations
backend/tests/	Backend tests

Project documentation is maintained through:

CURRENT_BASELINE.md — Existing system analysis
IMPLEMENTATION_PLAN.md — Development plan
TODO.md — Remaining tasks
ATTRIBUTIONS.md — Third-party resources and credits
Development Roadmap
Milestone 1 — Foundation
Backend architecture
Database schema
Authentication
Server-side RBAC
API foundation
Initial testing structure
Milestone 2 — Recruitment Core
Requirements
Jobs
Candidates
Applications
Candidate management
Recruitment workflows
Milestone 3 — Candidate Experience
Resume management
Candidate profile
Applications tracking
Interview workflow
Notifications
Milestone 4 — Recruitment Operations
Admin dashboard
Job management
Candidate screening
Interview management
Audit logging
Recruitment analytics
Milestone 5 — Production Readiness
Frontend/backend integration
Testing improvements
Security hardening
Database optimization
Deployment preparation
Tech Stack
Frontend
React
Vite
TypeScript
Tailwind CSS
Radix UI
Backend
FastAPI
Pydantic
SQLAlchemy
Alembic
Python
Database
PostgreSQL
Authentication
bcrypt password hashing
Expiring access tokens
Server-side logout revocation
Getting Started
Frontend
npm install
npm run dev

Build verification:

npm run build
npx tsc --noEmit
Backend
cd backend
python -m venv .venv

Activate the environment:

.\.venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt

Create environment configuration:

Copy-Item .env.example .env

Run database migrations:

alembic upgrade head

Start the API:

uvicorn app.main:app --reload
Environment

Create the required .env files from the provided examples.

.env.example
backend/.env.example

Do not commit real passwords, tokens, database credentials, or other secrets.

Current Status

Milestone 1 — Foundation

The project currently contains:

React + Vite + TypeScript frontend
FastAPI backend foundation
PostgreSQL database architecture
SQLAlchemy models
Alembic migrations
Authentication foundation
Role-based access control structure
Backend test structure
Recruitment domain models

The frontend prototype is being progressively connected to the backend architecture.

Development Principles
Keep frontend and backend responsibilities separated.
Use service and repository layers for backend logic.
Keep authentication and authorization server-side.
Maintain database migrations through Alembic.
Avoid committing generated files and secrets.
Build the system incrementally through defined milestones.
Documentation

Additional project documentation is available in the repository:

CURRENT_BASELINE.md
IMPLEMENTATION_PLAN.md
TODO.md
ATTRIBUTIONS.md
backend/README.md
Project Goal

The long-term goal is to develop a complete recruitment management platform that provides a structured workflow for managing requirements, jobs, candidates, applications, interviews, decisions, and recruitment analytics within a single system.

License

This project is currently being developed as an academic software project.


### இது தான் நான் recommend பண்ணுற format

இதுல முக்கியமான advantage:

**GitHub open பண்ணும்போது:**

```text
Requirement-System
│
├── backend/
├── src/
├── README.md
├── CURRENT_BASELINE.md
├── IMPLEMENTATION_PLAN.md
├── TODO.md
├── package.json
└── ...
