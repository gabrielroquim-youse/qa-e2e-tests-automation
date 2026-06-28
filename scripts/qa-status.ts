/**
 * Painel rápido de status QA — cobertura + timing + comandos sugeridos.
 *
 * Uso: npm run qa:status
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

function readCoveragePercent(): string {
  const readme = join(root, 'docs/coverage/README.md');
  if (!existsSync(readme)) return '—';
  const match = readFileSync(readme, 'utf-8').match(/\*\*(\d+)%\*\*/);
  return match ? `${match[1]}%` : '—';
}

function readTestCount(): string {
  const readme = join(root, 'docs/coverage/README.md');
  if (!existsSync(readme)) return '—';
  const match = readFileSync(readme, 'utf-8').match(/`(\d+)` testes E2E/);
  return match ? match[1] : '—';
}

function readLastUxTiming(): string {
  const report = join(root, 'docs/reports/e2e-timing-report.md');
  if (!existsSync(report)) return 'aguardando npm run test:ux:timing';
  const text = readFileSync(report, 'utf-8');
  const wall = text.match(/Wall[- ]clock[:\s]+([^\n]+)/i)?.[1]?.trim();
  const passed = text.match(/(\d+)\s*\/\s*(\d+)\s*passed/i);
  if (wall && passed) return `${passed[1]}/${passed[2]} · ${wall}`;
  return 'ver docs/reports/e2e-timing-report.md';
}

function main(): void {
  console.log('\n══════════════════════════════════════════════════');
  console.log('  QA Status — qa-e2e-tests-automation (Seguro Auto)');
  console.log('══════════════════════════════════════════════════\n');
  console.log(`  Cobertura funcional : ${readCoveragePercent()}`);
  console.log(`  Testes E2E          : ${readTestCount()}`);
  console.log(`  Último timing UX    : ${readLastUxTiming()}`);
  console.log('\n  Dashboards:');
  console.log('    docs/coverage/README.md');
  console.log('    docs/reports/e2e-timing-report.md');
  console.log('\n  Comandos frequentes:');
  console.log('    npm run validate          # typecheck + lint');
  console.log('    npm run test:smoke        # PR rápido (VPN)');
  console.log('    npm run test:ux:timing    # UX + dashboard');
  console.log('    npm run test:payment      # PIX + cartões');
  console.log('    npm run coverage:sync     # atualizar CAPs');
  console.log('\n  Agente IA:');
  console.log('    Use o skill qa-orchestrator no Cursor');
  console.log('    Guia prompts: docs/guides/prompt-engineering-qa.md');
  console.log('\n══════════════════════════════════════════════════\n');
}

main();
