/**
 * Enumeração dos produtos de seguro da Youse.
 * Utilizado nas fixtures de setup (setupPolicy, setupClaim) para criar
 * apólices e sinistros via TestUtilsService por produto.
 */
export enum Product {
  AUTO = 'auto',
  HOME = 'home',
  LIFE = 'life',
}
