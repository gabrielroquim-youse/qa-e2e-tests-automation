# Boas práticas — QA E2E Seguro Auto

> Padrões do repositório, o que já seguimos bem e onde ainda há débito técnico.  
> **Última revisão:** 2026-06-24

---

## Princípios do projeto

| Princípio                | Significado                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| **E2E = experiência**    | Browser valida o que o cliente vê e usa; preço/contrato HTTP ficam em `qa-api-tests-automation` |
| **Testes independentes** | Cada spec navega o funil do zero; sem `mode: 'serial'`                                          |
| **Asserts estáveis**     | Ordinais e faixas para preço; `aria-invalid` e URL para validação de formulário                 |
| **Uma fonte de verdade** | Planners → specs → `coverage-inventory.ts` → `npm run coverage:sync`                            |

---

## Arquitetura (o que fazer)

### Page Object Model

```
Spec → Fixture (setupQuotation) → Page Object → Browser
```

- Interações de UI **só** em `tests/pages/`
- Specs **não** usam `page.locator()` para elementos do funil
- Navegação tipada via `QuotationPageLayout` + `proxymise` para encadeamento fluente

### Helpers compartilhados

| Arquivo                            | Uso                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `tests/helpers/funnel.ts`          | Navegação parcial até planos, checkout, coberturas; `resetSession()` entre cotações                     |
| `tests/helpers/formValidation.ts`  | Asserções CAP-02: `expectContinueDisabled`, `expectFieldInvalid`, `expectStayOnStep`, `expectStayOnUrl` |
| `tests/data/*.ts`                  | Massa estática (CPF, placa, CEP real, planos)                                                           |
| `tests/fixtures/setupQuotation.ts` | `quotationData` dinâmico + injeção de POMs                                                              |

### Organização de specs

| Pasta             | Quando usar                               |
| ----------------- | ----------------------------------------- |
| `e2e/journeys/`   | Fluxo completo ponta a ponta (`@journey`) |
| `e2e/ux/`         | Usabilidade e validação por tela (`@ux`)  |
| `e2e/blockers/`   | Bloqueio de negócio visível (`@negative`) |
| `e2e/regression/` | UX restante (cards, modais, toggles)      |
| `a11y/`           | WCAG, teclado, viewport mobile/tablet     |
| `api/`            | Sinistro e test-utils **apenas**          |

### Seletores (ordem de preferência)

1. `getByRole` · 2. `getByLabel` / `getByText` · 3. `getByTestId` · 4. CSS/XPath (último recurso)

### Tags e pipeline

| Tag           | Pipeline sugerido                                |
| ------------- | ------------------------------------------------ |
| `@smoke`      | PR — journeys + UX crítico                       |
| `@ux`         | PR ou nightly (`npm run test:ux`, `--workers=1`) |
| `@regression` | Nightly                                          |
| `@price`      | Repo API, não E2E browser                        |

### Commits e PR

- [Conventional Commits](https://www.conventionalcommits.org/) em PT-BR
- Antes do PR: `npm run validate`
- Checklist: [`.github/pull_request_template.md`](../../.github/pull_request_template.md)
- Atualizar planner + `npm run coverage:sync` quando mudar cobertura

---

## O que já está alinhado com boas práticas

| Área                   | Evidência                                                                  |
| ---------------------- | -------------------------------------------------------------------------- |
| Separação E2E × API    | `docs/guides/api-quotation-layer.md`, stubs em `tests/spec/api/quotation/` |
| POM + fixtures         | 14 pages em `tests/pages/quotation/`, `setupQuotation.ts`                  |
| Validação reutilizável | CAP-02 em `formValidation.ts` + 10 specs UX                                |
| Navegação DRY          | `funnel.ts` com waits explícitos pós-transição (placa, CPF)                |
| Qualidade local        | ESLint + Prettier + Husky/lint-staged + `npm run validate`                 |
| Cobertura rastreável   | Inventário CAP, sync automático, painel em `docs/coverage/`                |
| Dados de teste         | CEPs reais (`data/cep.ts`), CPF/placa categorizados                        |
| CI                     | validate → shards Playwright → merge-report                                |

---

## Débito técnico e melhorias recomendadas

### Prioridade alta

| Item                     | Problema                                                  | Ação                                                                             |
| ------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Flake em suíte longa** | `test:ux` ~30 min; timeouts esporádicos em lead/placa/CPF | Manter `--workers=1` no UX; waits pós-`clickContinue` (padrão já em `funnel.ts`) |
| **CAP-06 placa leilão**  | `test.fixme` — QA não bloqueia YOU-0020                   | Alinhar com backend/QA ou documentar skip permanente                             |
| **Docs vs código**       | Métricas e backlog desatualizados em guias antigos        | Manter `fluxos-cotacao-auto.md` e `coverage/README` em sync após cada entrega    |

### Prioridade média

| Item                            | Ação                                                                       |
| ------------------------------- | -------------------------------------------------------------------------- |
| **CAP-04, CAP-27, CAP-34** (🟡) | Completar asserts ordinais/deltas em regression ou migrar trechos para API |
| **CAP-10, CAP-14** (🔒)         | Massa CEP alto risco + CPF/idade no QA                                     |
| **CI PR**                       | Rodar só `@smoke`; nightly com `test:ux` + `test:regression`               |
| **A11y**                        | Expandir `tests/spec/a11y/` conforme `a11y-gap-map.md`                     |

### Prioridade baixa

| Item                     | Ação                                              |
| ------------------------ | ------------------------------------------------- |
| CAP-02 P3 restante       | Mensagens inline extras; checkbox e-mail checkout |
| B4 smoke bônus → planos  | Spec leve em `bonuses-class.spec.ts`              |
| Viewport mobile no funil | Projeto Pixel 5 opcional na CI                    |
| `.env.example`           | Template versionado (sem secrets) para onboarding |

---

## Anti-padrões (evitar)

```typescript
// ❌ Preço absoluto — quebra com reajuste tarifário
expect(preco).toBe(2205.92);

// ❌ Locator na spec
await page.locator('.btn-primary').click();

// ❌ waitForTimeout fixo
await page.waitForTimeout(5000);

// ❌ Faker para CEP
faker.location.zipCode();

// ❌ Duplicar navegação do funil em cada spec
// Use navigateToPlans(), navigateToCheckout(), etc.

// ❌ test.only / skip sem comentário explicando motivo
```

---

## Checklist ao adicionar teste

1. Cenário no planner (`docs/planners/planner-*.md`)
2. Page Object se tela nova; método novo se interação nova
3. Spec na pasta correta (`ux/` vs `journeys/` vs `regression/`)
4. Tags `@quotation_auto` + `@smoke` ou `@regression` ou `@negative`
5. Helper em `funnel.ts` / `formValidation.ts` se repetir 2+ vezes
6. `scripts/coverage-inventory.ts` se nova capacidade CAP
7. `npm run coverage:sync` + `npm run validate`
8. Rodar spec local com VPN

---

## Relacionados

- [README raiz](../../README.md) — setup, stack, comandos
- [API vs E2E](./api-quotation-layer.md)
- [Mapa de fluxos](./fluxos-cotacao-auto.md)
- [Cobertura](../coverage/README.md)
- [Troubleshooting](./troubleshooting.md)
