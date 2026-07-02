# Relatório — Jornadas de Fluxo Feliz (Cotação Seguro Auto)

> **Data de geração:** 02/07/2026  
> **Responsável:** Gabriel Roquim  
> **Specs cobertos:** `cotacao-plano-regular` · `cotacao-plano-personalizado` · `cotacao-planos-preformatados`  
> **Ambiente:** QA (`qa-cotacao.youse.io`) · VPN Youse obrigatória

---

## Visão geral

| Spec | Fluxo | Testes | Tipo |
|---|---|---|---|
| `cotacao-plano-regular.spec.ts` | F1 — Plano Regular | 2 | Smoke + Regressão |
| `cotacao-plano-personalizado.spec.ts` | F2 — Plano Personalizado | 1 | Regressão |
| `cotacao-planos-preformatados.spec.ts` | F3/F4 — Essencial e Auto 1504 | 6 | Smoke + Regressão |
| **TOTAL** | **4 fluxos** | **9 testes** | — |

---

## Funil completo percorrido (todas as jornadas)

```
Lead Info (nome/e-mail/tel)
  → Veículo (placa, zero km, blindado)
    → Endereço e uso (CEP, garagem, uso)
      → Dados pessoais (CPF, estado civil)
        → [data_enrichment — opcional, por CPF]
          → Histórico de seguro / Classe de bônus
            → Seleção de plano
              → [Coberturas + Assistências — fluxo F2 personalizado]
                → [risk_acceptance — opcional, sem garagem]
                  → Checkout (pagamento)
                    → Emissão da apólice
```

---

## F1 — Plano Regular (`cotacao-plano-regular.spec.ts`)

**2 testes** · Tags: `@b2c @journey @quotation_auto @happy_path`

### Teste 1: Chegar ao checkout com plano Regular sem pagar
**Tag:** `@smoke`  
**Timeout:** 240s  

**Passos:**
1. Navegar o funil completo (lead → veículo → endereço → CPF → bônus → planos)
2. Selecionar plano **Regular** ("Quero Esse")
3. Verificar que o checkout carregou

**Assertivas:**
- ✅ Título do checkout visível
- ✅ Confirmação de e-mail visível
- ✅ Botão "Finalizar contratação" visível

**Dados de teste:**
- CPF: `cpf.acceptedPool[0]` (mock aceito)
- Placa: YOU-0020
- Nome/Email: gerado pelo Faker

---

### Teste 2: Contratar com plano Regular até emissão da apólice
**Tag:** `@regression`  
**Timeout:** 360s  

**Passos:**
1. Navegar o funil completo até o checkout
2. Confirmar e-mail e verificar upsells
3. Abrir accordion de assistências
4. Preencher cartão de crédito (Visa sandbox)
5. Finalizar contratação
6. Validar estado pós-pagamento

**Assertivas:**
- ✅ Upsells "Seguro Residencial" e "Seguro Vida" visíveis
- ✅ Assistência "Proteção de Rodas, Pneu e Suspensão" no accordion
- ✅ Pós-pagamento — aceita 3 caminhos válidos no QA:
  - **A:** `/sucesso` → apólice, cotação realizada, pagamento validado, e-mail do segurado
  - **B:** `youse.com.br` → redirect externo
  - **C:** `/issuance` → webhook pendente (aceito em QA)

**Dados de teste:**
- Cartão: `4111 1111 1111 1111` (Visa sandbox Adyen)
- CVV: `737` · Validade: `03/30`

---

## F2 — Plano Personalizado (`cotacao-plano-personalizado.spec.ts`)

**1 teste** · Tags: `@b2c @journey @personalizacao @quotation_auto @happy_path @regression`

### Teste 1: Contratar plano personalizado com configurações padrão
**Timeout:** 480s (funil mais longo — inclui coberturas e assistências)  

**Passos:**
1. Navegar o funil completo até seleção de planos
2. Clicar em **"Personalizar"** (em vez de "Quero Esse")
3. Percorrer tela de coberturas (10 coberturas — manter defaults)
4. Percorrer tela de assistências (13 opções — manter defaults)
5. Avançar pelo checkout (tratando `risk_acceptance` quando aparecer)
6. Preencher cartão de crédito
7. Finalizar contratação

**Assertivas:**
- ✅ Pós-pagamento — mesmo padrão multi-path do Regular (A/B/C)
- ✅ E-mail do segurado visível no `/sucesso`

**Dados de teste:**
- CPF: `cpf.acceptedPool[0]`
- Cartão Visa sandbox

**Observação técnica:** Este é o fluxo mais longo (até 8 min). O timeout de 480s reflete o tempo real de processamento do pagamento no QA.

---

## F3 — Plano Essencial (`cotacao-planos-preformatados.spec.ts`)

**3 testes** · Tags: `@b2c @journey @quotation_auto @happy_path`

### Teste 1: Chegar ao checkout com plano Essencial
**Tag:** `@smoke` · **Timeout:** 240s

**Passos:** Funil completo → selecionar **Essencial**

**Assertivas:**
- ✅ Título do checkout visível
- ✅ Confirmação de e-mail visível
- ✅ Botão "Finalizar contratação" visível

---

### Teste 2: Upsells Residencial e Vida no checkout Essencial
**Tag:** `@regression` · **Timeout:** 240s

**Assertivas:**
- ✅ Botão "Adicionar" Seguro Residencial visível
- ✅ Botão "Adicionar" Seguro Vida visível

---

### Teste 3: Assistências Essencial no accordion (Guincho 200km)
**Tag:** `@regression` · **Timeout:** 240s

**Assertivas:**
- ✅ Texto "guincho" ou "200 km" visível no accordion
- ✅ Nenhum switch de edição (plano Essencial é pré-formatado, sem toggles)

---

## F4 — Plano Auto 1504 (`cotacao-planos-preformatados.spec.ts`)

**3 testes** · Tags: `@b2c @journey @quotation_auto @happy_path`

### Teste 1: Chegar ao checkout com plano Auto 1504
**Tag:** `@smoke` · **Timeout:** 240s

**Assertivas:**
- ✅ Título do checkout visível
- ✅ Confirmação de e-mail visível
- ✅ Botão "Finalizar contratação" visível

---

### Teste 2: Upsells Residencial e Vida no checkout Auto 1504
**Tag:** `@regression` · **Timeout:** 240s

**Assertivas:**
- ✅ Botão "Adicionar" Seguro Residencial visível
- ✅ Botão "Adicionar" Seguro Vida visível

---

### Teste 3: Assistências Auto 1504 — Guincho 400km e Reparos Abaixo da Franquia
**Tag:** `@regression` · **Timeout:** 240s

**Assertivas:**
- ✅ Texto "guincho" e "400 km" visível
- ✅ Texto "Reparos" visível
- ✅ Nenhum switch de edição (plano pré-formatado)

---

## Comportamento pós-pagamento no QA

O ambiente QA admite 3 estados válidos após finalizar o pagamento:

| Caminho | URL | Quando ocorre |
|---|---|---|
| **A** — Sucesso | `/sucesso` | Webhook processado com sucesso |
| **B** — Redirect | `youse.com.br` | Redirect externo pós-confirmação |
| **C** — Issuance | `/issuance` | Webhook pendente (aceito em QA) |

Os testes validam os 3 caminhos com lógica condicional (`eslint-disable no-conditional-in-test`).

---

## Como executar

```bash
# Todos os 3 specs com vídeo gravado
$env:PW_VIDEO="on"
npx playwright test \
  tests/spec/e2e/journeys/cotacao-plano-regular.spec.ts \
  tests/spec/e2e/journeys/cotacao-plano-personalizado.spec.ts \
  tests/spec/e2e/journeys/cotacao-planos-preformatados.spec.ts \
  --project=chromium --reporter=list --workers=1

# Com relatório Allure
npx playwright test tests/spec/e2e/journeys \
  --project=chromium --reporter=allure-playwright --workers=1
npm run allure:generate
npm run allure:serve
```

**Pré-requisitos:**
- VPN Youse ativa
- `.env` com `BASE_URL=https://qa-cotacao.youse.io/seguro-auto`
- 1 worker (CPF compartilhado — execução serial evita conflito de sessão)
