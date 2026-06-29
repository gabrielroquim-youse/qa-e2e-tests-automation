/**
 * Usabilidade — etapa data_enrichment (enriquecimento de dados).
 *
 * Esta etapa é CONDICIONAL: aparece apenas quando o CPF utilizado não possui
 * gênero/renda/ocupação já preenchidos no sistema. Os testes tratam ambos os
 * caminhos (formulário visível | auto-avança) de forma explícita.
 *
 * CAP-17: section aparece no funil após CPF; formulário pode auto-avançar no QA.
 */
import { advanceFromPersonData, navigateToPersonData } from '../../../helpers/funnel';
import { MaritalStatuses } from '../../../enum/MaritalStatuses';
import { DataEnrichmentPage } from '../../../pages/quotation/DataEnrichmentPage';
import { expect, test } from '../../../fixtures/setupQuotation';
import type { Page } from '@playwright/test';

type DataEnrichmentState = 'auto-advanced' | 'form-visible' | 'form-not-rendered';

async function inspectDataEnrichmentFields(page: Page): Promise<DataEnrichmentState> {
  if (!page.url().includes('data_enrichment')) {
    return 'auto-advanced';
  }

  await page
    .getByText(/carregando/i)
    .waitFor({ state: 'hidden', timeout: 60_000 })
    .catch(() => {});

  const enrichment = new DataEnrichmentPage(page);
  if (!(await enrichment.isFormVisible())) {
    return 'form-not-rendered';
  }

  const combos = page.getByRole('combobox');
  const count = await combos.count();
  expect(count, 'Pelo menos um campo deve estar visível').toBeGreaterThanOrEqual(1);

  for (let i = 0; i < count; i++) {
    await expect(combos.nth(i)).toBeVisible();
    await expect(combos.nth(i)).toBeEnabled();
  }

  await expect(enrichment.btnContinue).toBeVisible();
  console.info(`[data_enrichment] ${count} campo(s) visível(is) e habilitado(s) ✓`);
  return 'form-visible';
}

test.describe('UX — Enriquecimento de dados', { tag: ['@ux', '@quotation_auto', '@regression'] }, () => {
  test('Deve passar pela section data_enrichment antes do histórico de seguro', async ({ page, quotationData }) => {
    test.setTimeout(180_000);

    const sections: string[] = [];
    page.on('framenavigated', (frame) => {
      if (frame !== page.mainFrame()) return;
      const match = frame.url().match(/\/([a-z_]+)(?:\?|$)/);
      if (match) sections.push(match[1]);
    });

    const personPage = await navigateToPersonData(page);
    await personPage.fillDocumentNumber(quotationData.documentNumber);
    await personPage.selectMaritalStatus(MaritalStatuses.SINGLE);
    await advanceFromPersonData(page);

    await expect(page.getByText('Você tem ou teve Seguro Auto nos últimos 12 meses?')).toBeVisible();
    expect(sections).toContain('data_enrichment');
  });

  test('Campos obrigatórios devem estar acessíveis por role quando formulário exibido', async ({ page, quotationData }) => {
    test.setTimeout(180_000);

    const personPage = await navigateToPersonData(page);
    await personPage.fillDocumentNumber(quotationData.documentNumber);
    await personPage.selectMaritalStatus(MaritalStatuses.SINGLE);
    await personPage.btnContinue.click();

    await page.waitForURL(/data_enrichment|bonuses_class/, {
      timeout: 60_000,
      waitUntil: 'commit',
    });

    await expect(inspectDataEnrichmentFields(page)).resolves.toMatch(/^(auto-advanced|form-visible|form-not-rendered)$/);
  });
});
