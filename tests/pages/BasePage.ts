/**
 * Classe base para todos os Page Objects do projeto.
 *
 * Mantém a referência da `page` e helpers de navegação genéricos.
 * Interações com elementos devem usar Locators do Playwright diretamente
 * nas classes filhas (com web-first assertions), em vez de wrappers que
 * escondem o call log e o tratamento nativo de erros do Playwright.
 */
import { expect, Page } from '@playwright/test';
import proxymise from 'proxymise';

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path = '/') {
    await this.page.goto(path);
  }

  async assertUrlContains(part: string) {
    await expect(this.page).toHaveURL(new RegExp(part));
  }
}

export default proxymise(BasePage);
