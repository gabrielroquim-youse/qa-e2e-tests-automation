# Tools — captura de contrato HTTP

Specs **auxiliares** — não entram no pipeline de regressão. Servem para descobrir/atualizar o contrato **apiws** usado nos testes API (`qa-api-tests-automation`).

| Spec                                    | Saída                                             | Quando rodar                         |
| --------------------------------------- | ------------------------------------------------- | ------------------------------------ |
| `pricing-network-capture.spec.ts`       | `docs/reports/pricing-network-capture.json`       | Mudança em plan_selection / pricing  |
| `customization-network-capture.spec.ts` | `docs/reports/customization-network-capture.json` | Mudança em coberturas / assistências |
| `hire-network-capture.spec.ts`          | `docs/reports/hire-network-capture.json`          | Mudança em checkout / emissão        |
| `pix-brcode-capture.spec.ts`            | `docs/reports/pix-brcode-capture.json`            | Mudança em PIX / BR Code no checkout |

```bash
# VPN on
npx playwright test tests/spec/tools/pricing-network-capture.spec.ts --project=chromium --reporter=list
npx playwright test tests/spec/tools/customization-network-capture.spec.ts --project=chromium --reporter=list
npx playwright test tests/spec/tools/hire-network-capture.spec.ts --project=chromium --reporter=list
npm run tool:pix-capture
```

Ver também: [`docs/guides/api-quotation-layer.md`](../../../docs/guides/api-quotation-layer.md)
