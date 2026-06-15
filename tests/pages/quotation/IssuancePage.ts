/**
 * Etapa 8 do funil de cotação auto — Confirmação da contratação.
 *
 * Representa a tela /sucesso exibida após aprovação do pagamento.
 * Em QA, o redirect pode ir para www.youse.com.br em vez de /sucesso;
 * use isOnSuccessPage() para determinar qual caminho de validação seguir.
 * Para CPFs com restrição, o pagamento é recusado e exibe a tela de erro
 * "Oh no!"; use isOnErrorPage() para identificar esse caminho.
 */
import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class IssuancePage extends BasePage {
  readonly title: Locator;
  readonly tagCotacaoRealizada: Locator;
  readonly tagPagamentoValidado: Locator;
  readonly apoliceSectionAuto: Locator;
  /** Título da tela de erro exibida quando o pagamento é recusado (ex: CPF com restrição) */
  readonly errorTitle: Locator;

  constructor(page: Page) {
    super(page);
    // Locators para a tela /sucesso — confirmação completa da contratação
    this.title = this.page.getByText('Pagamento confirmado', { exact: false });
    this.tagCotacaoRealizada = this.page.getByText('Cotação realizada', { exact: false });
    this.tagPagamentoValidado = this.page.getByText('Pagamento validado', { exact: false });
    this.apoliceSectionAuto = this.page.getByText('Seguro Auto', { exact: true }).first();
    // Locator para a tela de erro "Oh no!" — exibida quando a contratação é recusada
    this.errorTitle = this.page.getByText('Alguma coisa deu errada', { exact: false });
  }

  /** Verifica se os dados do segurado estão exibidos na tela de sucesso */
  dadosSegurado(campo: string): Locator {
    return this.page.getByText(campo, { exact: false });
  }

  /** Localiza o e-mail do segurado como texto isolado (exact match evita duplicatas na página) */
  emailDoSegurado(email: string): Locator {
    return this.page.getByText(email, { exact: true });
  }

  /**
   * Retorna true se a navegação terminou na tela /sucesso.
   * QA pode redirecionar para www.youse.com.br em vez de /sucesso.
   */
  isOnSuccessPage(): boolean {
    return this.page.url().includes('/sucesso');
  }

  /**
   * Retorna true se a tela de erro "Oh no!" foi exibida após clicar em Finalizar.
   * Ocorre quando o pagamento é recusado (ex: CPF com restrição de risco).
   * Neste caso a URL permanece em /checkout.
   */
  isOnErrorPage(): boolean {
    return this.page.url().includes('/checkout');
  }
}
