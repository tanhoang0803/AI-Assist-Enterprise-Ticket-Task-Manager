# Project Context Memory

## Identity
- **Project:** AI-Assist Enterprise Ticket & Task Manager
- **Author:** TanQHoang (hoangquoctan.1996@gmail.com) — sole contributor
- **Started:** 2026-04-22
- **Goal:** Full-stack enterprise system for portfolio, demonstrating production-like patterns

## Architecture Decisions (locked)
- **Monorepo:** pnpm workspaces + Turborepo (NOT nx, NOT lerna)
- **Backend:** NestJS modular monolith (NOT microservices — too complex for solo build)
- **Database:** PostgreSQL via Supabase (hosted, avoids self-managing Postgres)
- **Queue:** BullMQ + Redis (NOT SQS — simpler for local dev)
- **Auth:** Auth0 (primary) — chosen for RBAC out of the box and enterprise demo value
- **AI Provider:** Hugging Face Inference API (free tier) — OpenAI as fallback
- **Frontend hosting:** Vercel (native Next.js support)
- **Backend hosting:** Render or Railway (free tier friendly)

## Phase Status (as of project start)
- Phase 0 (Scaffolding): ✅ Complete
- Phase 1 (MVP Core): 🔄 In Progress — starting with monorepo setup
- Phase 2 (Core Product): 🔲 Planned
- Phase 3 (AI Layer): 🔲 Planned
- Phase 4 (Integrations): 🔲 Planned

## Key Ports (local dev)
- Next.js frontend: http://localhost:3000
- NestJS API: http://localhost:4000
- Prisma Studio: http://localhost:5555
- Bull Board (queue monitor): http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## What NOT to do
- Do NOT use microservices — keep it modular monolith
- Do NOT use Next.js API routes for business logic — all business logic goes in NestJS
- Do NOT use localStorage for auth tokens — Auth0 handles cookies
- Do NOT skip DTOs — every endpoint has input validation
- Do NOT commit .env.local — gitignored always
- Do NOT use `any` in TypeScript — use `unknown` or proper types

## Dependency Versions (pinned at project start)
- Next.js: 14.x
- NestJS: 10.x
- Prisma: 5.x
- TypeScript: 5.x
- Node.js: 20.x (LTS)
- pnpm: 9.x

## Open Decisions
- Stripe demo: deprioritized, only if time allows after Phase 3
- Kubernetes: optional advanced step after core deployment works
- Search: PostgreSQL full-text first, Algolia only if needed at scale
