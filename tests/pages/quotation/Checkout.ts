import { expect, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class Checkout extends BasePage {

  readonly title = this.page.getByText('Confirme os valores e pague o seguro');
  readonly cardNumber = this.page.locator('iframe[title="Iframe para número de cartão seguro"]').contentFrame().getByRole('textbox', { name: 'Campo de número de cartão' })
  readonly cardExpireDate = this.page.locator('iframe[title="Iframe para data de validade do cartão seguro"]').contentFrame().getByRole('textbox', { name: 'Campo de data de validade' })
  readonly cardCvv = this.page.locator('iframe[title="Iframe para código de segurança do cartão seguro"]').contentFrame().getByRole('textbox', { name: 'Campo de código de segurança' })
  readonly cardHolderName = this.page.getByRole('textbox', { name: 'Nome no cartão' })
  readonly emailConfirmation = this.page.getByRole('textbox', { name: 'Repita o e-mail' })
  readonly btnFinish = this.page.getByRole('button', { name: /^Finalizar Compra$/ })

  constructor(page: Page) {
    super(page);
  }

  async execute() {
    expect(this.title.isVisible());
    await this.fill(this.cardNumber, '4111 1111 1111 1111')
    await this.fill(this.cardExpireDate, '03/30')
    await this.fill(this.cardCvv, '737')
    await this.fill(this.cardHolderName, 'John Youser')
    await this.fill(this.emailConfirmation, 'automation@youse.com.br')
    await this.btnFinish.click()
    expect(this.page.getByText('estamos processando o seu pagamento', { exact: false }).isVisible());
  }
}
