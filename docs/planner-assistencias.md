# Plano de Testes — Assistências — Seguro Auto

## Application Overview

Tela de seleção de assistências do Seguro Auto Youse — exibida após a personalização de coberturas
no fluxo de plano personalizado. O usuário ativa/desativa assistências opcionais por meio de
toggle switches; o painel lateral recalcula o prêmio em tempo real após cada interação.

**URL padrão:** `qa-cotacao.youse.io/seguro-auto/{id}/assistances_selection`

**Fonte de dados:**

- UIDs e preços: `order-service` → `pricing_plan_serializer.rb`, `PricingPlanSerializer`
- Frontend: `sales-frontend` → `AssistancesSelectionSection/index.tsx`
- Combo auto: `CustomPlan/AssistancesTab/ComboAssistancesModal/ComboAssistancesModal.tsx`

---

## Catálogo de Assistências — Seguro Auto

| #   | Nome (UI)                                                   | UID                      | Categoria           | Incluso nos Planos                                       | Opções de serviço                                 |
| --- | ----------------------------------------------------------- | ------------------------ | ------------------- | -------------------------------------------------------- | ------------------------------------------------- |
| 1   | Assistência a automóvel                                     | `bra/auto/assistance/4`  | **Combo principal** | Essencial (200 km), Regular (400 km), Auto 1504 (400 km) | Sim (Guincho 200 km / 400 km)                     |
| 2   | Proteção de Rodas, Pneu e Suspensão                         | `bra/auto/assistance/5`  | Combo               | Essencial, Regular, Auto 1504                            | Não                                               |
| 3   | Reparos Abaixo da Franquia                                  | `bra/auto/assistance/15` | Combo               | Auto 1504                                                | Não                                               |
| 4   | Chaveiro auto                                               | `bra/auto/assistance/16` | Combo               | —                                                        | Não                                               |
| 5   | Vidros + Pequenos Reparos                                   | `bra/auto/assistance/17` | Combo               | —                                                        | Não                                               |
| 6   | Vidros, retrovisores, faróis e lanternas + Pequenos Reparos | `bra/auto/assistance/18` | Combo               | —                                                        | Não                                               |
| 7   | Motorista Parceiro                                          | `bra/auto/assistance/19` | Combo               | —                                                        | Não                                               |
| 8   | Lavagem e higienização                                      | `bra/auto/assistance/20` | Combo               | —                                                        | Não                                               |
| 9   | Carro reserva                                               | `bra/auto/assistance/14` | **Independente**    | —                                                        | Sim (Básico 1.0 / Básico 1.4 / Intermediário 1.0) |
| 10  | Serviço de leva e traz                                      | —                        | Independente        | —                                                        | Não                                               |
| 11  | Restituição de IPVA                                         | —                        | Independente        | —                                                        | Não                                               |
| 12  | Serviço de histórico veicular                               | —                        | Independente        | —                                                        | Não                                               |
| 13  | Assistência a bike                                          | —                        | Independente        | —                                                        | Não                                               |

### Comportamento do Combo (`bra/auto/assistance/4`)

Ao ativar **Assistência a automóvel** (guincho), o sistema exibe um modal de confirmação
intitulado **"Combo de assistências"** com a mensagem:

> _"Ao selecionar a Assistência a Automóvel (guincho), o cliente garante outras 7 assistências na faixa."_

As 7 assistências complementares do combo são as de UIDs:
`bra/auto/assistance/5`, `bra/auto/assistance/15`, `bra/auto/assistance/16`,
`bra/auto/assistance/17`, `bra/auto/assistance/18`, `bra/auto/assistance/19`,
`bra/auto/assistance/20`.

**Consequência para precificação:**

```
assistances_monthly = Σ monthly_cost de cada assistência ativada
monthly_total       = coverages_monthly + assistances_monthly
```

Ativar o combo acrescenta até 8 assistências de uma vez, resultando no maior incremento de
prêmio possível em uma única ação na tela de assistências.

---

## Estratégia de Validação

Segue a mesma abordagem dos demais testes do projeto (sem valores absolutos):

| Estratégia       | Quando usar             | Exemplo                                                  |
| ---------------- | ----------------------- | -------------------------------------------------------- |
| **Ordinal**      | Prêmio antes vs. depois | `expect(comAssistencia).toBeGreaterThan(semAssistencia)` |
| **Sanidade**     | Motor online / sem bug  | `expect(preco).toBeGreaterThan(1)`                       |
| **Visibilidade** | Elementos no DOM        | `expect(assistanceName).toBeVisible()`                   |

---

## Test Scenarios

### 1. Visibilidade

**Seed:** `tests/spec/e2e/assistencias.spec.ts`

#### 1.1. Exibir título e assistências na tela de seleção

**File:** `tests/spec/e2e/assistencias.spec.ts`

**Tags:** `@smoke` `@assistencias` `@quotation_auto`

**Steps:**

1. Navegar pelo funil completo de cotação até a tela de assistências (via Personalizar)
2. Dispensar o modal promocional se visível
3. Aguardar o título da tela carregar
4. Verificar visibilidade de um conjunto representativo de assistências

**Expected Results:**

- O título "Escolha as assistências para usar quando precisar" está visível
- As seguintes assistências estão visíveis no DOM:
  - Carro reserva
  - Assistência a automóvel
  - Proteção de Rodas, Pneu e Suspensão
  - Restituição de IPVA
  - Assistência a bike
  - Motorista Parceiro
  - Serviço de histórico veicular

---

### 2. Efeito no Prêmio — Assistências Independentes

Testa que ativar cada assistência independente (fora do combo) aumenta o prêmio anual.

**Tags:** `@regression` `@assistencias` `@quotation_auto`

#### 2.1. Ativar "Restituição de IPVA" deve aumentar o prêmio anual

**File:** `tests/spec/e2e/assistencias.spec.ts`

**Steps:**

1. Navegar pelo funil completo até a tela de assistências
2. Aguardar o preço ser calculado
3. Ler o prêmio anual inicial
4. Clicar no toggle da assistência "Restituição de IPVA"
5. Aguardar o preço ser recalculado
6. Ler o novo prêmio anual

**Expected Results:**

- O toggle "Restituição de IPVA" está visível e desligado por padrão
- Após ativar, o prêmio anual é maior que o inicial

---

#### 2.2. Ativar "Assistência a bike" deve aumentar o prêmio anual

**File:** `tests/spec/e2e/assistencias.spec.ts`

**Steps:**

1. Navegar pelo funil completo até a tela de assistências
2. Aguardar o preço ser calculado
3. Ler o prêmio anual inicial
4. Clicar no toggle da assistência "Assistência a bike"
5. Aguardar o preço ser recalculado
6. Ler o novo prêmio anual

**Expected Results:**

- O toggle "Assistência a bike" está visível e desligado por padrão
- Após ativar, o prêmio anual é maior que o inicial

---

#### 2.3. Ativar "Serviço de histórico veicular" deve aumentar o prêmio anual

**File:** `tests/spec/e2e/assistencias.spec.ts`

**Steps:**

1. Navegar pelo funil completo até a tela de assistências
2. Aguardar o preço ser calculado
3. Ler o prêmio anual inicial
4. Clicar no toggle da assistência "Serviço de histórico veicular"
5. Aguardar o preço ser recalculado
6. Ler o novo prêmio anual

**Expected Results:**

- O toggle "Serviço de histórico veicular" está visível e desligado por padrão
- Após ativar, o prêmio anual é maior que o inicial

---

#### 2.4. Ativar "Serviço de leva e traz" deve aumentar o prêmio anual

**File:** `tests/spec/e2e/assistencias.spec.ts`

**Steps:**

1. Navegar pelo funil completo até a tela de assistências
2. Aguardar o preço ser calculado
3. Ler o prêmio anual inicial
4. Clicar no toggle da assistência "Serviço de leva e traz"
5. Aguardar o preço ser recalculado
6. Ler o novo prêmio anual

**Expected Results:**

- O toggle "Serviço de leva e traz" está visível e desligado por padrão
- Após ativar, o prêmio anual é maior que o inicial

---

### 3. Efeito no Prêmio — Combo Assistência a Automóvel

#### 3.1. Ativar "Assistência a automóvel" deve aumentar o prêmio anual

**File:** `tests/spec/e2e/assistencias.spec.ts`

**Tags:** `@regression` `@assistencias` `@quotation_auto`

**Steps:**

1. Navegar pelo funil completo até a tela de assistências
2. Dispensar o modal promocional se visível
3. Aguardar o preço ser calculado
4. Ler o prêmio anual inicial (sem assistências ativas)
5. Clicar no toggle da assistência "Assistência a automóvel"
6. Dispensar o modal "Combo de assistências" se aparecer
7. Aguardar o preço ser recalculado
8. Ler o novo prêmio anual

**Expected Results:**

- O toggle "Assistência a automóvel" está visível
- Após ativar, o prêmio anual é maior que o inicial
- O incremento é superior ao de uma assistência simples (combo agrega até 8 itens)

---

## Mapeamento de Cobertura de Testes

| #   | Cenário                                      | Arquivo                  | Status          | Tags          |
| --- | -------------------------------------------- | ------------------------ | --------------- | ------------- |
| 1   | Visibilidade — título e 7 assistências       | `assistencias.spec.ts`   | ✅ Implementado | `@smoke`      |
| 2   | Restituição de IPVA aumenta prêmio           | `assistencias.spec.ts`   | ✅ Implementado | `@regression` |
| 3   | Assistência a bike aumenta prêmio            | `assistencias.spec.ts`   | ✅ Implementado | `@regression` |
| 4   | Serviço de histórico veicular aumenta prêmio | `assistencias.spec.ts`   | ✅ Implementado | `@regression` |
| 5   | Serviço de leva e traz aumenta prêmio        | `assistencias.spec.ts`   | ✅ Implementado | `@regression` |
| 6   | Combo Assistência a automóvel aumenta prêmio | `assistencias.spec.ts`   | ✅ Implementado | `@regression` |
| 7   | Carro reserva aumenta prêmio                 | `personalizacao.spec.ts` | ✅ Implementado | `@regression` |

---

## Observações Técnicas

- **Modal promocional:** Aparece automaticamente ao entrar na tela (campanha 10 anos Youse).
  Sempre chamar `dismissPromoModal()` antes de interagir com os toggles.
- **Modal de combo:** Aparece ao ativar `bra/auto/assistance/4`. Chamar
  `dismissComboModalIfVisible()` após clicar no toggle do guincho.
- **Assistências imutáveis:** Algumas assistências incluídas em planos pré-formatados têm
  `immutable: true` e não exibem toggle. Isso NÃO afeta o fluxo de plano personalizado
  (onde todas partem como opcionais).
- **Dependências:** As 7 assistências do combo têm `dependsOn: [bra/auto/assistance/4]`.
  Seus toggles ficam desabilitados até que "Assistência a automóvel" seja ativada.
