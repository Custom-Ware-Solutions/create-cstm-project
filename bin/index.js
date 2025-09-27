#!/usr/bin/env node
import prompts from 'prompts';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import process from 'process';
import degit from 'degit';

const cwd = process.cwd();

// --- 1) Interaktivní dotaz na název projektu ---
const response = await prompts({
  type: 'text',
  name: 'projectName',
  message: 'Zadej název projektu:',
  initial: 'my-app'
});

const projectName = response.projectName;
if (!projectName) {
  console.error('❌ Název projektu není validní.');
  process.exit(1);
}

console.log(`√ Projekt: ${projectName}`);

// --- 2) Klonování template ---
console.log('📦 Klonuji template...');
const emitter = degit('Custom-Ware-Solutions/cstm-project-template', {
  cache: false,
  force: true,
  verbose: true
});

try {
  await emitter.clone(path.join(cwd, projectName));
  console.log('✅ Template naklonován.');
} catch (err) {
  console.error('❌ Chyba při klonování template:', err.message);
  process.exit(1);
}

// --- 3) Instalace závislostí ---
console.log('📦 Instalace závislostí přes pnpm...');
try {
  execSync('pnpm install', { cwd: path.join(cwd, projectName), stdio: 'inherit' });
  console.log('✅ Závislosti nainstalovány.');
} catch (err) {
  console.error('❌ Instalace závislostí selhala! Zkus ručně: pnpm install');
  process.exit(1);
}

// --- 4) Inicializace Git ---
const gitResponse = await prompts({
  type: 'confirm',
  name: 'gitInit',
  message: 'Inicializovat Git repo?',
  initial: true
});

if (gitResponse.gitInit) {
  try {
    execSync('git init', { cwd: path.join(cwd, projectName), stdio: 'inherit' });
    console.log('✅ Git repo inicializováno.');
  } catch (err) {
    console.warn('⚠️ Git repo nebylo inicializováno:', err.message);
  }
}

// --- 5) Interaktivní dotaz na Supabase + Prisma ---
const dbResponse = await prompts({
  type: 'confirm',
  name: 'setupDb',
  message: 'Chceš inicializovat lokální Supabase + Prisma (migrace + seed)?',
  initial: true
});

if (dbResponse.setupDb) {
  const scriptPath = path.join(cwd, projectName, 'scripts', 'start-local-db.sh');
  if (fs.existsSync(scriptPath)) {
    console.log('🚀 Spouštím lokální DB + migrace + seed...');
    try {
      execSync(`bash ${scriptPath}`, { stdio: 'inherit' });
      console.log('✅ Lokální Supabase + Prisma připraveny!');
    } catch (err) {
      console.error('❌ Chyba při inicializaci DB:', err.message);
    }
  } else {
    console.warn('⚠️ Skript start-local-db.sh nenalezen, přeskočeno.');
  }
} else {
  console.log('Lokální Supabase + Prisma nebyly inicializovány.');
}

console.log(`✨ Hotovo! Přesuň se do projektu: cd ${projectName} a spusť: pnpm run dev`);
