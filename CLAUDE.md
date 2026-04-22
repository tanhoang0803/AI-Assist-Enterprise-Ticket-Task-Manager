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
│   ├── web/          # Next.js 14 · TypeScript · TailwindCSS · App Router
│   └── api/          # NestJS · TypeScript · Prisma · BullMQ
├── packages/
│   ├── ui/           # Shared React components
│   ├── types/        # Shared TypeScript types & enums
│   ├── utils/        # Shared helper functions
│   └── config/       # Shared eslint / tsconfig
├── infrastructure/
│   ├── docker/       # docker-compose, Dockerfiles
│   ├── ci-cd/        # GitHub Actions workflows
│   └── k8s/          # Optional Kubernetes manifests
├── docs/             # Architecture, API flow, AI flow, roadmap
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

| Module | Responsibility |
|---|---|
| `auth` | JWT validation, Auth0/Firebase integration, RBAC guards |
| `users` | User CRUD, roles, profile management |
| `tickets` | Ticket lifecycle, status transitions, assignment |
| `tasks` | Kanban subtasks, checklists |
| `notifications` | Slack webhook, SendGrid email dispatch |
| `ai` | AI analysis orchestration, model calls |
| `workflow` | Automation rules, triggers |
| `logs` | Audit trail, activity log |

---

## AI Processing Flow

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

# Run tests
pnpm test

# Lint + type-check
pnpm lint
pnpm typecheck

# Database
pnpm --filter api prisma:migrate
pnpm --filter api prisma:studio

# Docker dev environment
docker-compose -f infrastructure/docker/docker-compose.yml up -d
```

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

See `TODO.md` for current status across all phases.

---

## Key Contacts

- Solo contributor: **TanQHoang** (hoangquoctan.1996@gmail.com)
