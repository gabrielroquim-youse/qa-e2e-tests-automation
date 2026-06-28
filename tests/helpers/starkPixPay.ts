export interface StarkCredentials {
  projectId: string;
  privateKey: string;
  taxId: string;
}

export interface StarkBrcodePaymentResult {
  id: string;
  status: string;
}

export function readStarkCredentials(): StarkCredentials | null {
  const projectId = process.env.STARK_PROJECT_ID?.trim();
  const privateKey = process.env.STARK_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();
  const taxId = process.env.STARK_TAX_ID?.trim();

  if (!projectId || !privateKey || !taxId) {
    return null;
  }
  return { projectId, privateKey, taxId };
}

export function hasStarkCredentials(): boolean {
  return readStarkCredentials() !== null;
}

export async function payBrcodeWithStark(brcode: string, credentials?: StarkCredentials): Promise<StarkBrcodePaymentResult> {
  const creds = credentials ?? readStarkCredentials();
  if (!creds) {
    throw new Error('Credenciais Stark ausentes (STARK_PROJECT_ID, STARK_PRIVATE_KEY, STARK_TAX_ID).');
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const starkbank = require('starkbank') as {
    Project: new (args: { environment: string; id: string; privateKey: string }) => unknown;
    user: unknown;
    brcodePayment: {
      create: (payments: Array<{ brcode: string; taxId: string; description: string }>) => Promise<StarkBrcodePaymentResult[]>;
    };
  };

  starkbank.user = new starkbank.Project({
    environment: 'sandbox',
    id: creds.projectId,
    privateKey: creds.privateKey,
  });

  const payments = await starkbank.brcodePayment.create([
    {
      brcode,
      taxId: creds.taxId,
      description: 'QA E2E Youse PIX automation',
    },
  ]);

  return payments[0];
}
