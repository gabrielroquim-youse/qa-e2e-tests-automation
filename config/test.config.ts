export const TestConfig = {
  credentials: {
    name: process.env.TEST_NAME || 'John Youser',
    email: process.env.TEST_EMAIL || 'automation@youse.com.br',
    phone: process.env.TEST_USER_TEL || '11999620332',
    creditCard: {
      number: process.env.TEST_CARD_NUMBER || '4111 1111 1111 1111',
      expireDate: process.env.TEST_CARD_EXPIRE || '03/30',
      cvv: process.env.TEST_CARD_CVV || '737',
    },
  },
  urls: {
    baseUrl: process.env.BASE_URL || 'https://qa-cotacao.youse.io/seguro-auto/',
    apiUrl: process.env.API_BASE_URL || '',
  },
  timeouts: {
    default: parseInt(process.env.TIMEOUT || '60000'),
    short: 5000,
    long: 15000,
  },
};
