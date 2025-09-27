#!/usr/bin/env node
import { execSync } from 'child_process';
import process from 'process';

console.log('🚀 Spouštím lokální Supabase + Prisma...');

// Kontrola Supabase CLI
try {
  execSync('supabase --version', { stdio: 'ignore' });
} catch {
  console.error('❌ Supabase CLI není nainstalované.');
  console.error('Nainstaluj: npm install -g supabase');
  process.exit(1);
}

// Spuštění Supabase lokálně
try {
  console.log('📦 Spouštím lokální Supabase...');
  execSync('pnpm dlx supabase start', { stdio: 'inherit' });

  console.log('📦 Spouštím Prisma migrace...');
  execSync('pnpm prisma migrate dev', { stdio: 'inherit' });

  console.log('📦 Spouštím Prisma seed...');
  execSync('pnpm prisma db seed', { stdio: 'inherit' });

  console.log('✅ Lokální Supabase + Prisma připraveny!');
} catch (err) {
  console.error('❌ Chyba při spouštění DB:', err.message);
  process.exit(1);
}
