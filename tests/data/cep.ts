/**
 * Massa de CEPs reais para testes automatizados.
 *
 * Todos os CEPs foram validados na API ViaCEP e existem na base dos Correios.
 * Variados por estado/região para garantir cobertura geográfica.
 *
 * Uso:
 *   import { cepPool, getRandomCep } from '../data/cep';
 *
 *   // CEP aleatório do pool
 *   const { cep } = getRandomCep();
 *
 *   // CEP de estado específico
 *   const { cep } = getRandomCep('SP');
 *
 *   // Pool para testes paralelos (cada worker pega um CEP diferente)
 *   const { cep } = cepPool[workerIndex % cepPool.length];
 */

export interface CepData {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
}

/**
 * Pool de CEPs reais, validados no ViaCEP, distribuídos por estado.
 * Use para variar a cobertura geográfica nos testes de cotação.
 */
export const cepPool: CepData[] = [
  // São Paulo - SP
  { cep: '04777-020', state: 'SP', city: 'São Paulo', neighborhood: 'Jardim Edite' },
  { cep: '01310-100', state: 'SP', city: 'São Paulo', neighborhood: 'Bela Vista' },
  { cep: '05407-002', state: 'SP', city: 'São Paulo', neighborhood: 'Pinheiros' },
  { cep: '04538-133', state: 'SP', city: 'São Paulo', neighborhood: 'Itaim Bibi' },
  { cep: '13040-395', state: 'SP', city: 'Campinas', neighborhood: 'Centro' },
  { cep: '12220-001', state: 'SP', city: 'São José dos Campos', neighborhood: 'Centro' },
  // Rio de Janeiro - RJ
  { cep: '22250-040', state: 'RJ', city: 'Rio de Janeiro', neighborhood: 'Botafogo' },
  { cep: '20040-020', state: 'RJ', city: 'Rio de Janeiro', neighborhood: 'Centro' },
  { cep: '22411-010', state: 'RJ', city: 'Rio de Janeiro', neighborhood: 'Leblon' },
  // Minas Gerais - MG
  { cep: '30130-110', state: 'MG', city: 'Belo Horizonte', neighborhood: 'Centro' },
  { cep: '30112-020', state: 'MG', city: 'Belo Horizonte', neighborhood: 'Funcionários' },
  // Rio Grande do Sul - RS
  { cep: '90010-150', state: 'RS', city: 'Porto Alegre', neighborhood: 'Centro Histórico' },
  { cep: '90570-020', state: 'RS', city: 'Porto Alegre', neighborhood: 'Bela Vista' },
  // Paraná - PR
  { cep: '80010-010', state: 'PR', city: 'Curitiba', neighborhood: 'Centro' },
  { cep: '80240-210', state: 'PR', city: 'Curitiba', neighborhood: 'Portão' },
  // Bahia - BA
  { cep: '40020-010', state: 'BA', city: 'Salvador', neighborhood: 'Centro' },
  // Pernambuco - PE
  { cep: '50010-000', state: 'PE', city: 'Recife', neighborhood: 'Santo Antônio' },
  // Ceará - CE
  { cep: '60135-235', state: 'CE', city: 'Fortaleza', neighborhood: 'Aldeota' },
  // Distrito Federal - DF
  { cep: '70040-010', state: 'DF', city: 'Brasília', neighborhood: 'Asa Norte' },
  // Goiás - GO
  { cep: '74110-010', state: 'GO', city: 'Goiânia', neighborhood: 'Centro' },
];

/**
 * Retorna um CEP aleatório do pool.
 * Opcionalmente filtra por estado (ex: 'SP', 'RJ').
 *
 * @example
 * const { cep } = getRandomCep();       // qualquer estado
 * const { cep } = getRandomCep('SP');   // somente São Paulo
 */
export function getRandomCep(state?: string): CepData {
  const pool = state ? cepPool.filter((c) => c.state === state) : cepPool;
  if (pool.length === 0) throw new Error(`Nenhum CEP encontrado para o estado: ${state}`);
  return pool[Math.floor(Math.random() * pool.length)];
}
