import {test} from '@playwright/test'
import { LeadInfo } from '../pages/quotation/LeadInfo'
import { VehicleDetails } from '../pages/quotation/VehicleDetails';
import { VehicleAdditionalDetails } from '../pages/quotation/VehicleAdditionalDetaisl';
import { PersonData } from '../pages/quotation/PersonData';
import { BonusesClass } from '../pages/quotation/BonusesClass';
import { PlanSelection } from '../pages/quotation/PlanSelection';
import { Checkout } from '../pages/quotation/Checkout';
import { Issuance } from '../pages/quotation/Issuance';
import { VehicleUsages } from '../enum/VehicleUsages';
import { MaritalStatuses } from '../enum/MaritalStatuses';
import { UserBonusClass } from '../enum/UserBonusClass';

type FixtureQuotation = {
    leadInfo: LeadInfo;
    veheicleDetatils: VehicleDetails;
    vehicleAdditionalDetails: VehicleAdditionalDetails;
    personData: PersonData;
    maritalStatus: MaritalStatuses
    bonusesClass: BonusesClass;
    hasBonus: boolean
    userBonusClass: UserBonusClass
    planSelection: PlanSelection;
    checkout: Checkout;
    issuance: Issuance;
    
}

export const quotation = test.extend<FixtureQuotation>({
    leadInfo: async({page}, use)=>{
        const leadInfo = new LeadInfo(page);

        await leadInfo.open();
        await leadInfo.fillLeadData();
        await leadInfo.clickContinueBtn();
        await use(leadInfo);
    },

    veheicleDetatils: async ({page, leadInfo}, use) => {
        const veheicleDetatils = new VehicleDetails(page);

        await veheicleDetatils.fillLicensePlate();
        await veheicleDetatils.brandNew(false);
        await veheicleDetatils.bulletproof(false);
        await veheicleDetatils.clickContinueBtn();
        await use(veheicleDetatils);
    },
    vehicleAdditionalDetails: async ({page, veheicleDetatils}, use) => {
        const vehicleAdditionalDetails = new VehicleAdditionalDetails(page);

        await vehicleAdditionalDetails.fillAddress();
        await vehicleAdditionalDetails.overnightGarage(true);
        await vehicleAdditionalDetails.selectUsage(VehicleUsages.PRIVATE);
        await vehicleAdditionalDetails.clickContinueBtn();
        await use(vehicleAdditionalDetails);
    },
    maritalStatus: async ({}, use) => {
        await use(MaritalStatuses.MARRIED)
    },
    personData: async({page, maritalStatus, vehicleAdditionalDetails}, use ) =>{
        const personData = new PersonData(page);

        await personData.fillDocumentNumber();
        await personData.selectMaritalStatus(maritalStatus);
        await personData.clickContinueBtn();
        await use(personData);
    },

    hasBonus: async ({}, use) => {
        await use(false); 
    },
    
    userBonusClass: async ({}, use) => {
        await use(UserBonusClass.ONE); 
    },

    bonusesClass: async ({page, personData, hasBonus, userBonusClass}, use) => {
        const bonusesClass = new BonusesClass(page);

        await bonusesClass.onPageCheck();
        await bonusesClass.typeBonusClass(hasBonus, userBonusClass);
        await bonusesClass.clickContinueBtn();
        await use(bonusesClass);
    },

    planSelection: async ({page, bonusesClass}, use) => {
        const planSelection = new PlanSelection(page);

        await planSelection.selectPreFormatedPlan();
        await use(planSelection);
    },
    checkout: async ({page, planSelection}, use) => {
        const checkout = new Checkout(page);

        await checkout.fillCreditCardData();
        await checkout.fillEmailConfirmation();
        await checkout.clickFinishBtn();
        await use(checkout);
    },
    issuance: async ({page, checkout}, use) => {
        const issuance = new Issuance(page)

        await issuance.title.waitFor({state: 'visible'})
        await use(issuance)
    }
});

export {expect } from '@playwright/test'