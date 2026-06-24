# Planner — Agente de orquestração QA (E2E Seguro Auto)

> **Objetivo:** playbook para agente de IA (Cursor Skill `qa-orchestrator`) que lê documentação, executa suítes, atualiza dashboards e propõe próximos passos — **sem** push/commit automático nem decisões de produto.
>
> **Última revisão:** 2026-06-24 · **Skill:** `.cursor/skills/qa-orchestrator/SKILL.md`

---

## Papel do agente

| Faz                                                            | Não faz                                          |
| -------------------------------------------------------------- | ------------------------------------------------ |
| Ler `docs/coverage/`, planners, `boas-praticas.md`             | Alterar código de produção Youse                 |
| Rodar `npm run validate`, `test:smoke`, `test:ux`, `test:a11y` | `git push` sem pedido explícito                  |
| Atualizar `coverage:sync`, relatórios de tempo                 | Criar commits sem pedido                         |
| Resumir gaps (CAP ⬜ 🟡 🔒)                                    | Substituir julgamento humano em massa QA         |
| Sugerir specs a partir de planners                             | Rodar suíte completa em todo PR (custo ~30+ min) |

---

## Fluxo padrão (Given / When / Then)

### G1 — Entender o pedido

| Given                                           | When                                                                    | Then                            |
| ----------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------- |
| Usuário pede status, implementação ou validação | Classificar: **cobertura** · **UX** · **a11y** · **pagamento** · **CI** | Apontar planner + pasta de spec |

### G2 — Sincronizar estado documental

| Given                              | When                          | Then                                                     |
| ---------------------------------- | ----------------------------- | -------------------------------------------------------- |
| Mudança em specs ou inventário CAP | Rodar `npm run coverage:sync` | `docs/coverage/README.md` e `sync-report.md` atualizados |

### G3 — Validar código

| Given                    | When               | Then                           |
| ------------------------ | ------------------ | ------------------------------ |
| Arquivos `.ts` alterados | `npm run validate` | typecheck + lint + prettier OK |

### G4 — Executar testes (matriz)

| Mudança em           | Comando                                       | Tempo ~   |
| -------------------- | --------------------------------------------- | --------- |
| `tests/spec/e2e/ux/` | `npm run test:ux` ou `npm run test:ux:timing` | 11–12 min |
| `@smoke` / journeys  | `npm run test:smoke`                          | 5–15 min  |
| `tests/spec/a11y/`   | `npm run test:a11y`                           | 15–25 min |
| Toda pasta `e2e/`    | `npm run test:e2e:timing`                     | ~30 min   |
| Pagamento / checkout | Specs em `tests/spec/e2e/payment/`            | variável  |

**Pré-requisito:** VPN Youse + `BASE_URL` QA.

### G5 — Relatório ao usuário

Template de saída:

```markdown
## Resumo QA

- Cobertura funcional: X% (docs/coverage/README.md)
- Testes executados: [comando] → passou/falhou (N/M)
- Dashboard tempo: docs/reports/e2e-timing-report.md (se rodou timing)
- Gaps relevantes: [CAP-IDs]
- Próximo passo sugerido: [1 item]
```

---

## Decisão: qual suíte rodar?

```
                    ┌─────────────────┐
                    │ Pedido do user  │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   "status/cobertura"   "validei UX"        "a11y"
         │                   │                   │
         ▼                   ▼                   ▼
  coverage:sync          test:ux            test:a11y
  ler README             (+ timing?)        + gap-map
         │                   │                   │
         └───────────────────┴───────────────────┘
                             │
                    PR rápido → test:smoke
                    nightly   → test:ux + regression
```

---

## Fontes de verdade (ordem de leitura)

1. [`docs/coverage/README.md`](../coverage/README.md) — % e gaps
2. [`docs/guides/boas-praticas.md`](../guides/boas-praticas.md) — padrões e anti-padrões
3. [`docs/planners/`](../planners/) — cenários a implementar
4. [`docs/reports/e2e-timing-log.md`](../reports/e2e-timing-log.md) — histórico de tempo
5. [`tests/spec/e2e/ux/README.md`](../../tests/spec/e2e/ux/README.md) — mapa UX

---

## Integração com Playwright Agents

| Agente Playwright | Quando usar                    | Input                        |
| ----------------- | ------------------------------ | ---------------------------- |
| **planner**       | Nova tela / fluxo desconhecido | Navegação QA                 |
| **generator**     | Planner pronto                 | `docs/planners/planner-*.md` |
| **healer**        | Spec flake / seletor quebrado  | Log de falha                 |

O **qa-orchestrator** coordena; não substitui generator/healer.

---

## Automação Cursor (skill)

Invocar no chat:

```
Use o skill qa-orchestrator para validar minhas mudanças em tests/spec/e2e/ux
```

Ou:

```
@qa-orchestrator rode smoke e atualize cobertura
```

---

## Backlog do agente (evolução)

| Fase      | Entrega                                                                  |
| --------- | ------------------------------------------------------------------------ |
| **F1** ✅ | Skill `.cursor/skills/qa-orchestrator/` + este planner                   |
| **F2**    | `npm run qa:status` — script que imprime painel coverage + último timing |
| **F3**    | `a11y:sync` + painel % a11y                                              |
| **F4**    | CI: comentário em PR com resumo do agente (GitHub Action)                |

---

## Relacionados

- [planner-pagamento.md](planner-pagamento.md) — cartão Adyen + PIX
- [planner-validacao-campos.md](planner-validacao-campos.md) — CAP-02
- [api-quotation-layer.md](../guides/api-quotation-layer.md) — E2E vs API
