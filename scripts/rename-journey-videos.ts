#!/usr/bin/env ts-node
/**
 * Renomeia os vídeos gerados pelo Playwright após execução dos journeys.
 *
 * Playwright salva vídeos em:
 *   test-results/{test-sanitized-name}-{browser}/video.webm
 *
 * Este script copia os vídeos para:
 *   docs/reports/videos/{fluxo}_{YYYYMMDD-HHmmss}.webm
 *
 * Uso:
 *   npx ts-node --transpile-only scripts/rename-journey-videos.ts
 */
import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(__dirname, '..');
const TEST_RESULTS = join(ROOT, 'test-results');
const OUTPUT_DIR = join(ROOT, 'docs', 'reports', 'videos');

/** Mapeia parte do nome do diretório de resultado ao nome legível do fluxo */
const FLOW_MAP: Record<string, string> = {
  personalizado: 'F2_Plano-Personalizado',
  'plano-regular': 'F1_Plano-Regular',
  'regular-ate-emissao': 'F1_Plano-Regular-Emissao',
  'sem-pagar': 'F1_Plano-Regular-Checkout',
  'plano-essencial': 'F3_Plano-Essencial',
  'checkout-com-plano-e': 'F3_Plano-Essencial-Checkout',
  essencial: 'F3_Plano-Essencial',
  'auto-1504': 'F4_Plano-Auto1504',
  'checkout-com-plano-a': 'F4_Plano-Auto1504-Checkout',
  'guincho-200': 'F3_Essencial-Accordion-Guincho200',
  'guincho-400': 'F4_Auto1504-Accordion-Guincho400',
  reparos: 'F4_Auto1504-Accordion-Reparos',
  'upsells-residencial-e-vida': 'Checkout-Upsells-Residencial-Vida',
  upsells: 'Checkout-Upsells',
  'vistoria-online': 'Vistoria-Online',
  'vistoria-video': 'Vistoria-Video',
};

function resolveFlowName(dirName: string): string {
  const lower = dirName.toLowerCase();
  for (const [key, name] of Object.entries(FLOW_MAP)) {
    if (lower.includes(key.toLowerCase())) return name;
  }
  // Fallback: usa primeiros 40 chars do dirname sanitizado
  return dirName.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 40);
}

function formatDatetime(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` + `-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  );
}

function main(): void {
  if (!existsSync(TEST_RESULTS)) {
    console.log('Nenhum test-results encontrado. Rode os testes primeiro.');
    return;
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const datetime = formatDatetime();
  let copied = 0;

  for (const dir of readdirSync(TEST_RESULTS)) {
    const videoPath = join(TEST_RESULTS, dir, 'video.webm');
    if (!existsSync(videoPath)) continue;

    const flowName = resolveFlowName(dir);
    const dest = join(OUTPUT_DIR, `${flowName}_${datetime}.webm`);

    // Não sobrescreve se já existir (múltiplos testes no mesmo segundo)
    const finalDest = existsSync(dest) ? join(OUTPUT_DIR, `${flowName}_${datetime}_${++copied}.webm`) : dest;

    copyFileSync(videoPath, finalDest);
    console.log(`✅ ${dir.slice(0, 50)}...\n   → ${finalDest.replace(ROOT, '.')}`);
    copied++;
  }

  if (copied === 0) {
    console.log('Nenhum vídeo encontrado em test-results/. Verifique se PW_VIDEO=on foi usado.');
  } else {
    console.log(`\n📹 ${copied} vídeo(s) copiado(s) para docs/reports/videos/`);
  }
}

main();
