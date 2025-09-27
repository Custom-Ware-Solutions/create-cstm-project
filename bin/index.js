#!/usr/bin/env node
import prompts from 'prompts';
import inquirer from 'inquirer';
import fsExtra from 'fs-extra';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import degit from 'degit';
import process from 'process';
import { fileURLToPath } from 'url';

const cwd = process.cwd();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1) Název projektu ---
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
const targetPath = path.join(cwd, projectName);
console.log(`√ Projekt: ${projectName}`);

// --- 2) Klon template ---
console.log('📦 Klonuji template...');
const emitter = degit('Custom-Ware-Solutions/cstm-project-template', {
  cache: false,
  force: true,
  verbose: true
});

try {
  await emitter.clone(targetPath);
  console.log('✅ Template naklonován.');
} catch (err) {
  console.error('❌ Chyba při klonování template:', err.message);
  process.exit(1);
}

// --- 3) Instalace dependencies projektu ---
console.log('📦 Instalace závislostí projektu...');
try {
  execSync('pnpm install', { cwd: targetPath, stdio: 'inherit' });
  console.log('✅ Závislosti nainstalovány.');
} catch (err) {
  console.error('❌ Instalace selhala! Zkus: cd', projectName, '&& pnpm install');
  process.exit(1);
}

// --- 4) Inicializace Git ---
const gitInit = await inquirer.prompt([
  { type: 'confirm', name: 'gitInit', message: 'Inicializovat Git?', default: true }
]);
if (gitInit.gitInit) {
  try {
    execSync('git init', { cwd: targetPath, stdio: 'inherit' });
    console.log('✅ Git repo inicializováno.');
  } catch (err) {
    console.warn('⚠️ Git repo nebylo inicializováno:', err.message);
  }
}

// --- 5) Inicializace Supabase + Prisma ---
const dbSetup = await inquirer.prompt([
  { type: 'confirm', name: 'setupDb', message: 'Chceš inicializovat lokální Supabase + Prisma?', default: true }
]);
if (dbSetup.setupDb) {
  const scriptPath = path.join(targetPath, 'scripts', 'start-local-db.js');
  if (fs.existsSync(scriptPath)) {
    console.log('🚀 Spouštím lokální DB + migrace + seed...');
    try {
      execSync(`node ${scriptPath}`, { cwd: targetPath, stdio: 'inherit' });
      console.log('✅ Lokální DB připravena.');
    } catch (err) {
      console.error('❌ Chyba při inicializaci DB:', err.message);
    }
  } else {
    console.warn('⚠️ start-local-db.js nenalezen. Přeskočeno.');
  }
}

// --- 6) Přidání placeholderu page.tsx ---
const placeholdersDir = path.join(__dirname, '../app');
const destAppDir = path.join(targetPath, 'app');
fsExtra.ensureDirSync(destAppDir);

try {
  fsExtra.copySync(path.join(placeholdersDir, 'page.tsx'), path.join(destAppDir, 'page.tsx'), { overwrite: true });
  console.log('✅ Placeholder page.tsx vytvořen v projektu.');
} catch (err) {
  console.warn('⚠️ Nepodařilo se zkopírovat placeholder page.tsx:', err.message);
}

console.log(`✨ Hotovo! Přesuň se do projektu: cd ${projectName} a spusť: pnpm run dev`);
