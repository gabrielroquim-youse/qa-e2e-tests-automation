# Sandbox A11y — mapear acessibilidade em viewport mobile/tablet

> **Objetivo:** auditar **WCAG** (axe + teclado) do funil **web** em viewports de celular e tablet — **mapear gaps por categoria de dispositivo**, não expandir E2E mobile.  
> **Config:** `playwright.a11y.config.ts` · **Perfis:** `tests/config/a11yDevices.ts`

---

## Escopo: o que é isto (e o que não é)

| Camada                                 | Ferramenta            | Responsabilidade                                            |
| -------------------------------------- | --------------------- | ----------------------------------------------------------- |
| **E2E funcional mobile (app nativo)**  | **Appium**            | Fluxos no app instalado · gestos · push · deep link         |
| **E2E funcional web**                  | Playwright `chromium` | Regressão desktop do funil QA                               |
| **A11y web em viewport mobile/tablet** | **Este sandbox**      | axe + Tab/Enter · mapear violações **por perfil de device** |

**Não vamos expandir** aqui a suíte funcional mobile — os perfis `mobile-chrome`, `mobile-ios` e `tablet` existem só para responder:

> _“Esta tela web, vista como celular Android / iPhone / tablet, tem problemas de acessibilidade?”_

O mapeamento alimenta issues no front (`sales-*`) e o [**mapa de gaps**](./a11y-gap-map.md). Appium cobre acessibilidade/fluxo do **app nativo** quando existir.

---

## Emulação é igual a device real?

**Não 100%** — mas para automação WCAG cobre a maior parte do que importa no funil Youse.

| Aspecto                                 | Emulação Playwright | Device / browser real |
| --------------------------------------- | ------------------- | --------------------- |
| Viewport e reflow (320–810px)           | ✅                  | ✅                    |
| Touch (`hasTouch`, alvos pequenos)      | ✅ parcial          | ✅                    |
| User-Agent mobile/tablet                | ✅                  | ✅                    |
| Scan **axe** (roles, contraste, labels) | ✅                  | ✅                    |
| Navegação **Tab / Enter**               | ✅                  | ✅                    |
| Motor Safari iOS vs Chrome Android      | ⚠️ local = Chrome   | ✅                    |
| **VoiceOver** / **TalkBack**            | ❌                  | ✅ manual             |
| Teclado virtual sobrepondo CTA          | ❌                  | ✅ manual             |
| Performance em aparelho fraco           | ❌                  | ✅                    |

**Regra prática:** use o sandbox para **mapear e regressão a11y web** por viewport; Appium para **app nativo**; SR manual pontual nos fluxos P0.

---

## Perfis disponíveis

| Projeto `--project` | Categoria mapeada    | Viewport | Para que serve (a11y)             |
| ------------------- | -------------------- | -------- | --------------------------------- |
| `mobile-chrome`     | Celular Android      | 393×851  | Reflow estreito · touch · axe     |
| `mobile-ios`        | Celular iOS (layout) | 390×844  | Mesmo funil · viewport iPhone     |
| `tablet`            | Tablet               | 810×1080 | Planos/coberturas em layout largo |

**Local (Windows):** perfis iOS/iPad rodam com **Chrome + viewport/UA do device** (evita instalar WebKit).  
**CI:** iOS/iPad usam **WebKit real** quando `CI=true`.

Navegador sempre **visível** (`headless: false`) — facilita inspecionar foco e layout.

---

## Comandos

Pré-requisito: **VPN Youse** + QA acessível.

```bash
# Sandbox completo — 3 perfis × specs @a11y / @keyboard
npm run test:a11y:sandbox

# Atalhos
npm run test:a11y              # alias do sandbox completo
npm run test:a11y:mobile       # só celular (Android + iOS)
npm run test:a11y:tablet       # só tablet
npm run test:keyboard          # teclado nos 3 perfis

# Um perfil específico
npx playwright test -c playwright.a11y.config.ts --grep @a11y --project=mobile-ios --reporter=list
```

Relatório HTML: `playwright-report/a11y/` (após execução local).

---

## Visualizar moldura do celular (DevTools)

O Playwright emula viewport e touch, mas a janela do Chrome abre **sem** bezel do aparelho. Para ver a página **dentro de um iPhone ou Android** enquanto o teste roda:

1. Inicie o sandbox (navegador visível):

   ```bash
   npm run test:a11y:mobile
   ```

2. Com o Chrome aberto no QA, pressione **F12** (DevTools).
3. Ative o **modo dispositivo**: **Ctrl+Shift+M** (Windows) ou ícone 📱 na barra do DevTools.
4. No topo, escolha o device alinhado ao perfil do teste:

   | Perfil Playwright | Device no DevTools |
   | ----------------- | ------------------ |
   | `mobile-chrome`   | Pixel 5            |
   | `mobile-ios`      | iPhone 13          |
   | `tablet`          | iPad               |

5. Clique no menu **⋮** (três pontos) da barra de emulação → marque **Show device frame** (_Mostrar moldura do dispositivo_).

A moldura aparece em volta da página — útil para inspecionar layout, foco do Tab e sobreposição de elementos.

> **Limitações:** passo manual (Playwright não liga a moldura sozinho); localmente iOS/iPad ainda usam Chrome por baixo — a moldura é visual, não vira Safari real. Screenshots de falha do Playwright continuam retangulares (sem bezel).

---

## O que o sandbox **não** faz

- **Não substitui Appium** — app nativo e E2E mobile funcional ficam fora deste repo.
- Não expande cobertura funcional em viewport mobile (só specs `@a11y` / `@keyboard`).
- Não substitui auditoria no app React (`eslint-plugin-jsx-a11y` no front).
- Não simula VoiceOver/TalkBack (mapeamento axe/teclado na **web** em viewport mobile).
- Não grava vídeo (desligado para evitar dependência de ffmpeg local).

---

## Arquitetura

```
playwright.a11y.config.ts     ← entry do sandbox
tests/config/a11yDevices.ts   ← perfis + factory de projetos
tests/spec/a11y/*.spec.ts     ← specs axe, teclado e touch
tests/helpers/a11y.ts         ← axe WCAG (expectNoAccessibilityViolations)
tests/helpers/a11yKeyboard.ts ← Tab / Enter (tabUntilFocused, activateFocused)
tests/helpers/a11yTouch.ts    ← touch targets WCAG 2.5.5 (expectMinTouchTarget)
```

### Specs disponíveis

| Spec                                           | O que valida                             | Tag         |
| ---------------------------------------------- | ---------------------------------------- | ----------- |
| `tests/spec/a11y/cotacaoFunnel.a11y.spec.ts`   | axe em todas as etapas do funil          | `@a11y`     |
| `tests/spec/a11y/cotacaoKeyboard.a11y.spec.ts` | Navegação por teclado (Tab/Enter)        | `@keyboard` |
| `tests/spec/a11y/cotacaoTouch.a11y.spec.ts`    | Tamanho mínimo de alvo touch (≥ 44×44px) | `@a11y`     |

Documentação completa dos specs: [`tests/spec/a11y/README.md`](../../tests/spec/a11y/README.md)

O `playwright.config.ts` principal **reutiliza** os mesmos perfis para manter paridade.

---

## Relacionados

- [Análise WCAG por etapa](./accessibility-analysis.md)
- [Relatório axe QA](../reports/a11y-qa-report.md)
- [Mapa de fluxos](./fluxos-cotacao-auto.md)
