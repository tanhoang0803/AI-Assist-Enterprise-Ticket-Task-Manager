#!/bin/sh
set -e

echo "Running database migrations..."
pnpm --filter api exec prisma migrate deploy

echo "Starting API..."
exec node apps/api/dist/main
