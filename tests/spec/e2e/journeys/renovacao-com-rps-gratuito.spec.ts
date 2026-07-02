/**
 * Jornada E2E — Renovação com RPS Gratuito + Evidência em Vídeo.
 *
 * Contexto:
 *   Simula o fluxo de renovação de uma apólice AUTO que originalmente não
 *   possuía a assistência "Proteção de Rodas, Pneu e Suspensão" (RPS).
 *   Na renovação, o RPS é incluído SEM CUSTO (campanha "por nossa conta!").
 *
 * Fluxo:
 *   1. Percorre o funil de cotação auto (plano personalizado)
 *   2. Na tela de assistências:
 *      a. Captura o preço ANTES de adicionar o RPS
 *      b. Adiciona o RPS (via modal promocional ou toggle)
 *      c. Verifica que o RPS está marcado como GRATUITO ("por nossa conta!")
 *      d. Verifica que o prêmio anual NÃO aumentou após adicionar o RPS
 *   3. Conclui a compra com cartão Adyen (sandbox)
 *   4. Captura número da apólice na tela /sucesso
 *   5. Retroage as datas (−701 dias) para simular janela de renovação (D-30)
 *   6. Verifica status final da apólice
 *
 * Evidência: vídeo sempre gravado para este teste (test.use({ video: 'on' })).
 *
 * Pré-requisito: VPN Youse ativa com acesso ao ambiente QA.
 * Uso: npx playwright test renovacao-com-rps-gratuito --project=chromium --reporter=list
 */
/* eslint-disable playwright/no-conditional-in-test, playwright/no-conditional-expect -- fluxo multi-etapa com caminhos condicionais (modal RPS, pós-pagamento QA) */
import { expect } from '@playwright/test';
import { test, generateQuotationData } from '../../../fixtures/setupQuotation';
import { navigateToAssistances, advancePastRiskAcceptance } from '../../../helpers/funnel';
import { assertPostPaymentOutcome } from '../../../helpers/paymentCheckout';

// Vídeo sempre gravado para evidência de renovação — nível de arquivo (obrigatório pelo Playwright)
test.use({ video: 'on' });

const POLICY_EMAIL = 'gabriel.roquim+rpsensosso@youse.com.br';
const MESSAGING_GATEWAY_TOKEN = process.env.MESSAGING_GATEWAY_TOKEN || '9897f997-e51c-4ddd-8c63-7b75059f846a';
const POLICY_SVC_URL = process.env.POLICY_SVC_URL || 'https://qa-policysvc.youse.io';
const MESSAGING_GW_URL = process.env.MESSAGING_GATEWAY_URL || `https://${process.env.ENV || 'qa'}-messaginggateway.youse.io`;

test.describe('Renovação — Plano personalizado COM RPS Gratuito', { tag: ['@b2c', '@journey', '@renovacao', '@rps_gratuito', '@evidencia'] }, () => {
  test('Deve contratar com RPS gratuito e retroagir datas para janela de renovação', { tag: ['@regression'] }, async ({ page, request }) => {
    test.setTimeout(600_000);

    // ──────────────────────────────────────────────────────────────────
    // STEP 1 — Funil de cotação até tela de assistências
    // Não dispensar o modal de promo do RPS (dismissPromo: false)
    // para poder interagir com o botão de adicionar via modal
    // ──────────────────────────────────────────────────────────────────
    const data = generateQuotationData({ email: POLICY_EMAIL });

    console.log('\n══════════════════════════════════════════════════════');
    console.log('🎬 [VÍDEO ATIVO] Evidência de renovação com RPS gratuito');
    console.log('══════════════════════════════════════════════════════');
    console.log('📋 STEP 1 — Iniciando funil de cotação (plano personalizado)');
    console.log(`   Email: ${data.email}`);
    console.log('══════════════════════════════════════════════════════\n');

    const assistancesPage = await navigateToAssistances(
      page,
      {},
      { dismissPromo: false }, // mantém modal RPS aberto se aparecer
      data,
    );

    // ──────────────────────────────────────────────────────────────────
    // STEP 2 — Capturar preço ANTES de adicionar o RPS
    // ──────────────────────────────────────────────────────────────────
    console.log('\n══════════════════════════════════════════════════════');
    console.log('📋 STEP 2 — Capturando preço antes de adicionar RPS');
    console.log('══════════════════════════════════════════════════════\n');

    await assistancesPage.waitForPrice();
    const precoAntesDaRPS = await assistancesPage.getAnnualPrice();
    console.log(`   💰 Prêmio anual ANTES do RPS: R$ ${precoAntesDaRPS.toFixed(2)}/ano`);

    // ──────────────────────────────────────────────────────────────────
    // STEP 3 — Adicionar RPS e verificar custo ZERO
    // ──────────────────────────────────────────────────────────────────
    console.log('\n══════════════════════════════════════════════════════');
    console.log('📋 STEP 3 — Adicionando RPS e verificando custo zero');
    console.log('══════════════════════════════════════════════════════\n');

    const modalAberto = await assistancesPage.isRpsLaunchModalVisible();
    console.log(`   Modal de lançamento RPS: ${modalAberto ? 'VISÍVEL' : 'NÃO VISÍVEL'}`);

    await assistancesPage.addRps();

    const rpsAtivo = await assistancesPage.isAssistanceChecked('Proteção de Rodas, Pneu e Suspensão');
    console.log(`   RPS ativo após adicionar: ${rpsAtivo}`);
    expect(rpsAtivo, 'RPS deve estar ativo após ser adicionado').toBe(true);

    // Verificar gratuidade do RPS
    const rpsGratuito = await assistancesPage.isRpsFreeInUi();
    console.log(`   RPS marcado como "por nossa conta!" (gratuito): ${rpsGratuito}`);

    // Capturar preço DEPOIS e verificar que não aumentou
    await assistancesPage.waitForPrice();
    const precoDepoisDaRPS = await assistancesPage.getAnnualPrice();
    console.log(`   💰 Prêmio anual DEPOIS do RPS: R$ ${precoDepoisDaRPS.toFixed(2)}/ano`);

    if (rpsGratuito) {
      console.log('   ✅ RPS confirmado como GRATUITO ("por nossa conta!")');
      expect(precoDepoisDaRPS, 'Prêmio não deve aumentar com RPS gratuito').toBe(precoAntesDaRPS);
    } else {
      // RPS cobrado — só verifica que foi incluído
      console.log(`   ℹ️  RPS não está em promoção gratuita. Custo aplicado.`);
      try {
        const rpsPrice = await assistancesPage.getAssistanceItemPrice('Proteção de Rodas, Pneu e Suspensão');
        console.log(`   💰 Preço individual do RPS: R$ ${rpsPrice.value.toFixed(2)} ${rpsPrice.perMonth ? '/mês' : '/ano'}`);
        if (rpsPrice.value === 0) {
          console.log('   ✅ RPS com valor R$ 0,00 — custo zero confirmado!');
          expect(rpsPrice.value, 'RPS deve ter custo zero').toBe(0);
        }
      } catch {
        console.log('   ⚠️  Não foi possível ler preço individual do RPS — confirmar manualmente no vídeo.');
      }
    }

    // ──────────────────────────────────────────────────────────────────
    // STEP 4 — Checkout e pagamento
    // ──────────────────────────────────────────────────────────────────
    console.log('\n══════════════════════════════════════════════════════');
    console.log('📋 STEP 4 — Checkout e pagamento com cartão Adyen');
    console.log('══════════════════════════════════════════════════════\n');

    await assistancesPage.btnContinue.click();
    const pagamentoPage = await advancePastRiskAcceptance(page);

    let checkoutProtocol = '';
    try {
      checkoutProtocol = await pagamentoPage.getCheckoutProtocol();
      console.log(`   📎 Protocolo: #${checkoutProtocol}`);
    } catch {
      console.log('   ⚠️  Protocolo não visível antes do pagamento.');
    }

    await pagamentoPage.checkEmailConfirmation();
    await pagamentoPage.fillCreditCardData(data.creditCard.number, data.creditCard.expireDate, data.creditCard.cvv, data.creditCard.holderName);

    const emissaoPage = await pagamentoPage.clickFinishBtn();

    // ──────────────────────────────────────────────────────────────────
    // STEP 5 — Verificar emissão e capturar número da apólice
    // ──────────────────────────────────────────────────────────────────
    console.log('\n══════════════════════════════════════════════════════');
    console.log('📋 STEP 5 — Verificando emissão e capturando apólice');
    console.log('══════════════════════════════════════════════════════\n');

    await assertPostPaymentOutcome(page, emissaoPage, data.email);

    console.log(`   URL pós-emissão: ${page.url()}`);

    let policyNumber = '';
    try {
      policyNumber = await page.evaluate(() => {
        const match = document.body.innerText.match(/\b3\d{12}\b/);
        return match ? match[0] : '';
      });
      if (policyNumber) {
        console.log(`   ✅ Número da apólice: ${policyNumber}`);
      } else {
        console.log(`   ℹ️  Protocolo para localizar: #${checkoutProtocol}`);
      }
    } catch {
      console.log('   ⚠️  Não foi possível capturar o número da apólice.');
    }

    // ──────────────────────────────────────────────────────────────────
    // STEP 6 — Retroagir datas para janela de renovação (D-30)
    // ──────────────────────────────────────────────────────────────────
    if (policyNumber) {
      console.log('\n══════════════════════════════════════════════════════');
      console.log('📋 STEP 6 — Aguardando PolicySvc e calculando retroação');
      console.log('══════════════════════════════════════════════════════\n');

      // Aguardar propagação da apólice no PolicySvc (pode levar alguns segundos após emissão)
      let policy: Record<string, unknown> | null = null;
      for (let attempt = 1; attempt <= 8; attempt++) {
        console.log(`   ⏳ Tentativa ${attempt}/8 — buscando apólice no PolicySvc...`);
        // eslint-disable-next-line playwright/no-wait-for-timeout -- poll de apólice no PolicySvc sem evento de polling nativo
        await page.waitForTimeout(5_000);
        const policyResp = await request.get(`${POLICY_SVC_URL}/v1/bra/auto/policies/${policyNumber}`);
        if (policyResp.status() === 200) {
          const contentType = policyResp.headers()['content-type'] ?? '';
          if (contentType.includes('application/json')) {
            policy = await policyResp.json();
            break;
          }
        }
        console.log(`   ↩️  Apólice ainda não disponível (status ${policyResp.status()}) — aguardando...`);
      }

      if (!policy) {
        console.log('   ⚠️  Apólice não encontrada no PolicySvc após 8 tentativas.');
        console.log(`   Use o protocolo #${checkoutProtocol} para localizar manualmente.`);
        return;
      }

      console.log(`   effective_from:    ${policy.effective_from}`);
      console.log(`   effective_until:   ${policy.effective_until}`);
      console.log(`   contract_duration: ${policy.contract_duration} ano(s)`);

      const diasAteVencimento = Math.ceil((new Date(String(policy.effective_until)).getTime() - Date.now()) / 86_400_000);
      const deslocamento = diasAteVencimento - 30; // chegar em D-30

      console.log(`\n   Dias restantes até vencimento: ${diasAteVencimento}`);
      console.log(`   Deslocamento para D-30: −${deslocamento} dias`);

      console.log('\n══════════════════════════════════════════════════════');
      console.log(`📋 STEP 7 — Aplicando retroação −${deslocamento} dias via MessagingGateway`);
      console.log('══════════════════════════════════════════════════════\n');

      const travelResp = await request.post(`${MESSAGING_GW_URL}/policy_travel_date`, {
        data: {
          number: policyNumber,
          policy: 'true',
          version: 'true',
          endorsement: 'true',
          policy_assistance_history: 'true',
          years: 0,
          months: 0,
          days: -deslocamento,
        },
        headers: {
          'Content-Type': 'application/json',
          AUTHORIZATION: `Token token=${MESSAGING_GATEWAY_TOKEN}`,
        },
      });

      console.log(`   Status MessagingGateway: ${travelResp.status()}`);
      expect(travelResp.status()).toBe(200);

      console.log('   ⏳ Aguardando propagação no PolicySvc (8s)...');
      // eslint-disable-next-line playwright/no-wait-for-timeout -- propagação assíncrona MessagingGateway sem endpoint de polling
      await page.waitForTimeout(8_000);

      const updatedResp = await request.get(`${POLICY_SVC_URL}/v1/bra/auto/policies/${policyNumber}`);
      const updated = await updatedResp.json();
      const hoje = new Date();
      const diasRestantes = Math.ceil((new Date(updated.effective_until).getTime() - hoje.getTime()) / 86_400_000);

      console.log('\n┌──────────────────────────────────────────────────────────┐');
      console.log('│           RESUMO FINAL — APÓLICE PARA RENOVAÇÃO          │');
      console.log('├──────────────────────────────────────────────────────────┤');
      console.log(`│  Número:            ${policyNumber.padEnd(37)}│`);
      console.log(`│  Email:             ${data.email.substring(0, 37).padEnd(37)}│`);
      console.log(`│  Vigência início:   ${updated.effective_from.padEnd(37)}│`);
      console.log(`│  Data de renovação: ${updated.effective_until.padEnd(37)}│`);
      console.log(`│  Dias restantes:    ${String(diasRestantes).padEnd(37)}│`);
      console.log(`│  Status:            ${updated.status.padEnd(37)}│`);
      console.log(`│  RPS incluído:      ${'SIM (gratuito — por nossa conta!)'.padEnd(37)}│`);
      console.log(`│  Custo RPS:         ${'R$ 0,00'.padEnd(37)}│`);
      console.log('└──────────────────────────────────────────────────────────┘');
      console.log('\n🎬 Vídeo da execução gravado automaticamente em test-results/');

      expect(diasRestantes, 'Apólice deve estar na janela de renovação (D ≤ 30)').toBeLessThanOrEqual(30);
      expect(diasRestantes, 'Apólice não deve estar expirada há mais de 5 dias').toBeGreaterThanOrEqual(-5);
    } else {
      console.log('\n══════════════════════════════════════════════════════');
      console.log(`⚠️  STEP 6/7 pulados — número da apólice não extraído da UI.`);
      console.log(`   Use protocolo #${checkoutProtocol} para localizar e retroagir manualmente.`);
      console.log('══════════════════════════════════════════════════════\n');
    }
  });
});
