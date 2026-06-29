# Massa de Dados de Teste

Arquivos em `tests/data/` fornecem dados com **comportamento conhecido** no ambiente QA.
Para geração dinâmica (nomes, e-mails, etc.) use `generators.ts` ou `fixtures/setupQuotation.ts`.

---

## Fixture — valores padrão (`fixtures/setupQuotation.ts`)

A fixture `quotationData` gera dados únicos por execução via Faker. Valores padrão:

| Campo               | Valor padrão                               |
| ------------------- | ------------------------------------------ |
| `licensePlate`      | `YOU-0020` (placa de teste aceita pelo QA) |
| `zipCode`           | `04777-020` (São Paulo — risco médio)      |
| `documentNumber`    | `123.456.761-08` (CPF aceito)              |
| `creditCard.number` | `4111 1111 1111 1111` (cartão de teste)    |

---

## CEPs — `cep.ts`

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

---

## CPFs — `cpf.ts`

Use quando o cenário depende de um **comportamento específico** do CPF:

```ts
import { cpf } from '../../data/cpf';

// Cenário de bloqueio por CPF PEP
await personDataPage.fillDocumentNumber(cpf.pepRefusedInsured.number);
```

| Categoria               | Chave de exemplo                  | Quando usar                   |
| ----------------------- | --------------------------------- | ----------------------------- |
| Aceito                  | `accepted`, `acceptedPool[n]`     | Caminho feliz                 |
| Recusado — PEP          | `pepRefusedInsured`               | Teste de bloqueio no checkout |
| Recusado — blacklist    | `crivoRefusedInsuredCpfBlacklist` | Teste de bloqueio no checkout |
| Recusado — morte        | `crivoRefusedInsuredDeath`        | Teste de bloqueio no checkout |
| Negado — nome           | `crivoDeniedInsuredName`          | Teste de campos inválidos     |
| Negado — não encontrado | `crivoDeniedCpfNotFound`          | Teste de CPF inexistente      |
| Risco sistêmico         | `riskRatioHighRisk`               | Teste de bloqueio por risco   |

---

## Placas — `plate.ts`

> ⚠️ **Atenção:** as placas abaixo têm comportamento específico em QA. Nunca use `YOU-0020` ou `YOU-0023` em testes de fluxo feliz (happy path).

```ts
import { plate } from '../../data/plate';

// Cenário de bloqueio por veículo de leilão
await vehicleDetailsPage.fillLicensePlate(plate.refusedAuction.number);
```

| Placa    | Chave em `plate`   | Comportamento em QA após pagamento                |
| -------- | ------------------ | ------------------------------------------------- |
| YOU-0020 | `noInspection` ⚠️  | Aciona **vistoria online** — não é happy path     |
| YOU-0003 | `onlineInspection` | Aciona vistoria online                            |
| YOU-0002 | `onSiteInspection` | Aciona vistoria presencial (on-site)              |
| YOU-0023 | `videoInspection`  | Aciona vistoria por **vídeo (Planetun / ivideo)** |

Specs de vistoria: [`cotacao-vistoria-online.spec.ts`](../spec/e2e/journeys/cotacao-vistoria-online.spec.ts) · [`cotacao-vistoria-video.spec.ts`](../spec/e2e/journeys/cotacao-vistoria-video.spec.ts)

---

## Planos — `plans.ts`

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
