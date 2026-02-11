import { test as base } from '@playwright/test';
import { TestUtilsService } from '../services/test-utils/TestUtilsService';
import { Product } from '../enum/Product';
import { TestUtilsClaimData } from '../schemas/test-utils/TestUtilsServiceSchemas';

type Fixtures = {
  partialLossClaim: TestUtilsClaimData;
};

export const test = base.extend<Fixtures>({
  partialLossClaim: async ({ request }, use) => {
    const claimData = await TestUtilsService.createClaim(request, Product.AUTO);
    use(claimData);
  },
});
