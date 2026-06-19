#!/usr/bin/env ts-node
/**
 * Consolida tempos E2E + API + A11y após npm run test:full:timing.
 * Saídas: docs/reports/full-suite-timing-report.md · full-suite-timing.json
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  appendTimingLog,
  formatDuration,
  formatUtc,
  renderFullSuiteLogMarkdown,
  renderRecentRunsSection,
  resolveExecutionId,
  saveExecutionFolder,
  type TimingLogEntry,
} from './lib/timingHistory';

const ROOT = join(__dirname, '..');
const REPORTS_DIR = join(ROOT, 'reports');
const DOCS_REPORTS = join(ROOT, 'docs', 'reports');

type Layer = 'e2e' | 'api' | 'a11y';
type TestStatus = 'passed' | 'failed' | 'skipped' | 'flaky';

interface LayerSummary {
  layer: Layer;
  label: string;
  tests: number;
  passed: number;
  failed: number;
  skipped: number;
  wallClockMs: number | null;
  sumTestsMs: number;
  workers: number | null;
  exitCode: number | null;
}

interface FullSuiteReport {
  generatedAt: string;
  logFile: string | null;
  phases: { name: string; startedAt: string | null; endedAt: string | null; exitCode: number | null }[];
  layers: LayerSummary[];
  totals: { tests: number; passed: number; failed: number; skipped: number; wallClockMs: number | null; sumTestsMs: number };
}

interface PlaywrightJsonReport {
  config?: { metadata?: { actualWorkers?: number }; workers?: number };
  stats?: { duration?: number };
  suites?: PlaywrightSuite[];
}

interface PlaywrightSuite {
  specs?: { ok?: boolean; tests?: { results?: { status?: string; duration?: number }[] }[] }[];
  suites?: PlaywrightSuite[];
}

function parseArgs(argv: string[]): { log?: string } {
  let log: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--log' && argv[i + 1]) log = argv[++i];
  }
  return { log };
}

function walkSuites(suites: PlaywrightSuite[] | undefined, acc: { status: TestStatus; durationMs: number | null }[]): void {
  if (!suites) return;
  for (const suite of suites) {
    for (const spec of suite.specs ?? []) {
      const result = spec.tests?.[0]?.results?.[0];
      const raw = result?.status;
      let status: TestStatus = 'failed';
      if (raw === 'passed') status = 'passed';
      else if (raw === 'skipped') status = 'skipped';
      else if (raw === 'flaky') status = 'flaky';
      acc.push({ status, durationMs: result?.duration ?? null });
    }
    walkSuites(suite.suites, acc);
  }
}

function summarizeJson(path: string): Omit<LayerSummary, 'layer' | 'label' | 'exitCode'> {
  const report = JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, '')) as PlaywrightJsonReport;
  const rows: { status: TestStatus; durationMs: number | null }[] = [];
  walkSuites(report.suites, rows);
  return {
    tests: rows.length,
    passed: rows.filter((r) => r.status === 'passed' || r.status === 'flaky').length,
    failed: rows.filter((r) => r.status === 'failed').length,
    skipped: rows.filter((r) => r.status === 'skipped').length,
    wallClockMs: report.stats?.duration ?? null,
    sumTestsMs: rows.reduce((s, r) => s + (r.durationMs ?? 0), 0),
    workers: report.config?.metadata?.actualWorkers ?? report.config?.workers ?? null,
  };
}

function loadE2eFromReport(): Omit<LayerSummary, 'layer' | 'label' | 'exitCode'> {
  const path = join(DOCS_REPORTS, 'e2e-timing.json');
  const data = JSON.parse(readFileSync(path, 'utf8')) as {
    wallClockMs: number | null;
    workers: number | null;
    totals: { tests: number; passed: number; failed: number; skipped: number; totalMs: number };
  };
  return {
    tests: data.totals.tests,
    passed: data.totals.passed,
    failed: data.totals.failed,
    skipped: data.totals.skipped,
    wallClockMs: data.wallClockMs,
    sumTestsMs: data.totals.totalMs,
    workers: data.workers,
  };
}

function parseLogPhases(content: string): FullSuiteReport['phases'] {
  const phases: FullSuiteReport['phases'] = [];
  const phaseMap = new Map<string, { startedAt: string | null; endedAt: string | null; exitCode: number | null }>();

  for (const line of content.split(/\r?\n/)) {
    const start = line.match(/\[([\d-]+ [\d:]+)\] === INICIO (.+?) ===$/);
    if (start) {
      phaseMap.set(start[2], { startedAt: start[1], endedAt: null, exitCode: null });
      continue;
    }
    const endOk = line.match(/\[([\d-]+ [\d:]+)\] === FIM (.+?) — OK ===$/);
    if (endOk) {
      const p = phaseMap.get(endOk[2]) ?? { startedAt: null, endedAt: null, exitCode: null };
      p.endedAt = endOk[1];
      p.exitCode = 0;
      phaseMap.set(endOk[2], p);
      continue;
    }
    const endFail = line.match(/\[([\d-]+ [\d:]+)\] === FIM (.+?) — exit (\d+) ===$/);
    if (endFail) {
      const p = phaseMap.get(endFail[2]) ?? { startedAt: null, endedAt: null, exitCode: null };
      p.endedAt = endFail[1];
      p.exitCode = Number(endFail[3]);
      phaseMap.set(endFail[2], p);
    }
  }

  for (const [name, v] of phaseMap) {
    phases.push({ name, ...v });
  }
  return phases;
}

function renderMarkdown(report: FullSuiteReport, runLog: TimingLogEntry[], executionId: string, inHistory = false): string {
  const generatedAt = formatUtc(report.generatedAt);
  const jsonLink = inHistory ? '[full-suite.json](./full-suite.json)' : '[full-suite-timing.json](full-suite-timing.json)';
  const e2eLink = inHistory ? '[e2e-report.md](./e2e-report.md)' : '[e2e-timing-report.md](e2e-timing-report.md)';
  const logLink = inHistory ? '../../full-suite-timing-log.md' : 'full-suite-timing-log.md';

  const lines = [
    '# Relatório de Tempo — Suíte Completa (E2E + API + A11y)',
    '',
    `> Execução **${executionId}** · gerado em **${generatedAt}** · ${jsonLink}`,
    report.logFile ? `> Log bruto: \`${report.logFile}\`` : '',
    inHistory ? `> Índice: [full-suite-timing-log.md](${logLink})` : '',
    '',
    '## Resumo geral',
    '',
    '| Métrica | Valor |',
    '|---------|------:|',
    `| Testes (todas as camadas) | ${report.totals.tests} |`,
    `| Passou | ${report.totals.passed} |`,
    `| Falhou | ${report.totals.failed} |`,
    `| Pulou | ${report.totals.skipped} |`,
    `| Soma dos testes | ${formatDuration(report.totals.sumTestsMs)} |`,
    '',
    '## Tempo por camada',
    '',
    '| Camada | Testes | Passou | Falhou | Pulou | Wall-clock | Soma testes | Workers | Exit |',
    '|--------|-------:|-------:|-------:|------:|-----------:|------------:|--------:|-----:|',
  ];

  for (const l of report.layers) {
    lines.push(
      `| **${l.label}** | ${l.tests} | ${l.passed} | ${l.failed} | ${l.skipped} | ${formatDuration(l.wallClockMs)} | ${formatDuration(l.sumTestsMs)} | ${l.workers ?? '—'} | ${l.exitCode ?? '—'} |`,
    );
  }

  if (report.phases.length) {
    lines.push('', '## Fases da execução (log)', '', '| Fase | Início | Fim | Exit |', '|------|--------|-----|-----:|');
    for (const p of report.phases) {
      lines.push(`| ${p.name} | ${p.startedAt ?? '—'} | ${p.endedAt ?? '—'} | ${p.exitCode ?? '—'} |`);
    }
  }

  lines.push('', '## Relatórios detalhados', '', '| Camada | Detalhe |', '|--------|---------|');
  lines.push(`| E2E | ${e2eLink} |`);

  if (!inHistory) {
    const historySection = renderRecentRunsSection('Histórico de execuções', runLog, 'full-suite-timing-log.md');
    if (historySection) {
      lines.push('', historySection);
    }
  }

  lines.push('', '---', '*Gerado por `npm run full-suite:timing:generate` — não editar manualmente.*', '');

  return lines.filter(Boolean).join('\n');
}

function main(): void {
  const { log } = parseArgs(process.argv.slice(2));
  const layers: LayerSummary[] = [];

  if (existsSync(join(DOCS_REPORTS, 'e2e-timing.json'))) {
    const e2e = loadE2eFromReport();
    const phase = log && existsSync(log) ? parseLogPhases(readFileSync(log, 'utf8')).find((p) => p.name.includes('E2E')) : undefined;
    layers.push({ layer: 'e2e', label: 'E2E', ...e2e, exitCode: phase?.exitCode ?? null });
  }

  const apiRaw = join(REPORTS_DIR, 'api-timing-raw.json');
  if (existsSync(apiRaw)) {
    const api = summarizeJson(apiRaw);
    const phase = log && existsSync(log) ? parseLogPhases(readFileSync(log, 'utf8')).find((p) => p.name === 'API') : undefined;
    layers.push({ layer: 'api', label: 'API', ...api, exitCode: phase?.exitCode ?? null });
    writeFileSync(join(DOCS_REPORTS, 'api-timing.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), ...api }, null, 2)}\n`);
  }

  const a11yRaw = join(REPORTS_DIR, 'a11y-timing-raw.json');
  if (existsSync(a11yRaw)) {
    const a11y = summarizeJson(a11yRaw);
    const phase = log && existsSync(log) ? parseLogPhases(readFileSync(log, 'utf8')).find((p) => p.name === 'A11Y') : undefined;
    layers.push({ layer: 'a11y', label: 'A11y', ...a11y, exitCode: phase?.exitCode ?? null });
    writeFileSync(join(DOCS_REPORTS, 'a11y-timing.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), ...a11y }, null, 2)}\n`);
  }

  if (layers.length === 0) {
    throw new Error('Nenhuma camada encontrada. Execute npm run test:full:timing primeiro.');
  }

  const phases = log && existsSync(log) ? parseLogPhases(readFileSync(log, 'utf8')) : [];
  const report: FullSuiteReport = {
    generatedAt: new Date().toISOString(),
    logFile: log ? log.replace(/\\/g, '/').replace(`${ROOT.replace(/\\/g, '/')}/`, '') : null,
    phases,
    layers,
    totals: {
      tests: layers.reduce((s, l) => s + l.tests, 0),
      passed: layers.reduce((s, l) => s + l.passed, 0),
      failed: layers.reduce((s, l) => s + l.failed, 0),
      skipped: layers.reduce((s, l) => s + l.skipped, 0),
      wallClockMs: phases.length
        ? phases.reduce((s, p) => {
            if (!p.startedAt || !p.endedAt) return s;
            return s + (new Date(p.endedAt.replace(' ', 'T')).getTime() - new Date(p.startedAt.replace(' ', 'T')).getTime());
          }, 0)
        : null,
      sumTestsMs: layers.reduce((s, l) => s + l.sumTestsMs, 0),
    },
  };

  const executionId = resolveExecutionId({
    logPath: log ? log.replace(/\\/g, '/') : undefined,
    generatedAt: report.generatedAt,
  });

  const logJsonPath = join(DOCS_REPORTS, 'full-suite-timing-log.json');
  const historyDir = join(DOCS_REPORTS, 'history');
  const reportMd = renderMarkdown(report, [], executionId, true);
  const executionFolder = saveExecutionFolder({
    historyDir,
    executionId,
    metadata: {
      executionId,
      logFile: report.logFile,
      fullSuite: {
        generatedAt: report.generatedAt,
        totals: report.totals,
        layers: report.layers.map((l) => l.label),
      },
    },
    files: [
      { name: 'full-suite.json', content: `${JSON.stringify(report, null, 2)}\n` },
      { name: 'full-suite-report.md', content: reportMd },
    ],
  });

  const logEntry: TimingLogEntry = {
    executionId,
    generatedAt: report.generatedAt,
    source: executionFolder,
    reportFile: `${executionFolder}/full-suite-report.md`,
    logFile: report.logFile,
    tests: report.totals.tests,
    passed: report.totals.passed,
    failed: report.totals.failed,
    skipped: report.totals.skipped,
    wallClockMs: report.totals.wallClockMs,
    sumTestsMs: report.totals.sumTestsMs,
    workers: report.layers.find((l) => l.layer === 'e2e')?.workers ?? null,
    layers: report.layers.map((l) => ({
      label: l.label,
      tests: l.tests,
      passed: l.passed,
      failed: l.failed,
      wallClockMs: l.wallClockMs,
      workers: l.workers,
      exitCode: l.exitCode,
    })),
  };
  const runLog = appendTimingLog(logJsonPath, logEntry);

  writeFileSync(join(DOCS_REPORTS, 'full-suite-timing-report.md'), renderMarkdown(report, runLog, executionId), 'utf8');
  writeFileSync(join(DOCS_REPORTS, 'full-suite-timing.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  writeFileSync(join(DOCS_REPORTS, 'full-suite-timing-log.md'), renderFullSuiteLogMarkdown(runLog), 'utf8');

  const previous = runLog[1];
  if (previous?.wallClockMs && report.totals.wallClockMs) {
    const deltaPct = (((report.totals.wallClockMs - previous.wallClockMs) / previous.wallClockMs) * 100).toFixed(1);
    const sign = report.totals.wallClockMs >= previous.wallClockMs ? '+' : '';
    console.log(`\nComparativo vs execução anterior (${formatUtc(previous.generatedAt)}):`);
    console.log(`  Wall-clock total: ${formatDuration(previous.wallClockMs)} → ${formatDuration(report.totals.wallClockMs)} (${sign}${deltaPct}%)`);
  }

  console.log(`Relatório consolidado: docs/reports/full-suite-timing-report.md`);
  console.log(`Log de tempo: docs/reports/full-suite-timing-log.md (${runLog.length} execuções)`);
  console.log(`Execução: docs/reports/${executionFolder}/`);
  console.log(`Camadas: ${layers.map((l) => `${l.label}(${l.passed}/${l.tests})`).join(' · ')}`);
}

main();
