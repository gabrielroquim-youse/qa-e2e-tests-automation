import { APIRequestContext } from '@playwright/test';
import { TestConfig } from '../../config/test.config';
import { Product } from '../enum/Product';
import { log } from 'node:console';

interface TestUtilsReponse {
  flow: string;
  protocol_number: string;
  status: string;
  data: object;
  failure_reasons: string[];
}

export class TestUtilsService {
  static async getByProtocolNumber(request: APIRequestContext, protocolNumber: string) {
    return await (await request.get(`${TestConfig.urls.qa.testUtilsUrl}/v1/orders/${protocolNumber}`)).json();
  }

  static async createInsurancePolicy(request: APIRequestContext, product: Product): Promise<TestUtilsReponse> {
    const response = await request.post(`${TestConfig.urls.qa.testUtilsUrl}/v1/orders`, {
      data: {
        flow: 'create_insurance_policy',
        data: {
          product: product,
        },
      },
    });

    const protocolNumber = (await response.json()).protocol_number;

    let orderData: TestUtilsReponse;

    for (let attempt = 0; attempt < 7; attempt++) {
      orderData = await this.getByProtocolNumber(request, protocolNumber);
      log(`Attempt ${attempt + 1}: Order status is ${orderData.status}`);
      if (orderData.status === 'done') {
        return orderData!;
      } else if (orderData.status === 'failed') {
        throw new Error(`Order creation failed. Reason: ${orderData.failure_reasons}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    throw new Error('Policy creation timed out after multiple attempts.');
  }
}
