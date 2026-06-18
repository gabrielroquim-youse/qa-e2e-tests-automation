# Relatório de Tempo — Testes E2E Seguro Auto

> Gerado em **2026-06-17** · fonte: `reports/e2e-last-run.log` · [e2e-timing.json](e2e-timing.json)

## Resumo

| Métrica                |    Valor |
| ---------------------- | -------: |
| Testes                 |       49 |
| Passou                 |       47 |
| Falhou                 |        0 |
| Pulou                  |        2 |
| Tempo wall-clock       | 27.2 min |
| Soma dos testes        | 26.2 min |
| Workers                |        — |
| Overhead (wall − soma) |       4% |

## Tempo por spec (ordenado por duração total)

| Spec                          | Testes | Passou | Falhou | Pulou |   Total |  Média |     Máx |
| ----------------------------- | -----: | -----: | -----: | ----: | ------: | -----: | ------: |
| `precosPlanos.spec.ts`        |     13 |     12 |      0 |     1 | 6.5 min | 32.7 s |  50.4 s |
| `personalizacao.spec.ts`      |      9 |      9 |      0 |     0 | 5.7 min | 38.2 s |  59.4 s |
| `assistencias.spec.ts`        |      7 |      7 |      0 |     0 | 4.5 min | 38.2 s | 1.1 min |
| `cotacaoAuto.spec.ts`         |      5 |      4 |      0 |     1 | 3.1 min | 46.0 s | 1.5 min |
| `coberturas.spec.ts`          |      7 |      7 |      0 |     0 | 2.7 min | 22.9 s |  32.8 s |
| `validacaoValores.spec.ts`    |      3 |      3 |      0 |     0 | 2.2 min | 43.8 s |  58.2 s |
| `validateBonusClass.spec.ts`  |      4 |      4 |      0 |     0 |  53.9 s | 13.5 s |  14.2 s |
| `assistenciaRpsPromo.spec.ts` |      1 |      1 |      0 |     0 |  36.2 s | 36.2 s |  36.2 s |

## Top 15 testes mais lentos

|   # | Spec                          | Teste                                                                | Status |   Tempo |
| --: | ----------------------------- | -------------------------------------------------------------------- | :----: | ------: |
|   1 | `cotacaoAuto.spec.ts`         | Deve realizar cotação e contratação com sucesso (Caminho Feliz) @b2… |   ✅   | 1.5 min |
|   2 | `assistencias.spec.ts`        | Ativar "Assistência a bike" deve aumentar o prêmio anual @regressio… |   ✅   | 1.1 min |
|   3 | `personalizacao.spec.ts`      | Deve contratar o plano personalizado com configurações padrão e emi… |   ✅   |  59.4 s |
|   4 | `validacaoValores.spec.ts`    | IPVA ligar/desligar deve ser simétrico no total anual @value @quota… |   ✅   |  58.2 s |
|   5 | `precosPlanos.spec.ts`        | Desconto deve crescer progressivamente: Classe 1 > Classe 5 > Class… |   ✅   |  50.4 s |
|   6 | `personalizacao.spec.ts`      | Deve chegar ao checkout via helper navigateToCheckout @regression @… |   ✅   |  49.2 s |
|   7 | `personalizacao.spec.ts`      | Deve navegar coberturas → assistências → checkout sem contratar @re… |   ✅   |  46.6 s |
|   8 | `personalizacao.spec.ts`      | Desativar a cobertura "Roubo e furto" deve reduzir o prêmio anual @… |   ✅   |  46.5 s |
|   9 | `assistencias.spec.ts`        | Ativar "Assistência a automóvel" deve aumentar o prêmio anual (efei… |   ✅   |  40.2 s |
|  10 | `cotacaoAuto.spec.ts`         | Não deve contratar ao informar CPF com restrição (blacklist) @b2c @… |   ✅   |  40.1 s |
|  11 | `cotacaoAuto.spec.ts`         | Não deve contratar ao informar CPF recusado por PEP @b2c @quotation… |   ✅   |  40.0 s |
|  12 | `assistencias.spec.ts`        | Ativar guincho deve habilitar assistências dependentes do combo @re… |   ✅   |  38.9 s |
|  13 | `validacaoValores.spec.ts`    | Assistência a bike ligar/desligar deve ser simétrico @value @quotat… |   ✅   |  37.9 s |
|  14 | `precosPlanos.spec.ts`        | Preço deve ser estável entre duas cotações com os mesmos dados (ide… |   ✅   |  36.8 s |
|  15 | `assistenciaRpsPromo.spec.ts` | RPS grátis vs cobrado — validado pelo delta do total e selo UI @val… |   ✅   |  36.2 s |

## Detalhamento completo

| Spec                          | Linha | Suite                                                         | Teste                                                                                                                                | Status |   Tempo | Tags                                                      |
| ----------------------------- | ----: | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | :----: | ------: | --------------------------------------------------------- |
| `assistenciaRpsPromo.spec.ts` |    21 | Promo RPS — Proteção de Rodas, Pneu e Suspensão               | RPS grátis vs cobrado — validado pelo delta do total e selo UI @value @assistencias @rps @quotation_auto                             |   ✅   |  36.2 s | @value @assistencias @rps @quotation_auto                 |
| `assistencias.spec.ts`        |    42 | Assistências — Visibilidade                                   | Deve exibir o título e as assistências disponíveis na tela de seleção @smoke @assistencias @quotation_auto                           |   ✅   |  24.6 s | @smoke @assistencias @quotation_auto                      |
| `assistencias.spec.ts`        |    76 | Assistências — Efeito no Prêmio — Independentes               | Ativar "Restituição de IPVA" deve aumentar o prêmio anual @regression @assistencias @quotation_auto                                  |   ✅   |  32.4 s | @regression @assistencias @quotation_auto                 |
| `assistencias.spec.ts`        |    94 | Assistências — Efeito no Prêmio — Independentes               | Ativar "Assistência a bike" deve aumentar o prêmio anual @regression @assistencias @quotation_auto                                   |   ✅   | 1.1 min | @regression @assistencias @quotation_auto                 |
| `assistencias.spec.ts`        |   112 | Assistências — Efeito no Prêmio — Independentes               | Ativar "Serviço de histórico veicular" deve aumentar o prêmio anual @regression @assistencias @quotation_auto                        |   ✅   |  32.4 s | @regression @assistencias @quotation_auto                 |
| `assistencias.spec.ts`        |   132 | Assistências — Efeito no Prêmio — Independentes               | Ativar "Serviço de leva e traz" deve aumentar o prêmio anual @regression @assistencias @quotation_auto                               |   ✅   |  33.2 s | @regression @assistencias @quotation_auto                 |
| `assistencias.spec.ts`        |   160 | Assistências — Combo Assistência a Automóvel                  | Ativar "Assistência a automóvel" deve aumentar o prêmio anual (efeito combo) @regression @assistencias @quotation_auto               |   ✅   |  40.2 s | @regression @assistencias @quotation_auto                 |
| `assistencias.spec.ts`        |   189 | Assistências — Dependências do Combo                          | Ativar guincho deve habilitar assistências dependentes do combo @regression @assistencias @quotation_auto                            |   ✅   |  38.9 s | @regression @assistencias @quotation_auto                 |
| `coberturas.spec.ts`          |    65 | Coberturas, Assistências e Integridade de Preço — Seguro Auto | Deve exibir os três planos pré-formatados na tela de seleção @price @quotation_auto @coberturas @smoke                               |   ✅   |  25.1 s | @price @quotation_auto @coberturas @smoke                 |
| `coberturas.spec.ts`          |    78 | Coberturas, Assistências e Integridade de Preço — Seguro Auto | Cada plano deve exibir suas coberturas esperadas no card @price @quotation_auto @coberturas @regression                              |   ✅   |  32.8 s | @price @quotation_auto @coberturas @regression            |
| `coberturas.spec.ts`          |    93 | Coberturas, Assistências e Integridade de Preço — Seguro Auto | Cada plano deve exibir suas assistências esperadas no card @price @quotation_auto @coberturas @regression                            |   ✅   |  21.5 s | @price @quotation_auto @coberturas @regression            |
| `coberturas.spec.ts`          |   109 | Coberturas, Assistências e Integridade de Preço — Seguro Auto | Essencial deve ter Guincho 200km; Regular e Auto 1504 devem ter Guincho 400km @price @quotation_auto @coberturas @regression         |   ✅   |  21.3 s | @price @quotation_auto @coberturas @regression            |
| `coberturas.spec.ts`          |   132 | Coberturas, Assistências e Integridade de Preço — Seguro Auto | Preço deve crescer conforme a abrangência: Essencial < Regular < Auto 1504 @price @quotation_auto @coberturas @regression @price     |   ✅   |  19.6 s | @price @quotation_auto @coberturas @regression @price     |
| `coberturas.spec.ts`          |   155 | Coberturas, Assistências e Integridade de Preço — Seguro Auto | Opção de plano personalizado deve estar disponível na tela @price @quotation_auto @coberturas @smoke                                 |   ✅   |  19.2 s | @price @quotation_auto @coberturas @smoke                 |
| `coberturas.spec.ts`          |   168 | Coberturas, Assistências e Integridade de Preço — Seguro Auto | Preços de todos os planos devem estar dentro dos guarda-rails de sanidade @price @quotation_auto @coberturas @sanity                 |   ✅   |  20.5 s | @price @quotation_auto @coberturas @sanity                |
| `cotacaoAuto.spec.ts`         |    18 | B2C - Cotação e Contratação - Seguro Auto                     | Deve realizar cotação e contratação com sucesso (Caminho Feliz) @b2c @quotation_auto @happy_path                                     |   ✅   | 1.5 min | @b2c @quotation_auto @happy_path                          |
| `cotacaoAuto.spec.ts`         |    93 | B2C - Cenários Negativos - Cotação Auto                       | Não deve avançar ao informar veículo blindado @b2c @quotation_auto @negative                                                         |   ✅   |  13.7 s | @b2c @quotation_auto @negative                            |
| `cotacaoAuto.spec.ts`         |   109 | B2C - Cenários Negativos - Cotação Auto                       | Não deve avançar ao informar placa com restrição (veículo de leilão) @b2c @quotation_auto @negative                                  |   ⏭️   |       — | @b2c @quotation_auto @negative                            |
| `cotacaoAuto.spec.ts`         |   128 | B2C - Cenários Negativos - Cotação Auto                       | Não deve contratar ao informar CPF com restrição (blacklist) @b2c @quotation_auto @negative                                          |   ✅   |  40.1 s | @b2c @quotation_auto @negative                            |
| `cotacaoAuto.spec.ts`         |   169 | B2C - Cenários Negativos - Cotação Auto                       | Não deve contratar ao informar CPF recusado por PEP @b2c @quotation_auto @negative                                                   |   ✅   |  40.0 s | @b2c @quotation_auto @negative                            |
| `personalizacao.spec.ts`      |    40 | Personalização — Coberturas                                   | Ativar a cobertura "Danos Morais" deve aumentar o prêmio anual @personalizacao @coberturas @quotation_auto @regression               |   ✅   |  28.9 s | @personalizacao @coberturas @quotation_auto @regression   |
| `personalizacao.spec.ts`      |    59 | Personalização — Coberturas                                   | Desativar a cobertura "Roubo e furto" deve reduzir o prêmio anual @personalizacao @coberturas @quotation_auto @regression            |   ✅   |  46.5 s | @personalizacao @coberturas @quotation_auto @regression   |
| `personalizacao.spec.ts`      |    78 | Personalização — Coberturas                                   | Reduzir a franquia de "Vale pra qualquer batida" deve aumentar o prêmio @personalizacao @coberturas @quotation_auto @regression      |   ✅   |  29.9 s | @personalizacao @coberturas @quotation_auto @regression   |
| `personalizacao.spec.ts`      |   106 | Personalização — Coberturas                                   | Aumentar indenização de "Danos corporais a terceiros" deve aumentar o prêmio @personalizacao @coberturas @quotation_auto @regression |   ✅   |  26.7 s | @personalizacao @coberturas @quotation_auto @regression   |
| `personalizacao.spec.ts`      |   131 | Personalização — Navegação                                    | Deve navegar coberturas → assistências → checkout sem contratar @regression @personalizacao @quotation_auto                          |   ✅   |  46.6 s | @regression @personalizacao @quotation_auto               |
| `personalizacao.spec.ts`      |   147 | Personalização — Navegação                                    | Deve chegar ao checkout via helper navigateToCheckout @regression @personalizacao @quotation_auto                                    |   ✅   |  49.2 s | @regression @personalizacao @quotation_auto               |
| `personalizacao.spec.ts`      |   162 | Personalização — Coberturas Obrigatórias                      | Cobertura "Incêndio" (Inclusa) não deve exibir toggle desligável @regression @negative @personalizacao                               |   ✅   |  28.5 s | @regression @negative @personalizacao                     |
| `personalizacao.spec.ts`      |   180 | Personalização — Assistências                                 | Ativar a assistência "Carro reserva" deve aumentar o prêmio anual @personalizacao @assistencias @quotation_auto @regression          |   ✅   |  28.0 s | @personalizacao @assistencias @quotation_auto @regression |
| `personalizacao.spec.ts`      |   213 | Personalização — E2E Completo (Smoke)                         | Deve contratar o plano personalizado com configurações padrão e emitir a apólice @personalizacao @smoke @quotation_auto              |   ✅   |  59.4 s | @personalizacao @smoke @quotation_auto                    |
| `precosPlanos.spec.ts`        |    75 | Preços — Classe de Bônus                                      | Bônus Classe 10 deve resultar em prêmio menor que sem bônus @price @bonus_class                                                      |   ✅   |  32.6 s | @price @bonus_class                                       |
| `precosPlanos.spec.ts`        |    96 | Preços — Classe de Bônus                                      | Desconto de Bônus Classe 10 deve estar entre 30% e 65% @price @bonus_class                                                           |   ✅   |  31.3 s | @price @bonus_class                                       |
| `precosPlanos.spec.ts`        |   114 | Preços — Classe de Bônus                                      | Desconto deve crescer progressivamente: Classe 1 > Classe 5 > Classe 10 (prêmio decrescente) @price @bonus_class                     |   ✅   |  50.4 s | @price @bonus_class                                       |
| `precosPlanos.spec.ts`        |   152 | Preços — Garagem Noturna                                      | Veículo com garagem deve ter prêmio menor que sem garagem @price @garage                                                             |   ✅   |  30.3 s | @price @garage                                            |
| `precosPlanos.spec.ts`        |   180 | Preços — Uso do Veículo                                       | Uso Particular deve ter prêmio menor que Motorista de Aplicativo @price @usage                                                       |   ✅   |  33.3 s | @price @usage                                             |
| `precosPlanos.spec.ts`        |   200 | Preços — Uso do Veículo                                       | Uso Particular deve ter prêmio menor que Comercial @price @usage                                                                     |   ✅   |  31.9 s | @price @usage                                             |
| `precosPlanos.spec.ts`        |   221 | Preços — Uso do Veículo                                       | Uso Particular deve ter prêmio menor que Táxi @price @usage                                                                          |   ✅   |  32.6 s | @price @usage                                             |
| `precosPlanos.spec.ts`        |   241 | Preços — Uso do Veículo                                       | Uso Particular deve ter prêmio menor que Transporte de Carga @price @usage                                                           |   ✅   |  34.4 s | @price @usage                                             |
| `precosPlanos.spec.ts`        |   269 | Preços — Estado Civil                                         | Segurado casado deve ter prêmio menor ou igual ao de solteiro @price @marital_status                                                 |   ✅   |  35.3 s | @price @marital_status                                    |
| `precosPlanos.spec.ts`        |   298 | Preços — Veículo Zero Km                                      | Veículo zero km deve gerar prêmio diferente do veículo usado @price @brand_new                                                       |   ⏭️   |       — | @price @brand_new                                         |
| `precosPlanos.spec.ts`        |   332 | Preços — Hierarquia de Planos                                 | Prêmio deve crescer conforme a abrangência: Essencial < Regular < Auto 1504 @price @plan_order                                       |   ✅   |  20.3 s | @price @plan_order                                        |
| `precosPlanos.spec.ts`        |   364 | Preços — Sanidade e Estabilidade do Motor                     | Preços de todos os planos devem estar dentro dos guarda-rails @price @sanity                                                         |   ✅   |  23.7 s | @price @sanity                                            |
| `precosPlanos.spec.ts`        |   382 | Preços — Sanidade e Estabilidade do Motor                     | Preço deve ser estável entre duas cotações com os mesmos dados (idempotência) @price @sanity                                         |   ✅   |  36.8 s | @price @sanity                                            |
| `validacaoValores.spec.ts`    |    14 | Validação de Valores — delta simétrico                        | IPVA ligar/desligar deve ser simétrico no total anual @value @quotation_auto @assistencias                                           |   ✅   |  58.2 s | @value @quotation_auto @assistencias                      |
| `validacaoValores.spec.ts`    |    24 | Validação de Valores — delta simétrico                        | Assistência a bike ligar/desligar deve ser simétrico @value @quotation_auto @assistencias                                            |   ✅   |  37.9 s | @value @quotation_auto @assistencias                      |
| `validacaoValores.spec.ts`    |    34 | Validação de Valores — delta simétrico                        | Danos Morais ligar/desligar deve ser simétrico @value @quotation_auto @coberturas                                                    |   ✅   |  35.4 s | @value @quotation_auto @coberturas                        |
| `validateBonusClass.spec.ts`  |    15 | Classe de Bônus - Seguro Auto                                 | Não deve utilizar classe de bônus @b2c @quotation_auto                                                                               |   ✅   |  12.3 s | @b2c @quotation_auto                                      |
| `validateBonusClass.spec.ts`  |    34 | Classe de Bônus - Seguro Auto                                 | Deve exibir modal ao clicar em "Não sei minha Classe de Bônus" @b2c @quotation_auto                                                  |   ✅   |  14.0 s | @b2c @quotation_auto                                      |
| `validateBonusClass.spec.ts`  |    54 | Classe de Bônus - Seguro Auto                                 | Deve selecionar Classe de Bônus 1 @b2c @quotation_auto                                                                               |   ✅   |  14.2 s | @b2c @quotation_auto                                      |
| `validateBonusClass.spec.ts`  |    74 | Classe de Bônus - Seguro Auto                                 | Deve selecionar "Não quero informar" na Classe de Bônus @b2c @quotation_auto                                                         |   ✅   |  13.4 s | @b2c @quotation_auto                                      |

---

_Gerado por `npm run e2e:timing:generate` — não editar manualmente._
