# UX — Usabilidade por tela (E2E frontend)

Testes focados na **experiência do usuário**: o cliente vê, entende e consegue usar o funil?  
Não validam regras de preço (isso é **`qa-api-tests-automation`**).

**Tags:** `@ux` · `@smoke` (PR) · `@regression` · `@negative`  
**Planner:** [`docs/planners/planner-validacao-campos.md`](../../../../docs/planners/planner-validacao-campos.md) (CAP-02)

## Specs por etapa do funil

| Arquivo                                                    | Etapa (section)                 | Cenários                                                                     |
| ---------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------- |
| [`lead-info.spec.ts`](lead-info.spec.ts)                   | `lead_info`                     | Campos visíveis · vazio · e-mail · telefone · **nome inválido** · happy path |
| [`vehicle-details.spec.ts`](vehicle-details.spec.ts)       | `vehicle_details`               | Placa vazia · placa inválida · placa válida                                  |
| [`vehicle-additional.spec.ts`](vehicle-additional.spec.ts) | `vehicle_additional`            | CEP vazio · uso não selecionado · **CEP inválido** · endereço completo       |
| [`person-data.spec.ts`](person-data.spec.ts)               | `person_data`                   | CPF/estado civil vazios · CPF formato inválido · dados válidos               |
| [`bonuses-class.spec.ts`](bonuses-class.spec.ts)           | `bonuses_class`                 | Histórico vazio · WhatsApp (Não) · Sim sem classe                            |
| [`plan-selection.spec.ts`](plan-selection.spec.ts)         | `plan_selection`                | 3 planos + preço + personalizar                                              |
| [`checkout.spec.ts`](checkout.spec.ts)                     | `checkout`                      | Resumo · upsells · cross-sell · accordion · **finalizar sem cartão**         |
| [`plan-preformatted.spec.ts`](plan-preformatted.spec.ts)   | `plan_selection` / assistências | CAP-33 pacote Essencial vs toggles personalizado                             |
| [`data-enrichment.spec.ts`](data-enrichment.spec.ts)       | `data_enrichment`               | CAP-17 rota no funil após CPF                                                |
| [`risk-acceptance.spec.ts`](risk-acceptance.spec.ts)       | `risk_acceptance`               | CAP-35 rota sem garagem → checkout                                           |

**Total:** 30 testes · `npm run test:ux` · dashboard: [`docs/reports/e2e-timing-report.md`](../../../../docs/reports/e2e-timing-report.md)

## Padrão de assert (validação)

| Comportamento QA      | Assert                                    |
| --------------------- | ----------------------------------------- |
| Botão desabilitado    | `expectContinueDisabled(btnContinue)`     |
| Campo inválido        | `aria-invalid="true"`                     |
| Mensagem inline       | `expectValidationMessage(page, /regex/i)` |
| Placa vazia (etapa 2) | Click em Continuar **não** navega         |
| Checkout sem cartão   | `expectStayOnUrl(page, /\/checkout/)`     |

Helpers: [`tests/helpers/formValidation.ts`](../../../helpers/formValidation.ts)  
Navegação parcial: [`tests/helpers/funnel.ts`](../../../helpers/funnel.ts)

## Comandos

```bash
npm run test:ux                    # toda a pasta ux
npm run test:smoke                 # journeys + ux @smoke

# CAP-02 — validação de formulário
npx playwright test tests/spec/e2e/ux/lead-info.spec.ts \
  tests/spec/e2e/ux/vehicle-details.spec.ts \
  tests/spec/e2e/ux/vehicle-additional.spec.ts \
  tests/spec/e2e/ux/person-data.spec.ts \
  tests/spec/e2e/ux/bonuses-class.spec.ts \
  --project=chromium --reporter=list
```

**Pré-requisito:** VPN Youse + `BASE_URL` apontando para QA.

Recomendado **`--workers=1`** em execução local paralela pesada (menos flake na etapa lead).
