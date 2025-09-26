import { faker } from '@faker-js/faker';
import { cpf, cnpj } from 'cpf-cnpj-validator';

export class DataGenerator {
    static placaGenerator(): string {
        return "YOU-0000";
    }

    static gerarNomeEmpresa(): string {
        return faker.company.name();
    }

    static gerarNomePessoa(): string {
        return faker.person.fullName();
    }

    static gerarEmail(): string {
        return faker.internet.email();
    }

    static gerarCpf(): string {
        return cpf.generate();
    }

    static gerarCnpj(): string {
        return cnpj.generate();
    }

    static gerarCep(): string {
        return faker.location.zipCode('#####-###');
    }

    static gerarEndereco(): string {
        return faker.location.streetAddress();
    }

    static gerarComplementoList(compl1: string, compl2: string, compl3: string) {
        const complementos = [compl1, compl2, compl3]
        return faker.helpers.arrayElement(complementos);
    }

    static gerarCelular(): string {
        const dddsValidos = [11, 21, 31, 41, 51, 61, 71, 81, 91, 19, 27, 47, 67, 77, 87];
        const dddAleatorio = faker.helpers.arrayElement(dddsValidos);
        return `(${dddAleatorio}) 9${faker.number.int({ min: 1000, max: 9999 })}-${faker.number.int({ min: 1000, max: 9999})}`;
    }
}