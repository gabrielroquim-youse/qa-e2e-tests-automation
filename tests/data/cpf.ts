/**
 * Massa de CPFs para testes automatizados.
 *
 * Inclui CPFs com diferentes status de análise de risco (recusados, negados e aceitos),
 * organizados por categoria para facilitar a seleção nos testes.
 *
 * Uso:
 *   import { cpf } from '../data/cpf';
 *
 *   // Caminho feliz
 *   await page.fillDocumentNumber(cpf.accepted.number);
 *
 *   // Cenário de recusa
 *   await page.fillDocumentNumber(cpf.pepRefusedInsured.number);
 *
 *   // Pool para testes paralelos (cada test pega um CPF diferente)
 *   const availableCpf = cpf.acceptedPool[index];
 */

export interface InsuredPersonResult {
  name?: string | null;
  gender?: string;
  date_of_birth?: string;
  nationality?: string;
  social_name?: string;
  occupation?: string;
  salary_range?: string;
}

export interface CpfData {
  number: string;
  status: string;
  source: string;
  description: string | null;
  result: {
    insured_person?: InsuredPersonResult;
  };
}

export const cpf = {
  // ── Segurado — Recusado ────────────────────────────────────────────────────

  /** CPF do segurado recusado pela lista PEP */
  pepRefusedInsured: {
    number: '123.456.701-69',
    status: 'pep.refused.insured',
    source: 'pep',
    description: 'CPF recusado',
    result: {},
  } as CpfData,

  /** CPF do segurado recusado pela lista negativa (nlist) */
  nlistRefusedInsured: {
    number: '123.456.702-40',
    status: 'nlist.refused.insured',
    source: 'nlist',
    description: 'CPF recusado',
    result: {},
  } as CpfData,

  /** CPF do segurado recusado pelo Crivo */
  crivoRefusedInsuredCpf: {
    number: '123.456.707-54',
    status: 'crivo.refused.insured.cpf',
    source: 'crivo',
    description: 'CPF recusado',
    result: {},
  } as CpfData,

  /** CPF do segurado recusado por restrição financeira */
  crivoRefusedInsuredFinancialConstraint: {
    number: '123.456.708-35',
    status: 'crivo.refused.insured.financial-constraint',
    source: 'crivo',
    description: 'CPF recusado por restrição financeira',
    result: {},
  } as CpfData,

  /** CPF do segurado com indenização integral por Roubo/Furto */
  crivoRefusedInsuredStolenIndemnified: {
    number: '123.456.709-16',
    status: 'crivo.refused.insured.stolen-indemnified',
    source: 'crivo',
    description: 'CPF possui registro de indenização integral de natureza Roubo/Furto',
    result: {},
  } as CpfData,

  /** CPF do segurado com indenização integral de natureza diferente de Roubo/Furto */
  crivoRefusedInsuredNotStolenIndemnified: {
    number: '123.456.710-50',
    status: 'crivo.refused.insured.not-stolen-indemnified',
    source: 'crivo',
    description: 'CPF possui registro de indenização integral de natureza diferente de Roubo/Furto',
    result: {},
  } as CpfData,

  /** CPF do segurado consta como pessoa falecida */
  crivoRefusedInsuredDeath: {
    number: '123.456.713-00',
    status: 'crivo.refused.insured.death',
    source: 'crivo',
    description: 'CPF consta como pessoa falecida',
    result: {},
  } as CpfData,

  /** CPF do segurado recusado pela blacklist da Youse */
  crivoRefusedInsuredCpfBlacklist: {
    number: '123.456.714-83',
    status: 'crivo.refused.insured.cpf-blacklist',
    source: 'crivo',
    description: 'CPF recusado pela Youse',
    result: {},
  } as CpfData,

  // ── Segurado — Negado (dados divergentes) ─────────────────────────────────

  /** Nome não condiz com o CPF informado */
  crivoDeniedInsuredName: {
    number: '123.456.703-20',
    status: 'crivo.denied.insured.name',
    source: 'crivo',
    description: 'Nome não condiz com o CPF informado',
    result: {},
  } as CpfData,

  /** Data de nascimento não condiz com o CPF informado */
  crivoDeniedInsuredDateOfBirth: {
    number: '123.456.704-01',
    status: 'crivo.denied.insured.date_of_birth',
    source: 'crivo',
    description: 'Data de nascimento não condiz com o CPF informado',
    result: {},
  } as CpfData,

  /** Nome social não condiz com o CPF informado */
  crivoDeniedInsuredSocialName: {
    number: '123.456.726-17',
    status: 'crivo.denied.insured.social.name',
    source: 'crivo',
    description: 'Nome social não condiz com o CPF informado',
    result: {},
  } as CpfData,

  /** CPF sem nome associado */
  crivoDeniedCpfNotFound: {
    number: '123.456.816-08',
    status: 'crivo.denied.cpf.not-found',
    source: 'crivo',
    description: 'CPF sem nome associado',
    result: { insured_person: { name: null } },
  } as CpfData,

  // ── Veículo — Recusado ─────────────────────────────────────────────────────

  /** Chassi do veículo possui 3 ou mais registros de indenizações parciais */
  crivoRefusedVehicleIndemnified: {
    number: '123.456.711-30',
    status: 'crivo.refused.vehicle.indemnified',
    source: 'crivo',
    description: 'O chassi informado do veículo possui 3 ou mais registro de indenizações parciais',
    result: {},
  } as CpfData,

  /** Chassi do veículo consta como Roubo/Furto */
  crivoRefusedVehicleStolen: {
    number: '123.456.712-11',
    status: 'crivo.refused.vehicle.stolen',
    source: 'crivo',
    description: 'O chassi informado do veículo consta como Roubo/Furto',
    result: {},
  } as CpfData,

  /** Placa do veículo está na blacklist */
  crivoRefusedVehiclePlateBlacklist: {
    number: '123.456.715-64',
    status: 'crivo.refused.vehicle.licence-plate-blacklist',
    source: 'crivo',
    description: 'Veículo recusado - placa não aceita',
    result: {},
  } as CpfData,

  /** Chassi do veículo está na blacklist */
  crivoRefusedVehicleVinBlacklist: {
    number: '123.456.716-45',
    status: 'crivo.refused.vehicle.vin-blacklist',
    source: 'crivo',
    description: 'Veículo recusado - chassi não aceito',
    result: {},
  } as CpfData,

  /** Dados do veículo estão divergentes */
  crivoRefusedVehicleMismatch: {
    number: '123.456.718-07',
    status: 'crivo.refused.vehicle.mismatch',
    source: 'crivo',
    description: 'Os dados do veículo estão divergentes',
    result: {},
  } as CpfData,

  // ── Veículo — Negado ───────────────────────────────────────────────────────

  /** Placa do veículo não encontrada */
  crivoDeniedVehiclePlateNotFound: {
    number: '123.456.705-92',
    status: 'crivo.denied.vehicle.license-plate-not-found',
    source: 'crivo',
    description: 'A placa informada do veículo não foi encontrada',
    result: {},
  } as CpfData,

  /** Chassi do veículo não encontrado */
  crivoDeniedVehicleVinNotFound: {
    number: '123.456.706-73',
    status: 'crivo.denied.vehicle.vin-not-found',
    source: 'crivo',
    description: 'O chassi informado do veículo não foi encontrado',
    result: {},
  } as CpfData,

  /** Dados do veículo são divergentes (negado, não recusado) */
  crivoDeniedVehicleMismatch: {
    number: '123.456.810-12',
    status: 'crivo.denied.vehicle.mismatch',
    source: 'crivo',
    description: 'Os dados do veículo são divergentes',
    result: {},
  } as CpfData,

  // ── Condutor — Recusado ────────────────────────────────────────────────────

  /** CPF do condutor recusado pela lista PEP */
  pepRefusedDriver: {
    number: '123.456.800-40',
    status: 'pep.refused.driver',
    source: 'pep',
    description: 'CPF recusado',
    result: {},
  } as CpfData,

  /** CPF do condutor recusado pela lista negativa (nlist) */
  nlistRefusedDriver: {
    number: '123.456.801-21',
    status: 'nlist.refused.driver',
    source: 'nlist',
    description: 'CPF recusado',
    result: {},
  } as CpfData,

  /** CPF do condutor recusado pelo Crivo */
  crivoRefusedDriverCpf: {
    number: '123.456.802-02',
    status: 'crivo.refused.driver.cpf',
    source: 'crivo',
    description: 'CPF recusado',
    result: {},
  } as CpfData,

  /** CPF do condutor recusado por restrição financeira */
  crivoRefusedDriverFinancialConstraint: {
    number: '123.456.805-55',
    status: 'crivo.refused.driver.financial-constraint',
    source: 'crivo',
    description: 'CPF recusado por restrição financeira',
    result: {},
  } as CpfData,

  /** CPF do condutor com indenização integral por Roubo/Furto */
  crivoRefusedDriverStolenIndemnified: {
    number: '123.456.806-36',
    status: 'crivo.refused.driver.stolen-indemnified',
    source: 'crivo',
    description: 'CPF possui registro de indenização integral de natureza Roubo/Furto',
    result: {},
  } as CpfData,

  /** CPF do condutor com indenização integral de natureza diferente de Roubo/Furto */
  crivoRefusedDriverNotStolenIndemnified: {
    number: '123.456.807-17',
    status: 'crivo.refused.driver.not-stolen-indemnified',
    source: 'crivo',
    description: 'CPF possui registro de indenização integral de natureza diferente de Roubo/Furto',
    result: {},
  } as CpfData,

  /** CPF do condutor consta como pessoa falecida */
  crivoRefusedDriverDeath: {
    number: '123.456.808-06',
    status: 'crivo.refused.driver.death',
    source: 'crivo',
    description: 'CPF consta como pessoa falecida',
    result: {},
  } as CpfData,

  /** CPF do condutor recusado pela blacklist da Youse */
  crivoRefusedDriverCpfBlacklist: {
    number: '123.456.809-89',
    status: 'crivo.refused.driver.cpf-blacklist',
    source: 'crivo',
    description: 'CPF recusado pela Youse',
    result: {},
  } as CpfData,

  // ── Condutor — Negado ──────────────────────────────────────────────────────

  /** Nome do condutor não condiz com o CPF informado */
  crivoDeniedDriverName: {
    number: '123.456.803-93',
    status: 'crivo.denied.driver.name',
    source: 'crivo',
    description: 'Nome não condiz com o CPF informado',
    result: {},
  } as CpfData,

  /** Data de nascimento do condutor não condiz com o CPF informado */
  crivoDeniedDriverDateOfBirth: {
    number: '123.456.804-74',
    status: 'crivo.denied.driver.date_of_birth',
    source: 'crivo',
    description: 'Data de nascimento não condiz com o CPF informado',
    result: {},
  } as CpfData,

  // ── Sistema / Outros ───────────────────────────────────────────────────────

  /** Alguma fonte de dados está indisponível */
  crivoRefusedSourceUnavailable: {
    number: '123.456.717-26',
    status: 'crivo.refused.source.unavailable',
    source: 'risk-acceptance',
    description: 'Alguma fonte está indisponível',
    result: {},
  } as CpfData,

  /** Erro interno inesperado no sistema */
  systemInternalServerError: {
    number: '123.456.799-72',
    status: 'system.internal-server-error',
    source: 'risk-acceptance',
    description: 'Houve um erro inesperado',
    result: {},
  } as CpfData,

  /** Recusado por alto risco (risk_ratio) */
  riskRatioHighRisk: {
    number: '123.456.900-03',
    status: 'risk_ratio.refused.high_risk',
    source: 'risk_ratio',
    description: 'Recusado alto risco',
    result: {},
  } as CpfData,

  /** Veículo recusado pela lista negativa de veículos */
  vehiclesNlistRefused: {
    number: '123.456.901-94',
    status: 'vehicles_nlist.refused',
    source: 'vehicles_nlist',
    description: 'Recusado',
    result: {},
  } as CpfData,

  /** Alta probabilidade de sinistro — média ponderada positiva */
  highProbabilityClaimWeightedAverage: {
    number: '123.456.797-00',
    status: 'high_probability_of_claim.refused.weighted_average_positive',
    source: 'high_probability_of_claim',
    description: null,
    result: {},
  } as CpfData,

  /** Alta probabilidade de sinistro — recusado por cache */
  highProbabilityClaimByCache: {
    number: '123.456.798-91',
    status: 'high_probability_of_claim.refused.refused_by_cache',
    source: 'high_probability_of_claim',
    description: null,
    result: {},
  } as CpfData,

  // ── Aceito — Caminho feliz ─────────────────────────────────────────────────

  /**
   * CPF reservado para criação de apólice D-1 (data retroativa de um dia).
   * NÃO usar em testes de caminho feliz genéricos — use `cpf.acceptedPool[N]`.
   * Este CPF coincide com TestConfig.credentials.documentNumber.
   */
  accepted: {
    number: '123.456.761-08',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {},
  } as CpfData,

  /** Aceito — retorna dados completos da pessoa (nome, gênero, nascimento, nacionalidade) */
  acceptedWithFullPersonData: {
    number: '123.456.720-21',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {
      insured_person: {
        name: 'John Youser',
        gender: 'MASCULINO',
        date_of_birth: '05/05/1986 00:00:00',
        nationality: 'BRASILEIRO',
      },
    },
  } as CpfData,

  /** Aceito — retorna dados sem nome */
  acceptedWithoutName: {
    number: '123.456.721-02',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {
      insured_person: {
        gender: 'MASCULINO',
        date_of_birth: '05/05/1986 00:00:00',
        nationality: 'BRASILEIRO',
      },
    },
  } as CpfData,

  /** Aceito — retorna dados sem gênero */
  acceptedWithoutGender: {
    number: '123.456.722-93',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {
      insured_person: {
        name: 'John Youser',
        date_of_birth: '05/05/1986 00:00:00',
        nationality: 'BRASILEIRO',
      },
    },
  } as CpfData,

  /** Aceito — retorna dados sem data de nascimento */
  acceptedWithoutDateOfBirth: {
    number: '123.456.723-74',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {
      insured_person: {
        name: 'John Youser',
        gender: 'MASCULINO',
        nationality: 'BRASILEIRO',
      },
    },
  } as CpfData,

  /** Aceito — retorna dados sem nacionalidade */
  acceptedWithoutNationality: {
    number: '123.456.724-55',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {
      insured_person: {
        name: 'John Youser',
        gender: 'MASCULINO',
        date_of_birth: '05/05/1986 00:00:00',
      },
    },
  } as CpfData,

  /** Aceito — retorna dados com nome social */
  acceptedWithSocialName: {
    number: '123.456.725-36',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {
      insured_person: {
        name: 'John Youser',
        gender: 'MASCULINO',
        date_of_birth: '05/05/1986 00:00:00',
        social_name: 'David Youser',
        nationality: 'BRASILEIRO',
      },
    },
  } as CpfData,

  /** Aceito — retorna dados completos com ocupação e faixa salarial (R$ 800 – R$ 2.500) */
  acceptedWithOccupationAndSalary: {
    number: '123.456.811-01',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {
      insured_person: {
        name: 'JOHN YOUSER',
        gender: 'MASCULINO',
        nationality: 'BRASILEIRO',
        date_of_birth: '05/05/1986 00:00:00',
        occupation: 'ANALISTA DE SISTEMAS',
        salary_range: 'DE R$ 800,01 A R$ 2.500,00',
      },
    },
  } as CpfData,

  /** Aceito — sem gênero, faixa salarial R$ 2.500 – R$ 4.500 */
  acceptedWithSalaryWithoutGender: {
    number: '123.456.812-84',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {
      insured_person: {
        name: 'JOHN YOUSER',
        nationality: 'BRASILEIRO',
        date_of_birth: '05/05/1986 00:00:00',
        occupation: 'ANALISTA DE SISTEMAS',
        salary_range: 'DE R$ 2.500,01 A R$ 4.500,00',
      },
    },
  } as CpfData,

  /** Aceito — sem nacionalidade, faixa salarial R$ 2.500 – R$ 4.500 */
  acceptedWithSalaryWithoutNationality: {
    number: '123.456.813-65',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {
      insured_person: {
        name: 'JOHN YOUSER',
        gender: 'MASCULINO',
        date_of_birth: '05/05/1986 00:00:00',
        occupation: 'ANALISTA DE SISTEMAS',
        salary_range: 'DE R$ 2.500,01 A R$ 4.500,00',
      },
    },
  } as CpfData,

  /** Aceito — sem data de nascimento, faixa salarial acima de R$ 7.000 */
  acceptedWithHighSalaryWithoutDateOfBirth: {
    number: '123.456.814-46',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {
      insured_person: {
        name: 'JOHN YOUSER',
        gender: 'MASCULINO',
        nationality: 'BRASILEIRO',
        occupation: 'ANALISTA DE SISTEMAS',
        salary_range: 'ACIMA DE R$ 7.000,00',
      },
    },
  } as CpfData,

  /** Aceito — sem ocupação, faixa salarial acima de R$ 10.000 */
  acceptedWithHighestSalaryWithoutOccupation: {
    number: '123.456.815-27',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {
      insured_person: {
        name: 'JOHN YOUSER',
        gender: 'MASCULINO',
        nationality: 'BRASILEIRO',
        date_of_birth: '05/05/1986 00:00:00',
        salary_range: 'ACIMA DE R$ 10.000,00',
      },
    },
  } as CpfData,

  /** Aceito — com ocupação, sem faixa salarial */
  acceptedWithOccupationWithoutSalary: {
    number: '123.456.817-99',
    status: 'accepted',
    source: 'risk-acceptance',
    description: 'Sem restrições',
    result: {
      insured_person: {
        name: 'JOHN YOUSER',
        gender: 'MASCULINO',
        nationality: 'BRASILEIRO',
        date_of_birth: '05/05/1986 00:00:00',
        occupation: 'ANALISTA DE SISTEMAS',
      },
    },
  } as CpfData,

  // ── Pool de CPFs aceitos ───────────────────────────────────────────────────
  /**
   * Lista de CPFs aceitos sem restrições disponíveis para uso geral.
   * Útil quando os testes precisam de CPFs distintos (ex: execução paralela).
   *
   * Uso: const meuCpf = cpf.acceptedPool[workerIndex];
   */
  acceptedPool: [
    { number: '123.456.719-98', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.727-06', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.728-89', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.729-60', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.730-01', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.731-84', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.732-65', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.733-46', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.734-27', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.735-08', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.736-99', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.737-70', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.738-50', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.739-31', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.740-75', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.741-56', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.742-37', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.743-18', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.744-07', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.745-80', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.746-60', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.747-41', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.748-22', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.749-03', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.750-47', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.751-28', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.752-09', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.753-90', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.754-70', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.755-51', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.756-32', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.757-13', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.758-02', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.759-85', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.760-19', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.761-08', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.762-80', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.763-61', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.764-42', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.765-23', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.766-04', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.767-95', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.768-76', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.769-57', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.770-90', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.771-71', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.772-52', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.773-33', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.774-14', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.775-03', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.776-86', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.777-67', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.778-48', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.779-29', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.780-62', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.781-43', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.782-24', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.783-05', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.784-96', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.785-77', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.786-58', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.787-39', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.788-10', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.790-34', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.791-15', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.792-04', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.793-87', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.794-68', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.795-49', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.796-20', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.818-70', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.819-50', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.820-94', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.821-75', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.822-56', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.823-37', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.824-18', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.825-07', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.826-80', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.827-60', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.828-41', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.829-22', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.830-66', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.831-47', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.832-28', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.833-09', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.834-90', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.835-70', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.836-51', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.837-32', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.838-13', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.839-02', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.840-38', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.841-19', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.842-08', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.843-80', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.844-61', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.845-42', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.846-23', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.847-04', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.848-95', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.849-76', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.850-00', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.851-90', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.852-71', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.853-52', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.854-33', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.855-14', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.856-03', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.857-86', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.858-67', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.859-48', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.860-81', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.861-62', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.862-43', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.863-24', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.864-05', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.865-96', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.866-77', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.867-58', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.868-39', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.869-10', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.870-53', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.871-34', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.872-15', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.873-04', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.874-87', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.875-68', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.876-49', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.877-20', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.878-00', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.879-91', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.880-25', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.881-06', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.882-97', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.883-78', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.884-59', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.885-30', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.886-10', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.887-00', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.888-82', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.889-63', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.890-05', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.891-88', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.892-69', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.893-40', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.894-20', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.895-01', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.896-92', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.897-73', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.898-54', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
    { number: '123.456.899-35', status: 'accepted', source: 'risk-acceptance', description: 'Sem restrições', result: {} },
  ] as CpfData[],
};
