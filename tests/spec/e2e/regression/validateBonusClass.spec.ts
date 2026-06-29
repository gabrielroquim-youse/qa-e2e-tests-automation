/**
 * Testes E2E focados no comportamento da etapa de Classe de Bônus.
 *
 * Valida os cenários: não utilizar bônus, exibir modal informativo,
 * selecionar uma classe específica e selecionar "Não quero informar".
 * Utiliza encadeamento fluente via proxymise (sem await intermediário).
 */
import { expect, test } from '../../../fixtures/setupQuotation';
import { VehicleUsages } from '../../../enum/VehicleUsages';
import { MaritalStatuses } from '../../../enum/MaritalStatuses';
import LeadInfoPage from '../../../pages/quotation/LeadInfoPage';
import { UserBonusClass } from '../../../enum/UserBonusClass';

test.describe('Classe de Bônus - Seguro Auto', { tag: ['@b2c', '@quotation_auto', '@regression'] }, () => {
  test('Não deve utilizar classe de bônus', async ({ page }) => {
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
      .useBonusClass(false);
    await expect(result.whatsappBtn).toBeVisible();
  });

  test('Deve exibir modal ao clicar em "Não sei minha Classe de Bônus"', async ({ page }) => {
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
      .useBonusClass(true)
      .infoKnowNotBonusClass();
    await expect(result.modalDontKnowBonusClassTitle).toBeVisible();
  });

  test('Deve selecionar Classe de Bônus 1', async ({ page }) => {
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
      .useBonusClass(true)
      .infoKnowNotBonusClass();
    await expect(result.modalDontKnowBonusClassTitle).toBeVisible();
  });

  test('Deve selecionar "Não quero informar" na Classe de Bônus', async ({ page }) => {
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
      .useBonusClass(true, UserBonusClass.NAN);
    await expect(result.userBonusesClass).toHaveValue('Não quero informar');
  });
});
