# 🎯 Accessibility Improvement Roadmap — Youse Seguradora

**Objetivo:** Transformar testes de acessibilidade fragmentados em um programa robusto de WCAG 2.1 AA compliance com cobertura em desktop, tablet e relatório automatizado.

---

## 📊 Situação Atual vs Visão

| Dimensão             | Status Atual                           | Visão Futura                                              | Gap                             |
| -------------------- | -------------------------------------- | --------------------------------------------------------- | ------------------------------- |
| **Cobertura WCAG**   | Só critical/serious em 1 estágio       | Todos 5 estágios (lead → checkout)                        | 4 estágios                      |
| **Dispositivos**     | Desktop + Tablet definidos, Mobile ref | Desktop, Tablet, Mobile runner fixo                       | Mobile Appium (fora escopo web) |
| **Testes**           | axe (21 scans) + keyboard (8 tests)    | axe + keyboard + contrast + contrast + live regions       | +3 tipos                        |
| **Relatório**        | Allure raw results                     | Dashboard com métricas, violações por estágio, ação items | +custom report                  |
| **Bloqueador CI**    | Nenhum                                 | axe violations bloqueiam PR                               | Policy change                   |
| **Front-end pronto** | ❌ 12 ARIA violations abertas          | ✅ All violations fixed                                   | ~2-4 sprints                    |

---

## 🔥 P0: Bloqueadores Imediatos (Semana 1)

### 1.1 Fix Invalid ARIA Roles (lead_info → sales-lead-requirements MFE)

**Violação:** 12 critical/serious roles inválidas

```javascript
// ❌ REMOVE THESE
<div role="header">...</div>      // Not a valid landmark
<div role="stepper">...</div>     // Not in ARIA spec
<div role="title">...</div>       // Use <h1> instead
<input role="input" />            // Native <input> doesn't need role

// ✅ REPLACE WITH
<header>...</header>              // <header> + semantic HTML
<div role="list">...</div>        // Stepper → list (if showing steps)
<h1>...</h1>                      // Use native heading
<input type="text" />             // Native input is accessible
```

**Tester checklist:**

- [ ] Front MFE removes all invalid roles
- [ ] Run `npm run test:a11y:desktop` → all pass in lead_info
- [ ] axe violations drop from 12 → 0

**Timeline:** 2-3 days (front + test validation)

---

### 1.2 Fix WhatsApp Link Accessibility (lead_info)

**Violation:** Missing link name (WCAG 2.4.4)

```javascript
// ❌ BEFORE
<a href="whatsapp://...">
  <img src="whatsapp-icon.svg" alt="" />
</a>

// ✅ AFTER
<a href="whatsapp://..." aria-label="Fale conosco via WhatsApp">
  <img src="whatsapp-icon.svg" alt="" />
</a>
```

**Tester checklist:**

- [ ] Link has descriptive aria-label or text
- [ ] Axe scan passes: link-name ✅

---

### 1.3 Fix Keyboard Tab Order in plan_selection

**Issue:** Button unreachable after 60 Tab presses = WCAG 2.1.1 fail

```javascript
// Likely issue: overflow-hidden or negative tabindex
// Fix: Ensure all interactive elements have tabindex >= 0 (or removed, default 0)

// ❌ REMOVE
<button tabindex="-1">Continuar</button>

// ✅ USE
<button>Continuar</button>  // tabindex defaults to 0
// or explicitly manage focus for complex layouts
<button tabindex="0">Continuar</button>
```

**Diagnostic:**

```bash
# Run keyboard test to identify exact issue
npm run test:keyboard:desktop -- --reporter=html
# Check HTML report for exact "Tab N" where it gets stuck
```

**Tester checklist:**

- [ ] Tab through plan_selection 100+ times without getting stuck
- [ ] Keyboard test passes
- [ ] Focus indicator visible on all focusable elements

---

## 🎯 P1: Extended Baseline (Semanas 2-3)

### 2.1 Complete Axe Baseline Across 5 Funnel Stages

**Current:** only lead_info tested
**Target:** All stages critical-free

**Stages to complete:**

1. ✅ `lead_info` (4 tests) — currently passing (after P0 fixes)
2. 🔄 `vehicle_details` (new scans + keyboard)
3. 🔄 `plan_selection` (after tab order fix)
4. 🔄 `coverages` (new scans)
5. 🔄 `assistances` (new scans)
6. 🔄 `checkout` (payment form a11y)

**Implementation:**

```typescript
// Add to tests/spec/a11y/cotacaoFunnel.a11y.spec.ts

test('@a11y vehicle_details — axe scan desktop', async ({ page }) => {
  await page.goto(TestConfig.urls.quotationUrl);
  // ... complete lead_info flow ...
  await page.fill('input[name="licensePlate"]', 'ABC-1234');
  await page.fill('input[name="zip"]', '01310100');

  const violations = await scanPageA11y(page, { standard: 'wcag21aa' });
  expect(violations).toEqual([]); // or allow documented violations only
});
```

**Reporting:** Each violation logged to Allure with:

- **Impact** (critical/serious/moderate/minor)
- **Rule** (WCAG reference)
- **Affected elements** (CSS selector)
- **Recommended fix**

---

### 2.2 Add Contrast Ratio Validation (WCAG 1.4.3)

**Currently:** axe scans impact:critical/serious only (skips contrast by default)
**Enhancement:** Enable contrast checks

```typescript
// Modify helpers/a11y.ts
export async function scanPageA11y(page: Page, opts?: { standard?: 'wcag2a' | 'wcag21a' | 'wcag21aa' | 'wcag22aa'; includeContrast?: boolean }) {
  const violations = await injectAxe(page);

  // Enable contrast ratio checks (minimum WCAG AA: 4.5:1 normal, 3:1 large)
  const rules = opts?.includeContrast ? ['color-contrast'] : [];

  return violations.filter((v) => {
    if (opts?.standard === 'wcag21aa') {
      return v.impact === 'critical' || v.impact === 'serious' || rules.includes(v.id);
    }
    return true;
  });
}
```

**Test example:**

```bash
npm run test:a11y:desktop  # Runs with contrast checks
# Result: Finds low-contrast text on buttons, links, etc.
```

---

### 2.3 Add Error Message & Live Region Testing

**Current gap:** Validation errors not tested for accessibility

**Affected flows:**

- CAP-02 risk acceptance (error messages)
- Insurance selection validation
- Payment form errors

**Test template:**

```typescript
test('@a11y checkout form — live region updates', async ({ page }) => {
  await page.goto(checkoutUrl);

  // Submit without filling required field
  await page.click('button[type="submit"]');

  // Wait for aria-live region to announce error
  const errorRegion = page.locator('[role="alert"]');
  const errorText = await errorRegion.textContent();

  expect(errorText).toContain('Email é obrigatório');
  expect(await errorRegion.getAttribute('aria-live')).toBe('polite');
  expect(await errorRegion.getAttribute('aria-atomic')).toBe('true');
});
```

**Front-end requirement:**

```html
<!-- Wrap validation errors in aria-live regions -->
<div role="alert" aria-live="polite" aria-atomic="true">Email é obrigatório</div>
```

---

### 2.4 Tablet Profile: Systematic Testing

**Goal:** Ensure touch + reflow accessibility on iPad

**Configuration already exists:** `tablet` profile in [a11yDevices.ts](../config/a11yDevices.ts) (iPad Gen 7, 810×1080)

**Tests to add:**

```typescript
test('@a11y tablet — axe + keyboard + touch-friendly targets', async ({ page, browserName }) => {
  if (browserName !== 'webkit') skip(); // Tablet emulation via WebKit

  // 1. axe scan
  const violations = await scanPageA11y(page);
  expect(violations).toEqual([]);

  // 2. Touch targets ≥ 44×44 px (WCAG 2.1.1)
  const buttons = page.locator('button, [role="button"], a[href]');
  for (const btn of await buttons.all()) {
    const box = await btn.boundingBox();
    expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
  }

  // 3. Portrait + Landscape rotation
  await page.setViewportSize({ width: 810, height: 1080 }); // Portrait
  const portrait = await scanPageA11y(page);
  expect(portrait).toEqual([]);

  await page.setViewportSize({ width: 1080, height: 810 }); // Landscape
  const landscape = await scanPageA11y(page);
  expect(landscape).toEqual([]);
});
```

**Run tablet suite:**

```bash
npm run test:a11y:tablet
```

---

## 📈 P2: Advanced Coverage (Sprint +2)

### 3.1 Contrast Ratio Report by Component

Generate visual report of contrast issues:

```typescript
// scripts/generate-a11y-contrast-report.ts
import { injectAxe } from 'axe-playwright';

async function generateContrastReport() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const violations = await scanPageA11y(page, { includeContrast: true });
  const contrastViolations = violations.filter((v) => v.id === 'color-contrast');

  const report = contrastViolations.map((v) => ({
    element: v.nodes[0].html.slice(0, 100),
    issue: v.description,
    actualRatio: v.nodes[0].any[0].data.contrastRatio, // "2.5:1"
    requiredRatio: '4.5:1 (AA) or 3:1 (18pt+ AA)',
    screenshot: `// captured via Playwright`,
  }));

  fs.writeFileSync('reports/contrast-violations.json', JSON.stringify(report, null, 2));
}
```

---

### 3.2 Screen Reader Testing Protocol (Manual, but Documented)

**VoiceOver (macOS), NVDA (Windows), TalkBack (Android) testing:**

```markdown
## Screen Reader Spot Check — lead_info

### Setup

- Device: macOS + Chrome + VoiceOver
- Test: "User fills lead_info form using only VoiceOver"

### Steps

1. VO+F5: List all form controls → should see 8 fields + hints
2. Tab → field labels read aloud (e.g., "Email, text input")
3. Form instructions announced ("Preencha com seus dados")
4. Error messages interrupt speech ("Email inválido")

### Expected Results

✅ All fields labeled (not just placeholder text)
✅ Required indicators announced (_Email_)
✅ Error messages announced immediately
✅ Hints available via VO+; (semicolon)

### Document findings in: docs/guides/sr-testing-log.md
```

---

### 3.3 Continuous A11y Regression Gate

**Wire violations to CI:**

```yaml
# .github/workflows/a11y-gate.yml
name: A11y Regression Check
on: [pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:a11y:desktop
      - name: Upload Allure report
        uses: actions/upload-artifact@v4
        with:
          name: allure-report
          path: allure-report/
      - name: Comment PR with a11y summary
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('allure-results/summary.json'));
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🔴 A11y violations detected (${results.violations}). See Allure report.`
            });
```

---

## 📋 Front-End Checklist: What to Change

### High Priority (Block MFE merge if not fixed)

| Issue              | Location                              | WCAG  | Fix                                                   | Owner     |
| ------------------ | ------------------------------------- | ----- | ----------------------------------------------------- | --------- |
| Invalid ARIA roles | sales-lead-requirements               | 4.1.2 | Remove role="header/stepper/title", use semantic HTML | @frontend |
| Missing link names | sales-lead-requirements WhatsApp icon | 2.4.4 | Add aria-label="Fale conosco via WhatsApp"            | @frontend |
| Tab order trapped  | plan-selection button                 | 2.1.1 | Remove tabindex="-1" from "Continuar" button          | @frontend |
| Low contrast text  | All buttons/links                     | 1.4.3 | Ensure 4.5:1 ratio on all text                        | @design   |

### Medium Priority (Include in next sprint)

| Issue                             | Location         | WCAG  | Fix                                                   |
| --------------------------------- | ---------------- | ----- | ----------------------------------------------------- |
| Form labels from placeholder only | All input fields | 1.3.1 | Add `<label>` elements, use aria-label as fallback    |
| No error announcement             | CAP-02, checkout | 4.1.3 | Wrap errors in `role="alert"` with aria-live="polite" |
| Touch targets < 44px              | Mobile buttons   | 2.1.1 | Increase button padding/size on touch devices         |
| Skip link missing                 | plan-selection   | 2.4.1 | Add "Skip to main content" link                       |

### Nice-to-Have

- [ ] Focus styles visible and consistent (min 3px outline)
- [ ] Color not the only indicator (use icons + text)
- [ ] Motion reduced support (prefers-reduced-motion media query)

---

## 📊 Comprehensive Accessibility Report Template

**Location:** `reports/a11y-comprehensive-report-YYYY-MM-DD.html`

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Accessibility Report — Youse Quotation Flow</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      .summary {
        background: #f0f0f0;
        padding: 20px;
        border-radius: 8px;
      }
      .violations {
        margin: 20px 0;
      }
      .critical {
        background: #fee;
      }
      .serious {
        background: #ffd7cc;
      }
    </style>
  </head>
  <body>
    <h1>🎯 Accessibility Report — Quotation Funnel</h1>
    <p>Generated: <time>2026-06-30</time></p>

    <section class="summary">
      <h2>Executive Summary</h2>
      <p><strong>Overall Score:</strong> 78/100 (Needs Improvement)</p>
      <dl>
        <dt>Total Tests Run:</dt>
        <dd>29 (21 axe + 8 keyboard)</dd>
        <dt>Pass Rate:</dt>
        <dd>17/29 (59%)</dd>
        <dt>Critical Violations:</dt>
        <dd>4 (must fix before launch)</dd>
        <dt>Serious Violations:</dt>
        <dd>8 (fix in next sprint)</dd>
        <dt>Platforms Covered:</dt>
        <dd>Desktop (Chrome), Tablet (iPad), Mobile (reference)</dd>
      </dl>
    </section>

    <section class="violations">
      <h2>🔴 Critical Issues (P0) — Must Fix</h2>
      <article class="critical">
        <h3>1. Invalid ARIA Role: "header"</h3>
        <p><strong>Impact:</strong> Assistive tech can't navigate page structure</p>
        <p><strong>Affected:</strong> lead_info screen (sales-lead-requirements MFE)</p>
        <p><strong>Fix:</strong> Replace &lt;div role="header"&gt; with &lt;header&gt;</p>
        <p><strong>WCAG:</strong> 4.1.2 Name, Role, Value</p>
      </article>

      <article class="critical">
        <h3>2. Keyboard Focus Trapped in plan_selection</h3>
        <p><strong>Impact:</strong> Keyboard users can't access "Continuar" button</p>
        <p><strong>Affected:</strong> plan-selection MFE</p>
        <p><strong>Fix:</strong> Remove tabindex="-1" from button</p>
        <p><strong>WCAG:</strong> 2.1.1 Keyboard</p>
      </article>

      <article class="critical">
        <h3>3. Missing Link Names (WhatsApp)</h3>
        <p><strong>Impact:</strong> Screen reader users don't know link purpose</p>
        <p><strong>Affected:</strong> lead_info contact link</p>
        <p><strong>Fix:</strong> Add aria-label="Fale conosco via WhatsApp"</p>
        <p><strong>WCAG:</strong> 2.4.4 Link Purpose</p>
      </article>
    </section>

    <section>
      <h2>🟠 Serious Issues (P1) — Next Sprint</h2>
      <p>8 violations identified and documented in Allure report.</p>
    </section>

    <section>
      <h2>📱 Device Coverage</h2>
      <table>
        <tr>
          <th>Device</th>
          <th>Viewport</th>
          <th>Status</th>
          <th>Violations</th>
        </tr>
        <tr>
          <td>Desktop (Chrome)</td>
          <td>1280×800</td>
          <td>✅ Tested</td>
          <td>4 critical</td>
        </tr>
        <tr>
          <td>Desktop Wide</td>
          <td>1920×1080</td>
          <td>✅ Tested</td>
          <td>Same as 1280</td>
        </tr>
        <tr>
          <td>Tablet (iPad)</td>
          <td>810×1080</td>
          <td>✅ Tested</td>
          <td>4 critical (reflow OK)</td>
        </tr>
        <tr>
          <td>Mobile (reference)</td>
          <td>393×851</td>
          <td>📋 Reference only</td>
          <td>See qa-mobile-tests-automation</td>
        </tr>
      </table>
    </section>

    <section>
      <h2>✅ Recommendations</h2>
      <ol>
        <li>Fix 4 P0 violations in lead_info + plan_selection (1 week)</li>
        <li>Expand axe baseline to vehicle_details, coverages, checkout (2 weeks)</li>
        <li>Add contrast ratio testing + error message testing (1 week)</li>
        <li>Gate a11y violations in CI/CD (blocking PRs with regressions)</li>
        <li>Conduct manual screen reader spot-check on P0 screens (2 hours)</li>
      </ol>
    </section>

    <footer>
      <p>Report generated by: qa-e2e-tests-automation (npm run report:a11y:full)</p>
      <p>Test data: Allure report at allure-report/index.html</p>
    </footer>
  </body>
</html>
```

---

## 🚀 Implementation Timeline

| Week       | Deliverable                                  | Owner         |
| ---------- | -------------------------------------------- | ------------- |
| **Week 1** | P0 fixes (ARIA roles, link names, tab order) | Frontend + QA |
| **Week 2** | Complete axe baseline (5 stages)             | QA            |
| **Week 3** | Contrast + error message testing             | QA + Design   |
| **Week 4** | Tablet + keyboard comprehensive test suite   | QA            |
| **Week 5** | CI gate + automated reporting                | DevOps + QA   |

---

## 📚 Quick Command Reference

```bash
# Run a11y tests
npm run test:a11y              # All devices (desktop + tablet)
npm run test:a11y:desktop      # Desktop only
npm run test:a11y:tablet       # Tablet only
npm run test:keyboard          # All devices

# Generate reports
npm run allure:generate         # Allure report
npm run report:a11y:full        # Full accessibility report (to implement)

# View results
npm run allure:open            # Open Allure dashboard
open reports/a11y-report-*.html # Open comprehensive report

# Debug a single test
npx playwright test tests/spec/a11y/cotacaoFunnel.a11y.spec.ts --debug
```

---

## 🤝 Contact & Escalation

- **A11y Questions:** @qa-team
- **Front-end WCAG Issues:** @frontend-team
- **CI/CD Integration:** @devops-team
- **Accessibility Champion:** TBD

---

**Last Updated:** 2026-06-30 | **Status:** Roadmap Draft | **Next Review:** Week 1 (P0 fixes)
