Fluxo de Teste: Cotação e Contratação - Seguro Auto Youse

1. Descrição do Cenário
   Teste end-to-end (E2E) do funil de vendas do Seguro Auto da Youse. O objetivo é validar o "Caminho Feliz" (Happy Path) utilizando dados fictícios (faker/mocks) válidos, passando por todas as etapas do formulário, seleção de plano, preenchimento de cartão de crédito e validação da tela de sucesso (emissão da apólice).

2. Massa de Dados (Mocks / Faker)
   Nome Completo: Dados dinâmicos (ex: testes QA)

E-mail: E-mail dinâmico, obrigatoriamente com o domínio @youse.com.br (ex: qa.automation@youse.com.br)

Telefone: Formato válido com DDD (ex: 11 98320-9987)

Placa do Veículo: Placa válida para aprovação (ex: VOL0018)

CEP: CEP válido no Brasil (ex: 04777-020)

Número (Endereço): Fictício (ex: 99999)

CPF: CPF válido e sem restrições (ex: 123.456.789-00)

Cartão de Crédito: Cartão de teste válido, Validade: 03/30, CVV: 737, Nome: youse

3. Passos do Teste (Caminho Feliz)
   Etapa 1: Home e Cotação Inicial
   Acessar a página inicial.

Clicar no botão Cote Grátis localizado no card "Seguro Auto".

Aguardar o carregamento da próxima página.

Etapa 2: Dados de Contato
Preencher o campo Nome completo com o mock de Nome.

Preencher o campo E-mail com o mock de E-mail (\*@youse.com.br).

Preencher o campo Telefone com DDD com o mock de Telefone.

Clicar no botão Continuar.

Etapa 3: Informações do Veículo
Preencher o campo Placa do carro com o mock de Placa válida.

Validar (Toggle): O carro é zero km? (Pode testar tanto ativado quanto desativado no caminho feliz).

Validar (Toggle): O carro é blindado? -> Garantir que esteja desativado para seguir o caminho feliz.

Clicar no botão Continuar.

Etapa 4: Localização e Uso do Veículo
Preencher o campo CEP de onde o carro dorme com o mock de CEP.

Preencher o campo Número com o mock de Número do endereço.

Selecionar o Radio Button Particular na pergunta "Como você utiliza o carro no dia a dia?".

Clicar no botão Continuar.

Etapa 5: Dados do Segurado (CPF)
Preencher o campo CPF do segurado com o mock de CPF válido e sem restrições.

Clicar no botão Continuar.

Etapa 6: Estado Civil
Selecionar uma opção no dropdown Estado civil do principal condutor (ex: Solteiro(a)).

Clicar no botão Continuar.

Etapa 7: Renda Familiar
Validar/Preencher o campo Nome do segurado (deve vir preenchido ou usar o mesmo mock anterior).

Selecionar uma opção randômica no dropdown Renda familiar mensal.

Clicar no botão Continuar.

Etapa 8: Histórico de Seguro
Selecionar a opção Não para a pergunta "Você tem ou teve Seguro Auto nos últimos 12 meses?".

Clicar no botão Continuar.

Etapa 9: Escolha do Plano
Validar a existência dos planos: Essencial, Regular, Auto 1504, e Personalizado.

Asserção: Validar que o plano Regular e Personalizado contêm a assistência Proteção de Rodas, Pneus e Suspensão. Validar que o plano Essencial NÃO contém essa assistência.

Clicar no botão Quero Este no card do Plano Regular.

Etapa 10: Checkout e Pagamento
Asserção: Validar erros de gramática/ortografia na tela (inspeção visual de textos padrão).

Clicar/Marcar o checkbox confirmando que o e-mail e telefone estão corretos.

Asserção: Garantir que "Seguro Residencial" e "Seguro de Vida" NÃO estejam adicionados (botão deve estar como "Adicionar" e não "Adicionado").

Clicar na sanfona/menu Assistências e Validar se Proteção de Rodas, Pneus e Suspensão está listada.

Preencher os dados do Cartão de Crédito:

Número do cartão

Data de validade (03/30)

CVC / CVW (737)

Nome no cartão (youse)

Clicar no botão Finalizar.

Etapa 11: Tela de Sucesso (Validações Finais)
Aguardar o processamento (validando textos de carregamento se necessário).

Asserção: Validar a visibilidade do texto Pagamento confirmado.

Asserção: Validar se os dados do segurado exibidos na tela conferem com os inputs (Nome, CPF, Telefone, E-mail).

Asserção: Validar que a tag verde Cotação realizada e Pagamento validado estão presentes e com check.

Asserção: Validar que o número da Apólice foi gerado e exibido na seção "Seguro Auto".

4. Cenários Alternativos / Caminhos de Exceção (Negative Cases)
   Conforme narrado no vídeo, o agente Playwright pode ser configurado para gerar testes separados para estas validações:

Regra de Veículo Blindado: No "Passo 3", ao ativar o toggle O carro é blindado?, o sistema deve apresentar um comportamento de bloqueio (não permitir avançar).

Placa Restrita: No "Passo 3", ao inserir uma placa mapeada como restrita (mock de placa com bloqueio), o fluxo deve ser interrompido.

CPF Restrito: No "Passo 5", ao inserir um CPF que possui restrições sistêmicas, o fluxo de cotação deve apresentar mensagem de erro ou bloqueio.
