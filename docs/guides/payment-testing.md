# Guia — Testes de pagamento (Adyen + PIX)

> **Cartão:** Adyen Components (iframes) no checkout QA.  
> **PIX:** assíncrono via **Stark Bank** (Squad Billing) — confirmação sandbox + webhook + **2º Finalizar**.

---

## Referências Youse

| Recurso                         | Link                                                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Confluence — Pagamento PIX      | [Pagamento com PIX](https://cxdigital.atlassian.net/wiki/spaces/youse/pages/3162112702/Pagamento+com+PIX)   |
| Jira V1 (regras + Stark)        | [ARC-1245](https://cxdigital.atlassian.net/browse/ARC-1245)                                                 |
| Jira V2 (UX checkout)           | [ARC-1280](https://cxdigital.atlassian.net/browse/ARC-1280)                                                 |
| Incidente — pago sem emissão    | [INC-1439](https://cxdigital.atlassian.net/browse/INC-1439)                                                 |
| Backend — cupom no 2º Finalizar | [order-service#1893](https://github.com/youse-seguradora/order-service/pull/1893)                           |
| Adyen test cards                | [docs.adyen.com](https://docs.adyen.com/development-resources/test-cards-and-credentials/test-card-numbers) |
| Stark — pagar BR Code           | [sdk-node](https://github.com/starkbank/sdk-node#pay-a-br-code)                                             |

**Credenciais Stark sandbox:** solicitar à **Squad Billing** (integração ARC-1245). O BR Code em QA aponta para `brcode-h.sandbox.starkinfra.com`.

---

## Cartões de teste

Catálogo no repo: [`tests/data/adyenTestCards.ts`](../../tests/data/adyenTestCards.ts)

| Cenário           | Número                | Validade | CVV   |
| ----------------- | --------------------- | -------- | ----- |
| Aprovado (padrão) | `4111 1111 1111 1111` | `03/30`  | `737` |
| Elo BR            | `5066 9911 1111 1118` | `03/30`  | `737` |
| Hipercard BR      | `6062 8288 8866 6688` | `03/30`  | `737` |

---

## Comandos — PIX

```bash
# UI smoke (PAY-P1 a PAY-P4)
npx playwright test tests/spec/e2e/payment/checkout-pix.spec.ts --project=chromium --reporter=list

# 1) Captura BR Code pendente → docs/reports/pix-brcode-capture.json
npm run tool:pix-capture

# 2) Paga via Stark API (recomendado — ARC-1245)
npm run tool:pix-pay

# 2b) Instruções Adyen fallback (se cobrança passar pelo Adyen)
npm run tool:pix-confirm

# 3) Emissão híbrida (2º Finalizar após webhook)
npm run test:pix:emission

# Gravação demo (vídeo 1280×800, slowMo)
npm run test:pix:record
npm run test:pix:record:export   # grava + copia para docs/reports/videos/
```

### Fluxo completo recomendado (Stark)

Com credenciais no `.env`:

```env
STARK_PROJECT_ID=...
STARK_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----"
STARK_TAX_ID=12345678901
PIX_SANDBOX_EMISSION=1
PIX_SANDBOX_AUTO_PAY=1
PIX_SANDBOX_MANUAL_PAUSE=0
```

```bash
npm install starkbank --save-dev   # uma vez
npm run tool:pix-capture
npm run tool:pix-pay
npm run test:pix:emission
```

Jornada cartão aprovado: `npm run test:journey`

---

## Fluxo PIX no checkout QA (ARC-1245)

```
1. "Veja outras formas de pagamento com desconto" → Pix (-10%)
2. Confirmar e-mail (se necessário) → 1º Finalizar
3. Permanece em /checkout + "COPIAR CÓDIGO PIX" (invoice pendente)
4. [STARK SANDBOX] pagar BR Code → webhook confirma
5. Voltar ao checkout → 2º Finalizar → /issuance ou /sucesso
```

**Importante:** pagar no sandbox **sem** o 2º Finalizar **não emite apólice** ([INC-1439](https://cxdigital.atlassian.net/browse/INC-1439)).

---

## Simular pagamento PIX

### Opção A — Stark Infra (recomendado — provider QA)

1. `npm run tool:pix-capture` (ou fluxo manual até COPIAR CÓDIGO PIX)
2. `npm run tool:pix-pay` — usa `docs/reports/pix-brcode-capture.json` + `STARK_*`
3. Aguardar webhook (~segundos a minutos)
4. `npm run test:pix:emission` com `PIX_SANDBOX_MANUAL_PAUSE=0`

Manual: copiar BR Code e pagar via **BrcodePayment** no workspace Stark ([doc SDK](https://github.com/starkbank/sdk-node#pay-a-br-code)). Saldo sandbox: criar **Invoice** (paga automaticamente em até ~1h).

### Opção B — Adyen Customer Area (fallback)

Use apenas se a cobrança aparecer no Adyen (nem todo PIX Auto passa por lá):

1. [ca-test.adyen.com](https://ca-test.adyen.com) → **Transactions → Offers**
2. Localizar PIX pendente (protocolo em `pix-brcode-capture.json`)
3. **Promote this offer to a sale**
4. [Adyen PIX — Test and go live](https://docs.adyen.com/payment-methods/pix/web-component#test-and-go-live)

### Opção C — Fluxo híbrido com pause (PAY-P4b)

```bash
npm run test:pix:emission
```

- Browser **headed** + pause no Inspector após gerar BR Code
- Confirma pagamento (A ou B) → **Resume** → 2º Finalizar → valida redirect

Sem pause (já pagou):

```bash
cross-env PIX_SANDBOX_EMISSION=1 PIX_SANDBOX_MANUAL_PAUSE=0 npx playwright test tests/spec/e2e/payment/checkout-pix-emission.spec.ts --project=chromium --reporter=list
```

---

## ARC-1245 — o que o E2E cobre hoje

| Critério                    | Status | Como testar                                 |
| --------------------------- | ------ | ------------------------------------------- |
| Invoice pendente (não pago) | ✅     | `checkout-pix.spec.ts` PAY-P4               |
| Emissão após pagamento      | 🟡     | `checkout-pix-emission.spec.ts` + `STARK_*` |
| Pago sem 2º Finalizar       | 🟡     | Manual — validar que não há apólice         |
| Invoice expirado            | ⬜     | Backlog                                     |
| Documentos / Policy-Center  | ⬜     | API ou manual                               |
| Cross indisponível no PIX   | ⬜     | Backlog (ARC-1280)                          |

Detalhe completo: [`planner-pagamento.md`](../planners/planner-pagamento.md).

---

## Arquivos gerados

| Arquivo                                                 | Conteúdo                                   |
| ------------------------------------------------------- | ------------------------------------------ |
| `docs/reports/pix-brcode-capture.json`                  | BR Code, protocolo, URL checkout, provider |
| `docs/reports/videos/pix-checkout-emission-latest.webm` | Demo PAY-P4 / PAY-P4b                      |

Não versionar `pix-brcode-capture.json` (dados de sessão).

---

## Onde testar o quê

| Tipo                  | Onde                                                                     |
| --------------------- | ------------------------------------------------------------------------ |
| UI PIX (PAY-P1–P4)    | `tests/spec/e2e/payment/checkout-pix.spec.ts`                            |
| Emissão PIX (PAY-P4b) | `tests/spec/e2e/payment/checkout-pix-emission.spec.ts`                   |
| Gravação vídeo        | `tests/spec/e2e/payment/checkout-pix-record.spec.ts`                     |
| Captura BR Code       | `tests/spec/tools/pix-brcode-capture.spec.ts`                            |
| Helpers Stark         | `tests/helpers/starkPixPay.ts`, `pixPaymentFlow.ts`                      |
| Webhook / API         | `qa-api-tests-automation`                                                |
| Planner               | [`docs/planners/planner-pagamento.md`](../planners/planner-pagamento.md) |
