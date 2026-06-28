#!/usr/bin/env ts-node
/**
 * Imprime instruções para confirmar PIX pendente no sandbox.
 *
 * Lê docs/reports/pix-brcode-capture.json (gerado por npm run tool:pix-capture)
 * ou a variável PIX_BRCODE.
 *
 * Uso:
 *   npm run tool:pix-confirm
 */
import { detectPixProvider, loadPixBrcodeCapture } from '../tests/helpers/pixSandbox';

function main(): void {
  const capture = loadPixBrcodeCapture();
  const brcode = process.env.PIX_BRCODE?.trim() ?? capture?.brcode;

  if (!brcode) {
    console.error('BR Code não encontrado.');
    console.error('Rode antes: npm run tool:pix-capture');
    console.error('Ou defina: PIX_BRCODE="000201..."');
    process.exit(1);
  }

  const provider = detectPixProvider(brcode);
  const protocol = capture?.protocol ?? process.env.PIX_PROTOCOL ?? '(não informado)';
  const checkoutUrl = capture?.checkoutUrl ?? '(não informado)';

  console.log('\n=== Confirmação PIX sandbox — QA Youse ===\n');
  console.log(`Protocolo cotação: #${protocol}`);
  console.log(`Checkout URL:      ${checkoutUrl}`);
  console.log(`Provider detectado: ${provider}`);
  console.log(`BR Code (início):  ${brcode.slice(0, 48)}...\n`);

  if (provider === 'stark') {
    console.log('── Stark Infra / Stark Bank (sandbox) ──');
    console.log('1. Credenciais do workspace sandbox (time de pagamentos).');
    console.log('2. Pagar o BR Code via API BrcodePayment.create (SDK Node/Python).');
    console.log('   Doc: https://github.com/starkbank/sdk-node#pay-a-br-code');
    console.log('3. Saldo sandbox: criar Invoice no ambiente test (paga automaticamente).');
    console.log('4. Aguarde webhook → volte ao checkout e rode npm run test:pix:emission\n');
  } else {
    console.log('── Adyen Customer Area (test) ──');
    console.log('1. Acesse https://ca-test.adyen.com');
    console.log('2. Transactions → Offers');
    console.log(`3. Localize o PIX pendente (protocolo #${protocol} ou merchant reference).`);
    console.log('4. Promote this offer to a sale');
    console.log('   Doc: https://docs.adyen.com/payment-methods/pix/web-component#test-and-go-live');
    console.log('5. Aguarde webhook AUTHORISATION → finalize no checkout\n');
  }

  console.log('── Após confirmar ──');
  console.log('Opção A (híbrida com pause): npm run test:pix:emission');
  console.log('Opção B (só instruções):      PIX_SANDBOX_MANUAL_PAUSE=0 PIX_SANDBOX_EMISSION=1 npm run test:pix:emission\n');
}

main();
