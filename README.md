# AI-Assist Enterprise Ticket & Task Manager

A full-stack, enterprise-grade ticket and task management system with AI-assisted workflows, SaaS integrations, and scalable architecture patterns.

**Author:** TanQHoang — [hoangquoctan.1996@gmail.com](mailto:hoangquoctan.1996@gmail.com)

---

## What This Is

A production-like system demonstrating how modern enterprise software is designed and built — combining real-world tooling, async event-driven processing, AI automation, and third-party integrations into a cohesive monorepo platform.

---

## Live Features

| Feature | Details |
|---|---|
| **Ticket management** | Create, edit, filter, soft-delete; status workflow OPEN → IN_PROGRESS → DONE → CLOSED with transition guards |
| **Kanban board** | Drag-and-drop across columns (`@dnd-kit`), optimistic updates, invalid-target dimming, DragOverlay preview |
| **Task checklist** | Per-ticket subtasks with progress bar, checkbox toggle (optimistic), add/delete inline |
| **Assignment** | Assignee selector on create/edit modals; "Assigned to me" quick-filter; `GET /users/assignable` |
| **Deadlines** | Due date picker; overdue detection (red highlight on list + detail + Kanban card); `?overdue=true` API filter |
| **Search & filters** | Debounced full-text search on title+description; filter by status, priority, overdue |
| **Authentication** | Auth0 JWT (RS256); auto-upsert user on login; RBAC (ADMIN / MANAGER / MEMBER) |
| **Deployment** | Vercel (frontend) + Render (backend); GitHub Actions CI: lint → typecheck → build → deploy |

---

## Core Capabilities

- **Ticket & Task Management** — CRUD, Kanban board, status workflows with enforced transitions, assignments and deadlines
- **AI-Assisted Automation** *(Phase 3)* — auto-categorization, priority scoring, ticket summarization via async queue processing
- **Notifications** *(Phase 2.4)* — Slack webhooks, email via SendGrid on ticket events
- **Authentication & Authorization** — JWT, Auth0, RBAC guards on all protected endpoints
- **Audit Logging** *(Phase 2.6)* — full activity trail for enterprise compliance
- **Async Queue Processing** *(Phase 3)* — BullMQ + Redis decouples heavy AI jobs from request lifecycle

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
│   ├── web/                    # Next.js 14 frontend
│   │   ├── app/(protected)/    # Auth-guarded pages (dashboard, tickets)
│   │   ├── features/tickets/   # Ticket components, hooks, Kanban board
│   │   └── services/           # API client wrappers (tickets, tasks, users)
│   └── api/                    # NestJS backend
│       └── src/modules/
│           ├── auth/           # JWT strategy, Auth0 sync
│           ├── users/          # User CRUD + assignable endpoint
│           ├── tickets/        # Ticket CRUD + filters
│           └── tasks/          # Task CRUD per ticket
├── packages/
│   ├── ui/           # Shared React components (Modal, Badge, etc.)
│   ├── types/        # Shared TypeScript types & enums
│   ├── utils/        # Shared utilities (formatDate, isOverdue, cn)
│   └── config/       # Shared eslint / tsconfig presets
├── infrastructure/   # Docker Compose, Dockerfile, K8s manifests
├── docs/             # Architecture, API flow, AI flow, Auth0 setup guide
├── .claude/          # AI development system (agents, skills, memory)
└── scripts/          # Dev & ops utility scripts
```

---

## Roadmap

| Phase | Status | Focus |
|---|---|---|
| Phase 0 — Scaffolding | ✅ Done | Monorepo, configs, directory structure |
| Phase 1.1–1.5 — Foundation | ✅ Done | Next.js, NestJS, Prisma, Auth0 |
| Phase 1.6–1.9 — MVP Completion | ✅ Done | Users/Tickets CRUD, Frontend UI, Deployment |
| Phase 2.1 — Kanban Board | ✅ Done | Drag-and-drop board with optimistic updates |
| Phase 2.2 — Tasks | ✅ Done | Per-ticket task checklist with progress tracking |
| Phase 2.3 — Assignment & Deadlines | ✅ Done | Assignee selector, overdue filters, due date indicators |
| Phase 2.4 — Notifications | 🔄 Next | Slack webhooks + SendGrid email |
| Phase 2.5 — Search | 🔲 Planned | Full-text search across tickets |
| Phase 2.6 — Audit Log | 🔲 Planned | Activity trail, compliance logging |
| Phase 3 — AI Layer | 🔲 Planned | BullMQ + Hugging Face auto-processing |
| Phase 4 — Integrations | 🔲 Planned | Google Calendar, File Uploads |
| Enterprise Practices | 🔄 Ongoing | CI/CD, RBAC, Redis cache, Observability |

See `TODO.md` for detailed task breakdown.

---

## License

MIT
