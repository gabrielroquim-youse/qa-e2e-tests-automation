# E2E — Seguro Auto

Organização por **intenção**, não por tipo técnico do Playwright.

## Pirâmide de testes

| Camada   | Repositório               | Pergunta                               | Onde                    |
| -------- | ------------------------- | -------------------------------------- | ----------------------- |
| **API**  | `qa-api-tests-automation` | O motor aplica a regra de negócio?     | `tests/spec/quotation/` |
| **E2E**  | **este repo**             | O cliente vê, entende e consegue usar? | `tests/spec/e2e/`       |
| **A11y** | **este repo**             | WCAG, teclado, mobile?                 | `tests/spec/a11y/`      |

> Preço, bônus, coberturas × prêmio e assistências × prêmio **não** rodam no browser.  
> Comandos API: `npm run test:pricing` e `npm run test:customization` no repo `qa-api-tests-automation`.

| Pasta                        | Intenção                                      | Tags                     | Pipeline        |
| ---------------------------- | --------------------------------------------- | ------------------------ | --------------- |
| [`journeys/`](journeys/)     | Fluxos completos (Regular, personalizado)     | `@journey` `@happy_path` | Smoke · Nightly |
| [`ux/`](ux/)                 | Usabilidade por tela                          | `@ux` `@smoke`           | PR              |
| [`blockers/`](blockers/)     | Bloqueios e negativos                         | `@negative`              | Nightly         |
| [`regression/`](regression/) | UX restante (visibilidade, navegação, modais) | `@regression`            | Nightly         |

Specs com `.skip` em `regression/` documentam cenários migrados para API (`precosPlanos`, `validacaoValores`, etc.).

## Comandos

```bash
npm run test:smoke       # journeys + ux @smoke (~5–10 min, VPN)
npm run test:ux          # usabilidade
npm run test:journey     # jornadas completas
npm run test:regression  # regressão UX
```

Precificação → **`qa-api-tests-automation`**: `npm run test:pricing` · `npm run test:customization`

Cada teste E2E é **independente** — navega o funil do zero (sem `mode: 'serial'`).

Guia: [`docs/guides/api-quotation-layer.md`](../../../docs/guides/api-quotation-layer.md)
