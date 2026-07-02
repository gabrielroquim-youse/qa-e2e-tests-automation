# API — neste repositório

Testes HTTP **sem browser** que **permanecem aqui** — domínios fora da cotação Auto (sinistro, massa QA).

> **Experiência do usuário (formulário, jornada, checkout, PIX UI)** → `tests/spec/e2e/` neste repo (`ux/`, `payment/`).  
> **Regras de preço, personalização e webhooks de pagamento** → `qa-api-tests-automation`.

> **Nota:** os specs de sinistro WhatsApp (`ciliaClaimAuth`) e massa QA (`testUtils`) foram migrados para `qa-api-tests-automation` e removidos deste repo. Use os comandos abaixo para executá-los.

## Cotação Auto (pricing / personalização)

**Não adicionar specs novos aqui.** Repo canônico:

**`qa-api-tests-automation`** → `tests/spec/quotation/`

```bash
cd qa-api-tests-automation
npm run test:pricing          # @pricing — planos, bônus, garagem…
npm run test:customization    # @customization — coberturas, assistências, RPS
npm run test:quotation        # tudo @quotation_auto
```

A pasta [`quotation/`](quotation/) só documenta o redirecionamento (stubs).

Guia completo: [`docs/guides/api-quotation-layer.md`](../../../docs/guides/api-quotation-layer.md)

## Pagamento (cartão / PIX)

| Camada            | Repo                      | O quê                                                               |
| ----------------- | ------------------------- | ------------------------------------------------------------------- |
| **E2E UI**        | **este repo**             | Checkout Adyen, PIX, BR Code — [`../e2e/payment/`](../e2e/payment/) |
| **API / webhook** | `qa-api-tests-automation` | Confirmação PIX, capture, contrato HTTP                             |

Guia operacional PIX: [`docs/guides/payment-testing.md`](../../../docs/guides/payment-testing.md)

## Comandos (API local)

```bash
npm run test:api    # cilia + test-utils (+ stubs quotation)
```
