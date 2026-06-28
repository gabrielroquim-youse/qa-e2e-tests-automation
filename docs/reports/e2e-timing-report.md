# Relatório de Tempo — Testes E2E Seguro Auto

> Execução **2026-06-24_14-41-57** · gerado em **2026-06-24 14:41:57 UTC** · fonte: `reports/ux-timing-2026-06-24.log` · [e2e-timing.json](e2e-timing.json)

## Resumo

| Métrica                |    Valor |
| ---------------------- | -------: |
| Testes                 |       30 |
| Passou                 |       30 |
| Falhou                 |        0 |
| Pulou                  |        0 |
| Tempo wall-clock       | 11.5 min |
| Soma dos testes        | 11.3 min |
| Workers                |        — |
| Overhead (wall − soma) |       2% |

## Tempo por spec (ordenado por duração total)

| Spec                            | Testes | Passou | Falhou | Pulou |   Total |   Média |     Máx |
| ------------------------------- | -----: | -----: | -----: | ----: | ------: | ------: | ------: |
| `ux\checkout.spec.ts`           |      5 |      5 |      0 |     0 | 3.5 min |  41.4 s |  43.2 s |
| `ux\bonuses-class.spec.ts`      |      3 |      3 |      0 |     0 | 1.8 min |  35.6 s | 1.3 min |
| `ux\plan-preformatted.spec.ts`  |      3 |      3 |      0 |     0 | 1.5 min |  29.3 s |  40.6 s |
| `ux\plan-selection.spec.ts`     |      1 |      1 |      0 |     0 | 1.4 min | 1.4 min | 1.4 min |
| `ux\risk-acceptance.spec.ts`    |      1 |      1 |      0 |     0 |  40.6 s |  40.6 s |  40.6 s |
| `ux\lead-info.spec.ts`          |      6 |      6 |      0 |     0 |  39.6 s |   6.6 s |   8.3 s |
| `ux\vehicle-additional.spec.ts` |      4 |      4 |      0 |     0 |  35.4 s |   8.8 s |   9.3 s |
| `ux\person-data.spec.ts`        |      3 |      3 |      0 |     0 |  34.3 s |  11.4 s |  12.8 s |
| `ux\vehicle-details.spec.ts`    |      3 |      3 |      0 |     0 |  23.3 s |   7.8 s |   9.8 s |
| `ux\data-enrichment.spec.ts`    |      1 |      1 |      0 |     0 |  15.9 s |  15.9 s |  15.9 s |

## Top 15 testes mais lentos

|   # | Spec                           | Teste                                                                | Status |   Tempo |
| --: | ------------------------------ | -------------------------------------------------------------------- | :----: | ------: |
|   1 | `ux\plan-selection.spec.ts`    | Deve exibir título, três planos com preço e opção de personalizar @… |   ✅   | 1.4 min |
|   2 | `ux\bonuses-class.spec.ts`     | Não deve permitir continuar sem escolher histórico de seguro @ux @q… |   ✅   | 1.3 min |
|   3 | `ux\checkout.spec.ts`          | Cross-sell residencial e vida devem iniciar opcionais (Adicionar) @… |   ✅   |  43.2 s |
|   4 | `ux\checkout.spec.ts`          | Deve exibir resumo, confirmação de e-mail e upsells opcionais @ux @… |   ✅   |  42.8 s |
|   5 | `ux\checkout.spec.ts`          | Deve adicionar Seguro Residencial ao clicar em Adicionar @ux @quota… |   ✅   |  42.8 s |
|   6 | `ux\checkout.spec.ts`          | Não deve sair do checkout ao finalizar sem cartão preenchido @ux @q… |   ✅   |  40.8 s |
|   7 | `ux\plan-preformatted.spec.ts` | Checkout Essencial deve resumir assistências sem toggles de edição … |   ✅   |  40.6 s |
|   8 | `ux\risk-acceptance.spec.ts`   | Deve passar pela section risk_acceptance antes do checkout (sem gar… |   ✅   |  40.6 s |
|   9 | `ux\checkout.spec.ts`          | Deve listar assistências do plano no accordion expandido @ux @quota… |   ✅   |  37.5 s |
|  10 | `ux\plan-preformatted.spec.ts` | Fluxo personalizado deve exibir toggles na tela de assistências @ux… |   ✅   |  24.9 s |
|  11 | `ux\plan-preformatted.spec.ts` | Essencial deve exibir pacote fixo de assistências no card @ux @quot… |   ✅   |  22.5 s |
|  12 | `ux\data-enrichment.spec.ts`   | Deve passar pela section data_enrichment antes do histórico de segu… |   ✅   |  15.9 s |
|  13 | `ux\bonuses-class.spec.ts`     | Não deve avançar para planos ao escolher Sim sem classe de bônus @u… |   ✅   |  15.6 s |
|  14 | `ux\bonuses-class.spec.ts`     | Deve exibir fluxo WhatsApp ao informar que não teve seguro @ux @quo… |   ✅   |  13.2 s |
|  15 | `ux\person-data.spec.ts`       | Deve avançar para histórico de seguro após dados válidos @ux @quota… |   ✅   |  12.8 s |

## Detalhamento completo

| Spec                            | Linha | Suite                                   | Teste                                                                                                           | Status |   Tempo | Tags                                                     |
| ------------------------------- | ----: | --------------------------------------- | --------------------------------------------------------------------------------------------------------------- | :----: | ------: | -------------------------------------------------------- |
| `ux\bonuses-class.spec.ts`      |    12 | UX — Histórico de seguro                | Não deve permitir continuar sem escolher histórico de seguro @ux @quotation_auto @b2c @negative @smoke          |   ✅   | 1.3 min | @ux @quotation_auto @b2c @negative @smoke                |
| `ux\bonuses-class.spec.ts`      |    21 | UX — Histórico de seguro                | Deve exibir fluxo WhatsApp ao informar que não teve seguro @ux @quotation_auto @b2c @negative @regression       |   ✅   |  13.2 s | @ux @quotation_auto @b2c @negative @regression           |
| `ux\bonuses-class.spec.ts`      |    31 | UX — Histórico de seguro                | Não deve avançar para planos ao escolher Sim sem classe de bônus @ux @quotation_auto @b2c @negative @regression |   ✅   |  15.6 s | @ux @quotation_auto @b2c @negative @regression           |
| `ux\checkout.spec.ts`           |     9 | UX — Checkout                           | Deve exibir resumo, confirmação de e-mail e upsells opcionais @ux @quotation_auto @smoke                        |   ✅   |  42.8 s | @ux @quotation_auto @smoke                               |
| `ux\checkout.spec.ts`           |    26 | UX — Checkout                           | Deve listar assistências do plano no accordion expandido @ux @quotation_auto @regression                        |   ✅   |  37.5 s | @ux @quotation_auto @regression                          |
| `ux\checkout.spec.ts`           |    39 | UX — Checkout                           | Cross-sell residencial e vida devem iniciar opcionais (Adicionar) @ux @quotation_auto @regression               |   ✅   |  43.2 s | @ux @quotation_auto @regression                          |
| `ux\checkout.spec.ts`           |    53 | UX — Checkout                           | Deve adicionar Seguro Residencial ao clicar em Adicionar @ux @quotation_auto @regression                        |   ✅   |  42.8 s | @ux @quotation_auto @regression                          |
| `ux\checkout.spec.ts`           |    68 | UX — Checkout                           | Não deve sair do checkout ao finalizar sem cartão preenchido @ux @quotation_auto @regression @negative          |   ✅   |  40.8 s | @ux @quotation_auto @regression @negative                |
| `ux\data-enrichment.spec.ts`    |    10 | UX — Enriquecimento de dados            | Deve passar pela section data_enrichment antes do histórico de seguro @ux @quotation_auto @regression           |   ✅   |  15.9 s | @ux @quotation_auto @regression                          |
| `ux\lead-info.spec.ts`          |    12 | UX — Lead info                          | Deve exibir campos de contato e botão Continuar @ux @quotation_auto @b2c @smoke                                 |   ✅   |   6.2 s | @ux @quotation_auto @b2c @smoke                          |
| `ux\lead-info.spec.ts`          |    21 | UX — Lead info                          | Não deve permitir continuar com formulário vazio @ux @quotation_auto @b2c @smoke @negative                      |   ✅   |   6.3 s | @ux @quotation_auto @b2c @smoke @negative                |
| `ux\lead-info.spec.ts`          |    31 | UX — Lead info                          | Deve avançar para dados do veículo após preenchimento válido @ux @quotation_auto @b2c @smoke                    |   ✅   |   8.3 s | @ux @quotation_auto @b2c @smoke                          |
| `ux\lead-info.spec.ts`          |    39 | UX — Lead info                          | Não deve avançar com e-mail inválido @ux @quotation_auto @b2c @regression @negative                             |   ✅   |   7.0 s | @ux @quotation_auto @b2c @regression @negative           |
| `ux\lead-info.spec.ts`          |    51 | UX — Lead info                          | Não deve avançar com telefone incompleto @ux @quotation_auto @b2c @regression @negative                         |   ✅   |   6.1 s | @ux @quotation_auto @b2c @regression @negative           |
| `ux\lead-info.spec.ts`          |    63 | UX — Lead info                          | Não deve avançar com nome inválido (apenas números) @ux @quotation_auto @b2c @regression @negative              |   ✅   |   5.7 s | @ux @quotation_auto @b2c @regression @negative           |
| `ux\person-data.spec.ts`        |    13 | UX — Dados do segurado                  | Não deve permitir continuar sem CPF e estado civil @ux @quotation_auto @b2c @negative @smoke                    |   ✅   |   9.8 s | @ux @quotation_auto @b2c @negative @smoke                |
| `ux\person-data.spec.ts`        |    23 | UX — Dados do segurado                  | Deve avançar para histórico de seguro após dados válidos @ux @quotation_auto @b2c @negative @smoke              |   ✅   |  12.8 s | @ux @quotation_auto @b2c @negative @smoke                |
| `ux\person-data.spec.ts`        |    33 | UX — Dados do segurado                  | Não deve avançar com CPF em formato inválido @ux @quotation_auto @b2c @negative @regression                     |   ✅   |  11.7 s | @ux @quotation_auto @b2c @negative @regression           |
| `ux\plan-preformatted.spec.ts`  |    13 | UX — Plano pré-formatado (assistências) | Essencial deve exibir pacote fixo de assistências no card @ux @quotation_auto @regression @smoke                |   ✅   |  22.5 s | @ux @quotation_auto @regression @smoke                   |
| `ux\plan-preformatted.spec.ts`  |    23 | UX — Plano pré-formatado (assistências) | Checkout Essencial deve resumir assistências sem toggles de edição @ux @quotation_auto @regression              |   ✅   |  40.6 s | @ux @quotation_auto @regression                          |
| `ux\plan-preformatted.spec.ts`  |    34 | UX — Plano pré-formatado (assistências) | Fluxo personalizado deve exibir toggles na tela de assistências @ux @quotation_auto @regression                 |   ✅   |  24.9 s | @ux @quotation_auto @regression                          |
| `ux\plan-selection.spec.ts`     |    13 | UX — Seleção de planos                  | Deve exibir título, três planos com preço e opção de personalizar @ux @quotation_auto @smoke                    |   ✅   | 1.4 min | @ux @quotation_auto @smoke                               |
| `ux\risk-acceptance.spec.ts`    |    10 | UX — Aceite de risco                    | Deve passar pela section risk_acceptance antes do checkout (sem garagem) @ux @quotation_auto @regression        |   ✅   |  40.6 s | @ux @quotation_auto @regression                          |
| `ux\vehicle-additional.spec.ts` |    13 | UX — Endereço e uso do veículo          | Não deve permitir continuar sem CEP @ux @quotation_auto @b2c @negative @smoke                                   |   ✅   |   8.4 s | @ux @quotation_auto @b2c @negative @smoke                |
| `ux\vehicle-additional.spec.ts` |    21 | UX — Endereço e uso do veículo          | Não deve permitir continuar sem selecionar uso do veículo @ux @quotation_auto @b2c @negative @regression        |   ✅   |   9.3 s | @ux @quotation_auto @b2c @negative @regression           |
| `ux\vehicle-additional.spec.ts` |    31 | UX — Endereço e uso do veículo          | Não deve avançar com CEP inválido @ux @quotation_auto @b2c @negative @regression @negative                      |   ✅   |   9.3 s | @ux @quotation_auto @b2c @negative @regression @negative |
| `ux\vehicle-additional.spec.ts` |    42 | UX — Endereço e uso do veículo          | Deve avançar para dados do segurado após preenchimento completo @ux @quotation_auto @b2c @negative @smoke       |   ✅   |   8.4 s | @ux @quotation_auto @b2c @negative @smoke                |
| `ux\vehicle-details.spec.ts`    |    13 | UX — Dados do veículo                   | Não deve avançar sem informar a placa @ux @quotation_auto @b2c @negative @smoke                                 |   ✅   |   5.7 s | @ux @quotation_auto @b2c @negative @smoke                |
| `ux\vehicle-details.spec.ts`    |    19 | UX — Dados do veículo                   | Deve avançar para endereço após placa válida @ux @quotation_auto @b2c @negative @smoke                          |   ✅   |   7.8 s | @ux @quotation_auto @b2c @negative @smoke                |
| `ux\vehicle-details.spec.ts`    |    30 | UX — Dados do veículo                   | Não deve avançar com placa em formato inválido @ux @quotation_auto @b2c @negative @regression                   |   ✅   |   9.8 s | @ux @quotation_auto @b2c @negative @regression           |

## Histórico de execuções

Histórico completo: [e2e-timing-log.md](e2e-timing-log.md)

| Execução                                                             | Passou | Falhou | Pulou | Wall-clock | Δ vs anterior |
| -------------------------------------------------------------------- | -----: | -----: | ----: | ---------: | ------------: |
| [2026-06-24 14:41:57 UTC](history/2026-06-24_14-41-57/e2e-report.md) |     30 |      0 |     0 |   11.5 min |             — |

---

_Gerado por `npm run e2e:timing:generate` — não editar manualmente._
