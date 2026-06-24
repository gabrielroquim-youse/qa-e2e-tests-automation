import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export type PixSandboxProvider = 'stark' | 'adyen' | 'unknown';

export interface PixBrcodeCapture {
  capturedAt: string;
  checkoutUrl: string;
  protocol: string;
  brcode: string;
  provider: PixSandboxProvider;
}

export const PIX_BRCODE_CAPTURE_PATH = join(process.cwd(), 'docs/reports/pix-brcode-capture.json');

export function detectPixProvider(brcode: string): PixSandboxProvider {
  if (/starkinfra|starkbank/i.test(brcode)) return 'stark';
  if (/adyen/i.test(brcode)) return 'adyen';
  return 'unknown';
}

export function savePixBrcodeCapture(
  capture: Omit<PixBrcodeCapture, 'capturedAt' | 'provider'> & { provider?: PixSandboxProvider },
): PixBrcodeCapture {
  const payload: PixBrcodeCapture = {
    capturedAt: new Date().toISOString(),
    provider: capture.provider ?? detectPixProvider(capture.brcode),
    checkoutUrl: capture.checkoutUrl,
    protocol: capture.protocol,
    brcode: capture.brcode,
  };
  mkdirSync(dirname(PIX_BRCODE_CAPTURE_PATH), { recursive: true });
  writeFileSync(PIX_BRCODE_CAPTURE_PATH, JSON.stringify(payload, null, 2), 'utf-8');
  return payload;
}

export function loadPixBrcodeCapture(): PixBrcodeCapture | null {
  try {
    return JSON.parse(readFileSync(PIX_BRCODE_CAPTURE_PATH, 'utf-8')) as PixBrcodeCapture;
  } catch {
    return null;
  }
}
