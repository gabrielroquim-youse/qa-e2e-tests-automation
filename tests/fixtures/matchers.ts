import { expect as baseExpect } from '@playwright/test';
import * as z from 'zod';

export { test } from '@playwright/test';

export const expect = baseExpect.extend({
  async toMatchSchema(obj: Object, expected: z.ZodType, options?: { timeout?: number }) {
    let pass: boolean;
    let message: string;

    try {
      expected.parse(obj);
      pass = true;
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
  namespace PlaywrightTest {
    interface Matchers<R> {
      toMatchSchema(expected: z.ZodType, options?: { timeout?: number }): Promise<R>;
    }
  }
}
