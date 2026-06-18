import { expect } from '@playwright/test';

export const DELTA_TOLERANCE = 0.05;

/**
 * Liga/desliga um toggle e valida delta simétrico: delta_on + delta_off ≈ 0.
 * Retorna o delta positivo ao ligar (útil para logs).
 */
export async function assertSymmetricPriceToggle(
  getPrice: () => Promise<number>,
  waitForUpdate: (from: number) => Promise<void>,
  toggle: () => Promise<void>,
): Promise<number> {
  const baseline = await getPrice();

  await toggle();
  await waitForUpdate(baseline);
  const onPrice = await getPrice();
  const deltaOn = onPrice - baseline;
  expect(deltaOn, 'Ativar item deve aumentar o prêmio').toBeGreaterThan(DELTA_TOLERANCE);

  await toggle();
  await waitForUpdate(onPrice);
  const offPrice = await getPrice();
  expect(Math.abs(offPrice - baseline), 'Desligar item deve restaurar o prêmio inicial (± tolerância)').toBeLessThanOrEqual(DELTA_TOLERANCE);

  return deltaOn;
}
