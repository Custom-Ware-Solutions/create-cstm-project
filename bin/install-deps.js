#!/usr/bin/env node
import { execSync } from 'child_process';

try {
  console.log('📦 Kontrola a případná instalace chybějících závislostí...');
  execSync('pnpm install', { stdio: 'inherit' });
  console.log('✅ Závislosti nainstalovány.');
} catch (err) {
  console.error('❌ Instalace závislostí selhala, zkus ručně: pnpm install');
  process.exit(1);
}
