import {quotation, expect} from '../fixtures/fixtureQuotation'



quotation('fluxo fixture', async ({issuance, page}) => {
    await expect(issuance.title).toHaveText('Pagamento confirmado')
})