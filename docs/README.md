# Documentação — QA E2E Seguro Auto

Índice central da documentação do repositório. O [`README.md`](../README.md) na raiz cobre setup, CI e como rodar testes; aqui ficam **planos de cenário**, **cobertura** e **relatórios gerados**.

## Estrutura

```
docs/
├── README.md              ← você está aqui
├── planners/              ← especificações de cenário (input dos Playwright Agents)
├── coverage/              ← cobertura funcional front × automação
├── guides/                ← guias (troubleshooting, a11y, fluxos)
└── reports/               ← relatórios auto-gerados (tempo E2E, etc.)
```

## Onde ir primeiro

| Objetivo                                     | Documento                                                                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Ver **% de cobertura** e gaps                | [`coverage/README.md`](coverage/README.md)                                                                                |
| Matriz técnica GitHub × specs                | [`coverage/sync-report.md`](coverage/sync-report.md)                                                                      |
| **Plano de um cenário** (Given/When/Then)    | [`planners/`](planners/)                                                                                                  |
| **Validação de campos (CAP-02)**             | [`planners/planner-validacao-campos.md`](planners/planner-validacao-campos.md)                                            |
| **UX por tela** (specs E2E)                  | [`../tests/spec/e2e/ux/README.md`](../tests/spec/e2e/ux/README.md)                                                        |
| **Dashboard tempo** (última run + histórico) | [`reports/e2e-timing-report.md`](reports/e2e-timing-report.md) · [`reports/e2e-timing-log.md`](reports/e2e-timing-log.md) |
| **Dashboard suíte completa** (E2E+API+A11y)  | [`reports/full-suite-timing-report.md`](reports/full-suite-timing-report.md)                                              |
| **Erros comuns** (seletores, sessão, deps)   | [`guides/troubleshooting.md`](guides/troubleshooting.md)                                                                  |
| **Acessibilidade** (WCAG, mobile/tablet)     | [`guides/accessibility-analysis.md`](guides/accessibility-analysis.md)                                                    |
| **Gaps a11y** (hoje vs deveria ser · foco)   | [`guides/a11y-gap-map.md`](guides/a11y-gap-map.md)                                                                        |
| **Mapa de fluxos** do funil × automação      | [`guides/fluxos-cotacao-auto.md`](guides/fluxos-cotacao-auto.md)                                                          |
| **Pirâmide E2E vs API** (cotação)            | [`guides/api-quotation-layer.md`](guides/api-quotation-layer.md)                                                          |
| **Pagamento** (Adyen, PIX, sandbox)          | [`guides/payment-testing.md`](guides/payment-testing.md)                                                                  |
| **Boas práticas** (padrões e débito técnico) | [`guides/boas-praticas.md`](guides/boas-praticas.md)                                                                      |
| Rodar o projeto / CI                         | [`../README.md`](../README.md)                                                                                            |

## Comandos úteis

```bash
npm run coverage:sync       # dashboard cobertura (% CAP)
npm run test:ux:timing        # roda UX (30 testes) + atualiza e2e-timing-report
npm run test:e2e:timing       # roda E2E completo + relatório de tempo
npm run test:full:timing      # E2E + API + A11y + full-suite-timing-report
npm run e2e:timing:generate   # regenera a partir de JSON ou --from-log
```

## Convenções

| Tipo             | Pasta                   | Nome do arquivo                                           | Editável?                |
| ---------------- | ----------------------- | --------------------------------------------------------- | ------------------------ |
| Plano de cenário | `planners/`             | `planner-*.md`                                            | ✅ manual                |
| Guia / runbook   | `guides/`               | `troubleshooting.md`, `fluxos-*.md`, `accessibility-*.md` | ✅ manual                |
| Dashboard / guia | `coverage/`             | `README.md`                                               | ✅ manual (+ bloco auto) |
| Relatório gerado | `coverage/`, `reports/` | `sync-report.md`, `e2e-timing-*`                          | ❌ só via script         |
| Métricas JSON    | `coverage/`, `reports/` | `metrics.json`, `e2e-timing.json`                         | ❌ só via script         |
