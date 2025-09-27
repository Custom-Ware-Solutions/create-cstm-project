#!/usr/bin/env node
import prompts from "prompts";
import chalk from "chalk";
import { execa } from "execa";
import degit from "degit";
import fs from "fs";

console.log(chalk.cyan("🚀 CSTM Project Bootstrap"));

const response = await prompts([
  { type: "text", name: "project", message: "👉 Název projektu:", initial: "my-app" },
  { type: "toggle", name: "git", message: "Inicializovat Git?", initial: true, active: "yes", inactive: "no" }
]);

if (!fs.existsSync(response.project)) fs.mkdirSync(response.project);

console.log(chalk.yellow("📦 Klonuji template..."));
await degit("Custom-Ware-Solutions/cstm-project-template", { cache: false, force: true, verbose: true }).clone(response.project);

process.chdir(response.project);
console.log(chalk.yellow("📦 Instalace závislostí..."));
await execa("npm", ["install"], { stdio: "inherit" });

if (response.git) {
  await execa("git", ["init"], { stdio: "inherit" });
  console.log(chalk.green("✅ Git repo inicializováno"));
}

console.log(chalk.cyan("\n✨ Hotovo! Teď:"));
console.log(chalk.white(`cd ${response.project}`));
console.log(chalk.white("npm run dev"));
