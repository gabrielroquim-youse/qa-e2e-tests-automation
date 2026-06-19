# E2E — Seguro Auto

Organização por **intenção**, não por tipo técnico do Playwright.

| Pasta                        | Intenção                                        | Tags típicas             | Pipeline                                 |
| ---------------------------- | ----------------------------------------------- | ------------------------ | ---------------------------------------- |
| [`journeys/`](journeys/)     | Fluxos completos (F1 Regular, F2 personalizado) | `@journey` `@happy_path` | Smoke (até checkout) · Nightly (emissão) |
| [`ux/`](ux/)                 | Usabilidade do cliente por tela                 | `@ux` `@smoke`           | PR (`npm run test:smoke`)                |
| [`blockers/`](blockers/)     | Bloqueios e cenários negativos                  | `@negative`              | Nightly                                  |
| [`regression/`](regression/) | Regras de produto / precificação                | `@regression` `@price`   | Nightly / release                        |

## Comandos

```bash
npm run test:smoke       # journeys + ux com @smoke (~5–10 min, VPN)
npm run test:ux          # só usabilidade
npm run test:journey     # jornadas completas
npm run test:regression  # domínio / preço
```

Cada teste é **independente** — navega o funil do zero (sem `mode: 'serial'`).
