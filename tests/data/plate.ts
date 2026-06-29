/**
 * Massa de placas para testes automatizados.
 *
 * Inclui placas com diferentes status de análise de risco e cenários de inspeção,
 * organizadas por categoria para facilitar a seleção nos testes.
 *
 * Uso:
 *   import { plate } from '../data/plate';
 *
 *   // Caminho feliz (padrão — sem inspeção)
 *   await page.fillLicensePlate(plate.noInspection.number);
 *
 *   // Inspeção online
 *   await page.fillLicensePlate(plate.onlineInspection.number);
 *
 *   // Cenário de recusa (leilão)
 *   await page.fillLicensePlate(plate.refusedAuction.number);
 */

export interface VehicleMatchedResult {
  fuel_type: string | null;
  vin: string | null;
  year: number | null;
  external_codes?: string[];
}

export interface VehicleResult {
  /** Nota: a chave "license_plate:" com dois-pontos é proposital — reflete o contrato da API */
  'license_plate:'?: string | null;
  license_plate_state?: string | null;
  vin?: string | null;
  renavam?: string | null;
  matched?: VehicleMatchedResult;
}

export interface PlateData {
  number: string;
  status: string;
  source: string;
  description: string | null;
  result: {
    vehicle?: VehicleResult;
  };
}

export const plate = {
  // ── Aceitas — Inspeção ─────────────────────────────────────────────────────

  /**
   * Placa padrão aceita — sem necessidade de inspeção.
   * Mesma placa de TestConfig.credentials.licensePlate.
   *
   * @deprecated ⚠️ Em QA, esta placa aciona **vistoria online** após o pagamento.
   * NÃO usar em testes de fluxo feliz sem inspeção.
   * Use uma placa que não acione inspeção ou forneça via `TEST_LICENSE_PLATE`.
   * Para testar a vistoria online, prefira referenciar esta placa explicitamente:
   *   `plate.onlineInspection.number` ou `'YOU-0020'` no spec.
   */
  noInspection: {
    number: 'YOU-0020',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {
      vehicle: {
        'license_plate:': null,
        license_plate_state: null,
        vin: null,
        renavam: null,
        matched: {
          fuel_type: 'Flexivel Alcool/Gasolina',
          vin: '9BWAB45Z6G0004104',
          year: 2018,
          external_codes: ['015140-8'],
        },
      },
    },
  } as PlateData,

  /** Placa aceita — requer inspeção online */
  onlineInspection: {
    number: 'YOU-0003',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {
      vehicle: {
        'license_plate:': null,
        license_plate_state: null,
        vin: null,
        renavam: null,
        matched: {
          fuel_type: 'Flexivel Alcool/Gasolina',
          vin: '9BWAB45Z6G0004104',
          year: 2018,
          external_codes: ['015140-8'],
        },
      },
    },
  } as PlateData,

  /** Placa aceita — requer inspeção presencial (on-site) */
  onSiteInspection: {
    number: 'YOU-0002',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {
      vehicle: {
        'license_plate:': null,
        license_plate_state: null,
        vin: null,
        renavam: null,
        matched: {
          fuel_type: 'Flexivel Alcool/Gasolina',
          vin: '9BWAB45Z6G0004104',
          year: 2018,
          external_codes: ['015140-8'],
        },
      },
    },
  } as PlateData,

  /** Placa aceita — requer inspeção por vídeo via Planetun (ivideo). */
  videoInspection: {
    number: 'YOU-0023',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {
      vehicle: {
        'license_plate:': null,
        license_plate_state: null,
        vin: null,
        renavam: null,
        matched: {
          fuel_type: 'Flexivel Alcool/Gasolina',
          vin: '9BWAB45Z6G0004104',
          year: 2018,
          external_codes: ['015140-8'],
        },
      },
    },
  } as PlateData,

  // ── Aceitas — Variações de ano e dados ─────────────────────────────────────

  /** Aceita — veículo ano 2017, um código externo */
  acceptedYear2017: {
    number: 'YOU-0011',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {
      vehicle: {
        'license_plate:': null,
        license_plate_state: null,
        vin: null,
        renavam: null,
        matched: {
          fuel_type: 'Flexivel Alcool/Gasolina',
          vin: '9BWAB45Z6G0004104',
          year: 2017,
          external_codes: ['025215-8'],
        },
      },
    },
  } as PlateData,

  /** Aceita — veículo ano 2015, um código externo */
  acceptedYear2015SingleCode: {
    number: 'YOU-0012',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {
      vehicle: {
        'license_plate:': null,
        license_plate_state: null,
        vin: null,
        renavam: null,
        matched: {
          fuel_type: 'Flexivel Alcool/Gasolina',
          vin: '9BWAB45Z6G0004104',
          year: 2015,
          external_codes: ['025215-8'],
        },
      },
    },
  } as PlateData,

  /** Aceita — veículo ano 2015, múltiplos códigos externos */
  acceptedYear2015MultipleCodes: {
    number: 'YOU-0013',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {
      vehicle: {
        'license_plate:': null,
        license_plate_state: null,
        vin: null,
        renavam: null,
        matched: {
          fuel_type: 'Flexivel Alcool/Gasolina',
          vin: '9BWAB45Z6G0004104',
          year: 2015,
          external_codes: ['025215-8', '025228-0', '025189-5'],
        },
      },
    },
  } as PlateData,

  /** Aceita — dados do veículo completamente sem correspondência (matched vazio) */
  acceptedNoMatchedData: {
    number: 'YOU-0014',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {
      vehicle: {
        'license_plate:': null,
        license_plate_state: null,
        vin: null,
        renavam: null,
        matched: {
          fuel_type: null,
          vin: null,
          year: null,
          external_codes: [],
        },
      },
    },
  } as PlateData,

  /** Aceita — chassi com valor diferente do padrão (sem external_codes) */
  acceptedAlternativeVin: {
    number: 'YOU-0018',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {
      vehicle: {
        'license_plate:': null,
        license_plate_state: null,
        vin: null,
        renavam: null,
        matched: {
          fuel_type: 'Flexivel Alcool/Gasolina',
          vin: '11111111111111112',
          year: 2018,
        },
      },
    },
  } as PlateData,

  // ── Recusadas ──────────────────────────────────────────────────────────────

  /** Veículo de leilão — recusado pela Nortix */
  refusedAuction: {
    number: 'YOU-0016',
    status: 'refused.vehicle.auction',
    source: 'nortix',
    description: 'Veículo de Leilão',
    result: {},
  } as PlateData,

  // ── Sistema ────────────────────────────────────────────────────────────────

  /** Erro interno inesperado no sistema */
  systemInternalServerError: {
    number: 'YOU-0010',
    status: 'system.internal-server-error',
    source: 'risk-acceptance',
    description: 'Houve um erro inesperado',
    result: {},
  } as PlateData,

  // ── Pool de placas aceitas ─────────────────────────────────────────────────
  /**
   * Lista de placas aceitas sem restrições para uso geral.
   * Útil quando os testes precisam de placas distintas (ex: execução paralela).
   *
   * Uso: const myPlate = plate.acceptedPool[testInfo.workerIndex];
   */
  acceptedPool: [
    {
      number: 'YOU-0000',
      status: 'accepted',
      source: 'risk-acceptance',
      description: 'Sem restrições',
      result: {
        vehicle: {
          'license_plate:': null,
          license_plate_state: null,
          vin: null,
          renavam: null,
          matched: { fuel_type: 'Flexivel Alcool/Gasolina', vin: '9BWAB45Z6G0004104', year: 2018, external_codes: ['015140-8'] },
        },
      },
    },
    {
      number: 'YOU-0001',
      status: 'accepted',
      source: 'risk-acceptance',
      description: 'Sem restrições',
      result: {
        vehicle: {
          'license_plate:': null,
          license_plate_state: null,
          vin: null,
          renavam: null,
          matched: { fuel_type: 'Flexivel Alcool/Gasolina', vin: '9BWAB45Z6G0004104', year: 2018, external_codes: ['015140-8'] },
        },
      },
    },
    {
      number: 'YOU-0017',
      status: 'accepted',
      source: 'risk-acceptance',
      description: 'Sem restrições',
      result: {
        vehicle: {
          'license_plate:': null,
          license_plate_state: null,
          vin: null,
          renavam: null,
          matched: { fuel_type: 'Flexivel Alcool/Gasolina', vin: '9BWAB45Z6G0004104', year: 2018, external_codes: ['015140-8'] },
        },
      },
    },
    {
      number: 'YOU-0021',
      status: 'accepted',
      source: 'risk-acceptance',
      description: 'Sem restrições',
      result: {
        vehicle: {
          'license_plate:': null,
          license_plate_state: null,
          vin: null,
          renavam: null,
          matched: { fuel_type: 'Flexivel Alcool/Gasolina', vin: '9BWAB45Z6G0004104', year: 2018, external_codes: ['015140-8'] },
        },
      },
    },
    {
      number: 'YOU-0022',
      status: 'accepted',
      source: 'risk-acceptance',
      description: 'Sem restrições',
      result: {
        vehicle: {
          'license_plate:': null,
          license_plate_state: null,
          vin: null,
          renavam: null,
          matched: { fuel_type: 'Flexivel Alcool/Gasolina', vin: '9BWAB45Z6G0004104', year: 2018, external_codes: ['015140-8'] },
        },
      },
    },
  ] as PlateData[],
};
