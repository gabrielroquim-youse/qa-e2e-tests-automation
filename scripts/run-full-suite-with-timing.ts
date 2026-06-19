#!/usr/bin/env ts-node
/**
 * Executa E2E + API + A11y com navegador visível (local) e atualiza relatórios de tempo.
 * Log: reports/full-run-YYYY-MM-DDTHHmmss.log
 */
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');
const REPORTS_DIR = join(ROOT, 'reports');
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const executionId = stamp.replace('T', '_');
const logPath = join(REPORTS_DIR, `full-run-${stamp}.log`);

function log(line: string): void {
  const entry = `[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] ${line}`;
  console.log(entry);
  writeFileSync(logPath, `${entry}\n`, { flag: 'a' });
}

function run(label: string, cmd: string, jsonOutput?: string): number {
  log(`=== INICIO ${label} ===`);
  const env: NodeJS.ProcessEnv = { ...process.env, CI: '', TIMING_EXECUTION_ID: executionId };
  if (jsonOutput) env.PLAYWRIGHT_JSON_OUTPUT_NAME = jsonOutput;
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit', env });
    log(`=== FIM ${label} — OK ===`);
    return 0;
  } catch (error) {
    const code = (error as { status?: number }).status ?? 1;
    log(`=== FIM ${label} — exit ${code} ===`);
    return code;
  }
}

mkdirSync(REPORTS_DIR, { recursive: true });
writeFileSync(logPath, '', 'utf8');

log(`Suite completa — execução ${executionId} · navegador visível (CI desligado)`);

const e2e = run('E2E + timing', 'npm run test:e2e:timing');
const api = run(
  'API',
  'npx playwright test tests/spec/api --project=chromium --reporter=list --reporter=json',
  join(REPORTS_DIR, 'api-timing-raw.json'),
);
const a11y = run(
  'A11Y',
  'npx playwright test -c playwright.a11y.config.ts --reporter=list --reporter=json',
  join(REPORTS_DIR, 'a11y-timing-raw.json'),
);

try {
  execSync(`npx ts-node scripts/generate-full-suite-timing-report.ts --log "${logPath.replace(/\\/g, '/')}"`, {
    cwd: ROOT,
    stdio: 'inherit',
  });
} catch {
  console.warn('Aviso: relatório consolidado não gerado — verifique reports/*.json');
}

const exitCode = Math.max(e2e, api, a11y);
log(`=== RESUMO E2E=${e2e} API=${api} A11Y=${a11y} ===`);
log(`Log: reports/${logPath.split(/[/\\]/).pop()}`);

process.exit(exitCode);
