# Relatório A11y — Execução QA (axe + teclado)

> **Última execução:** 2026-06-18 (2ª rodada, ~19:23 UTC) · **Ambiente:** `qa-cotacao.youse.io` · **VPN:** ativa  
> **Comando:** `npm run test:a11y` (mobile-chrome + tablet, 18 testes)  
> **Critério axe:** falha em violações **serious** ou **critical**

---

## Resumo executivo

| Métrica      | Valor                           |
| ------------ | ------------------------------- |
| Total        | 18 testes                       |
| Passou       | **4**                           |
| Falhou       | 4                               |
| Não executou | 10 (serial — parou após falhas) |
| Duração      | ~9,8 min                        |

---

## Resultados por teste (mobile-chrome)

| #   | Spec    | Cenário                                    | Resultado                              | Tempo |
| --- | ------- | ------------------------------------------ | -------------------------------------- | ----- |
| 1   | axe     | `lead_info`                                | ❌ `aria-roles` (12) + `link-name` (1) | 10s   |
| 2–5 | axe     | planos, coberturas, assistências, checkout | ⏭️ não executou                        | —     |
| 6   | teclado | `lead_info` — preencher e avançar          | ✅                                     | 11s   |
| 7   | teclado | `vehicle_details` — placa e Continuar      | ✅                                     | 9s    |
| 8   | teclado | `plan_selection` — Continuar por Tab       | ❌ timeout 4 min                       | —     |
| 9   | teclado | `plan_selection` — card Regular por Tab    | ⏭️ não executou                        | —     |

## Resultados tablet

| #     | Cenário                                   | Resultado                              | Tempo |
| ----- | ----------------------------------------- | -------------------------------------- | ----- |
| 10    | axe `lead_info`                           | ❌ `aria-roles` (12) + `link-name` (1) | 13s   |
| 11–14 | axe planos, coberturas, assist., checkout | ⏭️ não executou                        | —     |
| 15    | teclado `lead_info`                       | ✅                                     | 11s   |
| 16    | teclado `vehicle_details`                 | ✅                                     | 8s    |
| 17    | teclado `plan_selection` — Continuar      | ❌ timeout 4 min                       | —     |
| 18    | teclado `plan_selection` — card Regular   | ⏭️ não executou                        | —     |

> **Nota:** tablet local usa Chrome com viewport iPad; CI continua com WebKit real. Fix de config validado nesta rodada.

---

## `lead_info` — detalhes axe

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

## `plan_selection` — teclado

O botão **Continuar** não recebeu foco após **60 Tabs** (timeout 4 min). Possíveis causas:

- ordem de tabulação longa (muitos elementos focáveis antes do botão);
- botão fora da ordem natural do DOM;
- elemento interceptando foco (modal, overlay, card de plano).

**Ação:** inspecionar manualmente com Tab na tela de planos (mobile) ou aumentar cobertura com skip link / atalho documentado no front.

---

## O que isso confirma

- A análise **no código** (Page Objects) mostrava locators bons nos **campos** — o axe revela que o **HTML subjacente** usa roles customizadas inválidas.
- Teclado funciona em **lead_info** e **vehicle_details**, mas falha em **plan_selection** — gap real de WCAG 2.1.1 na escolha de plano.
- Rodar axe **no app real** encontra problemas que testes funcionais não pegam.

---

## Próximas ações

### Front (`sales-lead-requirements` / design system)

1. Remover `role="header"`, `role="title"`, `role="input"`, `role="stepper"`.
2. Link WhatsApp: `aria-label="Falar com especialista no WhatsApp"`.
3. Revisar tab order na tela de planos (botão Continuar e cards).

### QA / automação

```bash
# Re-executar após fix do tablet (config já ajustada)
npm run test:a11y

# Só teclado
npm run test:keyboard
```

4. Completar axe nas 4 telas restantes (depende de passar lead_info ou rodar spec por tela).
5. Abrir issues Jira vinculadas ao micro-frontend.
6. Baseline verde após fix no front.

---

## Relacionados

- [Análise estática](../guides/accessibility-analysis.md)
- [**Mapa de gaps — hoje vs deveria ser**](../guides/a11y-gap-map.md)
- [Mapa de fluxos](../guides/fluxos-cotacao-auto.md)
