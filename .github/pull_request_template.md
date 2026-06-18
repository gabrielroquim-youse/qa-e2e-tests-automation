## Descrição

> Descreva em 1–3 frases o que esta PR faz e qual problema ela resolve.

---

## Tipo de mudança

- [ ] `feat` — nova funcionalidade ou novo teste
- [ ] `fix` — correção de bug em teste ou Page Object
- [ ] `refactor` — refatoração sem mudança de comportamento
- [ ] `chore` — ajuste de configuração, dependências ou CI
- [ ] `docs` — documentação (planner, README)
- [ ] `test` — novo teste automatizado

---

## Checklist de Qualidade

### Código

- [ ] Não há `page.waitForTimeout()` ou esperas fixas (use `waitFor`, `expect(...).toBeVisible()`)
- [ ] Não há `test.only` ou `test.skip` sem justificativa no comentário
- [ ] Todos os `await` de ações Playwright estão presentes
- [ ] Seletores usam locators de acessibilidade (`getByRole`, `getByLabel`, `getByText`) ou `data-testid`
- [ ] Nenhum dado sensível (CPF real, e-mail pessoal, cartão real) foi inserido no código

### Testes

- [ ] Os testes são independentes entre si (sem `mode: 'serial'` desnecessário)
- [ ] Nenhum valor de preço absoluto foi fixado (usar relações ordinais ou faixas)
- [ ] Tags `@smoke` / `@regression` / `@quotation_auto` foram adicionadas corretamente
- [ ] O teste foi executado localmente com VPN ativa e passou

### Page Objects / Fixtures

- [ ] Novos métodos foram adicionados ao Page Object correspondente (não na spec)
- [ ] Helpers reutilizáveis foram extraídos para `fixtures/` ou `data/`
- [ ] Nenhuma lógica de negócio foi duplicada (DRY)

### Documentação

- [ ] O planner em `docs/planners/planner-*.md` correspondente foi atualizado com os novos cenários
- [ ] O `README.md` foi atualizado se a estrutura do projeto mudou

---

## Como testar localmente

```bash
# Filtrar pelo grupo de testes desta PR (substitua pela tag relevante)
npx playwright test --grep @smoke --project=chromium --reporter=list
```

---

## Links relacionados

- Jira/Issue: <!-- ex: POSV-123 -->
- Zephyr Test Cycle: <!-- ex: link do ciclo -->
- PR relacionada: <!-- ex: #42 -->
