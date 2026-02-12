import { expect, test } from '../../fixtures/matchers';
import { MaritalStatuses } from '../../enum/MaritalStatuses';
import { VehicleUsages } from '../../enum/VehicleUsages';
import LeadInfoPage from '../../pages/quotation/LeadInfoPage';
import { TestUtilsService } from '../../services/test-utils/TestUtilsService';
import { Product } from '../../enum/Product';
import { test as Test } from '../../fixtures/setupPolicy';
import {
  TestUtilsCiDataSchema,
  TestUtilsClaimDataSchema,
  TestUtilsCustomerDataSchema,
  TestUtilsPolicyDataSchema,
} from '../../schemas/test-utils/TestUtilsServiceSchemas';

test.describe('B2C - Quotation Auto', { tag: ['@b2c', '@quotation_auto'] }, () => {
  test('Preformatted plan - No bonus class', async ({ page }) => {
    const result = await LeadInfoPage.open(page)
      .fillLeadData()
      .clickContinueBtn()
      .fillLicensePlate()
      .selectBrandNew(false)
      .selectBulletproof(false)
      .clickContinueBtn()
      .fillAddress()
      .isOvernightGarage(true)
      .selectUsage(VehicleUsages.PRIVATE)
      .clickContinueBtn()
      .fillDocumentNumber()
      .selectMaritalStatus(MaritalStatuses.SINGLE)
      .clickContinueBtn()
      .useBonusClass(false)
      .clickContinueBtn()
      .selectPreFormatedPlan()
      .checkEmailConfirmation()
      .fillCreditCardData()
      .clickFinishBtn();

    await expect(result.title).toHaveText('Pagamento confirmado', { timeout: 25_000 });
  });
});

Test.describe('Test Utils', { tag: ['@test_utils'] }, () => {
  Test('Create insurance policy via Test Utils Service', async ({ request }) => {
    const res = await TestUtilsService.createInsurancePolicy(request, Product.AUTO);

    console.log('Created policy data:', JSON.stringify(res, null, 2));
    expect(res).toMatchSchema(TestUtilsPolicyDataSchema);
  });

  test('Create customer via Test Utils Service', async ({ request }) => {
    const res = await TestUtilsService.createCustomer(request);

    expect(res).toMatchSchema(TestUtilsCustomerDataSchema);
  });

  test('Generate CI number via Test Utils Service', async ({ request }) => {
    const res = await TestUtilsService.generateCiNumber(request);

    expect(res).toMatchSchema(TestUtilsCiDataSchema);
  });

  Test('Test Fixture: createAutoPolicy', async ({ autoPolicyDminus1 }) => {
    expect(autoPolicyDminus1).toMatchSchema(TestUtilsPolicyDataSchema);
  });

  Test('Create claim via Test Utils Service', async ({ request }) => {
    const res = await TestUtilsService.createClaim(request, Product.AUTO);

    expect(res).toMatchSchema(TestUtilsClaimDataSchema);
  });
});
