# Sandbox A11y — emulação mobile e tablet

> **Objetivo:** rodar axe + teclado em viewports de **celular** e **tablet** sem hardware físico.  
> **Config:** `playwright.a11y.config.ts` · **Perfis:** `tests/config/a11yDevices.ts`

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

**Regra prática:** use o sandbox para **regressão contínua** (violations axe, tab order); complemente com **1 sessão manual/SR** por release nos fluxos P0.

---

## Perfis disponíveis

| Projeto `--project` | Dispositivo emulado      | Viewport | Uso                           |
| ------------------- | ------------------------ | -------- | ----------------------------- |
| `mobile-chrome`     | Pixel 5 · Android Chrome | 393×851  | Celular Android (padrão)      |
| `mobile-ios`        | iPhone 13 · viewport iOS | 390×844  | Celular iOS (layout estreito) |
| `tablet`            | iPad 7ª gen              | 810×1080 | Tablet · planos em 2 colunas  |

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

## O que o sandbox **não** faz

- Não roda testes funcionais desktop (`chromium` do `playwright.config.ts` principal).
- Não substitui auditoria no app React (`eslint-plugin-jsx-a11y` no front).
- Não grava vídeo (desligado para evitar dependência de ffmpeg local).

---

## Arquitetura

```
playwright.a11y.config.ts     ← entry do sandbox
tests/config/a11yDevices.ts   ← perfis + factory de projetos
tests/spec/a11y/*.spec.ts     ← specs axe e teclado
tests/helpers/a11y.ts         ← axe WCAG
tests/helpers/a11yKeyboard.ts ← Tab / Enter
```

O `playwright.config.ts` principal **reutiliza** os mesmos perfis para manter paridade.

---

## Relacionados

- [Análise WCAG por etapa](./accessibility-analysis.md)
- [Relatório axe QA](../reports/a11y-qa-report.md)
- [Mapa de fluxos](./fluxos-cotacao-auto.md)
