#!/usr/bin/env node
import prompts from "prompts";
import chalk from "chalk";
import { execa } from "execa";
import degit from "degit";
import fs from "fs";

function checkCommand(cmd) {
  try {
    execa.sync(cmd, ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

if (!checkCommand("node")) {
  console.error(chalk.red("❌ Node.js není nainstalován nebo není v PATH"));
  process.exit(1);
}
if (!checkCommand("git")) {
  console.error(chalk.red("❌ Git není nainstalován nebo není v PATH"));
  process.exit(1);
}

// prefer pnpm, fallback npm
const packageManager = checkCommand("pnpm") ? "pnpm" : "npm";

console.log(chalk.cyan(`🚀 CSTM Project Bootstrap (${packageManager})`));

const response = await prompts([
  { type: "text", name: "project", message: "👉 Název projektu:", initial: "my-app" },
  { type: "toggle", name: "git", message: "Inicializovat Git?", initial: true, active: "yes", inactive: "no" }
]);

if (!fs.existsSync(response.project)) fs.mkdirSync(response.project);

console.log(chalk.yellow("📦 Klonuji template..."));
try {
  await degit("Custom-Ware-Solutions/cstm-project-template#main", {
    cache: false,
    force: true,
    verbose: true
  }).clone(response.project);
} catch (err) {
  console.error(chalk.red("❌ Chyba při stahování template repa!"));
  console.error(chalk.red("Zkontrolujte, zda repozitář existuje a máte přístup."));
  console.error(chalk.red(err.message));
  process.exit(1);
}

process.chdir(response.project);

console.log(chalk.yellow(`📦 Instalace závislostí přes ${packageManager}...`));
try {
  await execa(packageManager, ["install"], { stdio: "inherit" });
} catch (err) {
  console.error(chalk.red("❌ Instalace závislostí selhala!"));
  console.error(chalk.red(`Zkuste spustit ručně: '${packageManager} install'`));
  console.error(chalk.red("Na Windows doporučujeme PowerShell s administrátorskými právy."));
  console.error(chalk.red(err.shortMessage || err.message));
  process.exit(1);
}

if (response.git) {
  try {
    await execa("git", ["init"], { stdio: "inherit" });
    console.log(chalk.green("✅ Git repo inicializováno"));
  } catch (err) {
    console.error(chalk.red("❌ Git init selhalo!"));
  }
}

console.log(chalk.cyan("\n✨ Hotovo! Teď:"));
console.log(chalk.white(`cd ${response.project}`));
console.log(chalk.white(`${packageManager} run dev`));
