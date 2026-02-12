import { APIRequestContext, APIResponse } from '@playwright/test';
import TestConfig from '../../../config/test.config';

const headers = {
  Authorization: `Token token=${process.env.CILIA_TOKEN}`,
};

interface Params {
  dateOfBirth: string;
  licensePlate?: string;
  documentNumber?: string;
}

export class CiliaClaimAuthService {
  async insuredPersonAuth(request: APIRequestContext, { dateOfBirth, documentNumber, licensePlate }: Params): Promise<APIResponse> {
    const response = await request.post(`${TestConfig.urls.bffUrl}/whatsapp/v1/auth/insured_person`, {
      data: {
        document_number: documentNumber,
        license_plate: licensePlate,
        date_of_birth: dateOfBirth,
      },
      headers: headers,
    });

    return response;
  }

  async thirdPartyAuth(request: APIRequestContext, protocolNumber: string): Promise<APIResponse> {
    const response = await request.post(`${TestConfig.urls.bffUrl}/whatsapp/v1/auth/third_party`, {
      data: {
        protocol_number: protocolNumber,
      },
      headers: headers,
    });

    return response;
  }
}
