#!/usr/bin/env node
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import fsExtra from 'fs-extra';

const cwd = process.cwd();

// --- interaktivní dotazy ---
const answers = await inquirer.prompt([
  { type: 'input', name: 'projectName', message: 'Název projektu:' },
  { type: 'confirm', name: 'setupDb', message: 'Chceš inicializovat Supabase + Prisma DB?', default: true },
]);

const projectName = answers.projectName;
const targetPath = path.join(cwd, projectName);

// --- vytvoření adresáře projektu ---
if (!fs.existsSync(targetPath)) fs.mkdirSync(targetPath);

// --- kopírování template ---
const templatePath = path.join(__dirname, '..', 'template');
try {
  fsExtra.copySync(templatePath, targetPath, { overwrite: true });
  console.log('✅ Template soubory nakopírovány.');
} catch (err) {
  console.error('❌ Chyba při kopírování template:', err.message);
  process.exit(1);
}

// --- instalace závislostí ---
console.log('📦 Instalace závislostí...');
try {
  execSync('pnpm install', { cwd: targetPath, stdio: 'inherit' });
  console.log('✅ Závislosti nainstalovány.');
} catch (err) {
  console.error('❌ Instalace selhala! Zkus ručně: pnpm install');
  process.exit(1);
}

// --- inicializace Git ---
const gitInit = await inquirer.prompt([{ type: 'confirm', name: 'gitInit', message: 'Inicializovat Git?', default: true }]);
if (gitInit.gitInit) {
  execSync('git init', { cwd: targetPath, stdio: 'inherit' });
  console.log('✅ Git repo inicializováno.');
}

// --- volitelná inicializace DB ---
if (answers.setupDb) {
  const scriptPath = path.join(targetPath, 'scripts', 'start-local-db.js');
  if (fs.existsSync(scriptPath)) {
    console.log('🚀 Spouštím lokální DB + migrace + seed...');
    try {
      execSync(`node ${scriptPath}`, { stdio: 'inherit' });
      console.log('✅ Lokální Supabase + Prisma připraveny!');
    } catch (err) {
      console.error('❌ Chyba při inicializaci DB:', err.message);
    }
  } else {
    console.warn('⚠️ Skript start-local-db.js nenalezen, přeskočeno.');
  }
}

console.log(`🎉 Hotovo! Přesuň se do projektu: cd ${projectName} a spusť pnpm run dev`);
