# Cobertura de Testes E2E — Seguro Auto

> **Para quê serve:** comparar o que o **frontend Youse expõe** (GitHub) com o que **já automatizamos** neste repositório — e deixar claro **o que falta**.
>
> **Última revisão manual:** 2026-06-17 · **Produto:** Seguro Auto B2C · **Ambiente:** QA

<!-- COVERAGE_METRICS:START -->

> 🤖 **Atualizado automaticamente** em 2026-06-18 · Fonte: [`sales-frontend`](https://github.com/youse-seguradora/sales-frontend) @ `main` · `49` testes E2E · `42` capacidades testáveis inventariadas

## Painel de cobertura (leitura rápida)

| Indicador                           |   Valor | Em plain language                                                      |
| ----------------------------------- | ------: | ---------------------------------------------------------------------- |
| **Cobertura funcional (principal)** | **79%** | Capacidades do front com teste dedicado, contando parciais pela metade |
| Cobertura funcional estrita         |     74% | Só conta ✅ com teste dedicado (sem 🟡)                                |
| Cobertura estrutural (telas)        |     77% | Telas do funil com Page Object (10/13)                                 |
| P0 automatizado                     |    100% | 13/13 itens críticos                                                   |
| P1 automatizado                     |    100% | 18/18 itens alto risco                                                 |
| ✅ Coberto                          |      31 | Teste E2E dedicado                                                     |
| 🟡 Parcial                          |       4 | Happy path ou regra incompleta                                         |
| ⬜ Falta automatizar                |       5 | Front permite testar; sem spec                                         |
| 🔒 Bloqueado                        |       2 | Depende massa/API — ver backlog                                        |

### Fórmula do indicador principal

```
Cobertura funcional = (✅ + 🟡×0,5) / capacidades testáveis × 100
```

Capacidades testáveis = inventário em `scripts/coverage-inventory.ts` (derivado do GitHub + planners).

### O que falta automatizar (⬜ + 🔒)

| ID     | Funcionalidade (front)                       | Section                      | Status | Planner                 | Notas                                  |
| ------ | -------------------------------------------- | ---------------------------- | ------ | ----------------------- | -------------------------------------- |
| CAP-02 | Validação de campos obrigatórios             | `lead_info`                  | ⬜     | planner.md              | Mensagens de erro inline               |
| CAP-17 | Tela de enriquecimento de dados              | `data_enrichment`            | ⬜     | —                       | Section no front; fluxo QA pode pular  |
| CAP-33 | Assistências imutáveis (plano pré-formatado) | `assistances_selection`      | ⬜     | planner-assistencias.md | —                                      |
| CAP-35 | Tela aceite de risco                         | `risk_acceptance`            | ⬜     | —                       | Sem POM; aparece em perfis específicos |
| CAP-38 | Cross-sell residencial / vida                | `checkout`                   | ⬜     | planner.md              | —                                      |
| CAP-10 | CEP alto risco × preço                       | `vehicle_additional_details` | 🔒     | planner-precos.md       | Massa CEP aceita no QA                 |
| CAP-14 | Idade motorista × preço                      | `person_data`                | 🔒     | planner-precos.md       | CPF/DOB fixos                          |

### Cobertura parcial — completar depois (🟡)

| ID     | Funcionalidade                  | Section                 | Spec atual               | Próximo passo                             |
| ------ | ------------------------------- | ----------------------- | ------------------------ | ----------------------------------------- |
| CAP-04 | Toggle zero km                  | `vehicle_details`       | precosPlanos.spec.ts     | Só compara diferença, não ordinal estrito |
| CAP-27 | Delta simétrico coberturas      | `coverages_selection`   | validacaoValores.spec.ts | Danos Morais ✅; estender                 |
| CAP-34 | Delta simétrico assistências    | `assistances_selection` | validacaoValores.spec.ts | IPVA parcial no HEAD                      |
| CAP-39 | Resumo assistências no checkout | `checkout`              | cotacaoAuto.spec.ts      | Happy path; assert dedicado ⬜            |

<!-- COVERAGE_METRICS:END -->

---

## Em 30 segundos

| Pergunta                              | Onde encontrar                                |
| ------------------------------------- | --------------------------------------------- |
| **Qual a % de cobertura hoje?**       | Painel acima (atualizado pelo script)         |
| **O que o front tem e nós testamos?** | [`sync-report.md`](sync-report.md) §1 e §2    |
| **O que falta automatizar?**          | Painel acima → tabela "O que falta"           |
| **Detalhe de cada cenário de teste?** | [`planners/`](../planners/) (specs completas) |
| **Números em JSON (dashboard)?**      | [`metrics.json`](metrics.json)                |

---

## Como a comparação GitHub × automação funciona

```
┌─────────────────────┐     npm run coverage:sync     ┌──────────────────────────┐
│  sales-frontend     │ ────────────────────────────▶ │  coverage/sync-report    │
│  (GitHub Youse)     │   lê sections / slugs         │  Telas × POMs × specs    │
└─────────────────────┘                               └──────────────────────────┘
         │                                                        │
         │  + planners + DOM QA                                   ▼
         ▼                                              coverage/README (painel %)
┌─────────────────────┐
│ coverage-inventory  │  ← inventário do que É TESTÁVEL no front (44 caps)
│ (scripts/)          │     cada item: ✅ 🟡 ⬜ 🔒 + spec + planner
└─────────────────────┘
```

### Três camadas de cobertura (padrão de mercado)

| Camada            | O que mede                                   | Indicador                   | Fonte                                               |
| ----------------- | -------------------------------------------- | --------------------------- | --------------------------------------------------- |
| **1. Estrutural** | Telas do funil com Page Object               | % telas com POM             | GitHub `buildSections()` × `tests/pages/quotation/` |
| **2. Funcional**  | Capacidades testáveis no front com teste E2E | **% principal (ponderada)** | `scripts/coverage-inventory.ts`                     |
| **3. Cenário**    | Passos Given/When/Then documentados          | Planners                    | `docs/planners/`                                    |

> **Importante:** não usamos cobertura de código (Istanbul). Medimos **cobertura funcional E2E** — o que o usuário vê e faz no browser.

---

## O que analisamos no GitHub da Youse

Repositórios consultados pelo script:

| Repo                                                                   | O que extraímos                | Para quê                        |
| ---------------------------------------------------------------------- | ------------------------------ | ------------------------------- |
| [`sales-frontend`](https://github.com/youse-seguradora/sales-frontend) | 12 **sections** do app `auto`  | Lista oficial de telas do funil |
| [`tiny-fronts`](https://github.com/youse-seguradora/tiny-fronts)       | Pacotes `@tiny-fronts/sales-*` | Micro-frontends por tela        |
| [`order-service`](https://github.com/youse-seguradora/order-service)   | Regras de plano/cobertura      | Contexto; oráculo API (futuro)  |

### Telas do funil (fonte: GitHub)

`lead_info` → `vehicle_details` → `vehicle_additional_details` → `person_data` → `bonuses_class` → `data_enrichment` → `plan_selection` → `coverages_selection` → `assistances_selection` → `risk_acceptance` → `checkout` → `issuance` → `/sucesso`

Inventário completo com status por tela: **[`sync-report.md`](sync-report.md)**

---

## O que já está automatizado (resumo)

| Área                      | Spec principal                                            | Exemplos cobertos                                 |
| ------------------------- | --------------------------------------------------------- | ------------------------------------------------- |
| Caminho feliz + negativos | `cotacaoAuto.spec.ts`                                     | Cotação → pagamento → apólice; CPF/placa/blindado |
| Planos pré-formatados     | `coberturas.spec.ts`                                      | Essencial/Regular/1504, keywords, ordem preço     |
| Preços por risco          | `precosPlanos.spec.ts`                                    | Bônus, garagem, uso, estado civil, sanidade       |
| Personalização            | `personalizacao.spec.ts`                                  | Coberturas, franquia, navegação checkout          |
| Assistências              | `assistencias.spec.ts`                                    | Toggles, combo, dependências                      |
| Validação valores         | `validacaoValores.spec.ts`, `assistenciaRpsPromo.spec.ts` | Delta, promo RPS                                  |
| Classe bônus UI           | `validateBonusClass.spec.ts`                              | Modal e seleções                                  |

**Total de testes E2E:** ver painel acima ou [`sync-report.md`](sync-report.md) §3.

---

## O que falta automatizar — está documentado?

**Sim.** Cada gap aparece em três lugares (mantidos em sync):

| Tipo de gap              | Documento                                                     | Quem atualiza             |
| ------------------------ | ------------------------------------------------------------- | ------------------------- |
| ⬜ Testável, sem spec    | Painel acima + `coverage-inventory.ts`                        | QA ao implementar teste   |
| 🟡 Parcial               | Painel + inventário (`status: partial`)                       | QA                        |
| 🔒 Bloqueado (massa/API) | Painel + `planner-precos.md` / `planner-validacao-valores.md` | QA + dev                  |
| Nova tela no front       | `sync-report.md` + `coverage-config.ts`                       | Script detecta; QA mapeia |

### Backlog manual (prioridade)

| Pri | Item                                               | Status |
| --- | -------------------------------------------------- | ------ |
| P2  | Delta simétrico: histórico, leva e traz, Roubo OFF | ⬜     |
| P2  | Assistências imutáveis em plano pré-formatado      | ⬜     |
| P2  | Tela `data_enrichment` / `risk_acceptance`         | ⬜     |
| P3  | CEP alto risco, idade motorista                    | 🔒     |
| P3  | Oráculo API PricingService                         | 🔒     |
| P3  | Cross-sell checkout (residencial/vida)             | ⬜     |

Detalhes de implementação: planners correspondentes.

---

## Legenda de status

| Símbolo | Significado                                |
| ------- | ------------------------------------------ |
| ✅      | Teste E2E dedicado existe                  |
| 🟡      | Parcial — happy path ou regra incompleta   |
| ⬜      | Front testável; **falta automação**        |
| 🔒      | Testável, mas bloqueado (massa, API, flag) |
| 🚫      | Fora de escopo E2E neste repo              |

---

## Como manter atualizado

### Ao implementar um teste novo

1. Marcar `status: 'covered'` em `scripts/coverage-inventory.ts` (capacidade correspondente)
2. Documentar cenário no `planner-*.md`
3. Rodar `npm run coverage:sync` → percentuais e relatório atualizam sozinhos

```bash
npm run coverage:sync    # gera report + JSON + painel neste doc
npm run coverage:check   # CI: falha se section nova no GitHub sem mapa
```

### Arquivos do modelo

| Arquivo                                                                | Papel                                    |
| ---------------------------------------------------------------------- | ---------------------------------------- |
| **`coverage/README.md`** (este)                                        | Dashboard executivo — fácil leitura      |
| [`sync-report.md`](sync-report.md)                                     | Matriz completa front × automação (auto) |
| [`metrics.json`](metrics.json)                                         | Métricas para BI/dashboards              |
| [`scripts/coverage-inventory.ts`](../../scripts/coverage-inventory.ts) | Inventário testável + status             |
| [`scripts/coverage-config.ts`](../../scripts/coverage-config.ts)       | Mapa section → Page Object               |
| [`planners/`](../planners/)                                            | Especificação detalhada dos cenários     |

---

## Referências

- ISO/IEC/IEEE 29119 — documentação de testes (RTM)
- ISTQB — cobertura baseada em risco
- Playwright — [best practices](https://playwright.dev/docs/best-practices)

---

## Histórico

| Data       | Mudança                                                                   |
| ---------- | ------------------------------------------------------------------------- |
| 2026-06-17 | Inventário testável (44 caps), painel % automático, relatório enriquecido |
| 2026-06-17 | Versão inicial RTM + script sync                                          |
