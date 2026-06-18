/**
 * Etapa 4 do funil de cotação auto — Dados pessoais do segurado.
 *
 * Responsável pelo preenchimento do CPF e estado civil. O CPF informado
 * é validado por serviços de risco (Crivo, PEP, nlist); CPFs da blacklist
 * bloqueiam o avanço e exibem mensagem de restrição.
 */
import { Locator, Page } from '@playwright/test';
import proxymise from 'proxymise';
import { MaritalStatuses } from '../../enum/MaritalStatuses';
import { BonusesClassPage } from './BonusesClassPage';
import { QuotationPageLayout } from './QuotationPageLayout';

export class PersonDataPage extends QuotationPageLayout<BonusesClassPage> {
  readonly documentNumber: Locator;
  readonly maritalStatus: Locator;

  constructor(page: Page) {
    super(page, BonusesClassPage);
    this.documentNumber = this.page.getByRole('textbox', { name: 'CPF do segurado' });
    this.maritalStatus = this.page.getByRole('combobox');
  }

  async fillDocumentNumber(documentNumber = '12345676108') {
    await this.documentNumber.waitFor({ state: 'visible', timeout: 30_000 });
    await this.documentNumber.fill(documentNumber.replace(/\D/g, ''));
    return this;
  }

  /** Mensagem exibida quando o CPF possui restrições e bloqueia o fluxo */
  get restrictedCpfMessage() {
    return this.page.getByText(/cpf.*recusado|recusado|restrição|não.*autorizado/i).first();
  }

  async selectMaritalStatus(maritalStatus: MaritalStatuses) {
    await this.maritalStatus.selectOption(maritalStatus);
    return this;
  }
}

export default proxymise(PersonDataPage);
