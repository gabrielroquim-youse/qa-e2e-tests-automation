---
name: qa-orchestrator
description: >-
  Orchestrates QA E2E workflows for Youse Seguro Auto: read coverage and planners,
  run validate/smoke/ux/a11y tests, sync dashboards (coverage, timing), and report
  gaps. Use when the user asks to validate tests, run the QA suite, update coverage
  dashboards, plan next test work, or mentions qa-orchestrator / agente QA.
---

# QA Orchestrator — Seguro Auto E2E

Playbook for automation-focused QA in `qa-e2e-tests-automation`. Read this skill fully before acting.

## Hard limits

- Do **not** `git commit` or `git push` unless the user explicitly asks.
- Do **not** change production Youse/sales-frontend code.
- Do **not** run full `test:e2e:timing` (~30 min) unless the user asks or many areas changed.
- Pricing rules belong in `qa-api-tests-automation`, not browser E2E.

## Quick start checklist

Copy and track:

```
- [ ] Read docs/planners/planner-qa-agent.md if scope is unclear
- [ ] npm run coverage:sync (if specs/CAP/inventory changed)
- [ ] npm run validate (if .ts files changed)
- [ ] Run targeted tests (matrix below)
- [ ] Update timing dashboard if full UX run (npm run test:ux:timing)
- [ ] Report: coverage %, test results, gaps, one next step
```

## Test matrix

| User intent / files touched | Command                                            |
| --------------------------- | -------------------------------------------------- |
| PR smoke / quick check      | `npm run test:smoke`                               |
| `tests/spec/e2e/ux/`        | `npm run test:ux` or `npm run test:ux:timing`      |
| `tests/spec/a11y/`          | `npm run test:a11y`                                |
| `tests/spec/e2e/payment/`   | `npm run test:payment` (PIX + cartões, ~15–25 min) |
| Full E2E regression         | `npm run test:e2e:timing`                          |
| Coverage only               | `npm run coverage:sync`                            |

**Local runs:** add `--reporter=list` if `ZEPHYR_API_TOKEN` is unset. VPN required for QA.

## Documentation map

| Need                     | Path                                        |
| ------------------------ | ------------------------------------------- |
| Coverage % and CAP gaps  | `docs/coverage/README.md`                   |
| Execution time dashboard | `docs/reports/e2e-timing-report.md`         |
| Conventions              | `docs/guides/boas-praticas.md`              |
| Form validation CAP-02   | `docs/planners/planner-validacao-campos.md` |
| Payment Adyen/PIX        | `docs/planners/planner-pagamento.md`        |
| A11y gaps                | `docs/guides/a11y-gap-map.md`               |

## After tests

1. If UX suite ran with list reporter → `npm run e2e:timing:generate -- --from-log <logfile>` OR use `npm run test:ux:timing`.
2. Summarize failures: spec name, likely flake (navigation timeout) vs real regression.
3. Suggest **one** next action (fix, re-run, update planner, blocked on QA massa).

## Implementing new tests

1. Update planner in `docs/planners/`.
2. Page Object in `tests/pages/quotation/` — never raw locators in specs.
3. Spec folder: `ux/` · `journeys/` · `payment/` · `blockers/` · `regression/`.
4. Tags: `@quotation_auto` + `@smoke` | `@regression` | `@negative`.
5. `scripts/coverage-inventory.ts` + `npm run coverage:sync`.

## Playwright Agents (separate)

- **generator:** from planner markdown
- **healer:** fix failing selectors

This skill **orchestrates**; use generator/healer for authoring fixes.

## Output template

```markdown
## Resumo QA

- **Cobertura:** X% — docs/coverage/README.md
- **Testes:** `command` → N/M passed
- **Timing:** (if applicable) wall-clock from e2e-timing-report
- **Gaps:** CAP-…
- **Próximo passo:** …
```
