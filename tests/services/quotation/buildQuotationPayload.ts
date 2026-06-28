import { generateQuotationData, type QuotationData } from '../../fixtures/setupQuotation';
import { DEFAULT_QUOTATION_MASS } from '../../data/quotationDefaults';

/** Campos de risco que alteram o prêmio — alinhados a precosPlanos.spec.ts / opin-service. */
export interface QuotationRiskOverrides {
  useBonusClass?: boolean;
  bonusClass?: number;
  garageCarSleeps?: boolean;
  vehicleUsage?: string;
  maritalStatus?: string;
  isBrandNew?: boolean;
}

export interface QuotationApiPayload {
  lead: { name: string; email: string; phone: string };
  vehicle: { license_plate: string; brand_new?: boolean };
  address: { zip_code: string; number: string };
  person: { document_number: string; date_of_birth: string; marital_status?: string };
  risk?: QuotationRiskOverrides;
}

/**
 * Monta payload JSON para APIs de cotação.
 * Ajuste nomes de campos quando o contrato OpenAPI do opin-service/BFF for confirmado.
 */
export function buildQuotationPayload(overrides?: Partial<QuotationData> & { risk?: QuotationRiskOverrides }): QuotationApiPayload {
  const data = generateQuotationData(overrides);

  return {
    lead: { name: data.name, email: data.email, phone: data.phone },
    vehicle: {
      license_plate: overrides?.licensePlate ?? data.licensePlate ?? DEFAULT_QUOTATION_MASS.licensePlate,
      brand_new: overrides?.risk?.isBrandNew,
    },
    address: {
      zip_code: overrides?.zipCode ?? data.zipCode ?? DEFAULT_QUOTATION_MASS.zipCode,
      number: overrides?.addressNumber ?? data.addressNumber ?? DEFAULT_QUOTATION_MASS.addressNumber,
    },
    person: {
      document_number: overrides?.documentNumber ?? data.documentNumber ?? DEFAULT_QUOTATION_MASS.documentNumber,
      date_of_birth: DEFAULT_QUOTATION_MASS.dateOfBirth,
      marital_status: overrides?.risk?.maritalStatus,
    },
    risk: overrides?.risk,
  };
}
