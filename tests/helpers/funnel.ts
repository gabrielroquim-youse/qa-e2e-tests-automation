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
import { CheckoutPage } from '../pages/quotation/CheckoutPage';
import { CoveragesSelectionPage } from '../pages/quotation/CoveragesSelectionPage';
import LeadInfoPage from '../pages/quotation/LeadInfoPage';
import { PlanSelectionPage } from '../pages/quotation/PlanSelectionPage';
import { VehicleAdditionalDetailsPage } from '../pages/quotation/VehicleAdditionalDetailsPage';
import { VehicleDetailsPage } from '../pages/quotation/VehicleDetailsPage';
import { PersonDataPage } from '../pages/quotation/PersonDataPage';
import { BonusesClassPage } from '../pages/quotation/BonusesClassPage';
import { DataEnrichmentPage } from '../pages/quotation/DataEnrichmentPage';
import { RiskAcceptancePage } from '../pages/quotation/RiskAcceptancePage';

/** Timeout para o motor de precificação montar a tela de planos. */
export const PLAN_TIMEOUT = 45_000;

/**
 * Avança de person_data para bonuses_class, tratando data_enrichment quando aparecer.
 */
export async function advanceFromPersonData(page: Page): Promise<BonusesClassPage> {
  const personPage = new PersonDataPage(page);
  await personPage.btnContinue.click();

  await page.waitForURL(/data_enrichment|bonuses_class/, { timeout: 60_000, waitUntil: 'commit' });

  if (page.url().includes('data_enrichment')) {
    await page
      .getByText(/carregando/i)
      .waitFor({ state: 'hidden', timeout: 90_000 })
      .catch(() => {});
    const enrichment = new DataEnrichmentPage(page);
    if (await enrichment.isFormVisible()) {
      await enrichment.fillDefaultsAndContinue();
    } else {
      await page.waitForURL(/bonuses_class/, { timeout: 90_000, waitUntil: 'commit' });
    }
  }

  await page.waitForURL(/bonuses_class/, { timeout: 60_000, waitUntil: 'commit' });
  const bonusesPage = new BonusesClassPage(page);
  await bonusesPage.title.waitFor({ state: 'visible', timeout: 60_000 });
  return bonusesPage;
}

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
  const onApp = /youse/i.test(page.url());
  if (onApp) {
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
  }
  await page.context().clearCookies();
  await page.goto('about:blank');
  await new Promise((resolve) => setTimeout(resolve, 500));
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
  try {
    return await navigateToPlansOnce(page, scenario, dataOverride);
  } catch {
    await resetSession(page);
    return navigateToPlansOnce(page, scenario, dataOverride);
  }
}

async function navigateToPlansOnce(
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
  await detalhesVeiculoPage.licensePlate.waitFor({ state: 'visible', timeout: 60_000 });

  await detalhesVeiculoPage.fillLicensePlate(data.licensePlate);
  await detalhesVeiculoPage.selectBrandNew(brandNew);
  await detalhesVeiculoPage.selectBulletproof(false);
  const enderecoUsoPage = await detalhesVeiculoPage.clickContinueBtn();

  await enderecoUsoPage.fillAddress(data.zipCode, data.addressNumber);
  await enderecoUsoPage.isOvernightGarage(garage);
  await enderecoUsoPage.selectUsage(usage);
  const dadosPessoaisPage = await enderecoUsoPage.clickContinueBtn();
  await dadosPessoaisPage.documentNumber.waitFor({ state: 'visible', timeout: 30_000 });

  await dadosPessoaisPage.fillDocumentNumber(data.documentNumber);
  await dadosPessoaisPage.selectMaritalStatus(maritalStatus);
  const classeBonusPage = await advanceFromPersonData(page);

  await classeBonusPage.useBonusClass(useBonusClass, bonusClass);
  const selecaoPlanoPage = await classeBonusPage.clickContinueBtn();

  await expect(selecaoPlanoPage.title).toBeVisible({ timeout: PLAN_TIMEOUT });

  return selecaoPlanoPage;
}

/** Lead preenchido → tela de dados do veículo. */
export async function navigateToVehicleDetails(page: Page, dataOverride: QuotationDataOverride = {}): Promise<VehicleDetailsPage> {
  try {
    return await navigateToVehicleDetailsOnce(page, dataOverride);
  } catch {
    await resetSession(page);
    return navigateToVehicleDetailsOnce(page, dataOverride);
  }
}

async function navigateToVehicleDetailsOnce(page: Page, dataOverride: QuotationDataOverride = {}): Promise<VehicleDetailsPage> {
  const data = { ...generateQuotationData(), ...dataOverride };
  const paginaLead = await LeadInfoPage.open(page);
  await paginaLead.fillLeadData({ name: data.name, email: data.email, phone: data.phone });
  const vehiclePage = await paginaLead.clickContinueBtn();
  await vehiclePage.licensePlate.waitFor({ state: 'visible', timeout: 60_000 });
  return vehiclePage;
}

/** Até endereço e uso do veículo (etapa 3). */
export async function navigateToVehicleAdditional(page: Page, dataOverride: QuotationDataOverride = {}): Promise<VehicleAdditionalDetailsPage> {
  const data = { ...generateQuotationData(), ...dataOverride };
  const detalhesVeiculoPage = await navigateToVehicleDetails(page, dataOverride);
  await detalhesVeiculoPage.fillLicensePlate(data.licensePlate);
  await detalhesVeiculoPage.selectBrandNew(false);
  await detalhesVeiculoPage.selectBulletproof(false);
  return detalhesVeiculoPage.clickContinueBtn();
}

/** Até dados pessoais / CPF (etapa 4). */
export async function navigateToPersonData(page: Page, dataOverride: QuotationDataOverride = {}): Promise<PersonDataPage> {
  const data = { ...generateQuotationData(), ...dataOverride };
  const enderecoUsoPage = await navigateToVehicleAdditional(page, dataOverride);
  await enderecoUsoPage.fillAddress(data.zipCode, data.addressNumber);
  await enderecoUsoPage.isOvernightGarage(true);
  await enderecoUsoPage.selectUsage();
  const dadosPessoaisPage = await enderecoUsoPage.clickContinueBtn();
  await dadosPessoaisPage.documentNumber.waitFor({ state: 'visible', timeout: 60_000 });
  return dadosPessoaisPage;
}

/** Até histórico de seguro / classe bônus (etapa 5). */
export async function navigateToBonusesClass(
  page: Page,
  dataOverride: QuotationDataOverride = {},
  maritalStatus: MaritalStatuses = MaritalStatuses.SINGLE,
): Promise<BonusesClassPage> {
  const data = { ...generateQuotationData(), ...dataOverride };
  const dadosPessoaisPage = await navigateToPersonData(page, dataOverride);
  await dadosPessoaisPage.fillDocumentNumber(data.documentNumber);
  await dadosPessoaisPage.selectMaritalStatus(maritalStatus);
  return advanceFromPersonData(page);
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

/**
 * Avança de assistências para checkout, tratando risk_acceptance quando aparecer.
 */
export async function advancePastRiskAcceptance(page: Page): Promise<CheckoutPage> {
  await page.waitForURL(/risk_acceptance|checkout/, { timeout: 120_000, waitUntil: 'commit' });

  if (page.url().includes('risk_acceptance')) {
    await page
      .getByText(/carregando/i)
      .waitFor({ state: 'hidden', timeout: 90_000 })
      .catch(() => {});
    const riskPage = new RiskAcceptancePage(page);
    if (await riskPage.isFormVisible()) {
      await riskPage.acceptAndContinue();
    } else {
      await page.waitForURL(/checkout/, { timeout: 90_000, waitUntil: 'commit' });
    }
  }

  await page.waitForURL(/checkout/, { timeout: 60_000, waitUntil: 'commit' });
  const checkoutPage = new CheckoutPage(page);
  await checkoutPage.title.waitFor({ state: 'visible', timeout: 60_000 });
  return checkoutPage;
}

/**
 * Navega até o checkout (personalizado) sem preencher pagamento.
 * Útil para smoke de fluxo coberturas → assistências → checkout.
 */
export async function navigateToCheckout(page: Page, scenario: QuotationScenario = {}, options: AssistancesNavOptions = {}): Promise<CheckoutPage> {
  const assistancesPage = await navigateToAssistances(page, scenario, options);
  await assistancesPage.btnContinue.click();
  return advancePastRiskAcceptance(page);
}
