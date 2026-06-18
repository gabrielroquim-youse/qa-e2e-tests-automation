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
