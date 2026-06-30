# 🎨 Front-End Accessibility Fixes Checklist

**Objetivo:** Mapear todas as mudanças necessárias de acessibilidade por MFE/componente

---

## 🔴 P0: Bloqueadores Críticos (Sprint Atual)

### 1. sales-lead-requirements MFE

**File(s):** `packages/sales-lead-requirements/src/components/*`

#### 1.1 Remove Invalid ARIA Roles

- [ ] **Remove**: `<div role="header">`
  - **Replace with**: `<header>` or `<div role="banner">`
  - **Why:** "header" not valid in ARIA spec; use semantic `<header>` for page headers
  - **WCAG:** 4.1.2

- [ ] **Remove**: `<div role="stepper">`
  - **Replace with**: `<div role="list">` + `<div role="listitem">` for each step
  - **Why:** Stepper is custom pattern; use list semantics
  - **WCAG:** 1.3.1
  - **Test:** `axe.check()` should pass

- [ ] **Remove**: `<div role="title">`
  - **Replace with**: `<h1>`, `<h2>`, etc. (use semantic heading)
  - **Why:** "title" not valid in ARIA; use native headings
  - **WCAG:** 1.3.1

- [ ] **Remove**: `<input role="input" />`
  - **Replace with**: Native `<input type="text" />` (no role needed)
  - **Why:** Native input already has accessible role
  - **WCAG:** 4.1.2

**Validation:**

```bash
cd packages/sales-lead-requirements
npm run lint  # Should pass a11y linter
npm run test:a11y  # Should show 0 violations
```

---

#### 1.2 Fix WhatsApp Link Name

**File:** `packages/sales-lead-requirements/src/components/Contact.tsx` (or similar)

- [ ] Add descriptive label to WhatsApp link

  ```tsx
  // ❌ BEFORE
  <a href="whatsapp://send?phone=...">
    <img src="whatsapp-icon.svg" alt="" />
  </a>

  // ✅ AFTER
  <a
    href="whatsapp://send?phone=..."
    aria-label="Fale conosco via WhatsApp"
    title="Fale conosco via WhatsApp"
  >
    <img src="whatsapp-icon.svg" alt="WhatsApp" />
  </a>
  ```

- [ ] **Test:**
  ```bash
  npm run test:a11y -- --headed
  # Check axe report: "Link names" should have 0 violations
  ```

---

### 2. plan-selection MFE

**File(s):** `packages/plan-selection/src/components/*`

#### 2.1 Fix Keyboard Tab Order — Unreachable Button

**Issue:** "Continuar" button unreachable after 60 Tab presses (WCAG 2.1.1 failure)

- [ ] Check "Continuar" button or parent container for:

  ```tsx
  // ❌ REMOVE negative tabindex
  <button tabindex="-1">Continuar</button>

  // ❌ REMOVE focus-blocking styles
  <div style={{ overflow: 'hidden', height: 0 }}>
    <button>Continuar</button>
  </div>

  // ✅ USE positive tabindex or default
  <button tabindex="0">Continuar</button>
  // or just:
  <button>Continuar</button>
  ```

- [ ] Check parent containers for `pointer-events: none` or `display: none` hiding the button

- [ ] Ensure focus visible indicator is styled:

  ```css
  button:focus,
  button:focus-visible {
    outline: 3px solid #0066cc;
    outline-offset: 2px;
  }
  ```

- [ ] **Test keyboard navigation:**
  ```bash
  npm run test:keyboard:desktop -- --headed
  # Should Tab to button within 100 Tab presses
  ```

---

## 🟠 P1: Extended Baseline (Sprint +1)

### 3. All Form Inputs (Across MFEs)

**Affected:**

- lead_info: email, phone, etc.
- vehicle_details: license plate, ZIP
- risk_acceptance: CPF validation
- checkout: credit card, personal data

#### 3.1 Add Proper Label Elements

```tsx
// ❌ WRONG: Relying on placeholder
<input type="email" placeholder="seu@email.com" />

// ✅ RIGHT: Use <label> + accessible name
<label htmlFor="email-input">
  Email <span aria-label="obrigatório">*</span>
</label>
<input
  id="email-input"
  type="email"
  placeholder="seu@email.com"
  aria-required="true"
  aria-describedby="email-hint"
/>
<small id="email-hint">Usaremos para contato</small>
```

- [ ] All form inputs have associated `<label>` elements
- [ ] Labels use `htmlFor` pointing to input `id`
- [ ] Required fields marked with `aria-required="true"`
- [ ] Helper text uses `aria-describedby`

---

#### 3.2 Add Error Message Accessibility

**File:** Validation error handling in all forms

```tsx
// ❌ WRONG: Error appears but not announced
setError('Email inválido');
// ... renders: <span>{error}</span>

// ✅ RIGHT: Error announced via aria-live
<div id="error-region" role="alert" aria-live="polite" aria-atomic="true">
  {error && `❌ ${error}`}
</div>;
```

- [ ] All validation errors wrapped in `role="alert"` region
- [ ] Error region has `aria-live="polite"` + `aria-atomic="true"`
- [ ] Errors placed **before** submit button (in DOM order)
- [ ] Test with screen reader:
  ```bash
  # On macOS: VO+F5 to list all alerts/live regions
  # Should hear error message immediately upon validation
  ```

---

#### 3.3 Add Helper Text & Hints

**Affected:** All fields with hints (CEP format, CPF format, etc.)

```tsx
// Example: CEP field with format hint
<label htmlFor="cep">
  CEP
  <span aria-label="obrigatório">*</span>
</label>
<input
  id="cep"
  type="text"
  placeholder="00000-000"
  aria-describedby="cep-hint"
  pattern="[0-9]{5}-?[0-9]{3}"
/>
<small id="cep-hint">
  Formato: 12345-678 (use hífen ou números)
</small>
```

- [ ] All fields with constraints have hints
- [ ] Hints linked via `aria-describedby`
- [ ] Placeholder NOT used as substitute for label
- [ ] Format examples provided (e.g., "000.000.000-00" for CPF)

---

### 4. plan-selection, coverages, assistances MFEs

#### 4.1 Add Skip Links (Keyboard Navigation Aid)

**For each screen with long content:**

```tsx
<a href="#main-content" className="sr-only">
  Pular para conteúdo principal
</a>

<main id="main-content">
  {/* Screen content */}
</main>

// CSS: Hide skip link until focused
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

- [ ] Skip link added to top of page
- [ ] Skip link focuses `#main-content` on click
- [ ] Skip link visible on `:focus` only
- [ ] Test: Press Tab once → skip link appears

---

#### 4.2 Ensure Touch Targets ≥ 44×44 px (Tablet)

**Affected:** All clickable elements (buttons, links, checkboxes, radio buttons)

```tsx
// ✅ GOOD: Minimum 44×44 px
<button style={{ padding: '12px 16px', minHeight: '44px' }}>
  Continuar
</button>

// ❌ AVOID: Too small for touch
<button style={{ padding: '4px 8px' }}>
  Continuar
</button>
```

- [ ] All buttons ≥ 44×44 px (use padding + minHeight)
- [ ] All clickable elements have adequate spacing
- [ ] Test with tablet emulation:
  ```bash
  npm run test:a11y:tablet -- --headed
  # Verify all targets reachable with large fingers
  ```

---

#### 4.3 Add Focus Visible Styles (All Interactive Elements)

**Global style rule:**

```css
/* Clear browser default, then apply custom */
button:focus,
a:focus,
input:focus,
select:focus,
textarea:focus {
  outline: none;
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 3px solid #0066cc; /* Brand color */
  outline-offset: 2px;
}

/* Ensure visible on both light & dark backgrounds */
@media (prefers-color-scheme: dark) {
  button:focus-visible,
  a:focus-visible,
  input:focus-visible {
    outline-color: #66b3ff; /* Lighter blue */
  }
}
```

- [ ] Focus outline visible on all interactive elements
- [ ] Outline at least 3px thick
- [ ] Contrast ratio ≥ 3:1 against background
- [ ] Test: Tab through page → outline always visible

---

### 5. Checkout MFE (Payment Form)

#### 5.1 Credit Card Field Accessibility

```tsx
// ✅ GOOD
<fieldset>
  <legend>Cartão de Crédito</legend>

  <label htmlFor="card-number">Número do Cartão *</label>
  <input id="card-number" type="text" inputMode="numeric" placeholder="1234 5678 9012 3456" aria-describedby="card-format-hint" />
  <small id="card-format-hint">16 dígitos sem espaços</small>

  <label htmlFor="card-expiry">Validade (MM/AA) *</label>
  <input id="card-expiry" type="text" inputMode="numeric" placeholder="MM/AA" aria-describedby="card-expiry-hint" />
  <small id="card-expiry-hint">Mês/Ano (ex: 12/25)</small>

  <label htmlFor="card-cvv">CVV *</label>
  <input id="card-cvv" type="password" inputMode="numeric" placeholder="•••" aria-describedby="card-cvv-hint" />
  <small id="card-cvv-hint">3 dígitos no verso</small>
</fieldset>
```

- [ ] Use `<fieldset>` + `<legend>` for card form grouping
- [ ] All card fields have labels
- [ ] CVV field uses `type="password"` to obscure input
- [ ] Format hints provided (aria-describedby)
- [ ] Error messages in live region

#### 5.2 Payment Terms Checkbox

```tsx
// ✅ GOOD
<label>
  <input
    type="checkbox"
    name="terms"
    required
    aria-required="true"
    aria-describedby="terms-details"
  />
  Concordo com os <a href="/terms">Termos de Serviço</a>
  <span aria-label="obrigatório">*</span>
</label>
<small id="terms-details">Leia antes de continuar</small>
```

- [ ] Checkbox label includes link to full terms
- [ ] Checkbox marked as `aria-required="true"`
- [ ] Error if unchecked announced in live region

---

## 🎯 P2: Nice-to-Have (Sprint +2)

### 6. Color & Contrast Improvements

#### 6.1 Audit Color Contrast

**WCAG AA Requirements:**

- Normal text: 4.5:1 ratio
- Large text (18pt+ or 14pt+ bold): 3:1 ratio
- UI components: 3:1 ratio

- [ ] Test with tool: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ ] All text ≥ 4.5:1 contrast
- [ ] All buttons/links ≥ 3:1 contrast
- [ ] Don't rely on color alone for meaning (add icons/text)

**Example: Status indicators**

```tsx
// ❌ WRONG: Color only
<div style={{ color: 'red' }}>Erro</div>

// ✅ RIGHT: Color + icon + text
<div style={{ color: 'red' }}>
  ❌ Erro na validação
</div>
```

---

#### 6.2 Support Reduced Motion

```css
/* Disable animations for users with motion sensitivity */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] Animations respect `prefers-reduced-motion`
- [ ] Test: System Settings → Accessibility → Display → Reduce Motion
- [ ] Page still functional with animations disabled

---

### 7. Semantic HTML Improvements

**Throughout all MFEs:**

```tsx
// ❌ DIV soup (no semantics)
<div onClick={handleClick}>Link</div>
<div>Heading</div>
<div>Button</div>

// ✅ Semantic HTML
<a href="/path">Link</a>
<h2>Heading</h2>
<button onClick={handleClick}>Button</button>
```

- [ ] Use `<button>` for buttons (not `<div>` + click handler)
- [ ] Use `<a>` for navigation links
- [ ] Use `<h1>`, `<h2>`, etc. for headings (never skip levels)
- [ ] Use `<label>` for form inputs
- [ ] Use `<fieldset>` + `<legend>` for grouped forms
- [ ] Use `<main>`, `<nav>`, `<aside>`, `<footer>` landmarks

---

## 🧪 Testing Checklist

### Automated Tests (Run Before PR)

```bash
# Full a11y suite across all devices
npm run test:a11y

# Keyboard navigation only
npm run test:keyboard

# Generate report
npm run report:a11y

# View Allure results
npm run allure:open
```

**Expected Results:**

- ✅ 0 axe critical violations
- ✅ 0 keyboard navigation failures
- ✅ All 5 funnel stages testable with keyboard only

---

### Manual Testing (Before Release)

**Device:** macOS + Chrome + VoiceOver

1. **Keyboard-only navigation:**
   - [ ] Tab through entire flow
   - [ ] All interactive elements reachable
   - [ ] Focus indicator visible
   - [ ] No focus traps

2. **Screen reader (VoiceOver):**
   - [ ] VO+F5: List all headings → 8+ headings found
   - [ ] VO+U: List all form controls → 15+ found
   - [ ] VO+?: List all buttons → 10+ found
   - [ ] Errors announced when submitting invalid form
   - [ ] Success messages announced

3. **Zoom 200%:**
   - [ ] No content cut off
   - [ ] Form still usable
   - [ ] No horizontal scroll needed

4. **Tablet (iPad):**
   - [ ] All buttons ≥ 44×44 px
   - [ ] No accidental clicks
   - [ ] Landscape orientation works
   - [ ] Touch targets adequate

---

## 📋 PR Checklist for Reviewers

Before merging PR with a11y changes:

- [ ] Automated a11y tests pass (0 violations)
- [ ] Keyboard navigation tested (all elements reachable)
- [ ] Focus styles visible + styled
- [ ] Form labels present + associated correctly
- [ ] Error messages in live regions
- [ ] No placeholder-only labels
- [ ] Semantic HTML used (no div soup)
- [ ] ARIA roles valid (if used)
- [ ] Contrast ≥ 4.5:1 for text
- [ ] Skip links present on long pages
- [ ] Touch targets ≥ 44×44 px (if mobile/tablet)
- [ ] Allure report attached (showing 0 violations)

---

## 📞 Questions / Escalation

**Can't decide how to fix something?**

1. Check [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
2. Ask #qa-accessibility-team (Slack)
3. Check this checklist for similar pattern
4. Escalate to Design + QA if unsure

**Need to discuss timeline?**

- Contact @qa-team + @frontend-team lead
- P0 fixes must be done before PR merge (blocks CI)
- P1 fixes target sprint +1
- P2 fixes are nice-to-have

---

**Last Updated:** 2026-06-30 | **Status:** Active Implementation | **Owner:** @qa-team + @frontend-team
