# API — Cotação Auto (pricing)

**Repo canônico:** `qa-api-tests-automation` → `tests/spec/quotation/`

Todos os cenários de `precosPlanos.spec.ts` foram migrados para API (BFF apiws).

```bash
cd qa-api-tests-automation
npm run test:pricing
```

| Spec API                   | Cenário                         |
| -------------------------- | ------------------------------- |
| `planos-ordinal.spec.ts`   | Essencial < Regular < Auto 1504 |
| `precos-variaveis.spec.ts` | Garagem noturna                 |
| `bonus-class.spec.ts`      | Classe de bônus                 |
| `uso-veiculo.spec.ts`      | Uso do veículo                  |
| `estado-civil.spec.ts`     | Estado civil                    |
| `zero-km.spec.ts`          | Zero km vs usado                |
| `motor-sanidade.spec.ts`   | Guard-rails + idempotência      |

**Manter no E2E:** UX (`ux/`), `validateBonusClass.spec.ts`, coberturas visuais, assistências na UI.

@see docs/guides/api-quotation-layer.md
