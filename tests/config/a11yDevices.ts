import { devices, type PlaywrightTestProject } from '@playwright/test';

/** Perfis usados no sandbox de acessibilidade (emulação Playwright). */
export type A11yDeviceId = 'mobile-chrome' | 'mobile-ios' | 'tablet';

export interface A11yDeviceProfile {
  id: A11yDeviceId;
  /** Nome legível para relatórios e docs. */
  label: string;
  category: 'mobile' | 'tablet';
  /** Chave em `@playwright/test` → `devices`. */
  playwrightDeviceKey: keyof typeof devices;
  viewport: { width: number; height: number };
  /** Preset Playwright usa WebKit (Safari/iPad). Localmente emulamos com Chrome. */
  nativeBrowser: 'chromium' | 'webkit';
}

export const A11Y_DEVICE_PROFILES: Record<A11yDeviceId, A11yDeviceProfile> = {
  'mobile-chrome': {
    id: 'mobile-chrome',
    label: 'Celular Android — Pixel 5 (Chrome)',
    category: 'mobile',
    playwrightDeviceKey: 'Pixel 5',
    viewport: { width: 393, height: 851 },
    nativeBrowser: 'chromium',
  },
  'mobile-ios': {
    id: 'mobile-ios',
    label: 'Celular iOS — iPhone 13 (viewport Safari)',
    category: 'mobile',
    playwrightDeviceKey: 'iPhone 13',
    viewport: { width: 390, height: 844 },
    nativeBrowser: 'webkit',
  },
  tablet: {
    id: 'tablet',
    label: 'Tablet — iPad 7ª geração',
    category: 'tablet',
    playwrightDeviceKey: 'iPad (gen 7)',
    viewport: { width: 810, height: 1080 },
    nativeBrowser: 'webkit',
  },
};

const A11Y_USE = {
  headless: false as const,
  video: 'off' as const,
  trace: 'off' as const,
};

/** Emula dispositivo WebKit com Chrome instalado (Windows/dev sem `playwright install webkit`). */
function useChromeEmulation(profile: A11yDeviceProfile): boolean {
  return !process.env.CI && profile.nativeBrowser === 'webkit';
}

function createA11yProject(profile: A11yDeviceProfile): PlaywrightTestProject {
  const device = devices[profile.playwrightDeviceKey];
  const chromeEmulation = useChromeEmulation(profile);

  return {
    name: profile.id,
    testMatch: /\/a11y\//,
    use: {
      ...device,
      ...A11Y_USE,
      ...(chromeEmulation ? { browserName: 'chromium', channel: 'chrome' } : {}),
      ...(!chromeEmulation && !process.env.CI && profile.nativeBrowser === 'chromium' ? { channel: 'chrome' } : {}),
    },
  };
}

/** Projetos Playwright do sandbox a11y (mobile ×2 + tablet). */
export function createA11yProjects(deviceIds?: A11yDeviceId[]): PlaywrightTestProject[] {
  const ids = deviceIds ?? (Object.keys(A11Y_DEVICE_PROFILES) as A11yDeviceId[]);
  return ids.map((id) => createA11yProject(A11Y_DEVICE_PROFILES[id]));
}

export function listA11yDevices(): A11yDeviceProfile[] {
  return Object.values(A11Y_DEVICE_PROFILES);
}
