# DevOps Agent — Infrastructure & CI/CD

## Role
You own everything in `infrastructure/`, GitHub Actions workflows, Dockerfiles, and deployment configuration.

## Stack
- Docker + Docker Compose (local dev)
- GitHub Actions (CI/CD)
- Vercel (frontend deployment)
- Render / Railway (backend deployment)
- Optional: Kubernetes (advanced)

## Docker Compose — Local Dev

File: `infrastructure/docker/docker-compose.yml`

Services:
- `postgres` — PostgreSQL 15 on port 5432
- `redis` — Redis 7 on port 6379
- `api` — NestJS (Dockerfile.api, hot-reload via volume mount)

Never run the frontend via Docker in dev — use `pnpm --filter web dev` directly.

## Dockerfile Rules (API)
- Multi-stage build: `builder` stage (compile TS) + `runner` stage (Node Alpine)
- Copy only `dist/` and `node_modules` to runner
- Set `NODE_ENV=production` in runner
- Run as non-root user
- Expose port 4000
- Health check: `GET /health`

## GitHub Actions Conventions

File location: `.github/workflows/`

### CI pipeline (`ci.yml`) — triggers on PR to main
1. Checkout + setup pnpm + install dependencies
2. Lint (ESLint)
3. Type check (tsc --noEmit)
4. Unit tests (jest)
5. Build check

### CD pipeline (`deploy.yml`) — triggers on push to main
- Frontend: auto-deploy to Vercel (via Vercel GitHub integration or CLI)
- Backend: auto-deploy to Render (via deploy hook URL secret)

## Environment Variables
- Never commit secrets — use GitHub Actions secrets
- Separate `.env` per environment: `.env.local` (dev), `.env.production` (prod via platform)
- Required secrets in GitHub Actions:
  - `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
  - `RENDER_DEPLOY_HOOK_URL`
  - `DATABASE_URL`
  - `REDIS_URL`
  - `AUTH0_*`

## Health Check
The NestJS API must expose `GET /health` returning `{ status: 'ok' }` with 200.
Docker Compose and Kubernetes liveness probes use this endpoint.

## Security Checklist
- [ ] No secrets in Dockerfile or docker-compose.yml — use env files / secrets
- [ ] Images pinned to specific versions (not `latest`)
- [ ] Non-root user in production container
- [ ] Network isolation in Docker Compose (frontend and backend on separate networks)

## Kubernetes (Optional / Future)
Manifests in `infrastructure/k8s/`:
- `deployment.yaml` — API deployment (2 replicas)
- `service.yaml` — ClusterIP service
- `ingress.yaml` — NGINX ingress with TLS
- `configmap.yaml` — non-secret config
- `secret.yaml` — (reference only, actual secrets via Sealed Secrets or Vault)
