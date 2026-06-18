import { expect, Locator, Page } from '@playwright/test';

const TAB_DELAY_MS = 50;

/**
 * Pressiona Tab até o locator receber foco (WCAG 2.4.3 — ordem de foco).
 */
export async function tabUntilFocused(page: Page, target: Locator, maxTabs = 40): Promise<void> {
  for (let i = 0; i < maxTabs; i++) {
    const focused = await target.evaluate((el) => el === document.activeElement).catch(() => false);
    if (focused) return;
    await page.keyboard.press('Tab');
    await new Promise((resolve) => setTimeout(resolve, TAB_DELAY_MS));
  }
  await expect(target, `Elemento não recebeu foco após ${maxTabs} pressionamentos de Tab`).toBeFocused();
}

/** Digita texto no elemento focado (substitui conteúdo atual). */
export async function typeInFocusedField(page: Page, text: string): Promise<void> {
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(text, { delay: 15 });
}

/** Ativa controle focado (botão, link). */
export async function activateFocused(page: Page): Promise<void> {
  await page.keyboard.press('Enter');
}

/**
 * Verifica que o controle é alcançável via Tab a partir do foco atual.
 */
export async function expectReachableByTab(page: Page, target: Locator, maxTabs = 40): Promise<void> {
  await tabUntilFocused(page, target, maxTabs);
  await expect(target).toBeFocused();
}
