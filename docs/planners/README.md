# Planos de cenário (planners)

Especificações Given/When/Then usadas pela equipe de QA e pelos **Playwright Agents** (`npx playwright init-agents`) para gerar ou estender specs.

| Arquivo                                                      | Conteúdo                                        |
| ------------------------------------------------------------ | ----------------------------------------------- |
| [planner.md](planner.md)                                     | Happy path e cenários negativos gerais          |
| [planner-precos.md](planner-precos.md)                       | Variação de preço por variáveis de risco        |
| [planner-personalizacao.md](planner-personalizacao.md)       | Coberturas, franquia, navegação personalizado   |
| [planner-assistencias.md](planner-assistencias.md)           | Catálogo de assistências, combo e dependências  |
| [planner-validacao-valores.md](planner-validacao-valores.md) | Estratégias de assert de preço (delta, oráculo) |

## Uso com agentes

No Copilot / IDE, após `init-agents`:

```
Gere os testes a partir de docs/planners/planner-precos.md
```

## Manutenção

Ao adicionar ou alterar cenários E2E:

1. Atualize o planner correspondente
2. Implemente o spec em `tests/spec/e2e/`
3. Marque a capacidade em `scripts/coverage-inventory.ts`
4. Rode `npm run coverage:sync`
