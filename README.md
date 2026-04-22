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
git clone <repo-url>
cd ticket-task_manager
pnpm install

# Configure environment
cp .env.example .env.local
# Fill in values in .env.local

# Start infrastructure (Postgres + Redis)
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# Run database migrations
pnpm --filter api prisma:migrate

# Start dev servers
pnpm dev
```

Frontend runs at `http://localhost:3000`  
API runs at `http://localhost:4000`  
Prisma Studio at `http://localhost:5555`

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
| Phase 1 — MVP Core | 🔴 In Progress | Next.js + NestJS + Auth + DB |
| Phase 2 — Core Product | 🔲 Planned | Kanban, Notifications, Search, Audit |
| Phase 3 — AI Layer | 🔲 Planned | Queue + AI auto-processing |
| Phase 4 — Integrations | 🔲 Planned | Google Calendar, File Uploads |
| Enterprise Practices | 🔲 Ongoing | CI/CD, Docker, RBAC, Redis cache |

See `TODO.md` for detailed task breakdown.

---

## License

MIT
