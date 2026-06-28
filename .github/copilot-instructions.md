---
# GitHub Copilot — Instruções do Repositório QA E2E
# Aplicado automaticamente em code reviews, sugestões e chat no contexto deste repo.
#
# Referência: https://docs.github.com/en/copilot/customizing-copilot/adding-repository-instructions-for-github-copilot
---

## Contexto

Este repositório automatiza a **jornada E2E do Seguro Auto B2C Youse** usando **Playwright + TypeScript**.
Cobre fluxos de cotação, usabilidade por tela (UX), acessibilidade (a11y), pagamento PIX/cartão e testes de API.

## Regras obrigatórias ao revisar ou gerar código

### Playwright

- **NUNCA** use `page.waitForTimeout()` ou `await page.waitFor(ms)`. Prefira `await expect(locator).toBeVisible()` ou `waitFor`.
- **NUNCA** use `test.only` ou `describe.only` — bloqueia a suíte inteira no CI.
- **SEMPRE** aguarde ações Playwright com `await` — `@typescript-eslint/no-floating-promises` está ativado.
- **PREFIRA** seletores de acessibilidade: `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`, `getByTestId`.
  Evite `page.locator('.class')`, `page.locator('#id')`, `page.$()`.
- **PREFIRA** `toBeVisible()` (web-first assertion) em vez de `isVisible()` (retorna boolean).
- Evite `{ force: true }` em ações — corrija a causa raiz.
- Cada teste deve ter pelo menos um `expect()`.

### Estrutura de diretórios — specs

```
tests/spec/e2e/
  journeys/    → @journey — fluxos completos ponta-a-ponta
  ux/          → @ux      — usabilidade por tela (1 tela por spec)
  blockers/    → bloqueios e validações de formulário
  regression/  → @regression — testes de regressão
  payment/     → testes de pagamento
tests/spec/api/         → API interna (Cilia, test-utils)
tests/spec/a11y/        → @a11y — acessibilidade
tests/spec/tools/       → ferramentas de diagnóstico (não são CI)
```

Todo novo `.spec.ts` precisa de uma tag correspondente ao diretório onde está.

### Tags obrigatórias

| Tag               | Quando usar                                  |
| ----------------- | -------------------------------------------- |
| `@smoke`          | Smoke: testes críticos para validação rápida |
| `@ux`             | UX: validação de usabilidade por tela        |
| `@journey`        | Jornada: fluxo ponta-a-ponta                 |
| `@regression`     | Regressão: cobertura ampla                   |
| `@a11y`           | Acessibilidade axe-core                      |
| `@pricing`        | Cotação/preço                                |
| `@quotation_auto` | Funil de cotação automóvel                   |
| `@keyboard`       | Navegação por teclado                        |

### Page Objects

- Lógica de interação fica em Page Objects em `tests/pages/` — **não** na spec.
- Helpers reutilizáveis ficam em `tests/helpers/` ou `tests/fixtures/`.
- Page Objects herdam de `BasePage` e usam `proxymise` para chaining.

### TypeScript / Clean Code

- `strict: true` está ativo — sem `any` implícito.
- Use `const` por padrão; `let` só quando necessário; `var` é proibido.
- Use `===` (eqeqeq). Evite `==`.
- Sem `console.log` em specs/pages; use `console.info` para logs de diagnóstico temporário.
- Sem `debugger;` no código.

### LGPD / Segurança

- **NUNCA** versione CPF real, número de cartão real, e-mail pessoal ou senha em testes.
- Use dados de `tests/data/` ou geradores (`@faker-js/faker`, `cpf-cnpj-validator`).
- **NUNCA** versione arquivos `.env` (exceto `.env.example` com placeholders).
- Tokens e API keys sempre em GitHub Secrets ou variáveis de ambiente.

### Testes independentes

- Cada `test()` deve funcionar isoladamente — sem depender de estado de outro teste.
- Evite `mode: 'serial'` sem necessidade comprovada.
- Use fixtures (`beforeEach`) para setup de estado.

### Preços e valores monetários

- **NUNCA** fixe um preço absoluto como `R$ 1.234,56` em assertions de spec.
- Use relações ordinais ("plano mais barato", "primeiro resultado") ou faixas ("entre R$ 800 e R$ 1.500").

### Commits e PRs

- Conventional Commits em PT-BR: `feat(scope): descrição`, `fix(scope): ...`, `chore(ci): ...`
- Título ≤ 72 caracteres.
- Todo PR deve ter a descrição preenchida e o checklist do template revisado.

## O que revisar em um PR

Ao revisar um PR neste repositório, verifique especialmente:

1. `page.waitForTimeout` presente → **erro grave** — sugerir alternativa `waitFor`.
2. `test.only` esquecido → **bloqueia CI** — deve ser removido.
3. Seletores frágeis (CSS/XPath) → sugerir `getByRole`/`getByLabel`.
4. `await` ausente em ação Playwright → bug silencioso.
5. Dados pessoais reais (CPF, cartão) → **violação LGPD**.
6. Spec sem tag → testes nunca rodarão nos scripts de CI corretos.
7. Spec no diretório errado → confunde a estratégia de tags.
8. `mode: 'serial'` desnecessário → quebra isolamento.
9. Preço absoluto em assertion → teste quebrará em qualquer variação de precificação.
10. Lógica de negócio na spec (deveria estar no Page Object).
