/**
 * Configuração centralizada de testes.
 *
 * Todas as variáveis sensíveis (tokens, URLs, credenciais) devem ser
 * fornecidas via variáveis de ambiente (.env). Os valores hardcoded aqui
 * são usados apenas como fallback para execução local em QA.
 *
 * Nunca commite dados reais no .env nem altere os fallbacks para valores de produção.
 */
export default {
  credentials: {
    name: process.env.TEST_NAME || 'John Youser',
    documentNumber: process.env.TEST_DOCUMENT_NUMBER || '123.456.761-08',
    email: process.env.TEST_EMAIL || `automation+${Date.now()}@youse.com.br`,
    phone: process.env.TEST_USER_TEL || `(11) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
    licensePlate: process.env.TEST_LICENSE_PLATE || 'YOU-0020',
    dateOfBirth: process.env.TEST_DATE_OF_BIRTH || '1980-01-01',
    creditCard: {
      number: process.env.TEST_CARD_NUMBER || '4111 1111 1111 1111',
      expireDate: process.env.TEST_CARD_EXPIRE || '0330',
      cvv: process.env.TEST_CARD_CVV || '737',
    },
  },
  urls: {
    autoQuotationUrl: process.env.BASE_URL || `https://${process.env.ENV || 'qa'}-cotacao.youse.io/seguro-auto`,
    testUtilsUrl: process.env.TEST_UTILS_URL || `https://${process.env.ENV || 'qa'}-test-utils-service.youse.io/v1/orders`,
    bffUrl: process.env.BFF_URL || `https://${process.env.ENV || 'qa'}-bff.youse.io`,
    apiUrl: process.env.API_BASE_URL || '',
  },
  timeouts: {
    default: parseInt(process.env.TIMEOUT || '60000'),
    short: 5000,
    long: 20000,
  },
};
