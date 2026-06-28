# Engenharia de Prompt para QA — aplicado a este repo

> **Fonte Chapter Qualidade:** [Engenharia de Prompt para QAs: Otimizando Testes com IA](https://cxdigital.atlassian.net/wiki/spaces/Qualidade/pages/4155539459/Engenharia+de+Prompt+para+QAs+Otimizando+Testes+com+IA)  
> **Complemento:** [Uso do Agent Playwright](https://cxdigital.atlassian.net/wiki/spaces/Qualidade/pages/3766943747/Uso+do+Agent+Playwright)  
> **Orquestração local:** skill `qa-orchestrator` · [`planner-qa-agent.md`](../planners/planner-qa-agent.md)

Este guia traduz as 12 técnicas do Confluence em **prompts prontos** para o repositório `qa-e2e-tests-automation` (Seguro Auto E2E).

---

## Regra de ouro — Prompt de contexto base (Priming)

Antes de pedir código ou cenários, defina **persona + contexto real**. Não pule esta etapa.

```markdown
Aja como Engenheiro de QA Sênior especialista em Playwright E2E e Seguro Auto B2C.

Contexto do repo:

- E2E UI: qa-e2e-tests-automation (este repo) — funil web, UX, pagamento, a11y
- Regras de preço/personalização: qa-api-tests-automation — NÃO browser
- Page Objects em tests/pages/quotation/
- Planners em docs/planners/
- Cobertura: docs/coverage/README.md (CAP-XX)

Leia o cenário abaixo e responda apenas "Entendido" + 3 pontos de atenção para testes.
Não gere código ainda.

[CENÁRIO REAL — ex: PAY-P4b PIX — emissão após webhook Stark sandbox no checkout QA]
```

---

## Técnicas × prompts deste projeto

| #   | Técnica (Confluence)  | Quando usar aqui     | Prompt exemplo                                                                |
| --- | --------------------- | -------------------- | ----------------------------------------------------------------------------- |
| 1   | Iterativo             | Refinar spec/planner | "Reescreva PAY-P4 em Gherkin com pré/pós-condições e dados de `tests/data/`"  |
| 2   | Follow-up             | Aprofundar resposta  | "Detalhe só o passo de expandir accordion PIX em CheckoutPage"                |
| 3   | Verificação cognitiva | Validar plano        | "Revise planner-pagamento.md — falta cobertura em webhook?"                   |
| 4   | Role prompting        | Perspectiva técnica  | "Como Arquiteto de Testes, priorize smoke vs regression para payment/"        |
| 5   | Refinamento           | Pergunta vaga        | "Melhore: 'teste o PIX' → cenário com Given/When/Then e tags @payment"        |
| 6   | Meta-prompt           | Criar prompt         | "Crie prompt para gerar spec Playwright a partir de planner-pagamento PAY-C5" |
| 7   | Few-shot              | Formato padrão       | Ver seção **Few-shot — spec Playwright** abaixo                               |
| 8   | Autoconsistência      | Comparar abordagens  | "3 formas de testar PIX assíncrono; qual para CI nightly?"                    |
| 9   | Ancoragem de memória  | Série de specs       | "Mantendo padrão de checkout-pix.spec.ts, adicione PAY-C5 recusado"           |
| 10  | Empilhamento          | Planner → spec → CAP | Ver seção **Layering — novo cenário** abaixo                                  |
| 11  | Chain of thought      | Debug flake          | "Passo a passo: por que PIX accordion colapsa ao clicar de novo?"             |
| 12  | Dois passos           | Plano estruturado    | "Passo 1: liste CAPs; Passo 2: mapeie para pasta e2e/"                        |

---

## Few-shot — spec Playwright (técnica 7)

Use um spec existente como molde ([Uso do Agent Playwright](https://cxdigital.atlassian.net/wiki/spaces/Qualidade/pages/3766943747/Uso+do+Agent+Playwright)):

```markdown
Use tests/spec/e2e/payment/checkout-pix.spec.ts como referência de estilo.

Crie checkout-declined.spec.ts para PAY-C5 (cartão recusado Adyen):

- Page Object CheckoutPage (sem locators no spec)
- Tags: @payment @negative @regression
- navigateToCheckout + fillCreditCardData com cartão refusal Adyen
- Then: permanece em /checkout ou mensagem de erro visível
- Atualize docs/planners/planner-pagamento.md e scripts/coverage-inventory.ts
```

---

## Layering — novo cenário (técnica 10)

**Etapa 1 — Planner**

```markdown
Leia docs/planners/planner-pagamento.md. Adicione linha PAY-C5 se não existir.
Liste Given/When/Then e dependências (massa Adyen, VPN).
```

**Etapa 2 — Implementação**

```markdown
Implemente PAY-C5 seguindo boas-praticas.md:

- tests/data/adyenTestCards.ts
- tests/spec/e2e/payment/checkout-declined.spec.ts
- npm run validate
```

**Etapa 3 — Cobertura**

```markdown
Atualize scripts/coverage-inventory.ts e rode npm run coverage:sync.
Resuma % e gaps no template do planner-qa-agent.md.
```

---

## Prompts prontos — operações do dia a dia

### Orquestrador QA (skill)

```
Use o skill qa-orchestrator para validar mudanças em tests/spec/e2e/payment/.
Rode validate + test:payment com --workers=1. Atualize coverage:sync se CAP mudou.
```

### Status rápido

```
Leia docs/coverage/README.md e docs/reports/e2e-timing-report.md.
Resuma: % cobertura, testes E2E, último timing UX, 3 gaps CAP prioritários.
```

### PIX — simular pagamento completo

```
Contexto: PIX em QA usa Stark sandbox (BR Code em pix-brcode-capture.json).
Sem STARK_* no .env só chegamos em PAY-P4 (pendente).

Com credenciais Stark:
1. npm run tool:pix-capture
2. npm run tool:pix-pay
3. npm run test:pix:emission (PIX_SANDBOX_MANUAL_PAUSE=0)

Gravação: npm run test:pix:record:export
Guia: docs/guides/payment-testing.md
```

### A11y

```
Leia docs/guides/a11y-gap-map.md.
Sugira 2 specs @a11y para checkout mobile priorizando WCAG 2.2 AA.
```

### Healer (spec quebrado)

```
Spec falhou: [colar log Playwright]
Page Object: tests/pages/quotation/[Tela]Page.ts
Corrija seletor seguindo boas-praticas.md (web-first, sem force).
Não use waitForTimeout.
```

---

## Anti-padrões (não colocar no prompt)

| Evitar                   | Por quê                                                        |
| ------------------------ | -------------------------------------------------------------- |
| "Teste tudo"             | Suíte completa ~30 min; use matriz do qa-orchestrator          |
| Preço no browser         | Regras em qa-api-tests-automation                              |
| Dados reais de cliente   | Só massa QA / .env                                             |
| `git push` sem pedir     | Skill não commita automaticamente                              |
| Um prompt com 5 cenários | Atomicidade — um cenário por vez (Confluence Playwright Agent) |

---

## Checklist antes de fechar uma sessão com IA

- [ ] Planner atualizado (`docs/planners/`)
- [ ] `npm run validate` (se `.ts` mudou)
- [ ] Teste alvo rodou (smoke / ux / payment / a11y)
- [ ] `npm run coverage:sync` (se CAP ou spec novo)
- [ ] README do spec tocado (se pasta nova)

---

## Relacionados

- [`boas-praticas.md`](boas-praticas.md) — padrões de código
- [`planner-qa-agent.md`](../planners/planner-qa-agent.md) — fluxo do agente
- [`.cursor/skills/qa-orchestrator/SKILL.md`](../../.cursor/skills/qa-orchestrator/SKILL.md) — skill Cursor
