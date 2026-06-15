/**
 * Fixture de pré-condição para testes de apólice.
 *
 * Cria apólices ativas (Auto, Residencial, Vida) via TestUtilsService antes
 * do teste. Cada fixture representa um cenário específico de apólice:
 * D-1, com/sem inspeção, presencial, online ou vídeo.
 * Elimina a necessidade de contratar um seguro manualmente em cada teste.
 */
import { test as base } from '@playwright/test';
import { Product } from '../enum/Product';
import { TestUtilsService } from '../services/test-utils/TestUtilsService';
import { TestUtilsPolicyData } from '../schemas/test-utils/TestUtilsServiceSchemas';

type Fixtures = {
  autoPolicyDminus1: TestUtilsPolicyData;
  homePolicyDminus1: TestUtilsPolicyData;
  lifePolicyDminus1: TestUtilsPolicyData;
  autoPolicyNoInspection: TestUtilsPolicyData;
  autoPolicyOnlineInspection: TestUtilsPolicyData;
  autoPolicyOnSiteInspection: TestUtilsPolicyData;
  autoPolicyVideoInspection: TestUtilsPolicyData;
};

export const test = base.extend<Fixtures>({
  autoPolicyDminus1: async ({ request }, use) => {
    const policyData = await TestUtilsService.createInsurancePolicy(request, Product.AUTO, { documentNumber: '123.456.761-08' });
    await use(policyData);
  },
  homePolicyDminus1: async ({ request }, use) => {
    const policyData = await TestUtilsService.createInsurancePolicy(request, Product.HOME, { documentNumber: '123.456.761-08' });
    await use(policyData);
  },
  lifePolicyDminus1: async ({ request }, use) => {
    const policyData = await TestUtilsService.createInsurancePolicy(request, Product.LIFE, { documentNumber: '123.456.761-08' });
    await use(policyData);
  },
  autoPolicyNoInspection: async ({ request }, use) => {
    const policyData = await TestUtilsService.createInsurancePolicy(request, Product.AUTO, { license_plate: 'YOU-0020' });
    await use(policyData);
  },
  autoPolicyOnlineInspection: async ({ request }, use) => {
    const policyData = await TestUtilsService.createInsurancePolicy(request, Product.AUTO, { license_plate: 'YOU-0003' });
    await use(policyData);
  },
  autoPolicyOnSiteInspection: async ({ request }, use) => {
    const policyData = await TestUtilsService.createInsurancePolicy(request, Product.AUTO, { license_plate: 'YOU-0002' });
    await use(policyData);
  },
  autoPolicyVideoInspection: async ({ request }, use) => {
    const policyData = await TestUtilsService.createInsurancePolicy(request, Product.AUTO, { license_plate: 'YOU-0023' });
    await use(policyData);
  },
});
