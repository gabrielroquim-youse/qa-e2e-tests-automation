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

/** Mapeia parte do nome do diretório de resultado ao nome legível do fluxo.
 * Ordem importa: chaves mais específicas primeiro para evitar match errado. */
const FLOW_MAP: Array<[string, string]> = [
  // F2 — Personalizado (match pelo nome do teste, não do spec)
  ['configura', 'F2_Plano-Personalizado'],
  ['personalizado', 'F2_Plano-Personalizado'],
  // F1 — Regular
  ['regular-ate-emissao', 'F1_Plano-Regular-Emissao'],
  ['emissao', 'F1_Plano-Regular-Emissao'],
  ['sem-pagar', 'F1_Plano-Regular-Checkout'],
  ['plano-regular', 'F1_Plano-Regular'],
  // F3 — Essencial
  ['guincho-200', 'F3_Essencial-Accordion-Guincho200'],
  ['200km', 'F3_Essencial-Accordion-Guincho200'],
  ['plano-essencial', 'F3_Plano-Essencial'],
  ['checkout-com-plano-e', 'F3_Plano-Essencial-Checkout'],
  ['essencial', 'F3_Plano-Essencial'],
  // F4 — Auto 1504
  ['reparos', 'F4_Auto1504-Accordion-Reparos'],
  ['guincho-400', 'F4_Auto1504-Accordion-Guincho400'],
  ['400km', 'F4_Auto1504-Accordion-Guincho400'],
  ['auto-1504', 'F4_Plano-Auto1504'],
  ['1504', 'F4_Plano-Auto1504'],
  // Cross-sell
  ['upsells-residencial-e-vida', 'Checkout-Upsells'],
  ['upsells', 'Checkout-Upsells'],
  // Vistoria
  ['vistoria-video', 'Vistoria-Video'],
  ['vistoria-online', 'Vistoria-Online'],
];

function resolveFlowName(dirName: string): string {
  const lower = dirName.toLowerCase();
  for (const [key, name] of FLOW_MAP) {
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
  /** Contador por nome de fluxo — evita sufixos como _8 ou _10 */
  const nameCount: Record<string, number> = {};
  let copied = 0;

  for (const dir of readdirSync(TEST_RESULTS)) {
    const videoPath = join(TEST_RESULTS, dir, 'video.webm');
    if (!existsSync(videoPath)) continue;

    const flowName = resolveFlowName(dir);
    nameCount[flowName] = (nameCount[flowName] ?? 0) + 1;

    const suffix = nameCount[flowName] > 1 ? `_${nameCount[flowName]}` : '';
    const dest = join(OUTPUT_DIR, `${flowName}_${datetime}${suffix}.webm`);

    copyFileSync(videoPath, dest);
    console.log(`✅ ${dir.slice(0, 50)}...\n   → ${dest.replace(ROOT, '.')}`);
    copied++;
  }

  if (copied === 0) {
    console.log('Nenhum vídeo encontrado em test-results/. Verifique se PW_VIDEO=on foi usado.');
  } else {
    console.log(`\n📹 ${copied} vídeo(s) copiado(s) para docs/reports/videos/`);
  }
}

main();
