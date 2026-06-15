/**
 * Tela de personalização de coberturas — Seguro Auto.
 *
 * Exibida quando o usuário opta por "Personalizar" a partir da seleção de planos.
 * Permite ativar/desativar coberturas individualmente e configurar franquia e
 * valores de indenização. O painel lateral atualiza o prêmio em tempo real.
 *
 * URL: /seguro-auto/{id}/coverages_selection
 */
import { Locator, Page } from '@playwright/test';
import proxymise from 'proxymise';
import { AssistancesSelectionPage } from './AssistancesSelectionPage';
import { QuotationPageLayout } from './QuotationPageLayout';

export type CoverageName =
  | 'Vale para perda total'
  | 'Vale pra qualquer batida'
  | 'Roubo e furto'
  | 'Danos corporais a terceiros'
  | 'Danos materiais a terceiros'
  | 'Acidentes de passageiros'
  | 'Acidentes de passageiros com despesas médicas e hospitalares'
  | 'Danos Morais';

export class CoveragesSelectionPage extends QuotationPageLayout<AssistancesSelectionPage> {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page, AssistancesSelectionPage);
    this.heading = page.getByRole('heading', {
      name: 'Olha só as coberturas disponíveis para você escolher',
    });
  }

  /**
   * Retorna o toggle switch de uma cobertura pelo nome.
   * O <p> com o nome e o switch são irmãos dentro do container de cabeçalho.
   */
  coverageSwitch(name: CoverageName): Locator {
    return this.page.locator(`xpath=//p[normalize-space(text())="${name}"]/following-sibling::*[@role="switch"]`).first();
  }

  /**
   * Aguarda o preço anual ser calculado (sai do estado inicial R$ 0,00/ano).
   * O cálculo é assíncrono após a abertura da tela.
   */
  async waitForPrice(timeout = 20_000): Promise<void> {
    await this.page
      .locator('p')
      .filter({ hasText: /R\$\s*[1-9][\d.,]+\/ano/ })
      .first()
      .waitFor({ state: 'visible', timeout });
  }

  /**
   * Lê o valor anual total do painel lateral.
   * Ex.: "R$ 1.119,31/ano" → 1119.31
   */
  async getAnnualPrice(): Promise<number> {
    const el = this.page
      .locator('p')
      .filter({ hasText: /R\$.*\/ano/ })
      .first();
    const text = (await el.textContent()) ?? '';
    const match = text.match(/R\$\s*([\d.]+),([\d]{2})\/ano/);
    if (!match) throw new Error(`Preço anual não encontrado. Texto: "${text}"`);
    return parseFloat(match[1].replace(/\./g, '') + '.' + match[2]);
  }

  /**
   * Aguarda o preço anual mudar após uma ação (toggle ou ajuste de slider).
   * Garante que a API de recálculo respondeu antes de ler o novo valor.
   */
  async waitForPriceUpdate(from: number, timeout = 15_000): Promise<void> {
    await this.page.waitForFunction(
      (previousPrice) => {
        const paras = Array.from(document.querySelectorAll('p'));
        const annualPara = paras.find((p) => /R\$.*\/ano/.test(p.textContent ?? ''));
        if (!annualPara) return false;
        const match = annualPara.textContent?.match(/R\$\s*([\d.]+),([\d]{2})\/ano/);
        if (!match) return false;
        const current = parseFloat(match[1].replace(/\./g, '') + '.' + match[2]);
        return current > 0 && current !== previousPrice;
      },
      from,
      { timeout },
    );
  }

  /**
   * Botão de reduzir franquia de "Vale pra qualquer batida".
   * Franquia menor → prêmio maior (menor deductible = maior risco assumido).
   */
  franquiaDecreaseBtn(): Locator {
    return this.page
      .locator('div')
      .filter({ has: this.page.getByText('Valor da Franquia:', { exact: false }) })
      .locator('button')
      .first();
  }

  /**
   * Botão de aumentar o valor de indenização de uma cobertura configurável.
   * Indenização maior → prêmio maior.
   */
  indemnityIncreaseBtn(coverageName: CoverageName): Locator {
    return this.page
      .locator('div')
      .filter({ has: this.page.getByText(coverageName, { exact: true }) })
      .filter({ has: this.page.getByText('Valor da Indenização:', { exact: false }) })
      .locator('button')
      .last();
  }
}

export default proxymise(CoveragesSelectionPage);
