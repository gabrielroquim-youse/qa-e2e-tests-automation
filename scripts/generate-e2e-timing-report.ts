#!/usr/bin/env ts-node
/**
 * Gera relatório de tempo de execução dos testes E2E.
 *
 * Saídas:
 *   docs/reports/e2e-timing-report.md  — tabelas por spec e ranking de lentidão
 *   docs/reports/e2e-timing.json       — métricas machine-readable
 *
 * Entrada (uma das opções):
 *   reports/e2e-timing-raw.json     — reporter JSON do Playwright (padrão)
 *   --from-log <arquivo>            — stdout do reporter `list`
 *   --run                           — executa a suite e2e e captura JSON
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  appendTimingLog,
  formatDuration,
  formatUtc,
  renderE2eLogMarkdown,
  renderRecentRunsSection,
  resolveExecutionId,
  saveExecutionFolder,
  type TimingLogEntry,
} from './lib/timingHistory';

const ROOT = join(__dirname, '..');
const REPORTS_DIR = join(ROOT, 'reports');
const RAW_JSON = join(REPORTS_DIR, 'e2e-timing-raw.json');
const MD_PATH = join(ROOT, 'docs', 'reports', 'e2e-timing-report.md');
const JSON_PATH = join(ROOT, 'docs', 'reports', 'e2e-timing.json');

type TestStatus = 'passed' | 'failed' | 'skipped' | 'flaky';

interface TestTiming {
  specFile: string;
  line: number;
  suite: string;
  title: string;
  status: TestStatus;
  durationMs: number | null;
  tags: string[];
}

interface SpecSummary {
  specFile: string;
  tests: number;
  passed: number;
  failed: number;
  skipped: number;
  totalMs: number;
  avgMs: number;
  maxMs: number;
}

interface TimingReport {
  generatedAt: string;
  source: string;
  wallClockMs: number | null;
  workers: number | null;
  totals: { tests: number; passed: number; failed: number; skipped: number; totalMs: number };
  bySpec: SpecSummary[];
  tests: TestTiming[];
}

interface PlaywrightJsonReport {
  config?: { metadata?: { actualWorkers?: number }; workers?: number };
  stats?: { duration?: number; expected?: number; skipped?: number; unexpected?: number; flaky?: number };
  suites?: PlaywrightSuite[];
}

interface PlaywrightSuite {
  title?: string;
  file?: string;
  line?: number;
  specs?: PlaywrightSpec[];
  suites?: PlaywrightSuite[];
}

interface PlaywrightSpec {
  title?: string;
  file?: string;
  line?: number;
  tags?: string[];
  ok?: boolean;
  tests?: {
    results?: { status?: string; duration?: number }[];
  }[];
}

function parseArgs(argv: string[]): { fromLog?: string; run: boolean; input: string } {
  let fromLog: string | undefined;
  let run = false;
  let input = RAW_JSON;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--from-log' && argv[i + 1]) {
      fromLog = argv[++i];
    } else if (argv[i] === '--run') {
      run = true;
    } else if (argv[i] === '--input' && argv[i + 1]) {
      input = argv[++i];
    }
  }

  return { fromLog, run, input };
}

function readText(path: string): string {
  return readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
}

function mapStatus(raw: string | undefined, ok?: boolean): TestStatus {
  if (raw === 'skipped' || (raw === 'expected' && ok === false)) return 'skipped';
  if (raw === 'failed' || raw === 'timedOut' || raw === 'interrupted') return 'failed';
  if (raw === 'flaky') return 'flaky';
  if (raw === 'passed' || ok === true) return 'passed';
  return raw === 'skipped' ? 'skipped' : 'failed';
}

function parseListDuration(text: string): number | null {
  const m = text.match(/\(([\d.]+)\s*(m|s|min)\)\s*$/i);
  if (!m) return null;
  const value = parseFloat(m[1]);
  const unit = m[2].toLowerCase();
  return unit === 's' ? value * 1000 : value * 60_000;
}

/** Path relativo a `tests/spec/e2e/` (ex.: `journeys/cotacao-plano-regular.spec.ts`). */
function extractSpecRelativePath(rawFile: string): string {
  const normalized = rawFile.replace(/\\/g, '/');
  if (normalized.includes('/e2e/')) {
    return normalized.split('/e2e/').pop() ?? 'unknown.spec.ts';
  }
  if (normalized.startsWith('e2e/')) {
    return normalized.slice('e2e/'.length);
  }
  return normalized.split('/').pop() ?? 'unknown.spec.ts';
}

function parseListLog(content: string): { tests: TestTiming[]; wallClockMs: number | null } {
  const tests: TestTiming[] = [];
  let wallClockMs: number | null = null;

  for (const line of content.split(/\r?\n/)) {
    const summary = line.match(/(\d+)\s+passed\s+\(([\d.]+)\s*m\)/i);
    if (summary) {
      wallClockMs = parseFloat(summary[2]) * 60_000;
    }

    const statusHead = line.match(/^\s*(ok|x|-)\s+\d+/i);
    if (!statusHead) continue;

    const status: TestStatus = statusHead[1] === 'ok' ? 'passed' : statusHead[1] === 'x' ? 'failed' : 'skipped';

    const fileMatch = line.match(/e2e[\\/]([^:]+\.spec\.ts):(\d+):/i);
    if (!fileMatch) continue;

    const specFile = fileMatch[1];
    const lineNo = parseInt(fileMatch[2], 10);
    const durationMs = parseListDuration(line);
    const tags = [...line.matchAll(/@([\w_]+)/g)].map((m) => m[1]);

    const segments = line.split(/\u203A|\u00BB|›/);
    const title = segments.length >= 2 ? segments[segments.length - 1].replace(/\([\d.]+[ms]+\)\s*$/i, '').trim() : specFile;
    const suite = segments.length >= 3 ? segments[segments.length - 2].trim() : '';

    tests.push({ specFile, line: lineNo, suite, title, status, durationMs, tags });
  }

  return { tests, wallClockMs };
}

function walkSuites(suites: PlaywrightSuite[] | undefined, parentTitle: string, acc: TestTiming[]): void {
  if (!suites) return;

  for (const suite of suites) {
    const suiteTitle = suite.title && !suite.title.includes('.spec.ts') ? suite.title : parentTitle;

    for (const spec of suite.specs ?? []) {
      const rawFile = (spec.file ?? suite.file ?? '').replace(/\\/g, '/');
      const specFile = extractSpecRelativePath(rawFile);
      const pwTests = spec.tests ?? [];
      const result = pwTests[0]?.results?.[0];
      const status = mapStatus(result?.status, spec.ok);
      const durationMs = result?.duration ?? null;

      acc.push({
        specFile,
        line: spec.line ?? 0,
        suite: suiteTitle,
        title: spec.title ?? '',
        status,
        durationMs,
        tags: spec.tags ?? [],
      });
    }

    walkSuites(suite.suites, suite.title ?? parentTitle, acc);
  }
}

function parsePlaywrightJson(content: string): { tests: TestTiming[]; wallClockMs: number | null; workers: number | null } {
  const report = JSON.parse(content) as PlaywrightJsonReport;
  const tests: TestTiming[] = [];
  walkSuites(report.suites, '', tests);

  return {
    tests,
    wallClockMs: report.stats?.duration ?? null,
    workers: report.config?.metadata?.actualWorkers ?? report.config?.workers ?? null,
  };
}

function buildReport(tests: TestTiming[], source: string, wallClockMs: number | null, workers: number | null): TimingReport {
  const bySpecMap = new Map<string, SpecSummary>();

  for (const t of tests) {
    let spec = bySpecMap.get(t.specFile);
    if (!spec) {
      spec = { specFile: t.specFile, tests: 0, passed: 0, failed: 0, skipped: 0, totalMs: 0, avgMs: 0, maxMs: 0 };
      bySpecMap.set(t.specFile, spec);
    }
    spec.tests++;
    if (t.status === 'passed' || t.status === 'flaky') spec.passed++;
    else if (t.status === 'failed') spec.failed++;
    else spec.skipped++;
    if (t.durationMs !== null) {
      spec.totalMs += t.durationMs;
      spec.maxMs = Math.max(spec.maxMs, t.durationMs);
    }
  }

  for (const spec of bySpecMap.values()) {
    const timed = tests.filter((t) => t.specFile === spec.specFile && t.durationMs !== null);
    spec.avgMs = timed.length ? spec.totalMs / timed.length : 0;
  }

  const bySpec = [...bySpecMap.values()].sort((a, b) => b.totalMs - a.totalMs);
  const totalMs = tests.reduce((sum, t) => sum + (t.durationMs ?? 0), 0);

  return {
    generatedAt: new Date().toISOString(),
    source,
    wallClockMs,
    workers,
    totals: {
      tests: tests.length,
      passed: tests.filter((t) => t.status === 'passed' || t.status === 'flaky').length,
      failed: tests.filter((t) => t.status === 'failed').length,
      skipped: tests.filter((t) => t.status === 'skipped').length,
      totalMs,
    },
    bySpec,
    tests: [...tests].sort((a, b) => (b.durationMs ?? 0) - (a.durationMs ?? 0)),
  };
}

function statusIcon(status: TestStatus): string {
  if (status === 'passed' || status === 'flaky') return '✅';
  if (status === 'skipped') return '⏭️';
  return '❌';
}

function renderMarkdown(report: TimingReport, runLog: TimingLogEntry[], executionId: string, inHistory = false): string {
  const generatedAt = formatUtc(report.generatedAt);
  const wall = report.wallClockMs !== null ? formatDuration(report.wallClockMs) : '—';
  const sumTests = report.tests.reduce((s, t) => s + (t.durationMs ?? 0), 0);
  const overhead =
    report.wallClockMs !== null && sumTests > 0 ? `${(((report.wallClockMs - sumTests) / report.wallClockMs) * 100).toFixed(0)}%` : '—';
  const jsonLink = inHistory ? '[e2e.json](./e2e.json)' : '[e2e-timing.json](e2e-timing.json)';
  const logLink = inHistory ? '../../e2e-timing-log.md' : 'e2e-timing-log.md';

  const lines: string[] = [
    '# Relatório de Tempo — Testes E2E Seguro Auto',
    '',
    `> Execução **${executionId}** · gerado em **${generatedAt}** · fonte: \`${report.source}\` · ${jsonLink}`,
    inHistory ? `> Índice: [e2e-timing-log.md](${logLink})` : '',
    '',
    '## Resumo',
    '',
    '| Métrica | Valor |',
    '|---------|------:|',
    `| Testes | ${report.totals.tests} |`,
    `| Passou | ${report.totals.passed} |`,
    `| Falhou | ${report.totals.failed} |`,
    `| Pulou | ${report.totals.skipped} |`,
    `| Tempo wall-clock | ${wall} |`,
    `| Soma dos testes | ${formatDuration(report.totals.totalMs)} |`,
    `| Workers | ${report.workers ?? '—'} |`,
    `| Overhead (wall − soma) | ${overhead} |`,
    '',
    '## Tempo por spec (ordenado por duração total)',
    '',
    '| Spec | Testes | Passou | Falhou | Pulou | Total | Média | Máx |',
    '|------|-------:|-------:|-------:|------:|------:|------:|----:|',
  ];

  for (const s of report.bySpec) {
    lines.push(
      `| \`${s.specFile}\` | ${s.tests} | ${s.passed} | ${s.failed} | ${s.skipped} | ${formatDuration(s.totalMs)} | ${formatDuration(s.avgMs)} | ${formatDuration(s.maxMs)} |`,
    );
  }

  lines.push('', '## Top 15 testes mais lentos', '', '| # | Spec | Teste | Status | Tempo |', '|--:|------|-------|:------:|------:|');

  report.tests.slice(0, 15).forEach((t, i) => {
    const shortTitle = t.title.length > 70 ? `${t.title.slice(0, 67)}…` : t.title;
    lines.push(`| ${i + 1} | \`${t.specFile}\` | ${shortTitle} | ${statusIcon(t.status)} | ${formatDuration(t.durationMs)} |`);
  });

  lines.push(
    '',
    '## Detalhamento completo',
    '',
    '| Spec | Linha | Suite | Teste | Status | Tempo | Tags |',
    '|------|------:|-------|-------|:------:|------:|------|',
  );

  for (const t of [...report.tests].sort((a, b) => a.specFile.localeCompare(b.specFile) || a.line - b.line)) {
    const tags = t.tags.length ? t.tags.map((x) => `@${x}`).join(' ') : '—';
    const shortTitle = t.title.replace(/\|/g, '\\|');
    lines.push(
      `| \`${t.specFile}\` | ${t.line} | ${t.suite.replace(/\|/g, '\\|')} | ${shortTitle} | ${statusIcon(t.status)} | ${formatDuration(t.durationMs)} | ${tags} |`,
    );
  }

  const historySection = inHistory ? '' : renderRecentRunsSection('Histórico de execuções', runLog, 'e2e-timing-log.md');
  if (historySection) {
    lines.push('', historySection);
  }

  lines.push('', '---', '*Gerado por `npm run e2e:timing:generate` — não editar manualmente.*', '');

  return lines.join('\n');
}

function runPlaywrightJson(): number {
  mkdirSync(REPORTS_DIR, { recursive: true });
  console.log('Executando suite E2E (tests/spec/e2e) — pode levar ~30 min…');
  const cmd = 'npx playwright test tests/spec/e2e --project=chromium --reporter=list --reporter=json';
  const env = { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: RAW_JSON };
  try {
    execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: 'inherit',
      env,
    });
  } catch (error) {
    const execError = error as { status?: number };
    if (!existsSync(RAW_JSON)) {
      const fallback = execError as { stdout?: string };
      const json = fallback.stdout?.replace(/^\uFEFF/, '') ?? '';
      if (json.trim()) writeFileSync(RAW_JSON, json, 'utf8');
      else throw error;
    }
    console.warn(`Suite E2E terminou com exit ${execError.status ?? 1} — JSON capturado para relatório de tempo.`);
    return execError.status ?? 1;
  }
  if (!existsSync(RAW_JSON)) {
    throw new Error(`JSON não gerado em ${RAW_JSON}`);
  }
  console.log(`JSON salvo em ${relativePath(RAW_JSON)}`);
  return 0;
}

function relativePath(abs: string): string {
  return abs.replace(/\\/g, '/').replace(`${ROOT.replace(/\\/g, '/')}/`, '');
}

function printTimingDeltaFromLog(previous: TimingLogEntry, current: TimingReport): void {
  const prevWall = previous.wallClockMs ?? previous.sumTestsMs;
  const currWall = current.wallClockMs ?? current.totals.totalMs;
  if (prevWall > 0) {
    const deltaPct = (((currWall - prevWall) / prevWall) * 100).toFixed(1);
    const sign = currWall >= prevWall ? '+' : '';
    console.log(`\nComparativo vs execução anterior (${formatUtc(previous.generatedAt)}):`);
    console.log(`  Wall-clock: ${formatDuration(prevWall)} → ${formatDuration(currWall)} (${sign}${deltaPct}%)`);
  }

  const snapshotName = previous.source?.replace(/^history\//, '');
  if (!snapshotName) return;

  const snapshotPath = join(ROOT, 'docs', 'reports', 'history', snapshotName, 'e2e.json');
  if (!existsSync(snapshotPath)) return;

  try {
    const prevReport = JSON.parse(readFileSync(snapshotPath, 'utf8')) as TimingReport;
    const prevBySpec = new Map(prevReport.bySpec.map((s) => [s.specFile, s]));
    const regressions = current.bySpec
      .map((s) => {
        const prev = prevBySpec.get(s.specFile);
        if (!prev || prev.totalMs <= 0) return null;
        const deltaPct = ((s.totalMs - prev.totalMs) / prev.totalMs) * 100;
        return deltaPct > 15 ? { spec: s.specFile, prev: prev.totalMs, curr: s.totalMs, deltaPct } : null;
      })
      .filter(Boolean) as { spec: string; prev: number; curr: number; deltaPct: number }[];

    if (regressions.length) {
      console.log('  Specs >15% mais lentos que a execução anterior:');
      for (const r of regressions.sort((a, b) => b.deltaPct - a.deltaPct)) {
        console.log(`    ${r.spec}: ${formatDuration(r.prev)} → ${formatDuration(r.curr)} (+${r.deltaPct.toFixed(0)}%)`);
      }
    } else {
      console.log('  Nenhuma regressão >15% por spec vs execução anterior.');
    }
  } catch {
    // snapshot anterior ilegível — ignora comparativo por spec
  }
}

function main(): void {
  const { fromLog, run, input } = parseArgs(process.argv.slice(2));

  if (run) {
    const exitCode = runPlaywrightJson();
    if (exitCode !== 0) {
      process.exitCode = exitCode;
    }
  }

  let tests: TestTiming[];
  let wallClockMs: number | null;
  let workers: number | null = null;
  let source: string;

  if (fromLog) {
    const logPath = join(process.cwd(), fromLog);
    if (!existsSync(logPath)) {
      throw new Error(`Log não encontrado: ${logPath}`);
    }
    source = relativePath(logPath);
    ({ tests, wallClockMs } = parseListLog(readText(logPath)));
  } else {
    const jsonPath = input.startsWith('/') || /^[A-Z]:/i.test(input) ? input : join(ROOT, input);
    if (!existsSync(jsonPath)) {
      throw new Error(
        `Arquivo JSON não encontrado: ${jsonPath}\n` +
          'Execute: npm run test:e2e:timing\n' +
          'Ou: npx playwright test tests/spec/e2e --project=chromium --reporter=json > reports/e2e-timing-raw.json',
      );
    }
    source = relativePath(jsonPath);
    const parsed = parsePlaywrightJson(readText(jsonPath));
    tests = parsed.tests;
    wallClockMs = parsed.wallClockMs;
    workers = parsed.workers;
  }

  if (tests.length === 0) {
    throw new Error('Nenhum teste encontrado na entrada. Verifique o arquivo de report.');
  }

  const report = buildReport(tests, source, wallClockMs, workers);
  const executionId = resolveExecutionId({ generatedAt: report.generatedAt });

  const historyDir = join(ROOT, 'docs', 'reports', 'history');
  const reportMd = renderMarkdown(report, [], executionId, true);
  const executionFolder = saveExecutionFolder({
    historyDir,
    executionId,
    metadata: {
      executionId,
      e2e: {
        generatedAt: report.generatedAt,
        source: report.source,
        totals: report.totals,
        workers: report.workers,
      },
    },
    files: [
      { name: 'e2e.json', content: `${JSON.stringify(report, null, 2)}\n` },
      { name: 'e2e-report.md', content: reportMd },
    ],
  });

  const logJsonPath = join(ROOT, 'docs', 'reports', 'e2e-timing-log.json');
  const logEntry: TimingLogEntry = {
    executionId,
    generatedAt: report.generatedAt,
    source: executionFolder,
    reportFile: `${executionFolder}/e2e-report.md`,
    logFile: null,
    tests: report.totals.tests,
    passed: report.totals.passed,
    failed: report.totals.failed,
    skipped: report.totals.skipped,
    wallClockMs: report.wallClockMs,
    sumTestsMs: report.totals.totalMs,
    workers: report.workers,
  };
  const runLog = appendTimingLog(logJsonPath, logEntry);

  writeFileSync(MD_PATH, renderMarkdown(report, runLog, executionId), 'utf8');
  writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  writeFileSync(join(ROOT, 'docs', 'reports', 'e2e-timing-log.md'), renderE2eLogMarkdown(runLog), 'utf8');

  const previousReport = runLog[1] ?? null;
  if (previousReport) {
    printTimingDeltaFromLog(previousReport, report);
  }

  console.log(`Relatório: ${relativePath(MD_PATH)} (${report.totals.tests} testes)`);
  console.log(`Métricas:  ${relativePath(JSON_PATH)}`);
  console.log(`Log de tempo: docs/reports/e2e-timing-log.md (${runLog.length} execuções)`);
  console.log(`Execução: docs/reports/${executionFolder}/`);
  console.log(`Wall-clock: ${formatDuration(report.wallClockMs)} · Soma testes: ${formatDuration(report.totals.totalMs)}`);
}

main();
