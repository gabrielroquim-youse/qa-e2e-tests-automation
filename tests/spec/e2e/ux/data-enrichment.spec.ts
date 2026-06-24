/**
 * Usabilidade — etapa data_enrichment (enriquecimento de dados).
 * CAP-17: section aparece no funil após CPF; formulário pode auto-avançar no QA.
 */
import { advanceFromPersonData, navigateToPersonData } from '../../../helpers/funnel';
import { MaritalStatuses } from '../../../enum/MaritalStatuses';
import { expect, test } from '../../../fixtures/setupQuotation';

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
});
