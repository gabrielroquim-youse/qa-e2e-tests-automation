import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export function formatDuration(ms: number | null): string {
  if (ms === null || ms <= 0) return '—';
  if (ms >= 60_000) return `${(ms / 60_000).toFixed(1)} min`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export function formatUtc(iso: string): string {
  return iso.replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
}

/** ISO → pasta legível: `2026-06-19_16-50-45` */
export function executionIdFromIso(iso: string): string {
  return iso.slice(0, 19).replace('T', '_').replace(/:/g, '-');
}

/** `reports/full-run-2026-06-19T16-50-45.log` → `2026-06-19_16-50-45` */
export function executionIdFromLogPath(logPath: string): string | null {
  const m = logPath.match(/full-run-(\d{4}-\d{2}-\d{2})T(\d{2}-\d{2}-\d{2})\.log/i);
  return m ? `${m[1]}_${m[2]}` : null;
}

export function resolveExecutionId(options: { logPath?: string; generatedAt: string }): string {
  if (options.logPath) {
    const fromLog = executionIdFromLogPath(options.logPath);
    if (fromLog) return fromLog;
  }
  const fromEnv = process.env.TIMING_EXECUTION_ID?.trim();
  if (fromEnv) return fromEnv;
  return executionIdFromIso(options.generatedAt);
}

export interface TimingLogEntry {
  executionId: string;
  generatedAt: string;
  source: string | null;
  reportFile: string | null;
  logFile: string | null;
  tests: number;
  passed: number;
  failed: number;
  skipped: number;
  wallClockMs: number | null;
  sumTestsMs: number;
  workers: number | null;
  layers?: {
    label: string;
    tests: number;
    passed: number;
    failed: number;
    wallClockMs: number | null;
    workers: number | null;
    exitCode: number | null;
  }[];
}

export interface ExecutionArtifacts {
  historyDir: string;
  executionId: string;
  metadata: Record<string, unknown>;
  files: { name: string; content: string }[];
}

/** Salva ou complementa uma execução em `history/{YYYY-MM-DD_HH-mm-ss}/`. */
export function saveExecutionFolder(artifacts: ExecutionArtifacts): string {
  const dir = join(artifacts.historyDir, artifacts.executionId);
  mkdirSync(dir, { recursive: true });

  const metaPath = join(dir, 'execution.json');
  let existingMeta: Record<string, unknown> = {};
  if (existsSync(metaPath)) {
    try {
      existingMeta = JSON.parse(readFileSync(metaPath, 'utf8')) as Record<string, unknown>;
    } catch {
      existingMeta = {};
    }
  }

  const merged = {
    executionId: artifacts.executionId,
    logFile: artifacts.metadata.logFile ?? existingMeta.logFile ?? null,
    e2e: artifacts.metadata.e2e ?? existingMeta.e2e ?? null,
    fullSuite: artifacts.metadata.fullSuite ?? existingMeta.fullSuite ?? null,
    updatedAt: new Date().toISOString(),
  };

  writeFileSync(metaPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');

  for (const file of artifacts.files) {
    writeFileSync(join(dir, file.name), file.content, 'utf8');
  }
  return `history/${artifacts.executionId}`;
}

export function loadTimingLog(logJsonPath: string): TimingLogEntry[] {
  if (!existsSync(logJsonPath)) return [];
  try {
    const data = JSON.parse(readFileSync(logJsonPath, 'utf8')) as TimingLogEntry[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function appendTimingLog(logJsonPath: string, entry: TimingLogEntry, maxEntries = 100): TimingLogEntry[] {
  const log = loadTimingLog(logJsonPath).filter(
    (existing) => existing.executionId !== entry.executionId && existing.generatedAt !== entry.generatedAt,
  );
  log.unshift(entry);
  const trimmed = log.slice(0, maxEntries);
  mkdirSync(dirname(logJsonPath), { recursive: true });
  writeFileSync(logJsonPath, `${JSON.stringify(trimmed, null, 2)}\n`, 'utf8');
  return trimmed;
}

function deltaPct(current: number | null, previous: number | null): string {
  if (current === null || previous === null || previous <= 0) return '—';
  const pct = (((current - previous) / previous) * 100).toFixed(1);
  const sign = Number(pct) >= 0 ? '+' : '';
  return `${sign}${pct}%`;
}

function executionLink(entry: TimingLogEntry, label: string): string {
  if (entry.reportFile) {
    return `[${label}](${entry.reportFile})`;
  }
  if (entry.source) {
    const id = entry.executionId ?? entry.source.split('/').pop() ?? label;
    return `[${label}](${entry.source}/${id}-report.md)`;
  }
  return label;
}

export function renderFullSuiteLogMarkdown(log: TimingLogEntry[], historyDirName = 'history'): string {
  const lines = [
    '# Log de Tempo — Suíte Completa (E2E + API + A11y)',
    '',
    `> ${log.length} execução(ões) · mais recente primeiro · uma pasta por run em [\`${historyDirName}/\`](${historyDirName}/)`,
    '',
    '| # | Execução | Testes | Passou | Falhou | Pulou | Wall-clock | Δ wall | E2E | API | A11y | Log |',
    '|--:|----------|-------:|-------:|-------:|------:|-----------:|-------:|----:|----:|-----:|-----|',
  ];

  log.forEach((entry, i) => {
    const prev = log[i + 1];
    const layerWall = (label: string) => entry.layers?.find((l) => l.label === label)?.wallClockMs ?? null;
    const e2e = formatDuration(layerWall('E2E'));
    const api = formatDuration(layerWall('API'));
    const a11y = formatDuration(layerWall('A11y'));
    const logRef = entry.logFile ? `\`${entry.logFile}\`` : '—';
    const when = formatUtc(entry.generatedAt);
    lines.push(
      `| ${i + 1} | ${executionLink(entry, when)} | ${entry.tests} | ${entry.passed} | ${entry.failed} | ${entry.skipped} | ${formatDuration(entry.wallClockMs)} | ${deltaPct(entry.wallClockMs, prev?.wallClockMs ?? null)} | ${e2e} | ${api} | ${a11y} | ${logRef} |`,
    );
  });

  lines.push('', '---', '*Atualizado por `npm run full-suite:timing:generate` — não editar manualmente.*', '');
  return lines.join('\n');
}

export function renderE2eLogMarkdown(log: TimingLogEntry[], historyDirName = 'history'): string {
  const lines = [
    '# Log de Tempo — Testes E2E',
    '',
    `> ${log.length} execução(ões) · mais recente primeiro · uma pasta por run em [\`${historyDirName}/\`](${historyDirName}/)`,
    '',
    '| # | Execução | Testes | Passou | Falhou | Pulou | Wall-clock | Δ wall | Workers | Soma testes | Pasta |',
    '|--:|----------|-------:|-------:|-------:|------:|-----------:|-------:|--------:|------------:|-------|',
  ];

  log.forEach((entry, i) => {
    const prev = log[i + 1];
    const folder = entry.source ? `[${entry.executionId}](${entry.source}/)` : `\`${entry.executionId}\``;
    const when = formatUtc(entry.generatedAt);
    lines.push(
      `| ${i + 1} | ${executionLink(entry, when)} | ${entry.tests} | ${entry.passed} | ${entry.failed} | ${entry.skipped} | ${formatDuration(entry.wallClockMs)} | ${deltaPct(entry.wallClockMs, prev?.wallClockMs ?? null)} | ${entry.workers ?? '—'} | ${formatDuration(entry.sumTestsMs)} | ${folder} |`,
    );
  });

  lines.push('', '---', '*Atualizado por `npm run e2e:timing:generate` — não editar manualmente.*', '');
  return lines.join('\n');
}

export function renderRecentRunsSection(title: string, log: TimingLogEntry[], logMdFileName: string, limit = 8): string {
  const recent = log.slice(0, limit);
  if (recent.length === 0) return '';

  const lines = [
    `## ${title}`,
    '',
    `Histórico completo: [${logMdFileName}](${logMdFileName})`,
    '',
    '| Execução | Passou | Falhou | Pulou | Wall-clock | Δ vs anterior |',
    '|----------|-------:|-------:|------:|-----------:|----------------:|',
  ];

  recent.forEach((entry, i) => {
    const prev = log[i + 1];
    lines.push(
      `| ${executionLink(entry, formatUtc(entry.generatedAt))} | ${entry.passed} | ${entry.failed} | ${entry.skipped} | ${formatDuration(entry.wallClockMs)} | ${deltaPct(entry.wallClockMs, prev?.wallClockMs ?? null)} |`,
    );
  });

  return lines.join('\n');
}
