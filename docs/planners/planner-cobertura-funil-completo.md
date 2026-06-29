# Planner — Cobertura do funil completo: Cotação → Emissão

> Gerado em: 2026-06-28 · Atualizado: 2026-06-30 · Revisar após cada sprint.
> Objetivo: mapear todos os cenários do funil, identificar gaps e definir onde testar (UI vs API).
>
> **Fontes internas consultadas (VPN Youse):**
>
> - `youse-seguradora/sales-lead-requirements` — schema Zod do formulário lead_info (validações exatas)
> - `youse-seguradora/pricing-engine` — definição canônica de planos, coberturas e assistências
> - `youse-seguradora/order-service` — serializers de planos e modelos de veículo/segurado

---

## Princípio: quando testar via UI vs API

| Tipo de validação                              | Onde testar        | Exemplo                                            |
| ---------------------------------------------- | ------------------ | -------------------------------------------------- |
| Regra de negócio (preço, bônus, elegibilidade) | **API** (qa-api)   | `Ativar bônus 10 reduz prêmio em X%`               |
| Feedback visual ao usuário (mensagens, erros)  | **UI** (este repo) | `"Por favor, digite seu nome e sobrenome"` aparece |
| Navegação e bloqueios de formulário            | **UI** (este repo) | Botão desabilitado sem CPF preenchido              |
| Fluxo de compra ponta a ponta                  | **UI** (jornadas)  | Lead → Veículo → Plano → Checkout → Emissão        |
| Contratos HTTP / schemas JSON                  | **API** (qa-api)   | Resposta do BFF tem campo `plan.monthly_price`     |

---

## Mapa de cobertura por etapa do funil

### Etapa 1 — Lead Info (`lead_info`)

| Cenário                                    | Tag         | Spec                 | Status                       |
| ------------------------------------------ | ----------- | -------------------- | ---------------------------- |
| Campos visíveis (nome, e-mail, tel, botão) | @smoke      | ux/lead-info.spec.ts | ✅                           |
| Formulário vazio → botão desabilitado      | @smoke      | ux/lead-info.spec.ts | ✅                           |
| E-mail inválido → mensagem de erro         | @regression | ux/lead-info.spec.ts | ✅                           |
| Telefone incompleto → mensagem de erro     | @regression | ux/lead-info.spec.ts | ✅                           |
| Nome apenas números → mensagem de erro     | @regression | ux/lead-info.spec.ts | ✅                           |
| Happy path → avança para dados do veículo  | @smoke      | ux/lead-info.spec.ts | ✅                           |
| Nome com caracteres especiais (!@#$)       | @regression | ux/lead-info.spec.ts | ✅ (bug documentado)         |
| Nome com acento (João Silva) → rejeitado   | @regression | ux/lead-info.spec.ts | ✅ (bug UX — regex só ASCII) |
| E-mail sem @youse (aviso ou bloqueio?)     | @regression | —                    | ⬜ GAP                       |

### Etapa 2 — Dados do Veículo (`vehicle_details`)

| Cenário                                 | Tag         | Spec                           | Status   |
| --------------------------------------- | ----------- | ------------------------------ | -------- |
| Placa vazia → não avança                | @smoke      | ux/vehicle-details.spec.ts     | ✅       |
| Placa formato inválido → não avança     | @regression | ux/vehicle-details.spec.ts     | ✅       |
| Placa válida → avança para endereço     | @smoke      | ux/vehicle-details.spec.ts     | ✅       |
| Veículo blindado → mensagem de bloqueio | @negative   | blockers/cotacao-restricoes.ts | ✅       |
| Placa de leilão → mensagem de bloqueio  | @negative   | blockers/cotacao-restricoes.ts | ⚠️ fixme |
| Zero km = true → impacto no preço       | @pricing    | → qa-api-tests-automation      | 🔗 API   |

### Etapa 3 — Endereço e Uso (`vehicle_additional`)

| Cenário                                    | Tag         | Spec                          | Status |
| ------------------------------------------ | ----------- | ----------------------------- | ------ |
| CEP vazio → botão desabilitado             | @smoke      | ux/vehicle-additional.spec.ts | ✅     |
| CEP inválido → mensagem de erro            | @regression | ux/vehicle-additional.spec.ts | ✅     |
| Uso não selecionado → botão desabilitado   | @regression | ux/vehicle-additional.spec.ts | ✅     |
| Happy path (garagem + particular) → avança | @smoke      | ux/vehicle-additional.spec.ts | ✅     |
| Sem garagem → fluxo risk_acceptance        | @regression | ux/risk-acceptance.spec.ts    | ✅     |
| Uso App → impacto no preço                 | @pricing    | → qa-api-tests-automation     | 🔗 API |
| Uso Comercial → impacto no preço           | @pricing    | → qa-api-tests-automation     | 🔗 API |

### Etapa 4 — Dados do Segurado (`person_data`)

| Cenário                                  | Tag         | Spec                           | Status |
| ---------------------------------------- | ----------- | ------------------------------ | ------ |
| CPF + estado civil vazios → bloqueado    | @smoke      | ux/person-data.spec.ts         | ✅     |
| CPF formato inválido → mensagem de erro  | @regression | ux/person-data.spec.ts         | ✅     |
| Happy path → avança para data_enrichment | @smoke      | ux/person-data.spec.ts         | ✅     |
| CPF com restrição → bloqueio na UI       | @negative   | blockers/cotacao-restricoes.ts | ✅     |
| Estado civil casado(a) → impacto preço   | @pricing    | → qa-api-tests-automation      | 🔗 API |

### Etapa 4b — Enriquecimento de dados (`data_enrichment`)

| Cenário                                   | Tag         | Spec                       | Status                 |
| ----------------------------------------- | ----------- | -------------------------- | ---------------------- |
| Section aparece no funil após CPF         | @regression | ux/data-enrichment.spec.ts | ✅                     |
| Campos visíveis quando formulário exibido | @ux         | ux/data-enrichment.spec.ts | ✅                     |
| Auto-avança quando renda já conhecida     | @regression | ux/data-enrichment.spec.ts | ✅ (teste condicional) |

### Etapa 5 — Classe de Bônus (`bonuses_class`)

| Cenário                             | Tag         | Spec                             | Status |
| ----------------------------------- | ----------- | -------------------------------- | ------ |
| Sem histórico → WhatsApp            | @regression | ux/bonuses-class.spec.ts         | ✅     |
| Sim sem classe → botão desabilitado | @regression | ux/bonuses-class.spec.ts         | ✅     |
| Não usa bônus → avança normalmente  | @regression | regression/validateBonusClass.ts | ✅     |
| Modal "Não sei minha classe"        | @regression | regression/validateBonusClass.ts | ✅     |
| Seleciona classe 1                  | @regression | regression/validateBonusClass.ts | ✅     |
| Seleciona "Não quero informar"      | @regression | regression/validateBonusClass.ts | ✅     |
| Bônus 10 → desconto no preço        | @pricing    | → qa-api-tests-automation        | 🔗 API |

### Etapa 6 — Seleção de Plano (`plan_selection`)

| Cenário                                           | Tag         | Spec                          | Status |
| ------------------------------------------------- | ----------- | ----------------------------- | ------ |
| Três planos + preço + personalizar visíveis       | @smoke      | ux/plan-selection.spec.ts     | ✅     |
| Cada plano com coberturas corretas no card        | @regression | regression/coberturas.spec.ts | ✅     |
| Cada plano com assistências corretas no card      | @regression | regression/coberturas.spec.ts | ✅     |
| Guincho: Essencial=200km, Regular/Auto=400km      | @regression | regression/coberturas.spec.ts | ✅     |
| Preço ordinal: Essencial < Regular < Auto 1504    | @regression | regression/coberturas.spec.ts | ✅     |
| Card personalizado ("Monte do seu jeito") visível | @smoke      | regression/coberturas.spec.ts | ✅     |
| Preços dentro dos guard-rails (sanidade)          | @sanity     | regression/coberturas.spec.ts | ✅     |
| Essencial: assistências sem toggles (fechado)     | @smoke      | ux/plan-preformatted.spec.ts  | ✅     |
| Personalizado: toggles disponíveis                | @regression | ux/plan-preformatted.spec.ts  | ✅     |

### Etapa 7 — Coberturas e Assistências (`coverages_selection`, `assistances_selection`)

| Cenário                                       | Tag         | Spec                              | Status      |
| --------------------------------------------- | ----------- | --------------------------------- | ----------- |
| Assistências disponíveis visíveis             | @smoke      | regression/assistencias.spec.ts   | ✅          |
| Combo automóvel + 7 assistências              | @regression | regression/assistencias.spec.ts   | ✅          |
| Ativar cobertura → preço aumenta              | @regression | regression/personalizacao.spec.ts | ⚠️ skip→API |
| Desativar cobertura → preço reduz             | @regression | regression/personalizacao.spec.ts | ⚠️ skip→API |
| Cobertura obrigatória não pode ser desativada | @regression | regression/personalizacao.spec.ts | ✅          |
| Franquia (stepper) muda valor da cobertura    | @regression | —                                 | ⬜ GAP      |

### Etapa 8 — Checkout (`checkout`)

| Cenário                                              | Tag         | Spec                           | Status     |
| ---------------------------------------------------- | ----------- | ------------------------------ | ---------- |
| Resumo, e-mail, upsells visíveis                     | @smoke      | ux/checkout.spec.ts            | ✅         |
| Accordion assistências                               | @regression | ux/checkout.spec.ts            | ✅         |
| Cross-sell Residencial/Vida iniciam como "Adicionar" | @regression | ux/checkout.spec.ts            | ✅         |
| Adicionar Residencial → linha de resumo              | @regression | ux/checkout.spec.ts            | ✅         |
| Finalizar sem cartão → permanece no checkout         | @regression | ux/checkout.spec.ts            | ✅         |
| Finalizar sem confirmar e-mail → permanece           | @regression | ux/checkout.spec.ts            | ✅         |
| PIX — opção visível                                  | @smoke      | payment/checkout-pix.spec.ts   | ✅         |
| PIX — interface após selecionar                      | @regression | payment/checkout-pix.spec.ts   | ✅         |
| PIX — CPF do segurado visível                        | @regression | payment/checkout-pix.spec.ts   | ✅         |
| PIX — permanece pendente após finalizar              | @regression | payment/checkout-pix.spec.ts   | ✅         |
| PIX — emissão após sandbox confirm                   | @journey    | payment/checkout-pix-emission  | 🟡 sandbox |
| Cartão Elo BR → aprovado                             | @regression | payment/checkout-cards.spec.ts | ✅         |
| Cartão Hipercard → aprovado                          | @regression | payment/checkout-cards.spec.ts | ✅         |
| Finalizar com cartão inválido → mensagem de erro     | @regression | payment/checkout-cards.spec.ts | ✅         |
| Cartão recusado pelo emissor → mensagem de erro      | @regression | payment/checkout-cards.spec.ts | ✅         |

### Etapa 9 — Emissão (`issuance`)

| Cenário                                         | Tag         | Spec                                   | Status     |
| ----------------------------------------------- | ----------- | -------------------------------------- | ---------- |
| Emissão após cartão (F1 Regular)                | @regression | journeys/cotacao-plano-regular.spec.ts | ✅         |
| Emissão após personalizado (F2)                 | @regression | journeys/cotacao-plano-personalizado   | ✅         |
| Emissão após PIX sandbox                        | @journey    | payment/checkout-pix-emission          | 🟡 sandbox |
| E-mail do segurado visível na tela de sucesso   | @regression | journeys/cotacao-plano-regular.spec.ts | ✅         |
| Tags "Cotação realizada" e "Pagamento validado" | @regression | journeys/cotacao-plano-regular.spec.ts | ✅         |
| Seção apólice auto visível                      | @regression | journeys/cotacao-plano-regular.spec.ts | ✅         |

---

## Jornadas completas (Caminho Feliz por plano)

| Jornada | Plano         | Spec                                          | Status    |
| ------- | ------------- | --------------------------------------------- | --------- |
| F1      | Regular       | journeys/cotacao-plano-regular.spec.ts        | ✅ smoke  |
| F2      | Personalizado | journeys/cotacao-plano-personalizado.spec.ts  | ✅        |
| F3      | Essencial     | journeys/cotacao-planos-preformatados.spec.ts | ✅ smoke  |
| F4      | Auto 1504     | journeys/cotacao-planos-preformatados.spec.ts | ✅ smoke  |
| F4b     | PIX sandbox   | payment/checkout-pix-emission.spec.ts         | 🟡 manual |

---

## Gaps priorizados para próxima sprint

| Prioridade | Cenário                                          | Sugestão                                          |
| ---------- | ------------------------------------------------ | ------------------------------------------------- |
| P1 ✅      | Nome com caracteres especiais → mensagem de erro | Resolvido em ux/lead-info.spec.ts                 |
| P1 ✅      | Nome com acento rejeitado pelo regex ASCII       | Adicionado + bug documentado em lead-info.spec    |
| P1 ✅      | Finalizar checkout sem confirmar e-mail          | Resolvido em ux/checkout.spec.ts                  |
| P1 ✅      | Finalizar com cartão inválido → mensagem Adyen   | Resolvido em payment/checkout-cards.spec.ts       |
| P2 ✅      | Cobertura obrigatória não pode ser desativada    | Já existia em regression/personalizacao.spec.ts   |
| P2         | Placa de leilão → remover test.fixme             | Estabilizar ambiente QA, remover fixme            |
| P2 🔗 API  | Franquia (stepper) altera preço                  | Migrado corretamente para qa-api-tests-automation |
| P3 ✅      | data_enrichment: campos visíveis quando aparece  | Resolvido em ux/data-enrichment.spec.ts           |
| P3         | PIX emissão no CI (sem Stark manual)             | Configurar STARK\_\* no GitHub Actions Secrets    |

---

## Legenda

| Símbolo   | Significado                                               |
| --------- | --------------------------------------------------------- |
| ✅        | Coberto e passando                                        |
| ⬜ GAP    | Não existe spec — criar                                   |
| ⚠️ fixme  | Existe mas está marcado como fixme ou skip                |
| 🟡 manual | Existe mas requer intervenção manual (PIX sandbox)        |
| 🔗 API    | Validação de regra de negócio → `qa-api-tests-automation` |
