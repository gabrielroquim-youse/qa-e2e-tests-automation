# Solicitação de Automação de Teste


**Título:** `[Descrever o objetivo do teste de forma sucinta: Validar adição de utilização do carro no dia a dia]`

---

### Objetivo do Teste

O objetivo deste teste é verificar `[Onde o carro dorme]`.

---

### Instruções para a IA

1.  **Análise de Base:** Utilize como referência a estrutura e os padrões de codificação dos testes já implementados no quotationAuto.spec.ts.
2.  **Mapeamento de Elementos:**
    * Antes de implementar os passos do teste, identifique e mapeie os novos elementos de UI necessários para a execução deste cenário.
    * **Restrição Importante:** Crie um novo arquivo para os seletores desta página em `pages/quotation` com o nome `[NomeDaPagina]AIPage.ts` (ou a extensão correspondente do projeto). **Não modifique nenhum arquivo de `pages` existente.**
3.  **Implementação:** Crie um novo arquivo de teste para o cenário descrito abaixo, seguindo a arquitetura do framework.

---

### Cenário de Teste (Passos para Execução)

**Dado que** `[eu estou na página de endereço]`
**Quando** `[ação do usuário: eu coloco o CEP como '01234-001']`
**E** `[outra ação, se houver: eu na tapa de numero coloco '123']`
**Então** `[resultado esperado e verificável: o mode de usar o carro tem que ser 'taxi']`

---

### Resultados Esperados

* **Verificação de UI:**  O campo 'Táxi' deve estar com radio true!.
* **Verificação Funcional:** O item deve constar com o radio igual a True.