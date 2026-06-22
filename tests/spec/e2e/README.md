# E2E — Seguro Auto

Organização por **intenção**, não por tipo técnico do Playwright.

## Pirâmide de testes (padrão de mercado)

| Camada              | Repo                      | Pergunta                                   | Exemplos                              |
| ------------------- | ------------------------- | ------------------------------------------ | ------------------------------------- |
| **API / contrato**  | `qa-api-tests-automation` | O motor aplica a regra de negócio?         | preço, bônus, garagem, planos         |
| **E2E (este repo)** | `qa-e2e-tests-automation` | O cliente **vê, entende e consegue** usar? | labels, navegação, jornada, bloqueios |
| **A11y**            | `tests/spec/a11y`         | WCAG, teclado, mobile                      | funnel, keyboard                      |

> **Regra:** precificação e regra de produto **não** rodam no browser. Migram para `qa-api-tests-automation` (`npm run test:pricing`).  
> E2E valida **usabilidade e integração visual** — não duplica assert de prêmio.

| Pasta                        | Intenção                                        | Tags típicas             | Pipeline                                 |
| ---------------------------- | ----------------------------------------------- | ------------------------ | ---------------------------------------- |
| [`journeys/`](journeys/)     | Fluxos completos (F1 Regular, F2 personalizado) | `@journey` `@happy_path` | Smoke (até checkout) · Nightly (emissão) |
| [`ux/`](ux/)                 | Usabilidade do cliente por tela                 | `@ux` `@smoke`           | PR (`npm run test:smoke`)                |
| [`blockers/`](blockers/)     | Bloqueios e cenários negativos                  | `@negative`              | Nightly                                  |
| [`regression/`](regression/) | Regras que ainda dependem da UI (em migração)   | `@regression`            | Nightly — **sem `@price`** (ver API)     |

## Comandos

```bash
npm run test:smoke       # journeys + ux com @smoke (~5–10 min, VPN)
npm run test:ux          # só usabilidade
npm run test:journey     # jornadas completas
npm run test:regression  # regressão UI (assistências, coberturas na tela)
```

Precificação e variáveis de risco → **`qa-api-tests-automation`**: `npm run test:pricing`

Cada teste é **independente** — navega o funil do zero (sem `mode: 'serial'`).
