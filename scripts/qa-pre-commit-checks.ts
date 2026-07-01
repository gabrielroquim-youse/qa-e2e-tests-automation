/**
 * QA Pre-Commit / PR Checks
 * ---------------------------------------------------------------------------
 * Bateria de validações automáticas com dois modos de operação:
 *
 *   LOCAL (pre-commit)  -> analisa arquivos STAGED (`git diff --cached`)
 *   CI    (PR check)    -> analisa arquivos modificados no PR via env PR_BASE
 *                         PR_BASE=origin/main ts-node qa-pre-commit-checks.ts
 *
 * Cada check segue o contrato:
 *   - name:     título exibido no relatório e no comentário do PR
 *   - level:    'error' (bloqueia commit/PR) | 'warn' (apenas alerta)
 *   - checklistItem: mapeia para item do PR template (optional)
 *   - run():    retorna lista de violações (string[])
 *
 * Saída em modo CI (PR_BASE definido):
 *   - JSON estruturado para o workflow `pr-checklist.yml` processar
 *   - Pode ser lido por actions/github-script para gerar comentário
 *
 * Os requisitos vêm de:
 *   - .github/pull_request_template.md  (checklist de qualidade)
 *   - default.instructions.md           (LGPD, Clean Code, Conventional Commits)
 *   - eslint.config.mjs                 (antipadrões Playwright já cobertos por lint)
 * ---------------------------------------------------------------------------
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, statSync, writeFileSync } from 'fs';
import { extname, resolve } from 'path';

// ----------------------------------------------------------------------------
// Modos de operação
// ----------------------------------------------------------------------------

const REPO_ROOT = resolve(__dirname, '..');
/** Quando definido, opera sobre o diff do PR em vez do stage local. */
const PR_BASE = process.env['PR_BASE'];
/** Quando definido, escreve resultado JSON neste caminho (para CI). */
const REPORT_JSON = process.env['QA_REPORT_JSON'];
const IS_CI = Boolean(PR_BASE);

// ----------------------------------------------------------------------------
// Terminal colors (desativados em CI para saída limpa)
// ----------------------------------------------------------------------------

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};
const NO_COLOR = IS_CI || Boolean(process.env['NO_COLOR']);
const c = (color: keyof typeof COLORS, text: string): string => (NO_COLOR ? text : `${COLORS[color]}${text}${COLORS.reset}`);

// ----------------------------------------------------------------------------
// Tipos
// ----------------------------------------------------------------------------

type CheckLevel = 'error' | 'warn';

interface CheckResult {
  name: string;
  level: CheckLevel;
  violations: string[];
  /** Referência ao item do PR template que este check automatiza */
  checklistItem?: string;
}

interface Check {
  name: string;
  level: CheckLevel;
  checklistItem?: string;
  run: (ctx: Context) => string[];
}

interface Context {
  stagedFiles: string[];
  newFiles: string[];
}

// ----------------------------------------------------------------------------
// Listagem de arquivos (staged local ou diff de PR)
// ----------------------------------------------------------------------------

function getFiles(): { staged: string[]; added: string[] } {
  const cmd = IS_CI ? `git diff --name-status --diff-filter=ACMR ${PR_BASE}...HEAD` : 'git diff --cached --name-status --diff-filter=ACMR';

  const out = execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf8' });
  const staged: string[] = [];
  const added: string[] = [];
  for (const line of out.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(/\s+/);
    const status = parts[0];
    const file = parts[parts.length - 1];
    staged.push(file);
    if (status === 'A') added.push(file);
  }
  return { staged, added };
}

// ----------------------------------------------------------------------------
// Leitura de conteúdo
// ----------------------------------------------------------------------------

function readContent(file: string): string | null {
  try {
    // Em modo CI, lê o arquivo direto do disco (já está no checkout completo)
    if (IS_CI) {
      const abs = resolve(REPO_ROOT, file);
      if (!existsSync(abs)) return null;
      return readFileSync(abs, 'utf8');
    }
    // Modo local: lê da área de stage
    return execSync(`git show :"${file}"`, { cwd: REPO_ROOT, encoding: 'utf8' });
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------------------
// Helper: busca por regex em arquivos
// ----------------------------------------------------------------------------

function findMatches(files: string[], pattern: RegExp, opts?: { onlyExt?: string[]; skipComments?: boolean }): string[] {
  const hits: string[] = [];
  for (const file of files) {
    if (opts?.onlyExt && !opts.onlyExt.includes(extname(file))) continue;
    const content = readContent(file);
    if (!content) continue;
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const prev = i > 0 ? lines[i - 1] : '';
      if (opts?.skipComments && /^\s*(\/\/|\*|#)/.test(line)) continue;
      if (/eslint-disable(-next-line)?/.test(prev)) continue;
      const re = new RegExp(pattern.source, pattern.flags.replace('g', ''));
      if (re.test(line)) hits.push(`${file}:${i + 1} -> ${line.trim().slice(0, 120)}`);
    }
  }
  return hits;
}

// ----------------------------------------------------------------------------
// Checks
// ----------------------------------------------------------------------------

const CHECKS: Check[] = [
  // -- Segurança / LGPD -----------------------------------------------------
  {
    name: 'Bloqueia arquivos .env (exceto .env.example)',
    level: 'error',
    checklistItem: 'Nenhum dado sensível foi inserido',
    run: ({ stagedFiles }) =>
      stagedFiles.filter((f) => /(^|\/)\.env(\.[\w-]+)?$/.test(f) && !/\.env\.example$/.test(f)).map((f) => `Arquivo proibido: ${f}`),
  },
  {
    name: 'Bloqueia artefatos de execução na raiz (.log, .png, .mp4, .webm, .zip)',
    level: 'error',
    run: ({ stagedFiles }) =>
      stagedFiles
        .filter((f) => /^[^/]+\.(log|png|jpe?g|mp4|webm|zip|har|trace)$/i.test(f))
        .map((f) => `Artefato local na raiz: ${f} -- adicione ao .gitignore ou mova para docs/`),
  },
  {
    name: 'Detecta secrets / tokens / API keys em texto claro',
    level: 'error',
    checklistItem: 'Nenhum dado sensível foi inserido',
    run: ({ stagedFiles }) =>
      findMatches(
        stagedFiles.filter((f) => /\.(ts|js|json|ya?ml|md|env\.example)$/i.test(f)),
        /(api[_-]?key|secret|token|password|bearer|authorization)\s*[:=]\s*['"`][^'"`\s]{12,}['"`]/i,
      ).filter((hit) => !/example|placeholder|<your|xxx+/i.test(hit)),
  },
  {
    name: 'Detecta CPFs reais hardcoded (LGPD)',
    level: 'warn',
    checklistItem: 'Nenhum dado sensível foi inserido',
    run: ({ stagedFiles }) => {
      const re = /\b(?!000\.?000\.?000)(\d{3}\.?\d{3}\.?\d{3}-?\d{2})\b/;
      return findMatches(
        stagedFiles.filter((f) => /\.(ts|js|json)$/i.test(f) && !/cpf-cnpj-validator|fixtures|data\//i.test(f)),
        re,
      );
    },
  },
  {
    name: 'Detecta e-mails pessoais (gmail/hotmail/yahoo/outlook) -- LGPD',
    level: 'warn',
    checklistItem: 'Nenhum dado sensível foi inserido',
    run: ({ stagedFiles }) =>
      findMatches(
        stagedFiles.filter((f) => /\.(ts|js|json|md)$/i.test(f)),
        /[\w.+-]+@(gmail|hotmail|yahoo|outlook|live|icloud)\.com/i,
      ),
  },

  // -- Antipadrões Playwright -----------------------------------------------
  {
    name: 'Sem page.waitForTimeout / esperas fixas',
    level: 'error',
    checklistItem: 'Não há page.waitForTimeout() ou esperas fixas',
    run: ({ stagedFiles }) =>
      findMatches(
        stagedFiles.filter((f) => f.startsWith('tests/') && f.endsWith('.ts')),
        /\.waitForTimeout\s*\(/,
        { skipComments: true },
      ),
  },
  {
    name: 'Sem test.only / describe.only / fdescribe',
    level: 'error',
    checklistItem: 'Não há test.only ou test.skip sem justificativa',
    run: ({ stagedFiles }) =>
      findMatches(
        stagedFiles.filter((f) => f.startsWith('tests/') && f.endsWith('.ts')),
        /\b(test|describe|it)\.only\s*\(|\bfdescribe\s*\(|\bfit\s*\(/,
      ),
  },
  {
    name: 'Evita { force: true } em ações Playwright',
    level: 'warn',
    run: ({ stagedFiles }) =>
      findMatches(
        stagedFiles.filter((f) => f.startsWith('tests/') && f.endsWith('.ts')),
        /\{\s*force\s*:\s*true\s*\}/,
        { skipComments: true },
      ),
  },
  {
    name: 'Prefira toBeVisible() ao invés de isVisible()',
    level: 'warn',
    run: ({ stagedFiles }) =>
      findMatches(
        stagedFiles.filter((f) => f.startsWith('tests/') && f.endsWith('.ts')),
        /\.isVisible\s*\(\s*\)/,
        { skipComments: true },
      ),
  },

  // -- Seletores de acessibilidade ------------------------------------------
  {
    name: 'Seletores devem usar getByRole/getByLabel/getByText/getByTestId (não CSS/XPath)',
    level: 'warn',
    checklistItem: 'Seletores usam locators de acessibilidade ou data-testid',
    run: ({ stagedFiles }) =>
      findMatches(
        stagedFiles.filter((f) => /^tests\/spec\/.+\.spec\.ts$/.test(f)),
        // Detecta .locator('div'), .locator('.class'), .locator('#id'), .$('...')
        /\.(locator|waitForSelector)\s*\(\s*['"`][.#\[]|page\.\$\s*\(/,
        { skipComments: true },
      ),
  },

  // -- mode: serial desnecessário -------------------------------------------
  {
    name: 'Evita mode: serial desnecessário (testes devem ser independentes)',
    level: 'warn',
    checklistItem: 'Os testes são independentes entre si',
    run: ({ stagedFiles }) =>
      findMatches(
        stagedFiles.filter((f) => /^tests\/spec\/.+\.spec\.ts$/.test(f)),
        /mode\s*:\s*['"`]serial['"`]/,
        { skipComments: true },
      ),
  },

  // -- Preços absolutos hardcoded em specs ----------------------------------
  {
    name: 'Evita preços absolutos hardcoded em specs (use relações ordinais ou faixas)',
    level: 'warn',
    checklistItem: 'Nenhum valor de preço absoluto foi fixado',
    run: ({ stagedFiles }) =>
      findMatches(
        stagedFiles.filter((f) => /^tests\/spec\/.+\.spec\.ts$/.test(f)),
        // R$ 1.234,56 ou 1234.56 dentro de expect/toContainText
        /toContainText|toHaveText|toBe.*['"`]R\$\s*[\d.,]+['"`]|expect.*\b\d{3,}\.\d{2}\b/,
        { skipComments: true },
      ),
  },

  // -- Spec no diretório correto --------------------------------------------
  {
    name: 'Spec no diretório correto conforme tag (@ux->ux/ @journey->journeys/ @regression->regression/)',
    level: 'warn',
    checklistItem: 'Spec no diretório correto',
    run: ({ stagedFiles }) => {
      const violations: string[] = [];
      for (const f of stagedFiles.filter((f) => /^tests\/spec\/.+\.spec\.ts$/.test(f))) {
        const content = readContent(f) ?? '';
        const tagMap: Record<string, string> = { '@ux': 'ux/', '@journey': 'journeys/', '@regression': 'regression/' };
        for (const [tag, dir] of Object.entries(tagMap)) {
          if (content.includes(tag) && !f.includes(dir)) {
            violations.push(`${f} tem tag ${tag} mas está fora de tests/spec/e2e/${dir}`);
          }
        }
      }
      return violations;
    },
  },

  // -- Debug code residual --------------------------------------------------
  {
    name: 'Sem debugger; no código fonte',
    level: 'error',
    run: ({ stagedFiles }) =>
      findMatches(
        stagedFiles.filter((f) => /\.(ts|js)$/i.test(f)),
        /^\s*debugger\s*;?\s*$/,
      ),
  },
  {
    name: 'console.log/debug esquecido (prefira console.info ou Allure attachments)',
    level: 'warn',
    run: ({ stagedFiles }) =>
      findMatches(
        stagedFiles.filter((f) => (f.startsWith('tests/') || f.startsWith('scripts/')) && /\.ts$/.test(f) && !/scripts\/qa-/.test(f)),
        /^\s*console\.(log|debug)\(/,
        { skipComments: true },
      ),
  },

  // -- Tags obrigatórias em novos specs -------------------------------------
  {
    name: 'Novos specs precisam de tag (@smoke|@ux|@journey|@regression|@a11y|@pricing|@quotation_auto|@keyboard)',
    level: 'error',
    checklistItem: 'Tags foram adicionadas corretamente',
    run: ({ newFiles }) => {
      const tagRe = /@(smoke|ux|journey|regression|a11y|pricing|quotation_auto|keyboard)\b/;
      return newFiles
        .filter((f) => /^tests\/spec\/.+\.spec\.ts$/.test(f))
        .filter((f) => !tagRe.test(readContent(f) ?? ''))
        .map((f) => `Spec sem tag conhecida: ${f}`);
    },
  },

  // -- Tamanho de arquivo --------------------------------------------------
  {
    name: 'Arquivo > 500 KB (suspeito de binário/log)',
    level: 'warn',
    run: ({ stagedFiles }) => {
      const big: string[] = [];
      for (const f of stagedFiles) {
        const abs = resolve(REPO_ROOT, f);
        if (!existsSync(abs)) continue;
        try {
          const size = statSync(abs).size;
          if (size > 500 * 1024) big.push(`${f} (${(size / 1024).toFixed(0)} KB)`);
        } catch {
          /* ignore */
        }
      }
      return big;
    },
  },

  // -- TODO/FIXME sem ticket Jira -------------------------------------------
  {
    name: 'TODO/FIXME deve referenciar ticket Jira (ex: TODO POSV-123)',
    level: 'warn',
    run: ({ stagedFiles }) =>
      findMatches(
        stagedFiles.filter((f) => /\.(ts|js|md)$/i.test(f) && !/scripts\/qa-|docs\/guides\/pre-commit-checks/.test(f)),
        /^\s*(\/\/|\*|#).*\b(TODO|FIXME|XXX)\b(?!.{0,40}[A-Z]{2,}-\d+)/,
      ),
  },

  // -- Anti-padrão pós-pagamento: toHaveURL após clickFinishBtn -------------
  {
    name: 'Anti-padrão: toHaveURL() após clickFinishBtn() (clickFinishBtn já navega internamente)',
    level: 'error',
    checklistItem: 'Pós-clickFinishBtn() usa padrão multi-path',
    run: ({ stagedFiles }) => {
      const violations: string[] = [];
      for (const f of stagedFiles.filter((f) => /^tests\/spec\/.+\.spec\.ts$/.test(f))) {
        const content = readContent(f);
        if (!content) continue;
        const lines = content.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
          const isFinishLine = /clickFinishBtn\s*\(\s*\)/.test(lines[i]);
          if (!isFinishLine) continue;
          // Verifica as próximas 5 linhas para toHaveURL isolado
          for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
            if (/toHaveURL\s*\(/.test(lines[j]) && !/isOnSuccessPage|youse\.com\.br/.test(lines[j])) {
              violations.push(`${f}:${j + 1} -> ${lines[j].trim().slice(0, 120)}`);
              break;
            }
            // Parar se encontrar o padrão correto (multi-path com isOnSuccessPage)
            if (/isOnSuccessPage\s*\(\s*\)/.test(lines[j])) break;
          }
        }
      }
      return violations;
    },
  },

  // -- Testes de pagamento devem usar cpf.acceptedPool ----------------------
  {
    name: 'Testes de pagamento devem usar cpf.acceptedPool[] em vez de CPF fixo hardcoded',
    level: 'warn',
    checklistItem: 'Testes de pagamento usam cpf.acceptedPool[N]',
    run: ({ stagedFiles }) => {
      const violations: string[] = [];
      const paymentSpecs = stagedFiles.filter((f) => /^tests\/spec\/e2e\/(journeys|payment)\/.+\.spec\.ts$/.test(f));
      for (const f of paymentSpecs) {
        const content = readContent(f);
        if (!content) continue;
        // Spec com clickFinishBtn (indica pagamento real) + CPF fixo hardcoded
        const hasPayment = /clickFinishBtn\s*\(\s*\)/.test(content);
        const hasFixedCpf = /123\.456\.761-08|12345676108/.test(content);
        const usesPool = /cpf\.acceptedPool/.test(content);
        if (hasPayment && hasFixedCpf && !usesPool) {
          violations.push(`${f} -> usa CPF fixo em teste de pagamento; prefira cpf.acceptedPool[N] de tests/data/cpf.ts`);
        }
      }
      return violations;
    },
  },
];

// ----------------------------------------------------------------------------
// Runner
// ----------------------------------------------------------------------------

function main(): number {
  const { staged, added } = getFiles();
  const mode = IS_CI ? `CI (diff vs ${PR_BASE})` : 'local (staged)';

  if (staged.length === 0) {
    console.log(c('gray', `> Nenhum arquivo alterado [${mode}] -- pulando checks Youse.`));
    return 0;
  }

  if (!IS_CI) {
    console.log('');
    console.log(c('bold', '[??] QA Pre-Commit Checks -- Youse Seguradora'));
    console.log(c('gray', `   ${staged.length} arquivo(s) staged . ${added.length} novo(s)`));
    console.log('');
  }

  const ctx: Context = { stagedFiles: staged, newFiles: added };
  const results: CheckResult[] = [];

  for (const check of CHECKS) {
    const violations = check.run(ctx);
    results.push({ name: check.name, level: check.level, violations, checklistItem: check.checklistItem });

    if (!IS_CI) {
      const icon = violations.length === 0 ? c('green', '[ok]') : check.level === 'error' ? c('red', 'XX ') : c('yellow', '!');
      const tag =
        violations.length === 0
          ? c('green', 'OK')
          : check.level === 'error'
            ? c('red', `FAIL (${violations.length})`)
            : c('yellow', `WARN (${violations.length})`);
      console.log(`  ${icon} ${check.name}  ${c('dim', '.')} ${tag}`);
      for (const v of violations.slice(0, 5)) console.log(c('gray', `        -  ${v}`));
      if (violations.length > 5) console.log(c('gray', `        -  ... +${violations.length - 5} ocorrencia(s)`));
    }
  }

  const errors = results.filter((r) => r.level === 'error' && r.violations.length > 0);
  const warns = results.filter((r) => r.level === 'warn' && r.violations.length > 0);
  const passed = results.filter((r) => r.violations.length === 0);

  // -- Saída JSON para CI ----------------------------------------------------
  if (IS_CI || REPORT_JSON) {
    const report = {
      mode,
      filesAnalyzed: staged.length,
      newFiles: added.length,
      summary: { passed: passed.length, warn: warns.length, fail: errors.length },
      results,
    };
    const jsonStr = JSON.stringify(report, null, 2);
    if (REPORT_JSON) {
      writeFileSync(REPORT_JSON, jsonStr, 'utf8');
      console.log(`QA checks report written to ${REPORT_JSON}`);
    } else {
      console.log(jsonStr);
    }
    return errors.length > 0 ? 1 : 0;
  }

  // -- Saída terminal (local) ------------------------------------------------
  console.log('');
  console.log(c('bold', ' Resumo'));
  console.log(`   ${c('green', `${passed.length} OK`)}  .  ${c('yellow', `${warns.length} warn`)}  .  ${c('red', `${errors.length} fail`)}`);
  console.log('');

  if (errors.length > 0) {
    console.log(
      c(
        'red',
        'âŒ Commit bloqueado: corrija os itens marcados como FAIL ou use `git commit --no-verify` apenas em emergências (com justificativa no PR).',
      ),
    );
    console.log('');
    return 1;
  }

  if (warns.length > 0) {
    console.log(c('yellow', '[!]  Commit autorizado, mas revise os WARNINGs acima.'));
    console.log('');
  } else {
    console.log(c('green', '[OK] Todos os checks passaram. Bom commit, Youser! :)'));
    console.log('');
  }

  return 0;
}

try {
  process.exit(main());
} catch (err) {
  console.error(c('red', '\u2717 Erro inesperado nos checks:'), err);
  process.exit(0);
}
