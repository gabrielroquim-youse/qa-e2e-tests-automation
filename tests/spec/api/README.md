# API — testes de contrato e regra de negócio

Testes **sem browser** (Playwright `request`) para serviços internos.

| Pasta                      | Domínio                                                | Tags              |
| -------------------------- | ------------------------------------------------------ | ----------------- |
| [`quotation/`](quotation/) | Cotação Auto — preço, planos, coberturas, assistências | `@api` `@pricing` |
| `ciliaClaimAuth.spec.ts`   | Autenticação sinistro WhatsApp                         | `@whatsapp_claim` |
| `testUtils.spec.ts`        | Massa de dados QA                                      | `@test_utils`     |

## Comandos

```bash
npm run test:api              # toda a pasta api/
npm run test:api:quotation    # só cotação / pricing
```

Guia de migração E2E → API: [`docs/guides/api-quotation-layer.md`](../../../docs/guides/api-quotation-layer.md).
