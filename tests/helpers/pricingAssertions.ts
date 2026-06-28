import { expect } from '@playwright/test';

export const DELTA_TOLERANCE = 0.05;

export const PRICE_SANITY_FLOOR = 1;
export const PRICE_SANITY_CEILING = 99_999;

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

/** Preço mensal dentro de faixa razoável (motor offline ou bug crítico). */
export function expectSanityPrice(price: number, label = 'Preço'): void {
  expect(price, `${label} deve ser > R$ ${PRICE_SANITY_FLOOR}`).toBeGreaterThan(PRICE_SANITY_FLOOR);
  expect(price, `${label} deve ser < R$ ${PRICE_SANITY_CEILING}`).toBeLessThan(PRICE_SANITY_CEILING);
}

/** Ordinal estrito: cada valor deve ser menor que o próximo. */
export function expectStrictlyIncreasing(prices: number[], labels: string[]): void {
  expect(prices.length, 'Quantidade de preços deve bater com labels').toBe(labels.length);
  for (let i = 1; i < prices.length; i++) {
    expect(
      prices[i],
      `${labels[i]} (R$ ${prices[i]!.toFixed(2)}) deve ser maior que ${labels[i - 1]} (R$ ${prices[i - 1]!.toFixed(2)})`,
    ).toBeGreaterThan(prices[i - 1]!);
  }
}
