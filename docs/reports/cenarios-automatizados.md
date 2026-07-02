# Levantamento de Cenários Automatizados — Cotação Seguro Auto

> **Data:** 02/07/2026 · **Responsável:** Gabriel Roquim  
> **Branch:** `feat/api-quotation-layer` · **Total de testes:** 119

---

## Resumo executivo

| Categoria | Testes | Pipeline |
|---|---|---|
| **Jornadas completas** (happy path até apólice) | 13 | Nightly |
| **UX por tela** (validação de formulário, navegação) | 39 | PR / Diário |
| **Bloqueios** (CPF restrito, veículo de leilão, blindado) | 4 | Nightly |
| **Regressão** (coberturas, assistências, bônus) | 18 | Nightly |
| **Pagamento** (Visa, Elo, Hipercard, PIX) | 10 | Manual / CI |
| **Acessibilidade** (WCAG 2.2 AA) | 35 | On release |
| **TOTAL** | **119 testes** | — |

---

## 1. Jornadas completas (E2E — happy path até emissão de apólice)

| Cenário | Plano | Dados | Resultado esperado |
|---|---|---|---|
| Plano **Regular** — checkout sem pagar | Regular | CPF mock, placa YOU-0020 | Chega ao checkout |
| Plano **Regular** — até emissão da apólice | Regular | Cartão Visa | Apólice emitida (`/sucesso`) |
| Plano **Essencial** — checkout | Essencial | CPF mock | Chega ao checkout |
| Plano **Essencial** — upsells visíveis | Essencial | — | Residencial + Vida exibidos |
| Plano **Essencial** — assistências accordion | Essencial | — | Guincho 200km no accordion |
| Plano **Auto 1504** — checkout | Auto 1504 | CPF mock | Chega ao checkout |
| Plano **Auto 1504** — upsells | Auto 1504 | — | Residencial + Vida exibidos |
| Plano **Auto 1504** — assistências | Auto 1504 | — | Guincho 400km + Reparos |
| Plano **Personalizado** — até emissão | Personalizado | CPF mock | Apólice emitida |
| Vistoria **online** após pagamento | Regular | Placa YOU-0020 | Redireciona para vistoria online |
| Vistoria por **vídeo** (Planetun) | Regular | Placa YOU-0023 | Redireciona para Planetun |

---

## 2. Cenários de pagamento

| Cenário | Método | Resultado esperado |
|---|---|---|
| Cartão **Visa** aprovado | 4111 1111 1111 1111 | Apólice emitida |
| Cartão **Elo BR** aprovado | 5066 9911 1111 1118 | Apólice emitida |
| Cartão **Hipercard BR** aprovado | 6062 8288 8866 6688 | Apólice emitida |
| Cartão número **inválido** | — | Erro formato iframe Adyen |
| Cartão **recusado** pelo emissor | — | Mensagem de erro no checkout |
| **PIX** — opção visível | PIX | Seção PIX aparece |
| **PIX** — interface selecionada | PIX | QR code / BR Code exibido |
| **PIX** — emissão automática sandbox | PIX | Apólice emitida (requer credenciais Stark) |

---

## 3. Cenários negativos / bloqueios

| Cenário | Dado de teste | Resultado esperado |
|---|---|---|
| CPF na **blacklist** | `123.456.714-83` | Fluxo bloqueado |
| CPF classificado como **PEP** | `123.456.701-69` | Fluxo bloqueado |
| Veículo **blindado** | Flag blindado = true | Bloqueio na etapa veículo |
| Placa de **leilão** | YOU-0016 | Bloqueio com mensagem |
| E-mail inválido | `email-invalido` | Botão Continuar desabilitado |
| Telefone incompleto | `1199` | Botão Continuar desabilitado |
| CPF formato inválido | `000.000.000-00` | Botão Continuar desabilitado |
| BFF retornando **503** | Simulação `page.route` | App não navega silenciosamente |

---

## 4. Acessibilidade (WCAG 2.2 AA)

| Spec | WCAG | O que valida |
|---|---|---|
| `cotacaoFunnel.a11y.spec.ts` | 2.0/2.1/2.2 AA | Axe em 11 etapas do funil |
| `cotacaoKeyboard.a11y.spec.ts` | 2.1.1 · 2.4.3 | Navegação Tab/Enter |
| `cotacaoTouch.a11y.spec.ts` | 2.5.5 | Alvo touch ≥ 44×44px |
| `cotacaoDarkMode.a11y.spec.ts` | 1.4.3 | Contraste dark mode |
| `cotacaoFormErrors.a11y.spec.ts` | 3.3.1 · 1.3.1 | Axe em estado de erro |
| `cotacaoReducedMotion.a11y.spec.ts` | 2.3.3 | Funil com reduced-motion |

---

## 5. Massa de dados utilizados

| Tipo | Valor / Pool | Propósito |
|---|---|---|
| CPF happy path | `cpf.acceptedPool[0..N]` | Jornadas completas |
| CPF D-1 apólice | `123.456.761-08` | **Reservado** — não usar em automação geral |
| CPF PEP | `123.456.701-69` | Cenário de recusa |
| CPF blacklist | `123.456.714-83` | Cenário de recusa |
| Placa padrão | YOU-0020 | Veículo de teste |
| Placa vistoria online | YOU-0020 | Fluxo vistoria online |
| Placa vistoria vídeo | YOU-0023 | Fluxo Planetun |
| Placa leilão | YOU-0016 | Cenário de bloqueio |
| CEP | Pool 20 CEPs reais | SP, RJ, MG, RS, PR e outros |
| Cartão | Catálogo Adyen sandbox | Visa, Elo, Hipercard |
| Nome / Email | Faker (dinâmico) | Dados únicos por execução |
