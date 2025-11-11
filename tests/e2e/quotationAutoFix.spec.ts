import { MaritalStatuses } from '../enum/MaritalStatuses'
import {quotation, expect} from '../fixtures/fixtureQuotation'



quotation('fluxo fixture', async ({issuance, page}) => {
    await expect(issuance.title).toHaveText('Pagamento confirmado')
})

quotation.use({maritalStatus: MaritalStatuses.WIDOWER})

quotation('Validated marital status, type Widower', async ({personData, maritalStatus, issuance, page}) => {
    await expect(personData.maritalStatus).toHaveValue(maritalStatus);    
    await expect(issuance.title).toHaveText('Pagamento confirmado');
})