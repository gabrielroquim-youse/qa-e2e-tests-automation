# Relatório de Sincronização de Cobertura

> Gerado em **2026-06-18** · [`metrics.json`](metrics.json) · [`README.md`](README.md)

## Resumo executivo

| Métrica                             |   Valor |
| ----------------------------------- | ------: |
| **Cobertura funcional (ponderada)** | **79%** |
| Cobertura funcional estrita         |     74% |
| Cobertura estrutural (POMs)         |     77% |
| Sections no GitHub                  |      12 |
| Testes E2E Auto                     |      49 |
| Capacidades testáveis               |      42 |
| Falta automatizar (⬜)              |       5 |
| Bloqueado (🔒)                      |       2 |

## 1. Telas do front (GitHub) × automação

| Section                      | Micro-frontend                    | Page Object                     | Estrutura   | Caps funcionais |
| ---------------------------- | --------------------------------- | ------------------------------- | ----------- | --------------- |
| `lead_info`                  | sales-lead-requirements           | LeadInfoPage.ts                 | ✅          | 1/2 caps ✅     |
| `vehicle_details`            | sales-vehicle-details             | VehicleDetailsPage.ts           | ✅          | 3/4 caps ✅     |
| `vehicle_additional_details` | sales-vehicle-additional-details  | VehicleAdditionalDetailsPage.ts | ✅          | 3/4 caps ✅     |
| `person_data`                | sales-person-data                 | PersonDataPage.ts               | ✅          | 3/4 caps ✅     |
| `bonuses_class`              | sales-bonus-class                 | BonusesClassPage.ts             | ✅          | 2/2 caps ✅     |
| `data_enrichment`            | sales-data-enrichment             | —                               | 🟡 opcional | 0/1 caps ✅     |
| `plan_selection`             | sales-plan-selection              | PlanSelectionPage.ts            | ✅          | 4/4 caps ✅     |
| `coverages_selection`        | sales-personalization-coverages   | CoveragesSelectionPage.ts       | ✅          | 5/6 caps ✅     |
| `assistances_selection`      | sales-personalization-assistances | AssistancesSelectionPage.ts     | ✅          | 5/7 caps ✅     |
| `risk_acceptance`            | sales-risk-acceptance             | —                               | 🟡 opcional | 0/1 caps ✅     |
| `checkout`                   | sales-checkout                    | CheckoutPage.ts                 | ✅          | 2/4 caps ✅     |
| `issuance`                   | sales-issuance                    | IssuancePage.ts                 | ✅          | 1/1 caps ✅     |

## 2. Inventário completo — o que o front permite testar

| ID     | Funcionalidade                                | Section                      | Pri | Status | Spec(s)                                          |
| ------ | --------------------------------------------- | ---------------------------- | --- | ------ | ------------------------------------------------ |
| CAP-01 | Preencher nome, e-mail e telefone             | `lead_info`                  | P0  | ✅     | cotacaoAuto.spec.ts                              |
| CAP-02 | Validação de campos obrigatórios              | `lead_info`                  | P2  | ⬜     | —                                                |
| CAP-03 | Placa válida — avançar no funil               | `vehicle_details`            | P0  | ✅     | cotacaoAuto.spec.ts                              |
| CAP-04 | Toggle zero km                                | `vehicle_details`            | P2  | 🟡     | precosPlanos.spec.ts                             |
| CAP-05 | Bloqueio veículo blindado                     | `vehicle_details`            | P0  | ✅     | cotacaoAuto.spec.ts                              |
| CAP-06 | Bloqueio placa restrita (leilão)              | `vehicle_details`            | P0  | ✅     | cotacaoAuto.spec.ts                              |
| CAP-07 | CEP e número do endereço                      | `vehicle_additional_details` | P0  | ✅     | cotacaoAuto.spec.ts                              |
| CAP-08 | Garagem noturna × preço                       | `vehicle_additional_details` | P1  | ✅     | precosPlanos.spec.ts                             |
| CAP-09 | Uso do veículo × preço                        | `vehicle_additional_details` | P1  | ✅     | precosPlanos.spec.ts                             |
| CAP-10 | CEP alto risco × preço                        | `vehicle_additional_details` | P2  | 🔒     | —                                                |
| CAP-11 | CPF válido — avançar                          | `person_data`                | P0  | ✅     | cotacaoAuto.spec.ts                              |
| CAP-12 | CPF blacklist / PEP                           | `person_data`                | P0  | ✅     | cotacaoAuto.spec.ts                              |
| CAP-13 | Estado civil × preço                          | `person_data`                | P1  | ✅     | precosPlanos.spec.ts                             |
| CAP-14 | Idade motorista × preço                       | `person_data`                | P2  | 🔒     | —                                                |
| CAP-15 | Modal "Não sei minha Classe de Bônus"         | `bonuses_class`              | P1  | ✅     | validateBonusClass.spec.ts                       |
| CAP-16 | Seleção classe 1–10 × preço                   | `bonuses_class`              | P1  | ✅     | precosPlanos.spec.ts, validateBonusClass.spec.ts |
| CAP-17 | Tela de enriquecimento de dados               | `data_enrichment`            | P3  | ⬜     | —                                                |
| CAP-18 | Exibir planos Essencial / Regular / Auto 1504 | `plan_selection`             | P0  | ✅     | coberturas.spec.ts                               |
| CAP-19 | Ordem de preço entre planos                   | `plan_selection`             | P0  | ✅     | coberturas.spec.ts, precosPlanos.spec.ts         |
| CAP-20 | Keywords coberturas/assistências nos cards    | `plan_selection`             | P1  | ✅     | coberturas.spec.ts                               |
| CAP-21 | Entrada plano Personalizado                   | `plan_selection`             | P0  | ✅     | personalizacao.spec.ts, coberturas.spec.ts       |
| CAP-22 | Toggle cobertura opcional (Danos Morais)      | `coverages_selection`        | P1  | ✅     | personalizacao.spec.ts                           |
| CAP-23 | Desligar cobertura (Roubo e furto)            | `coverages_selection`        | P1  | ✅     | personalizacao.spec.ts                           |
| CAP-24 | Cobertura obrigatória não desliga             | `coverages_selection`        | P1  | ✅     | personalizacao.spec.ts                           |
| CAP-25 | Slider franquia × preço                       | `coverages_selection`        | P1  | ✅     | personalizacao.spec.ts                           |
| CAP-26 | Slider indenização × preço                    | `coverages_selection`        | P1  | ✅     | personalizacao.spec.ts                           |
| CAP-27 | Delta simétrico coberturas                    | `coverages_selection`        | P2  | 🟡     | validacaoValores.spec.ts                         |
| CAP-28 | Visibilidade catálogo assistências            | `assistances_selection`      | P1  | ✅     | assistencias.spec.ts                             |
| CAP-29 | Toggle assistência × preço (independentes)    | `assistances_selection`      | P1  | ✅     | assistencias.spec.ts                             |
| CAP-30 | Combo guincho + modal                         | `assistances_selection`      | P1  | ✅     | assistencias.spec.ts                             |
| CAP-31 | Dependência combo (disabled sem guincho)      | `assistances_selection`      | P1  | ✅     | assistencias.spec.ts                             |
| CAP-32 | Promo RPS grátis vs cobrado                   | `assistances_selection`      | P1  | ✅     | assistenciaRpsPromo.spec.ts                      |
| CAP-33 | Assistências imutáveis (plano pré-formatado)  | `assistances_selection`      | P2  | ⬜     | —                                                |
| CAP-34 | Delta simétrico assistências                  | `assistances_selection`      | P2  | 🟡     | validacaoValores.spec.ts                         |
| CAP-35 | Tela aceite de risco                          | `risk_acceptance`            | P2  | ⬜     | —                                                |
| CAP-36 | Navegação até checkout (sem pagar)            | `checkout`                   | P1  | ✅     | personalizacao.spec.ts                           |
| CAP-37 | Pagamento cartão + emissão                    | `checkout`                   | P0  | ✅     | cotacaoAuto.spec.ts, personalizacao.spec.ts      |
| CAP-38 | Cross-sell residencial / vida                 | `checkout`                   | P3  | ⬜     | —                                                |
| CAP-39 | Resumo assistências no checkout               | `checkout`                   | P2  | 🟡     | cotacaoAuto.spec.ts                              |
| CAP-40 | Tela sucesso / apólice emitida                | `issuance`                   | P0  | ✅     | cotacaoAuto.spec.ts, personalizacao.spec.ts      |
| CAP-41 | Idempotência de preço (mesmos dados)          | `transversal`                | P1  | ✅     | precosPlanos.spec.ts                             |
| CAP-42 | Sanidade guard-rails de preço                 | `transversal`                | P0  | ✅     | precosPlanos.spec.ts, coberturas.spec.ts         |

## 3. Specs E2E (49 testes)

| Spec                          | Testes |
| ----------------------------- | ------ |
| `assistenciaRpsPromo.spec.ts` | 1      |
| `assistencias.spec.ts`        | 7      |
| `coberturas.spec.ts`          | 7      |
| `cotacaoAuto.spec.ts`         | 5      |
| `personalizacao.spec.ts`      | 9      |
| `precosPlanos.spec.ts`        | 13     |
| `validacaoValores.spec.ts`    | 3      |
| `validateBonusClass.spec.ts`  | 4      |

## 4. Gaps estruturais (GitHub × repo)

- Nenhum gap estrutural.

---

_Gerado por `npm run coverage:sync` — não editar manualmente._
