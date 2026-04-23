# AI-Assist Enterprise Ticket & Task Manager

A full-stack, enterprise-grade ticket and task management system with AI-assisted workflows, SaaS integrations, and scalable architecture patterns.

**Author:** TanQHoang — [hoangquoctan.1996@gmail.com](mailto:hoangquoctan.1996@gmail.com)

---

## What This Is

A production-like system demonstrating how modern enterprise software is designed and built — combining real-world tooling, async event-driven processing, AI automation, and third-party integrations into a cohesive monorepo platform.

---

## Core Capabilities

- **Ticket & Task Management** — CRUD, Kanban board, status workflows (Open → In Progress → Done), assignments and deadlines
- **AI-Assisted Automation** — auto-categorization, priority scoring, ticket summarization via async queue processing
- **Real-Time Notifications** — Slack webhooks, email via SendGrid
- **Authentication & Authorization** — JWT, Auth0, RBAC
- **Audit Logging** — full activity trail for enterprise compliance feel
- **Async Queue Processing** — BullMQ + Redis decouples heavy AI jobs from request lifecycle

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                │
│          App Router · TypeScript · TailwindCSS       │
└──────────────────────┬──────────────────────────────┘
                       │ REST / tRPC
┌──────────────────────▼──────────────────────────────┐
│               Backend (NestJS)                       │
│   Auth │ Users │ Tickets │ Tasks │ Notifications    │
│   AI Module │ Workflow │ Audit Logs                  │
└──────┬───────────────────────────┬──────────────────┘
       │                           │
┌──────▼──────┐           ┌────────▼────────┐
│ PostgreSQL  │           │  Redis + BullMQ  │
│  (Supabase) │           │  (Async Queue)   │
└─────────────┘           └────────┬─────────┘
                                   │
                          ┌────────▼─────────┐
                          │   AI Layer        │
                          │ Hugging Face /    │
                          │ OpenAI            │
                          └──────────────────┘
```

---

## AI Processing Flow

```
User creates ticket → NestJS → BullMQ Queue → AI Processor
   → Auto-categorize → Score priority → Summarize
   → Update DB → Trigger Slack/Email notification
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14, TypeScript, TailwindCSS, Zustand, React Query |
| Backend | NestJS, TypeScript, Prisma |
| Database | PostgreSQL (Supabase) |
| Queue | BullMQ + Redis |
| Auth | Auth0 |
| AI | Hugging Face Inference API |
| Notifications | Slack API + SendGrid |
| Scheduling | Google Calendar API |
| DevOps | Docker, GitHub Actions |
| Monorepo | pnpm + Turborepo |

---

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker & Docker Compose
- PostgreSQL (or Supabase account)
- Redis (via Docker or Upstash)

### Setup

```bash
# Clone and install
git clone https://github.com/tanhoang0803/AI-Assist-Enterprise-Ticket-Task-Manager.git
cd ticket-task_manager
pnpm install

# Configure environment
cp .env.example .env.local
# Fill in AUTH0_* and other secrets in .env.local
# See docs/auth0-setup.md for Auth0 tenant setup guide

# Start infrastructure (Postgres + Redis via Docker)
pnpm docker:up

# Run database migrations + seed
pnpm db:migrate
pnpm db:seed

# Start dev servers
pnpm dev
```

| Service | URL |
|---|---|
| Frontend (Next.js) | `http://localhost:3000` |
| API (NestJS) | `http://localhost:4000` |
| Swagger UI | `http://localhost:4000/api/docs` |
| Prisma Studio | `http://localhost:5555` |

> **Note:** Docker maps Postgres to port `5434` and Redis to port `6380` to avoid conflicts with local installations. The `.env.local` `DATABASE_URL` must use port `5434`.

> **Auth0 Setup Required:** Create an Auth0 tenant and fill in `AUTH0_*` values in `.env.local` before protected endpoints will work. See [docs/auth0-setup.md](docs/auth0-setup.md).

---

## Project Structure

```
ticket-task_manager/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── ui/           # Shared UI components
│   ├── types/        # Shared TypeScript types
│   ├── utils/        # Shared utilities
│   └── config/       # Shared lint/tsconfig
├── infrastructure/   # Docker, CI/CD, K8s
├── docs/             # Architecture docs
├── .claude/          # AI development tooling
└── scripts/          # Dev scripts
```

---

## Roadmap

| Phase | Status | Focus |
|---|---|---|
| Phase 0 — Scaffolding | ✅ Done | Monorepo, configs, directory structure |
| Phase 1.1–1.5 — Foundation | ✅ Done | Next.js, NestJS, Prisma, Auth0 |
| Phase 1.6–1.9 — MVP Completion | 🔄 In Progress | Users/Tickets CRUD, Frontend UI, Deployment |
| Phase 2 — Core Product | 🔲 Planned | Kanban, Notifications, Search, Audit |
| Phase 3 — AI Layer | 🔲 Planned | BullMQ + AI auto-processing |
| Phase 4 — Integrations | 🔲 Planned | Google Calendar, File Uploads |
| Enterprise Practices | 🔄 Ongoing | CI/CD, RBAC, Redis cache, Observability |

See `TODO.md` for detailed task breakdown.

---

## License

MIT
