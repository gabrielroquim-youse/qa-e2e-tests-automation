# Plano de Testes — Personalização de Coberturas e Assistências

## Application Overview

Tela de personalização do Seguro Auto Youse — fluxo iniciado ao clicar em "Personalizar este plano" na seleção de planos. Composto por duas etapas: (1) coverages_selection — seleção de coberturas com toggles e sliders de franquia/indenização; (2) assistances_selection — seleção de assistências com toggles. Preço calculado em tempo real no painel lateral. URL padrão: qa-cotacao.youse.io/seguro-auto/{id}/coverages_selection.

## Test Scenarios

### 1. Personalização — Coberturas

**Seed:** `tests/spec/seed-personalizacao.spec.ts`

#### 1.1. Ativar cobertura opcional aumenta o prêmio

**File:** `tests/spec/e2e/personalizacao.spec.ts`

**Steps:**

1. Navegar pelo funil completo de cotação até a tela de seleção de planos
2. Clicar no botão 'Personalizar este plano' (data-testid='plan-card-button-custom')
3. Aguardar a tela de coberturas carregar e o preço ser calculado
4. Ler o prêmio anual inicial (9 coberturas ativas, Danos Morais OFF)
5. Clicar no toggle switch da cobertura 'Danos Morais' para ativar
6. Aguardar o preço ser recalculado pela API
7. Ler o novo prêmio anual

**Expected Results:**

- A tela exibe o título 'Olha só as coberturas disponíveis para você escolher'
- O toggle 'Danos Morais' aparece como desligado por padrão
- Após ativar 'Danos Morais', o prêmio anual deve ser maior que o inicial

#### 1.2. Desativar cobertura incluída reduz o prêmio

**File:** `tests/spec/e2e/personalizacao.spec.ts`

**Steps:**

1. Navegar pelo funil completo de cotação até a tela de coberturas (via Personalizar)
2. Aguardar o preço ser calculado
3. Ler o prêmio anual inicial (cobertura 'Roubo e furto' ativa)
4. Clicar no toggle switch da cobertura 'Roubo e furto' para desativar
5. Aguardar o preço ser recalculado
6. Ler o novo prêmio anual

**Expected Results:**

- O toggle 'Roubo e furto' aparece como ligado por padrão
- Após desativar 'Roubo e furto', o prêmio anual deve ser menor que o inicial

#### 1.3. Reduzir franquia aumenta o prêmio

**File:** `tests/spec/e2e/personalizacao.spec.ts`

**Steps:**

1. Navegar pelo funil completo de cotação até a tela de coberturas (via Personalizar)
2. Aguardar o preço ser calculado (franquia padrão: R$ 6.037)
3. Ler o prêmio anual inicial
4. Clicar no botão '-' (decrease) do slider de franquia de 'Vale pra qualquer batida'
5. Aguardar o preço ser recalculado
6. Ler o novo prêmio anual

**Expected Results:**

- O painel mostra 'Valor da Franquia: R$ 6.037' inicialmente
- Após reduzir a franquia (menor deductible), o prêmio anual deve ser maior que o inicial

#### 1.4. Aumentar valor de indenização aumenta o prêmio

**File:** `tests/spec/e2e/personalizacao.spec.ts`

**Steps:**

1. Navegar pelo funil completo de cotação até a tela de coberturas (via Personalizar)
2. Aguardar o preço ser calculado (indenização padrão de 'Danos corporais': R$ 100.000)
3. Ler o prêmio anual inicial
4. Clicar no botão '+' (increase) do slider de indenização de 'Danos corporais a terceiros'
5. Aguardar o preço ser recalculado
6. Ler o novo prêmio anual

**Expected Results:**

- O painel mostra 'Valor da Indenização: R$ 100.000' inicialmente para Danos Corporais
- Após aumentar a indenização, o prêmio anual deve ser maior que o inicial

### 2. Personalização — Assistências

**Seed:** `tests/spec/seed-personalizacao.spec.ts`

#### 2.1. Adicionar assistência paga aumenta o prêmio

**File:** `tests/spec/e2e/personalizacao.spec.ts`

**Steps:**

1. Navegar pelo funil completo de cotação até a tela de coberturas (via Personalizar)
2. Aguardar o preço ser calculado
3. Clicar no botão 'Continuar' para avançar para a tela de assistências
4. Dispensar o modal promocional 'Proteção de Rodas' (clicar em 'AGORA NÃO') se visível
5. Aguardar o preço ser calculado na tela de assistências
6. Ler o prêmio anual inicial (sem assistências ativas)
7. Clicar no toggle switch da assistência 'Carro reserva' para ativar
8. Aguardar o preço ser recalculado
9. Ler o novo prêmio anual

**Expected Results:**

- A tela exibe o título 'Escolha as assistências para usar quando precisar'
- O toggle 'Carro reserva' aparece desligado por padrão
- O modal promocional 'AGORA NÃO' é dispensável sem erros
- Após ativar 'Carro reserva', o prêmio anual deve ser maior que o inicial
