# Planner — Validação de Campos (Funil Formulário 1–5)

> **CAP-02** · Fluxo **N4** em [`fluxos-cotacao-auto.md`](../guides/fluxos-cotacao-auto.md)  
> **Pirâmide:** regras de negócio/preço → API (`qa-api-tests-automation`); **este planner** cobre só UX do formulário web.  
> **Agentes Playwright:** `npx playwright init-agents` → _"Gere os testes a partir de docs/planners/planner-validacao-campos.md"_

## Application Overview

Funil de cotação Seguro Auto B2C — **Passos 1 a 5** antes da seleção de planos.

| #   | Section (URL)        | Page Object                    | Spec destino                                   |
| --- | -------------------- | ------------------------------ | ---------------------------------------------- |
| 1   | `lead_info`          | `LeadInfoPage`                 | `tests/spec/e2e/ux/lead-info.spec.ts`          |
| 2   | `vehicle_details`    | `VehicleDetailsPage`           | `tests/spec/e2e/ux/vehicle-details.spec.ts`    |
| 3   | `vehicle_additional` | `VehicleAdditionalDetailsPage` | `tests/spec/e2e/ux/vehicle-additional.spec.ts` |
| 4   | `person_data`        | `PersonDataPage`               | `tests/spec/e2e/ux/person-data.spec.ts`        |
| 5   | `bonuses_class`      | `BonusesClassPage`             | `tests/spec/e2e/ux/bonuses-class.spec.ts`      |

**Seed / fixture:** `tests/fixtures/setupQuotation.ts` (`quotationData`, Page Objects)  
**Navegação parcial:** `tests/helpers/funnel.ts` (`navigateToVehicleDetails`, …)  
**Asserts compartilhados:** `tests/helpers/formValidation.ts`

### Comportamento de validação (QA — explorado jun/2026)

| Etapa | Mecanismo principal                           | Mensagem inline típica                         |
| ----- | --------------------------------------------- | ---------------------------------------------- |
| 1     | `Continuar` **desabilitado** + `aria-invalid` | E-mail: _"Por favor, digite um e-mail válido"_ |
| 2     | `Continuar` **habilitado**, submit não avança | Placa: `aria-invalid="true"` (sem toast)       |
| 3     | `Continuar` **desabilitado** + `aria-invalid` | CEP vazio                                      |
| 4     | `Continuar` **desabilitado** + mensagem       | _"Informe o CPF do segurado…"_                 |
| 5     | `Continuar` **desabilitado**                  | Exige escolha Sim/Não antes de avançar         |

> **Fora de escopo CAP-02:** bloqueios de negócio (blindado, blacklist, leilão) → `tests/spec/e2e/blockers/` · checkout/cartão → planner futuro.

---

## Matriz de cenários

Legenda de **tipo**: `OBR` obrigatório vazio · `FMT` formato inválido · `HP` happy path smoke · `NEG` negativo UX

### Etapa 1 — Lead info (`lead_info`)

| ID  | Tipo | Cenário               | Given                  | When                    | Then (asserts)                                                          | Tag              |
| --- | ---- | --------------------- | ---------------------- | ----------------------- | ----------------------------------------------------------------------- | ---------------- |
| L1  | OBR  | Formulário vazio      | Tela aberta            | —                       | `Continuar` disabled · `nome`/`email`/`tel` `aria-invalid="true"`       | `@smoke`         |
| L2  | FMT  | E-mail inválido       | Nome + tel válidos     | Blur no e-mail inválido | `Continuar` disabled · texto `/e-mail válido/i` · placa **não** visível | `@regression`    |
| L3  | HP   | Dados válidos avançam | Massa `quotationData`  | Clicar Continuar        | Campo `Placa do carro*` visível                                         | `@smoke`         |
| L4  | FMT  | Telefone incompleto   | Nome + e-mail OK       | Tel parcial + blur      | `Continuar` disabled · `tel` `aria-invalid`                             | `@regression` ✅ |
| L5  | FMT  | Nome só números       | Nome + e-mail + tel OK | Blur no nome `12345`    | `Continuar` disabled · `nome` `aria-invalid` · placa **não** visível    | `@regression` ✅ |

**File:** `tests/spec/e2e/ux/lead-info.spec.ts`

---

### Etapa 2 — Veículo (`vehicle_details`)

| ID  | Tipo | Cenário                | Given                | When                       | Then (asserts)                                                      | Tag              |
| --- | ---- | ---------------------- | -------------------- | -------------------------- | ------------------------------------------------------------------- | ---------------- |
| V1  | OBR  | Placa vazia            | Lead OK              | Clicar Continuar sem placa | Permanece na etapa 2 · CEP **oculto** · placa `aria-invalid="true"` | `@smoke`         |
| V2  | FMT  | Placa formato inválido | Placa `ABC`          | Blur + Continuar           | Não avança · `aria-invalid` na placa                                | `@regression` ✅ |
| V3  | HP   | Placa válida avança    | `plate.noInspection` | Continuar                  | Campo `CEP do veículo` visível                                      | `@smoke`         |
| V4  | NEG  | Veículo blindado       | Toggle blindado      | —                          | **blockers/** CAP-05 — não duplicar aqui                            | —                |

**File:** `tests/spec/e2e/ux/vehicle-details.spec.ts`

---

### Etapa 3 — Endereço e uso (`vehicle_additional`)

| ID  | Tipo | Cenário                     | Given              | When              | Then (asserts)                                                  | Tag              |
| --- | ---- | --------------------------- | ------------------ | ----------------- | --------------------------------------------------------------- | ---------------- |
| A1  | OBR  | CEP vazio                   | Veículo OK         | —                 | `Continuar` disabled · CEP `aria-invalid="true"`                | `@smoke`         |
| A2  | OBR  | CEP OK, uso não selecionado | CEP+número+garagem | —                 | `Continuar` disabled                                            | `@regression` ✅ |
| A3  | HP   | Endereço completo avança    | Massa padrão       | Continuar         | Campo `CPF do segurado` visível                                 | `@smoke`         |
| A4  | FMT  | CEP inválido (00000000)     | Veículo OK         | Blur CEP inválido | `Continuar` disabled · CEP `aria-invalid` · CPF **não** visível | `@regression` ✅ |

**File:** `tests/spec/e2e/ux/vehicle-additional.spec.ts`

---

### Checkout — Pagamento (`checkout`)

| ID  | Tipo | Cenário              | Given            | When             | Then (asserts)                                                                    | Tag              |
| --- | ---- | -------------------- | ---------------- | ---------------- | --------------------------------------------------------------------------------- | ---------------- |
| CH1 | FMT  | Finalizar sem cartão | Plano Regular OK | Clicar Finalizar | Permanece em `/checkout` · título checkout visível · campo titular cartão visível | `@regression` ✅ |

**File:** `tests/spec/e2e/ux/checkout.spec.ts`

---

### Etapa 4 — Segurado (`person_data`)

| ID  | Tipo | Cenário                    | Given          | When             | Then (asserts)                                                          | Tag              |
| --- | ---- | -------------------------- | -------------- | ---------------- | ----------------------------------------------------------------------- | ---------------- |
| P1  | OBR  | CPF e estado civil vazios  | Endereço OK    | —                | `Continuar` disabled · mensagem `/informe o cpf/i` · CPF `aria-invalid` | `@smoke`         |
| P2  | OBR  | CPF OK, estado civil vazio | CPF preenchido | —                | QA preenche _Solteiro_ automaticamente após CPF válido — **backlog**    | ⬜               |
| P3  | FMT  | CPF formato inválido       | CPF `12345`    | Blur + Continuar | Não avança para bônus · permanece na etapa 4                            | `@regression` ✅ |
| P4  | HP   | Dados válidos avançam      | Massa padrão   | Continuar        | Texto _"Você tem ou teve Seguro Auto nos últimos 12 meses?"_ visível    | `@smoke`         |
| P5  | NEG  | CPF blacklist              | —              | —                | **blockers/** CAP-12                                                    | —                |

**File:** `tests/spec/e2e/ux/person-data.spec.ts`

---

### Etapa 5 — Bônus (`bonuses_class`)

| ID  | Tipo | Cenário                       | Given      | When      | Then (asserts)                                        | Tag              |
| --- | ---- | ----------------------------- | ---------- | --------- | ----------------------------------------------------- | ---------------- |
| B1  | OBR  | Histórico não selecionado     | CPF OK     | —         | `Continuar` disabled · título da pergunta visível     | `@smoke`         |
| B2  | OBR  | Sim sem classe de bônus       | Clicar Sim | —         | `Continuar` disabled · não avança para planos         | `@regression` ✅ |
| B3  | HP   | Não + Continuar → WhatsApp UI | Clicar Não | Continuar | Botão _Chame no whatsapp_ visível _(fluxo produto)_   | `@regression`    |
| B4  | HP   | Sim + classe → planos         | Classe 10  | Continuar | Título seleção de planos _(via journey — smoke leve)_ | `@smoke` ⬜      |

**File:** `tests/spec/e2e/ux/bonuses-class.spec.ts`

---

## Estratégia de asserts (padrão do projeto)

```typescript
// Desabilitado (etapas 1, 3, 4, 5)
await expectContinueDisabled(page.btnContinue);
await expectFieldInvalid(page.campo);

// Permanece na etapa (etapa 2)
await expectContinueBlockedOnClick(page, btn, marcadorAtual, marcadorProximo);

// Permanece na URL (checkout — botão habilitado mas não conclui)
await expectStayOnUrl(page, /\/checkout/);

// Mensagem inline
await expectValidationMessage(page, /e-mail válido/i);

// Não confundir com bloqueio de negócio
await expect(nextStepMarker).toBeHidden();
```

### Marcadores de etapa (locators estáveis)

| Próxima etapa esperada | Marcador Playwright                                               |
| ---------------------- | ----------------------------------------------------------------- |
| Após lead              | `getByRole('textbox', { name: 'Placa do carro*' })`               |
| Após veículo           | `getByRole('textbox', { name: 'CEP do veículo' })`                |
| Após endereço          | `getByRole('textbox', { name: 'CPF do segurado' })`               |
| Após CPF               | `getByText('Você tem ou teve Seguro Auto nos últimos 12 meses?')` |
| Após bônus             | Título plan_selection / URL `plan_selection`                      |

---

## Tags e pipeline

| Tag               | Quando usar                        | Pipeline       |
| ----------------- | ---------------------------------- | -------------- |
| `@ux`             | Todos os specs deste planner       | PR (`test:ux`) |
| `@negative`       | Cenários OBR/FMT (não happy path)  | Nightly        |
| `@quotation_auto` | Funil auto                         | Global         |
| `@smoke`          | L1, L3, V1, V3, A1, A3, P1, P4, B1 | PR             |

```bash
# Suíte CAP-02
npx playwright test tests/spec/e2e/ux/lead-info.spec.ts \
  tests/spec/e2e/ux/vehicle-details.spec.ts \
  tests/spec/e2e/ux/vehicle-additional.spec.ts \
  tests/spec/e2e/ux/person-data.spec.ts \
  tests/spec/e2e/ux/bonuses-class.spec.ts \
  --project=chromium
```

---

## Manutenção

1. Explorar mudança de copy/UX em QA (script `_explore-validation.spec.ts` ou planner agent).
2. Atualizar **este planner** → implementar spec → `scripts/coverage-inventory.ts` (CAP-02).
3. Rodar `npm run coverage:sync`.
4. Mensagens novas: preferir regex tolerante; documentar string exata na tabela acima.

## Backlog (P3)

- `aria-live` / foco no primeiro erro (a11y CAP-02 em `a11y-gap-map.md`).
- Telefone, placa e CPF — formatos inválidos com mensagem confirmada em QA.
- Checkout: checkbox e-mail obrigatório antes de finalizar (se produto exigir).
