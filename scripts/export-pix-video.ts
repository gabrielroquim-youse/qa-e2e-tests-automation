/**
 * Copia o vídeo Playwright mais recente do fluxo PIX para docs/reports/videos/.
 *
 * Uso: npm run tool:pix-video:export
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const TEST_RESULTS = join(process.cwd(), 'test-results');
const OUTPUT_DIR = join(process.cwd(), 'docs/reports/videos');

function findLatestVideo(dir: string): string | null {
  if (!existsSync(dir)) return null;

  let latest: { path: string; mtime: number } | null = null;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = findLatestVideo(full);
      if (nested) {
        const mtime = statSync(nested).mtimeMs;
        if (!latest || mtime > latest.mtime) {
          latest = { path: nested, mtime };
        }
      }
      continue;
    }
    if (entry.name === 'video.webm') {
      const mtime = statSync(full).mtimeMs;
      if (!latest || mtime > latest.mtime) {
        latest = { path: full, mtime };
      }
    }
  }

  return latest?.path ?? null;
}

function main(): void {
  const source = findLatestVideo(TEST_RESULTS);
  if (!source) {
    console.error('Nenhum video.webm em test-results/. Rode: npm run test:pix:record');
    process.exit(1);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const dest = join(OUTPUT_DIR, `pix-checkout-emission-${stamp}.webm`);
  const latestLink = join(OUTPUT_DIR, 'pix-checkout-emission-latest.webm');

  copyFileSync(source, dest);
  copyFileSync(source, latestLink);

  const meta = {
    exportedAt: new Date().toISOString(),
    source,
    dest,
    latestLink,
  };
  writeFileSync(join(OUTPUT_DIR, 'pix-checkout-emission-latest.json'), JSON.stringify(meta, null, 2), 'utf-8');

  console.log(`\n[pix-video] Exportado: ${dest}`);
  console.log(`[pix-video] Latest:    ${latestLink}\n`);
}

main();
