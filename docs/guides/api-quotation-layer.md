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
├── services/quotation/
│   └── QuotationPricingService.ts    # cliente HTTP
├── helpers/pricingAssertions.ts      # ordinais e sanidade (compartilhado)
└── spec/api/quotation/
    ├── README.md                     # matriz de migração
    └── planos-ordinal.spec.ts        # 1º cenário migrado (scaffold)
```

## Configuração

```bash
# .env
OPIN_SERVICE_URL=https://qa-opin-service.youse.io   # ajustar URL real
```

## Comandos

```bash
npm run test:api:quotation    # só pricing
npm run test:api              # api/ inteira (claims + test-utils + quotation)
npm run test:smoke            # E2E UX — PR
```

## Fluxo de migração (incremental)

1. Documentar contrato API (path + payload) com time de backend.
2. Implementar método em `QuotationPricingService`.
3. Spec API verde.
4. Remover ou enxugar teste equivalente em `e2e/regression/`.
5. Atualizar matriz em `tests/spec/api/quotation/README.md`.

## Branch

Trabalho em `feat/api-quotation-layer` — merge quando pelo menos um cenário API estiver verde em QA.
