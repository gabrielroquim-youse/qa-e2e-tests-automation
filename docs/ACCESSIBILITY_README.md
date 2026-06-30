# 🎯 Accessibility Testing & Improvement Program

**Overview:** Comprehensive accessibility (WCAG 2.1 AA) improvement program for Youse Quotation Flow.

---

## 📚 Documents Created (Read in Order)

### 1. **For Leadership/Product** 📊

👉 **[ACCESSIBILITY_PROGRAM_EXECUTIVE_SUMMARY.md](ACCESSIBILITY_PROGRAM_EXECUTIVE_SUMMARY.md)**

- Business case + ROI
- 5-week timeline with phase breakdown
- Success metrics + risks
- Team assignments + effort estimates

**Read if:** You're allocating budget, team, or timeline

---

### 2. **For QA/Testers** 🧪

👉 **[docs/guides/ACCESSIBILITY_IMPROVEMENT_ROADMAP.md](docs/guides/ACCESSIBILITY_IMPROVEMENT_ROADMAP.md)**

- P0/P1/P2 issue breakdown
- Complete test strategy (axe, keyboard, contrast, live regions)
- Device profiles (desktop, tablet, mobile)
- Automated + manual testing protocols
- CI/CD integration plan

**Read if:** You're testing accessibility or fixing violations

---

### 3. **For Frontend Developers** 🎨

👉 **[docs/guides/FRONTEND_A11Y_CHECKLIST.md](docs/guides/FRONTEND_A11Y_CHECKLIST.md)**

- P0 blocker fixes (what to change, how, why)
- P1 extended fixes (form labels, error messages, skip links)
- P2 nice-to-have (contrast, reduced motion, semantic HTML)
- Testing checklist for each MFE
- PR review checklist

**Read if:** You're implementing accessibility fixes

---

## 🚀 Quick Start

### Run A11y Tests

```bash
# Full suite (desktop + tablet)
npm run test:a11y

# Desktop only
npm run test:a11y:desktop

# Tablet only (iPad emulation)
npm run test:a11y:tablet

# Keyboard navigation
npm run test:keyboard
```

### Generate Reports

```bash
# HTML report (opens in browser)
npm run report:a11y

# JSON report (for CI/CD integration)
npm run report:a11y:json

# Markdown report (for documentation)
npm run report:a11y:md

# All formats
npm run report:a11y:all
```

### View Results

```bash
# Open Allure dashboard
npm run allure:open

# Open generated report
open ./reports/a11y-report-$(date +%Y-%m-%d).html
```

---

## 📊 Current State vs Target

| Aspect             | Current (59%)               | Target (100%)                                        | How                                       |
| ------------------ | --------------------------- | ---------------------------------------------------- | ----------------------------------------- |
| **Violations**     | 4 critical, 8 serious       | 0 violations                                         | Fix ARIA roles, tab order, link names     |
| **Devices**        | Desktop ✅ Tablet partial   | Desktop ✅ Tablet ✅                                 | Add tablet-specific tests + touch targets |
| **Test Coverage**  | 21 axe + 8 keyboard         | 50+ tests (axe + keyboard + contrast + live regions) | Expand test suite                         |
| **Reporting**      | Manual Allure raw           | Auto HTML dashboard + metrics                        | `npm run report:a11y`                     |
| **CI Gate**        | None                        | Blocks PRs with violations                           | GitHub Actions workflow                   |
| **Tablet Support** | Emulated (not fully tested) | Full portrait + landscape coverage                   | `npm run test:a11y:tablet`                |

---

## 🎯 What's Already Working

✅ **Axe-core integration** — Automated WCAG 2.0/2.1 scans  
✅ **Keyboard navigation tests** — Tab/Enter flow validation  
✅ **Allure reporting** — Test evidence captured  
✅ **Device profiles** — Desktop, Tablet, Mobile configs defined  
✅ **Helper functions** — `scanPageA11y()`, `navigateByKeyboard()`

---

## 🔴 What Needs Fixing (P0 Blockers)

### Issue 1: Invalid ARIA Roles (sales-lead-requirements MFE)

```
❌ role="header"       → ✅ Use <header> or remove
❌ role="stepper"      → ✅ Use role="list" or remove
❌ role="title"        → ✅ Use <h1>, <h2>, etc.
❌ input role="input"  → ✅ Native <input> has role already
```

**Impact:** 12 critical violations blocking accessibility  
**Frontend Fix:** 2-3 hours  
**QA Validation:** `npm run test:a11y:desktop`

---

### Issue 2: Keyboard Focus Trapped (plan-selection MFE)

```
❌ <button tabindex="-1">Continuar</button>
✅ <button>Continuar</button>
```

**Impact:** Keyboard users can't reach "Continuar" button  
**Frontend Fix:** 1 hour  
**QA Validation:** `npm run test:keyboard:desktop --headed`

---

### Issue 3: Missing Link Name (lead_info)

```
❌ <a href="whatsapp://..."><img src="icon.svg" alt="" /></a>
✅ <a href="whatsapp://..." aria-label="Fale conosco via WhatsApp">
     <img src="icon.svg" alt="" />
   </a>
```

**Impact:** Screen reader users don't know link purpose  
**Frontend Fix:** 30 min  
**QA Validation:** `npm run test:a11y:desktop` → check link-name violations

---

## 📱 Tablet Testing (New)

```bash
# Run tablet-specific a11y tests
npm run test:a11y:tablet

# What's tested:
# - axe scans at iPad resolution (810×1080)
# - Touch target sizes ≥ 44×44 px
# - Keyboard navigation on tablet
# - Portrait + landscape orientations
```

**Device Profile:** iPad Gen 7 (810×1080)  
**Configuration:** [tests/config/a11yDevices.ts](tests/config/a11yDevices.ts)

---

## 📈 Metrics Dashboard

After running tests, view:

```bash
# Generate comprehensive report
npm run report:a11y

# Report shows:
# - Pass/fail rate
# - Critical + serious violations
# - Affected elements (HTML snippets)
# - Device coverage (desktop/tablet/mobile)
# - Recommendations (P0/P1/P2)
```

**Sample output location:** `reports/a11y-report-2026-06-30.html`

---

## 🔧 Implementation Phases

### **Phase 1: P0 Fixes** (Week 1)

- Fix 4 critical violations
- Frontend implements fixes
- QA validates via axe scans

### **Phase 2: Extended Baseline** (Weeks 2-3)

- Complete axe scans (all 5 funnel stages)
- Add form label accessibility
- Add error message live regions
- Add contrast ratio validation

### **Phase 3: Tablet & UX** (Week 4)

- Full tablet testing
- Touch target validation
- Keyboard navigation on tablet
- Screen reader spot-check (manual)

### **Phase 4: CI Integration** (Week 5)

- Wire a11y gate to GitHub Actions
- Auto-comment on PRs with violations
- Generate automated reports
- Team training

---

## 👥 Team Roles

| Role              | Responsibility                         | Tools                                                                |
| ----------------- | -------------------------------------- | -------------------------------------------------------------------- |
| **QA Automation** | Write/run a11y tests, generate reports | `npm run test:a11y`, `npm run report:a11y`                           |
| **Frontend Dev**  | Implement WCAG 2.1 AA fixes            | [FRONTEND_A11Y_CHECKLIST.md](docs/guides/FRONTEND_A11Y_CHECKLIST.md) |
| **Design**        | Audit contrast ratios, review fixes    | Contrast checker tools                                               |
| **DevOps**        | Set up CI/CD gate                      | GitHub Actions workflow                                              |

---

## 📖 Key Documents by Use Case

**Need to fix something?**
→ [FRONTEND_A11Y_CHECKLIST.md](docs/guides/FRONTEND_A11Y_CHECKLIST.md)

**Need to test?**
→ [docs/guides/ACCESSIBILITY_IMPROVEMENT_ROADMAP.md](docs/guides/ACCESSIBILITY_IMPROVEMENT_ROADMAP.md)

**Need timeline + business case?**
→ [ACCESSIBILITY_PROGRAM_EXECUTIVE_SUMMARY.md](ACCESSIBILITY_PROGRAM_EXECUTIVE_SUMMARY.md)

**Need to understand what's failing?**
→ Run `npm run test:a11y` → open `npm run allure:open`

**Need to generate a report?**
→ `npm run report:a11y`

---

## ✅ Success Criteria

- [ ] 0 critical axe violations across all stages
- [ ] 100% keyboard navigable (all interactive elements reachable)
- [ ] Tablet tests passing (portrait + landscape)
- [ ] All forms have accessible labels
- [ ] All errors announced via live regions
- [ ] Contrast ≥ 4.5:1 for all text
- [ ] CI gate blocks PRs with violations
- [ ] Automated report generated with each test run
- [ ] Team trained on WCAG 2.1 AA patterns

---

## 🚦 Current Blockers → P0 Fixes

### blocker 1: Invalid ARIA roles (12 violations)

**Owners:** Frontend (sales-lead-requirements MFE)  
**Timeline:** 2-3 days  
**Validation:** `npm run test:a11y:desktop` → 0 violations ✓

### Blocker 2: Keyboard focus trapped (1 violation)

**Owner:** Frontend (plan-selection MFE)  
**Timeline:** 1 day  
**Validation:** `npm run test:keyboard:desktop --headed` ✓

### Blocker 3: Missing link names (1 violation)

**Owner:** Frontend (lead_info screen)  
**Timeline:** 1 hour  
**Validation:** `npm run test:a11y:desktop` → link-name ✓

---

## 💡 Tips for Success

1. **Start with the roadmap:** [ACCESSIBILITY_IMPROVEMENT_ROADMAP.md](docs/guides/ACCESSIBILITY_IMPROVEMENT_ROADMAP.md) covers everything
2. **P0 first:** Fix critical violations before moving to P1
3. **Test often:** Run `npm run test:a11y` after each change
4. **Check reports:** `npm run allure:open` to see exact violations
5. **Tablet matters:** Test on iPad profile, not just desktop
6. **Manual validation:** Screen reader testing catches things axe misses

---

## 🔗 Useful Links

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Axe DevTools](https://www.deque.com/axe/devtools/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [VoiceOver Testing (Mac)](https://www.apple.com/voiceover/info/) — Cmd+F5

---

## 🤝 Questions?

- **"What should I fix first?"** → Read [FRONTEND_A11Y_CHECKLIST.md](docs/guides/FRONTEND_A11Y_CHECKLIST.md) P0 section
- **"How do I test this?"** → `npm run test:a11y` or `npm run test:keyboard`
- **"What's the timeline?"** → See [ACCESSIBILITY_PROGRAM_EXECUTIVE_SUMMARY.md](ACCESSIBILITY_PROGRAM_EXECUTIVE_SUMMARY.md)
- **"How do I know if it's fixed?"** → Run `npm run report:a11y` → check violations = 0

---

## 📊 Latest Status

| Metric              | Status            | Details                                     |
| ------------------- | ----------------- | ------------------------------------------- |
| **P0 Violations**   | 🔴 4 critical     | ARIA roles, keyboard, link names            |
| **Axe Score**       | 59% (17/29 tests) | lead_info passing; others blocked           |
| **Tablet Coverage** | 📋 Partial        | Config exists, tests to be completed        |
| **Reports**         | ✅ Auto-generated | `npm run report:a11y`                       |
| **Timeline**        | 📅 5 weeks        | Week 1 P0, Week 2-3 P1, Week 4-5 automation |

---

**Last Updated:** 2026-06-30  
**Status:** Ready for Implementation  
**Version:** 1.0

For detailed implementation → See specific documents linked above.
