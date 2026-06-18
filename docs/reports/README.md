# Relatórios gerados

Arquivos produzidos automaticamente pelos scripts — **não editar manualmente**.

| Arquivo                                        | Gerado por                    | Conteúdo                   |
| ---------------------------------------------- | ----------------------------- | -------------------------- |
| [`e2e-timing-report.md`](e2e-timing-report.md) | `npm run e2e:timing:generate` | Tempo por teste e por spec |
| [`e2e-timing.json`](e2e-timing.json)           | idem                          | Métricas para dashboard/CI |

## Como atualizar

```bash
# Suite completa + relatório (~30 min)
npm run test:e2e:timing

# Só regenerar (após playwright --reporter=json > reports/e2e-timing-raw.json)
npm run e2e:timing:generate

# A partir de log do reporter list
npm run e2e:timing:generate -- --from-log reports/e2e-last-run.log
```

Relatórios de **cobertura funcional** ficam em [`../coverage/`](../coverage/).
