# Mapa de gaps de acessibilidade — Cotação Seguro Auto

> **Objetivo:** saber **o que falta**, **onde focar**, **por que corrigir** e **como deve ficar** — web em viewport mobile/tablet (Appium cobre app nativo).  
> **Última revisão:** 2026-06-18 · **Ambiente:** QA `qa-cotacao.youse.io`

---

## Onde está cada tipo de mapeamento

| Documento                                                | O que contém                                                 | Quando usar                           |
| -------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------- |
| **[Este mapa](./a11y-gap-map.md)**                       | Prioridades · hoje vs deveria ser · impacto no usuário       | Planejamento front/QA · abrir issues  |
| [accessibility-analysis.md](./accessibility-analysis.md) | Análise **estática** por etapa do funil (Page Objects, WCAG) | Revisão de locators e riscos por tela |
| [a11y-qa-report.md](../reports/a11y-qa-report.md)        | Resultados **dinâmicos** (axe + teclado no QA)               | Evidência de execução · baseline      |
| [a11y-device-sandbox.md](./a11y-device-sandbox.md)       | Como rodar em viewport mobile/tablet                         | Executar testes `@a11y` / `@keyboard` |
| [fluxos-cotacao-auto.md](./fluxos-cotacao-auto.md)       | Fluxos × cobertura E2E funcional                             | Contexto de negócio                   |

**Legenda de status:** 🔴 confirmado no QA (axe/teclado) · 🟠 risco alto (análise estática) · 🟡 risco médio · ⚪ não testado ainda · ✅ OK nos testes atuais

---

## Onde focar (resumo executivo)

| Prioridade | Área                                                        | Motivo                                               | Ação principal                                      |
| ---------- | ----------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------- |
| **P0**     | `lead_info` — roles ARIA + link WhatsApp                    | 🔴 axe **critical/serious** em Android, iOS e tablet | Corrigir markup no MFE `sales-lead-requirements`    |
| **P0**     | `plan_selection` — ordem de tabulação                       | 🔴 teclado não alcança Continuar (timeout 4 min)     | Revisar tab order e foco nos cards                  |
| **P1**     | Steppers franquia/indenização (`coverages_selection`)       | 🟠 alvos pequenos · sem nome acessível · WCAG 2.5.5  | `aria-label` + área de toque ≥ 44px                 |
| **P1**     | Switches coberturas/assistências                            | 🟠 localizados via XPath · alvo touch pequeno        | Label + switch semântico                            |
| **P1**     | Cards de plano                                              | 🟠 semântica fraca (`CSS` class)                     | `<article>` / `role="group"` + heading              |
| **P2**     | CAP-02 validação obrigatória                                | 🟡 sem teste · mensagens de erro                     | `aria-live` + foco no primeiro erro                 |
| **P2**     | Checkout checkbox e-mail                                    | 🟡 click via JS nos testes                           | Label clicável nativa                               |
| **P2**     | Telas intermediárias (`data_enrichment`, `risk_acceptance`) | ⚪ condicionais — teste condicional adicionado       | `cotacaoFunnel.a11y.spec.ts` — skip se não aparecer |

> **Atualização 2026:** testes axe adicionados para `vehicle_details`, `vehicle_additional_details`, `person_data`, `bonuses_class`, `data_enrichment` (condicional) e `risk_acceptance` (condicional) em `cotacaoFunnel.a11y.spec.ts`. Testes de touch target (WCAG 2.5.5) para steppers e switches em `cotacaoTouch.a11y.spec.ts`.

**Ordem sugerida para o front:** P0 `lead_info` → P0 `plan_selection` → P1 coberturas/assistências → demais etapas conforme axe completar baseline.

---

## Gaps confirmados no QA (dinâmico)

Fonte: [a11y-qa-report.md](../reports/a11y-qa-report.md) · perfis `mobile-chrome`, `mobile-ios`, `tablet`.

### 1. `lead_info` — roles ARIA inválidas 🔴

|                      |                                                                                                                                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Por que importa**  | Leitor de tela pode **ignorar** cabeçalho, stepper, título e campos. Usuário com deficiência visual não entende em qual etapa está nem associa label ao input. Viola **WCAG 4.1.2** (Name, Role, Value). |
| **Quem usa afetado** | VoiceOver, TalkBack, NVDA — também impacta ordem de navegação por teclado.                                                                                                                               |
| **MFE provável**     | `sales-lead-requirements` / design system                                                                                                                                                                |

| Elemento      | Como é hoje ❌                   | Como deveria ser ✅                                                        |
| ------------- | -------------------------------- | -------------------------------------------------------------------------- |
| Cabeçalho     | `<header role="header">`         | `<header>` sem role (landmark nativo)                                      |
| Stepper (×5+) | `<div role="stepper">`           | `<nav aria-label="Progresso da cotação">` com passos `aria-current="step"` |
| Título        | `<h1 role="title">`              | `<h1>` sem role extra                                                      |
| Inputs        | `<input role="input">`           | `<input>` + `<label for="id">` ou `aria-label` — **sem** role inventada    |
| Link WhatsApp | `<a href="wa.me/...">` sem texto | `aria-label="Falar com especialista no WhatsApp"` ou texto visível         |

**Critério de pronto:** axe `lead_info` verde nos 3 perfis mobile/tablet.

---

### 2. `lead_info` — link WhatsApp sem nome 🔴

|                      |                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Por que importa**  | Usuário de teclado tabula para um link **sem saber o destino**. Viola **WCAG 2.4.4** e **4.1.2**.            |
| **Como é hoje**      | Link focável, sem texto, sem `aria-label`, sem `title`.                                                      |
| **Como deveria ser** | Nome acessível claro (ex.: "Falar com especialista no WhatsApp") + ícone `aria-hidden="true"` se decorativo. |

---

### 3. `plan_selection` — Continuar inalcançável por teclado 🔴

|                      |                                                                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Por que importa**  | Usuário que **não usa mouse** (mobilidade reduzida, motor) não consegue avançar após escolher plano. Viola **WCAG 2.1.1** (Keyboard).   |
| **Como é hoje**      | Botão Continuar não recebe foco após 60× Tab (mobile e tablet).                                                                         |
| **Como deveria ser** | Ordem de tab lógica: cards → CTAs → Continuar; foco visível; sem armadilha de foco em overlay. Skip link opcional: "Ir para Continuar". |
| **Nota**             | Teclado OK em `lead_info` e `vehicle_details` — problema **localizado** na tela de planos.                                              |

**Critério de pronto:** `plan_selection — Continuar alcançável por Tab` verde em `@keyboard`.

---

## Gaps por etapa (análise estática + foco)

Análise detalhada por locator: [accessibility-analysis.md](./accessibility-analysis.md).  
Abaixo: síntese **hoje → deveria ser → por quê**.

### `vehicle_details`

| Gap            | Hoje                                   | Deveria ser                       | Por quê                              |
| -------------- | -------------------------------------- | --------------------------------- | ------------------------------------ |
| Switch zero km | XPath no DOM · switch sem label direto | `<label for>` + switch com nome   | WCAG 1.3.1 · toque no mobile (2.5.5) |
| Erro blindado  | Texto visual                           | `role="alert"` + foco na mensagem | SR anuncia bloqueio (3.3.1)          |

### `vehicle_additional_details`

| Gap              | Hoje                   | Deveria ser                          | Por quê                             |
| ---------------- | ---------------------- | ------------------------------------ | ----------------------------------- |
| Sim/Não garagem  | Botões · estado visual | `aria-pressed` ou grupo `radiogroup` | SR sabe qual opção está selecionada |
| Autocomplete CEP | Loading silencioso     | `aria-busy` / live region            | Usuário SR sabe que dados carregam  |

### `person_data`

| Gap          | Hoje                             | Deveria ser                                  | Por quê                          |
| ------------ | -------------------------------- | -------------------------------------------- | -------------------------------- |
| Estado civil | Combobox (implementação incerta) | Padrão ARIA combobox ou `<select>` nativo    | Dropdown custom quebra SR mobile |
| CPF inválido | Texto solto                      | `aria-invalid` + `aria-describedby` no campo | 3.3.1 Error Identification       |

### `plan_selection`

| Gap            | Hoje                   | Deveria ser                     | Por quê                 |
| -------------- | ---------------------- | ------------------------------- | ----------------------- |
| Cards          | CSS class + texto      | `article` + heading do plano    | Navegação por landmarks |
| Loading planos | Texto "montando..."    | `aria-busy="true"` no container | SR não fica em silêncio |
| Tab order      | 🔴 Confirmado quebrado | Ver seção QA acima              | 2.1.1 Keyboard          |

### `coverages_selection` / `assistances_selection`

| Gap           | Hoje                   | Deveria ser                      | Por quê                    |
| ------------- | ---------------------- | -------------------------------- | -------------------------- |
| Toggles       | XPath · switch pequeno | Switch com label · ≥ 44×44px     | 2.5.5 Target Size          |
| Stepper +/-   | Botões sem nome        | `aria-label="Aumentar franquia"` | SR identifica ação         |
| Modais promo  | ALL CAPS "AGORA NÃO"   | Texto sentence case · foco preso | SR lê naturalmente · 2.4.3 |
| Preço lateral | Atualização visual     | `aria-live="polite"`             | SR ouve mudança de preço   |

### `checkout`

| Gap               | Hoje                            | Deveria ser                | Por quê            |
| ----------------- | ------------------------------- | -------------------------- | ------------------ |
| Checkbox e-mail   | Click forçado via JS nos testes | Label nativa clicável      | 2.5.1 · alvo touch |
| Cross-sell CAP-38 | Sem cobertura                   | Cards com nome e contraste | 1.4.3 · 4.1.2      |

### Telas não escaneadas por axe ainda ⚪

`plan_selection`, `coverages_selection`, `assistances_selection`, `checkout` — specs existem; execução serial para na falha de `lead_info`. Após fix P0, re-rodar `npm run test:a11y:sandbox` para completar baseline.

---

## Por que investir em acessibilidade (contexto de negócio)

| Razão                  | Detalhe                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------- |
| **Legal**              | LBI 13.146/2015 (Lei Brasileira de Inclusão) — serviços digitais devem ser acessíveis. |
| **Mercado**            | ~15–20% da população tem alguma deficiência; mobile é canal principal da cotação B2C.  |
| **Qualidade**          | Markup correto melhora SEO, automação E2E e manutenção — não é só "caso edge".         |
| **Risco reputacional** | Funil longo com formulário — abandono alto se SR/teclado falham em etapa inicial.      |

---

## Automação disponível (como validar cada gap)

| Tipo de teste | O que valida                        | Comando                       | Helper                          |
| ------------- | ----------------------------------- | ----------------------------- | ------------------------------- |
| **axe**       | Roles, labels, contraste, links     | `npm run test:a11y:mobile`    | `tests/helpers/a11y.ts`         |
| **Teclado**   | Tab / Enter (WCAG 2.1.1)            | `npm run test:keyboard`       | `tests/helpers/a11yKeyboard.ts` |
| **Toque**     | Tap em controles touch (WCAG 2.5.x) | specs `@a11y` + perfil mobile | `tests/helpers/a11yTouch.ts`    |

### Toque na tela (mobile)

Com perfis `mobile-chrome` / `mobile-ios`, Playwright emula touch (`hasTouch: true`). Dá para **simular tap** em botões, switches e cards — complementa teclado (usuário real em celular usa dedo, não Tab).

```typescript
import { tapControl } from '../../helpers/a11yTouch';

await tapControl(lead.btnContinue);
```

**Limitação:** emula tap no Chrome com viewport mobile — não substitui teste em device físico (Appium) nem gestos complexos (swipe longo).

---

## Próximos passos recomendados

### Front (prioridade)

1. Corrigir P0 em `lead_info` (tabela acima).
2. Corrigir tab order em `plan_selection`.
3. Steppers e switches em coberturas/assistências (P1).

### QA

1. Re-executar sandbox após fix: `npm run test:a11y:sandbox`.
2. Abrir issues Jira com link para este mapa + screenshot axe.
3. Completar axe nas 4 telas restantes quando `lead_info` estiver verde.
4. Opcional: adicionar smoke `@touch` em controles críticos (Continuar, switches).

### App nativo

Fluxos instalados no aparelho → **Appium** (fora deste repo). Este mapa cobre apenas **web cotacao** em viewport mobile.

---

## Relacionados

- [Análise por etapa (detalhada)](./accessibility-analysis.md)
- [Relatório axe QA](../reports/a11y-qa-report.md)
- [Sandbox mobile/tablet](./a11y-device-sandbox.md)
