# TODO — AI-Assist Enterprise Ticket & Task Manager

> Track every phase step by step. Update status as work progresses.
> Status: 🔲 Planned · 🔄 In Progress · ✅ Done · ⏸ Blocked

---

## Phase 0 — Project Scaffolding (FOUNDATION)

- [x] Create CLAUDE.md (AI dev instructions)
- [x] Create README.md (project summary)
- [x] Create TODO.md (this file)
- [x] Create .claude/ system (agents, skills, commands, hooks, memory)
- [x] Create .claude/settings.json
- [x] Create .gitignore
- [x] Create .env.example + .env.local
- [x] Create monorepo root package.json (pnpm workspaces)
- [x] Create turbo.json
- [x] Create LICENSE
- [x] Scaffold full directory structure

---

## Phase 1 — MVP Core (🔴 FOUNDATION)

### 1.1 Monorepo Setup ✅
- [x] Configure pnpm workspaces (pnpm-workspace.yaml)
- [x] Configure Turborepo pipelines (turbo.json)
- [x] Set up shared tsconfig (packages/config: base / nextjs / nestjs)
- [x] Set up shared eslint config (packages/config: base / next / nest)
- [x] Create shared packages: types (User, Ticket, Task, enums), utils (cn, date, format), ui (stub)
- [x] Add .prettierrc.json + .prettierignore
- [x] pnpm install — all 5 workspace packages linked

### 1.2 Frontend — Next.js App Setup ✅
- [x] Initialize Next.js 14.2.25 app with TypeScript in `apps/web/`
- [x] Configure TailwindCSS + PostCSS
- [x] Set up App Router layout (root layout with Inter font + metadata)
- [x] Route group `(protected)/` with server-side auth guard
- [x] Pages: `/` (redirect), `/auth/login`, `/dashboard`, `/tickets`, `/tickets/[id]`
- [x] Auth0 route handler: `app/api/auth/[...auth0]/route.ts`
- [x] Install and configure Zustand (`store/uiStore.ts`)
- [x] Install and configure React Query (`components/providers/QueryProviders.tsx`)
- [x] Shared UI components in `packages/ui/`: Button, Card, Badge, Input, Modal
- [x] Layout shell: Sidebar + Header components
- [x] API client: `services/api.ts` (axios with 401→login redirect)
- [x] `hooks/useDebounce.ts` shared hook
- [x] Path aliases: `@/*`, `@ui/*`, `@types-repo/*`, `@utils/*`

### 1.3 Backend — NestJS App Setup ✅
- [x] Initialize NestJS app in `apps/api/` (package.json, nest-cli.json, tsconfig)
- [x] Configure TypeScript strict mode (extends @repo/config/tsconfig/nestjs)
- [x] Global ValidationPipe (whitelist, forbidNonWhitelisted, transform)
- [x] Global exception filter (GlobalExceptionFilter — logs 5xx, returns structured errors)
- [x] CORS + Helmet configured in main.ts
- [x] @nestjs/config with Joi schema validation (configValidationSchema)
- [x] Swagger/OpenAPI at /api/docs (dev only) with Bearer auth
- [x] Health check: GET /health (terminus — memory heap indicator)
- [x] Common layer: JwtAuthGuard, RolesGuard, @CurrentUser(), @Roles() decorator
- [x] LoggingInterceptor + TransformInterceptor (wraps all responses)
- [x] Graceful shutdown hooks
- [x] tsc --noEmit passes with zero errors

### 1.4 Database — Prisma + PostgreSQL ✅
- [x] Install @prisma/client + prisma@5.22 in apps/api
- [x] Configure PostgreSQL connection via DATABASE_URL env var
- [x] Prisma schema (prisma/schema.prisma):
  - [x] User — id, email, name, avatarUrl, role (ADMIN/MANAGER/MEMBER), auth0Id, timestamps
  - [x] Ticket — full status/priority/category enums, AI fields, soft delete, composite indexes
  - [x] Task — TaskStatus enum, cascade delete on ticket removal
  - [x] Attachment — Phase 4 ready (filename, url, mimeType, size)
  - [x] AuditLog — polymorphic (entityType+entityId), AuditAction enum, metadata Json
- [x] prisma generate — client generated, tsc --noEmit passes with zero errors
- [x] PrismaService — extends PrismaClient, slow query logging (>200ms), cleanDatabase() for test teardown
- [x] PrismaModule — @Global(), PrismaService available in every module
- [x] AppModule updated — PrismaModule imported
- [x] Health check updated — memory heap + prisma pingCheck
- [x] Seed script — 3 users, 5 tickets (all categories/statuses), 9 tasks, 7 audit logs
- [x] Run migration: `pnpm docker:up` then `pnpm db:migrate` (requires DATABASE_URL in .env.local)

### 1.5 Auth — Auth0 Integration ✅
- [ ] Create Auth0 tenant + application (manual — see docs/auth0-setup.md)
- [ ] Fill in AUTH0_* values in .env.local (manual)
- [x] Backend: AuthModule (auth.module.ts) with PassportModule
- [x] Backend: JwtStrategy — RS256 validation via jwks-rsa + Auth0 JWKS endpoint
- [x] Backend: AuthService.validateAndSyncUser() — auto-upserts user on every login
- [x] Backend: GET /api/auth/profile — returns DB user profile
- [x] Backend: RBAC — JwtAuthGuard + RolesGuard already wired (Phase 1.3), role from DB
- [x] Frontend: @auth0/nextjs-auth0 SDK installed (Phase 1.2)
- [x] Frontend: Login/logout — /api/auth/login, /api/auth/logout, Sidebar sign-out link
- [x] Frontend: middleware.ts — withMiddlewareAuthRequired() blocks /dashboard, /tickets, /settings
- [x] Frontend: GET /api/auth/token route — serves access token to client components
- [x] Frontend: services/api.ts — request interceptor injects Bearer token automatically
- [x] Frontend: features/auth/hooks/useAuth.ts — useUser() wrapper with typed helpers
- [x] Frontend: features/auth/hooks/useAccessToken.ts — React Query hook for access token
- [x] Docs: docs/auth0-setup.md — step-by-step Auth0 tenant + API setup guide

### 1.6 Users Module (Backend) ✅
- [x] `GET /users` — list users (ADMIN only)
- [x] `GET /users/me` — current user profile
- [x] `GET /users/assignable` — minimal user list (id, name, avatar) for any authenticated user
- [x] `GET /users/:id` — get user by ID (ADMIN/MANAGER)
- [x] `PATCH /users/:id` — update profile (own or ADMIN-any; role change ADMIN-only)
- [x] UpdateUserDto with class-validator decorators

### 1.7 Tickets Module (Backend) ✅
- [x] `POST /tickets` — create ticket (reporter = currentUser)
- [x] `GET /tickets` — list with pagination + filters (status, priority, category, assigneeId, search, overdue, dueBefore, dueAfter)
- [x] `GET /tickets/:id` — get ticket detail with reporter/assignee/task count
- [x] `PATCH /tickets/:id` — update ticket (reporter/assignee/ADMIN/MANAGER)
- [x] `DELETE /tickets/:id` — soft delete (ADMIN/MANAGER)
- [x] Status transition validation (OPEN→IN_PROGRESS→DONE→CLOSED, with reopens)
- [x] CreateTicketDto, UpdateTicketDto, TicketQueryDto with class-validator

### 1.8 Frontend — Ticket UI ✅
- [x] Tickets list page (`/tickets`) — table with filters (status, priority, search, assigned to me, overdue), pagination
- [x] Ticket detail page (`/tickets/[id]`) — description, details sidebar, overdue badge
- [x] Create ticket form / modal (title, description, priority, category, assignee, due date)
- [x] Edit ticket form modal (pre-filled, status transitions restricted to valid next states, assignee selector)
- [x] TicketStatusBadge component (OPEN/IN_PROGRESS/DONE/CLOSED)
- [x] TicketPriorityBadge component (LOW/MEDIUM/HIGH/CRITICAL)
- [x] API service layer (`services/tickets.ts`, `services/tasks.ts`, `services/users.ts`)
- [x] React Query hooks (`useTickets`, `useTasks`, `useAssignableUsers`, `useKanban`)
- [x] `useCurrentUser` hook (`features/auth/hooks/useCurrentUser.ts`) for DB role
- [x] `useDebounce` hook — used for debounced search on tickets list
- [x] Fixed shared package deps (clsx, tailwind-merge in @repo/utils; lucide-react, @repo/utils in @repo/ui)

### 1.9 Deployment — Phase 1 ✅
- [x] Docker Compose — API service added (commented out; uncomment to run full stack in Docker)
- [x] Dockerfile for NestJS API (multi-stage, non-root user, HEALTHCHECK)
- [x] Vercel deployment config (`vercel.json` — build/output/install commands)
- [x] Render deployment config (`render.yaml` — web service, env var stubs)
- [x] GitHub Actions CI (`.github/workflows/ci.yml` — lint, typecheck, build; deploy on merge to main)

---

## Phase 2 — Core Product Features (🟡 DAILY USE)

### 2.1 Kanban Board ✅
- [x] Kanban board page (`/dashboard`)
- [x] Drag-and-drop columns (Open / In Progress / Done)
- [x] @dnd-kit/sortable integration
- [x] Optimistic updates with React Query
- [x] Column card component with ticket summary
- [x] Invalid drop targets dimmed during drag
- [x] DragOverlay floating card preview

### 2.2 Tasks (Kanban Subtasks) ✅
- [x] Tasks module in backend
- [x] `GET /tickets/:id/tasks`
- [x] `POST /tickets/:id/tasks`
- [x] `PATCH /tasks/:id`
- [x] `DELETE /tasks/:id`
- [x] Task checklist component in frontend (progress bar, checkbox toggle, add/delete)

### 2.3 Assignment & Deadlines ✅
- [x] Assignee selector dropdown on CreateTicketModal and EditTicketModal
- [x] `GET /users/assignable` endpoint (any authenticated user)
- [x] "Assigned to me" quick-filter button on tickets list
- [x] Overdue filter toggle on tickets list
- [x] Overdue due dates highlighted in red (list + detail pages)
- [x] overdue/dueBefore/dueAfter query params on `GET /tickets`

### 2.4 Notifications Module ✅
- [x] Backend: NotificationsModule with NotificationsService
- [x] Slack integration
  - [x] `SLACK_BOT_TOKEN` + `SLACK_CHANNEL_ID` env vars
  - [x] SlackService — `postMessage(text)` via native fetch; auto-disabled when env vars absent
  - [x] Trigger: ticket created (title, priority, reporter)
  - [x] Trigger: ticket assigned (assignee name, ticket title)
  - [x] Trigger: ticket status changed (old → new status)
- [x] Email integration
  - [x] `SENDGRID_API_KEY` + `SENDGRID_FROM_EMAIL` env vars
  - [x] EmailService — `sendTicketAssigned(to, ticket)` via SendGrid v3 REST API; auto-disabled when env vars absent
  - [x] HTML email template: ticket assigned notification
  - [x] Trigger: assignment change (send to new assignee)
- [x] Wire triggers into TicketsService (fire-and-forget void calls after create/update)
- [x] Graceful degradation — notification failures caught and logged, never propagate

### 2.5 Search ✅
- [x] `GET /tickets?search=...` query param (ILIKE on title + description — implemented in Phase 1.7)
- [x] Search bar component in frontend (implemented in Phase 1.8)
- [x] Debounced search hook (`useDebounce` — implemented in Phase 1.2)
- [ ] PostgreSQL full-text search upgrade (tsvector/tsquery + GIN index — optional optimization)

### 2.6 Audit Log ✅
- [x] Backend: LogsModule (@Global) with LogsService
- [x] AuditLog Prisma model already defined — no migration needed
- [x] LogsService — `log(action, entityType, entityId, userId, metadata?)` (fire-and-forget)
- [x] Wire into TicketsService: log CREATED, UPDATED, STATUS_CHANGED, ASSIGNED, DELETED
- [x] Wire into TasksService: log CREATED, UPDATED, DELETED (userId threaded via @CurrentUser())
- [x] `GET /logs` — paginated, JWT-protected, filter by entityType + entityId
- [x] ActivityLog component in frontend (ticket detail page sidebar)
- [x] Format log entries with actor avatar/initial, action label, timeAgo timestamp

---

## Phase 3 — AI-Assist Layer (🔵 CORE DIFFERENTIATOR)

### 3.1 Queue Infrastructure
- [ ] Install BullMQ + @nestjs/bull
- [ ] Configure Redis connection
- [ ] Queue module setup
- [ ] Bull Dashboard (monitoring UI)

### 3.2 Ticket Producer
- [ ] `ticket.producer.ts` — enqueue job on ticket create
- [ ] Job payload: ticketId, title, description
- [ ] Retry strategy (3 attempts, exponential backoff)

### 3.3 AI Processor
- [ ] `ai.processor.ts` — consume queue jobs
- [ ] Connect to Hugging Face Inference API
- [ ] Auto-categorization (zero-shot classification)
- [ ] Priority scoring (text classification)
- [ ] Ticket summarization (summarization pipeline)
- [ ] Write results back to DB via Prisma
- [ ] Trigger notification after AI completes

### 3.4 AI Module
- [ ] AI service with provider abstraction (HuggingFace / OpenAI fallback)
- [ ] `POST /ai/analyze` — manual trigger for dev/testing
- [ ] AI result stored on Ticket model (aiCategory, aiPriority, aiSummary, aiProcessedAt)

### 3.5 Frontend — AI Features
- [ ] AI summary panel on ticket detail page
- [ ] AI category/priority badge with "AI suggested" label
- [ ] Processing indicator while job is in queue
- [ ] Manual re-analyze button

---

## Phase 4 — Smart Integrations (🟢 SELECTIVE)

### 4.1 Google Calendar Sync
- [ ] Google OAuth credentials
- [ ] Calendar service (create/update events)
- [ ] Link ticket due date → Calendar event on assignment
- [ ] `POST /tickets/:id/calendar-sync`

### 4.2 File Attachments
- [ ] Multer for file upload in NestJS
- [ ] Local storage (dev) / S3-compatible (prod)
- [ ] `POST /tickets/:id/attachments`
- [ ] `GET /tickets/:id/attachments`
- [ ] Attachment list component in frontend

### 4.3 Stripe Demo (Optional)
- [ ] Stripe test mode account
- [ ] Demo billing page
- [ ] Webhook handler for payment events

---

## Enterprise Practices (🟣 ONGOING)

### Security
- [x] Rate limiting (NestJS throttler)
- [x] Input validation on all endpoints (class-validator)
- [x] SQL injection prevention (Prisma parameterized queries — built-in)
- [ ] XSS prevention (output encoding in frontend)
- [x] Helmet middleware
- [x] CORS whitelist
- [ ] Secrets rotation strategy documented

### CI/CD
- [x] GitHub Actions: lint on PR
- [ ] GitHub Actions: unit tests on PR (no tests written yet)
- [x] GitHub Actions: build check on PR
- [x] GitHub Actions: auto-deploy to Vercel on merge to main
- [x] GitHub Actions: auto-deploy to Render on merge to main

### DevOps
- [x] Docker Compose for full local stack
- [x] Dockerfile for API (multi-stage build)
- [x] Health check endpoints
- [x] Graceful shutdown handling in NestJS
- [ ] Optional: Kubernetes manifests for API deployment

### Observability
- [ ] Structured logging (Pino / Winston)
- [ ] Request ID propagation
- [ ] Error tracking (Sentry integration)
- [ ] BullMQ job monitoring dashboard

### Performance
- [ ] Redis caching layer for hot queries
- [x] Prisma query optimization (explicit `select` on all queries — no over-fetching)
- [x] Pagination on all list endpoints (`page` + `limit` with meta on `/tickets`)
- [ ] Image optimization (Next.js built-in)

---

## Documentation

- [x] `docs/architecture.md` — system design overview
- [x] `docs/api-flow.md` — REST API endpoint map
- [x] `docs/ai-flow.md` — AI queue pipeline deep-dive
- [x] `docs/auth0-setup.md` — step-by-step Auth0 tenant + API setup guide
- [x] `docs/roadmap.md` — future features backlog
- [x] `CLAUDE.md` — AI dev instructions + live API endpoint quick reference
- [x] `README.md` — live features table, architecture, setup, roadmap
- [x] Swagger/OpenAPI auto-generated from NestJS decorators (at `/api/docs` in dev)
- [ ] Update `docs/api-flow.md` to include tasks, assignable, overdue filter endpoints

---

## Current Focus

**Phase 3 — AI-Assist Layer**

Complete: Phases 0, 1.1–1.9, 2.1 (Kanban), 2.2 (Tasks), 2.3 (Assignment & Deadlines), 2.4 (Notifications), 2.5 (Search), 2.6 (Audit Log).  
**Phase 2 is fully complete. Next up: Phase 3 — AI Layer (BullMQ + Redis + Hugging Face).**

> **Manual steps still required before going live:**
> - Auth0 tenant setup (see `docs/auth0-setup.md`) — fill `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` in `.env.local`
> - Set `RENDER_DEPLOY_HOOK_URL` in GitHub repo secrets
> - Set `DATABASE_URL`, `DIRECT_URL`, `AUTH0_*` in Render dashboard env vars
> - Set `SLACK_BOT_TOKEN`, `SLACK_CHANNEL_ID` in Render dashboard for Phase 2.4
> - Set `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` in Render dashboard for Phase 2.4
> - Set `HUGGINGFACE_API_KEY` in Render dashboard for Phase 3
