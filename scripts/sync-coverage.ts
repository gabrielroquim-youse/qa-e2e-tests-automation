#!/usr/bin/env ts-node
/**
 * Sincroniza cobertura: GitHub (sales-frontend) × POMs × inventário funcional.
 *
 * Saídas:
 *   docs/coverage/sync-report.md   — relatório técnico (auto)
 *   docs/coverage/metrics.json     — métricas para dashboards
 *   docs/coverage/README.md        — bloco <!-- COVERAGE_METRICS --> atualizado
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { AUTO_FUNNEL_SECTIONS, DEFAULT_GITHUB, GITHUB_SECTIONS_PATH } from './coverage-config';
import { computeMetrics, FRONTEND_CAPABILITIES } from './coverage-inventory';

const ROOT = join(__dirname, '..');
const POM_DIR = join(ROOT, 'tests', 'pages', 'quotation');
const SPEC_DIR = join(ROOT, 'tests', 'spec', 'e2e');
const REPORT_PATH = join(ROOT, 'docs', 'coverage', 'sync-report.md');
const METRICS_JSON_PATH = join(ROOT, 'docs', 'coverage', 'metrics.json');
const README_PATH = join(ROOT, 'docs', 'coverage', 'README.md');

const METRICS_START = '<!-- COVERAGE_METRICS:START -->';
const METRICS_END = '<!-- COVERAGE_METRICS:END -->';

interface SyncResult {
  remoteSlugs: string[];
  missingPom: string[];
  unmappedRemote: string[];
  staleLocal: string[];
  pomFiles: string[];
  sectionsWithPom: number;
  specSummary: { file: string; tests: number }[];
  generatedAt: string;
}

function fetchSectionsSource(): string {
  const { owner, repo, branch } = DEFAULT_GITHUB;
  const apiPath = `repos/${owner}/${repo}/contents/${GITHUB_SECTIONS_PATH}?ref=${branch}`;

  try {
    const b64 = execSync(`gh api ${apiPath} --jq ".content"`, {
      encoding: 'utf8',
      cwd: ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();

    return Buffer.from(b64.replace(/\s/g, ''), 'base64').toString('utf8');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Falha ao buscar ${GITHUB_SECTIONS_PATH} via gh api. Confirme gh auth. Detalhe: ${message}`);
  }
}

function parseSlugsFromSource(source: string): string[] {
  const slugs = new Set<string>();
  const slugRe = /slug:\s*['"]([\w]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = slugRe.exec(source)) !== null) {
    slugs.add(match[1]);
  }
  return [...slugs].sort();
}

function countTestsInSpec(filePath: string): number {
  const content = readFileSync(filePath, 'utf8');
  return (content.match(/\btest\s*\(/g) ?? []).length;
}

function buildResult(remoteSlugs: string[]): SyncResult {
  const configuredSlugs = AUTO_FUNNEL_SECTIONS.map((s) => s.slug);
  const pomFiles = existsSync(POM_DIR)
    ? readdirSync(POM_DIR)
        .filter((f) => f.endsWith('.ts'))
        .sort()
    : [];

  const sectionsWithPom = AUTO_FUNNEL_SECTIONS.filter(
    (s) => s.pageObject && existsSync(join(POM_DIR, s.pageObject)) && remoteSlugs.includes(s.slug),
  ).length;

  const specSummary = existsSync(SPEC_DIR)
    ? readdirSync(SPEC_DIR)
        .filter((f) => f.endsWith('.spec.ts'))
        .sort()
        .map((file) => ({ file, tests: countTestsInSpec(join(SPEC_DIR, file)) }))
    : [];

  return {
    remoteSlugs,
    missingPom: AUTO_FUNNEL_SECTIONS.filter((s) => s.pageObject && !existsSync(join(POM_DIR, s.pageObject))).map(
      (s) => `${s.slug} → ${s.pageObject}`,
    ),
    unmappedRemote: remoteSlugs.filter((slug) => !configuredSlugs.includes(slug)),
    staleLocal: configuredSlugs.filter((slug) => !remoteSlugs.includes(slug)),
    pomFiles,
    sectionsWithPom,
    specSummary,
    generatedAt: new Date().toISOString().slice(0, 10),
  };
}

function renderMetricsBlock(metrics: ReturnType<typeof computeMetrics>, totalTests: number): string {
  const f = metrics.functional;
  const s = metrics.structural;

  const gapRows = metrics.gaps
    .map((g) => `| ${g.id} | ${g.label} | \`${g.section}\` | ${g.status === 'blocked' ? '🔒' : '⬜'} | ${g.planner ?? '—'} | ${g.notes ?? '—'} |`)
    .join('\n');

  const partialRows = metrics.partials
    .map((g) => `| ${g.id} | ${g.label} | \`${g.section}\` | ${g.specs?.join(', ') ?? '—'} | ${g.notes ?? '—'} |`)
    .join('\n');

  return `${METRICS_START}
> 🤖 **Atualizado automaticamente** em ${metrics.generatedAt} · Fonte: [\`${metrics.github.repo}\`](https://github.com/${metrics.github.owner}/${metrics.github.repo}) @ \`${metrics.github.branch}\` · \`${totalTests}\` testes E2E · \`${f.testableTotal}\` capacidades testáveis inventariadas

## Painel de cobertura (leitura rápida)

| Indicador | Valor | Em plain language |
|-----------|------:|-------------------|
| **Cobertura funcional (principal)** | **${f.percentWeighted}%** | Capacidades do front com teste dedicado, contando parciais pela metade |
| Cobertura funcional estrita | ${f.percentStrict}% | Só conta ✅ com teste dedicado (sem 🟡) |
| Cobertura estrutural (telas) | ${s.percent}% | Telas do funil com Page Object (${s.sectionsWithPom}/${s.sectionsTotal}) |
| P0 automatizado | ${metrics.byPriority.P0.percent}% | ${metrics.byPriority.P0.covered}/${metrics.byPriority.P0.total} itens críticos |
| P1 automatizado | ${metrics.byPriority.P1.percent}% | ${metrics.byPriority.P1.covered}/${metrics.byPriority.P1.total} itens alto risco |
| ✅ Coberto | ${f.covered} | Teste E2E dedicado |
| 🟡 Parcial | ${f.partial} | Happy path ou regra incompleta |
| ⬜ Falta automatizar | ${f.missing} | Front permite testar; sem spec |
| 🔒 Bloqueado | ${f.blocked} | Depende massa/API — ver backlog |

### Fórmula do indicador principal

\`\`\`
Cobertura funcional = (✅ + 🟡×0,5) / capacidades testáveis × 100
\`\`\`

Capacidades testáveis = inventário em \`scripts/coverage-inventory.ts\` (derivado do GitHub + planners).

### O que falta automatizar (⬜ + 🔒)

| ID | Funcionalidade (front) | Section | Status | Planner | Notas |
|----|--------------------------|---------|--------|---------|-------|
${gapRows || '| — | Nenhum gap aberto | — | — | — | — |'}

### Cobertura parcial — completar depois (🟡)

| ID | Funcionalidade | Section | Spec atual | Próximo passo |
|----|----------------|---------|------------|---------------|
${partialRows || '| — | — | — | — | — |'}

${METRICS_END}`;
}

function patchReadme(metricsBlock: string): void {
  if (!existsSync(README_PATH)) return;
  const readme = readFileSync(README_PATH, 'utf8');

  if (readme.includes(METRICS_START) && readme.includes(METRICS_END)) {
    const updated = readme.replace(new RegExp(`${METRICS_START}[\\s\\S]*?${METRICS_END}`), metricsBlock);
    writeFileSync(README_PATH, updated, 'utf8');
    return;
  }

  // Insere após o cabeçalho introdutório (após primeira linha em branco dupla)
  const insertAfter = '> **Última revisão:**';
  const idx = readme.indexOf(insertAfter);
  if (idx === -1) {
    writeFileSync(README_PATH, metricsBlock + '\n\n' + readme, 'utf8');
    return;
  }
  const lineEnd = readme.indexOf('\n\n', idx);
  const updated = readme.slice(0, lineEnd + 2) + '\n' + metricsBlock + '\n' + readme.slice(lineEnd + 2);
  writeFileSync(README_PATH, updated, 'utf8');
}

function renderReport(result: SyncResult, metrics: ReturnType<typeof computeMetrics>): string {
  const sectionRows = AUTO_FUNNEL_SECTIONS.map((section) => {
    const inRemote = result.remoteSlugs.includes(section.slug);
    const pomExists = section.pageObject ? existsSync(join(POM_DIR, section.pageObject)) : false;
    const caps = FRONTEND_CAPABILITIES.filter((c) => c.section === section.slug && c.testable);
    const cov = caps.filter((c) => c.status === 'covered').length;

    let status: string;
    if (!inRemote) status = '⚠️ ausente no front';
    else if (section.optional && !section.pageObject) status = '🟡 opcional';
    else if (section.pageObject && pomExists) status = '✅';
    else if (section.pageObject && !pomExists) status = '❌ POM faltando';
    else status = '⬜ sem POM';

    return `| \`${section.slug}\` | ${section.microFrontend ?? '—'} | ${section.pageObject ?? '—'} | ${status} | ${caps.length ? `${cov}/${caps.length} caps ✅` : '—'} |`;
  }).join('\n');

  const totalTests = result.specSummary.reduce((sum, s) => sum + s.tests, 0);
  const specRows = result.specSummary.map((s) => `| \`${s.file}\` | ${s.tests} |`).join('\n');

  const invRows = FRONTEND_CAPABILITIES.filter((c) => c.testable)
    .map((c) => {
      const icon = { covered: '✅', partial: '🟡', missing: '⬜', blocked: '🔒', 'n/a': '🚫' }[c.status];
      return `| ${c.id} | ${c.label} | \`${c.section}\` | ${c.priority} | ${icon} | ${c.specs?.join(', ') ?? '—'} |`;
    })
    .join('\n');

  return `# Relatório de Sincronização de Cobertura

> Gerado em **${result.generatedAt}** · [\`metrics.json\`](metrics.json) · [\`README.md\`](README.md)

## Resumo executivo

| Métrica | Valor |
|---------|------:|
| **Cobertura funcional (ponderada)** | **${metrics.functional.percentWeighted}%** |
| Cobertura funcional estrita | ${metrics.functional.percentStrict}% |
| Cobertura estrutural (POMs) | ${metrics.structural.percent}% |
| Sections no GitHub | ${result.remoteSlugs.length} |
| Testes E2E Auto | ${totalTests} |
| Capacidades testáveis | ${metrics.functional.testableTotal} |
| Falta automatizar (⬜) | ${metrics.functional.missing} |
| Bloqueado (🔒) | ${metrics.functional.blocked} |

## 1. Telas do front (GitHub) × automação

| Section | Micro-frontend | Page Object | Estrutura | Caps funcionais |
|---------|----------------|-------------|-----------|-----------------|
${sectionRows}

## 2. Inventário completo — o que o front permite testar

| ID | Funcionalidade | Section | Pri | Status | Spec(s) |
|----|----------------|---------|-----|--------|---------|
${invRows}

## 3. Specs E2E (${totalTests} testes)

| Spec | Testes |
|------|--------|
${specRows}

## 4. Gaps estruturais (GitHub × repo)

${[
  result.unmappedRemote.length ? `- Sections no front **sem mapa local**: ${result.unmappedRemote.map((s) => `\`${s}\``).join(', ')}` : null,
  result.missingPom.length ? `- **POMs ausentes**: ${result.missingPom.join(', ')}` : null,
  result.staleLocal.length ? `- Slugs locais **obsoletos**: ${result.staleLocal.map((s) => `\`${s}\``).join(', ')}` : null,
  !result.unmappedRemote.length && !result.missingPom.length && !result.staleLocal.length ? '- Nenhum gap estrutural.' : null,
]
  .filter(Boolean)
  .join('\n')}

---
*Gerado por \`npm run coverage:sync\` — não editar manualmente.*
`;
}

function main(): void {
  const checkOnly = process.argv.includes('--check');
  const source = fetchSectionsSource();
  const remoteSlugs = parseSlugsFromSource(source);
  const result = buildResult(remoteSlugs);
  const metrics = computeMetrics(remoteSlugs.length, result.sectionsWithPom);
  const totalTests = result.specSummary.reduce((s, x) => s + x.tests, 0);

  mkdirSync(join(ROOT, 'docs'), { recursive: true });
  writeFileSync(REPORT_PATH, renderReport(result, metrics), 'utf8');
  writeFileSync(METRICS_JSON_PATH, JSON.stringify(metrics, null, 2), 'utf8');
  patchReadme(renderMetricsBlock(metrics, totalTests));

  console.log(`Relatório:  ${relative(ROOT, REPORT_PATH)}`);
  console.log(`Métricas:   ${relative(ROOT, METRICS_JSON_PATH)}`);
  console.log(`README:     bloco COVERAGE_METRICS atualizado`);
  console.log(`\n📊 Cobertura funcional: ${metrics.functional.percentWeighted}% (estrita: ${metrics.functional.percentStrict}%)`);
  console.log(`   P0: ${metrics.byPriority.P0.percent}% · P1: ${metrics.byPriority.P1.percent}%`);
  console.log(`   Falta: ${metrics.functional.missing} · Bloqueado: ${metrics.functional.blocked} · Parcial: ${metrics.functional.partial}`);

  const failures = [...result.unmappedRemote, ...result.missingPom];
  if (checkOnly && failures.length > 0) {
    console.error('\n❌ coverage:check falhou (estrutura):');
    failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }
}

main();
