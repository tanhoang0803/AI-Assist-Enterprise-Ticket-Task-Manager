#!/bin/sh
set -e

echo "Running database migrations..."
cd apps/api
../../node_modules/.bin/prisma migrate deploy
cd ../..

echo "Starting API..."
exec node apps/api/dist/main
