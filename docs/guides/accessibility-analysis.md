# Análise de Acessibilidade — Cotação Seguro Auto

> **Perspectiva:** analista de testes / automação · **Público-alvo do produto:** mobile e tablet (prioridade)  
> **Mapa consolidado (gaps · foco · hoje vs deveria ser):** [a11y-gap-map.md](./a11y-gap-map.md)  
> **Evidência QA (axe):** [a11y-qa-report.md](../reports/a11y-qa-report.md)

---

## Resumo executivo

| Dimensão                     | Situação atual                                                | Risco para mobile/tablet                         |
| ---------------------------- | ------------------------------------------------------------- | ------------------------------------------------ |
| **Automação funcional E2E**  | 79% cobertura ponderada · P0/P1 100%                          | Boa cobertura de negócio, não de a11y            |
| **Testes de acessibilidade** | ✅ axe (`@a11y`) + teclado (`@keyboard`) · SR manual pendente | Cobertura automática parcial                     |
| **Viewport nos testes**      | **Mobile + tablet** (`mobile-chrome`, `tablet`) + desktop E2E | Projetos a11y sempre com navegador visível       |
| **Estratégia de locators**   | ✅ Preferência por `getByRole` nos formulários                | ⚠️ XPath/CSS em toggles, cards e steppers        |
| **WCAG alvo recomendado**    | **2.2 nível AA** (Brasil: referência LBI 13.146/2015)         | Foco WCAG 2.5.x (alvo/toque) e 1.4.x (contraste) |

**Conclusão:** a automação **indiretamente favorece** acessibilidade ao usar roles e nomes acessíveis, mas **não substitui** auditoria WCAG nem validação em viewports móveis. Camada dedicada: sandbox a11y (web + viewport) · Appium (app nativo).

---

## Referências normativas

| Norma / guia                                 | Aplicação neste funil                                |
| -------------------------------------------- | ---------------------------------------------------- |
| [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) | Critérios mínimos recomendados                       |
| **1.3.1** Info and Relationships             | Labels, headings, switches com `role`/`aria-checked` |
| **1.4.3** Contrast (Minimum)                 | Texto em cards de plano, preço lateral, modais       |
| **1.4.4** Resize Text                        | Zoom 200% sem perda de funcionalidade (mobile)       |
| **1.4.10** Reflow                            | Layout mobile sem scroll horizontal em 320px         |
| **2.1.1** Keyboard                           | Todo fluxo operável sem mouse                        |
| **2.4.3** Focus Order                        | Ordem lógica em formulários multi-etapa              |
| **2.4.7** Focus Visible                      | Botões Sim/Não, Continuar, toggles                   |
| **2.5.1** Pointer Gestures                   | Steppers franquia/indenização — alvos ≥ 44×44px      |
| **2.5.5** Target Size (AA)                   | Botões e switches em telas touch                     |
| **3.3.1** Error Identification               | CPF/placa restritos, campos obrigatórios             |
| **4.1.2** Name, Role, Value                  | Switches, radios, combobox estado civil              |

---

## Contexto mobile-first

### Por que mobile/tablet primeiro?

- Usuários de cotação B2C Youse concentram-se em **smartphone** (formulários longos, toggles, modais).
- Tablet compartilha padrões touch (alvo de toque, reflow, teclado virtual).
- A suite atual roda **desktop maximizado** — bugs de viewport estreito, teclado virtual sobrepondo CTA e modais off-screen **não são detectados**.

### Configuração Playwright (sandbox a11y)

Projetos de emulação em `playwright.a11y.config.ts` + `tests/config/a11yDevices.ts`:

| Projeto         | Device                 | Objetivo                        |
| --------------- | ---------------------- | ------------------------------- |
| `chromium`      | Desktop Chrome (atual) | Regressão funcional             |
| `mobile-chrome` | Pixel 5                | Celular Android · axe + teclado |
| `mobile-ios`    | iPhone 13              | Celular iOS · layout estreito   |
| `tablet`        | iPad (gen 7)           | Tablet · plan selection         |

Guia completo: [a11y-device-sandbox.md](./a11y-device-sandbox.md) (emulação ≠ device real; quando usar cada um).

---

## Análise por etapa do funil

Legenda: ✅ atende convenção de teste · ⚠️ risco a11y · ❌ gap conhecido

### 1. `lead_info` — Dados de contato

| Elemento              | Locator automação                  | A11y observada      | Mobile/tablet                                         |
| --------------------- | ---------------------------------- | ------------------- | ----------------------------------------------------- |
| Nome                  | `textbox` "Nome completo\*"        | ✅ Nome acessível   | Teclado texto OK                                      |
| E-mail                | `textbox` "E-mail\*"               | ✅                  | Teclado `email` — validar `inputmode`/`type`          |
| Telefone              | `textbox` "Telefone com DDD\*"     | ✅                  | Teclado numérico — validar máscara + SR               |
| Continuar             | `button` "Continuar" `exact: true` | ✅                  | CTA fixo no rodapé? Verificar reflow                  |
| Validação obrigatória | —                                  | ❌ CAP-02 sem teste | Mensagens `aria-live` / associação `aria-describedby` |

**Melhorias sugeridas**

- Teste E2E: submit vazio → foco no primeiro erro.
- Scan axe: labels, contraste, landmarks (`main`, `form`).

---

### 2. `vehicle_details` — Veículo

| Elemento           | Locator automação                      | A11y observada                                   | Mobile/tablet                          |
| ------------------ | -------------------------------------- | ------------------------------------------------ | -------------------------------------- |
| Placa              | `textbox` "Placa do carro\*"           | ✅                                               | Teclado alfanumérico                   |
| Zero km / Blindado | XPath → `role=switch` + `aria-checked` | ⚠️ Switch encontrado via XPath, não label direto | Alvo touch no switch vs label clicável |
| Modal zero km      | `button` "Entendi, continuar cotação"  | ✅                                               | Trap focus no modal                    |
| Bloqueio blindado  | `getByText(/blindado/i)`               | ⚠️ Erro por texto — validar `role=alert`         | Banner visível acima do fold           |

**Melhorias sugeridas**

- Front: `<label for>` explícito ligado ao switch (eliminar XPath nos testes).
- Teste teclado: `Space`/`Enter` alterna switch; foco visível.
- Mobile: switch e texto "O carro é zero Km?" na mesma área de toque ≥ 44px.

---

### 3. `vehicle_additional_details` — Endereço e uso

| Elemento        | Locator automação              | A11y observada       | Mobile/tablet                                          |
| --------------- | ------------------------------ | -------------------- | ------------------------------------------------------ |
| CEP / Número    | `textbox` com name             | ✅                   | Autocomplete CEP — anunciar loading                    |
| Garagem Sim/Não | `button` Sim/Não `exact: true` | ✅ (fix strict mode) | Par de botões — estado selecionado via `aria-pressed`? |
| Uso do veículo  | `radio` por nome               | ✅ Padrão correto    | Lista longa — scroll + foco                            |

**Melhorias sugeridas**

- Verificar se botões Sim/Não expõem estado selecionado para leitor de tela (`aria-pressed` ou `radio` group).
- Teste axe em grupo de radios (nome do fieldset/legend).

---

### 4. `person_data` — CPF e estado civil

| Elemento     | Locator automação           | A11y observada             | Mobile/tablet                                     |
| ------------ | --------------------------- | -------------------------- | ------------------------------------------------- |
| CPF          | `textbox` "CPF do segurado" | ✅                         | Teclado numérico                                  |
| Estado civil | `combobox` + `selectOption` | ⚠️ Combobox nativo/custom? | Dropdown custom frequentemente falha em SR mobile |
| CPF restrito | `getByText` regex           | ⚠️                         | Erro deve ser anunciado (`aria-live=assertive`)   |

**Melhorias sugeridas**

- Inspecionar implementação do combobox (ARIA combobox pattern vs `<select>` nativo).
- Teste: CPF inválido → mensagem ligada ao campo via `aria-invalid` + `aria-describedby`.

---

### 5. `bonuses_class` — Classe de bônus

| Elemento    | Locator automação            | A11y observada              | Mobile/tablet                     |
| ----------- | ---------------------------- | --------------------------- | --------------------------------- |
| Sim / Não   | `button` exact               | ✅                          | —                                 |
| WhatsApp    | `button` "Chame no whatsapp" | ✅                          | Link externo — `aria-label` claro |
| Modal bônus | `heading` + botões           | ✅                          | Focus trap + Esc fecha?           |
| Classe 1–10 | `getByText` exact            | ⚠️ Lista clicável por texto | Preferir `radio` ou `option`      |

---

### 6. `data_enrichment` — Enriquecimento _(sem POM)_

| Situação                                      | Impacto                                   |
| --------------------------------------------- | ----------------------------------------- |
| Section existe no front · fluxo QA pode pular | CAP-17 **missing**                        |
| Sem Page Object                               | Automação e a11y não cobrem campos extras |

**Melhorias:** mapear campos quando estável no QA; incluir no smoke mobile.

---

### 7. `plan_selection` — Planos

| Elemento       | Locator automação                        | A11y observada                  | Mobile/tablet                            |
| -------------- | ---------------------------------------- | ------------------------------- | ---------------------------------------- |
| Cards de plano | CSS `[class*="plan"]` + texto            | ❌ Frágil e sem semântica clara | Cards empilhados — scroll, preço visível |
| Quero esse     | `button` /quero esse/i                   | ✅                              | CTA por card — ordem de foco             |
| Personalizar   | `getByTestId('plan-card-button-custom')` | ⚠️ Único testid do funil        | OK se estável; documentar no front       |
| Loading        | `getByText('estamos montando...')`       | ⚠️                              | `aria-busy` / live region para SR        |

**Melhorias sugeridas**

- Front: cards como `<article>` ou `role="group"` com heading do plano.
- Mobile: comparar preço mensal/anual sem horizontal scroll.
- Teste: navegação por teclado entre 4 cards + ativar plano.

---

### 8. `coverages_selection` — Coberturas

| Elemento               | Locator automação                     | A11y observada                      | Mobile/tablet                               |
| ---------------------- | ------------------------------------- | ----------------------------------- | ------------------------------------------- |
| Heading                | `heading` level                       | ✅                                  | Hierarquia h1 único por tela                |
| Toggles cobertura      | XPath row → `switch` + `aria-checked` | ⚠️                                  | Switch pequeno em mobile                    |
| Franquia / Indenização | Texto + `button` irmão (stepper)      | ❌ Stepper sem nome acessível claro | Botões +/- — **2.5.5 Target Size** crítico  |
| Preço lateral          | `p` com regex R$                      | ⚠️                                  | Preço deve atualizar com `aria-live=polite` |

**Melhorias sugeridas**

- Stepper: `aria-label="Aumentar franquia"` / `Diminuir franquia`.
- Cobertura desabilitada: `aria-disabled` + tooltip acessível (não só `isDisabled()` visual).
- Scan mobile: painel de preço sticky não cobre toggles.

---

### 9. `assistances_selection` — Assistências

| Elemento    | Locator automação         | A11y observada                     | Mobile/tablet                               |
| ----------- | ------------------------- | ---------------------------------- | ------------------------------------------- |
| Toggles     | XPath + `switch`          | ⚠️ Mesmo padrão coberturas         | Combo modal em tela pequena                 |
| Modal promo | `button` "AGORA NÃO"      | ⚠️ ALL CAPS — SR lê letra a letra? | Botão primário/secundário claro             |
| Modal combo | regex confirmar/agora não | ⚠️                                 | Focus trap                                  |
| RPS promo   | texto + selo              | ⚠️ Info só visual                  | Texto alternativo no selo "por nossa conta" |

**Melhorias sugeridas**

- Dependências combo (guincho → dependentes): se UI não desabilita, SR user não recebe pista — alinhar produto + `aria-disabled`.
- Teste axe em modais empilhados (promo + combo).

---

### 10. `risk_acceptance` — Aceite de risco _(sem POM)_

CAP-35 **missing** — perfis específicos. Validar checkbox/termos legais com foco e contraste quando mapeado.

---

### 11. `checkout` — Pagamento

| Elemento               | Locator automação           | A11y observada          | Mobile/tablet                            |
| ---------------------- | --------------------------- | ----------------------- | ---------------------------------------- |
| Campos cartão          | iframe + `textbox` por name | ✅ Dentro do gateway    | iframe + teclado — teste real device     |
| Checkbox e-mail        | `checkbox` + evaluate click | ⚠️ Click forçado via JS | Preferir click nativo; label clicável    |
| Finalizar              | `button` /^Finalizar$/      | ✅                      | CTA principal visível com teclado aberto |
| Accordion assistências | `button` /assistências/i    | ✅ Padrão accordion     | Expandir/colapsar anuncia estado         |
| Cross-sell             | CAP-38 missing              | ❌                      | Cards upsell — contraste e foco          |

---

### 12. `issuance` / sucesso

| Elemento              | Locator automação                      | A11y observada | Mobile/tablet                        |
| --------------------- | -------------------------------------- | -------------- | ------------------------------------ |
| Sucesso               | textos + tags                          | ⚠️             | `role=status` para confirmação       |
| Erro pagamento        | `getByText('Alguma coisa deu errada')` | ⚠️             | Mensagem acionável + foco no erro    |
| Redirect youse.com.br | URL assert                             | —              | Validar landing mobile pós-pagamento |

---

## Matriz: automação vs acessibilidade

| Prática                | Repo hoje        | Recomendado                                                        |
| ---------------------- | ---------------- | ------------------------------------------------------------------ |
| `@axe-core/playwright` | ✅ Smoke `@a11y` | 5 telas · serious/critical = fail                                  |
| Navegação teclado      | ✅               | `@keyboard` — `npm run test:keyboard`                              |
| Screen reader manual   | ❌               | Checklist VoiceOver/TalkBack pré-release                           |
| Viewport mobile CI     | ✅               | Projetos `mobile-chrome` + `tablet` em `playwright.a11y.config.ts` |
| Contraste automático   | ❌               | axe + amostragem manual                                            |
| Locators a11y-first    | ✅ Parcial       | Eliminar XPath onde possível                                       |
| ESLint jsx-a11y        | ❌               | N/A (front React — responsabilidade sales-frontend)                |

---

## Roadmap de melhorias (priorizado)

### P0 — Quick wins (1–2 sprints)

1. ~~**Projeto Playwright mobile**~~ ✅ `mobile-chrome` + `tablet` no config.
2. ~~**Pacote `@axe-core/playwright`**~~ ✅ `tests/spec/a11y/cotacaoFunnel.a11y.spec.ts`.
3. ~~**Tag `@a11y`**~~ ✅ `npm run test:a11y`.

### P1 — Cobertura sustentável

4. ~~Testes teclado: completar funil sem mouse~~ ✅ `tests/spec/a11y/cotacaoKeyboard.a11y.spec.ts` (`npm run test:keyboard`).
5. Assert `aria-live` no painel de preço (personalização).
6. CAP-02: campos obrigatórios + foco no erro.
7. Documentar no front: testids estáveis para cards (`plan-card-{slug}`).

### P2 — Maturidade

8. Baseline axe por release (artifact JSON no CI).
9. Testes manuais SR trimestrais (roteiro por etapa).
10. Paridade tablet na seleção de planos (layout 2 colunas).

---

## Implementação atual (automação)

| Artefato               | Caminho                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------- |
| Helper axe             | `tests/helpers/a11y.ts`                                                                 |
| Helper teclado         | `tests/helpers/a11yKeyboard.ts`                                                         |
| Helper toque (mobile)  | `tests/helpers/a11yTouch.ts`                                                            |
| Smoke axe por etapa    | `tests/spec/a11y/cotacaoFunnel.a11y.spec.ts`                                            |
| Smoke teclado          | `tests/spec/a11y/cotacaoKeyboard.a11y.spec.ts`                                          |
| Projetos mobile/tablet | `playwright.a11y.config.ts` · `tests/config/a11yDevices.ts`                             |
| Comandos               | `npm run test:a11y:sandbox` · `test:a11y:mobile` · `test:a11y:tablet` · `test:keyboard` |

Telas escaneadas: `lead_info` → `plan_selection` → `coverages_selection` → `assistances_selection` → `checkout`.

```bash
# VPN ativa · ~15–25 min (5 testes × 2 viewports, serial)
npm run test:a11y

# Só mobile
npx playwright test --grep @a11y --project=mobile-chrome --reporter=list
```

Critério de falha: violações axe **serious** ou **critical** (WCAG 2.x AA tags).

---

## Relacionados

- [Mapa de fluxos e cobertura](./fluxos-cotacao-auto.md)
- [Cobertura funcional](../coverage/README.md)
- [Troubleshooting — seletores](./troubleshooting.md#strict-mode-violation--seletor-resolve-para-2-elementos)
- [README — Arquitetura de seletores](../../README.md)
