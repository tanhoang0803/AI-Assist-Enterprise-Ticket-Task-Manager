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
| **Notifications** | Slack `chat.postMessage` on ticket created/assigned/status-changed; SendGrid HTML email on assignment |
| **Audit log** | Every ticket + task mutation recorded (`CREATED`, `UPDATED`, `STATUS_CHANGED`, `ASSIGNED`, `DELETED`); activity panel on ticket detail page |
| **AI analysis** | Auto-triggered on ticket create via BullMQ; Hugging Face summarization + zero-shot category/priority classification; Re-analyze button + live polling in UI |
| **Authentication** | Auth0 JWT (RS256); auto-upsert user on login; RBAC (ADMIN / MANAGER / MEMBER) |
| **Deployment** | Vercel (frontend) + Render (backend); GitHub Actions CI: lint → typecheck → build → deploy |

---

## Core Capabilities

- **Ticket & Task Management** — CRUD, Kanban board, status workflows with enforced transitions, assignments and deadlines
- **AI-Assisted Automation** *(Phase 3)* — auto-categorization, priority scoring, ticket summarization via async queue processing
- **Notifications** — Slack webhooks + SendGrid email on ticket created/assigned/status-changed
- **Authentication & Authorization** — JWT, Auth0, RBAC guards on all protected endpoints
- **Audit Logging** — full activity trail (ticket + task mutations); `GET /logs`; activity panel in ticket detail
- **Async Queue Processing** — BullMQ + Redis decouples AI jobs from the request lifecycle; 3-retry exponential backoff; Bull Board monitoring at `/queues`
- **AI Analysis** — Hugging Face summarization + zero-shot classification auto-triggered on ticket create; manual re-trigger via `POST /ai/analyze/:id`

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                │
│          App Router · TypeScript · TailwindCSS       │
└──────────────────────┬──────────────────────────────┘
                       │ REST (axios + React Query)
┌──────────────────────▼──────────────────────────────┐
│               Backend (NestJS)                       │
│   Auth │ Users │ Tickets │ Tasks   ← live            │
│   Notifications │ Logs │ AI        ← live            │
└──────┬───────────────────────────┬──────────────────┘
       │                           │
┌──────▼──────┐           ┌────────▼────────┐
│ PostgreSQL  │           │  Redis + BullMQ  │
│  (Supabase) │           │  (Phase 3)       │
└─────────────┘           └────────┬─────────┘
                                   │
                          ┌────────▼─────────┐
                          │   AI Layer        │
                          │ Hugging Face /    │
                          │ OpenAI (Phase 3)  │
                          └──────────────────┘
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

**Local dev services:**

| Service | URL |
|---|---|
| Frontend (Next.js) | `http://localhost:3000` |
| API (NestJS) | `http://localhost:4000` |
| Swagger UI | `http://localhost:4000/api/docs` |
| Prisma Studio | `http://localhost:5555` |

**Deployed (production):**

| Service | Platform |
|---|---|
| Frontend | Vercel — auto-deploys on push to `main` |
| Backend | Render — deploys via GitHub Actions deploy hook |
| Database | Supabase PostgreSQL (pooler + direct URL) |

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
| Phase 2.4 — Notifications | ✅ Done | Slack webhooks + SendGrid email |
| Phase 2.5 — Search | ✅ Done | ILIKE search on title+description, debounced UI |
| Phase 2.6 — Audit Log | ✅ Done | Activity trail, `GET /logs`, ticket detail activity panel |
| Phase 3 — AI Layer | ✅ Done | BullMQ queue, Hugging Face summarization + classification, live polling UI |
| Phase 4 — Integrations | 🔲 Next | Google Calendar, File Uploads |
| Enterprise Practices | 🔄 Ongoing | CI/CD, RBAC, Redis cache, Observability |

See `TODO.md` for detailed task breakdown.

---

## License

MIT
