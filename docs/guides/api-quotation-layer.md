# Camada API — Cotação Auto

> **Objetivo:** validar **regra de negócio e precificação via HTTP** (camada de serviço), deixando E2E focado em **usabilidade, jornada e integração visual**.

## Pirâmide (padrão de mercado)

```
        ┌─────────────┐
        │  E2E / UX   │  qa-e2e-tests-automation — “o usuário consegue usar?”
        ├─────────────┤
        │ API / HTTP  │  qa-api-tests-automation — “o motor calcula certo?”  ← este guia
        ├─────────────┤
        │ Unit (dev)  │  repos opin-service / apiws — lógica isolada (time de backend)
        └─────────────┘
```

| Camada   | Repo                      | O que testar                                            | O que **não** testar     |
| -------- | ------------------------- | ------------------------------------------------------- | ------------------------ |
| **API**  | `qa-api-tests-automation` | Preço, ordinal de planos, bônus, garagem, contrato JSON | Layout, modal, labels    |
| **E2E**  | `qa-e2e-tests-automation` | Smoke por tela, jornada, bloqueios, a11y                | Comparar R$ no browser   |
| **Unit** | backend                   | Funções puras, domínio                                  | Fluxo HTTP ponta a ponta |

## Divisão de responsabilidades

| Camada   | Pergunta                                   | Onde                                                   |
| -------- | ------------------------------------------ | ------------------------------------------------------ |
| **E2E**  | O cliente vê, navega e consegue contratar? | `qa-e2e` → `tests/spec/e2e/journeys`, `ux`, `blockers` |
| **API**  | O motor calcula preço/regra corretamente?  | `qa-api-tests-automation` → `tests/spec/quotation`     |
| **A11y** | WCAG / teclado / mobile                    | `qa-e2e` → `tests/spec/a11y`                           |

## Estrutura (repo API)

```
qa-api-tests-automation/tests/
├── fixtures/setupQuotationApi.ts
├── helpers/pricingAssertions.ts
├── services/quotation/
│   ├── ApiWsAutoQuotationService.ts      # cliente BFF apiws (até plan_selection)
│   ├── ApiWsCustomizationService.ts      # coberturas + assistências
│   ├── QuotationPricingService.ts        # fachada quotePlans()
│   └── QuotationCustomizationService.ts  # fachada personalização
└── spec/quotation/
    ├── planos-ordinal.spec.ts
    ├── coberturas.spec.ts
    ├── assistencias.spec.ts
    ├── validacao-valores.spec.ts
    ├── rps-promo.spec.ts
    └── …
```

## Configuração

```bash
# .env (repo qa-api-tests-automation)
QUOTATION_API_URL=https://qa-apiws.youse.io/bra/web-app/v1
```

Sem `QUOTATION_API_URL`, specs `@pricing` ficam em **skip** (não quebram CI local).

---

## Playbook — como criar testes API (passo a passo)

### Passo 0 — Descobrir o contrato (VPN)

Contrato real: **BFF apiws** — `QUOTATION_API_URL` (ex. `https://qa-apiws.youse.io/bra/web-app/v1`).

| Pergunta        | Resposta (QA)                                       |
| --------------- | --------------------------------------------------- |
| Base URL?       | `QUOTATION_API_URL`                                 |
| Fluxo planos?   | POST/PUT `/cotacao/auto/{id}` até `plan_selection`  |
| Personalização? | PUT `coverages_selection` / `assistances_selection` |
| Auth?           | Headers Origin/Referer (simula front)               |

**Captura automática (repo E2E):**

```bash
npx playwright test tests/spec/tools/pricing-network-capture.spec.ts --project=chromium
npx playwright test tests/spec/tools/customization-network-capture.spec.ts --project=chromium
```

Artefatos: `docs/reports/*-network-capture.json` · guias em `qa-api-tests-automation/docs/guides/`.

### Passo 1 — Copiar o padrão existente

Specs API seguem o mesmo modelo de `ciliaClaimAuth.spec.ts`:

```typescript
import { expect } from '../../../fixtures/matchers';
import { test } from '../../../fixtures/setupQuotationApi';

test('...', async ({ request, quotationApi, quotationPayload }) => {
  const response = await quotationApi.quotePlans(request, quotationPayload);
  expect(response.status()).toBe(200);
  await expect(await response.json()).toMatchSchema(MeuSchema);
});
```

### Passo 2 — Ajustar service + schema

1. Atualize path/payload em `QuotationPricingService.ts`.
2. Ajuste campos em `buildQuotationPayload.ts` (nomes iguais ao JSON real).
3. Valide resposta com Zod em `tests/schemas/quotation/`.

### Passo 3 — Escrever o spec

1. Copie `planos-ordinal.spec.ts` ou `bonus-class.spec.ts`.
2. Tags: `@api` + `@pricing` (+ `@assistencias`, `@bonus_class`, etc.).
3. Asserts: use `pricingAssertions.ts` (ordinal, sanidade, delta simétrico).

### Passo 4 — Rodar local

```bash
npm run test:api:quotation
# um arquivo
npx playwright test tests/spec/api/quotation/planos-ordinal.spec.ts --reporter=list
```

### Passo 5 — Migrar do E2E

Quando o spec API estiver **verde em QA**:

1. Marque o teste E2E equivalente como `@deprecated` ou remova.
2. Atualize a matriz em `tests/spec/api/quotation/README.md`.
3. PR pequeno: 1 cenário por vez.

---

## Ordem sugerida de migração

| #   | Spec API                    | Origem E2E                             | Esforço |
| --- | --------------------------- | -------------------------------------- | ------- |
| 1   | `planos-ordinal.spec.ts`    | `precosPlanos` — hierarquia planos     | M       |
| 2   | `bonus-class.spec.ts`       | `precosPlanos` + `validateBonusClass`  | M       |
| 3   | `precos-variaveis.spec.ts`  | `precosPlanos` — garagem, uso, zero km | M       |
| 4   | `assistencias.spec.ts`      | `assistencias.spec.ts`                 | G       |
| 5   | `coberturas.spec.ts`        | `personalizacao.spec.ts`               | G       |
| 6   | `validacao-valores.spec.ts` | `validacaoValores.spec.ts`             | P       |

Legenda: P = pequeno · M = médio · G = grande

---

## Comandos

```bash
# Repo API (canônico para pricing)
cd qa-api-tests-automation && npm run test:pricing

# Repo E2E — só UX / jornada
cd qa-e2e-tests-automation && npm run test:smoke
```

## Branch

Trabalho em `feat/api-quotation-layer`.
