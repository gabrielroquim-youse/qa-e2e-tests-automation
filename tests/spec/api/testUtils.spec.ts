import { expect, test } from '../../fixtures/matchers';
import { test as Test } from '../../fixtures/setupPolicy';
import { Product } from '../../enum/Product';
import { TestUtilsService } from '../../services/test-utils/TestUtilsService';
import {
  TestUtilsCiDataSchema,
  TestUtilsClaimDataSchema,
  TestUtilsCustomerDataSchema,
  TestUtilsPolicyDataSchema,
} from '../../schemas/test-utils/TestUtilsServiceSchemas';

test.describe('Test Utils Service', { tag: ['@test_utils'] }, () => {
  Test('Deve criar apólice de seguro AUTO via Test Utils', async ({ request }) => {
    const res = await TestUtilsService.createInsurancePolicy(request, Product.AUTO);

    console.log('Created policy data:', JSON.stringify(res, null, 2));
    await expect(res).toMatchSchema(TestUtilsPolicyDataSchema);
  });

  test('Deve criar cliente via Test Utils', async ({ request }) => {
    const res = await TestUtilsService.createCustomer(request);

    await expect(res).toMatchSchema(TestUtilsCustomerDataSchema);
  });

  test('Deve gerar número de CI via Test Utils', async ({ request }) => {
    const res = await TestUtilsService.generateCiNumber(request);

    await expect(res).toMatchSchema(TestUtilsCiDataSchema);
  });

  Test('Fixture autoPolicyDminus1 deve retornar apólice válida', async ({ autoPolicyDminus1 }) => {
    await expect(autoPolicyDminus1).toMatchSchema(TestUtilsPolicyDataSchema);
  });

  Test('Deve criar sinistro AUTO via Test Utils', async ({ request }) => {
    const res = await TestUtilsService.createClaim(request, Product.AUTO);

    await expect(res).toMatchSchema(TestUtilsClaimDataSchema);
  });
});
