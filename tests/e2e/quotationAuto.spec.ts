import { test, expect, request } from '@playwright/test'
import { LeadInfo } from "../pages/quotation/LeadInfo";
import { VehicleDetails } from "../pages/quotation/VehicleDetails"
import { VehicleAdditionalDetails } from '../pages/quotation/VehicleAdditionalDetaisl'; 
import { PersonData } from '../pages/quotation/PersonData';
import { BonusesClass } from '../pages/quotation/BonusesClass';
import { PlanSelection } from '../pages/quotation/PlanSelection';
import { Checkout } from '../pages/quotation/Checkout';
import { Issuance } from '../pages/quotation/Issuance';

let leadInfo: LeadInfo
let vehicleDetails: VehicleDetails
let vehicleAdditionalDetails: VehicleAdditionalDetails
let personData: PersonData
let bonusesClass: BonusesClass
let planSelection: PlanSelection
let checkout: Checkout
let issuance: Issuance

test.beforeEach(async ({ page }) => {
    leadInfo = new LeadInfo(page);
    vehicleDetails = new VehicleDetails(page)
    vehicleAdditionalDetails = new VehicleAdditionalDetails(page)
    bonusesClass = new BonusesClass(page)
    personData = new PersonData(page)
    planSelection = new PlanSelection(page)
    checkout = new Checkout(page)
    issuance = new Issuance(page)
    await leadInfo.open();
})

test('Auto quotation', async ({ page }) => {
    await leadInfo.execute()
    await vehicleDetails.execute()
    await vehicleAdditionalDetails.execute()
    await personData.execute()
    await bonusesClass.execute()
    await planSelection.execute()
    await checkout.execute()
    await issuance.execute()
})