/**
 * Etapa 5 do funil de cotação auto — Histórico de seguro e Classe de Bônus.
 *
 * Verifica se o usuário possui seguro ativo nos últimos 12 meses. Se sim,
 * permite informar a Classe de Bônus (1 a 10 ou "Não quero informar").
 * Se não, redireciona para o whatsapp sem avançar para seleção de planos.
 */
import { Locator, Page } from '@playwright/test';
import proxymise from 'proxymise';
import { PlanSelectionPage } from './PlanSelectionPage';
import { QuotationPageLayout } from './QuotationPageLayout';
import { UserBonusClass } from '../../enum/UserBonusClass';

export class BonusesClassPage extends QuotationPageLayout<PlanSelectionPage> {
  readonly title: Locator;
  readonly btnNo: Locator;
  readonly btnYes: Locator;
  readonly whatsappBtn: Locator;
  readonly userBonusesClass: Locator;
  readonly knowNotBonusClass: Locator;
  readonly modalDontKnowBonusClassTitle: Locator;

  constructor(page: Page) {
    super(page, PlanSelectionPage);
    this.title = this.page.getByText('Você tem ou teve Seguro Auto nos últimos 12 meses?');
    this.btnNo = this.page.getByRole('button', { name: 'Não', exact: true });
    this.btnYes = this.page.getByRole('button', { name: 'Sim', exact: true });
    this.whatsappBtn = this.page.getByRole('button', { name: 'Chame no whatsapp' });
    this.userBonusesClass = this.page.getByRole('textbox', { name: 'Selecione sua Classe de Bônus' });
    this.knowNotBonusClass = this.page.getByRole('button').filter({ hasText: /Não sei minha Classe de Bônus/ });
    this.modalDontKnowBonusClassTitle = this.page.getByRole('heading', { name: 'Não sabe sua Classe de Bônus?' });
  }

  async useBonusClass(useBonusClass: boolean = false, userBonusClass: UserBonusClass = UserBonusClass.ONE) {
    if (useBonusClass) {
      await this.btnYes.click();
      await this.userBonusesClass.click();
      await this.page.getByText(userBonusClass, { exact: true }).click();
    } else {
      await this.btnNo.click();
      await this.page.waitForURL(/\/bonuses_class/, { timeout: 15_000 });
      await this.whatsappBtn.isVisible();
    }
    return this;
  }

  async clickWhatsappBtn() {
    await this.whatsappBtn.click();
  }

  async infoKnowNotBonusClass() {
    await this.knowNotBonusClass.click();
    return this;
  }
}

export default proxymise(BonusesClassPage);
