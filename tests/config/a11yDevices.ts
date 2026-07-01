import { devices, type PlaywrightTestProject } from '@playwright/test';

/**
 * Perfis de dispositivo para o sandbox de acessibilidade.
 *
 * Escopo deste repositório: desktop e tablet.
 * Celular (Android/iOS): coberto por qa-mobile-tests-automation.
 */
export type A11yDeviceId = 'desktop' | 'desktop-wide' | 'tablet' | 'tablet-landscape' | 'mobile-chrome' | 'mobile-ios';

export interface A11yDeviceProfile {
  id: A11yDeviceId;
  /** Nome legível para relatórios e docs. */
  label: string;
  category: 'desktop' | 'tablet' | 'mobile';
  /**
   * Chave em `@playwright/test` → `devices`.
   * Omitir para desktop — viewport é definida diretamente.
   */
  playwrightDeviceKey?: keyof typeof devices;
  viewport: { width: number; height: number };
  nativeBrowser: 'chromium' | 'webkit';
}

export const A11Y_DEVICE_PROFILES: Record<A11yDeviceId, A11yDeviceProfile> = {
  // ── Desktop (foco deste repo) ─────────────────────────────────────────────
  desktop: {
    id: 'desktop',
    label: 'Desktop — 1280×800 (Chrome)',
    category: 'desktop',
    viewport: { width: 1280, height: 800 },
    nativeBrowser: 'chromium',
  },
  'desktop-wide': {
    id: 'desktop-wide',
    label: 'Desktop Wide — 1920×1080 (Chrome)',
    category: 'desktop',
    viewport: { width: 1920, height: 1080 },
    nativeBrowser: 'chromium',
  },
  // ── Tablet (foco deste repo) ──────────────────────────────────────────────
  tablet: {
    id: 'tablet',
    label: 'Tablet — iPad 7ª geração (810×1080)',
    category: 'tablet',
    playwrightDeviceKey: 'iPad (gen 7)',
    viewport: { width: 810, height: 1080 },
    nativeBrowser: 'webkit',
  },
  'tablet-landscape': {
    id: 'tablet-landscape',
    // WCAG 1.3.4 — conteúdo não deve ser bloqueado por orientação
    label: 'Tablet Landscape — iPad 7ª geração deitado (1080×810)',
    category: 'tablet',
    playwrightDeviceKey: 'iPad (gen 7) landscape',
    viewport: { width: 1080, height: 810 },
    nativeBrowser: 'webkit',
  },
  // ── Mobile — manter aqui somente como referência; use qa-mobile-tests-automation ──
  'mobile-chrome': {
    id: 'mobile-chrome',
    label: 'Celular Android — Pixel 5 (Chrome) [→ qa-mobile-tests-automation]',
    category: 'mobile',
    playwrightDeviceKey: 'Pixel 5',
    viewport: { width: 393, height: 851 },
    nativeBrowser: 'chromium',
  },
  'mobile-ios': {
    id: 'mobile-ios',
    label: 'Celular iOS — iPhone 13 [→ qa-mobile-tests-automation]',
    category: 'mobile',
    playwrightDeviceKey: 'iPhone 13',
    viewport: { width: 390, height: 844 },
    nativeBrowser: 'webkit',
  },
};

const A11Y_USE = {
  headless: !!process.env.CI,
  video: 'off' as const,
  trace: 'off' as const,
};

/** Emula dispositivo WebKit com Chrome instalado (Windows/dev sem `playwright install webkit`). */
function useChromeEmulation(profile: A11yDeviceProfile): boolean {
  return !process.env.CI && profile.nativeBrowser === 'webkit';
}

function createA11yProject(profile: A11yDeviceProfile): PlaywrightTestProject {
  const device = profile.playwrightDeviceKey ? devices[profile.playwrightDeviceKey] : undefined;
  const chromeEmulation = useChromeEmulation(profile);

  return {
    name: profile.id,
    testMatch: /\/a11y\//,
    use: {
      ...(device ?? {}),
      ...A11Y_USE,
      viewport: profile.viewport,
      ...(chromeEmulation ? { browserName: 'chromium', channel: 'chrome' } : {}),
      ...(!chromeEmulation && !process.env.CI && profile.nativeBrowser === 'chromium' ? { channel: 'chrome' } : {}),
    },
  };
}

/**
 * Projetos Playwright do sandbox a11y.
 * Padrão: desktop + tablet portrait + tablet landscape (foco deste repo).
 * Mobile: qa-mobile-tests-automation.
 */
export function createA11yProjects(deviceIds?: A11yDeviceId[]): PlaywrightTestProject[] {
  const ids = deviceIds ?? (['desktop', 'tablet', 'tablet-landscape'] as A11yDeviceId[]);
  return ids.map((id) => createA11yProject(A11Y_DEVICE_PROFILES[id]));
}

export function listA11yDevices(): A11yDeviceProfile[] {
  return Object.values(A11Y_DEVICE_PROFILES);
}
