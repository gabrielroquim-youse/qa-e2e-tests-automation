# Planner — Pagamento checkout (Adyen + PIX)

> **Gateway cartão:** Adyen (iframes no checkout QA) · **Gateway PIX:** Stark Bank (integração Billing)  
> **Massa cartão:** `tests/data/adyenTestCards.ts`  
> **Última revisão:** 2026-06-24

---

## Referências Youse (fonte de verdade)

| Tipo           | Link                                                                                                                                                                      | Conteúdo                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Confluence** | [Pagamento com PIX](https://cxdigital.atlassian.net/wiki/spaces/youse/pages/3162112702/Pagamento+com+PIX)                                                                 | UX checkout · Figma · Miro                                                                             |
| **Jira V1**    | [ARC-1245](https://cxdigital.atlassian.net/browse/ARC-1245)                                                                                                               | PIX Auto — regras de negócio · Stark · estratégia de testes                                            |
| **Jira V2**    | [ARC-1280](https://cxdigital.atlassian.net/browse/ARC-1280)                                                                                                               | Melhorias UX copia-cola · validação na tela · cross indisponível                                       |
| **Incidente**  | [INC-1439](https://cxdigital.atlassian.net/browse/INC-1439)                                                                                                               | Invoice paga no Stark, apólice não emitida — risco do 2º Finalizar                                     |
| **Backend**    | [order-service#1893](https://github.com/youse-seguradora/order-service/pull/1893)                                                                                         | Não revalidar cupom ao finalizar com PIX ([YCJV-139](https://cxdigital.atlassian.net/browse/YCJV-139)) |
| **Adyen**      | [Test cards](https://docs.adyen.com/development-resources/test-cards-and-credentials/test-card-numbers) · [PIX](https://docs.adyen.com/payment-methods/pix/web-component) | Cartão + promote offer (fallback)                                                                      |
| **Stark**      | [SDK Node — Pay BR Code](https://github.com/starkbank/sdk-node#pay-a-br-code)                                                                                             | `tool:pix-pay`                                                                                         |

**Squads (ARC-1245):** **Billing** — integração Stark · **Conversão Auto** — checkout e UX.

**Fora do escopo deste planner:** [BIL-3097](https://cxdigital.atlassian.net/browse/BIL-3097) (recompensa PIX), [BIL-2678](https://cxdigital.atlassian.net/browse/BIL-2678) (ATS PIX BS2), [VR-1375](https://cxdigital.atlassian.net/browse/VR-1375) (PIX Residencial).

---

## Regras de negócio PIX (ARC-1245)

1. **Invoice/QR só após** o cliente selecionar PIX e confirmar (não gera para toda cotação no checkout).
2. **Apólice só após confirmação do pagamento** — pagou mas não concluiu o fluxo → **não emite**.
3. Validação após confirmar e-mail + **1º Finalizar** → cobrança pendente.
4. **2º Finalizar** após webhook Stark confirma pagamento → emissão.
5. V1: **Auto** · vigência **anual** · plano **à vista**.
6. UI: accordion **"Veja outras formas de pagamento com desconto"** (não é tab Adyen).

---

## Escopo

| Camada              | Repo                        | O quê                                            |
| ------------------- | --------------------------- | ------------------------------------------------ |
| **E2E UI**          | `qa-e2e-tests-automation`   | Iframes cartão · seleção PIX · QR · 2º Finalizar |
| **API**             | `qa-api-tests-automation`   | `/payments` · webhooks · `test_` prefix          |
| **Confirmação PIX** | **Stark sandbox** (Billing) | `tool:pix-pay` · BrcodePayment · webhook real    |
| **Confirmação PIX** | Adyen test (fallback)       | Promote offer → sale em `ca-test.adyen.com`      |

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

PIX **não usa cartão**. Provider QA observado: **Stark Infra** (`brcode-h.sandbox.starkinfra.com`). Fluxo: QR → pagamento sandbox → webhook → **2º Finalizar**.

| ID      | Cenário                    | Given                          | When                     | Then                                  | Spec                            | Status   |
| ------- | -------------------------- | ------------------------------ | ------------------------ | ------------------------------------- | ------------------------------- | -------- |
| PAY-P1  | PIX disponível no checkout | Checkout Regular               | Expandir "outras formas" | Opção PIX visível                     | `payment/checkout-pix.spec.ts`  | ✅       |
| PAY-P2  | Selecionar PIX             | PIX habilitado                 | Clicar PIX               | QR / copia-e-cola / instrução visível | idem                            | ✅       |
| PAY-P3  | CPF exibido no PIX         | PIX selecionado                | Abrir Suas informações   | CPF do segurado em Dados do segurado  | idem                            | ✅       |
| PAY-P4  | Checkout PIX pendente      | PIX selecionado + 1º Finalizar | —                        | Permanece em `/checkout` + copiar PIX | idem                            | ✅       |
| PAY-P4b | Emissão após pagamento     | PIX confirmado (Stark)         | 2º Finalizar             | `/issuance` ou `/sucesso`             | `checkout-pix-emission.spec.ts` | 🟡 Stark |
| PAY-P4r | Gravação demo (vídeo)      | PAY-P4 ou PAY-P4b              | —                        | `.webm` em `docs/reports/videos/`     | `checkout-pix-record.spec.ts`   | ✅ UI    |

**UI:** PIX em **"Veja outras formas de pagamento com desconto"**. Após selecionar: "Pague com pix" + QR/código.

### ARC-1245 — estratégia de testes × automação

| Critério ARC-1245                                 | Cobertura E2E | Spec / nota                                                                                   |
| ------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------- |
| Emitir apólice Pix                                | 🟡            | PAY-P4b + `STARK_*` no `.env`                                                                 |
| Tentar emitir com invoice **não pago**            | ✅            | PAY-P4                                                                                        |
| Tentar emitir com invoice **expirado**            | ⬜            | Backlog — aguardar TTL sandbox                                                                |
| Pago sem concluir fluxo (sem 2º Finalizar)        | 🟡            | Manual / INC-1439 — apólice não sobe                                                          |
| Validar documento proposta/apólice Pix            | ⬜            | Fora do browser — GW / PDF                                                                    |
| Validar apólice no Policy-Center / Billing-Center | ⬜            | `qa-api-tests-automation` ou manual                                                           |
| Cross indisponível no PIX (ARC-1280)              | ⬜            | `ux/checkout.spec.ts` — backlog                                                               |
| Cupom não revalidado no 2º Finalizar PIX          | 🟡            | Coberto por [order-service#1893](https://github.com/youse-seguradora/order-service/pull/1893) |

---

## Pirâmide PIX

```
Fase 1 — UI smoke E2E     → PAY-P1 a PAY-P4 (este repo)
Fase 2 — API pagamento    → qa-api-tests-automation
Fase 3 — Confirmação      → Stark: tool:pix-capture + tool:pix-pay (Billing)
                            Adyen fallback: tool:pix-confirm → ca-test.adyen.com
Fase 4 — E2E emissão      → test:pix:emission (2º Finalizar após webhook)
Fase 5 — Demo / evidência  → test:pix:record:export
```

**Credenciais Stark:** solicitar à **Squad Billing** (integração ARC-1245). Contato de referência em [BIL-2678](https://cxdigital.atlassian.net/browse/BIL-2678).

---

## Page Object

`CheckoutPage`:

- `fillCreditCardData()` — ✅ existente (iframes Adyen)
- `selectPaymentMethod('credit_card' | 'pix')` — ✅
- `expandOtherPaymentMethods()` — accordion de desconto
- `expectPixPaymentVisible()` — "Pague com pix" + QR/código
- `expandYourInfo()` / `expectInsuredCpfVisible(cpf)` — PAY-P3
- `submitPixCheckout()` / `expectPixPendingCheckout()` — PAY-P4 (1º Finalizar)
- `tryFinalizeAfterPixPayment()` / `finalizeAfterPixPayment()` — PAY-P4b (2º Finalizar)

---

## Variáveis de ambiente

| Variável                   | Uso                                                 |
| -------------------------- | --------------------------------------------------- |
| `TEST_CARD_NUMBER`         | Override cartão (já em `test.config.ts`)            |
| `TEST_CARD_EXPIRE`         | `0330`                                              |
| `TEST_CARD_CVV`            | `737`                                               |
| `TEST_PAYMENT_SCENARIO`    | `approved` \| `elo_br` \| `hipercard_br`            |
| `STARK_PROJECT_ID`         | Projeto Stark sandbox (`tool:pix-pay`)              |
| `STARK_PRIVATE_KEY`        | Chave PEM do projeto Stark                          |
| `STARK_TAX_ID`             | CPF/CNPJ pagador Stark sandbox                      |
| `PIX_SANDBOX_EMISSION`     | `1` — habilita PAY-P4b                              |
| `PIX_SANDBOX_AUTO_PAY`     | `1` — paga via Stark no spec (com `STARK_*`)        |
| `PIX_SANDBOX_MANUAL_PAUSE` | `0` — pula pause no PAY-P4b (após `tool:pix-pay`)   |
| `PIX_RECORD`               | `1` — habilita spec de gravação (`test:pix:record`) |
| `PW_VIDEO`                 | `on` — grava vídeo Playwright                       |
| `PW_SLOW_MO`               | ms entre ações (ex.: `60` no record)                |

---

## Manutenção

1. Novo cenário → linha nesta tabela → `adyenTestCards.ts` → spec
2. CAP pagamento → `scripts/coverage-inventory.ts` (CAP-37+)
3. `npm run coverage:sync`

---

## Relacionados

- [payment-testing.md](../guides/payment-testing.md) — guia operacional
- [planner-qa-agent.md](planner-qa-agent.md) — orquestração
