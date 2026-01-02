import { APIRequestContext } from '@playwright/test';
import { TestConfig } from '../../config/test.config';
import { Product } from '../enum/Product';
import { log } from 'node:console';

interface TestUtilsResponse {
  flow: string;
  protocol_number: string;
  status: string;
  data: object;
  failure_reasons: string[];
}

interface TestUtilsPolicyResponse {
  data: {
    email: string;
    password: string;
    policy_number: string;
  };
}

export class TestUtilsService {
  static async getByProtocolNumber(request: APIRequestContext, protocolNumber: string) {
    return await (await request.get(`${TestConfig.urls.qa.testUtilsUrl}/v1/orders/${protocolNumber}`)).json();
  }

  static async createInsurancePolicy(
    request: APIRequestContext,
    product: Product = Product.AUTO,
    data?: { email?: string; license_plate?: string; documentNumber?: string; installmentsPerYear?: string; partnerId?: string },
  ): Promise<TestUtilsPolicyResponse> {
    const response = await request.post(`${TestConfig.urls.qa.testUtilsUrl}/v1/orders`, {
      data: {
        flow: 'create_insurance_policy',
        data: {
          product: product,
          user_email: data?.email || null,
          vehicle_license_plate: data?.license_plate || null,
          insured_person_document_number: data?.documentNumber || null,
          payment_conditions_installments_per_year: data?.installmentsPerYear || null,
          partner_id: data?.partnerId || null,
        },
      },
    });

    const protocolNumber = (await response.json()).protocol_number;

    let orderData: TestUtilsResponse;

    for (let attempt = 0; attempt < 8; attempt++) {
      orderData = await this.getByProtocolNumber(request, protocolNumber);
      log(`Attempt ${attempt + 1}: Order status is ${orderData.status}`);
      if (orderData.status === 'done') {
        return orderData.data as TestUtilsPolicyResponse;
      } else if (orderData.status === 'failed') {
        throw new Error(`Order creation failed. Reason: ${orderData.failure_reasons}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    throw new Error('Policy creation timed out after multiple attempts.');
  }
}
