/**
 * Tela de seleção de assistências — Seguro Auto.
 *
 * Exibida após a personalização de coberturas no fluxo de plano personalizado.
 * Permite adicionar assistências opcionais ao plano. O painel lateral atualiza
 * o prêmio em tempo real conforme as assistências são ativadas.
 *
 * URL: /seguro-auto/{id}/assistances_selection
 */
import { Locator, Page } from '@playwright/test';
import proxymise from 'proxymise';
import { CheckoutPage } from './CheckoutPage';
import { QuotationPageLayout } from './QuotationPageLayout';

export type AssistanceName =
  | 'Assistência a automóvel'
  | 'Proteção de Rodas, Pneu e Suspensão'
  | 'Reparos Abaixo da Franquia'
  | 'Chaveiro auto'
  | 'Carro reserva'
  | 'Vidros + Pequenos Reparos'
  | 'Vidros, retrovisores, faróis e lanternas + Pequenos Reparos'
  | 'Motorista Parceiro'
  | 'Lavagem e higienização'
  | 'Serviço de leva e traz'
  | 'Restituição de IPVA'
  | 'Serviço de histórico veicular'
  | 'Assistência a bike';

export class AssistancesSelectionPage extends QuotationPageLayout<CheckoutPage> {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page, CheckoutPage);
    this.heading = page.getByRole('heading', {
      name: 'Escolha as assistências para usar quando precisar',
    });
  }

  /**
   * Retorna o toggle switch de uma assistência pelo nome.
   * O <p> com o nome e o switch são irmãos dentro do container de cabeçalho.
   */
  assistanceSwitch(name: AssistanceName): Locator {
    return this.page.locator(`xpath=//p[normalize-space(text())="${name}"]/following-sibling::*[@role="switch"]`).first();
  }

  /**
   * Dispensa o modal promocional de lançamento se estiver visível.
   * O modal aparece automaticamente ao entrar na tela pela primeira vez (campanha 10 anos Youse).
   */
  async dismissPromoModal(): Promise<void> {
    const btn = this.page.getByRole('button', { name: 'AGORA NÃO' });
    const visible = await btn.isVisible({ timeout: 4_000 }).catch(() => false);
    if (visible) await btn.click();
  }

  /**
   * Aguarda o preço anual ser calculado (sai do estado inicial R$ 0,00/ano).
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
   * Aguarda o preço anual mudar após ativar/desativar uma assistência.
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
   * Retorna o locator do label (texto) de uma assistência pelo nome.
   * Útil para verificar visibilidade sem depender da presença do switch
   * (assistências imutáveis não possuem switch visível).
   */
  assistanceName(name: AssistanceName): Locator {
    return this.page.locator(`xpath=//p[normalize-space(text())="${name}"]`).first();
  }

  /**
   * Lê o preço individual exibido para uma assistência específica.
   *
   * Sobe da label até o container que contém o switch e extrai o primeiro
   * "R$ X,XX" daquela linha. Detecta se o valor está em base mensal (`/mês`)
   * ou anual para que o spec possa normalizar antes de comparar.
   *
   * ⚠️ SPIKE: o seletor da linha precisa ser confirmado contra o DOM real do QA.
   * Se o texto capturado não bater com o item esperado, ajustar o xpath do `row`.
   *
   * @returns `{ value, perMonth, raw }` — valor numérico, flag mensal e texto bruto.
   * @throws {Error} se nenhum valor monetário for encontrado na linha do item.
   */
  async getAssistanceItemPrice(name: AssistanceName): Promise<{ value: number; perMonth: boolean; raw: string }> {
    const row = this.page.locator(`xpath=//p[normalize-space(text())="${name}"]/ancestor::*[.//*[@role="switch"]][1]`).first();
    const raw = ((await row.textContent()) ?? '').trim();
    const match = raw.match(/R\$\s*([\d.]+),(\d{2})/);
    if (!match) {
      throw new Error(`Preço individual de "${name}" não encontrado. Texto da linha: "${raw.slice(0, 200)}"`);
    }
    const value = parseFloat(match[1].replace(/\./g, '') + '.' + match[2]);
    const perMonth = /\/\s*m[êe]s/i.test(raw);
    return { value, perMonth, raw };
  }

  // ── Promo RPS (Proteção de Rodas, Pneu e Suspensão) ──────────────────────
  // No plano personalizado, ao chegar nas assistências, abre um modal de
  // lançamento do RPS. Durante a campanha (junho/2026) o item é "por nossa
  // conta!" (grátis); após a campanha passa a ser cobrado. Os seletores abaixo
  // são tentativas tolerantes — confirmar contra o DOM real do QA.

  /** Modal de lançamento do RPS (aparece no plano personalizado). */
  get rpsLaunchModal(): Locator {
    return this.page.getByText(/proteção de rodas, pneu e suspensão/i).first();
  }

  /** Selo "Assistência por nossa conta!" exibido durante a promo. */
  get rpsFreePledge(): Locator {
    return this.page.getByText(/por nossa conta/i).first();
  }

  /** Botão do modal que adiciona o RPS ao plano. */
  get addRpsButton(): Locator {
    return this.page.getByRole('button', { name: /adicionar|incluir|quero|adicione/i }).first();
  }

  /**
   * Indica se o modal de lançamento do RPS está visível.
   * Usa um timeout curto para não travar quando o modal não aparece.
   */
  async isRpsLaunchModalVisible(timeout = 6_000): Promise<boolean> {
    return this.rpsLaunchModal.isVisible({ timeout }).catch(() => false);
  }

  /**
   * Adiciona o RPS pelo modal de lançamento e aguarda o modal fechar.
   * Não assume mudança de preço — quem valida o delta é o spec.
   */
  async addRpsViaModal(): Promise<void> {
    await this.addRpsButton.click();
    await this.rpsLaunchModal.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => undefined);
  }

  /**
   * Dispensa o modal "Combo de assistências" se estiver visível.
   * O modal aparece automaticamente ao ativar "Assistência a automóvel"
   * (bra/auto/assistance/4), informando que 7 assistências complementares
   * são incluídas na faixa.
   */
  async dismissComboModalIfVisible(): Promise<void> {
    const comboTitle = this.page.getByText(/combo de assist/i);
    const visible = await comboTitle.isVisible({ timeout: 4_000 }).catch(() => false);
    if (!visible) return;

    const btn = this.page.getByRole('button', { name: /agora não|confirmar|ok|fechar/i });
    const btnVisible = await btn.isVisible({ timeout: 2_000 }).catch(() => false);
    if (btnVisible) await btn.click();
  }
}

export default proxymise(AssistancesSelectionPage);
