# Hook: Pre-Commit Checks

These checks run before every commit. They are defined in `.husky/pre-commit` (set up when Husky is initialized).

## Checks

```bash
#!/bin/sh
# .husky/pre-commit

# 1. Lint staged files
pnpm lint-staged

# 2. Type check (non-blocking in pre-commit — blocking in CI)
pnpm typecheck || echo "[WARN] Type errors found — fix before merging"

# 3. Block commits of .env.local or secrets
if git diff --cached --name-only | grep -E '\.env\.local|\.env\.production'; then
  echo "[ERROR] Blocked: attempting to commit secret env file"
  exit 1
fi
```

## lint-staged config (package.json)

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml}": ["prettier --write"],
    "apps/api/prisma/schema.prisma": ["prisma format"]
  }
}
```

## Setup

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

## Claude Code Pre-Commit Reminder

When the `Write` tool completes on a TypeScript file:
- Check if the file has obvious type errors before considering the task done
- Remind the user to run `pnpm lint` if significant changes were made
