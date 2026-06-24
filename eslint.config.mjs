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
