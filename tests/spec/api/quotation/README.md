# Cotação Auto — specs movidos para o repo API

**Repo canônico:** [`qa-api-tests-automation`](https://github.com/gabrielroquim-youse/qa-api-tests-automation) → `tests/spec/quotation/`

## Por quê?

Regra de negócio e precificação rodam via **HTTP (apiws)** — mais rápido, estável e alinhado ao padrão de mercado. Este repo E2E foca **usabilidade, jornada e a11y**.

## Comandos (no repo API, VPN on)

```bash
cd qa-api-tests-automation
npm run test:pricing          # plan_selection: ordinal, bônus, garagem…
npm run test:customization    # coberturas, assistências, delta simétrico, RPS
```

## Specs

| Área           | Specs API                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| Pricing        | `planos-ordinal`, `precos-variaveis`, `bonus-class`, `uso-veiculo`, `estado-civil`, `zero-km`, `motor-sanidade` |
| Personalização | `coberturas`, `assistencias`, `validacao-valores`, `rps-promo`                                                  |

Matriz completa: README em `qa-api-tests-automation/tests/spec/quotation/README.md`

## O que permanece no E2E (experiência do usuário)

- `tests/spec/e2e/ux/` — **20 testes** por tela (CAP-02 validação de formulário, checkout, planos)
- `tests/spec/e2e/journeys/` — fluxos completos
- `tests/spec/e2e/regression/` — UX (visibilidade, navegação, modais)
- `tests/spec/a11y/` — WCAG, teclado, mobile

Detalhe UX: [`tests/spec/e2e/ux/README.md`](../../e2e/ux/README.md)

@see [`docs/guides/api-quotation-layer.md`](../../../../docs/guides/api-quotation-layer.md)
