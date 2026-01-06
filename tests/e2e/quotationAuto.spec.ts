import { expect, test } from '@playwright/test';
import { MaritalStatuses } from '../enum/MaritalStatuses';
import { VehicleUsages } from '../enum/VehicleUsages';
import LeadInfoPage from '../pages/quotation/LeadInfoPage';

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
