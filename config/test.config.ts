export const TestConfig = {
    credentials: {
        nome: process.env.TEST_NAME || 'Diogo qa',
        email: process.env.TEST_EMAIL || 'teste@teste.com.br',
        tel: process.env.TEST_USER_TEL || '11999620332'
    },
    urls: {
        baseUrl: process.env.BASE_URL || 'https://qa-cotacao.youse.io/seguro-auto/',
        apiUrl: process.env.API_BASE_URL || ''
    },
    timeouts: {
        default: parseInt(process.env.TIMEOUT || '30000'),
        short: 5000,
        long: 60000
    }
};