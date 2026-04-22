# Command: /refactor-code <file>

Analyzes a file or module and applies targeted refactoring without changing behavior.

## Usage

```
/refactor-code apps/api/src/modules/tickets/tickets.service.ts
/refactor-code apps/web/components/ticket/TicketCard.tsx
```

## Refactoring Checklist

### Backend (NestJS)
- [ ] Extract repeated logic into private helper methods
- [ ] Replace raw `prisma.*` calls with a consistent pattern
- [ ] Ensure all error paths throw NestJS exceptions (not raw Error)
- [ ] Remove any `any` types — replace with proper types
- [ ] Ensure logger is used for all significant operations
- [ ] Verify DTO validation decorators are complete

### Frontend (Next.js)
- [ ] Split component if > 150 lines
- [ ] Move inline logic to custom hooks
- [ ] Replace hardcoded values with constants
- [ ] Remove `any` types
- [ ] Ensure `cn()` is used for conditional classes

## Rules
- Do NOT change external behavior
- Do NOT add new features
- Do NOT change test file structure
- Update `TODO.md` if refactoring resolves a tracked tech-debt item
