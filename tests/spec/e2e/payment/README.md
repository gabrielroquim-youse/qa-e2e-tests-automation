# E2E — Pagamento (Adyen + PIX)

Testes de **métodos de pagamento** no checkout QA. Cartão completo continua nas jornadas (`journeys/`).

| Spec                                          | Cenário                        | Planner        | Status                         |
| --------------------------------------------- | ------------------------------ | -------------- | ------------------------------ |
| `checkout-cards.spec.ts`                      | Elo + Hipercard (PAY-C2/C3)    | PAY-C2, PAY-C3 | ✅                             |
| `checkout-pix.spec.ts`                        | PIX UI PAY-P1–P4               | PAY-P1–P4      | ✅                             |
| `checkout-pix-emission.spec.ts`               | Emissão após sandbox (híbrido) | PAY-P4b        | 🟡 `npm run test:pix:emission` |
| `tests/spec/tools/pix-brcode-capture.spec.ts` | Captura BR Code                | —              | `npm run tool:pix-capture`     |

## Massa PIX (sem restrição)

Funil via `navigateToCheckoutForPix()` (`tests/helpers/pixQuotation.ts`):

- **Placa:** `plate.noInspection` (`YOU-0020`)
- **CPF:** `cpf.accepted` (`123.456.761-08`)
- **E-mail:** único por execução (`qa.pix+{timestamp}@youse.com.br`)

Cada nova cotação chama `resetSession()` em `LeadInfoPage.open` (cookies + storage + cache).

## Comandos

```bash
npm run test:payment          # PIX + cartões (~15–25 min, VPN, workers=1)
npx playwright test tests/spec/e2e/payment/checkout-pix.spec.ts --project=chromium --reporter=list

# Fluxo PIX sandbox completo
npm run tool:pix-capture      # 1) gera BR Code
npm run tool:pix-confirm      # 2) instruções manuais
npm run tool:pix-pay          # 2b) paga via Stark (STARK_* no .env)
npm run test:pix:emission     # 3) emissão híbrida (headed + pause)
npm run test:pix:record       # gravação PIX ponta a ponta (vídeo + Stark auto-pay)
npm run test:pix:record:export # grava + exporta para docs/reports/videos/
```

## Documentação

- [`docs/planners/planner-pagamento.md`](../../../../docs/planners/planner-pagamento.md)
- [`docs/guides/payment-testing.md`](../../../../docs/guides/payment-testing.md)
- Massa cartão: [`tests/data/adyenTestCards.ts`](../../../data/adyenTestCards.ts)
