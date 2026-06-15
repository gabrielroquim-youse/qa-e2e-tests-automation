/**
 * Layout base compartilhado pelas telas do funil de cotação auto.
 *
 * Centraliza o botão "Continuar" e a navegação genérica entre etapas.
 * Todas as pages do funil de cotação estendem esta classe, recebendo
 * como parâmetro o tipo da próxima página (padrão de navegação tipada).
 */
import { Locator, Page } from '@playwright/test';
import proxymise from 'proxymise';
import { BasePage } from '../BasePage';

export class QuotationPageLayout<T> extends BasePage {
  readonly btnContinue: Locator;
  readonly nextPage: new (page: Page) => T;

  constructor(page: Page, nextPage: new (page: Page) => T) {
    super(page);
    this.btnContinue = this.page.getByRole('button', { name: 'Continuar' });
    this.nextPage = nextPage;
  }

  async clickContinueBtn(): Promise<T> {
    await this.btnContinue.waitFor({ state: 'visible' });
    await this.btnContinue.click();
    return new this.nextPage(this.page);
  }
}
export default proxymise(QuotationPageLayout);
