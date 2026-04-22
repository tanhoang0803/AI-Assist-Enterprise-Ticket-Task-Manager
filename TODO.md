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
- [ ] Run migration: `pnpm docker:up` then `pnpm db:migrate` (requires DATABASE_URL in .env.local)

### 1.5 Auth — Auth0 Integration
- [ ] Create Auth0 tenant + application
- [ ] Configure Auth0 environment variables
- [ ] Backend: Auth module with JWT strategy (passport-jwt)
- [ ] Backend: Auth0 token validation
- [ ] Backend: RBAC guard (roles: ADMIN, MANAGER, MEMBER)
- [ ] Frontend: Auth0 SDK setup (@auth0/nextjs-auth0)
- [ ] Frontend: Login / logout flow
- [ ] Frontend: Protected route middleware
- [ ] Frontend: Auth context / user hook

### 1.6 Users Module (Backend)
- [ ] `GET /users` — list users (ADMIN only)
- [ ] `GET /users/:id` — get user by ID
- [ ] `PATCH /users/:id` — update profile
- [ ] `GET /users/me` — current user profile
- [ ] UserDTO with class-validator decorators

### 1.7 Tickets Module (Backend)
- [ ] `POST /tickets` — create ticket
- [ ] `GET /tickets` — list with pagination + filters
- [ ] `GET /tickets/:id` — get ticket detail
- [ ] `PATCH /tickets/:id` — update ticket
- [ ] `DELETE /tickets/:id` — soft delete (ADMIN/MANAGER)
- [ ] Status transition validation (Open → In Progress → Done → Closed)
- [ ] CreateTicketDto, UpdateTicketDto, TicketResponseDto

### 1.8 Frontend — Ticket UI
- [ ] Tickets list page (`/tickets`)
- [ ] Ticket detail page (`/tickets/[id]`)
- [ ] Create ticket form / modal
- [ ] Edit ticket form
- [ ] Status badge component
- [ ] Priority indicator component
- [ ] API service layer (`services/tickets.ts`)
- [ ] React Query hooks (`features/tickets/`)

### 1.9 Deployment — Phase 1
- [ ] Docker Compose for local dev (Postgres + Redis + API)
- [ ] Dockerfile for NestJS API
- [ ] Vercel deployment config for Next.js
- [ ] Render/Railway config for NestJS
- [ ] GitHub Actions CI — lint + test on PR

---

## Phase 2 — Core Product Features (🟡 DAILY USE)

### 2.1 Kanban Board
- [ ] Kanban board page (`/dashboard`)
- [ ] Drag-and-drop columns (Open / In Progress / Done)
- [ ] @dnd-kit/sortable integration
- [ ] Optimistic updates with React Query
- [ ] Column card component with ticket summary

### 2.2 Tasks (Kanban Subtasks)
- [ ] Tasks module in backend
- [ ] `POST /tickets/:id/tasks`
- [ ] `PATCH /tasks/:id`
- [ ] `DELETE /tasks/:id`
- [ ] Task checklist component in frontend

### 2.3 Assignment & Deadlines
- [ ] Assignee field on tickets
- [ ] Due date picker
- [ ] "Assigned to me" filter
- [ ] Overdue indicator

### 2.4 Notifications Module
- [ ] Slack integration
  - [ ] Configure Slack App + Bot token
  - [ ] Slack service (post message to channel)
  - [ ] Trigger on: ticket created, assigned, status changed
- [ ] Email integration
  - [ ] SendGrid account + API key
  - [ ] Email templates (ticket created, assigned)
  - [ ] Trigger on: assignment

### 2.5 Search
- [ ] PostgreSQL full-text search on tickets (title + description)
- [ ] `GET /tickets?search=...` query param
- [ ] Search bar component in frontend
- [ ] Debounced search hook

### 2.6 Audit Log
- [ ] AuditLog module (backend)
- [ ] Interceptor to auto-log mutations
- [ ] `GET /logs` — paginated activity log (ADMIN)
- [ ] Activity log panel in frontend (ticket detail)
- [ ] Log entries: created, updated, assigned, status changed, deleted

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
- [ ] Rate limiting (NestJS throttler)
- [ ] Input validation on all endpoints (class-validator)
- [ ] SQL injection prevention (Prisma parameterized queries — built-in)
- [ ] XSS prevention (output encoding in frontend)
- [ ] Helmet middleware
- [ ] CORS whitelist
- [ ] Secrets rotation strategy documented

### CI/CD
- [ ] GitHub Actions: lint on PR
- [ ] GitHub Actions: unit tests on PR
- [ ] GitHub Actions: build check on PR
- [ ] GitHub Actions: auto-deploy to Vercel on merge to main
- [ ] GitHub Actions: auto-deploy to Render on merge to main

### DevOps
- [ ] Docker Compose for full local stack
- [ ] Dockerfile for API (multi-stage build)
- [ ] Health check endpoints
- [ ] Graceful shutdown handling in NestJS
- [ ] Optional: Kubernetes manifests for API deployment

### Observability
- [ ] Structured logging (Pino / Winston)
- [ ] Request ID propagation
- [ ] Error tracking (Sentry integration)
- [ ] BullMQ job monitoring dashboard

### Performance
- [ ] Redis caching layer for hot queries
- [ ] Prisma query optimization (select, include only needed fields)
- [ ] Pagination on all list endpoints
- [ ] Image optimization (Next.js built-in)

---

## Documentation

- [ ] `docs/architecture.md` — system design overview
- [ ] `docs/api-flow.md` — REST API endpoint map
- [ ] `docs/ai-flow.md` — AI queue pipeline deep-dive
- [ ] `docs/roadmap.md` — future features backlog
- [ ] Swagger/OpenAPI auto-generated from NestJS decorators

---

## Current Focus

**Phase 1.1 — Monorepo Setup**

Next step: Configure pnpm workspaces and Turborepo, then scaffold the Next.js and NestJS apps.
