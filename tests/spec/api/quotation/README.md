# API — Cotação Auto (pricing)

Regras de negócio que **hoje** rodam no browser em `tests/spec/e2e/regression/` e devem migrar para cá.

## Matriz de migração

| Spec E2E (origem)             | Cenário                                 | Spec API (destino)          | Status      |
| ----------------------------- | --------------------------------------- | --------------------------- | ----------- |
| `precosPlanos.spec.ts`        | Ordinal Essencial < Regular < Auto 1504 | `planos-ordinal.spec.ts`    | 🟡 scaffold |
| `precosPlanos.spec.ts`        | Garagem noturna × preço                 | `precos-variaveis.spec.ts`  | ⬜ backlog  |
| `precosPlanos.spec.ts`        | Bônus classe × desconto                 | `bonus-class.spec.ts`       | ⬜ backlog  |
| `assistencias.spec.ts`        | Combo / dependências / prêmio           | `assistencias.spec.ts`      | ⬜ backlog  |
| `personalizacao.spec.ts`      | Toggle cobertura × prêmio               | `coberturas.spec.ts`        | ⬜ backlog  |
| `validacaoValores.spec.ts`    | Delta simétrico                         | `validacao-valores.spec.ts` | ⬜ backlog  |
| `assistenciaRpsPromo.spec.ts` | Promo RPS                               | `rps-promo.spec.ts`         | ⬜ backlog  |
| `validateBonusClass.spec.ts`  | Classe bônus                            | `bonus-class.spec.ts`       | ⬜ backlog  |

**Manter no E2E** (UX / integração): visibilidade de cards, labels, navegação, bloqueios (`blockers/`), jornadas (`journeys/`), smoke por tela (`ux/`).

## Pré-requisito

Definir `OPIN_SERVICE_URL` (ou `QUOTATION_API_URL`) no `.env` — ver [`.env.example`](../../../../.env.example).
