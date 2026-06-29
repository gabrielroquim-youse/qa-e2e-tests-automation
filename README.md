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

[Documentação](./docs/README.md) · [Cobertura](./docs/coverage/README.md) · [Dashboard tempo E2E](./docs/reports/e2e-timing-report.md) · [Dashboard suíte completa](./docs/reports/full-suite-timing-report.md) · [Troubleshooting](./docs/guides/troubleshooting.md) · [Como executar](#como-executar)

</div>

---

> **Novo no projeto? Comece aqui:**
>
> ```bash
> npm install && npx playwright install chromium
> cp .env.example .env          # preencha BASE_URL e ative VPN Youse
> npm run test:smoke             # ~5 min · valida que tudo funciona
> ```
>
> Dúvidas? → [Troubleshooting](./docs/guides/troubleshooting.md) · [Boas práticas](./docs/guides/boas-praticas.md)

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
- [Boas práticas (guia completo)](./docs/guides/boas-praticas.md)
- [Agentes de IA](#agentes-de-ia)
- [Qualidade e CI/CD](#qualidade-e-cicd)
- [Troubleshooting](#troubleshooting)
- [Contribuindo](#contribuindo)

---

## Visão Geral

Este repositório automatiza **experiência do cliente no navegador** (Seguro Auto B2C Youse): jornadas, usabilidade por tela, validação de formulário, bloqueios visíveis e a11y. Regras de preço e contrato HTTP ficam no repo irmão **`qa-api-tests-automation`**.

**Cobertura funcional atual:** ver [`docs/coverage/README.md`](docs/coverage/README.md) (**91%** · 73 testes E2E · 30 UX).

### Dashboards (métricas e execuções)

| Dashboard                                                                              | O que mostra                      | Atualizar com                                         |
| -------------------------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------- |
| [`docs/coverage/README.md`](docs/coverage/README.md)                                   | % cobertura CAP, gaps, POMs       | `npm run coverage:sync`                               |
| [`docs/reports/e2e-timing-report.md`](docs/reports/e2e-timing-report.md)               | Tempo por teste/spec (última run) | `npm run test:e2e:timing` ou `npm run test:ux:timing` |
| [`docs/reports/e2e-timing-log.md`](docs/reports/e2e-timing-log.md)                     | Histórico de execuções E2E        | idem (acumula até 100 runs)                           |
| [`docs/reports/full-suite-timing-report.md`](docs/reports/full-suite-timing-report.md) | E2E + API + A11y consolidado      | `npm run test:full:timing`                            |
| [`docs/reports/history/`](docs/reports/history/)                                       | Snapshot JSON/MD por execução     | gerado automaticamente                                |

JSON para BI: [`docs/coverage/metrics.json`](docs/coverage/metrics.json) · [`docs/reports/e2e-timing.json`](docs/reports/e2e-timing.json)

| Camada                 | Repositório               | O que cobre                                    | Pasta principal                       |
| ---------------------- | ------------------------- | ---------------------------------------------- | ------------------------------------- |
| **E2E / UX**           | **este repo**             | Jornada, usabilidade, bloqueios, a11y          | `tests/spec/e2e/`, `tests/spec/a11y/` |
| **API cotação**        | `qa-api-tests-automation` | Preço, bônus, coberturas, assistências (apiws) | `tests/spec/quotation/`               |
| **API sinistro/utils** | **este repo**             | Cilia auth, test-utils                         | `tests/spec/api/`                     |

Pirâmide detalhada: [`docs/guides/api-quotation-layer.md`](docs/guides/api-quotation-layer.md)

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
│   ├── helpers/                    # Navegação e asserções compartilhadas
│   │   ├── funnel.ts               # navigateToPlans, navigateToCheckout, resetSession…
│   │   └── formValidation.ts       # CAP-02: expectContinueDisabled, expectFieldInvalid…
│   │
│   ├── pages/                      # Page Objects — toda interação com a UI fica aqui
│   │   ├── BasePage.ts             # Classe base com métodos comuns (fill, click, waitFor, etc.)
│   │   └── quotation/              # Um arquivo por tela do funil de cotação
│   │       ├── QuotationPageLayout.ts           # Base compartilhada: botão "Continuar" + navegação tipada
│   │       ├── LeadInfoPage.ts                  # Etapa 1 — Nome, e-mail e telefone
│   │       ├── VehicleDetailsPage.ts            # Etapa 2 — Placa, zero km, blindado
│   │       ├── VehicleAdditionalDetailsPage.ts  # Etapa 3 — CEP, número, garagem, uso
│   │       ├── PersonDataPage.ts                # Etapa 4 — CPF e estado civil
│   │       ├── DataEnrichmentPage.ts            # Enriquecimento pós-CPF (quando exibido)
│   │       ├── BonusesClassPage.ts              # Etapa 5 — Histórico de seguro e Classe de Bônus
│   │       ├── PlanSelectionPage.ts             # Etapa 6 — Seleção do plano (com captura de preço)
│   │       ├── CoveragesSelectionPage.ts        # Etapa 7a — Personalização de coberturas (franquia, indenização)
│   │       ├── AssistancesSelectionPage.ts      # Etapa 7b — Seleção de assistências (13 opções)
│   │       ├── RiskAcceptancePage.ts            # Aceite de risco (sem garagem → antes do checkout)
│   │       ├── CheckoutPage.ts                  # Etapa 8 — Pagamento, upsells, accordion
│   │       └── IssuancePage.ts                  # Etapa 9 — Confirmação da apólice
│   │
│   ├── schemas/                    # Schemas Zod para validação de contratos de API
│   │   ├── bff/
│   │   │   └── CiliaClaimAuthSchemas.ts
│   │   └── test-utils/
│   │       └── TestUtilsServiceSchemas.ts
│   │
│   ├── services/                   # Clientes HTTP (legado cotação → ver repo API)
│   │   ├── bff/
│   │   │   └── CiliaClaimAuth.ts
│   │   └── test-utils/
│   │       └── TestUtilsService.ts
│   │
│   ├── types/                      # Declarações de tipos para pacotes sem @types
│   │   └── cpf-cnpj-validator.d.ts
│   │
│   └── spec/                       # Arquivos de teste (specs)
│       ├── seed.spec.ts            # Seed para gravar novos testes com Playwright Agents
│       ├── a11y/                   # WCAG, teclado, mobile/tablet (@a11y)
│       ├── tools/                  # Captura de contrato apiws (não é pipeline) — ver README
│       ├── api/
│       │   ├── README.md
│       │   ├── ciliaClaimAuth.spec.ts      # Sinistro WhatsApp
│       │   ├── testUtils.spec.ts           # Massa de dados QA
│       │   └── quotation/                  # Redirecionado → qa-api-tests-automation
│       └── e2e/
│           ├── README.md                 # journeys / ux / blockers / regression
│           ├── ux/README.md              # usabilidade por tela (CAP-02) — 10 specs, 30 testes
│           ├── journeys/                 # Fluxos E2E completos (@journey)
│           ├── ux/                       # Usabilidade por tela (@ux @smoke)
│           ├── blockers/                 # Cenários negativos (@negative)
│           └── regression/               # UX restante (preço → repo API)
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

Catálogo de CPFs, placas, CEPs, planos e valores padrão da fixture: **[`tests/data/README.md`](tests/data/README.md)**

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

# Usabilidade por tela (recomendado --workers=1)
npm run test:ux
# ou:
npx playwright test tests/spec/e2e/ux --project=chromium --workers=1 --reporter=list

# Validação de formulário (CAP-02 — etapas 1 a 5)
npx playwright test tests/spec/e2e/ux/lead-info.spec.ts tests/spec/e2e/ux/vehicle-details.spec.ts tests/spec/e2e/ux/vehicle-additional.spec.ts tests/spec/e2e/ux/person-data.spec.ts tests/spec/e2e/ux/bonuses-class.spec.ts --project=chromium --reporter=list

# Regressão UX (visibilidade, navegação — preço migrado para API)
npx playwright test tests/spec/e2e/regression --project=chromium --reporter=list

# Classe de Bônus (UX modal/toggle)
npx playwright test validateBonusClass --project=chromium --reporter=list
```

### Precificação e personalização (repo API)

Regras de **preço, bônus, coberturas e assistências** rodam em **`qa-api-tests-automation`** (VPN):

```bash
cd ../qa-api-tests-automation
npm run test:pricing          # @pricing
npm run test:customization    # @customization
npm run test:quotation        # @quotation_auto
```

Guia: [`docs/guides/api-quotation-layer.md`](docs/guides/api-quotation-layer.md)

### API neste repo (sinistro / test-utils)

```bash
npm run test:api              # cilia + test-utils
npx playwright test tests/spec/api --project=chromium --reporter=list
```

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

| Tag               | Quando executar                                          | Tempo estimado                                |
| ----------------- | -------------------------------------------------------- | --------------------------------------------- |
| `@smoke`          | A cada PR (`npm run test:smoke`)                         | ~5–10 min                                     |
| `@ux`             | Usabilidade por tela — formulário, planos, checkout (PR) | ~11–12 min (`npm run test:ux`, `--workers=1`) |
| `@journey`        | Jornadas E2E completas (nightly)                         | ~15–30 min                                    |
| `@a11y`           | On release / PR (com VPN)                                | ~15–25 min (mobile + tablet)                  |
| `@regression`     | Nightly (UX — visibilidade, navegação)                   | ~20 min                                       |
| `@price`          | **Repo API** (`test:pricing`) — não E2E                  | —                                             |
| `@sanity`         | On release                                               | ~5 min                                        |
| `@b2c`            | Todos os testes de jornada B2C                           | —                                             |
| `@quotation_auto` | Todos os testes do funil de cotação                      | —                                             |
| `@happy_path`     | Somente caminho feliz                                    | —                                             |
| `@bonus_class`    | Testes de Classe de Bônus                                | —                                             |
| `@coberturas`     | UX coberturas na tela (preço → repo API)                 | —                                             |
| `@personalizacao` | UX personalização (preço → repo API)                     | —                                             |
| `@assistencias`   | UX assistências (preço → repo API)                       | —                                             |

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

Detalhes e anti-padrões: [`docs/guides/boas-praticas.md`](docs/guides/boas-praticas.md).

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

Todos os commits são validados automaticamente pelo hook `commit-msg` via [`scripts/qa-commit-msg.ts`](scripts/qa-commit-msg.ts).
O padrão é **Conventional Commits em PT-BR**:

| Tipo       | Quando usar                              | Exemplo                                                  |
| ---------- | ---------------------------------------- | -------------------------------------------------------- |
| `feat`     | Nova funcionalidade ou novo teste        | `feat(ux): adiciona spec de validação do CEP`            |
| `fix`      | Correção de bug em teste ou Page Object  | `fix(checkout): corrige seletor do botão Finalizar`      |
| `refactor` | Refatoração sem mudança de comportamento | `refactor: extrai catálogo de planos para data/plans.ts` |
| `test`     | Novo teste ou massa de dados             | `test: adiciona CPF recusado por blacklist`              |
| `chore`    | Dependências, config, CI                 | `chore: atualiza Playwright para v1.55`                  |
| `docs`     | Documentação                             | `docs: adiciona seção de troubleshooting`                |

**Regras validadas automaticamente:**

- Tipo obrigatório: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `perf`, `ci`, `build`, `revert`
- Título em minúsculas (sem capitalizar após o `:`)
- Máximo 72 caracteres no título
- Sem mistura de PT-BR e EN na mesma mensagem

```bash
# Testar uma mensagem antes de commitar
echo 'feat(ux): texto da mensagem' | npx ts-node --transpile-only scripts/qa-commit-msg.ts /dev/stdin
```

---

## Agentes de IA

### GitHub Copilot (VS Code)

As instruções de contexto do repositório estão em [`.github/copilot-instructions.md`](.github/copilot-instructions.md) — aplicadas automaticamente em revisões de código, sugestões e chat do Copilot.

Tópicos cobertos: Playwright antipadrões, estrutura de diretórios, tags obrigatórias, LGPD/segurança, Page Object patterns.

**No chat do VS Code Copilot (`Ctrl+Alt+I`):**

```
# Gerar plano de testes para uma nova tela
"Gere um plano de testes para o fluxo de sinistro por WhatsApp"

# Gerar spec a partir de um plano existente
"Gere os testes a partir de docs/planners/planner-precos.md"

# Corrigir um teste falhando
"O teste coberturas.spec.ts está falhando no selector do card — corrija"
```

### Playwright Agents (Copilot — local)

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
npm run test:ux         # usabilidade por tela (30 testes, ~11 min)
npm run test:regression # apenas testes @regression E2E
npm run test:payment    # pagamento checkout (PIX + cartões Elo/Hipercard)
npm run test:api        # cilia + test-utils (cotação → qa-api-tests-automation)
npm run test:a11y       # smoke axe mobile (Pixel 5) + tablet (iPad) — navegador visível · VPN
npm run test:keyboard   # navegação por teclado (@keyboard) — navegador visível · VPN

# Relatório de tempo E2E (dashboard em docs/reports/)
npm run test:ux:timing                           # UX + atualiza e2e-timing-report (~12 min)
npm run test:e2e:timing                          # toda pasta e2e + relatório (~30 min)
npm run test:full:timing                         # E2E + API + A11y + full-suite-timing-report
npm run e2e:timing:generate                      # lê reports/e2e-timing-raw.json
npm run e2e:timing:generate -- --from-log arquivo.log  # stdout do reporter list

# Cobertura funcional (gera docs/coverage/sync-report.md + metrics.json)
npm run coverage:sync
npm run coverage:check   # validação CI — falha se mapa front × POM desatualizado
```

### Documentação

Índice central em [`docs/README.md`](docs/README.md):

| Pasta                              | Conteúdo                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| [`docs/planners/`](docs/planners/) | Planos de cenário (`planner-*.md`) — input dos Playwright Agents                     |
| [`docs/coverage/`](docs/coverage/) | Cobertura funcional front × automação                                                |
| [`docs/guides/`](docs/guides/)     | Guias (troubleshooting, fluxos, [boas práticas](docs/guides/boas-praticas.md), a11y) |
| [`docs/reports/`](docs/reports/)   | **Dashboards de tempo** (E2E, suíte completa, histórico)                             |

### Git Hooks (Husky)

Três camadas de validação automática, do mais rápido ao mais completo:

| Hook         | Quando dispara         | O que valida                                                                                                                                                                                                              |
| ------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pre-commit` | a cada `git commit`    | `lint-staged` (ESLint + Prettier nos staged) · `typecheck` se houver `.ts` staged · **QA pre-commit checks** (LGPD, antipadrões Playwright, secrets, tags obrigatórias, debug code, tamanho de arquivo, TODOs sem ticket) |
| `commit-msg` | após escrever mensagem | Conventional Commits PT-BR (`feat/fix/refactor/chore/docs/test/...`) · título ≤ 72 chars · heurística anti-mistura de idiomas                                                                                             |
| `pre-push`   | a cada `git push`      | `typecheck` completo · `lint` completo · `format:check` completo                                                                                                                                                          |

Guia completo dos checks e como adicionar novos: **[`docs/guides/pre-commit-checks.md`](docs/guides/pre-commit-checks.md)**.

**Rodar manualmente (sem commitar):**

```bash
npm run qa:precommit    # bateria de checks Youse sobre staged
npm run qa:check        # validate + qa:precommit (espelha o que CI exigirá)
npm run qa:commitmsg -- caminho/COMMIT_EDITMSG
```

**Ativação:** após `npm install`, o script `"prepare": "husky"` registra os hooks. Não precisa rodar nada manualmente.

**Pular hooks em emergência** (sempre com justificativa explícita no PR):

```bash
git commit --no-verify -m "..."
git push --no-verify
```

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

### Fluxo de trabalho com Git

```
git checkout -b feature/nome-da-feature
    │
    │  (desenvolve e faz git add)
    │
    ▼
git commit -m "feat(ux): descrição"
    │
    ├─► pre-commit: lint-staged (ESLint + Prettier nos arquivos staged)
    │              typecheck nos .ts staged
    │              QA checks → exibe checklist ✅/❌/⚠️ no terminal
    │
    ├─► commit-msg: valida Conventional Commits PT-BR
    │
    ▼
git push
    │
    ├─► pre-push: typecheck completo + lint + format:check
    │
    ▼
Pull Request → CI automático
    │
    ├─► validate: typecheck + lint + format + QA checks no diff do PR
    ├─► Copilot review: análise automática de código
    └─► Checklist bot: comentário com ✅/❌ por item do checklist
```

### Passo a passo

1. Crie uma branch a partir de `main`:

```bash
git checkout -b feature/nome-da-feature
```

2. Implemente seguindo as convenções do projeto (ver [`.github/copilot-instructions.md`](.github/copilot-instructions.md))

3. Ao fazer `git commit`, os hooks rodam automaticamente e exibem:

```
🔍 QA Pre-Commit Checks — Youse Seguradora
   3 arquivo(s) staged · 1 novo(s)

  ✓ Bloqueia arquivos .env             · OK
  ✓ Detecta secrets / tokens           · OK
  ✗ Sem test.only / describe.only      · FAIL (1)
      └─ tests/spec/e2e/ux/home.spec.ts:42 → test.only('...

📊 Resumo
   11 OK  ·  0 warn  ·  1 fail

❌ Commit bloqueado: corrija os itens FAIL ou use --no-verify apenas em emergências.
```

4. Rode os testes afetados localmente (VPN ativa):

```bash
npx playwright test tests/spec/e2e --project=chromium --reporter=list
```

5. Ao abrir o PR, o bot posta automaticamente um checklist com status de cada item:

```
## 🤖 QA Checklist Automático — Youse Seguradora
| TypeScript (typecheck) | ✅ |
| ESLint                 | ✅ |
| Sem test.only          | ✅ |
| Nenhum dado sensível   | ✅ |
...
```

6. O GitHub Copilot é adicionado automaticamente como revisor no PR.

**Comandos manuais:**

```bash
npm run qa:precommit    # roda os QA checks nos staged (sem commitar)
npm run qa:check        # validate + qa:precommit (espelha o CI)
```

**Emergência (pular hooks — sempre com justificativa no PR):**

```bash
git commit --no-verify -m "..."
git push --no-verify
```
