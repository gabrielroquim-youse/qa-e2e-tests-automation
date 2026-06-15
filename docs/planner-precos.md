# Plano de Testes — Variação de Preços — Seguro Auto

## Contexto

O motor de precificação da Youse é **dinâmico**: os preços **não existem em banco** — são
calculados em tempo real pelo `Youse::SDK::PlansOffer.create(payload)` (microserviço externo,
chamado por `BRA::CalculatePlansOfferService` no `order-service`). O back-end envia um payload
com as variáveis do pedido e recebe de volta os planos com seus valores mensais/anuais já
calculados.

Isso significa que:

- **Não é possível fixar valores absolutos** nos testes.
- Os testes devem validar **relações** ("quem paga mais / quem paga menos") ou **faixas**.
- Flutuações de até ±5% entre execuções são aceitas como variação normal do motor externo.

---

## 1. Mapa completo de variáveis de precificação

Fonte: `order-service` — `pricing_serializer.rb`, `calculate_plans_offer_service.rb`,
`orders_fixtures.rb`, `build_order_pricing_service.rb`.

### 1.1 Variáveis do segurado / motorista

| Campo                   | Tipo           | Efeito no preço                                    | Fonte                       |
| ----------------------- | -------------- | -------------------------------------------------- | --------------------------- |
| `bonuses_class`         | Integer (0–10) | Mais alto = mais desconto (até 50%)                | `pricing_serializer.rb`     |
| `user_bonuses_class`    | Integer (0–10) | Valor informado pelo usuário (antes de validar CI) | `bonuses_class_section.rb`  |
| `young_driver_coverage` | Boolean        | `true` = cobre motorista jovem = prêmio maior      | `pricing_serializer.rb`     |
| `date_of_birth`         | Date           | Jovens (< ~25 anos) e idosos (> ~65 anos) = maior  | `cross_sell / age.between?` |
| `occupation.high_risk`  | Boolean        | Profissão de alto risco = prêmio maior             | `orders_fixtures.rb`        |
| `marital_status`        | Enum           | Impacto leve no perfil estatístico                 | `pricing_serializer.rb`     |

### 1.2 Variáveis do veículo

| Campo                  | Tipo         | Efeito no preço                                         | Fonte                      |
| ---------------------- | ------------ | ------------------------------------------------------- | -------------------------- |
| `fipe_code` + `price`  | String/Float | Base do cálculo de indenização → prêmio proporcional    | `fipe_compensation_factor` |
| `year`                 | Integer      | Veículo mais antigo = depreciação → indenização menor   | `pricing_serializer.rb`    |
| `brand_new`            | Boolean      | Zero km = valor maior → prêmio maior                    | `pricing_serializer.rb`    |
| `usage`                | Enum         | `only_private` < `app` < `commercial` (risco crescente) | `pricing_serializer.rb`    |
| `overnight_garage`     | Boolean      | Garagem = menor risco de furto → desconto               | `pricing_serializer.rb`    |
| `bullet_proof`         | Boolean      | Blindado → recusado (bloqueio de risco)                 | `VehicleDetailsPage`       |
| `acceptance_type`      | Enum         | `accepted` / `suspended` / `rejected`                   | `vehicles_nlist`           |
| `adapted_with_gas_kit` | Boolean      | GNV = risco de incêndio maior → prêmio maior            | `pricing_serializer.rb`    |

### 1.3 Variáveis geográficas / contexto

| Campo                   | Tipo         | Efeito no preço                           | Fonte                              |
| ----------------------- | ------------ | ----------------------------------------- | ---------------------------------- |
| `zip_code` (pernoite)   | String (CEP) | CEPs de alto risco de furto → preço maior | `zipcode_range` (risk acceptance)  |
| `zip_code` (residência) | String (CEP) | Contribui para perfil de risco geográfico | `calculate_plans_offer_service.rb` |

### 1.4 Variáveis do plano / cobertura

| Campo               | Tipo           | Efeito no preço                                 | Fonte                            |
| ------------------- | -------------- | ----------------------------------------------- | -------------------------------- |
| `plan_id` (uid)     | String         | `bra/auto/plan/1` (Essencial) < plan/2 < plan/N | `PricingPlanSerializer`          |
| `coverages`         | Array          | Mais coberturas = prêmio maior                  | `build_order_pricing_service.rb` |
| `assistances`       | Array          | Assistências cobradas em `assistances_monthly`  | `pricing_plan_serializer.rb`     |
| `campaign_discount` | Float          | Desconto fixo por campanha → reduz `monthly`    | `pricing_plan_serializer.rb`     |
| `contract_duration` | Integer (anos) | 1 ou 2 anos → afeta cálculo anual               | `payment_condition`              |

---

## 2. Classificação de Risco (Perfis de Teste)

Baseado nos dados reais capturados no ambiente QA com placa `YOU-0020` / CEP `04777-020`:

### Perfil Baixo Risco

| Variável        | Valor                | Prêmio Essencial (referência QA) |
| --------------- | -------------------- | -------------------------------- |
| Bônus Classe    | 10 (50% de desconto) | ~R$ 961/mês                      |
| Garagem noturna | Sim                  | ↓                                |
| Uso             | Particular           | ↓                                |
| Motorista       | Adulto (25–60 anos)  | ↓                                |
| Ocupação        | `high_risk: false`   | ↓                                |

### Perfil Médio Risco (Baseline atual dos testes)

| Variável        | Valor                     | Prêmio Essencial (referência QA) |
| --------------- | ------------------------- | -------------------------------- |
| Bônus Classe    | Sem bônus (sem histórico) | ~R$ 2.205/mês                    |
| Garagem noturna | Sim                       | —                                |
| Uso             | Particular                | —                                |
| Motorista       | Adulto                    | —                                |

### Perfil Alto Risco

| Variável        | Valor                   | Prêmio Essencial (referência QA)   |
| --------------- | ----------------------- | ---------------------------------- |
| Bônus Classe    | Sem bônus               | ~R$ 2.784/mês (sem garagem)        |
| Garagem noturna | Não                     | ↑ +26% vs com garagem              |
| Uso             | Motorista de Aplicativo | ~R$ 3.768/mês (+70% vs particular) |
| Motorista       | Jovem / PEP             | → bloqueio ou prêmio elevado       |

> ⚠️ Os valores acima são **referências observadas** em QA. O motor externo pode variar.
> Use-os apenas para validar **ordens de grandeza**, nunca como valores absolutos.

---

## 3. Estratégia de Validação de Preços

### 3.1 Por que NÃO usar `.toBe(valorExato)`

O motor de precificação pode ajustar preços por:

- Atualização da tabela FIPE (mensal)
- Campanhas e promoções ativas
- Reajuste tarifário da seguradora
- Variação do índice de sinistralidade por região (CEP)

### 3.2 Estratégias recomendadas

#### a) Comparação ordinal (A < B) — já implementado

```typescript
expect(precoRiscoBaixo).toBeLessThan(precoRiscoAlto);
```

Usa **relação de ordenação** entre dois cenários. Não falha com flutuação de preços.

#### b) Tolerância percentual (±N%)

```typescript
// Preco deve estar dentro de ±5% do valor de referência
expectPriceWithinTolerance(precoAtual, precoReferencia, (tolerancePercent = 5));
```

Útil para detectar **variações bruscas** (ex: bug no pricing engine que triplica o preço)
sem falhar em ajustes finos.

#### c) Faixa absoluta (floor / ceiling)

```typescript
expect(preco).toBeGreaterThan(0); // nunca retornar 0 (motor offline)
expect(preco).toBeLessThan(99_999); // nunca retornar valor absurdo
```

Guarda rails de sanidade — independente de campanha ou tabela FIPE.

#### d) Desconto esperado por Classe de Bônus (%)

```typescript
const descontoObservado = ((precoSemBonus - precoComBonus) / precoSemBonus) * 100;
expect(descontoObservado).toBeGreaterThan(30); // mínimo esperado para Classe 10
expect(descontoObservado).toBeLessThan(65); // máximo razoável
```

Valida que o desconto está **dentro de uma faixa plausível** sem fixar o valor.

---

## 4. Cenários implementados

| #   | Cenário                              | Estratégia        | Tag            |
| --- | ------------------------------------ | ----------------- | -------------- |
| 1   | Bônus Classe 10 < Sem Bônus          | Ordinal (A < B)   | `@bonus_class` |
| 2   | Com garagem < Sem garagem            | Ordinal (A < B)   | `@garage`      |
| 3   | Particular < Motorista de Aplicativo | Ordinal (A < B)   | `@usage`       |
| 4   | Essencial < Regular < Auto 1504      | Ordinal encadeado | `@plan_order`  |
| 5   | Idempotência (mesmos dados)          | Tolerância ±2%    | `@stability`   |
| 6   | Desconto de Bônus dentro da faixa    | Faixa percentual  | `@bonus_range` |
| 7   | Sanidade de preços (> 0, < 99.999)   | Guarda rails      | `@sanity`      |

---

## 5. Cenários planejados (não implementados)

### A — Impacto da idade do motorista

```
Dado cotações idênticas com motoristas de idades diferentes
Quando motorista jovem (22 anos) vs adulto (40 anos)
Então preço jovem deve ser MAIOR que adulto
```

- **Bloqueio:** CPF de teste com data de nascimento controlada. Requer massa específica.
- **Tag:** `@price @age`

### B — Impacto do CEP de alto risco

```
Dado cotações idênticas com CEPs diferentes
Quando CEP 04777-020 (São Paulo, baixo risco) vs CEP de zona de alto furto
Então preço CEP alto risco deve ser MAIOR
```

- **Bloqueio:** Identificar CEP de alto risco aceito pelo QA sem bloqueio por `zipcode_range`.
- **Tag:** `@price @zipcode`

### C — Impacto de veículo zero km

```
Dado cotações idênticas
Quando brand_new = true vs false
Então preço zero km deve ser MAIOR (base FIPE maior)
```

- **Tag:** `@price @brand_new`

---

## 6. Limitações e riscos

| Risco                                               | Mitigação                                                            |
| --------------------------------------------------- | -------------------------------------------------------------------- |
| Campanha ativa pode igualar preços entre planos     | Logar `campaign_discount` capturado no DOM; alertar em vez de falhar |
| Motor externo offline → todos os preços iguais a 0  | Assert `price > 0` antes de qualquer comparação                      |
| Plano "Auto 1504" com nome diferente no DOM         | `planCard()` usa regex `/Auto.*1504/i` para tolerância de texto      |
| `resetSession()` insuficiente (app persiste estado) | `evaluate` roda ANTES do `goto('about:blank')` enquanto no domínio   |
| Reajuste tarifário → teste de estabilidade falha    | Usar tolerância ±2% em vez de `.toBe()` exato                        |
| Bônus Classe 10 sem histórico de seguro             | Cenário usa `useBonusClass: false` (sem histórico = pior classe)     |

---

## 7. Arquivo de implementação

```
tests/spec/e2e/precosPlanos.spec.ts
```

---

## 9. Cruzamento: Coberturas × Assistências × Preço

Fonte: DOM capturado no QA (`plan_selection`) + `pricing_plan_serializer.rb` do `order-service`.

O `monthly` exibido no card = `coverages_monthly` + `assistances_monthly`.
O `annual` = `total_cost / contract_duration` (Youse usa contratos de 1 ou 2 anos).

### Catálogo de planos observado em QA (placa YOU-0020, CEP 04777-020)

| Campo                        | Essencial           | Regular             | Auto 1504 (personalizado) |
| ---------------------------- | ------------------- | ------------------- | ------------------------- |
| **UID back-end**             | `bra/auto/plan/1`   | `bra/auto/plan/2`   | plano personalizado       |
| **Preço mensal (sem bônus)** | R$ 2.205,92         | R$ 2.588,58         | R$ 2.747,17               |
| **Coberturas (count)**       | 6                   | 6                   | 6                         |
| Roubo, Furto e Incêndio      | ✓                   | ✓                   | ✓                         |
| Alagamento                   | ✓                   | ✓                   | ✓                         |
| Colisão — Só Perda Total     | ✓                   | ✓                   | ✓                         |
| Colisão — Qualquer Batida    | ✓                   | ✓                   | ✓ (Franquia R$ 6.037)     |
| Danos materiais a terceiros  | ✓                   | ✓ (R$ 50.000)       | ✓                         |
| Danos corporais a terceiros  | ✓                   | ✓ (R$ 50.000)       | ✓                         |
| **Assistências (count)**     | 3                   | 3                   | 3                         |
| Carro reserva                | 1.0 com ar / 7 dias | 1.0 com ar / 7 dias | —                         |
| Proteção de Rodas            | ✓                   | ✓                   | ✓                         |
| Guincho                      | 200 km              | 400 km              | 400 km                    |
| Reparos Abaixo da Franquia   | —                   | —                   | ✓                         |

### Por que o preço cresce entre os planos?

```
monthly_Essencial  = coverages_monthly(base) + assistances_monthly(100km)
monthly_Regular    = coverages_monthly(+R$50k limite) + assistances_monthly(400km)
monthly_Auto1504   = coverages_monthly(+franquia deductível) + assistances_monthly(reparos)
```

Fonte back-end:

- `coverages_monthly = monthly_calculator.coverages_amount`
- `assistances_monthly = monthly_calculator.assistances_amount`
- `monthly = coverages_monthly + assistances_monthly` (invariante matemática do `PricingPlanSerializer`)

### Invariantes testáveis

| Invariante                                              | Estratégia                  |
| ------------------------------------------------------- | --------------------------- |
| `monthly ≈ coverages_monthly + assistances_monthly`     | Tolerância ±R$ 0,05         |
| Regular tem Guincho 400km; Essencial tem 200km          | `hasText` no card           |
| Auto 1504 tem "Reparos Abaixo da Franquia"              | `hasText` no card           |
| Plano com mais cobertura tem `monthly` maior            | Ordinal (A < B)             |
| Assistência 400km > 200km → prêmio de assistência maior | `assistances_monthly` B > A |

---

## 10. Estrutura de pastas recomendada

Situação atual vs recomendada para escalar o framework:

```
ATUAL                             RECOMENDADO
─────────────────────────         ─────────────────────────────────────────
tests/                            tests/
  spec/                             spec/
    e2e/                              smoke/          ← happy path; roda a cada PR
      cotacaoAuto.spec.ts               cotacaoAuto.spec.ts
      precosPlanos.spec.ts            regression/     ← caminhos negativos; nightly
      validateBonusClass.spec.ts        cpfRestricao.spec.ts    (extraído de cotacaoAuto)
    api/                               validacaoVeiculo.spec.ts (extraído de cotacaoAuto)
      ciliaClaimAuth.spec.ts            bonusClass.spec.ts       (validateBonusClass)
      testUtils.spec.ts              pricing/         ← preços e coberturas; on release
    seed.spec.ts                        precosPlanos.spec.ts
  data/                               coberturas.spec.ts   ← NOVO
    cpf.ts                          api/
    plate.ts                          ciliaClaimAuth.spec.ts
    plans.ts         ← NOVO          testUtils.spec.ts
  pages/                          data/
    quotation/                      cpf.ts / plate.ts / plans.ts (NOVO)
      ...Page.ts                  pages/
                                    quotation/
                                      ...Page.ts
```

**Benefícios:**

- `smoke/` → tag `@smoke` no CI/CD com `grep: '@smoke'` — roda em ~2min
- `regression/` → tag `@regression` no nightly — ~15min
- `pricing/` → tag `@price` on release — ~30min (cotações duplas são lentas)
- Specs de cenários negativos agrupados separados do happy path → reportes mais claros

```
Cenário A                    Cenário B
    │                            │
    ▼                            ▼
LeadInfoPage.open()          LeadInfoPage.open()
    │                            │
   ...                          ...  ← variável isolada alterada
    │                            │
    ▼                            ▼
PlanSelectionPage         PlanSelectionPage
    │                            │
    ▼                            ▼
getPlanMonthlyPriceValue()  getPlanMonthlyPriceValue()
    │                            │
    └──────────────┬─────────────┘
                   ▼
         Estratégia de validação:
         ┌─────────────────────────────────┐
         │ Ordinal:    A.toBeLessThan(B)   │
         │ Tolerância: |A-B|/B < 0.05      │
         │ Faixa:      A > floor && A < cap│
         └─────────────────────────────────┘
```
