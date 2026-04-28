# CLAUDE.md — AI-Assist Enterprise Ticket & Task Manager

## Project Identity

**Name:** AI-Assist Enterprise Ticket & Task Manager  
**Author:** TanQHoang (hoangquoctan.1996@gmail.com)  
**Monorepo:** pnpm workspaces + Turborepo  
**Architecture:** Modular monolith (NestJS backend) + Next.js (App Router) frontend  

---

## Repository Layout

```
ticket-task_manager/
├── apps/
│   ├── web/                    # Next.js 14 · TypeScript · TailwindCSS · App Router
│   │   ├── app/(protected)/    # Auth-guarded pages: dashboard (Kanban), tickets, tickets/[id]
│   │   ├── features/tickets/   # Components, hooks (useTickets, useTasks, useKanban, useUsers, useLogs)
│   │   └── services/           # API wrappers: tickets.ts, tasks.ts, users.ts, logs.ts, ai.ts, api.ts
│   └── api/                    # NestJS · TypeScript · Prisma · BullMQ
│       ├── prisma/             # schema.prisma, migrations, seed.ts
│       └── src/
│           ├── queue/          # QueueModule — BullMQ Redis connection + Bull Board UI
│           ├── modules/        # auth, users, tickets, tasks, notifications, logs, ai, health
│           ├── common/         # guards, decorators, interceptors, filters
│           ├── config/         # configuration.ts, Joi validation schema
│           └── database/       # PrismaModule, PrismaService
├── packages/
│   ├── ui/           # Shared React components (Modal, Badge, Button, Card, Input)
│   ├── types/        # Shared TypeScript types & enums (Ticket, Task, User, enums)
│   ├── utils/        # cn, formatDate, formatDateTime, isOverdue, timeAgo
│   └── config/       # Shared eslint / tsconfig presets
├── infrastructure/
│   ├── docker/       # docker-compose.yml, Dockerfile
│   └── k8s/          # Optional Kubernetes manifests
├── docs/             # architecture.md, api-flow.md, ai-flow.md, auth0-setup.md, roadmap.md
├── .github/workflows/# ci.yml — lint → typecheck → build → deploy
├── render.yaml       # Render web service config
├── start.sh          # Render startup: prisma migrate deploy + node dist/main
├── .claude/          # AI development system (agents, skills, commands, hooks, memory)
└── scripts/          # Dev & ops utility scripts
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, TailwindCSS, Zustand, React Query |
| Backend | NestJS, TypeScript, Prisma ORM |
| Database | PostgreSQL (Supabase for hosted) |
| Queue | BullMQ + Redis |
| Auth | Auth0 (primary) / Firebase Auth (alt) |
| AI | Hugging Face Inference API / OpenAI (fallback) |
| Notifications | Slack API, SendGrid |
| Scheduling | Google Calendar API |
| DevOps | Docker, GitHub Actions, optional Kubernetes |
| Monorepo | pnpm workspaces + Turborepo |

---

## Backend Module Map (`apps/api/src/modules/`)

| Module | Status | Responsibility |
|---|---|---|
| `auth` | ✅ Live | JWT validation, Auth0 integration, RBAC guards |
| `users` | ✅ Live | User CRUD, roles, profile, `GET /users/assignable` |
| `tickets` | ✅ Live | Ticket lifecycle, status transitions, assignment, overdue filters |
| `tasks` | ✅ Live | Per-ticket task CRUD, checklist |
| `health` | ✅ Live | Memory heap + Prisma ping health check |
| `notifications` | ✅ Live | Slack webhook (chat.postMessage), SendGrid email on assignment |
| `logs` | ✅ Live | Audit trail (CREATED/UPDATED/STATUS_CHANGED/ASSIGNED/DELETED), `GET /logs` |
| `ai` | ✅ Live | BullMQ producer/processor, Hugging Face summarization + zero-shot classification, `POST /ai/analyze/:id` |
| `workflow` | 🔲 Phase 4+ | Automation rules, triggers |

---

## Live API Endpoints (quick reference)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Health check |
| GET | `/api/auth/profile` | JWT | Current user from DB |
| GET | `/api/users/me` | JWT | Own profile |
| GET | `/api/users/assignable` | JWT | id+name+avatar list for dropdowns |
| GET | `/api/users` | ADMIN | All users |
| PATCH | `/api/users/:id` | JWT | Update own profile (ADMIN: any) |
| GET | `/api/tickets` | JWT | List with filters + pagination |
| POST | `/api/tickets` | JWT | Create ticket |
| GET | `/api/tickets/:id` | JWT | Ticket detail |
| PATCH | `/api/tickets/:id` | JWT | Update (reporter/assignee/ADMIN/MANAGER) |
| DELETE | `/api/tickets/:id` | ADMIN/MANAGER | Soft delete |
| GET | `/api/tickets/:id/tasks` | JWT | Task list for ticket |
| POST | `/api/tickets/:id/tasks` | JWT | Create task |
| PATCH | `/api/tasks/:id` | JWT | Update task title/status |
| DELETE | `/api/tasks/:id` | JWT | Delete task |
| GET | `/api/logs` | JWT | Paginated audit log (filter by entityType + entityId) |
| POST | `/api/ai/analyze/:id` | JWT | Manually trigger AI analysis for a ticket |

---

## AI Processing Flow *(Phase 3 — planned)*

```
User creates ticket
      ↓
NestJS Tickets Module
      ↓
BullMQ Producer (queue/producers/ticket.producer.ts)
      ↓
Redis Queue
      ↓
BullMQ Processor (queue/processors/ai.processor.ts)
      ↓
AI Module → Hugging Face / OpenAI
      → Auto-categorization
      → Priority scoring
      → Ticket summarization
      ↓
Database updated (Prisma)
      ↓
Notification triggered (Slack / Email)
```

---

## Environment Files

- `.env.example` — template, committed to git
- `.env.local` — local dev secrets, **never committed**
- `infrastructure/env/.env.example` — infra-level example

Required env vars: see `.env.example` for full list.

---

## Development Commands

```bash
# Install all dependencies
pnpm install

# Run all apps in dev mode
pnpm dev

# Run specific app
pnpm --filter web dev
pnpm --filter api dev

# Build all
pnpm build

# Build shared packages (required before building apps)
pnpm --filter @repo/types build
pnpm --filter @repo/utils build

# Run tests
pnpm test

# Lint + type-check
pnpm lint
pnpm typecheck
pnpm --filter api typecheck
pnpm --filter web typecheck

# Docker infrastructure (Postgres :5434, Redis :6380)
pnpm docker:up
pnpm docker:down

# Database (dotenv-cli auto-loads .env.local)
pnpm db:migrate      # prisma migrate dev
pnpm db:seed         # prisma db seed
pnpm db:studio       # prisma studio at :5555
pnpm --filter api prisma:generate   # regenerate Prisma client after schema changes
```

> **Ports (non-default to avoid local conflicts)**
> - PostgreSQL: `localhost:5434` (Docker host port)
> - Redis: `localhost:6380` (Docker host port)
> - Next.js frontend: `http://localhost:3000`
> - NestJS API: `http://localhost:4000`
> - Swagger UI: `http://localhost:4000/api/docs` (dev only)

---

## Claude Code Conventions

### When adding a NestJS module
Use `/generate-module <name>` — see `.claude/commands/generate-module.md`.

### When working on frontend
See `.claude/agents/frontend-agent.md` for component and routing conventions.

### When working on backend
See `.claude/agents/backend-agent.md` for NestJS patterns and DI conventions.

### When touching AI/queue logic
See `.claude/skills/ai-integration.md` for queue job structure and AI provider patterns.

---

## Code Standards

- **TypeScript strict mode** everywhere — no `any` without justification
- **No barrel re-export hell** — import from the actual file
- **Prisma is the single source of truth** for DB schema
- **DTOs validate all input** at controller boundary (class-validator)
- **All async jobs** must be idempotent — processors must handle retry safely
- **Secrets** only via environment variables — never hardcoded
- **RBAC guards** on every protected endpoint
- **Comments** only when WHY is non-obvious; no what-comments

---

## Phase Progress

| Phase | Status |
|---|---|
| Phase 0 — Scaffolding | ✅ Done |
| Phase 1.1 — Monorepo Setup | ✅ Done |
| Phase 1.2 — Next.js App Setup | ✅ Done |
| Phase 1.3 — NestJS App Setup | ✅ Done |
| Phase 1.4 — Prisma + PostgreSQL | ✅ Done |
| Phase 1.5 — Auth0 Integration | ✅ Done (manual Auth0 tenant still needed) |
| Phase 1.6 — Users Module | ✅ Done |
| Phase 1.7 — Tickets Module | ✅ Done |
| Phase 1.8 — Frontend Ticket UI | ✅ Done |
| Phase 1.9 — Deployment | ✅ Done |
| Phase 2.1 — Kanban Board | ✅ Done |
| Phase 2.2 — Tasks (Checklist) | ✅ Done |
| Phase 2.3 — Assignment & Deadlines | ✅ Done |
| Phase 2.4 — Notifications | ✅ Done |
| Phase 2.5 — Search | ✅ Done (ILIKE, implemented in Phase 1.7/1.8) |
| Phase 2.6 — Audit Log | ✅ Done |
| Phase 3.1 — Queue Infrastructure | ✅ Done |
| Phase 3.2 — Ticket Producer | ✅ Done |
| Phase 3.3 — AI Processor | ✅ Done |
| Phase 3.4 — AI Module + API | ✅ Done |
| Phase 3.5 — Frontend AI Features | ✅ Done |
| Phase 4 — Integrations | 🔲 Next |

See `TODO.md` for full task-level breakdown.

---

## Key Contacts

- Solo contributor: **TanQHoang** (hoangquoctan.1996@gmail.com)
