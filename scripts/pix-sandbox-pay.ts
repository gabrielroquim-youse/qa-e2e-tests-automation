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

interface StarkCredentials {
  projectId: string;
  privateKey: string;
  taxId: string;
}

function readStarkCredentials(): StarkCredentials | null {
  const projectId = process.env.STARK_PROJECT_ID?.trim();
  const privateKey = process.env.STARK_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();
  const taxId = process.env.STARK_TAX_ID?.trim();

  if (!projectId || !privateKey || !taxId) {
    return null;
  }
  return { projectId, privateKey, taxId };
}

async function payBrcodeWithStark(brcode: string, credentials: StarkCredentials): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const starkbank = require('starkbank') as {
    Project: new (args: { environment: string; id: string; privateKey: string }) => unknown;
    user: unknown;
    brcodePayment: {
      create: (payments: Array<{ brcode: string; taxId: string; description: string }>) => Promise<Array<{ id: string; status: string }>>;
    };
  };

  starkbank.user = new starkbank.Project({
    environment: 'sandbox',
    id: credentials.projectId,
    privateKey: credentials.privateKey,
  });

  const payments = await starkbank.brcodePayment.create([
    {
      brcode,
      taxId: credentials.taxId,
      description: 'QA E2E Youse PIX automation',
    },
  ]);

  const payment = payments[0];
  console.log(`\n[stark] BrcodePayment criado: id=${payment.id} status=${payment.status}\n`);
}

async function main(): Promise<void> {
  const capture = loadPixBrcodeCapture();
  const brcode = process.env.PIX_BRCODE?.trim() ?? capture?.brcode;

  if (!brcode) {
    console.error('BR Code não encontrado. Rode: npm run tool:pix-capture');
    process.exit(1);
  }

  const credentials = readStarkCredentials();
  if (!credentials) {
    console.error('Credenciais Stark sandbox ausentes.');
    console.error('Defina STARK_PROJECT_ID, STARK_PRIVATE_KEY e STARK_TAX_ID no .env');
    console.error('Alternativa manual: npm run tool:pix-confirm');
    process.exit(1);
  }

  try {
    await payBrcodeWithStark(brcode, credentials);
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
