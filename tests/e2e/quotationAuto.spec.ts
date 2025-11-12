import { test, expect } from '@playwright/test';
import { LeadInfo } from '../pages/quotation/LeadInfo';
import { VehicleDetails } from '../pages/quotation/VehicleDetails';
import { VehicleAdditionalDetails } from '../pages/quotation/VehicleAdditionalDetaisl';
import { PersonData } from '../pages/quotation/PersonData';
import { BonusesClass } from '../pages/quotation/BonusesClass';
import { PlanSelection } from '../pages/quotation/PlanSelection';
import { Checkout } from '../pages/quotation/Checkout';
import { Issuance } from '../pages/quotation/Issuance';
import { VehicleUsages } from '../enum/VehicleUsages';
import { MaritalStatuses } from '../enum/MaritalStatuses';

let leadInfo: LeadInfo;
let vehicleDetails: VehicleDetails;
let vehicleAdditionalDetails: VehicleAdditionalDetails;
let personData: PersonData;
let bonusesClass: BonusesClass;
let planSelection: PlanSelection;
let checkout: Checkout;
let issuance: Issuance;

test.beforeEach(async ({ page }) => {
  leadInfo = new LeadInfo(page);
  vehicleDetails = new VehicleDetails(page);
  vehicleAdditionalDetails = new VehicleAdditionalDetails(page);
  personData = new PersonData(page);
  bonusesClass = new BonusesClass(page);
  planSelection = new PlanSelection(page);
  checkout = new Checkout(page);
  issuance = new Issuance(page);
  await leadInfo.open();
});

test.describe('Auto quotation', { tag: ['@b2c', '@auto_quotation'] }, () => {
  test('Preformatted plan - No bonus class', async ({ page }) => {
    await leadInfo.fillLeadData();
    await leadInfo.clickContinueBtn();
    await vehicleDetails.fillLicensePlate();
    await vehicleDetails.brandNew(false);
    await vehicleDetails.bulletproof(false);
    await vehicleDetails.clickContinueBtn();
    await vehicleAdditionalDetails.fillAddress();
    await vehicleAdditionalDetails.overnightGarage(true);
    await vehicleAdditionalDetails.selectUsage(VehicleUsages.PRIVATE);
    await vehicleAdditionalDetails.clickContinueBtn();
    await personData.fillDocumentNumber();
    await personData.selectMaritalStatus(MaritalStatuses.MARRIED);
    await personData.clickContinueBtn();
    await bonusesClass.onPageCheck();
    await bonusesClass.userBonusClass(false);
    await bonusesClass.clickContinueBtn();
    await planSelection.selectPreFormatedPlan();
    await page.waitForTimeout(5000); //Wait for order processing
    await checkout.fillCreditCardData();
    await checkout.fillEmailConfirmation();
    await checkout.clickFinishBtn();
    await page.waitForTimeout(5000); // Wait for payment processing
    await expect(issuance.title).toHaveText('Pagamento confirmado');
  });
});
