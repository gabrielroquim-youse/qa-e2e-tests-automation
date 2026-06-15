/**
 * Fixture de pré-condição para testes de sinistro.
 *
 * Cria um sinistro de perda parcial via TestUtilsService antes do teste
 * e o disponibiliza como `partialLossClaim` para uso direto no spec.
 * Elimina a necessidade de setup manual de sinistros em cada teste.
 */
import { test as base } from '@playwright/test';
import { Product } from '../enum/Product';
import { TestUtilsService } from '../services/test-utils/TestUtilsService';
import { TestUtilsClaimData } from '../schemas/test-utils/TestUtilsServiceSchemas';

type Fixtures = {
  partialLossClaim: TestUtilsClaimData;
};

export const test = base.extend<Fixtures>({
  partialLossClaim: async ({ request }, use) => {
    const claimData = await TestUtilsService.createClaim(request, Product.AUTO);
    await use(claimData);
  },
});
