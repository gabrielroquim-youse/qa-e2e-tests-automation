# Planner — Pagamento checkout (Adyen + PIX)

> **Gateway:** Adyen (iframes no checkout QA) · **Massa:** `tests/data/adyenTestCards.ts`  
> **Última revisão:** 2026-06-24

---

## Escopo

| Camada              | Repo                      | O quê                                     |
| ------------------- | ------------------------- | ----------------------------------------- |
| **E2E UI**          | `qa-e2e-tests-automation` | Iframes cartão · seleção PIX · QR visível |
| **API**             | `qa-api-tests-automation` | `/payments` · webhooks · `test_` prefix   |
| **Confirmação PIX** | Sandbox Adyen             | Promote offer → sale (manual ou API)      |

Referência Adyen: [Test card numbers](https://docs.adyen.com/development-resources/test-cards-and-credentials/test-card-numbers) · [PIX Web Component](https://docs.adyen.com/payment-methods/pix/web-component)

---

## Cartão de crédito — cenários E2E

| ID     | Cenário               | Cartão Adyen               | Exp   | CVV | Spec                              | Tag              |
| ------ | --------------------- | -------------------------- | ----- | --- | --------------------------------- | ---------------- |
| PAY-C1 | Aprovado (happy path) | Visa `4111 1111 1111 1111` | 03/30 | 737 | journeys/\*                       | `@journey` ✅    |
| PAY-C2 | Aprovado Elo BR       | `5066 9911 1111 1118`      | 03/30 | 737 | payment/checkout-cards.spec.ts    | `@regression` ✅ |
| PAY-C3 | Aprovado Hipercard BR | `6062 8288 8866 6688`      | 03/30 | 737 | idem                              | `@regression` ✅ |
| PAY-C4 | Finalizar sem cartão  | —                          | —     | —   | ux/checkout.spec.ts CH1           | `@negative` ✅   |
| PAY-C5 | Recusado              | _(cartão refusal Adyen)_   | 03/30 | 737 | payment/checkout-declined.spec.ts | `@negative` ⬜   |
| PAY-C6 | 3DS2 challenge        | MC `5454 5454 5454 5454`   | 03/30 | 737 | payment/checkout-3ds.spec.ts      | `@regression` ⬜ |

**Then (aprovado):** URL `/issuance` ou `/sucesso` (ou caminhos D/E documentados em `CheckoutPage.clickFinishBtn`).

**Then (recusado):** Permanece em `/checkout` ou mensagem de erro visível.

---

## PIX — cenários (assíncrono)

PIX **não usa número de cartão**. Fluxo Adyen: QR → pagamento pendente → webhook / promote sandbox.

| ID      | Cenário                    | Given                       | When                     | Then                                  | Spec                            | Status     |
| ------- | -------------------------- | --------------------------- | ------------------------ | ------------------------------------- | ------------------------------- | ---------- |
| PAY-P1  | PIX disponível no checkout | Checkout Regular            | Expandir "outras formas" | Opção PIX visível                     | `payment/checkout-pix.spec.ts`  | ✅         |
| PAY-P2  | Selecionar PIX             | PIX habilitado              | Clicar PIX               | QR / copia-e-cola / instrução visível | idem                            | ✅         |
| PAY-P3  | CPF exibido no PIX         | PIX selecionado             | Abrir Suas informações   | CPF do segurado em Dados do segurado  | idem                            | ✅         |
| PAY-P4  | Checkout PIX pendente      | PIX selecionado + Finalizar | —                        | Permanece em `/checkout` + copiar PIX | idem                            | ✅         |
| PAY-P4b | Emissão após pagamento     | PIX confirmado (sandbox)    | Segundo Finalizar        | `/issuance` ou `/sucesso`             | `checkout-pix-emission.spec.ts` | 🟡 híbrido |

**UI:** PIX fica em **"Veja outras formas de pagamento com desconto"** (não é tab Adyen). Após selecionar, exibe "Pague com pix" + QR/código.

---

## Pirâmide PIX

```
Fase 1 — UI smoke E2E     → PAY-P1, PAY-P2 (este repo)
Fase 2 — API pagamento    → qa-api-tests-automation
Fase 3 — Confirmação      → npm run tool:pix-capture + tool:pix-confirm
Fase 4 — E2E emissão      → npm run test:pix:emission (page.pause + segundo Finalizar)
```

---

## Page Object

`CheckoutPage`:

- `fillCreditCardData()` — ✅ existente (iframes Adyen)
- `selectPaymentMethod('credit_card' | 'pix')` — ✅
- `expandOtherPaymentMethods()` — accordion de desconto
- `expectPixPaymentVisible()` — "Pague com pix" + QR/código
- `expandYourInfo()` / `expectInsuredCpfVisible(cpf)` — PAY-P3
- `submitPixCheckout()` / `expectPixPendingCheckout()` — PAY-P4

---

## Variáveis de ambiente

| Variável                | Uso                                                 |
| ----------------------- | --------------------------------------------------- |
| `TEST_CARD_NUMBER`      | Override cartão (já em `test.config.ts`)            |
| `TEST_CARD_EXPIRE`      | `0330`                                              |
| `TEST_CARD_CVV`         | `737`                                               |
| `TEST_PAYMENT_SCENARIO` | `approved` \| `elo_br` \| `hipercard_br`            |
| `STARK_PROJECT_ID`      | Projeto Stark sandbox (`tool:pix-pay`)              |
| `STARK_PRIVATE_KEY`     | Chave PEM do projeto Stark                          |
| `STARK_TAX_ID`          | CPF/CNPJ pagador Stark sandbox                      |
| `PIX_SANDBOX_EMISSION`  | `1` — habilita PAY-P4b                              |
| `PIX_SANDBOX_AUTO_PAY`  | `1` — paga via Stark no spec (com `STARK_*`)        |
| `PIX_RECORD`            | `1` — habilita spec de gravação (`test:pix:record`) |
| `PW_VIDEO`              | `on` — grava vídeo Playwright                       |
| `PW_SLOW_MO`            | ms entre ações (ex.: `60` no record)                |

---

## Manutenção

1. Novo cenário → linha nesta tabela → `adyenTestCards.ts` → spec
2. CAP pagamento → `scripts/coverage-inventory.ts` (CAP-37+)
3. `npm run coverage:sync`

---

## Relacionados

- [payment-testing.md](../guides/payment-testing.md) — guia operacional
- [planner-qa-agent.md](planner-qa-agent.md) — orquestração
