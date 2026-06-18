import AxeBuilder from '@axe-core/playwright';
import { expect, Page } from '@playwright/test';

/** Tags WCAG usadas no smoke a11y (2.0/2.1 AA + 2.2 quando suportado pelo axe). */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

export interface AxeScanOptions {
  /** Nome da etapa para mensagem de erro (ex.: lead_info). */
  stepName: string;
  /** Se true, falha também em violações `moderate` (padrão: só serious + critical). */
  failOnModerate?: boolean;
}

/**
 * Executa scan axe na página atual e falha se houver violações bloqueantes.
 * Uso: smoke mobile/tablet por etapa do funil — não substitui auditoria manual SR/teclado.
 */
export async function expectNoAccessibilityViolations(page: Page, options: AxeScanOptions): Promise<void> {
  const { stepName, failOnModerate = false } = options;

  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

  const blockingImpacts = failOnModerate ? ['critical', 'serious', 'moderate'] : ['critical', 'serious'];
  const blocking = results.violations.filter((v) => v.impact && blockingImpacts.includes(v.impact));

  if (blocking.length > 0) {
    const summary = blocking.map((v) => `• ${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} elemento(s)`).join('\n');
    expect(blocking, `axe — ${stepName}\n${page.url()}\n\n${summary}`).toEqual([]);
  }
}
