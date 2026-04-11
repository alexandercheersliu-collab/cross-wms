#!/bin/bash
# Wrapper script for Prisma migrate deploy with DATABASE_URL
export DATABASE_URL="$DATABASE_URL"
prisma migrate deploy --config prisma.config.ts
