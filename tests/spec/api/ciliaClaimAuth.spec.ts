import { expect } from '../../fixtures/matchers';
import { test } from '../../fixtures/setupClaim';
import { CiliaClaimAuthService } from '../../services/bff/CiliaClaimAuth';
import { CiliaClaimAuthSchema } from '../../schemas/bff/CiliaClaimAuthSchemas';
import TestConfig from '../../../config/test.config';

const ccas = new CiliaClaimAuthService();
const DOCUMENT_NUMBER = TestConfig.credentials.documentNumber;
const DATE_OF_BIRTH = TestConfig.credentials.dateOfBirth;
const LICENSE_PLATE = TestConfig.credentials.licensePlate;

test.describe('Cilia Claim Auth Tests', { tag: ['@whatsapp_claim'] }, () => {
  test('[T38] Insured person can authenticate via whatsapp using document number', async ({ request }) => {
    const response = await ccas.insuredPersonAuth(request, { dateOfBirth: DATE_OF_BIRTH, documentNumber: DOCUMENT_NUMBER });
    const authResponse = await response.json();

    expect(response.status()).toBe(200);
    expect(authResponse.length).toBeGreaterThan(1);
    await expect(authResponse).toMatchSchema(CiliaClaimAuthSchema);
  });

  test('[T40] Insured person can authenticate via whatsapp using license plate', async ({ request }) => {
    const response = await ccas.insuredPersonAuth(request, { dateOfBirth: DATE_OF_BIRTH, licensePlate: LICENSE_PLATE });
    const authResponse = await response.json();

    expect(response.status()).toBe(200);
    await expect(authResponse).toMatchSchema(CiliaClaimAuthSchema);
  });

  test('[T39] Third party can authenticate via whatsapp using protocol number', async ({ request, partialLossClaim }) => {
    const response = await ccas.thirdPartyAuth(request, partialLossClaim.protocol_number as string);

    expect(response.status()).toBe(200);
  });

  test('[T42] Insured person authentication fails with invalid document number', async ({ request }) => {
    const response = await ccas.insuredPersonAuth(request, { dateOfBirth: DATE_OF_BIRTH, documentNumber: '000.000.000-00' });

    expect(response.status()).toBe(422);
  });

  test('[T43] Insured person authentication fails with invalid license plate', async ({ request }) => {
    const response = await ccas.insuredPersonAuth(request, { dateOfBirth: DATE_OF_BIRTH, licensePlate: 'XXX-0000' });

    expect(response.status()).toBe(422);
  });

  test('[T46] Insured person authentication fails with missing date of birth', async ({ request }) => {
    const response = await ccas.insuredPersonAuth(request, { documentNumber: DOCUMENT_NUMBER } as any);

    expect(response.status()).toBe(422);
  });

  test('[T47] Insured person authentication fails with missing document number and license plate', async ({ request }) => {
    const response = await ccas.insuredPersonAuth(request, { dateOfBirth: DATE_OF_BIRTH });

    expect(response.status()).toBe(422);
  });

  test('[T44] Insured person authentication fails when both document number and license plate are provided', async ({ request }) => {
    const response = await ccas.insuredPersonAuth(request, {
      dateOfBirth: DATE_OF_BIRTH,
      documentNumber: DOCUMENT_NUMBER,
      licensePlate: LICENSE_PLATE,
    });

    expect(response.status()).toBe(422);
  });

  test('[T48] Third party authentication fails with missing protocol number', async ({ request }) => {
    const response = await ccas.thirdPartyAuth(request, '' as any);

    expect(response.status()).toBe(422);
  });

  test('[T41] Third party authentication fails with invalid protocol number', async ({ request }) => {
    const response = await ccas.thirdPartyAuth(request, 'XXXXXXXX');

    expect(response.status()).toBe(404);
  });
});
