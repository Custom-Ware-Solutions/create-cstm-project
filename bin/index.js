#!/usr/bin/env node
import prompts from "prompts";
import chalk from "chalk";
import { execa } from "execa";
import degit from "degit";
import fs from "fs";
import path from "path";

console.log(chalk.cyan("🚀 CSTM Project Bootstrap"));

// Ověření Node
try {
  const { stdout } = await execa("node", ["-v"]);
  console.log(chalk.green(`✅ Node.js nalezen: ${stdout}`));
} catch {
  console.error(chalk.red("❌ Node.js není nainstalován nebo není v PATH. Instalujte Node 20+ z https://nodejs.org/"));
  process.exit(1);
}

// Ověření Git
try {
  await execa("git", ["--version"]);
  console.log(chalk.green("✅ Git nalezen"));
} catch {
  console.error(chalk.red("❌ Git není nainstalován nebo není v PATH"));
  process.exit(1);
}

// Prefer pnpm, fallback npm
let packageManager = "npm";
try {
  await execa("pnpm", ["--version"]);
  packageManager = "pnpm";
} catch {}

console.log(chalk.cyan(`📦 Používáme balíčkovač: ${packageManager}`));

// Interaktivní dotazy
const response = await prompts([
  { type: "text", name: "project", message: "👉 Název projektu:", initial: "my-app" },
  { type: "toggle", name: "git", message: "Inicializovat Git?", initial: true, active: "yes", inactive: "no" }
]);

const projectPath = path.resolve(response.project);
if (!fs.existsSync(projectPath)) fs.mkdirSync(projectPath, { recursive: true });

console.log(chalk.yellow("📦 Klonuji template..."));
try {
  await degit("Custom-Ware-Solutions/cstm-project-template#main", {
    cache: false,
    force: true,
    verbose: true
  }).clone(projectPath);
  console.log(chalk.green("✅ Template úspěšně naklonován"));
} catch (err) {
  console.error(chalk.red("❌ Chyba při stahování template repa!"));
  console.error(chalk.red("Zkontrolujte, zda repozitář existuje a máte přístup (GH_TOKEN pro private rep)."));
  console.error(chalk.red(err.message));
  process.exit(1);
}

// Instalace závislostí
process.chdir(projectPath);
console.log(chalk.yellow(`📦 Instalace závislostí přes ${packageManager}...`));
try {
  await execa(packageManager, ["install"], { stdio: "inherit" });
  console.log(chalk.green("✅ Závislosti nainstalovány"));
} catch (err) {
  console.error(chalk.red("❌ Instalace závislostí selhala!"));
  console.error(chalk.red(`Zkuste ručně: '${packageManager} install'`));
  process.exit(1);
}

// Git init
if (response.git) {
  try {
    await execa("git", ["init"], { stdio: "inherit" });
    console.log(chalk.green("✅ Git repo inicializováno"));
  } catch (err) {
    console.error(chalk.red("❌ Git init selhalo!"));
  }
}

console.log(chalk.cyan("\n✨ Hotovo! Teď spusť:"));
console.log(chalk.white(`cd ${response.project}`));
console.log(chalk.white(`${packageManager} run dev`));
