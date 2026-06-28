/**
 * Etapa opcional do funil — Enriquecimento de dados (gênero, renda, ocupação).
 * A section pode aparecer após `person_data` e auto-avançar quando já preenchida.
 */
import { Locator, Page } from '@playwright/test';
import proxymise from 'proxymise';
import { BonusesClassPage } from './BonusesClassPage';
import { QuotationPageLayout } from './QuotationPageLayout';

export class DataEnrichmentPage extends QuotationPageLayout<BonusesClassPage> {
  readonly gender: Locator;
  readonly salaryRange: Locator;
  readonly occupation: Locator;

  constructor(page: Page) {
    super(page, BonusesClassPage);
    this.gender = this.page.getByRole('combobox', { name: /g[eê]nero/i });
    this.salaryRange = this.page.getByRole('combobox', { name: /renda|sal[aá]rio|faixa/i });
    this.occupation = this.page.getByRole('combobox', { name: /ocupa[cç][aã]o|profiss[aã]o/i });
  }

  async isFormVisible(): Promise<boolean> {
    const combo = this.page.getByRole('combobox').first();
    return combo.isVisible({ timeout: 5_000 }).catch(() => false);
  }

  /** Preenche campos visíveis com a primeira opção válida e continua. */
  async fillDefaultsAndContinue(): Promise<BonusesClassPage> {
    await this.page
      .getByText(/carregando/i)
      .waitFor({ state: 'hidden', timeout: 60_000 })
      .catch(() => {});

    if (await this.gender.isVisible().catch(() => false)) {
      await this.gender.selectOption({ index: 1 });
    }
    if (await this.salaryRange.isVisible().catch(() => false)) {
      await this.salaryRange.selectOption({ index: 1 });
    }
    if (await this.occupation.isVisible().catch(() => false)) {
      await this.occupation.click();
      await this.page.getByRole('option').first().click();
    }

    const combos = this.page.getByRole('combobox');
    const count = await combos.count();
    for (let i = 0; i < count; i++) {
      const combo = combos.nth(i);
      if ((await combo.inputValue().catch(() => '')) === '') {
        await combo.selectOption({ index: 1 }).catch(async () => {
          await combo.click();
          await this.page.getByRole('option').first().click();
        });
      }
    }

    await this.btnContinue.click();
    await this.page.waitForURL(/bonuses_class/, { timeout: 60_000 });
    return new BonusesClassPage(this.page);
  }

  /** Completa o passo somente se o formulário estiver interativo. */
  async completeIfFormVisible(): Promise<void> {
    if (!(await this.isFormVisible())) return;
    await this.fillDefaultsAndContinue();
  }
}

export default proxymise(DataEnrichmentPage);
