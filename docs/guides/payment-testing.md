# Guia — Testes de pagamento (Adyen + PIX)

> Cartão no checkout Youse QA usa **Adyen Components** (iframes). PIX é **assíncrono** — confirmação via Stark sandbox ou Adyen Offers.

---

## Cartões de teste

Catálogo no repo: [`tests/data/adyenTestCards.ts`](../../tests/data/adyenTestCards.ts)

| Cenário           | Número                | Validade | CVV   |
| ----------------- | --------------------- | -------- | ----- |
| Aprovado (padrão) | `4111 1111 1111 1111` | `03/30`  | `737` |
| Elo BR            | `5066 9911 1111 1118` | `03/30`  | `737` |
| Hipercard BR      | `6062 8288 8866 6688` | `03/30`  | `737` |

Fonte: [Adyen test card numbers](https://docs.adyen.com/development-resources/test-cards-and-credentials/test-card-numbers)

---

## Comandos — PIX

```bash
# UI smoke (PAY-P1 a PAY-P4)
npx playwright test tests/spec/e2e/payment/checkout-pix.spec.ts --project=chromium --reporter=list

# 1) Captura BR Code pendente → docs/reports/pix-brcode-capture.json
npm run tool:pix-capture

# 2) Instruções de confirmação no sandbox (Adyen ou Stark)
npm run tool:pix-confirm

# 3) Emissão híbrida (pause para confirmar pagamento manualmente)
npm run test:pix:emission
```

### Opção D — Stark automatizado (`tool:pix-pay`)

Com credenciais sandbox no `.env`:

```env
STARK_PROJECT_ID=...
STARK_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----"
STARK_TAX_ID=12345678901
```

```bash
npm install starkbank --save-dev   # uma vez
npm run tool:pix-capture
npm run tool:pix-pay               # paga o BR Code via API
npm run test:pix:emission          # PIX_SANDBOX_MANUAL_PAUSE=0 se já pagou
```

Jornada cartão aprovado: `npm run test:journey`

---

## Fluxo PIX no checkout QA

```
1. "Veja outras formas de pagamento com desconto" → Pix (-10%)
2. Finalizar → permanece em /checkout + "COPIAR CÓDIGO PIX"
3. [SANDBOX] confirmar pagamento (ver abaixo)
4. Voltar ao checkout → Finalizar novamente → /issuance ou /sucesso
```

O BR Code gerado em QA costuma apontar para **`brcode-h.sandbox.starkinfra.com`** (Stark Infra).

---

## Simular pagamento PIX

### Opção A — Stark Infra (provider observado no QA)

1. `npm run tool:pix-capture` (ou fluxo manual até COPIAR CÓDIGO PIX)
2. Copiar BR Code de `docs/reports/pix-brcode-capture.json`
3. Pagar via **BrcodePayment** no workspace Stark sandbox (credenciais com time de pagamentos)
4. Doc: [Stark Bank — Pay a BR Code](https://github.com/starkbank/sdk-node#pay-a-br-code)
5. Saldo sandbox: criar **Invoice** (paga automaticamente em até ~1h)

### Opção B — Adyen Customer Area (se a cobrança passar pelo Adyen)

1. [ca-test.adyen.com](https://ca-test.adyen.com) → **Transactions → Offers**
2. Localizar PIX pendente (protocolo da cotação em `pix-brcode-capture.json`)
3. **Promote this offer to a sale**
4. Doc: [Adyen PIX — Test and go live](https://docs.adyen.com/payment-methods/pix/web-component#test-and-go-live)

### Opção C — Fluxo híbrido automatizado (PAY-P4b)

```bash
npm run test:pix:emission
```

- Abre o browser em modo **headed**
- Pausa no Inspector (`page.pause`) após gerar o BR Code
- Você confirma no sandbox (A ou B)
- Clica **Resume** no Playwright Inspector
- O teste faz o segundo **Finalizar** e valida redirect

Sem pause (já confirmou antes):

```bash
cross-env PIX_SANDBOX_EMISSION=1 PIX_SANDBOX_MANUAL_PAUSE=0 npx playwright test tests/spec/e2e/payment/checkout-pix-emission.spec.ts --project=chromium --reporter=list
```

---

## Arquivos gerados

| Arquivo                                | Conteúdo                                   |
| -------------------------------------- | ------------------------------------------ |
| `docs/reports/pix-brcode-capture.json` | BR Code, protocolo, URL checkout, provider |

Não versionar em git (contém dados de sessão de teste).

---

## Onde testar o quê

| Tipo                  | Onde                                                                     |
| --------------------- | ------------------------------------------------------------------------ |
| UI PIX (PAY-P1–P4)    | `tests/spec/e2e/payment/checkout-pix.spec.ts`                            |
| Emissão PIX (PAY-P4b) | `tests/spec/e2e/payment/checkout-pix-emission.spec.ts`                   |
| Captura BR Code       | `tests/spec/tools/pix-brcode-capture.spec.ts`                            |
| Webhook / API         | `qa-api-tests-automation`                                                |
| Planner               | [`docs/planners/planner-pagamento.md`](../planners/planner-pagamento.md) |
