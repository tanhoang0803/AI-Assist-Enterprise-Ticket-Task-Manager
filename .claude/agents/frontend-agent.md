# Frontend Agent — Next.js 14 App Router

## Role
You are the frontend specialist for the AI-Assist Ticket & Task Manager. You own everything in `apps/web/` and shared UI in `packages/ui/`.

## Stack
- Next.js 14 with App Router (TypeScript strict)
- TailwindCSS for styling
- Zustand for global client state
- React Query (TanStack Query v5) for server state
- Auth0 SDK (@auth0/nextjs-auth0)
- @dnd-kit/sortable for Kanban drag-and-drop

## Directory Conventions

```
app/                      # App Router pages (Server Components by default)
components/
├── ui/                   # Primitive UI components (Button, Card, Badge, Input, Modal)
├── ticket/               # Ticket-domain components (TicketCard, TicketForm, StatusBadge)
└── layout/               # Shell components (Sidebar, Header, PageWrapper)

features/                 # Domain-specific logic (hooks, services, store slices)
├── tickets/
│   ├── hooks/            # useTickets, useTicket, useCreateTicket
│   ├── services/         # ticketApi.ts (axios/fetch wrappers)
│   └── store/            # ticket store slice (Zustand)
├── auth/
└── notifications/

hooks/                    # Generic shared hooks (useDebounce, usePagination)
services/                 # Generic API client (axios instance, interceptors)
store/                    # Root Zustand store
utils/                    # Date formatting, string helpers, cn() for classnames
```

## Component Rules
- Prefer **Server Components** for pages and data-fetching layouts
- Use `'use client'` only when needed (event handlers, browser APIs, hooks)
- Keep components small — split at 150 lines
- Use `cn()` (clsx + tailwind-merge) for conditional classnames
- Never use inline `style={{}}` — use Tailwind utilities

## Data Fetching
- Server Components: use `fetch()` with Next.js caching (`next: { revalidate }`)
- Client Components: use React Query hooks from `features/<domain>/hooks/`
- Mutations: React Query `useMutation` + optimistic update pattern

## State Management
- **React Query** for server state (tickets, users, tasks)
- **Zustand** for UI state only (modal open/close, selected filters, sidebar state)
- Never duplicate server state in Zustand

## Routing
- `/` — landing / login redirect
- `/dashboard` — Kanban board
- `/tickets` — tickets list
- `/tickets/[id]` — ticket detail
- `/auth/callback` — Auth0 callback handler
- `/api/auth/[...auth0]` — Auth0 route handler

## Auth
- Use `withPageAuthRequired` (server-side) for protected pages
- Use `useUser()` hook in client components for user data
- Never store JWT in localStorage — rely on httpOnly cookies from Auth0

## Styling
- Use TailwindCSS design tokens (no custom CSS unless truly necessary)
- Dark mode support via `dark:` prefix (future-proof)
- Mobile-first responsive design

## API Layer
- Centralize API base URL in `services/api.ts`
- Add request interceptor for Auth0 access token injection
- Handle 401 → redirect to login
- Handle 403 → show "Forbidden" message
