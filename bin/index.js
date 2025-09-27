#!/usr/bin/env node
import prompts from 'prompts';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import process from 'process';
import degit from 'degit';
import fsExtra from 'fs-extra';

const cwd = process.cwd();

// --- 1) Název projektu ---
const { projectName } = await inquirer.prompt([
  { type: 'input', name: 'projectName', message: 'Název projektu:', default: 'my-app' }
]);
if (!projectName) {
  console.error('❌ Název projektu není validní.');
  process.exit(1);
}
const targetPath = path.join(cwd, projectName);
console.log(`√ Projekt: ${projectName}`);

// --- 2) Klonování template ---
console.log('📦 Klonuji template...');
const emitter = degit('Custom-Ware-Solutions/cstm-project-template/template', {
  cache: false,
  force: true,
  verbose: true
});
if (!fs.existsSync(targetPath)) fs.mkdirSync(targetPath);
try {
  await emitter.clone(targetPath);
  console.log('✅ Template naklonován.');
} catch (err) {
  console.error('❌ Chyba při klonování template:', err.message);
  process.exit(1);
}

// --- 3) Instalace závislostí ---
console.log('📦 Instalace závislostí...');
try {
  execSync('pnpm install', { cwd: targetPath, stdio: 'inherit' });
  console.log('✅ Závislosti nainstalovány.');
} catch (err) {
  console.error('❌ Instalace selhala! Zkus ručně: pnpm install');
  process.exit(1);
}

// --- 4) Inicializace Git ---
const { gitInit } = await inquirer.prompt([
  { type: 'confirm', name: 'gitInit', message: 'Inicializovat Git repo?', default: true }
]);
if (gitInit) {
  try {
    execSync('git init', { cwd: targetPath, stdio: 'inherit' });
    console.log('✅ Git repo inicializováno.');
  } catch (err) {
    console.warn('⚠️ Git repo nebylo inicializováno:', err.message);
  }
}

// --- 5) Volitelná inicializace DB (Supabase + Prisma) ---
const { setupDb } = await inquirer.prompt([
  { type: 'confirm', name: 'setupDb', message: 'Chceš inicializovat lokální Supabase + Prisma (migrace + seed)?', default: true }
]);
if (setupDb) {
  const scriptPath = path.join(targetPath, 'scripts', 'start-local-db.js');
  if (fs.existsSync(scriptPath)) {
    console.log('🚀 Spouštím lokální DB + migrace + seed...');
    try {
      execSync(`node ${scriptPath}`, { cwd: targetPath, stdio: 'inherit' });
      console.log('✅ Lokální DB inicializována.');
    } catch (err) {
      console.error('❌ Chyba při spouštění lokální DB:', err.message);
    }
  }
}

console.log(`✨ Hotovo! Přesuň se do projektu: cd ${projectName} a spusť: pnpm run dev`);
