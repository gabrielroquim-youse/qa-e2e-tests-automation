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
│   ├── ApiWsAutoQuotationService.ts   # cliente BFF apiws
│   └── QuotationPricingService.ts     # fachada quotePlans()
└── spec/quotation/
    ├── planos-ordinal.spec.ts
    ├── bonus-class.spec.ts
    ├── precos-variaveis.spec.ts
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
# Repo API (canônico para pricing)
cd qa-api-tests-automation && npm run test:pricing

# Repo E2E — só UX / jornada
cd qa-e2e-tests-automation && npm run test:smoke
```

## Branch

Trabalho em `feat/api-quotation-layer`.
