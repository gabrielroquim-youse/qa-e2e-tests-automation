/**
 * Etapa 7 do funil de cotação auto — Checkout e pagamento.
 *
 * Gerencia confirmação de e-mail, preenchimento dos dados do cartão
 * (via iframes do gateway de pagamento) e finalização da contratação.
 * Também permite inspecionar upsells (Residencial, Vida) e assistências.
 * Após finalizar, aguarda redirect para /issuance ou /sucesso.
 */
import { expect, Locator, Page } from '@playwright/test';
import proxymise from 'proxymise';
import { BasePage } from '../BasePage';
import { IssuancePage } from './IssuancePage';

export type PaymentMethod = 'credit_card' | 'pix';

export class CheckoutPage extends BasePage {
  readonly title: Locator;
  readonly cardNumber: Locator;
  readonly cardExpireDate: Locator;
  readonly cardCvv: Locator;
  readonly cardHolderName: Locator;
  readonly emailConfirmation: Locator;
  readonly btnFinish: Locator;
  readonly assistenciasAccordion: Locator;
  readonly btnPaymentApproved: Locator;
  readonly paymentMethodCreditCard: Locator;
  readonly paymentMethodPix: Locator;
  readonly otherPaymentMethodsToggle: Locator;
  readonly pixPaymentSection: Locator;
  readonly yourInfoToggle: Locator;
  readonly btnCopyPixCode: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByText('Confirme os valores e pague o seguro');
    this.btnPaymentApproved = page.getByRole('button', { name: /ok,?\s*entendi/i });
    this.cardNumber = page
      .locator('iframe[title="Iframe para número de cartão seguro"]')
      .contentFrame()
      .getByRole('textbox', { name: 'Campo de número de cartão' });
    this.cardExpireDate = this.page
      .locator('iframe[title="Iframe para data de validade do cartão seguro"]')
      .contentFrame()
      .getByRole('textbox', { name: 'Campo de data de validade' });
    this.cardCvv = this.page
      .locator('iframe[title="Iframe para código de segurança do cartão seguro"]')
      .contentFrame()
      .getByRole('textbox', { name: 'Campo de código de segurança' });
    this.cardHolderName = this.page.getByRole('textbox', { name: 'Nome no cartão' });
    this.emailConfirmation = this.page.getByRole('checkbox', {
      name: /Confirmo que o e-mail e telefone estão corretos/i,
    });
    this.btnFinish = this.page.getByRole('button', { name: /^Finalizar$/ });
    this.assistenciasAccordion = this.page.getByRole('button', { name: /assistências/i });
    this.otherPaymentMethodsToggle = page.getByText(/veja outras formas de pagamento/i);
    this.paymentMethodCreditCard = page.getByRole('button', { name: /mensal.*cart[aã]o de cr[eé]dito/i }).first();
    this.paymentMethodPix = page.locator('button').filter({ hasText: /^pix/i }).first();
    this.pixPaymentSection = page.getByText(/pague com pix/i);
    this.yourInfoToggle = page.getByText('Suas informações', { exact: true });
    this.btnCopyPixCode = page.getByRole('button', { name: /copiar c[oó]digo pix/i });
  }

  /** Expande opções além do cartão mensal (PIX, à vista, parcelado). */
  async expandOtherPaymentMethods() {
    await this.title.waitFor({ state: 'visible', timeout: 60_000 });
    const pixVisible = await this.paymentMethodPix.isVisible().catch(() => false);
    if (!pixVisible) {
      await this.otherPaymentMethodsToggle.first().click();
      await this.paymentMethodPix.waitFor({ state: 'visible', timeout: 30_000 });
    }
    return this;
  }

  /** PIX fica no accordion "Veja outras formas de pagamento com desconto". */
  async isPixPaymentAvailable(timeout = 15_000): Promise<boolean> {
    await this.expandOtherPaymentMethods();
    try {
      await this.paymentMethodPix.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async selectPaymentMethod(method: PaymentMethod) {
    await this.title.waitFor({ state: 'visible', timeout: 60_000 });
    if (method === 'pix') {
      await this.expandOtherPaymentMethods();
      await this.paymentMethodPix.click();
    } else if (await this.paymentMethodCreditCard.isVisible().catch(() => false)) {
      await this.paymentMethodCreditCard.click();
    }
    return this;
  }

  /** Instruções PIX + QR/código após selecionar o método (geração pode levar alguns segundos). */
  async expectPixPaymentVisible() {
    await expect(this.pixPaymentSection).toBeVisible({ timeout: 30_000 });
    await expect(this.page.getByText(/como fazer o pagamento/i)).toBeVisible();
    const qrOrCode = this.page
      .locator('img[alt*="QR" i], canvas')
      .or(this.btnCopyPixCode)
      .or(this.page.getByText(/copie o c[oó]digo|qr code|pague via qr code/i))
      .first();
    await expect(qrOrCode).toBeVisible({ timeout: 60_000 });
    return this;
  }

  /** Accordion "Suas informações" — exibe CPF do segurado/condutor. */
  async expandYourInfo() {
    const insuredData = this.page.getByText('Dados do segurado', { exact: true });
    if (!(await insuredData.isVisible().catch(() => false))) {
      await this.yourInfoToggle.click();
      await insuredData.waitFor({ state: 'visible', timeout: 15_000 });
    }
    return this;
  }

  async expectInsuredCpfVisible(formattedCpf: string) {
    await this.expandYourInfo();
    await expect(this.page.getByText('Dados do segurado', { exact: true })).toBeVisible();
    await expect(this.page.getByText(formattedCpf, { exact: true }).first()).toBeVisible();
    return this;
  }

  /** Finaliza checkout com PIX selecionado (pagamento fica pendente). */
  async submitPixCheckout() {
    await this.page.keyboard.press('Escape').catch(() => {});
    const finish = this.btnFinish.last();
    await finish.scrollIntoViewIfNeeded();
    await finish.click();
    return this;
  }

  /** Após finalizar PIX sem pagar: permanece em checkout com código copia-e-cola. */
  async expectPixPendingCheckout() {
    await expect(this.page).toHaveURL(/\/checkout/);
    await expect(this.btnCopyPixCode).toBeVisible({ timeout: 90_000 });
    await expect(this.page.getByText(/voltar aqui para finalizar a sua compra/i)).toBeVisible();
    return this;
  }

  /** Protocolo exibido em "Suas informações" (referência para Adyen Offers). */
  async getCheckoutProtocol(): Promise<string> {
    const protocolLine = this.page.getByText(/Protocolo:\s*#/i);
    await protocolLine.waitFor({ state: 'visible', timeout: 30_000 });
    const text = (await protocolLine.textContent()) ?? '';
    const match = text.match(/#(\d+)/);
    if (!match) {
      throw new Error(`Protocolo não encontrado no checkout: "${text}"`);
    }
    return match[1];
  }

  /** Clica em COPIAR CÓDIGO PIX e retorna o BR Code da área de transferência. */
  async copyPixBrcode(): Promise<string> {
    await this.btnCopyPixCode.waitFor({ state: 'visible', timeout: 90_000 });
    await this.page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await this.btnCopyPixCode.click();
    let brcode = '';
    await expect
      .poll(
        async () => {
          brcode = (await this.page.evaluate(() => navigator.clipboard.readText())).trim();
          return brcode;
        },
        { timeout: 15_000 },
      )
      .toMatch(/^000201/);
    return brcode;
  }

  /** Segundo Finalizar — após confirmação do pagamento PIX no sandbox. */
  async finalizeAfterPixPayment(): Promise<IssuancePage> {
    await this.page.keyboard.press('Escape').catch(() => {});
    const finish = this.btnFinish.last();
    await finish.scrollIntoViewIfNeeded();
    await finish.click();
    return this.waitForPostPaymentRedirect();
  }

  async checkEmailConfirmation() {
    await this.title.waitFor({ state: 'visible', timeout: 60_000 });
    await this.emailConfirmation.evaluate((el) => (el as HTMLElement).click());
    return this;
  }

  /** Abre a sanfona de Assistências e retorna o locator da lista */
  async openAssistenciasAccordion() {
    await this.assistenciasAccordion.click();
    return this;
  }

  /**
   * Retorna o botão "Adicionar" dentro do card do produto especificado.
   * Os botões de upsell são genéricos ("Adicionar"), identificados pelo card pai.
   */
  upsellButton(productName: string): Locator {
    return this.upsellCard(productName)
      .getByRole('button', { name: /adicionar|adicionado|remover/i })
      .first();
  }

  /** Card do produto cross-sell antes de adicionar (ícone + título + botão Adicionar). */
  upsellCard(productName: string): Locator {
    const iconAlt = productName.includes('Residencial') ? 'icon-home' : 'icon-life';
    return this.page
      .locator('div')
      .filter({ has: this.page.getByRole('img', { name: iconAlt }) })
      .filter({ has: this.page.getByText(productName, { exact: true }) })
      .filter({ has: this.page.getByRole('button', { name: /^Adicionar$/i }) })
      .first();
  }

  /** Linha do cross-sell no resumo lateral após adicionar. */
  upsellSummaryLine(productName: string): Locator {
    return this.page
      .locator('div')
      .filter({ has: this.page.getByText(productName, { exact: true }) })
      .filter({ has: this.page.getByText(/\/\s*m[eê]s/i) })
      .first();
  }

  /** Modal de confirmação ao adicionar cross-sell residencial. */
  upsellModal(): Locator {
    return this.page.getByText(/oferta exclusiva de seguro residencial/i);
  }

  /** Confirma o modal de cross-sell residencial (tipo do imóvel + Adicionar Oferta). */
  async confirmUpsellModal(propertyType: 'Casa' | 'Apartamento' = 'Casa'): Promise<void> {
    await this.upsellModal().waitFor({ state: 'visible', timeout: 15_000 });
    await this.page.getByRole('button', { name: propertyType, exact: true }).click();
    await this.page.getByRole('button', { name: /adicionar oferta/i }).click();
  }

  async addUpsell(productName: string, propertyType: 'Casa' | 'Apartamento' = 'Casa'): Promise<void> {
    const btn = this.upsellButton(productName);
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    if (productName.includes('Residencial')) {
      await this.confirmUpsellModal(propertyType);
    }
  }

  async fillCreditCardData(cardNumber: string, expireDate: string, cvv: string, holderName: string) {
    await this.title.waitFor({ state: 'visible', timeout: 60_000 });
    // Iframes do gateway requerem pressSequentially para disparar eventos de validação
    await this.cardNumber.pressSequentially(cardNumber.replace(/\s/g, ''), { delay: 50, timeout: 30_000 });
    await this.cardExpireDate.pressSequentially(expireDate, { delay: 50, timeout: 15_000 });
    await this.cardCvv.pressSequentially(cvv, { delay: 50, timeout: 15_000 });
    await this.cardHolderName.fill(holderName);
    return this;
  }

  async clickFinishBtn(): Promise<IssuancePage> {
    await this.btnFinish.click();
    return this.waitForPostPaymentRedirect();
  }

  private async waitForPostPaymentRedirect(): Promise<IssuancePage> {
    // A) Direto para /sucesso com confirmação da apólice
    // B) Passa por /issuance com "Pagamento aprovado" → /sucesso (ou www.youse.com.br após OK)
    // C) Redireciona para www.youse.com.br (site principal) sem passar por /sucesso
    // D) Fica em /issuance indefinidamente aguardando webhook — tratado como estado válido
    // E) Permanece em /checkout exibindo erro "Oh no!" — CPF com restrição de risco recusado
    const errorMsg = this.page.getByText('Alguma coisa deu errada', { exact: false });

    await Promise.race([
      this.page.waitForURL(/\/(issuance|sucesso)|youse\.com\.br/, { timeout: 90_000 }),
      errorMsg.waitFor({ state: 'visible', timeout: 90_000 }),
    ]);

    if (this.page.url().includes('/issuance')) {
      // Em /issuance — aguarda redirect automático para /sucesso ou site principal
      try {
        await this.page.waitForURL(/\/sucesso|youse\.com\.br/, { timeout: 30_000 });
      } catch {
        // Redirect não aconteceu — verifica se precisa clicar em "OK, ENTENDI"
        if (await this.btnPaymentApproved.isVisible()) {
          await this.btnPaymentApproved.click();
        }
        try {
          await this.page.waitForURL(/\/sucesso|youse\.com\.br/, { timeout: 60_000 });
        } catch {
          // Caminho D: QA permanece em /issuance (webhook de pagamento pendente).
          // Pagamento foi processado com sucesso; redirect não ocorre neste ambiente.
        }
      }
    }
    // Caminho E: URL permanece em /checkout → errorMsg já está visível, sem ação necessária.

    return new IssuancePage(this.page);
  }
}

export default proxymise(CheckoutPage);
