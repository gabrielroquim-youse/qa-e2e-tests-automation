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

| Objetivo                                   | Documento                                                              |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| Ver **% de cobertura** e gaps              | [`coverage/README.md`](coverage/README.md)                             |
| Matriz técnica GitHub × specs              | [`coverage/sync-report.md`](coverage/sync-report.md)                   |
| **Plano de um cenário** (Given/When/Then)  | [`planners/`](planners/)                                               |
| **Tempo de execução** por teste            | [`reports/e2e-timing-report.md`](reports/e2e-timing-report.md)         |
| **Erros comuns** (seletores, sessão, deps) | [`guides/troubleshooting.md`](guides/troubleshooting.md)               |
| **Acessibilidade** (WCAG, mobile/tablet)   | [`guides/accessibility-analysis.md`](guides/accessibility-analysis.md) |
| **Mapa de fluxos** do funil × automação    | [`guides/fluxos-cotacao-auto.md`](guides/fluxos-cotacao-auto.md)       |
| Rodar o projeto / CI                       | [`../README.md`](../README.md)                                         |

## Comandos úteis

```bash
npm run coverage:sync       # atualiza coverage/sync-report + metrics + painel %
npm run coverage:check      # CI: valida mapa front × POM
npm run test:e2e:timing     # roda E2E + gera reports/e2e-timing-*
npm run e2e:timing:generate   # regenera relatório de tempo a partir do JSON
```

## Convenções

| Tipo             | Pasta                   | Nome do arquivo                                           | Editável?                |
| ---------------- | ----------------------- | --------------------------------------------------------- | ------------------------ |
| Plano de cenário | `planners/`             | `planner-*.md`                                            | ✅ manual                |
| Guia / runbook   | `guides/`               | `troubleshooting.md`, `fluxos-*.md`, `accessibility-*.md` | ✅ manual                |
| Dashboard / guia | `coverage/`             | `README.md`                                               | ✅ manual (+ bloco auto) |
| Relatório gerado | `coverage/`, `reports/` | `sync-report.md`, `e2e-timing-*`                          | ❌ só via script         |
| Métricas JSON    | `coverage/`, `reports/` | `metrics.json`, `e2e-timing.json`                         | ❌ só via script         |
