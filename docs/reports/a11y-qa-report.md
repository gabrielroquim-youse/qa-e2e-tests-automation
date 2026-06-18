# Relatório A11y — Execução QA (axe)

> **Data:** 2026-06-18 · **Ambiente:** `qa-cotacao.youse.io` · **Viewport:** Pixel 5 (mobile-chrome)  
> **Spec:** `tests/spec/a11y/cotacaoFunnel.a11y.spec.ts`  
> **Critério:** falha em violações axe **serious** ou **critical**

---

## Resumo da 1ª execução

| Tela                    | Resultado                     | Violations bloqueantes |
| ----------------------- | ----------------------------- | ---------------------- |
| `lead_info`             | ❌ **Falhou**                 | 2 regras · 13 nós      |
| `plan_selection`        | ⏳ não executado nesta rodada | —                      |
| `coverages_selection`   | ⏳                            | —                      |
| `assistances_selection` | ⏳                            | —                      |
| `checkout`              | ⏳                            | —                      |

---

## `lead_info` — detalhes (URL real do scan)

`https://qa-cotacao.youse.io/seguro-auto/{id}/lead_info`

### 1. `aria-roles` — **critical** (12 elementos)

Roles ARIA **inválidas** no DOM — leitor de tela pode ignorar ou anunciar incorretamente.

| Elemento      | HTML                     | Problema                          | Correção sugerida (front)                                           |
| ------------- | ------------------------ | --------------------------------- | ------------------------------------------------------------------- |
| Cabeçalho     | `<header role="header">` | `header` não é role ARIA válida   | Remover role ou usar `<header>` sem role (já é landmark)            |
| Stepper (×5+) | `<div role="stepper">`   | `stepper` não existe na spec ARIA | `nav` + `aria-label="Progresso da cotação"` ou `role="progressbar"` |
| Título        | `<h1 role="title">`      | `title` inválido                  | Remover role — `<h1>` já é semântico                                |
| Campos        | `<input role="input">`   | `input` é role abstrata           | Remover `role="input"`; usar `<label>` + `id`/`for` ou `aria-label` |

**Impacto usuário:** SR pode não associar label ao campo corretamente apesar dos testes E2E usarem `getByRole('textbox', { name: ... })` — o axe expõe markup incorreto por baixo.

### 2. `link-name` — **serious** (1 elemento)

| Elemento                    | Problema                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------ |
| Link WhatsApp (`wa.me/...`) | Link focável **sem texto acessível** (sem label, aria-label, title ou texto visível) |

**Impacto:** usuário de teclado/SR tabula para um link sem nome — não sabe para onde vai.

---

## O que isso confirma

- A análise **no código** (Page Objects) mostrava locators bons nos **campos** — o axe revela que o **HTML subjacente** usa roles customizadas inválidas.
- Isso é exatamente o valor de rodar axe **no app real**: gap entre “teste passa” e “usuário SR tem boa experiência”.

---

## Próximas ações recomendadas

### Front (`sales-frontend` / design system)

1. Remover `role="header"`, `role="title"`, `role="input"`, `role="stepper"` — usar HTML/ARIA padrão.
2. Link WhatsApp: `aria-label="Falar com especialista no WhatsApp"` ou texto visível.
3. Stepper: padrão WAI-ARIA `tablist` / `aria-current="step"` ou componente documentado.

### QA / automação

```bash
# Suite completa (demora — navega funil inteiro por tela)
npm run test:a11y

# Teclado
npm run test:keyboard
```

4. Rodar suite completa e anexar resultados por tela neste relatório.
5. Abrir issues no Jira vinculadas ao micro-frontend `sales-lead-requirements` (lead_info).
6. Após fix no front, re-executar para baseline verde.

---

## Relacionados

- [Análise estática](../guides/accessibility-analysis.md)
- [Mapa de fluxos](../guides/fluxos-cotacao-auto.md)
