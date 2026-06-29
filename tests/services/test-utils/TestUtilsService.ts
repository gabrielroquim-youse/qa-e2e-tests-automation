import { APIRequestContext } from '@playwright/test';
import TestConfig from '../../../config/test.config';
import { Product } from '../../enum/Product';
import {
  TestUtilsClaimData,
  TestUtilsCiData,
  TestUtilsCustomerData,
  TestUtilsPolicyData,
  TestUtilsProtocolData,
} from '../../schemas/test-utils/TestUtilsServiceSchemas';

export class TestUtilsService {
  static async getOrderByProtocolNumber(
    request: APIRequestContext,
    protocolNumber: string,
    maxAttempts: number = 10,
  ): Promise<TestUtilsProtocolData> {
    let orderData: TestUtilsProtocolData;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      orderData = await (await request.get(`${TestConfig.urls.testUtilsUrl}/${protocolNumber}`)).json();
      console.info(`Attempt ${attempt + 1}: ${orderData.flow} order status is ${orderData.status}`);
      if (orderData.status === 'done') {
        return orderData;
      }
      if (orderData.status === 'failed') {
        throw new Error(`Order creation failed. Reason: "${JSON.stringify(orderData.failure_reasons, null, 2)}"`);
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    throw new Error('Test data creation timed out after multiple attempts.');
  }

  static async createInsurancePolicy(
    request: APIRequestContext,
    product: Product = Product.AUTO,
    data?: { email?: string; license_plate?: string; documentNumber?: string; installmentsPerYear?: string; partnerId?: string },
  ): Promise<TestUtilsPolicyData> {
    const response = await request.post(TestConfig.urls.testUtilsUrl, {
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
    const policyData = await this.getOrderByProtocolNumber(request, protocolNumber);

    return policyData.data as TestUtilsPolicyData;
  }

  static async createCustomer(
    request: APIRequestContext,
    data?: { email?: string; password?: string; phone?: string },
  ): Promise<TestUtilsCustomerData> {
    const response = await request.post(TestConfig.urls.testUtilsUrl, {
      data: {
        flow: 'create_customer',
        data: {
          email: data?.email || null,
          password: data?.password || null,
          phone: data?.phone || null,
        },
      },
    });

    const protocolNumber = (await response.json()).protocol_number;
    const customerData = await this.getOrderByProtocolNumber(request, protocolNumber);

    return customerData.data as TestUtilsCustomerData;
  }

  static async createClaim(request: APIRequestContext, product: Product): Promise<TestUtilsClaimData> {
    const response = await request.post(TestConfig.urls.testUtilsUrl, {
      data: {
        flow: 'create_claim',
        data: {
          product: product,
        },
      },
    });

    const protocolNumber = (await response.json()).protocol_number;
    const claimData = await this.getOrderByProtocolNumber(request, protocolNumber, 20);

    return claimData.data as TestUtilsClaimData;
  }

  static async generateCiNumber(request: APIRequestContext, data?: { bonusClassNumber?: string; insurerCode?: string }): Promise<TestUtilsCiData> {
    const response = await request.post(TestConfig.urls.testUtilsUrl, {
      data: {
        flow: 'generate_ci_number',
        data: {
          bonus_class_number: data?.bonusClassNumber || null,
          insurance_code: data?.insurerCode || null,
        },
      },
    });

    const protocolNumber = (await response.json()).protocol_number;
    const ciData = await this.getOrderByProtocolNumber(request, protocolNumber);

    return ciData.data as TestUtilsCiData;
  }
}
