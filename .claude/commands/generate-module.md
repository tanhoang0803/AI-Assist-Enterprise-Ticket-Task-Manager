# Command: /generate-module <name>

Scaffolds a complete NestJS domain module with all standard files.

## Usage

```
/generate-module tickets
/generate-module users
/generate-module notifications
```

## What It Creates

```
apps/api/src/modules/<name>/
├── <name>.module.ts
├── <name>.controller.ts
├── <name>.service.ts
├── dto/
│   ├── create-<name>.dto.ts
│   └── update-<name>.dto.ts
├── entities/
│   └── <name>.entity.ts
└── <name>.service.spec.ts
```

## Template

When invoked, generate all six files using the patterns from `.claude/skills/nestjs.md`.

Then:
1. Add `<Name>Module` to the imports array in `apps/api/src/app.module.ts`
2. Update `TODO.md` to mark the module scaffold step as done
3. Remind user to add the Prisma model to `schema.prisma` if it doesn't exist yet

## Notes
- Use singular PascalCase for class names: `TicketModule`, `TicketService`
- Use plural kebab-case for URL paths: `/tickets`
- Use plural camelCase for Prisma model access: `this.prisma.ticket`
