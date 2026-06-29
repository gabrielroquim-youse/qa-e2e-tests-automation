#!/usr/bin/env ts-node
/**
 * Gera allure-results/environment.properties com contexto de rastreabilidade.
 * Executado antes de allure generate para que o painel mostre Branch, Data e Env.
 *
 * Uso: ts-node scripts/allure-environment.ts
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ALLURE_RESULTS = join(process.cwd(), 'allure-results');

function git(cmd: string): string {
  try {
    return execSync(`git ${cmd}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch {
    return 'unknown';
  }
}

function nodeVersion(): string {
  try {
    return execSync('node --version', { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

function main() {
  if (!existsSync(ALLURE_RESULTS)) {
    mkdirSync(ALLURE_RESULTS, { recursive: true });
  }

  const branch = git('rev-parse --abbrev-ref HEAD');
  const commit = git('rev-parse --short HEAD');
  const author = git('log -1 --pretty=%an');
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const content = [
    `Branch=${branch}`,
    `Commit=${commit}`,
    `Author=${author}`,
    `Date=${dateStr} ${timeStr}`,
    `Environment=QA`,
    `BaseURL=qa-cotacao.youse.io/seguro-auto`,
    `Node=${nodeVersion()}`,
    `Produto=Seguro Auto B2C`,
  ].join('\n');

  const dest = join(ALLURE_RESULTS, 'environment.properties');
  writeFileSync(dest, content, 'utf-8');
  console.log(`[allure-environment] Gerado: ${dest}`);
  console.log(content);
}

main();
