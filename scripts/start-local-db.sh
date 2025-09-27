#!/usr/bin/env bash
set -e

echo "🚀 Spouštím lokální Supabase (Docker)..."

# Zkontroluj, jestli je supabase CLI dostupné
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI není nainstalované. Nainstaluj: npm install -g supabase"
  exit 1
fi

# Spustit Supabase lokálně
pnpm dlx supabase start

echo "📦 Spouštím Prisma migrace a seed..."
pnpm prisma migrate dev
pnpm prisma db seed

echo "✅ Lokální Supabase + Prisma připraveny!"
