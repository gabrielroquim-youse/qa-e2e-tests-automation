/**
 * Helpers de navegação do funil de cotação Auto.
 *
 * Centraliza as etapas repetidas do funil (lead → veículo → endereço → CPF →
 * bônus → plano → coberturas → assistências) que antes estavam duplicadas em
 * vários specs. Cada helper recebe uma `page` e um cenário opcional de risco e
 * retorna o Page Object da etapa-alvo, já com o preço calculado.
 *
 * Importante: NÃO fixa valores absolutos — apenas navega. As asserções de preço
 * ficam nos specs.
 */
import { expect, Page } from '@playwright/test';
import { MaritalStatuses } from '../enum/MaritalStatuses';
import { UserBonusClass } from '../enum/UserBonusClass';
import { VehicleUsages } from '../enum/VehicleUsages';
import { generateQuotationData } from '../fixtures/setupQuotation';
import { AssistancesSelectionPage } from '../pages/quotation/AssistancesSelectionPage';
import { CoveragesSelectionPage } from '../pages/quotation/CoveragesSelectionPage';
import LeadInfoPage from '../pages/quotation/LeadInfoPage';
import { PlanSelectionPage } from '../pages/quotation/PlanSelectionPage';

/** Timeout para o motor de precificação montar a tela de planos. */
export const PLAN_TIMEOUT = 45_000;

/** Variáveis de risco que alteram o prêmio calculado pelo motor. */
export interface QuotationScenario {
  useBonusClass?: boolean;
  bonusClass?: UserBonusClass;
  garage?: boolean;
  usage?: VehicleUsages;
  maritalStatus?: MaritalStatuses;
  brandNew?: boolean;
}

/** Override pontual dos dados gerados (ex.: CPF restrito em cenário negativo). */
export type QuotationDataOverride = Partial<ReturnType<typeof generateQuotationData>>;

/**
 * Reseta a sessão entre duas cotações no mesmo teste (storage + cookies).
 * Deve ser chamado enquanto a página ainda está no domínio do app.
 */
export async function resetSession(page: Page): Promise<void> {
  await page.evaluate(() => {
    try {
      localStorage.clear();
    } catch {
      /* no-op */
    }
    try {
      sessionStorage.clear();
    } catch {
      /* no-op */
    }
  });
  await page.context().clearCookies();
  await page.goto('about:blank');
}

/**
 * Percorre o funil completo até a tela de seleção de planos.
 *
 * Fluxo: LeadInfo → VehicleDetails → AddressUsage → PersonData →
 *        BonusClass → PlanSelection
 */
export async function navigateToPlans(
  page: Page,
  scenario: QuotationScenario = {},
  dataOverride: QuotationDataOverride = {},
): Promise<PlanSelectionPage> {
  const {
    useBonusClass = false,
    bonusClass = UserBonusClass.TEN,
    garage = true,
    usage = VehicleUsages.PRIVATE,
    maritalStatus = MaritalStatuses.SINGLE,
    brandNew = false,
  } = scenario;

  const data = { ...generateQuotationData(), ...dataOverride };

  const paginaLead = await LeadInfoPage.open(page);
  await paginaLead.fillLeadData({ name: data.name, email: data.email, phone: data.phone });
  const detalhesVeiculoPage = await paginaLead.clickContinueBtn();

  await detalhesVeiculoPage.fillLicensePlate(data.licensePlate);
  await detalhesVeiculoPage.selectBrandNew(brandNew);
  await detalhesVeiculoPage.selectBulletproof(false);
  const enderecoUsoPage = await detalhesVeiculoPage.clickContinueBtn();

  await enderecoUsoPage.fillAddress(data.zipCode, data.addressNumber);
  await enderecoUsoPage.isOvernightGarage(garage);
  await enderecoUsoPage.selectUsage(usage);
  const dadosPessoaisPage = await enderecoUsoPage.clickContinueBtn();

  await dadosPessoaisPage.fillDocumentNumber(data.documentNumber);
  await dadosPessoaisPage.selectMaritalStatus(maritalStatus);
  const classeBonusPage = await dadosPessoaisPage.clickContinueBtn();

  await classeBonusPage.useBonusClass(useBonusClass, bonusClass);
  const selecaoPlanoPage = await classeBonusPage.clickContinueBtn();

  await expect(selecaoPlanoPage.title).toBeVisible({ timeout: PLAN_TIMEOUT });

  return selecaoPlanoPage;
}

/**
 * Navega até a tela de personalização de coberturas (abre "Personalizar").
 * Retorna a página de coberturas com o preço já calculado.
 */
export async function navigateToCoverages(page: Page, scenario: QuotationScenario = {}): Promise<CoveragesSelectionPage> {
  const selecaoPlanoPage = await navigateToPlans(page, scenario);
  const coveragesPage = await selecaoPlanoPage.openPersonalization();
  await coveragesPage.waitForPrice();
  return coveragesPage;
}

/** Opções de navegação para a tela de assistências. */
export interface AssistancesNavOptions {
  /**
   * Se `true` (padrão), dispensa o modal promocional de lançamento ao entrar
   * na tela. Passe `false` quando o teste precisar interagir com o modal
   * (ex.: promo do RPS no plano personalizado).
   */
  dismissPromo?: boolean;
}

/**
 * Navega até a tela de seleção de assistências, dispensando o modal promocional
 * e aguardando o preço anual ser calculado.
 */
export async function navigateToAssistances(
  page: Page,
  scenario: QuotationScenario = {},
  options: AssistancesNavOptions = {},
): Promise<AssistancesSelectionPage> {
  const { dismissPromo = true } = options;
  const coveragesPage = await navigateToCoverages(page, scenario);

  const assistancesPage: AssistancesSelectionPage = await coveragesPage.clickContinueBtn();
  await assistancesPage.heading.waitFor({ state: 'visible', timeout: 30_000 });
  if (dismissPromo) await assistancesPage.dismissPromoModal();
  await assistancesPage.waitForPrice();

  return assistancesPage;
}
