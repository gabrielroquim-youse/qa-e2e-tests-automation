import { test as base } from '@playwright/test';
import { TestUtilsService } from '../services/TestUtilsService';
import { Product } from '../enum/Product';

type Fixtures = {
  autoPolicyDminus1: TestUtilsService;
  homePolicyDminus1: TestUtilsService;
  lifePolicyDminus1: TestUtilsService;
  autoPolicyNoInpsection: TestUtilsService;
  autoPolicyOnlienInspection: TestUtilsService;
  autoPolicyOnSiteInspection: TestUtilsService;
  autoPolicyVideoInspection: TestUtilsService;
};

export const test = base.extend<Fixtures>({
  autoPolicyDminus1: async ({ request }, use) => {
    const policyData = await TestUtilsService.createInsurancePolicy(request, Product.AUTO, { documentNumber: '123.456.761-08' });
    use(policyData);
  },
  homePolicyDminus1: async ({ request }, use) => {
    const policyData = await TestUtilsService.createInsurancePolicy(request, Product.HOME, { documentNumber: '123.456.761-08' });
    use(policyData);
  },
  lifePolicyDminus1: async ({ request }, use) => {
    const policyData = await TestUtilsService.createInsurancePolicy(request, Product.LIFE, { documentNumber: '123.456.761-08' });
    use(policyData);
  },
  autoPolicyNoInpsection: async ({ request }, use) => {
    const policyData = await TestUtilsService.createInsurancePolicy(request, Product.AUTO, { license_plate: 'YOU-0020' });
    use(policyData);
  },
  autoPolicyOnlienInspection: async ({ request }, use) => {
    const policyData = await TestUtilsService.createInsurancePolicy(request, Product.AUTO, { license_plate: 'YOU-0003' });
    use(policyData);
  },
  autoPolicyOnSiteInspection: async ({ request }, use) => {
    const policyData = await TestUtilsService.createInsurancePolicy(request, Product.AUTO, { license_plate: 'YOU-0002' });
    use(policyData);
  },
  autoPolicyVideoInspection: async ({ request }, use) => {
    const policyData = await TestUtilsService.createInsurancePolicy(request, Product.AUTO, { license_plate: 'YOU-0023' });
    use(policyData);
  },
});
