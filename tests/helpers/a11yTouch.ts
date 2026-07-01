import { expect, Locator } from '@playwright/test';

/**
 * Tap em controle touch (WCAG 2.5.x — alvo de toque).
 * Requer perfil mobile/tablet com `hasTouch: true` (sandbox a11y).
 *
 * Complementa teclado: usuário em celular usa dedo, não Tab.
 * Não substitui Appium nem validação de área mínima 44×44px isolada.
 */
export async function tapControl(target: Locator): Promise<void> {
  await target.scrollIntoViewIfNeeded();
  await expect(target, 'Controle deve estar visível antes do tap').toBeVisible();
  await target.tap();
}

/**
 * Verifica que um controle touch atende ao tamanho mínimo de 44×44px (WCAG 2.5.5).
 * Deve ser chamado em viewport mobile/tablet (vp ≤ 480px) para refletir o ambiente real.
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
 */
export async function expectMinTouchTarget(target: Locator, label: string): Promise<void> {
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  expect(box, `${label}: controle não encontrado no DOM`).not.toBeNull();
  expect(box!.width, `${label}: largura mínima 44px (WCAG 2.5.5)`).toBeGreaterThanOrEqual(44);
  expect(box!.height, `${label}: altura mínima 44px (WCAG 2.5.5)`).toBeGreaterThanOrEqual(44);
}
