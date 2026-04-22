# API Endpoint Map

Base URL: `http://localhost:4000` (dev) / `https://api.yourdomain.com` (prod)

All protected endpoints require: `Authorization: Bearer <auth0-jwt-token>`

---

## Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/auth/profile` | JWT | Get current user profile from token |
| POST | `/auth/refresh` | JWT | Refresh access token |

Auth0 handles login/logout/callback on the frontend.

---

## Users

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/users` | JWT | ADMIN | List all users |
| GET | `/users/me` | JWT | Any | Current user profile |
| GET | `/users/:id` | JWT | Any | Get user by ID |
| PATCH | `/users/:id` | JWT | Self/ADMIN | Update user profile |

---

## Tickets

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/tickets` | JWT | Any | List tickets (paginated, filterable) |
| POST | `/tickets` | JWT | Any | Create ticket |
| GET | `/tickets/:id` | JWT | Any | Get ticket detail |
| PATCH | `/tickets/:id` | JWT | Any | Update ticket |
| DELETE | `/tickets/:id` | JWT | ADMIN/MANAGER | Soft-delete ticket |
| GET | `/tickets/:id/tasks` | JWT | Any | Get ticket tasks |
| POST | `/tickets/:id/tasks` | JWT | Any | Add task to ticket |
| POST | `/tickets/:id/attachments` | JWT | Any | Upload attachment |
| POST | `/tickets/:id/calendar-sync` | JWT | Any | Sync due date to Google Calendar |

### Query Params (GET /tickets)
- `?status=OPEN|IN_PROGRESS|DONE|CLOSED`
- `?priority=LOW|MEDIUM|HIGH|CRITICAL`
- `?assigneeId=<userId>`
- `?search=<text>`
- `?page=1&limit=20`

---

## Tasks

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| PATCH | `/tasks/:id` | JWT | Any | Update task status/title |
| DELETE | `/tasks/:id` | JWT | Any | Delete task |

---

## Notifications

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/notifications` | JWT | Any | Get user notifications |
| PATCH | `/notifications/:id/read` | JWT | Any | Mark as read |

---

## AI

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/ai/analyze` | JWT | Any | Manually trigger AI analysis for a ticket |

Request body: `{ "ticketId": "string" }`

---

## Audit Logs

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/logs` | JWT | ADMIN | Paginated audit log |
| GET | `/logs?entityId=<id>` | JWT | ADMIN | Logs for specific entity |

---

## Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | None | Health check (used by Docker/K8s) |

---

## Swagger

Available at `GET /api/docs` in development mode.
