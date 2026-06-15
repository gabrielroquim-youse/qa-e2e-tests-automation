/**
 * Etapa 6 do funil de cotação auto — Seleção de plano.
 *
 * Exibe os planos disponíveis (Essencial, Regular, Auto 1504, Personalizado)
 * após o motor de precificação calcular os valores. A seleção de um plano
 * avança para o checkout com os dados do plano escolhido.
 */
import { Locator, Page } from '@playwright/test';
import proxymise from 'proxymise';
import { CheckoutPage } from './CheckoutPage';
import { CoveragesSelectionPage } from './CoveragesSelectionPage';
import { QuotationPageLayout } from './QuotationPageLayout';

export type PlanName = 'Essencial' | 'Regular' | 'Auto 1504' | 'Personalizado';

export class PlanSelectionPage extends QuotationPageLayout<CheckoutPage> {
  readonly title: Locator;
  readonly loadingMsg: Locator;

  constructor(page: Page) {
    super(page, CheckoutPage);
    this.title = this.page.getByText('Escolha um plano ou personalize do seu jeito');
    this.loadingMsg = this.page.getByText('estamos montando o seu seguro', { exact: false });
  }

  /** Retorna o card de um plano pelo nome.
   *
   * Converte o nome em regex com `.*` entre as palavras para tolerar textos
   * como "Plano auto personalizado 1504" ao buscar por "Auto 1504".
   */
  planCard(name: PlanName): Locator {
    const pattern = new RegExp(name.split(/\s+/).join('.*'), 'i');
    return this.page.locator('[class*="plan"], [class*="Plan"], [data-testid*="plan"]').filter({ hasText: pattern });
  }

  /** Verifica se a assistência está visível no card de um plano */
  planAssistance(planName: PlanName, assistanceName: string): Locator {
    return this.planCard(planName).getByText(assistanceName, { exact: false });
  }

  /** Clica em "Quero Esse" no card do plano especificado */
  async selectPlan(planName: PlanName): Promise<CheckoutPage> {
    const card = this.planCard(planName);
    await card.getByRole('button', { name: /quero esse/i }).click();
    return new CheckoutPage(this.page);
  }

  /** Seleciona o último plano pré-formatado disponível (comportamento legado) */
  async selectPreFormatedPlan(): Promise<CheckoutPage> {
    await this.page
      .getByRole('button', { name: /quero esse/i })
      .last()
      .click();
    return new CheckoutPage(this.page);
  }

  /**
   * Extrai o valor mensal numérico de um plano a partir do texto do card.
   *
   * Procura o primeiro padrão "R$ XXX,XX" no conteúdo do card e converte para float.
   * Ex.: "R$ 286,83" → 286.83 | "R$ 1.234,50" → 1234.50
   *
   * @throws {Error} Se nenhum valor monetário for encontrado no card do plano.
   */
  async getPlanMonthlyPriceValue(name: PlanName): Promise<number> {
    const card = this.planCard(name);
    await card.waitFor({ state: 'visible', timeout: 10_000 });
    const rawText = (await card.textContent()) ?? '';
    const match = rawText.match(/R\$\s*([\d.]+),(\d{2})/);
    if (!match) {
      throw new Error(`Preço mensal não encontrado no card do plano "${name}". Texto capturado: "${rawText.trim().slice(0, 200)}"`);
    }
    const intPart = match[1].replace(/\./g, '');
    return parseFloat(`${intPart}.${match[2]}`);
  }

  /**
   * Conta o número de linhas de cobertura visíveis no card do plano.
   *
   * Cada cobertura é renderizada como um bloco `generic` com ícone + texto
   * dentro da seção "Coberturas:" do card. A contagem exclui o item "+ N assistências".
   */
  async getPlanCoverageCount(name: PlanName): Promise<number> {
    const card = this.planCard(name);
    await card.waitFor({ state: 'visible', timeout: 10_000 });
    // Linhas de cobertura: blocos com img + parágrafo dentro do card,
    // excluindo o item de assistências (que começa com "+")
    const coverageItems = card.locator('p').filter({ hasNotText: /^\+\s*\d+\s*assist/ });
    // Filtra apenas os parágrafos que têm texto de cobertura (não preço, não título)
    const allTexts = await coverageItems.allTextContents();
    return allTexts.filter((t) => {
      const clean = t.trim();
      return (
        clean.length > 3 &&
        !clean.startsWith('R$') &&
        !clean.startsWith('Valor') &&
        !clean.startsWith('Plano') &&
        !clean.startsWith('Coberturas') &&
        !/^\d+/.test(clean) &&
        !/^,/.test(clean) &&
        !/^\//.test(clean)
      );
    }).length;
  }

  /**
   * Retorna o texto de resumo das assistências do card do plano.
   *
   * O QA exibe as assistências como um parágrafo de lista separado por vírgula
   * na parte inferior do card (ex: "Carro reserva Básico 1.0 com ar / 7 dias,
   * Proteção de Rodas, Pneu e Suspensão e Serviço de Guincho 200 km").
   */
  async getPlanAssistanceText(name: PlanName): Promise<string> {
    const card = this.planCard(name);
    await card.waitFor({ state: 'visible', timeout: 10_000 });
    // O parágrafo de assistências fica após o item "+ N assistências"
    const assistancesSummary = card.locator('p').filter({ hasText: /Guincho|Proteção de Rodas|Reparos/i });
    const count = await assistancesSummary.count();
    if (count === 0) return '';
    return (await assistancesSummary.last().textContent()) ?? '';
  }

  /**
   * Verifica se uma palavra-chave está visível no card do plano (cobertura ou assistência).
   * Útil para asserts rápidos sem necessidade de extrair texto completo.
   */
  async planCardContains(name: PlanName, keyword: string): Promise<boolean> {
    const card = this.planCard(name);
    await card.waitFor({ state: 'visible', timeout: 10_000 });
    const text = (await card.textContent()) ?? '';
    return text.toLowerCase().includes(keyword.toLowerCase());
  }

  /**
   * Abre o fluxo de personalização clicando no botão "Personalizar este plano".
   * Navega para a tela de seleção de coberturas e aguarda o heading carregar.
   */
  async openPersonalization(): Promise<CoveragesSelectionPage> {
    await this.page.getByTestId('plan-card-button-custom').click();
    const coveragesPage = new CoveragesSelectionPage(this.page);
    await coveragesPage.heading.waitFor({ state: 'visible', timeout: 30_000 });
    return coveragesPage;
  }
}

export default proxymise(PlanSelectionPage);
