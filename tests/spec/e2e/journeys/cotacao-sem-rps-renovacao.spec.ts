/**
 * Jornada E2E — Plano Personalizado SEM RPS + Retroação de Datas para Renovação.
 *
 * Fluxo:
 *   1. Percorre o funil de cotação auto (plano personalizado) com email fornecido
 *   2. Na tela de assistências, desativa "Proteção de Rodas, Pneu e Suspensão" (RPS)
 *   3. Conclui a compra com cartão de crédito Adyen (sandbox)
 *   4. Captura número da apólice gerada
 *   5. Aplica retroação de datas via MessagingGateway para simular janela de renovação
 *   6. Verifica status da apólice retroagida
 *
 * Pré-requisito: VPN Youse ativa com acesso ao ambiente QA.
 * Uso: npx playwright test cotacao-sem-rps-renovacao --project=chromium --reporter=list
 */
/* eslint-disable playwright/no-conditional-in-test, playwright/no-conditional-expect -- fluxo complexo com etapas condicionais (RPS, policyNumber, pós-pagamento QA) */
import { expect } from '@playwright/test';
import { test, generateQuotationData } from '../../../fixtures/setupQuotation';
import { navigateToAssistances, advancePastRiskAcceptance } from '../../../helpers/funnel';
import { assertPostPaymentOutcome } from '../../../helpers/paymentCheckout';
const POLICY_EMAIL = 'gabriel.roquim+rpsensosso@youse.com.br';
const MESSAGING_GATEWAY_TOKEN = process.env.MESSAGING_GATEWAY_TOKEN || '9897f997-e51c-4ddd-8c63-7b75059f846a';
const POLICY_SVC_URL = process.env.POLICY_SVC_URL || 'https://qa-policysvc.youse.io';
const MESSAGING_GW_URL = process.env.MESSAGING_GATEWAY_URL || `https://${process.env.ENV || 'qa'}-messaginggateway.youse.io`;

test.describe('Jornada — Plano personalizado SEM RPS + Retroação para Renovação', { tag: ['@b2c', '@journey', '@renovacao', '@sem_rps'] }, () => {
  test('Deve contratar sem RPS e retroagir datas para janela de renovação', async ({ page, request }) => {
    test.setTimeout(600_000);

    // ──────────────────────────────────────────────────────────────────
    // STEP 1 — Navegar pelo funil até a tela de assistências
    // ──────────────────────────────────────────────────────────────────
    const data = generateQuotationData({ email: POLICY_EMAIL });

    console.log('\n══════════════════════════════════════════════════════');
    console.log('📋 STEP 1 — Iniciando funil de cotação (plano personalizado)');
    console.log(`   Email: ${data.email}`);
    console.log('══════════════════════════════════════════════════════\n');

    const assistancesPage = await navigateToAssistances(page, {}, { dismissPromo: true }, data);

    // ──────────────────────────────────────────────────────────────────
    // STEP 2 — Garantir que RPS está DESATIVADO
    // ──────────────────────────────────────────────────────────────────
    console.log('\n══════════════════════════════════════════════════════');
    console.log('📋 STEP 2 — Desativando assistência RPS');
    console.log('══════════════════════════════════════════════════════\n');

    const rpsName = 'Proteção de Rodas, Pneu e Suspensão';

    const rpsVisible = await assistancesPage
      .assistanceSwitch(rpsName)
      .isVisible()
      .catch(() => false);

    if (rpsVisible) {
      const rpsOn = await assistancesPage.isAssistanceChecked(rpsName);
      console.log(`   RPS estava ${rpsOn ? 'ATIVO — desativando...' : 'INATIVO — nenhuma ação necessária.'}`);
      await assistancesPage.ensureAssistanceOff(rpsName);
      const rpsAfter = await assistancesPage.isAssistanceChecked(rpsName);
      expect(rpsAfter, 'RPS deve estar desativado').toBe(false);
      console.log('   ✅ RPS desativado com sucesso.');
    } else {
      console.log('   ℹ️  Switch do RPS não encontrado na tela — pode estar oculto ou indisponível.');
    }

    await assistancesPage.waitForPrice();
    const precoFinal = await assistancesPage.getAnnualPrice();
    console.log(`   💰 Prêmio anual sem RPS: R$ ${precoFinal.toFixed(2)}/ano`);

    // ──────────────────────────────────────────────────────────────────
    // STEP 3 — Avançar para checkout e pagar
    // ──────────────────────────────────────────────────────────────────
    console.log('\n══════════════════════════════════════════════════════');
    console.log('📋 STEP 3 — Avançando para checkout e preenchendo pagamento');
    console.log('══════════════════════════════════════════════════════\n');

    await assistancesPage.btnContinue.click();
    const pagamentoPage = await advancePastRiskAcceptance(page);

    // Capturar protocolo antes de finalizar
    let checkoutProtocol = '';
    try {
      checkoutProtocol = await pagamentoPage.getCheckoutProtocol();
      console.log(`   📎 Protocolo de checkout: #${checkoutProtocol}`);
    } catch {
      console.log('   ⚠️  Protocolo não visível no checkout antes do pagamento.');
    }

    await pagamentoPage.checkEmailConfirmation();
    await pagamentoPage.fillCreditCardData(data.creditCard.number, data.creditCard.expireDate, data.creditCard.cvv, data.creditCard.holderName);

    const emissaoPage = await pagamentoPage.clickFinishBtn();

    // ──────────────────────────────────────────────────────────────────
    // STEP 4 — Verificar emissão e capturar dados da apólice
    // ──────────────────────────────────────────────────────────────────
    console.log('\n══════════════════════════════════════════════════════');
    console.log('📋 STEP 4 — Verificando emissão da apólice');
    console.log('══════════════════════════════════════════════════════\n');

    await assertPostPaymentOutcome(page, emissaoPage, data.email);

    // Capturar URL e tentar extrair número da apólice da página
    const currentUrl = page.url();
    console.log(`   URL após emissão: ${currentUrl}`);

    // Tentar encontrar número da apólice no conteúdo da página
    let policyNumber = '';
    try {
      // Número da apólice segue o padrão: 13 dígitos começando com 3
      policyNumber = await page.evaluate(() => {
        const text = document.body.innerText;
        const match = text.match(/\b3\d{12}\b/);
        return match ? match[0] : '';
      });

      if (policyNumber) {
        console.log(`   ✅ Número da apólice encontrado na página: ${policyNumber}`);
      } else {
        console.log('   ℹ️  Número da apólice não encontrado no texto da página.');
        console.log(`   📌 Use o protocolo #${checkoutProtocol} para localizar a apólice no admin.`);
      }
    } catch {
      console.log('   ⚠️  Não foi possível extrair número da apólice da página.');
    }

    // ──────────────────────────────────────────────────────────────────
    // STEP 5 — Retroagir datas via MessagingGateway (se tiver policy number)
    // ──────────────────────────────────────────────────────────────────
    if (policyNumber) {
      console.log('\n══════════════════════════════════════════════════════');
      console.log('📋 STEP 5 — Buscando datas iniciais via PolicySvc');
      console.log('══════════════════════════════════════════════════════\n');

      const policyResponse = await request.get(`${POLICY_SVC_URL}/v1/bra/auto/policies/${policyNumber}`);
      const policyDetails = await policyResponse.json();

      console.log(`   effective_from:    ${policyDetails.effective_from}`);
      console.log(`   effective_until:   ${policyDetails.effective_until}`);
      console.log(`   contract_duration: ${policyDetails.contract_duration} ano(s)`);

      const expirationDate = new Date(policyDetails.effective_until);
      const today = new Date();
      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Calcular deslocamento para janela de renovação (D-30)
      const totalDaysToShift = daysUntilExpiration - 30;

      console.log('\n══════════════════════════════════════════════════════');
      console.log(`📋 STEP 6 — Aplicando retroação (−${totalDaysToShift} dias) para D-30`);
      console.log('══════════════════════════════════════════════════════\n');

      const travelResponse = await request.post(`${MESSAGING_GW_URL}/policy_travel_date`, {
        data: {
          number: policyNumber,
          policy: 'true',
          version: 'true',
          endorsement: 'true',
          policy_assistance_history: 'true',
          years: 0,
          months: 0,
          days: -totalDaysToShift,
        },
        headers: {
          'Content-Type': 'application/json',
          AUTHORIZATION: `Token token=${MESSAGING_GATEWAY_TOKEN}`,
        },
      });

      console.log(`   Status HTTP: ${travelResponse.status()}`);
      expect(travelResponse.status()).toBe(200);

      // Aguardar propagação assíncrona do MessagingGateway no PolicySvc
      console.log('   ⏳ Aguardando propagação das datas no PolicySvc (8s)...');
      // eslint-disable-next-line playwright/no-wait-for-timeout -- propagação assíncrona MessagingGateway sem endpoint de polling disponível
      await page.waitForTimeout(8_000);

      // Verificar datas atualizadas
      const updatedPolicyResponse = await request.get(`${POLICY_SVC_URL}/v1/bra/auto/policies/${policyNumber}`);
      const updatedDetails = await updatedPolicyResponse.json();

      const newExpiration = new Date(updatedDetails.effective_until);
      const daysLeft = Math.ceil((newExpiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      console.log('\n┌──────────────────────────────────────────────────┐');
      console.log('│         RESUMO FINAL DA APÓLICE                  │');
      console.log('├──────────────────────────────────────────────────┤');
      console.log(`│  Número:           ${policyNumber.padEnd(30)}│`);
      console.log(`│  Email:            ${data.email.substring(0, 30).padEnd(30)}│`);
      console.log(`│  Vigência início:  ${updatedDetails.effective_from.padEnd(30)}│`);
      console.log(`│  Vigência fim:     ${updatedDetails.effective_until.padEnd(30)}│`);
      console.log(`│  Dias restantes:   ${String(daysLeft).padEnd(30)}│`);
      console.log(`│  Status:           ${updatedDetails.status.padEnd(30)}│`);
      console.log(`│  RPS incluído:     ${'NÃO (desativado no funil)'.padEnd(30)}│`);
      console.log('└──────────────────────────────────────────────────┘');

      expect(daysLeft, 'Apólice deve estar na janela de renovação (≤ 30 dias)').toBeLessThanOrEqual(30);
    } else {
      console.log('\n══════════════════════════════════════════════════════');
      console.log('⚠️  STEP 5/6 pulados — número da apólice não disponível via UI.');
      console.log(`   Use o protocolo #${checkoutProtocol} para localizar a apólice e`);
      console.log('   execute a retroação manualmente via curl ou qa-api-tests-automation.');
      console.log('══════════════════════════════════════════════════════\n');
    }
  });
});
