import { Page, Locator, expect, LocatorScreenshotOptions } from '@playwright/test';
import { TestConfig } from '../../config/test.config';

export interface ClickOptions {
  timeout?: number;
  force?: boolean;
  noWaitAfter?: boolean;
  trial?: boolean;
}

export interface FillOptions {
  timeout?: number;
  force?: boolean;
  noWaitAfter?: boolean;
}

export interface WaitOptions {
  timeout?: number;
  state?: 'attached' | 'detached' | 'visible' | 'hidden';
}

export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = '/') {
    await this.page.goto(path);
  }

  async assertUrlContains(part: string) {
    await expect(this.page).toHaveURL(new RegExp(part));
  }

  /**
   * Método auxiliar para obter Locator
   */
  private getLocator(target: Locator | string): Locator {
    return typeof target === 'string' ? this.page.locator(target) : target;
  }

  /**
   * Clica em um elemento (pode ser Locator ou string selector)
   */
  async click(target: Locator | string, options: ClickOptions = {}) {
    const el = this.getLocator(target);
    try {
      await el.click(options);
    } catch (error) {
      console.error(`Erro ao clicar no elemento: ${target}`);
      throw error;
    }
  }

  /**
   * Preenche campo de texto
   */
  async fill(target: Locator | string, value: string, options: FillOptions = {}) {
    const el = this.getLocator(target);
    try {
      await el.fill(value, options);
    } catch (error) {
      console.error(`Erro ao preencher elemento: ${target} com valor: ${value}`);
      throw error;
    }
  }

  /**
   * Preenche input com delay (simula digitação humana)
   */
  async typeSlow(target: Locator | string, value: string, delay = 100) {
    const el = this.getLocator(target);
    try {
      await el.type(value, { delay });
    } catch (error) {
      console.error(`Erro ao digitar lentamente no elemento: ${target}`);
      throw error;
    }
  }

  /**
   * Verifica se elemento está visível
   */
  async isVisible(target: Locator | string): Promise<boolean> {
    const el = this.getLocator(target);
    try {
      return await el.isVisible();
    } catch (error) {
      console.error(`Erro ao verificar visibilidade do elemento: ${target}`);
      return false;
    }
  }

  /**
   * Aguarda elemento estar visível
   */
  async waitForVisible(target: Locator | string, options: WaitOptions = {}) {
    const el = this.getLocator(target);
    const timeout = options.timeout || TestConfig.timeouts.default;

    try {
      await el.waitFor({ state: 'visible', timeout });
    } catch (error) {
      console.error(`Elemento não ficou visível no tempo esperado: ${target}`);
      throw error;
    }
  }

  /**
   * Aguarda elemento estar oculto
   */
  async waitForHidden(target: Locator | string, options: WaitOptions = {}) {
    const el = this.getLocator(target);
    const timeout = options.timeout || TestConfig.timeouts.default;

    try {
      await el.waitFor({ state: 'hidden', timeout });
    } catch (error) {
      console.error(`Elemento não ficou oculto no tempo esperado: ${target}`);
      throw error;
    }
  }

  /**
   * Valida que o texto do elemento é igual ao esperado
   */
  async expectTextEquals(target: Locator | string, expectedText: string) {
    const el = this.getLocator(target);
    try {
      await expect(el).toHaveText(expectedText);
    } catch (error) {
      console.error(`Texto esperado não encontrado: ${expectedText}`);
      throw error;
    }
  }

  /**
   * Aguarda texto estar visível
   */
  async waitForText(target: Locator | string, expected: string, timeout?: number) {
    const el = this.getLocator(target);
    const waitTimeout = timeout || TestConfig.timeouts.default;

    try {
      await expect(el).toContainText(expected, { timeout: waitTimeout });
    } catch (error) {
      console.error(`Texto não encontrado no tempo esperado: ${expected}`);
      throw error;
    }
  }

  /**
   * Valida se elemento contém texto
   */
  async expectContainsText(target: Locator | string, partialText: string) {
    const el = this.getLocator(target);
    try {
      await expect(el).toContainText(partialText);
    } catch (error) {
      console.error(`Texto parcial não encontrado: ${partialText}`);
      throw error;
    }
  }

  /**
   * Valida se elemento está presente e clicável
   */
  async expectClickable(target: Locator | string) {
    const el = this.getLocator(target);
    try {
      await expect(el).toBeVisible();
      await expect(el).toBeEnabled();
    } catch (error) {
      console.error(`Elemento não está clicável: ${target}`);
      throw error;
    }
  }

  /**
   * Clica com retry até sucesso (para elementos instáveis)
   */
  async clickComRetry(target: Locator | string, tentativas = 3, delay = 1000) {
    const el = this.getLocator(target);
    let lastError: Error;

    for (let i = 0; i < tentativas; i++) {
      try {
        await el.click({ timeout: 3000 });
        console.log(`Clique bem-sucedido na tentativa ${i + 1}`);
        return;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Tentativa ${i + 1} falhou, tentando novamente...`);

        if (i < tentativas - 1) {
          await this.page.waitForTimeout(delay);
        }
      }
    }

    console.error(`Todas as ${tentativas} tentativas falharam`);
    throw lastError!;
  }

  /**
   * Captura screenshot com nome customizado
   */
  async takeScreenshot(nome: string, options?: LocatorScreenshotOptions) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${nome}_${timestamp}.png`;
    const path = `screenshots/${filename}`;

    try {
      await this.page.screenshot({
        path,
        fullPage: true,
        ...options,
      });
      console.log(`Screenshot salvo: ${path}`);
    } catch (error) {
      console.error(`Erro ao capturar screenshot: ${error}`);
    }
  }

  /**
   * Faz scroll até o elemento
   */
  async scrollToElement(target: Locator | string) {
    const el = this.getLocator(target);
    try {
      await el.scrollIntoViewIfNeeded();
    } catch (error) {
      console.error(`Erro ao fazer scroll para o elemento: ${target}`);
      throw error;
    }
  }

  /**
   * Seleciona opção em dropdown/select
   */
  async selectOption(target: Locator | string, value: string | string[]) {
    const el = this.getLocator(target);
    try {
      await el.selectOption(value);
    } catch (error) {
      console.error(`Erro ao selecionar opção: ${value} no elemento: ${target}`);
      throw error;
    }
  }

  /**
   * Verifica se checkbox está marcado
   */
  async isChecked(target: Locator | string): Promise<boolean> {
    const el = this.getLocator(target);
    try {
      return await el.isChecked();
    } catch (error) {
      console.error(`Erro ao verificar checkbox: ${target}`);
      return false;
    }
  }

  /**
   * Marca/desmarca checkbox
   */
  async setChecked(target: Locator | string, checked: boolean) {
    const el = this.getLocator(target);
    try {
      await el.setChecked(checked);
    } catch (error) {
      console.error(`Erro ao marcar/desmarcar checkbox: ${target}`);
      throw error;
    }
  }

  /**
   * Aguarda carregamento da página
   */
  async waitForPageLoad() {
    try {
      await this.page.waitForLoadState('networkidle');
    } catch (error) {
      console.warn('Timeout aguardando carregamento da página');
    }
  }

  /**
   * Aguarda elemento desaparecer (útil para loaders)
   */
  async waitForElementToDisappear(target: Locator | string, timeout?: number) {
    const el = this.getLocator(target);
    const waitTimeout = timeout || TestConfig.timeouts.default;

    try {
      await el.waitFor({ state: 'hidden', timeout: waitTimeout });
    } catch (error) {
      console.error(`Elemento não desapareceu no tempo esperado: ${target}`);
      throw error;
    }
  }

  /**
   * Obtém texto do elemento
   */
  async getText(target: Locator | string): Promise<string> {
    const el = this.getLocator(target);
    try {
      return (await el.textContent()) || '';
    } catch (error) {
      console.error(`Erro ao obter texto do elemento: ${target}`);
      return '';
    }
  }

  /**
   * Obtém valor de input
   */
  async getValue(target: Locator | string): Promise<string> {
    const el = this.getLocator(target);
    try {
      return await el.inputValue();
    } catch (error) {
      console.error(`Erro ao obter valor do input: ${target}`);
      return '';
    }
  }

  async clickContinueBtn() {
    this.page.getByRole('button', { name: /continuar/ }).click();
  }
}
