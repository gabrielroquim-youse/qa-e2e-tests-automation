# Relatórios gerados

Arquivos produzidos automaticamente pelos scripts — **não editar manualmente**.

| Arquivo                                                      | Gerado por                    | Conteúdo                                                |
| ------------------------------------------------------------ | ----------------------------- | ------------------------------------------------------- |
| [`e2e-timing-report.md`](e2e-timing-report.md)               | `npm run e2e:timing:generate` | Tempo por teste e por spec (E2E)                        |
| [`e2e-timing.json`](e2e-timing.json)                         | idem                          | Métricas E2E da última execução                         |
| [`e2e-timing-log.md`](e2e-timing-log.md)                     | idem                          | **Log de tempo** — histórico de todas as runs E2E       |
| [`e2e-timing-log.json`](e2e-timing-log.json)                 | idem                          | Histórico machine-readable (até 100 entradas)           |
| [`full-suite-timing-report.md`](full-suite-timing-report.md) | `npm run test:full:timing`    | E2E + API + A11y consolidado (última run)               |
| [`full-suite-timing.json`](full-suite-timing.json)           | idem                          | Métricas da suíte completa (última run)                 |
| [`full-suite-timing-log.md`](full-suite-timing-log.md)       | idem                          | **Log de tempo** — histórico de todas as runs completas |
| [`full-suite-timing-log.json`](full-suite-timing-log.json)   | idem                          | Histórico machine-readable (até 100 entradas)           |
| [`history/`](history/)                                       | idem                          | Snapshot JSON completo por execução (rastreabilidade)   |
| [`a11y-qa-report.md`](a11y-qa-report.md)                     | `npm run test:a11y` (manual)  | Violações axe no QA                                     |

## Rastreabilidade

Cada execução gera uma **pasta com data e hora** (UTC):

```
docs/reports/history/2026-06-19_16-50-45/
  execution.json          # metadados da run
  e2e.json                # métricas E2E (quando aplicável)
  e2e-report.md
  full-suite.json         # consolidado (quando aplicável)
  full-suite-report.md
```

O ID da pasta (`2026-06-19_16-50-45`) coincide com o log bruto `reports/full-run-2026-06-19T16-50-45.log` na suíte completa.

Também existem:

1. **Relatório atual** — `*-timing-report.md` / `*.json` (sempre a última run)
2. **Log acumulado** — `*-timing-log.md` com tabela de todas as runs (Δ wall-clock vs anterior)
3. **Índice JSON** — `*-timing-log.json` (até 100 entradas)

Logs brutos de execução (`reports/full-run-*.log`) ficam em `/reports/` (gitignored, scratch local).

## Como atualizar

```bash
# Suite completa + relatório + log de tempo
npm run test:full:timing

# Só E2E + relatório + log
npm run test:e2e:timing

# Regenerar consolidado (após JSONs em reports/)
npm run full-suite:timing:generate -- --log reports/full-run-....log

# Só regenerar E2E (após playwright --reporter=json > reports/e2e-timing-raw.json)
npm run e2e:timing:generate
```

Relatórios de **cobertura funcional** ficam em [`../coverage/`](../coverage/).
