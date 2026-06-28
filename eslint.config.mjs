// @ts-check
import { fileURLToPath } from 'url';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import playwrightPlugin from 'eslint-plugin-playwright';
import prettierConfig from 'eslint-config-prettier';

// Caminho absoluto desta pasta — necessário para tsconfigRootDir no flat config
const __dirname = fileURLToPath(new URL('.', import.meta.url));

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // ── Ignores globais ────────────────────────────────────────────────────────
  {
    ignores: [
      'dist/**',
      'storage/**',
      'node_modules/**',
      'playwright-report/**',
      'allure-results/**',
      'allure-report/**',
      'test-results/**',
    ],
  },

  // ── Todos os arquivos TypeScript do projeto ────────────────────────────────
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // Regras recomendadas TypeScript
      ...typescriptEslint.configs['recommended'].rules,

      // Segurança de promises (sem await esquecido)
      '@typescript-eslint/no-floating-promises': 'error',
      // Avisa sobre `any` explícito — melhor documentar do que silenciar
      '@typescript-eslint/no-explicit-any': 'warn',
      // Variáveis não usadas (prefixo _ para ignorar intencionalmente)
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],

      // ── Clean Code / boas práticas gerais ─────────────────────────
      // Comparação estrita evita coerção implícita (SOLID/Clean Code)
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      // `var` é legado — sempre `let`/`const`
      'no-var': 'error',
      // Variáveis que nunca são reatribuídas devem ser `const`
      'prefer-const': 'error',
      // Console permitido apenas para warn/error em produção; log em scripts é tratado pelo qa-pre-commit-checks
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      // Evita o operador `with` (já banido em strict mode, mas reforça intent)
      'no-with': 'error',
      // Evita comparação a si mesmo (`x === x`)
      'no-self-compare': 'error',
      // Evita `eval` e similares
      'no-eval': 'error',
      'no-implied-eval': 'error',
      // Evita atribuição em expressão condicional (exceto quando parentizada explicitamente)
      'no-cond-assign': ['error', 'except-parens'],
      // Evita `else` desnecessário após `return`
      'no-else-return': ['warn', { allowElseIf: false }],
      // Evita acumular condições impossíveis
      'no-duplicate-imports': 'error',
    },
  },

  // ── Specs: console.log permitido (debug e diagnóstico locais) ────────────
  {
    files: ['tests/spec/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },

  // ── Scripts de orquestração: console é parte da UX ───────────────────────
  {
    files: ['scripts/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },

  // ── Specs e Page Objects Playwright ───────────────────────────────────────
  {
    files: ['tests/**/*.ts'],
    plugins: {
      playwright: playwrightPlugin,
    },
    settings: {
      playwright: {
        // Reconhece aliases de `test` criados pelas fixtures do projeto
        globalAliases: { test: ['Test'] },
        // Custom matchers adicionados via baseExpect.extend()
        additionalCustomMatchers: ['toMatchSchema'],
      },
    },
    rules: {
      // Regras recomendadas do plugin
      ...playwrightPlugin.configs['flat/recommended'].rules,

      // ── Antipadrões proibidos ──────────────────────────────────────
      // Esperas fixas são fonte de flakiness — usar waitFor/expect
      'playwright/no-wait-for-timeout': 'error',
      // await desnecessário bagunça leitura e pode esconder bugs
      'playwright/no-useless-await': 'error',
      // test.only impede que a suíte inteira rode no CI
      'playwright/no-focused-test': 'error',
      // { force: true } bypassa a verificação de visibilidade/habilitação
      'playwright/no-force-option': 'warn',

      // ── Boas práticas ──────────────────────────────────────────────
      // toBeVisible() em vez de isVisible() (web-first assertion)
      'playwright/prefer-web-first-assertions': 'error',
      // Todo teste precisa de pelo menos um expect (inclui helpers CAP-02)
      'playwright/expect-expect': [
        'error',
        {
          assertFunctionNames: [
            'expect',
            'expectContinueDisabled',
            'expectFieldInvalid',
            'expectStayOnStep',
            'expectStayOnUrl',
            'expectValidationMessage',
            'expectContinueBlockedOnClick',
            'expectPixPaymentVisible',
            'expectInsuredCpfVisible',
            'expectPixPendingCheckout',
          ],
        },
      ],
      // expect() só dentro de testes
      'playwright/no-standalone-expect': 'error',
      // expect() deve receber argumento
      'playwright/valid-expect': 'error',

      // ── Avisos (não bloqueantes, mas registrados) ─────────────────
      // test.skip sem comentário dificulta o entendimento
      'playwright/no-skipped-test': 'warn',
      // Lógica condicional em testes torna o resultado imprevisível
      'playwright/no-conditional-in-test': 'warn',
    },
  },

  // ── Prettier (deve ser o último para sobrescrever regras de formatação) ───
  prettierConfig,
];
