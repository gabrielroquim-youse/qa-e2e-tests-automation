# Planner — Validação de Valores (Preços) no Seguro Auto

> Objetivo: validar **o quanto** o prêmio muda quando o usuário inclui/exclui
> assistências e coberturas — não apenas a direção (subiu/desceu), mas a
> **magnitude correta**. Documenta estratégias, riscos e o plano de implementação.

## 1. Contexto e o problema do "oráculo"

O prêmio é calculado dinamicamente pelo motor de precificação (backend
`opin-service`) a partir de muitas variáveis: plano, coberturas, assistências,
franquia, indenização, classe de bônus, uso do veículo, garagem, estado civil,
FIPE do veículo e **o CPF do segurado** (perfil de risco).

Isso cria o "problema do oráculo": **qual é o valor esperado?** Fixar números
absolutos é frágil — reajustes sazonais e mudanças atuariais quebrariam os
testes constantemente. Precisamos de oráculos **estáveis** apesar do preço mudar.

## 2. Estratégias

### A) Invariante / delta exato na UI — **Prioridade 1 (recomendada)**

Em vez de afirmar "o item custa R$ X", afirmamos uma **invariante**:

```
total_depois == total_antes + preço_do_item
```

- **Como:** ler o total, ativar o item, ler o preço individual do item, ler o
  novo total e validar que o delta == preço do item (com tolerância pequena).
- **Prós:** robusto a reajustes (compara valores da mesma sessão), não precisa
  de backend, detecta bugs reais de soma/arredondamento.
- **Contras:** exige ler o preço individual de cada item na UI (dependência
  técnica abaixo). Cuidado com itens em base mensal vs anual e com combos.
- **Risco de flaky:** baixo.

### C) API como oráculo — **Prioridade 2**

Comparar o valor exibido na UI com a resposta da API de precificação.

- **Como:** interceptar/chamar o endpoint de recálculo e comparar com a UI.
- **Prós:** valida fim-a-fim (UI reflete o backend); oráculo "verdadeiro".
- **Contras:** acopla o teste ao contrato da API; exige cliente `PricingService`
  e mapear o payload (inclui o CPF). Mais setup.
- **Risco de flaky:** médio (depende de disponibilidade/latência do serviço).

### B) Valores golden (fixos) — **Prioridade 3**

Tabela de entradas → valor esperado fixo.

- **Prós:** simples de escrever; pega qualquer mudança de valor.
- **Contras:** **alta manutenção** — quebra a cada reajuste; precisa de CPF e
  cenário 100% determinísticos. Indicado só para um punhado de casos "âncora".
- **Risco de flaky:** alto.

## 3. Dependência do CPF

O preço depende do perfil de risco vinculado ao CPF. Para as estratégias A e C
funcionarem de forma determinística:

- Usar **um CPF de teste fixo e estável** (perfil conhecido), não aleatório.
- Documentar qual CPF/perfil foi usado em cada cenário golden (estratégia B).
- Para a invariante (A), o CPF não precisa ser fixo entre execuções, pois a
  comparação é **dentro da mesma sessão** (antes vs depois).

## 4. Dependências técnicas a destravar

| Item | Necessário para | Status |
|------|-----------------|--------|
| `getAssistanceItemPrice()` na `AssistancesSelectionPage` | Estratégia A (assist.) | ⚠️ criado, seletor a confirmar no DOM QA |
| Método equivalente em `CoveragesSelectionPage` | Estratégia A (coberturas) | ⬜ pendente |
| Cliente `PricingService` (API) | Estratégia C | ⬜ pendente |
| CPF de teste fixo com perfil conhecido | Estratégias B e C | ⬜ pendente |

## 5. Matriz de cenários

| # | Cenário | Estratégia | Tags | Prioridade |
|---|---------|-----------|------|-----------|
| 1 | Ativar "Restituição de IPVA" soma exatamente o preço do item | A | `@value @assistencias` | P1 (protótipo) |
| 2 | Ativar "Assistência a bike" soma exatamente o preço do item | A | `@value @assistencias` | P1 |
| 3 | Desativar item soma negativo simétrico (toggle on→off) | A | `@value @assistencias` | P1 |
| 4 | Combo "Assistência a automóvel" soma a faixa completa | A | `@value @assistencias @combo` | P2 |
| 5 | Ativar cobertura "Danos Morais" soma o preço da cobertura | A | `@value @coberturas` | P2 |
| 6 | Reduzir franquia: delta == diferença tabelada | A/C | `@value @coberturas` | P2 |
| 7 | UI bate com a API de recálculo (mesmo payload) | C | `@value @api` | P2 |
| 8 | Golden: CPF fixo + plano Essencial = valor esperado | B | `@value @golden` | P3 |

## 6. Plano de implementação (fases)

1. **Fase 1 (protótipo, atual):** cenário #1 com a invariante (A). Validar o
   seletor de preço individual no DOM real (logs no spec).
2. **Fase 2:** estender A para os demais itens (#2, #3) e para coberturas (#5),
   após confirmar os seletores.
3. **Fase 3:** combos (#4) e franquia/indenização (#6) — tratar normalização
   mensal/anual e itens agrupados.
4. **Fase 4:** estratégia C (API como oráculo) — criar `PricingService` e CPF fixo.
5. **Fase 5:** poucos casos golden âncora (B) com CPF/cenário fixos.

## 7. Notas de implementação

- Sempre normalizar **mensal × anual** antes de comparar (`value * 12`).
- Tolerância em reais (`DELTA_TOLERANCE`) para absorver arredondamento de centavos.
- Não usar `mode: 'serial'`: cada teste navega o funil do zero (independência).
- Combos incluem múltiplos itens — a invariante simples não vale; somar a faixa.
