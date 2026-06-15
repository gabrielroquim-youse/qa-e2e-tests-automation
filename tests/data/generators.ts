import { faker } from '@faker-js/faker/locale/pt_BR';
import { cnpj, cpf } from 'cpf-cnpj-validator';
import { getRandomCep } from './cep';

/**
 * Funções utilitárias para geração dinâmica de dados de teste com Faker.
 * Use esta classe quando precisar de dados aleatórios em tempo de execução.
 *
 * Para massas de dados pré-definidas (CPFs/Placas com status conhecido),
 * utilize os mocks em data/cpf.ts e data/plate.ts.
 */
export class DataGenerator {
  static gerarNomePessoa(): string {
    return faker.person.fullName();
  }

  static gerarNomeEmpresa(): string {
    return faker.company.name();
  }

  /** Gera e-mail com domínio @youse.com.br para testes internos */
  static gerarEmailYouse(): string {
    return `qa.automation+${Date.now()}@youse.com.br`;
  }

  static gerarEmail(): string {
    return faker.internet.email();
  }

  static gerarCpf(): string {
    return cpf.generate(true); // com formatação: 000.000.000-00
  }

  static gerarCnpj(): string {
    return cnpj.generate(true); // com formatação: 00.000.000/0000-00
  }

  /** Retorna um CEP real e válido (ViaCEP) do pool de teste. Evita CEPs inexistentes. */
  static gerarCep(state?: string): string {
    return getRandomCep(state).cep;
  }

  static gerarEndereco(): string {
    return faker.location.streetAddress();
  }

  static gerarComplemento(...opcoes: string[]): string {
    return faker.helpers.arrayElement(opcoes);
  }

  static gerarCelular(): string {
    const dddsValidos = [11, 21, 31, 41, 51, 61, 71, 81, 91, 19, 27, 47, 67, 77, 87];
    const ddd = faker.helpers.arrayElement(dddsValidos);
    return `(${ddd}) 9${faker.number.int({ min: 1000, max: 9999 })}-${faker.number.int({ min: 1000, max: 9999 })}`;
  }

  /** Retorna placa padrão de testes sem restrições */
  static gerarPlaca(): string {
    return 'YOU-0020';
  }
}
