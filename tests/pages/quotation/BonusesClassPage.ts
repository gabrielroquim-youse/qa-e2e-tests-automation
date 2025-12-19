import { Locator, Page } from '@playwright/test';
import proxymise from 'proxymise';
import { PlanSelectionPage } from './PlanSelectionPage';
import { QuotationPageLayout } from './QuotationPageLayout';

export class BonusesClassPage extends QuotationPageLayout<PlanSelectionPage> {
  readonly title: Locator;
  readonly btnNo: Locator;
  readonly btnYes: Locator;
  readonly whatsappBtn: Locator;

  constructor(page: Page) {
    super(page, PlanSelectionPage);
    this.title = this.page.getByText('Você tem ou teve Seguro Auto nos últimos 12 meses?');
    this.btnNo = this.page.getByRole('button', { name: 'Não', exact: true });
    this.btnYes = this.page.getByRole('button', { name: 'Sim', exact: true });
    this.whatsappBtn = this.page.getByRole('button', { name: 'Chame no whatsapp' });
  }

  async useBonusClass(useBonusClass: boolean = false) {
    if (useBonusClass) {
      await this.btnYes.click();
    } else {
      await this.btnNo.click();
      await this.whatsappBtn.isVisible();
    }
    return this;
  }

  async clickWhatsappBtn() {
    await this.whatsappBtn.click();
  }
}

export default proxymise(BonusesClassPage);
