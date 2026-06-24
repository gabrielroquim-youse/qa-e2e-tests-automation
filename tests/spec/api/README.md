# API — neste repositório

Testes HTTP **sem browser** que **permanecem aqui** — domínios fora da cotação Auto (sinistro, massa QA).

> **Experiência do usuário (formulário, jornada, checkout)** → `tests/spec/e2e/ux/` neste repo.  
> **Regras de preço e personalização** → `qa-api-tests-automation`.

| Arquivo                  | Domínio                        | Tags              |
| ------------------------ | ------------------------------ | ----------------- |
| `ciliaClaimAuth.spec.ts` | Autenticação sinistro WhatsApp | `@whatsapp_claim` |
| `testUtils.spec.ts`      | Massa de dados QA (test-utils) | `@test_utils`     |

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

## Comandos (API local)

```bash
npm run test:api    # cilia + test-utils (+ stubs quotation)
```
