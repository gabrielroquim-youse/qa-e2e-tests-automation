/**
 * Asserções reutilizáveis para validação de formulário no funil auto (CAP-02).
 *
 * Padrões observados em QA (jun/2026):
 * - Etapas 1, 3, 4, 5: botão Continuar desabilitado enquanto inválido.
 * - Etapa 2: Continuar habilitado, mas submit não avança (aria-invalid na placa).
 * - Mensagens inline aparecem após blur ou estado inválido explícito.
 */
import { expect, Locator, Page } from '@playwright/test';

/** Garante que o campo está marcado inválido pelo front. */
export async function expectFieldInvalid(field: Locator): Promise<void> {
  await expect(field).toHaveAttribute('aria-invalid', 'true');
}

/** Garante que Continuar está desabilitado (validação preventiva). */
export async function expectContinueDisabled(continueBtn: Locator): Promise<void> {
  await expect(continueBtn).toBeDisabled();
}

/** Garante que a etapa atual permanece visível e a próxima não aparece. */
export async function expectStayOnStep(page: Page, currentStepMarker: Locator, nextStepMarker: Locator): Promise<void> {
  await expect(currentStepMarker).toBeVisible();
  await expect(nextStepMarker).toBeHidden({ timeout: 5_000 });
}

/** Garante que a URL permanece no passo atual após ação que não deve navegar. */
export async function expectStayOnUrl(page: Page, urlPattern: RegExp): Promise<void> {
  await expect(page).toHaveURL(urlPattern);
}

/** Mensagem de erro visível (regex parcial, case-insensitive). */
export async function expectValidationMessage(page: Page, pattern: RegExp): Promise<void> {
  await expect(page.getByText(pattern).first()).toBeVisible();
}

/**
 * Etapa 2: clica Continuar com formulário inválido e confirma que não avançou.
 * O botão permanece habilitado, mas a navegação não ocorre.
 */
export async function expectContinueBlockedOnClick(
  page: Page,
  continueBtn: Locator,
  currentStepMarker: Locator,
  nextStepMarker: Locator,
): Promise<void> {
  await continueBtn.click({ noWaitAfter: true });
  await expectStayOnStep(page, currentStepMarker, nextStepMarker);
}
