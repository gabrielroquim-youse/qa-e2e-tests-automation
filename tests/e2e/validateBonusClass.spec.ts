import { expect, test } from "@playwright/test";
import { VehicleUsages } from "../enum/VehicleUsages";
import { MaritalStatuses } from "../enum/MaritalStatuses";
import LeadInfoPage  from "../pages/quotation/LeadInfoPage";
import { UserBonusClass } from "../enum/UserBonusClass";


test.describe('Validate Bonus Class', {tag:['@b2c', '@quotation_auto']}, () => {
    test('Not use bonus class', async({page}) => {
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
        await expect(result.whatsappBtn).toHaveText('Chame no whatsapp')
    })
    test('Info dont know bonus class modal', async({page}) => {
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
        await expect(result.whatsappBtn).toHaveText('Chame no whatsapp')
    })
    test('With Bonus Class 1', async({page}) => {
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
        await expect(result.modalKnowNotBonusClassTitle).toBeVisible();
    })
    test('With Bonus Class "Não quero informar"', async({page}) => {
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
        await expect(result.userBonusesClass).toHaveValue('Não quero informar')
    })

})
