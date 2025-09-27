#!/usr/bin/env node
import prompts from 'prompts';
import inquirer from 'inquirer';
import fsExtra from 'fs-extra';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import degit from 'degit';
import process from 'process';

(async () => {
  const cwd = process.cwd();

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

  // --- 2b) Zkopírování placeholder souborů ---
  const placeholdersDir = path.resolve(new URL('.', import.meta.url).pathname, '../app'); 
  const targetAppDir = path.join(targetPath, 'app');
  if (!fs.existsSync(targetAppDir)) fs.mkdirSync(targetAppDir, { recursive: true });

  // kopírování page.tsx
  const sourcePage = path.join(placeholdersDir, 'page.tsx');
  fsExtra.copySync(sourcePage, path.join(targetAppDir, 'page.tsx'));

  // kopírování demo API
  const sourceApi = path.join(placeholdersDir, 'route.ts');
  const targetApiDir = path.join(targetAppDir, 'api', 'todos');
  fs.mkdirSync(targetApiDir, { recursive: true });
  fsExtra.copySync(sourceApi, path.join(targetApiDir, 'route.ts'));

  console.log('✅ Placeholder soubory nakopírovány.');

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

  console.log(`✨ Hotovo! Přesuň se do projektu: cd ${projectName} a spusť: pnpm run dev`);
})();
