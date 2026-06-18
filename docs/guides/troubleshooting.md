# Guia de Troubleshooting

Problemas recorrentes ao rodar ou manter a suite E2E/API — causas, sintomas e correções.

> **Implementação de referência:** `tests/helpers/funnel.ts` (`resetSession`), Page Objects em `tests/pages/quotation/`.

---

## Índice rápido

| Sintoma                                     | Seção                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| `authorizationToken is required`            | [Zephyr não configurado](#zephyr-api_token-não-configurado)                    |
| Timeout na placa na **2ª cotação**          | [Sessão entre cotações](#sessão-não-resetada-entre-cotações)                   |
| `strict mode violation` (2 elementos)       | [Seletores ambíguos](#strict-mode-violation--seletor-resolve-para-2-elementos) |
| Plano "Auto 1504" não encontrado            | [Nome do plano no DOM](#plano-auto-1504-não-encontrado-no-card)                |
| `Cannot find module 'asynckit/lib/iterate'` | [Dependência corrompida](#asynckit-corrompido)                                 |

---

## Configuração e ambiente

### `ZEPHYR_API_TOKEN` não configurado

```
Error: authorizationToken is required
```

O reporter Zephyr Scale exige token do Jira. Em execução local, pule-o:

```bash
npx playwright test --reporter=list
```

Ou deixe `ZEPHYR_API_TOKEN` vazio no `.env` e use sempre `--reporter=list` localmente.

---

## Seletores Playwright

### Strict mode violation — seletor resolve para 2 elementos

```
Error: locator.click: Error: strict mode violation:
getByRole('button', { name: 'Não' }) resolved to 2 elements
```

**Causa:** `getByRole` / `getByText` sem `exact: true` faz **substring match**. O botão "Não" também casa com "Não sei o CEP", "Não tenho garagem", etc.

**Solução:** use `{ exact: true }` em rótulos curtos ou genéricos:

```ts
this.overnightGarageNo = this.page.getByRole('button', { name: 'Não', exact: true });
this.continueBtn = this.page.getByRole('button', { name: 'Continuar', exact: true });
```

**Regra do projeto:** preferir `getByRole`, `getByLabel` e `data-testid`; evitar XPath/CSS frágil. Ver checklist em [`.github/pull_request_template.md`](../../.github/pull_request_template.md).

---

## Sessão entre cotações

### Sessão não resetada entre cotações

Vários specs comparam preços em **duas cotações seguidas** (ex.: zero km vs usado, garagem sim/não). Se a segunda falhar, o sintoma mais comum é:

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log: waiting for getByRole('textbox', { name: 'Placa do carro*' })
```

Ou: a primeira cotação passa e a segunda trava em etapa errada do funil.

**Causa:** o app QA persiste o ID do pedido em `localStorage`. Sem limpar a sessão, a URL reabre no meio do funil. Se `localStorage.clear()` rodar **depois** de `goto('about:blank')`, o `evaluate` executa em origem nula e **não limpa** o storage real do domínio Youse.

**Solução:** use `resetSession(page)` de `tests/helpers/funnel.ts` **entre cotações**:

```ts
import { resetSession, navigateToPlans } from '../../helpers/funnel';

const planosA = await navigateToPlans(page, { garage: true });
// ... asserções ...

await resetSession(page);

const planosB = await navigateToPlans(page, { garage: false });
```

**Ordem correta** (já implementada em `resetSession`):

1. `localStorage.clear()` + `sessionStorage.clear()` — **ainda no domínio do app**
2. `clearCookies()`
3. `goto('about:blank')`

```ts
// ❌ Errado — storage do app não é limpo
await page.goto('about:blank');
await page.evaluate(() => localStorage.clear());

// ✅ Certo — helper resetSession
await resetSession(page);
```

---

## Page Objects

### Plano "Auto 1504" não encontrado no card

**Causa:** o texto visível no DOM é `"Plano auto personalizado 1504"`, não `"Auto 1504"`.

**Solução:** use `planCard()` do `PlanSelectionPage`, que gera regex flexível entre palavras:

```ts
// Regex gerada internamente: /Auto.*1504/i
planSelectionPage.planCard('Auto 1504');
```

Não busque o texto literal `"Auto 1504"` com `getByText` sem regex.

---

## Dependências

### asynckit corrompido

```
Cannot find module 'asynckit/lib/iterate'
```

Instalação incompleta ou cache corrompido no Windows.

**Solução:**

```bash
# PowerShell
Remove-Item -Recurse -Force node_modules\asynckit
npm install
```

Se persistir, reinstale `node_modules` inteiro:

```bash
Remove-Item -Recurse -Force node_modules
npm install
npx playwright install chromium
```

---

## Ainda com problema?

1. Rode com trace: `npx playwright test caminho/do/spec --trace on`
2. Confirme **VPN Youse** ativa para ambientes QA/staging
3. Use `--reporter=list` para isolar falhas do reporter Zephyr
4. Abra issue ou PR com o log + screenshot do trace
