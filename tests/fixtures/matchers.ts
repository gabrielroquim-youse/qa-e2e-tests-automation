/**
 * Custom matchers do Playwright para validação de contratos de API.
 *
 * Estende o `expect` nativo com `toMatchSchema(schema)`, que valida
 * objetos contra um schema Zod e exibe erros detalhados de tipagem.
 *
 * Uso: import { expect } from '../fixtures/matchers';
 */
import { expect as baseExpect } from '@playwright/test';
import * as z from 'zod';

export { test } from '@playwright/test';

export const expect = baseExpect.extend({
  async toMatchSchema(obj: object, expected: z.ZodType, _options?: { timeout?: number }) {
    let pass: boolean;
    let message: string;

    try {
      expected.parse(obj);
      pass = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      pass = false;
      message = e.message;
    }

    return {
      pass,
      message: () => {
        return message;
      },
    };
  },
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PlaywrightTest {
    interface Matchers<R> {
      toMatchSchema(expected: z.ZodType, options?: { timeout?: number }): Promise<R>;
    }
  }
}
