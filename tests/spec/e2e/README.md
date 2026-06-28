# E2E — Seguro Auto (experiência do usuário)

Organização por **intenção do teste**, não por tipo técnico do Playwright.  
Foco: **o cliente consegue ver, entender e usar o funil no navegador?**

## Pirâmide de testes

| Camada   | Repositório               | Pergunta                               | Onde                    |
| -------- | ------------------------- | -------------------------------------- | ----------------------- |
| **API**  | `qa-api-tests-automation` | O motor aplica a regra de negócio?     | `tests/spec/quotation/` |
| **E2E**  | **este repo**             | O cliente vê, entende e consegue usar? | `tests/spec/e2e/`       |
| **A11y** | **este repo**             | WCAG, teclado, mobile?                 | `tests/spec/a11y/`      |

> Preço, bônus, coberturas × prêmio e assistências × prêmio **não** rodam no browser.  
> Comandos API: `npm run test:pricing` e `npm run test:customization` no repo `qa-api-tests-automation`.

## Pastas

| Pasta                        | Intenção                                                        | Tags                     | Pipeline         |
| ---------------------------- | --------------------------------------------------------------- | ------------------------ | ---------------- |
| [`journeys/`](journeys/)     | Fluxos completos (Regular, personalizado)                       | `@journey` `@happy_path` | Smoke · Nightly  |
| [`ux/`](ux/)                 | **Usabilidade por tela** (CAP-02, checkout, CAP-17/33/35/38/39) | `@ux` `@smoke`           | PR (`test:ux`)   |
| [`blockers/`](blockers/)     | Bloqueios de negócio (blindado, CPF, leilão)                    | `@negative`              | Nightly          |
| [`regression/`](regression/) | UX restante (cards, catálogo, modais)                           | `@regression`            | Nightly          |
| [`payment/`](payment/)       | Adyen cartão · PIX                                              | `@payment` `@regression` | Manual / Nightly |

Detalhe dos specs UX: [`ux/README.md`](ux/README.md) · Pagamento: [`payment/README.md`](payment/README.md)

Specs com `.skip` em `regression/` documentam cenários migrados para API (`precosPlanos`, `validacaoValores`, `personalizacao`, etc.).

## Comandos

```bash
npm run test:smoke       # journeys + ux @smoke (~5–15 min, VPN)
npm run test:ux          # usabilidade por tela (~11 min; prefira --workers=1)
npm run test:ux:timing   # UX + atualiza dashboard docs/reports/e2e-timing-*
npm run test:journey     # jornadas completas
npm run test:regression  # regressão UX (coberturas, bônus modal…)
npm run test:payment     # pagamento Adyen + PIX (~15–25 min, VPN)
```

Precificação → **`qa-api-tests-automation`**: `npm run test:pricing` · `npm run test:customization`

Cada teste E2E é **independente** — navega o funil do zero (sem `mode: 'serial'`).

## Documentação relacionada

| Documento                                                                                         | Conteúdo                                |
| ------------------------------------------------------------------------------------------------- | --------------------------------------- |
| [`docs/planners/planner-validacao-campos.md`](../../../docs/planners/planner-validacao-campos.md) | Matriz CAP-02 — validação de formulário |
| [`docs/guides/fluxos-cotacao-auto.md`](../../../docs/guides/fluxos-cotacao-auto.md)               | Mapa de fluxos × specs                  |
| [`docs/guides/api-quotation-layer.md`](../../../docs/guides/api-quotation-layer.md)               | O que fica E2E vs API                   |
| [`docs/guides/boas-praticas.md`](../../../docs/guides/boas-praticas.md)                           | Padrões e checklist de contribuição     |
| [`docs/coverage/README.md`](../../../docs/coverage/README.md)                                     | % cobertura e gaps                      |
