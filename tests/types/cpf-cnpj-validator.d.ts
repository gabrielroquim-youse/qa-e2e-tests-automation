// Declaração manual de tipos para o pacote cpf-cnpj-validator.
// O pacote não distribui um arquivo .d.ts próprio, então declaramos aqui
// apenas a superfície utilizada no projeto.
// Fonte: https://github.com/carvalhoviniciusluiz/cpf-cnpj-validator
declare module 'cpf-cnpj-validator' {
  export const cpf: {
    isValid(value: string): boolean;
    generate(formatted?: boolean): string;
    strip(value: string): string;
    format(value: string): string;
  };
  export const cnpj: {
    isValid(value: string): boolean;
    generate(formatted?: boolean): string;
    strip(value: string): string;
    format(value: string): string;
  };
}
