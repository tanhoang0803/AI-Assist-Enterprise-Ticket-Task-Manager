# Command: /debug <description>

Systematic debugging workflow for the ticket-task_manager stack.

## Usage

```
/debug "POST /tickets returns 500 in production but works locally"
/debug "BullMQ job is stuck in waiting state"
/debug "React Query not refetching after mutation"
```

## Debug Protocol

### Step 1 — Reproduce
- Identify the exact inputs that trigger the issue
- Confirm the expected vs actual behavior
- Note environment (dev / staging / prod)

### Step 2 — Narrow the stack layer
| Symptom | Start here |
|---|---|
| HTTP 4xx/5xx | NestJS controller → service → Prisma |
| Queue job not processing | Redis connection → BullMQ worker → processor |
| Auth failure | Auth0 config → JWT strategy → RBAC guard |
| UI not updating | React Query cache → invalidation → network request |
| Build failure | TypeScript errors → import paths → tsconfig |

### Step 3 — Investigate
- Check NestJS logs: `docker logs api --tail 100`
- Check BullMQ dashboard: `localhost:3001` (Bull Board)
- Check Prisma queries: enable `log: ['query']` in PrismaService temporarily
- Check browser network tab for exact request/response

### Step 4 — Fix
- Apply minimal fix
- Add relevant log line if the root cause was silent
- Write a test that would have caught this

### Common Issues & Quick Fixes

**Prisma connection error**
```bash
# Check database URL format
echo $DATABASE_URL
# Test connection
pnpm --filter api prisma db pull
```

**Redis not connecting (BullMQ)**
```bash
docker ps | grep redis
docker exec -it redis redis-cli ping
```

**Auth0 JWT validation failure**
- Verify `AUTH0_AUDIENCE` matches your API in Auth0 dashboard
- Verify `AUTH0_ISSUER_BASE_URL` includes trailing slash or not (be consistent)
- Check token expiry with jwt.io

**React Query stale data**
- Call `queryClient.invalidateQueries({ queryKey: ['tickets'] })` after mutation
- Check `staleTime` — if too high, data won't refetch

**TypeScript path alias not resolving**
- Check `tsconfig.json` `paths` configuration
- Restart TS server in VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
