<div align="center">

# QA E2E Tests Automation

Suite de testes automatizados da **Youse Seguradora** — fluxos E2E, API e pricing com Playwright e TypeScript.

<br/>

[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Allure Report](https://img.shields.io/badge/Allure-FF6B00?style=for-the-badge&logo=allure&logoColor=white)](https://allurereport.org/)

<br/>

[![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=flat-square&logo=prettier&logoColor=black)](https://prettier.io/)
[![Husky](https://img.shields.io/badge/Husky-pre--commit-000?style=flat-square&logo=git&logoColor=white)](https://typicode.github.io/husky/)
[![GitHub Actions](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)](.github/workflows/ci.yml)
[![Zod](https://img.shields.io/badge/Zod-3E67B1?style=flat-square&logo=zod&logoColor=white)](https://zod.dev/)

<br/>

[Documentação](./docs/README.md) · [Cobertura](./docs/coverage/README.md) · [Troubleshooting](./docs/guides/troubleshooting.md) · [Tempo E2E](./docs/reports/e2e-timing-report.md) · [Como executar](#como-executar)

</div>

---

## Índice

- [Visão Geral](#visão-geral)
- [Stack e Dependências](#stack-e-dependências)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funil de Cotação Auto](#funil-de-cotação-auto)
- [Massa de Dados](#massa-de-dados)
- [Como Executar](#como-executar)
- [Estratégia de Tags](#estratégia-de-tags)
- [Relatórios](#relatórios)
- [Arquitetura e Padrões](#arquitetura-e-padrões)
- [Agentes de IA (Playwright Agents)](#agentes-de-ia-playwright-agents)
- [Qualidade e CI/CD](#qualidade-e-cicd)
- [Troubleshooting](#troubleshooting)
- [Contribuindo](#contribuindo)

---

## Visão Geral

Este repositório automatiza os principais fluxos da Youse em três camadas:

| Camada                                                                                                    | O que cobre                                                           | Pasta             |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------- |
| <img src="https://cdn.simpleicons.org/playwright/2EAD33" height="20" align="top" alt="" /> **E2E**        | Fluxo completo de cotação e contratação de seguro auto no navegador   | `tests/spec/e2e/` |
| <img src="https://cdn.simpleicons.org/openapiinitiative/6BA539" height="20" align="top" alt="" /> **API** | Regra de negócio e contratos (pricing, claims, test-utils)            | `tests/spec/api/` |
| <img src="https://cdn.simpleicons.org/chartdotjs/FF6384" height="20" align="top" alt="" /> **Pricing**    | Variação de preços por variáveis de risco e integridade de coberturas | `tests/spec/e2e/` |

---

## Stack e Dependências

|                                                                                          | Ferramenta                                  | Versão | Finalidade                                        |
| ---------------------------------------------------------------------------------------- | ------------------------------------------- | ------ | ------------------------------------------------- |
| <img src="https://cdn.simpleicons.org/playwright/2EAD33" height="22" alt="Playwright" /> | [@playwright/test](https://playwright.dev/) | ^1.55  | Framework de testes E2E e API                     |
| <img src="https://cdn.simpleicons.org/typescript/3178C6" height="22" alt="TypeScript" /> | TypeScript                                  | ^5     | Linguagem de implementação                        |
| <img src="https://cdn.simpleicons.org/faker/CCAA00" height="22" alt="Faker" />           | @faker-js/faker                             | ^10    | Geração de dados dinâmicos (nomes, e-mails, etc.) |
| <img src="https://cdn.simpleicons.org/npm/CB3837" height="22" alt="npm" />               | proxymise                                   | ^1.0   | Encadeamento fluente de Page Objects              |
| <img src="https://cdn.simpleicons.org/zod/3E67B1" height="22" alt="Zod" />               | zod                                         | ^4     | Validação de schemas de resposta de API           |
| <img src="https://cdn.simpleicons.org/allure/FF6B00" height="22" alt="Allure" />         | allure-playwright                           | ^3     | Relatórios Allure                                 |
| <img src="https://cdn.simpleicons.org/jira/0052CC" height="22" alt="Jira" />             | playwright-zephyr                           | ^1     | Integração com Zephyr Scale (Jira)                |

---

## Pré-requisitos

|                                                                                        | Requisito         | Detalhe                                     |
| -------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------- |
| <img src="https://cdn.simpleicons.org/nodedotjs/339933" height="22" alt="Node.js" />   | **Node.js v18+**  | [Download](https://nodejs.org/)             |
| <img src="https://cdn.simpleicons.org/npm/CB3837" height="22" alt="npm" />             | **npm v9+**       | Vem junto com o Node                        |
| <img src="https://cdn.simpleicons.org/googlechrome/4285F4" height="22" alt="Chrome" /> | **Google Chrome** | Para execuções locais sem `CI=true`         |
|                                                                                        | **VPN Youse**     | Obrigatória para ambientes `qa` e `staging` |

Verifique sua versão:

```bash
node -v   # deve ser >= 18
npm -v    # deve ser >= 9
```

---

## Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/youse-seguradora/qa-e2e-tests-automation.git
cd qa-e2e-tests-automation

# 2. Instale as dependências do projeto
npm install

# 3. Instale os browsers gerenciados pelo Playwright (necessário para CI/headless)
npx playwright install chromium
```

---

## Configuração

Crie um arquivo `.env` na raiz do projeto com as variáveis abaixo.
Se não existir `.env.example`, crie o arquivo manualmente:

```bash
# .env (não commitar!)
BASE_URL=https://qa-cotacao.youse.io/seguro-auto
TEST_UTILS_URL=https://qa-test-utils-service.youse.io/v1/orders
BFF_URL=https://qa-bff.youse.io
ZEPHYR_API_TOKEN=         # obtenha no Jira — necessário apenas para reportar ao Zephyr
ZEPHYR_PROJECT_KEY=POSV
CILIA_TOKEN=              # token do serviço de sinistros
```

| Variável             | Descrição                                                              | Padrão                                             |
| -------------------- | ---------------------------------------------------------------------- | -------------------------------------------------- |
| `BASE_URL`           | URL base do frontend de cotação                                        | `https://qa-cotacao.youse.io/seguro-auto`          |
| `TEST_UTILS_URL`     | URL do serviço de massa de dados                                       | `https://qa-test-utils-service.youse.io/v1/orders` |
| `BFF_URL`            | URL do BFF                                                             | `https://qa-bff.youse.io`                          |
| `ZEPHYR_API_TOKEN`   | Token do Zephyr Scale (Jira)                                           | —                                                  |
| `ZEPHYR_PROJECT_KEY` | Chave do projeto no Zephyr                                             | `POSV`                                             |
| `CILIA_TOKEN`        | Token do serviço Cilia (sinistros)                                     | —                                                  |
| `CI`                 | Se `true`, ativa modo headless e 4 workers                             | —                                                  |
| `PW_WORKERS`         | Override de workers (local: padrão Playwright `50%` dos cores lógicos) | —                                                  |

> **Nunca commite o `.env`.** Ele está no `.gitignore`.
> Para executar localmente **sem** o Zephyr, use `--reporter=list` (veja [Como Executar](#como-executar)).

---

## Estrutura do Projeto

```
qa-e2e-tests-automation/
│
├── config/
│   └── test.config.ts              # Configurações globais lidas do .env (URLs, credenciais)
│
├── docs/                           # Documentação (índice: docs/README.md)
│   ├── planners/                   # Planos de cenário (planner-*.md) — input dos Agents
│   ├── coverage/                   # Cobertura funcional: README + sync-report + metrics
│   ├── guides/                     # Guias de manutenção (troubleshooting)
│   └── reports/                    # Relatórios auto-gerados (tempo E2E)
│
├── tests/
│   │
│   ├── data/                       # Massa de dados de teste
│   │   ├── cpf.ts                  # CPFs com status conhecido (aceitos, recusados por PEP/blacklist, etc.)
│   │   ├── cep.ts                  # Pool de 20 CEPs reais validados no ViaCEP (cobertura geográfica nacional)
│   │   ├── plate.ts                # Placas com status conhecido (aceitas, leilão, etc.)
│   │   ├── generators.ts           # Geração dinâmica com Faker (usa pool de CEPs reais)
│   │   └── plans.ts                # Catálogo de planos (coberturas, assistências, preços de referência)
│   │
│   ├── enum/                       # Enumerações reutilizáveis entre specs
│   │   ├── MaritalStatuses.ts      # Estado civil (solteiro, casado, etc.)
│   │   ├── Product.ts              # Produto (auto, home, life)
│   │   ├── UserBonusClass.ts       # Classes de bônus (0–10) com % de desconto
│   │   └── VehicleUsages.ts        # Tipos de uso do veículo (Particular, App, Comercial, etc.)
│   │
│   ├── fixtures/                   # Setup de pré-condições via test.extend()
│   │   ├── matchers.ts             # Custom matcher: toMatchSchema (valida resposta contra schema Zod)
│   │   ├── setupClaim.ts           # Pré-condições para testes de sinistro
│   │   ├── setupPolicy.ts          # Pré-condições para testes de apólice
│   │   └── setupQuotation.ts       # Gera QuotationData (faker) e injeta todos os Page Objects
│   │
│   ├── pages/                      # Page Objects — toda interação com a UI fica aqui
│   │   ├── BasePage.ts             # Classe base com métodos comuns (fill, click, waitFor, etc.)
│   │   └── quotation/              # Um arquivo por tela do funil de cotação
│   │       ├── QuotationPageLayout.ts           # Base compartilhada: botão "Continuar" + navegação tipada
│   │       ├── LeadInfoPage.ts                  # Etapa 1 — Nome, e-mail e telefone
│   │       ├── VehicleDetailsPage.ts            # Etapa 2 — Placa, zero km, blindado
│   │       ├── VehicleAdditionalDetailsPage.ts  # Etapa 3 — CEP, número, garagem, uso
│   │       ├── PersonDataPage.ts                # Etapa 4 — CPF e estado civil
│   │       ├── BonusesClassPage.ts              # Etapa 5 — Histórico de seguro e Classe de Bônus
│   │       ├── PlanSelectionPage.ts             # Etapa 6 — Seleção do plano (com captura de preço)
│   │       ├── CoveragesSelectionPage.ts        # Etapa 7a — Personalização de coberturas (franquia, indenização)
│   │       ├── AssistancesSelectionPage.ts      # Etapa 7b — Seleção de assistências (13 opções)
│   │       ├── CheckoutPage.ts                  # Etapa 8 — Pagamento via cartão de crédito
│   │       └── IssuancePage.ts                  # Etapa 9 — Confirmação da apólice
│   │
│   ├── schemas/                    # Schemas Zod para validação de contratos de API
│   │   ├── bff/
│   │   │   └── CiliaClaimAuthSchemas.ts
│   │   └── test-utils/
│   │       └── TestUtilsServiceSchemas.ts
│   │
│   ├── services/                   # Clientes HTTP para APIs internas
│   │   ├── bff/
│   │   │   └── CiliaClaimAuth.ts
│   │   ├── test-utils/
│   │   │   └── TestUtilsService.ts
│   │   └── quotation/
│   │       └── QuotationPricingService.ts
│   │
│   ├── types/                      # Declarações de tipos para pacotes sem @types
│   │   └── cpf-cnpj-validator.d.ts
│   │
│   └── spec/                       # Arquivos de teste (specs)
│       ├── seed.spec.ts            # Seed para gravar novos testes com Playwright Agents
│       ├── api/
│       │   ├── README.md
│       │   ├── quotation/                  # Preço, planos, coberturas (@api @pricing)
│       │   ├── ciliaClaimAuth.spec.ts      # Autenticação de sinistro via WhatsApp
│       │   └── testUtils.spec.ts           # Testes do serviço de massa de dados
│       └── e2e/
│           ├── README.md                 # Organização journeys / ux / blockers / regression
│           ├── journeys/                 # Fluxos E2E completos (@journey)
│           ├── ux/                       # Usabilidade por tela (@ux @smoke)
│           ├── blockers/                 # Cenários negativos (@negative)
│           └── regression/               # Preço, coberturas, assistências (@regression)
│
├── .github/
│   ├── CODEOWNERS                  # Ownership de arquivos críticos
│   ├── pull_request_template.md    # Checklist automático ao abrir PRs
│   └── workflows/
│       └── ci.yml                  # Pipeline CI: validate → test (4 shards) → merge-report
│
├── playwright.config.ts            # Configuração principal: projetos, reporters, timeouts, retries
└── tsconfig.json
```

---

## Funil de Cotação Auto

O fluxo principal cobre 9 etapas, cada uma com seu Page Object:

```
  ┌──────────────────┐    ┌────────────────────┐    ┌────────────────────────────────┐
  │  LeadInfoPage    │───▶│  VehicleDetailsPage │───▶│ VehicleAdditionalDetailsPage   │
  │  (Nome/Email/Tel)│    │  (Placa/ZeroKm)     │    │ (CEP / Uso / Garagem)          │
  └──────────────────┘    └────────────────────┘    └────────────────────────────────┘
                                                                      │
                                                                      ▼
                                                          ┌────────────────────┐
                                                          │  PersonDataPage    │
                                                          │  (CPF / Est. Civil)│
                                                          └────────────────────┘
                                                                      │
                                                                      ▼
                                                          ┌────────────────────┐
                                                          │  BonusesClassPage  │
                                                          │  (Histórico/Bônus) │
                                                          └────────────────────┘
                                                                      │
                                                                      ▼
                                              ┌───────────────────────────────────────┐
                                              │         PlanSelectionPage             │
                                              │  (Essencial / Regular / Auto 1504 /   │
                                              │   Personalizado)                      │
                                              └───────────────────────────────────────┘
                                                       │                    │
                               [Quero Esse]            │                    │ [Personalizar]
                                                       ▼                    ▼
                                              ┌────────────────┐  ┌────────────────────────┐
                                              │  CheckoutPage  │  │ CoveragesSelectionPage │
                                              │  (Cartão/Pagar)│  │ (10 coberturas,        │
                                              └────────────────┘  │  franquia, indenização)│
                                                       │          └────────────────────────┘
                                                       │                    │
                                                       │                    ▼
                                                       │       ┌────────────────────────┐
                                                       │       │AssistancesSelectionPage│
                                                       │       │ (13 assistências)      │
                                                       │       └────────────────────────┘
                                                       │                    │
                                                       └──────────┬─────────┘
                                                                  ▼
                                                       ┌────────────────────┐
                                                       │   IssuancePage     │
                                                       │   (Apólice/Sucesso)│
                                                       └────────────────────┘
```

**Comportamento pós-pagamento no QA**

O ambiente QA tem múltiplos caminhos após finalizar o pagamento:

| Caminho | URL de destino             | Quando ocorre                               |
| ------- | -------------------------- | ------------------------------------------- |
| A       | `/sucesso`                 | Webhook processado com sucesso              |
| B       | `/issuance` → `/sucesso`   | Intermediário; aguarda "Pagamento aprovado" |
| C       | `youse.com.br`             | Redirect externo após confirmação           |
| D       | `/issuance` (sem redirect) | Webhook pendente — aceito como válido em QA |
| E       | `/checkout` com erro       | CPF com restrição recusado no pagamento     |

O `CheckoutPage.clickFinishBtn()` lida automaticamente com todos esses caminhos via `Promise.race`.

---

## Massa de Dados

### Dados dinâmicos — `fixtures/setupQuotation.ts`

A fixture `quotationData` gera dados únicos por execução via Faker. Valores padrão:

| Campo               | Valor padrão                               |
| ------------------- | ------------------------------------------ |
| `licensePlate`      | `YOU-0020` (placa de teste aceita pelo QA) |
| `zipCode`           | `04777-020` (São Paulo — risco médio)      |
| `documentNumber`    | `123.456.761-08` (CPF aceito)              |
| `creditCard.number` | `4111 1111 1111 1111` (cartão de teste)    |

### CEPs — `data/cep.ts`

Pool de 20 CEPs reais validados no ViaCEP, cobrindo SP, RJ, MG, RS, PR, BA, PE, CE, DF e GO.
O `generators.ts` usa este pool automaticamente — nunca use `faker.location.zipCode()` diretamente.

```ts
import { getRandomCep } from '../../data/cep';

// CEP aleatório de qualquer estado
const cep = getRandomCep().cep;

// CEP de estado específico
const cepSP = getRandomCep('SP').cep;
```

> **Por que não Faker?** `faker.location.zipCode('#####-###')` gera sequências numéricas aleatórias que não correspondem a CEPs reais — causam falha na validação de endereço do backend QA.

### Dados estáticos — `data/cpf.ts` e `data/plate.ts`

Use quando o cenário depende de um **comportamento específico** do CPF ou placa:

```ts
import { cpf } from '../../data/cpf';
import { plate } from '../../data/plate';

// Cenário de bloqueio por CPF PEP
await personDataPage.fillDocumentNumber(cpf.pepRefusedInsured.number);

// Cenário de bloqueio por veículo de leilão
await vehicleDetailsPage.fillLicensePlate(plate.refusedAuction.number);
```

**Categorias de CPF disponíveis (`data/cpf.ts`):**

| Categoria               | Chave de exemplo                  | Quando usar                   |
| ----------------------- | --------------------------------- | ----------------------------- |
| Aceito                  | `accepted`, `acceptedPool[n]`     | Caminho feliz                 |
| Recusado — PEP          | `pepRefusedInsured`               | Teste de bloqueio no checkout |
| Recusado — blacklist    | `crivoRefusedInsuredCpfBlacklist` | Teste de bloqueio no checkout |
| Recusado — morte        | `crivoRefusedInsuredDeath`        | Teste de bloqueio no checkout |
| Negado — nome           | `crivoDeniedInsuredName`          | Teste de campos inválidos     |
| Negado — não encontrado | `crivoDeniedCpfNotFound`          | Teste de CPF inexistente      |
| Risco sistêmico         | `riskRatioHighRisk`               | Teste de bloqueio por risco   |

### Catálogo de planos — `data/plans.ts`

Fonte de verdade para coberturas, assistências e preços de referência:

```ts
import { plans, orderedPlans } from '../../data/plans';

// Coberturas esperadas no card do Essencial
const keywordsEssencial = plans['Essencial'].coverageKeywords;

// Planos em ordem crescente de preço (para testes ordinais)
for (const plan of orderedPlans) {
  const preco = await planSelectionPage.getPlanMonthlyPriceValue(plan.name);
}
```

---

## Como Executar

> **Importante:** localmente, sempre adicione `--reporter=list` para evitar erro de `ZEPHYR_API_TOKEN` não configurado.

### Todos os testes E2E

```bash
npx playwright test tests/spec/e2e --project=chromium --reporter=list
```

### Um spec específico

```bash
# Caminho feliz da cotação
npx playwright test tests/spec/e2e/journeys --project=chromium --reporter=list

# Testes de preços
npx playwright test precosPlanos --project=chromium --reporter=list

# Coberturas e assistências dos planos pré-formatados
npx playwright test coberturas --project=chromium --reporter=list

# Assistências — visibilidade e impacto de preço
npx playwright test assistencias --project=chromium --reporter=list

# Personalização de coberturas/assistências + E2E completo do plano personalizado
npx playwright test personalizacao --project=chromium --reporter=list

# Classe de Bônus
npx playwright test validateBonusClass --project=chromium --reporter=list
```

### Apenas testes de API

```bash
npm run test:api              # claims + test-utils + quotation
npm run test:api:quotation    # pricing / cotação (@pricing)

# equivalente explícito
npx playwright test tests/spec/api --project=chromium --reporter=list
```

Guia de migração E2E → API: [`docs/guides/api-quotation-layer.md`](docs/guides/api-quotation-layer.md).

### Por tag

```bash
# Smoke (roda a cada PR — rápido)
npx playwright test --grep "@smoke" --reporter=list

# Regressão (nightly)
npx playwright test --grep "@regression" --reporter=list

# Testes de preço (on release)
npx playwright test --grep "@price" --reporter=list

# Somente cotação auto
npx playwright test --grep "@quotation_auto" --reporter=list
```

### Modo headless (CI ou sem abrir navegador)

```bash
CI=true npx playwright test --reporter=list
```

### Debug interativo (abre o browser e pausa no erro)

```bash
npx playwright test --debug
```

---

## Estratégia de Tags

As tags organizam os testes por pipeline e finalidade. Use sempre `--grep` para filtrar:

| Tag               | Quando executar                                | Tempo estimado                       |
| ----------------- | ---------------------------------------------- | ------------------------------------ |
| `@smoke`          | A cada PR (`npm run test:smoke`)               | ~5–10 min                            |
| `@ux`             | Usabilidade por tela (PR)                      | ~5 min                               |
| `@journey`        | Jornadas E2E completas (nightly)               | ~15–30 min                           |
| `@a11y`           | On release / PR (com VPN)                      | ~15–25 min (mobile + tablet)         |
| `@regression`     | Nightly                                        | ~20 min                              |
| `@price`          | On release                                     | ~30 min (cotações duplas são lentas) |
| `@sanity`         | On release                                     | ~5 min                               |
| `@b2c`            | Todos os testes de jornada B2C                 | —                                    |
| `@quotation_auto` | Todos os testes do funil de cotação            | —                                    |
| `@happy_path`     | Somente caminho feliz                          | —                                    |
| `@bonus_class`    | Testes de Classe de Bônus                      | —                                    |
| `@coberturas`     | Testes de coberturas e assistências dos planos | —                                    |
| `@personalizacao` | Testes do fluxo de personalização do plano     | —                                    |
| `@assistencias`   | Testes de impacto de assistências no prêmio    | —                                    |

---

## Relatórios

### HTML (Playwright nativo)

Gerado automaticamente em `playwright-report/` após cada execução:

```bash
npx playwright show-report
```

### Allure

```bash
# Gera o relatório a partir dos resultados em allure-results/
npm run allure:generate

# Abre o relatório no navegador
npm run allure:open

# Ou sobe um servidor local e já abre
npm run allure:serve
```

### Zephyr Scale (Jira)

Funciona automaticamente quando `ZEPHYR_API_TOKEN` está configurado no `.env`.
Os testes são vinculados ao projeto `POSV` por padrão.

```bash
# Execução com reporte ao Zephyr (CI ou com token configurado)
npx playwright test tests/spec/e2e --project=chromium
```

---

## Arquitetura e Padrões

### Page Object Model (POM)

Toda interação com a UI fica encapsulada em classes em `tests/pages/`. Os specs nunca usam `page.locator()` diretamente.

```
Spec ──▶ Fixture ──▶ Page Object ──▶ Browser
```

### Custom Fixtures (`test.extend`)

Em vez de instanciar Page Objects manualmente, eles são injetados via fixture:

```ts
// ✅ Correto — via fixture
import { test } from '../../fixtures/setupQuotation';

test('exemplo', async ({ planSelectionPage, quotationData }) => {
  await planSelectionPage.getPlanMonthlyPriceValue('Essencial');
});

// ❌ Evitar — instância manual
import { PlanSelectionPage } from '../../pages/quotation/PlanSelectionPage';
const page = new PlanSelectionPage(page); // acoplamento desnecessário
```

### Encadeamento fluente com `proxymise`

O `proxymise` permite chamar métodos em cadeia sem `await` em cada linha:

```ts
// Fluente (proxymise)
const checkoutPage = await LeadInfoPage.open(page).fillLeadData(data).clickContinueBtn().fillLicensePlate(data.licensePlate).clickContinueBtn();

// Sem proxymise (mais verboso)
const lead = await LeadInfoPage.open(page);
await lead.fillLeadData(data);
const vehicle = await lead.clickContinueBtn();
await vehicle.fillLicensePlate(data.licensePlate);
const checkout = await vehicle.clickContinueBtn();
```

### Validação de preços sem valores absolutos

O motor de precificação é dinâmico — os preços mudam com reajustes tarifários, campanhas e tabela FIPE. Por isso, os testes de preço usam **relações ordinais** e **faixas percentuais** em vez de valores fixos:

```ts
// ✅ Ordinal — não falha com reajuste
expect(precoEssencial).toBeLessThan(precoRegular);

// ✅ Tolerância — aceita variação de ±2%
expectPriceWithinTolerance(preco1, preco2, 2);

// ❌ Valor absoluto — falha com qualquer reajuste
expect(precoEssencial).toBe(2205.92);
```

### Seletores — prioridade

1. `getByRole` — acessibilidade em primeiro lugar
2. `getByLabel` / `getByText`
3. `getByTestId`
4. `locator('[data-testid="..."]')`
5. CSS/XPath — **evitar**; usar apenas como último recurso

### Nomenclatura

| Item               | Convenção                        | Exemplo                                  |
| ------------------ | -------------------------------- | ---------------------------------------- |
| Arquivos de página | PascalCase + `Page.ts`           | `LeadInfoPage.ts`                        |
| Arquivos de spec   | camelCase + `.spec.ts`           | `journeys/cotacao-plano-regular.spec.ts` |
| Métodos de ação    | camelCase, verbo + substantivo   | `fillLicensePlate()`                     |
| Tags de teste      | kebab-case com `@`               | `@b2c`, `@happy_path`, `@price`          |
| Branches           | `feature/`, `bugfix/`, `hotfix/` | `feature/assistencia`                    |

### Commits

Padrão [Conventional Commits](https://www.conventionalcommits.org/) em PT-BR:

```
feat: adiciona testes de variação de preço por uso do veículo
fix: corrige seletor do botão Finalizar no checkout
refactor: extrai catálogo de planos para data/plans.ts
test: adiciona massa de CPF recusado por blacklist
chore: atualiza Playwright para v1.55
docs: adiciona seção de troubleshooting no README
```

---

## Agentes de IA (Playwright Agents)

O projeto usa os **Playwright Test Agents** integrados ao GitHub Copilot para acelerar a criação de testes.

| Agente        | O que faz                                                      |
| ------------- | -------------------------------------------------------------- |
| **planner**   | Navega no app e gera planos de teste `.md` em `docs/planners/` |
| **generator** | Transforma planos `.md` em specs Playwright executáveis        |
| **healer**    | Executa testes com falha e os corrige automaticamente          |

### Setup inicial (uma vez por máquina)

```bash
npx playwright init-agents
```

Isso cria os arquivos em `.github/agents/` e configura o `.vscode/mcp.json`.

> Os arquivos gerados são locais e **não são versionados**.

### Como usar no VS Code

1. Abra o Chat do Copilot (`Ctrl+Alt+I`)
2. Selecione o agente no dropdown
3. Exemplos de prompt:

```
# Gerar plano de testes para uma nova tela
"Gere um plano de testes para o fluxo de sinistro por WhatsApp"

# Gerar spec a partir de um plano existente
"Gere os testes a partir de docs/planners/planner-precos.md"

# Corrigir um teste falhando
"O teste coberturas.spec.ts está falhando no selector do card — corrija"
```

---

## Qualidade e CI/CD

### Scripts disponíveis

```bash
# Valida tudo de uma vez (typecheck + lint + format) — use antes de abrir um PR
npm run validate

# Checagem de tipos TypeScript sem compilar
npm run typecheck

# ESLint com regras Playwright
npm run lint
npm run lint:fix        # corrige automaticamente o que for possível

# Prettier
npm run format         # formata todos os arquivos
npm run format:check   # apenas verifica sem alterar (usado no CI)

# Atalhos para execução de testes
npm run test:smoke      # apenas testes @smoke
npm run test:regression # apenas testes @regression E2E
npm run test:api        # testes HTTP (api/)
npm run test:api:quotation  # pricing / opin-service (@pricing)
npm run test:a11y       # smoke axe mobile (Pixel 5) + tablet (iPad) — navegador visível · VPN
npm run test:keyboard   # navegação por teclado (@keyboard) — navegador visível · VPN

# Relatório de tempo E2E (gera docs/reports/e2e-timing-report.md)
npm run test:e2e:timing                          # roda tests/spec/e2e + gera relatório (~30 min)
npm run e2e:timing:generate                      # lê reports/e2e-timing-raw.json
npm run e2e:timing:generate -- --from-log arquivo.log  # a partir do stdout do reporter list

# Cobertura funcional (gera docs/coverage/sync-report.md + metrics.json)
npm run coverage:sync
npm run coverage:check   # validação CI — falha se mapa front × POM desatualizado
```

### Documentação

Índice central em [`docs/README.md`](docs/README.md):

| Pasta                              | Conteúdo                                                         |
| ---------------------------------- | ---------------------------------------------------------------- |
| [`docs/planners/`](docs/planners/) | Planos de cenário (`planner-*.md`) — input dos Playwright Agents |
| [`docs/coverage/`](docs/coverage/) | Cobertura funcional front × automação                            |
| [`docs/guides/`](docs/guides/)     | Guias de manutenção (troubleshooting, a11y, fluxos)              |
| [`docs/reports/`](docs/reports/)   | Relatórios auto-gerados (tempo E2E)                              |

### Pre-commit (Husky + lint-staged)

Git hooks em [`.husky/pre-commit`](.husky/pre-commit) rodam **antes de cada `git commit`**. O hook chama `npx lint-staged`, que valida **somente os arquivos no stage** (rápido — não varre o projeto inteiro).

Regras definidas em [`package.json`](package.json) → `"lint-staged"`:

| Arquivos staged      | O que roda                             |
| -------------------- | -------------------------------------- |
| `**/*.ts`            | ESLint (`--max-warnings=0`) + Prettier |
| `**/*.{json,yml,md}` | Prettier                               |

**Fluxo:**

```
git commit  →  .husky/pre-commit  →  lint-staged  →  ESLint + Prettier nos staged
                                                          ↓
                                              passou? commit gravado
                                              falhou? commit cancelado
```

**O que você vê no terminal** (exemplo quando passa):

```
✔ Running tasks for staged files...
✔ Staging changes from tasks...
[feature/assistencia abc1234] sua mensagem
```

Se o Prettier corrigir formatação, ele re-adiciona o arquivo ao stage automaticamente (`Staging changes from tasks`).

**Testar sem commitar:**

```bash
git add <arquivo>
npx lint-staged --verbose
```

**Ativação:** após `npm install`, o script `"prepare": "husky"` registra os hooks. Não precisa rodar nada manualmente.

**Pular o hook** (só em emergência):

```bash
git commit --no-verify -m "mensagem"
```

Se o ESLint falhar, leia o erro no terminal, corrija, `git add` de novo e tente o commit outra vez.

### GitHub Actions (CI)

O pipeline roda automaticamente em **todo push e Pull Request** para `main`:

```
[validate]  typecheck + lint + format:check (~5 min)
    │
    ▼
[test]      4 shards paralelos do Playwright (~60 min)
    │
    ▼
[merge-report]  consolida os relatórios HTML de todos os shards
```

| Job            | O que faz                                     |
| -------------- | --------------------------------------------- |
| `validate`     | Typecheck, lint e format check                |
| `test` (×4)    | Executa 1/4 dos testes por shard em paralelo  |
| `merge-report` | Consolida os relatórios blob em um HTML único |

Os relatórios são publicados como artifact `playwright-report-full` e ficam disponíveis por 30 dias.
Em caso de falha, os traces e screenshots são salvos em `debug-artifacts-shard-N`.

---

## Troubleshooting

Erros comuns ao rodar ou manter a suite. Guia completo: **[`docs/guides/troubleshooting.md`](docs/guides/troubleshooting.md)**

| Sintoma                                | Correção rápida                                                                    |
| -------------------------------------- | ---------------------------------------------------------------------------------- |
| `strict mode violation` em botão "Não" | `{ exact: true }` no `getByRole`                                                   |
| 2ª cotação trava / timeout na placa    | `resetSession(page)` — limpar storage **antes** de `about:blank`                   |
| Plano "Auto 1504" não encontrado       | `planCard('Auto 1504')` no `PlanSelectionPage` (regex)                             |
| `authorizationToken is required`       | `npx playwright test --reporter=list`                                              |
| `asynckit/lib/iterate`                 | Reinstalar pacote — ver [guia](docs/guides/troubleshooting.md#asynckit-corrompido) |

---

## Contribuindo

1. Crie uma branch a partir de `main`:

```bash
git checkout -b feature/nome-da-feature
```

2. Implemente seguindo as convenções do projeto

3. Valide o projeto antes de commitar:

```bash
npm run validate
```

4. Rode os testes afetados localmente:

```bash
npx playwright test tests/spec/e2e --project=chromium --reporter=list
```

5. Abra um Pull Request para `main` com:
   - Descrição clara do que foi testado
   - Print ou vídeo do teste rodando (se for novo spec)
   - Evidência de que os testes existentes continuam passando
