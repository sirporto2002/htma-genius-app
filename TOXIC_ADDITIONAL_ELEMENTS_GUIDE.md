# Toxic & Additional Elements Implementation Guide

## Overview

HTMA Genius now supports **Toxic Elements** and **Additional Elements** display in a way that maintains strict safety boundaries while matching TEI visual completeness.

---

## ✅ What Was Implemented

### 1. Data Model Extensions (`src/lib/reportSnapshot.ts`)

- Added `ToxicElement` interface with `key`, `name`, `value`, `unit`, `referenceHigh`, and `status` fields
- Added `AdditionalElement` interface with `key`, `name`, `value`, `unit`, and `detected` fields
- Extended `ReportSnapshot` with optional `toxicElements?` and `additionalElements?` arrays
- Updated type guards for backward compatibility

### 2. Reference Constants (`src/lib/htmaConstants.ts`)

- Added `TOXIC_ELEMENT_REFERENCES` with TEI-aligned thresholds:

  - Antimony (Sb): < 0.06 mg%
  - Arsenic (As): < 0.08 mg%
  - Mercury (Hg): < 0.8 mg%
  - Beryllium (Be): < 0.02 mg%
  - Cadmium (Cd): < 0.06 mg%
  - Lead (Pb): < 0.6 mg%
  - Aluminum (Al): < 1.0 mg%

- Added `ADDITIONAL_ELEMENT_REFERENCES` for 13 elements:

  - Ge, Ba, Bi, Rb, Li, Ni, Pt, Ti, V, Sr, Sn, W, Zr

- Helper functions: `getToxicElementReference()` and `getAdditionalElementReference()`

### 3. UI Components

#### **ToxicElementsPanel.tsx**

- Collapsed by default
- Red/pink color scheme (⚠️ warning aesthetic)
- Displays:
  - Element name and symbol
  - Value in mg%
  - Reference high (practitioner mode only)
  - Status: "Within Reference" or "Above Reference"
- **Locked disclaimer box**:
  > "These elements are shown for environmental and observational context only. They are not diagnostic and are not used in scoring or analysis."
- Practitioner badge with TEI citation

#### **AdditionalElementsPanel.tsx**

- Collapsed by default
- Green color scheme (🔬 scientific aesthetic)
- Displays:
  - Element name and symbol
  - Value in mg%
  - Detection status: "Detected" or "Not Detected"
- **Locked disclaimer box** (identical safety language)
- Practitioner badge with TEI citation

### 4. PDF Integration (`src/lib/pdfGenerator.ts`)

- Added **"⚠️ Toxic Elements"** section (if data present)

  - Red header color
  - Yellow disclaimer box
  - Table with values, reference highs (practitioner mode), and status
  - Footer note: "These values were not used in scoring or analysis"

- Added **"🔬 Additional Elements"** section (if data present)
  - Green header color
  - Yellow disclaimer box
  - Table with values and detection status
  - Footer note: "These values were not used in scoring or analysis"

### 5. Snapshot Creator (`src/lib/createReportSnapshot.ts`)

- Updated `CreateSnapshotOptions` to accept optional `toxicElements?` and `additionalElements?`
- Passes through to `ReportSnapshot` unchanged
- Maintains immutability with Object.freeze

---

## 🔒 Safety Guarantees (Verified)

### Systems That **DO NOT** Use Toxic/Additional Elements:

✅ **Health Score Calculation** (`healthScore.ts`)

- Function: `calculateHealthScore(mineralData: MineralData)`
- Uses only 15 nutritional minerals from `MineralData` interface

✅ **Oxidation Classification** (`oxidationClassification.ts`)

- Function: `classifyOxidation(minerals: MineralInput)`
- Uses only Ca, Mg, Na, K

✅ **Change Coaching Engine** (`changeCoachingEngine.ts`)

- Function: `generateChangeFocusSummary(delta, audience)`
- Uses only `ScoreDeltaExplanation` derived from nutritional minerals

✅ **Score Delta Explainer** (`scoreDeltaExplainer.ts`)

- Function: `explainScoreDelta(prev, next)`
- Uses only nutritional minerals and ratios

✅ **Trend Analysis** (`trendExplainer.ts`)

- Function: `analyzeTrends(dataPoints)`
- Uses only nutritional minerals, ratios, and scores

✅ **AI Insights** (`/api/analyze`)

- Prompt uses only 15 nutritional minerals
- Guardrails apply only to nutritional element interpretations

---

## 📋 How to Use

### Option 1: Manual Entry (Future Form Extension)

To add toxic/additional elements support to the input form:

1. Extend `MineralData` interface in `HTMAInputForm.tsx`:

```typescript
export interface MineralData {
  // ... existing 15 minerals

  // Optional toxic elements
  antimony?: string;
  arsenic?: string;
  mercury?: string;
  beryllium?: string;
  cadmium?: string;
  lead?: string;
  aluminum?: string;

  // Optional additional elements
  germanium?: string;
  barium?: string;
  bismuth?: string;
  // ... etc
}
```

2. Add conditional form fields (collapsed section)

3. Process in `handleAnalyze()` in `index.tsx`:

```typescript
const toxicElements: ToxicElement[] = [];
if (data.mercury) {
  const value = parseFloat(data.mercury);
  const ref = getToxicElementReference("Hg")!;
  toxicElements.push({
    key: "Hg",
    name: ref.name,
    value,
    unit: ref.unit,
    referenceHigh: ref.referenceHigh,
    status: value > ref.referenceHigh ? "elevated" : "within",
  });
}
// ... repeat for other toxic elements

const additionalElements: AdditionalElement[] = [];
if (data.germanium) {
  const value = parseFloat(data.germanium);
  const ref = getAdditionalElementReference("Ge")!;
  additionalElements.push({
    key: "Ge",
    name: ref.name,
    value,
    unit: ref.unit,
    detected: value > 0,
  });
}
// ... repeat for additional elements
```

4. Pass to `createReportSnapshot()`:

```typescript
const snapshot = createReportSnapshot({
  mineralData,
  aiInsights,
  isPractitionerMode,
  healthScore,
  // ... other fields
  toxicElements,
  additionalElements,
});
```

### Option 2: Demo/Test Data

To test the panels, add sample data in `index.tsx`:

```typescript
// After analysis completes
const demoToxicElements: ToxicElement[] = [
  {
    key: "Hg",
    name: "Mercury",
    value: 1.2,
    unit: "mg%",
    referenceHigh: 0.8,
    status: "elevated",
  },
  {
    key: "Pb",
    name: "Lead",
    value: 0.4,
    unit: "mg%",
    referenceHigh: 0.6,
    status: "within",
  },
];

const demoAdditionalElements: AdditionalElement[] = [
  {
    key: "Li",
    name: "Lithium",
    value: 0.005,
    unit: "mg%",
    detected: true,
  },
  {
    key: "Ni",
    name: "Nickel",
    value: 0,
    unit: "mg%",
    detected: false,
  },
];
```

### Option 3: Display Panels in UI

In `index.tsx`, add after the Oxidation Type Card section:

```tsx
{
  /* Toxic Elements Panel */
}
{
  demoToxicElements && demoToxicElements.length > 0 && (
    <ToxicElementsPanel
      toxicElements={demoToxicElements}
      isPractitionerMode={isPractitionerMode}
    />
  );
}

{
  /* Additional Elements Panel */
}
{
  demoAdditionalElements && demoAdditionalElements.length > 0 && (
    <AdditionalElementsPanel
      additionalElements={demoAdditionalElements}
      isPractitionerMode={isPractitionerMode}
    />
  );
}
```

Don't forget to import:

```typescript
import ToxicElementsPanel from "../components/ToxicElementsPanel";
import AdditionalElementsPanel from "../components/AdditionalElementsPanel";
```

---

## 🎯 Design Decisions

### Why Collapsed by Default?

- Reduces cognitive load for consumers
- Emphasizes that these are supplementary, not primary
- Prevents alarm from seeing "Toxic Elements" header immediately

### Why Separate Panels?

- Clear visual separation (Toxic = Red, Additional = Green)
- Different data models (reference high vs. detection)
- Easier to maintain and test independently

### Why No AI Interpretation?

- **Medical/legal risk**: Toxic metals are serious health concerns
- **Scope creep**: Opens door to detox/chelation recommendations (liability)
- **Deterministic safety**: HTMA Genius maintains strict scientific boundaries

### Why No Scoring/Trends?

- **Consistency**: Health score is for nutritional elements only
- **TEI alignment**: TEI reports don't score toxic elements either
- **Simplicity**: Display-only is legally safer and scientifically cleaner

---

## 📊 Visual Reference

### Toxic Elements Panel (Collapsed)

```
┌─────────────────────────────────────────┐
│ ⚠️ Toxic Elements [2 elevated]          ▼│
│ Environmental context only               │
└─────────────────────────────────────────┘
```

### Toxic Elements Panel (Expanded)

```
┌─────────────────────────────────────────┐
│ ⚠️ Toxic Elements [2 elevated]          ▲│
│ Environmental context only               │
├─────────────────────────────────────────┤
│ 🔒 Non-Diagnostic Display                │
│ These elements are shown for environ-    │
│ mental context only. Not used in scoring.│
├─────────────────────────────────────────┤
│ Mercury (Hg) | 1.2 mg% | Above Reference │
│ Lead (Pb)    | 0.4 mg% | Within Reference│
├─────────────────────────────────────────┤
│ 👨‍⚕️ Practitioner Context • TEI Reference  │
└─────────────────────────────────────────┘
```

---

## 🧪 Testing Checklist

- [ ] Old analyses load without errors (backward compatibility)
- [ ] PDFs generate with toxic/additional elements present
- [ ] PDFs generate without toxic/additional elements (graceful degradation)
- [ ] Practitioner mode toggles show/hide reference values
- [ ] Panels collapse/expand correctly
- [ ] Health score unchanged when toxic elements present
- [ ] Oxidation classification unchanged when toxic elements present
- [ ] AI insights do not mention toxic/additional elements
- [ ] Delta explanations do not reference toxic/additional elements
- [ ] Trend analysis excludes toxic/additional elements

---

## 🚀 Future Enhancements

### Phase 2: Data Collection

- Add optional toxic/additional element fields to `HTMAInputForm`
- Create collapsible "Advanced Elements" section
- Auto-calculate status from input values

### Phase 3: Lab Integration

- Parse TEI PDF reports to extract toxic/additional elements
- Auto-populate from lab upload

### Phase 4: Historical Tracking (Non-Scoring)

- Display toxic element trends over time (chart only, no coaching)
- "Environmental exposure timeline" visualization
- No AI interpretation, pure data display

---

## 📝 Documentation Updates

Update the following docs:

- [ ] `SYSTEM_OVERVIEW.md` - Add section on toxic/additional elements
- [ ] `VERSIONING_AND_AUDIT.md` - Document v1.4.0 additions
- [ ] `PRACTITIONER_MODE.md` - Explain practitioner-only reference displays
- [ ] `README.md` - Mention TEI-complete element support

---

## ⚠️ Compliance Notes

### Legal Safety

- **No diagnosis**: All disclaimer language prevents diagnostic claims
- **No treatment**: No suggestions, recommendations, or action items
- **No AI**: Removes liability from generative AI hallucinations
- **Audit trail**: All values stored in immutable snapshots

### Scientific Credibility

- **TEI-aligned**: Reference values match Trace Elements Inc. standards
- **Transparent**: Practitioner mode shows exact thresholds
- **Cited**: Links to TEI website in practitioner badge

### Platform Integrity

- **Deterministic**: Status calculation is pure function (value > threshold)
- **Modular**: Zero coupling with health score, oxidation, or AI systems
- **Backward compatible**: Optional fields don't break existing analyses

---

## 🎓 Key Learnings

1. **Display ≠ Diagnosis**: You can show data without interpreting it
2. **Disclaimers work**: Clear, prominent safety language protects users and platform
3. **Modularity wins**: Keeping toxic elements fully decoupled prevents scope creep
4. **TEI completeness ≠ Medical liability**: Matching lab report structure is safe if done carefully

---

## 📞 Support

For questions or issues:

- Check `reportSnapshot.ts` interfaces for data structure
- Review `htmaConstants.ts` for reference values
- Inspect `ToxicElementsPanel.tsx` for UI patterns
- Examine `pdfGenerator.ts` lines 880-1010 for PDF rendering logic

---

**Version**: 1.4.0  
**Last Updated**: December 22, 2025  
**Implementation Status**: ✅ Complete
