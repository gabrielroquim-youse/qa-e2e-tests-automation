import { Page } from '@playwright/test';

/**
 * Limpa cookies, storage e cache do browser antes de uma nova cotação.
 * Evita estado de cotação anterior interferir no funil (ex.: PIX / checkout).
 */
export async function resetSession(page: Page): Promise<void> {
  await page.context().clearCookies();

  const onApp = /youse/i.test(page.url());
  if (onApp) {
    await page.evaluate(() => {
      try {
        localStorage.clear();
      } catch {
        /* no-op */
      }
      try {
        sessionStorage.clear();
      } catch {
        /* no-op */
      }
    });
  }

  try {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Network.clearBrowserCache');
    await cdp.detach();
  } catch {
    /* CDP indisponível em alguns contextos */
  }

  await page.goto('about:blank', { waitUntil: 'commit' });
  await new Promise((resolve) => setTimeout(resolve, 300));
}
