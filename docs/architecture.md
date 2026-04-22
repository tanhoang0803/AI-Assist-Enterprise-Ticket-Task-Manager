# Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Users (Browser)                           │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│               Frontend — Next.js 14 (Vercel)                │
│  App Router · TypeScript · TailwindCSS · Zustand · RQ       │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST (Bearer token)
┌──────────────────────────▼──────────────────────────────────┐
│               Backend — NestJS (Render/Railway)             │
│  Modular Monolith · Prisma · BullMQ · Passport-JWT          │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  Auth    │ │  Users   │ │ Tickets  │ │     AI       │  │
│  │  Module  │ │  Module  │ │  Module  │ │   Module     │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  Tasks   │ │ Notif.   │ │Workflow  │ │    Logs      │  │
│  │  Module  │ │  Module  │ │  Module  │ │   Module     │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
└────────────┬──────────────────────────────────┬────────────┘
             │                                  │
┌────────────▼────────────┐   ┌─────────────────▼───────────┐
│  PostgreSQL (Supabase)  │   │   Redis + BullMQ Queue       │
│  Primary data store      │   │   Async job processing       │
└─────────────────────────┘   └─────────────────┬────────────┘
                                                 │
                                    ┌────────────▼────────────┐
                                    │   AI Layer              │
                                    │  Hugging Face / OpenAI  │
                                    │  → classify → score     │
                                    │  → summarize            │
                                    └─────────────────────────┘
```

## External Integrations

| Service | Purpose | Module |
|---|---|---|
| Auth0 | Authentication, RBAC | `modules/auth` |
| Supabase | Hosted PostgreSQL | `database/prisma` |
| Redis (Upstash) | BullMQ queue backend | `queue/` |
| Hugging Face | AI inference | `modules/ai` |
| Slack API | Notifications | `modules/notifications` |
| SendGrid | Email notifications | `modules/notifications` |
| Google Calendar | Deadline sync | `integrations/calendar` |
| Vercel | Frontend hosting | N/A |
| Render/Railway | Backend hosting | N/A |

## Data Flow: Ticket Creation

1. User submits form → `POST /tickets` (authenticated)
2. NestJS validates DTO → saves to PostgreSQL via Prisma
3. TicketProducer enqueues job to `ai-analysis` BullMQ queue
4. Response returned to user immediately (async decoupling)
5. AiProcessor picks up job from Redis queue
6. AI Module calls Hugging Face APIs (classify, score, summarize)
7. Results saved back to ticket record in PostgreSQL
8. Notification triggered → Slack webhook + SendGrid email

## Security Layers

1. **Transport**: HTTPS everywhere (Vercel + Render provide TLS)
2. **Auth**: Auth0 issues JWT → NestJS validates with passport-jwt
3. **RBAC**: `@Roles()` + `RolesGuard` on protected endpoints
4. **Input**: `ValidationPipe` with `whitelist: true` strips unknown fields
5. **Rate Limiting**: NestJS throttler on all routes
6. **SQL Injection**: Prisma parameterized queries (no raw SQL)
7. **Secrets**: Environment variables only, never in code
