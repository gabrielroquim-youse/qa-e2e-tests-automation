import 'dotenv/config';

/**
 * Paga BR Code PIX no Stark Bank sandbox (quando credenciais disponíveis).
 *
 * Env:
 *   STARK_PROJECT_ID
 *   STARK_PRIVATE_KEY  (PEM; use \n para quebras em .env)
 *   STARK_TAX_ID       (CPF/CNPJ do pagador no sandbox)
 *
 * Uso:
 *   npm run tool:pix-pay
 *   npm run tool:pix-capture && npm run tool:pix-pay && npm run test:pix:emission
 */
import { loadPixBrcodeCapture } from '../tests/helpers/pixSandbox';
import { hasStarkCredentials, payBrcodeWithStark } from '../tests/helpers/starkPixPay';

async function main(): Promise<void> {
  const capture = loadPixBrcodeCapture();
  const brcode = process.env.PIX_BRCODE?.trim() ?? capture?.brcode;

  if (!brcode) {
    console.error('BR Code não encontrado. Rode: npm run tool:pix-capture');
    process.exit(1);
  }

  if (!hasStarkCredentials()) {
    console.error('Credenciais Stark sandbox ausentes.');
    console.error('Defina STARK_PROJECT_ID, STARK_PRIVATE_KEY e STARK_TAX_ID no .env');
    console.error('Alternativa manual: npm run tool:pix-confirm');
    process.exit(1);
  }

  try {
    const payment = await payBrcodeWithStark(brcode);
    console.log(`\n[stark] BrcodePayment criado: id=${payment.id} status=${payment.status}\n`);
    console.log('Aguarde o webhook (alguns segundos) e rode: npm run test:pix:emission');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/Cannot find module 'starkbank'/.test(message)) {
      console.error('Pacote starkbank não instalado. Rode: npm install starkbank --save-dev');
    } else {
      console.error(`Falha ao pagar BR Code: ${message}`);
    }
    process.exit(1);
  }
}

void main();
