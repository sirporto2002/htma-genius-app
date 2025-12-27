# TEI Interpretation Principles Integration Guide

## Overview

This guide documents the integration of **Trace Elements Inc. (TEI) authoritative framing text** into HTMA Genius. These principles are used exclusively for framing, education, guardrails, and trust signals — **never for computational logic**.

---

## 🎯 Purpose

The TEI interpretation principles serve four specific functions:

### 1️⃣ Interpretation Guardrails & Disclaimers (HIGH VALUE)

**What**: Standardized disclaimer language anchored to the lab's own philosophy

**Why**: Strengthens credibility, reduces liability, aligns platform with TEI's interpretive approach

**Where**:

- PDF report disclaimers
- Interpretation guardrails system
- Legal/compliance documentation

**Example**:

```
"The reference intervals should not be considered as absolute limits
for determining deficiency, toxicity or acceptance."
— Trace Elements Inc.
```

### 2️⃣ Practitioner Education Panels (MEDIUM–HIGH VALUE)

**What**: Collapsed "Learn more" sections in practitioner mode

**Why**: Educates practitioners on how to think (not what to prescribe), builds trust

**Where**:

- ToxicElementsPanel → "About Toxic Elements"
- AdditionalElementsPanel → "About Additional Elements"
- Future: "About Ratios", "Understanding Reference Intervals"

**Important**: These are static reference text, not AI-generated, not personalized

### 3️⃣ Ratio & Toxic Element Positioning (HIGH VALUE)

**What**: Scientific positioning statements that explain TEI's interpretive philosophy

**Why**: Validates design decisions (e.g., toxic elements are display-only, not scored)

**Where**:

- Toxic elements section disclaimers
- Additional ratios context
- System overview documentation

**Example**:

```
"As noted by Trace Elements Inc., toxic and additional ratios are reported
for contextual and research purposes and are not used for scoring or diagnosis."
```

### 4️⃣ User Manual & Onboarding (MEDIUM VALUE)

**What**: Educational content for consumers learning how HTMA differs from blood tests

**Why**: Manages expectations, explains "normal/abnormal" thinking doesn't apply

**Where**:

- User manual
- "How to read your HTMA report" guides
- Intro screens before first analysis

---

## 📁 Files Created/Modified

### NEW: `teiInterpretationPrinciples.ts`

**Location**: `src/lib/teiInterpretationPrinciples.ts`

**Purpose**: Single source of truth for TEI authoritative framing text

**Contents**:

- `TEI_PRINCIPLES` object with 9 sections:
  - `levels` - How mineral levels are reported (mg% = ppm)
  - `nutritionalElements` - Essential elements for biological functions
  - `toxicElements` - Heavy metals interfere with biochemical function
  - `additionalElements` - Possibly essential, still being researched
  - `ratios` - How to calculate ratios (with example)
  - `significantRatios` - Synergistic relationships affect metabolism
  - `toxicRatios` - Elevated toxics may not show symptoms, cause antagonism
  - `additionalRatios` - Research-only, not for clinical evaluation
  - `referenceIntervals` - Guidelines, not absolute limits (CRITICAL)

**Helper Functions**:

```typescript
getTEIDisclaimer(type: "referenceIntervals" | "toxicRatios" | "additionalRatios"): string
getTEIPractitionerContext(topic: "ratios" | "toxicElements" | "additionalElements" | "referenceIntervals"): { title, content }
getAllTEIPrinciplesText(): string
```

**Safety Warning**: ⚠️ DO NOT use this text for:

- Generating AI insights
- Creating scoring thresholds
- Inferring health conditions
- Suggesting medical actions

---

### MODIFIED: `interpretationGuardrails.ts`

**Changes**:

1. Imported `TEI_PRINCIPLES`
2. Added `TEI_REFERENCE_DISCLAIMER` constant
3. Enhanced `applyGuardrails()` to include TEI reference intervals disclaimer in PDF outputs

**Impact**:

- All PDF reports now include TEI's authoritative language about reference intervals
- Reduces liability by using lab's own framing
- Strengthens scientific credibility

**Example Output**:

```
Recommendations:
- Consider discussing these patterns with a qualified practitioner...
- Note: The reference intervals should not be considered as absolute limits
  for determining deficiency, toxicity or acceptance. — Trace Elements Inc.
- This content is for educational purposes only and is not intended to diagnose...
```

---

### MODIFIED: `pdfGenerator.ts`

**Changes**:

1. Imported `getTEIDisclaimer` helper
2. Added TEI toxic ratios disclaimer to toxic elements section (if present)

**Impact**:

- PDF reports with toxic elements include TEI's explanation of how toxic minerals work
- Manages expectations: "individuals with elevated toxic levels may not always exhibit clinical symptoms"
- Positions toxic elements as contextual, not diagnostic

**Example Output**:

```
[Toxic Elements Table]

Note: It is important to note that individuals with elevated toxic levels may not
always exhibit clinical symptoms associated with those particular toxic minerals.
However, research has shown that toxic minerals can also produce an antagonistic
effect on various essential minerals eventually leading to disturbances in their
metabolic utilization.
— Trace Elements Inc.
```

---

### MODIFIED: `ToxicElementsPanel.tsx`

**Changes**:

1. Imported `getTEIPractitionerContext`
2. Added state for `showTEIContext`
3. Added collapsible "About Toxic Elements" education section (practitioner mode only)
4. Added CSS for TEI education panel

**Impact**:

- Practitioners can click "ℹ️ About Toxic Elements" to see TEI's official explanation
- Static text, not AI-generated
- Builds trust by showing lab's own language

**UI Example**:

```
┌──────────────────────────────────────────┐
│ Practitioner Context • Non-Actionable    │
│ • TEI Reference                          │
├──────────────────────────────────────────┤
│ ℹ️ About Toxic Elements              ▶  │
├──────────────────────────────────────────┤
│ The toxic elements or "heavy metals"    │
│ are well-known for their interference   │
│ upon normal biochemical function...     │
│                                          │
│ — Trace Elements Inc.                   │
└──────────────────────────────────────────┘
```

---

### MODIFIED: `AdditionalElementsPanel.tsx`

**Changes**:

1. Imported `getTEIPractitionerContext`
2. Added state for `showTEIContext`
3. Added collapsible "About Additional Elements" education section (practitioner mode only)
4. Added CSS for TEI education panel

**Impact**:

- Practitioners can click "ℹ️ About Additional Elements" to see TEI's official explanation
- Clarifies these are "possibly essential", still being researched
- Manages expectations: research-oriented, not actionable

---

## 🔒 Safety Boundaries (CRITICAL)

### ✅ CORRECT USES:

- **Disclaimers** → PDF footers, UI notices
- **Education** → Practitioner "Learn more" panels
- **Positioning** → Explaining why toxic elements aren't scored
- **Onboarding** → User manual, intro screens

### ❌ FORBIDDEN USES:

- **Algorithms** → DO NOT parse this text to create scoring logic
- **AI Prompts** → DO NOT feed this into OpenAI/Claude for personalized insights
- **Medical Inference** → DO NOT use to diagnose or suggest treatments
- **Dynamic Logic** → DO NOT use to set thresholds or reference ranges

---

## 🎨 UI/UX Design

### Practitioner Mode Education Panels

**Design Pattern**: Collapsible info section with TEI attribution

**Visual Style**:

- Gray background (`#f8f9fa`)
- Info icon (ℹ️)
- Right-aligned arrow (▶) rotates to (▼) when expanded
- Attribution: "— Trace Elements Inc." (right-aligned, italic)

**Behavior**:

- Collapsed by default
- Click to expand (does not expand parent panel)
- Event propagation stopped (`e.stopPropagation()`)

**Accessibility**:

- `role="button"` on clickable elements
- Keyboard support (Enter/Space keys)
- `tabIndex={0}` for keyboard navigation

---

## 📊 Integration Map

```
teiInterpretationPrinciples.ts
    ├── interpretationGuardrails.ts
    │   └── pdfGenerator.ts (adds disclaimers to PDF)
    ├── ToxicElementsPanel.tsx (practitioner education)
    └── AdditionalElementsPanel.tsx (practitioner education)

Future integrations:
    ├── User Manual (getAllTEIPrinciplesText())
    ├── Onboarding screens
    └── About/Help pages
```

---

## 🧪 Testing Checklist

### PDF Generation

- [ ] Generate PDF with toxic elements → TEI toxic ratios disclaimer appears
- [ ] Generate PDF without toxic elements → no toxic disclaimer (clean)
- [ ] Verify TEI reference intervals disclaimer in recommendations section
- [ ] Confirm disclaimers are properly formatted and attributed

### UI - Practitioner Mode

- [ ] ToxicElementsPanel shows "ℹ️ About Toxic Elements" button
- [ ] Click button → panel expands with TEI text and attribution
- [ ] AdditionalElementsPanel shows "ℹ️ About Additional Elements" button
- [ ] Click button → panel expands with TEI text and attribution
- [ ] Verify collapsing works (click again to hide)
- [ ] Verify keyboard navigation (Tab to button, Enter to toggle)

### UI - Consumer Mode

- [ ] ToxicElementsPanel does NOT show TEI education section
- [ ] AdditionalElementsPanel does NOT show TEI education section
- [ ] Only "Practitioner Context" badge is hidden

### TypeScript Compilation

- [ ] `teiInterpretationPrinciples.ts` - 0 errors
- [ ] `interpretationGuardrails.ts` - 0 errors
- [ ] `pdfGenerator.ts` - 0 errors
- [ ] `ToxicElementsPanel.tsx` - 0 errors
- [ ] `AdditionalElementsPanel.tsx` - 0 errors

### Safety Verification

- [ ] TEI text is NOT used in `healthScore.ts`
- [ ] TEI text is NOT used in `oxidationClassification.ts`
- [ ] TEI text is NOT used in `ratioEngine.ts`
- [ ] TEI text is NOT passed to OpenAI API
- [ ] TEI text is NOT used to set thresholds in `htmaConstants.ts`

---

## 📈 Business Impact

### ✅ Increased Scientific Credibility

- Platform now uses lab's own language (not ad-hoc wording)
- Practitioners recognize TEI's authoritative framing
- Aligns with established HTMA interpretation philosophy

### ✅ Reduced Legal Liability

- Reference intervals disclaimer: "not absolute limits"
- Toxic elements disclaimer: "may not always exhibit symptoms"
- Clear separation: display vs. diagnosis

### ✅ Practitioner Trust

- Education panels show transparency
- TEI attribution builds confidence
- Static text (not AI) = reliable

### ✅ Commercial Readiness

- Legal positioning strengthened
- Compliance documentation improved
- Professional appearance enhanced

---

## 🔮 Future Enhancements

### Potential Additions

1. **"About Ratios" Education Panel** (practitioner mode)

   - Use `getTEIPractitionerContext("ratios")`
   - Add to ratio display sections

2. **"Understanding Reference Intervals" Onboarding**

   - Show before first analysis
   - Use `getTEIPractitionerContext("referenceIntervals")`
   - Manage consumer expectations

3. **User Manual Static Page**

   - Use `getAllTEIPrinciplesText()`
   - Full TEI interpretation philosophy
   - Link from help/about pages

4. **API Documentation**
   - Include TEI principles in developer docs
   - Show how HTMA Genius aligns with lab standards

---

## 📝 Maintenance Notes

### Updating TEI Text

If TEI updates their interpretation principles:

1. Edit `src/lib/teiInterpretationPrinciples.ts` only
2. Do NOT change function signatures
3. Verify all consuming files still compile
4. Test PDF and UI integration
5. Update `Last updated:` date in file header

### Adding New Sections

To add new TEI sections (e.g., "minerals", "detoxification"):

1. Add to `TEI_PRINCIPLES` object
2. Add helper function if needed (e.g., `getTEIMineralsContext()`)
3. Export new function
4. Import and use in target component
5. Update this guide

---

## 🎯 Key Takeaways

1. **TEI principles are framing, not logic** — never use for algorithms
2. **High credibility, zero risk** — when used correctly
3. **Practitioner trust signal** — shows lab alignment
4. **Legal defense** — uses lab's own disclaimer language
5. **Static, not dynamic** — no AI, no personalization
6. **Education, not prescription** — teaches how to think

---

**Version**: 1.0.0  
**Last Updated**: December 22, 2025  
**Author**: HTMA Genius Platform Team  
**Status**: Production-ready
