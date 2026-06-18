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

  private coverageSwitchRow(name: CoverageName): Locator {
    return this.page.locator(`xpath=//p[contains(normalize-space(.), "${name}")]/ancestor::*[.//*[@role="switch"]][1]`).first();
  }

  /** Bloco completo da cobertura (switch + franquia/indenização). */
  private coverageSection(name: CoverageName): Locator {
    return this.coverageSwitchRow(name).locator('xpath=parent::*');
  }

  /**
   * Retorna o toggle switch de uma cobertura pelo nome.
   */
  coverageSwitch(name: CoverageName): Locator {
    return this.coverageSwitchRow(name).getByRole('switch').first();
  }

  async clickCoverageToggle(name: CoverageName): Promise<void> {
    const sw = this.coverageSwitch(name);
    await sw.scrollIntoViewIfNeeded();
    try {
      await sw.click({ timeout: 5_000 });
    } catch {
      await sw.evaluate((el) => (el as HTMLElement).click());
    }
  }

  coverageName(name: CoverageName): Locator {
    return this.page.locator(`xpath=//p[contains(normalize-space(.), "${name}")]`).first();
  }

  async isCoverageChecked(name: CoverageName): Promise<boolean> {
    const sw = this.coverageSwitch(name);
    if ((await sw.count()) === 0) return true;
    return (await sw.getAttribute('aria-checked', { timeout: 10_000 })) === 'true';
  }

  async isCoverageSwitchDisabled(name: CoverageName): Promise<boolean> {
    return this.coverageSwitch(name).isDisabled();
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
   * Lê a franquia exibida no painel lateral (atualiza ao mover o slider).
   */
  async getSidebarFranquiaValue(): Promise<number> {
    const el = this.page
      .locator('p')
      .filter({ hasText: /^Franquia$/ })
      .locator('xpath=following-sibling::p[1]');
    const text = (await el.textContent()) ?? '';
    const match = text.match(/R\$\s*([\d.]+),([\d]{2})/);
    if (!match) throw new Error(`Franquia lateral não encontrada. Texto: "${text}"`);
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
    return this.coverageSection('Vale pra qualquer batida')
      .getByText('Valor da Franquia:', { exact: false })
      .locator('xpath=ancestor::*[1]/following-sibling::*[1]')
      .getByRole('button')
      .first();
  }

  /**
   * Botão de aumentar o valor de indenização de uma cobertura configurável.
   * Indenização maior → prêmio maior.
   */
  indemnityIncreaseBtn(coverageName: CoverageName): Locator {
    return this.coverageSection(coverageName)
      .getByText('Valor da Indenização:', { exact: false })
      .locator('xpath=ancestor::*[1]/following-sibling::*[1]')
      .getByRole('button')
      .last();
  }
}

export default proxymise(CoveragesSelectionPage);
