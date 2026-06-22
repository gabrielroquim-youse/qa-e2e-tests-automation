# Camada API — Cotação Auto

> **Objetivo:** testar regra de negócio e precificação via HTTP, deixando E2E focado em UX e integração visual.

## Divisão de responsabilidades

| Camada   | Pergunta                                   | Onde                                        |
| -------- | ------------------------------------------ | ------------------------------------------- |
| **E2E**  | O cliente vê, navega e consegue contratar? | `tests/spec/e2e/journeys`, `ux`, `blockers` |
| **API**  | O motor calcula preço/regra corretamente?  | `tests/spec/api/quotation`                  |
| **A11y** | WCAG / teclado / mobile                    | `tests/spec/a11y`                           |

## Estrutura

```
tests/
├── data/quotationDefaults.ts           # massa padrão compartilhada
├── fixtures/setupQuotationApi.ts       # importar nos specs API
├── services/quotation/
│   ├── QuotationPricingService.ts      # cliente HTTP
│   └── buildQuotationPayload.ts        # JSON do request
├── schemas/quotation/                  # Zod — contrato de resposta
└── spec/api/quotation/
    ├── planos-ordinal.spec.ts          # 1º cenário a migrar
    └── bonus-class.spec.ts             # próximo: copiar de planos-ordinal.spec.ts
```

## Configuração

```bash
# .env
OPIN_SERVICE_URL=https://qa-opin-service.youse.io   # URL real do time de backend
```

Sem `OPIN_SERVICE_URL`, specs `@pricing` ficam em **skip** (não quebram CI).

---

## Playbook — como criar testes API (passo a passo)

### Passo 0 — Descobrir o contrato (1–2 h com backend)

Antes de codar, responda com o time:

| Pergunta                    | Exemplo                                   |
| --------------------------- | ----------------------------------------- |
| Base URL do serviço?        | `https://qa-opin-service.youse.io` ou BFF |
| Path para cotar até planos? | `POST /v1/quotations/plans`               |
| Auth?                       | Bearer, cookie, nenhum em QA              |
| Payload mínimo?             | placa, CEP, CPF, garagem…                 |
| Formato da resposta?        | `{ plans: [{ plan, monthly }] }`          |

**Como descobrir sozinho (VPN on):**

1. Abra o funil no Chrome → DevTools → **Network** → filtre `Fetch/XHR`.
2. Avance até **Seleção de planos** e anote URL + body das requisições de pricing.
3. Ou rode smoke E2E com trace: `npx playwright test ux/plan-selection --trace on`.
4. Copie request/response para o planner ou para `QuotationPricingService.ts`.

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
npm run test:api:quotation    # só pricing
npm run test:api              # api/ inteira (claims + test-utils + quotation)
npm run test:smoke            # E2E UX — PR
```

## Branch

Trabalho em `feat/api-quotation-layer`.
