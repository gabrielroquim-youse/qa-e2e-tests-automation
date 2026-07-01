# A11y — Acessibilidade web (WCAG · teclado · touch)

Testes automatizados de acessibilidade do funil de cotação auto em viewports **mobile e tablet**.  
Rodam no sandbox a11y — `playwright.a11y.config.ts` — com perfis `mobile-chrome`, `mobile-ios` e `tablet`.

**Tags:** `@a11y` · `@keyboard` · `@quotation_auto`  
**Config:** [`playwright.a11y.config.ts`](../../../playwright.a11y.config.ts)  
**Guias:** [`docs/guides/a11y-device-sandbox.md`](../../../docs/guides/a11y-device-sandbox.md) · [`docs/guides/a11y-gap-map.md`](../../../docs/guides/a11y-gap-map.md)

## Specs

| Arquivo                                                        | O que valida                                                      | WCAG           | Tag         |
| -------------------------------------------------------------- | ----------------------------------------------------------------- | -------------- | ----------- | --- | -------------------------------------------------------------- | --------------------------------------------------------- | ----- | ------- |
| [`cotacaoFunnel.a11y.spec.ts`](cotacaoFunnel.a11y.spec.ts)     | Scan **axe** em cada etapa do funil (serious/critical)            | 2.0/2.1/2.2 AA | `@a11y`     |
| [`cotacaoKeyboard.a11y.spec.ts`](cotacaoKeyboard.a11y.spec.ts) | Navegação por **teclado** (Tab/Enter) nas telas críticas          | 2.1.1 · 2.4.3  | `@keyboard` |
| [`cotacaoTouch.a11y.spec.ts`](cotacaoTouch.a11y.spec.ts)       | **Tamanho mínimo de alvo touch** (≥ 44×44px) em steppers/switches | 2.5.5          | `@a11y`     |     | [`cotacaoDarkMode.a11y.spec.ts`](cotacaoDarkMode.a11y.spec.ts) | Contraste em **dark mode** (`prefers-color-scheme: dark`) | 1.4.3 | `@a11y` |

## Cobertura por etapa do funil

| Etapa                        |      axe scan      | Teclado |     Touch (2.5.5)      |
| ---------------------------- | :----------------: | :-----: | :--------------------: |
| `lead_info`                  |         ✅         |   ✅    |           —            |
| `vehicle_details`            |         ✅         |   ✅    |           —            |
| `vehicle_additional_details` |         ✅         |    —    |           —            |
| `person_data`                |         ✅         |    —    |           —            |
| `data_enrichment`            | ✅ _(condicional)_ |    —    |           —            |
| `bonuses_class`              |         ✅         |    —    |           —            |
| `plan_selection`             |         ✅         |  ✅ ×2  |           —            |
| `coverages_selection`        |         ✅         |    —    | ✅ (steppers + switch) |
| `assistances_selection`      |         ✅         |    —    |      ✅ (switch)       |
| `risk_acceptance`            | ✅ _(condicional)_ |    —    |           —            |
| `checkout`                   |         ✅         |    —    |           —            |

_Condicional = `test.skip` quando a etapa não aparece nessa execução (CPF/perfil sem gatilho)._

## Perfis de dispositivo (sandbox a11y)

| Projeto Playwright | Viewport | Orientação    | Por que existe                                              |
| ------------------ | -------- | ------------- | ----------------------------------------------------------- |
| `desktop`          | 1280×800 | —             | Baseline desktop                                            |
| `tablet`           | 810×1080 | Portrait      | Tablet em pé (mais comum)                                   |
| `tablet-landscape` | 1080×810 | **Landscape** | WCAG 1.3.4 — conteúdo não pode ser bloqueado por orientação |

> Celular (Android/iOS) é coberto pelo `qa-mobile-tests-automation` via Appium. Os perfis `mobile-chrome` e `mobile-ios` existem neste config apenas como referência.

```bash
# Sandbox completo — 3 perfis × specs @a11y + @keyboard
npm run test:a11y

# Só axe (funil + touch)
npx playwright test -c playwright.a11y.config.ts --grep "@a11y" --reporter=list

# Só teclado
npm run test:keyboard

# Spec individual em um perfil
npx playwright test -c playwright.a11y.config.ts tests/spec/a11y/cotacaoFunnel.a11y.spec.ts --project=mobile-chrome --reporter=list
```

**Pré-requisito:** VPN Youse + `BASE_URL` apontando para QA.  
Navegador sempre **visível** (`headless: false`) neste config — facilita inspecionar foco e layout.

## Gaps conhecidos e próximos passos

Ver [docs/guides/a11y-gap-map.md](../../../docs/guides/a11y-gap-map.md) para lista completa com prioridade (P0/P1/P2).

| Prioridade | Gap                                      | Status                                         |
| ---------- | ---------------------------------------- | ---------------------------------------------- |
| **P0**     | `lead_info` — roles ARIA inválidas       | 🔴 confirmado no QA — correção no front        |
| **P0**     | `plan_selection` — Continuar inacessível | 🔴 confirmado no QA — correção no front        |
| **P1**     | Steppers franquia/indenização (2.5.5)    | 🟠 teste adicionado → resultado em `test:a11y` |
| **P1**     | Switches coberturas/assistências (2.5.5) | 🟠 teste adicionado → resultado em `test:a11y` |
| **P2**     | CAP-02 validação de formulário — a11y    | ⚪ sem teste automatizado ainda                |
