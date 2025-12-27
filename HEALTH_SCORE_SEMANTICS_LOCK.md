# Health Score Semantics Lock - Implementation Summary

## Overview

The Health Score semantics have been **locked and centralized** across the HTMA Genius application to ensure clinical consistency, auditability, and governance. All score-related definitions, weights, ranges, interpretations, and disclaimers are now managed from a single source of truth: `src/lib/healthScoreSemantics.ts`.

## Objective

- **Ensure clinical consistency**: Score meanings never vary based on context or practitioner mode
- **Enable auditability**: All score semantics are version-tracked and immutable
- **Prevent semantic drift**: Central definitions prevent ad-hoc interpretations
- **Meet regulatory standards**: Fixed disclaimers ensure proper legal context

## Implementation Date

December 21, 2025

## What Was Locked

### 1. Score Composition Weights ✅

**Centralized in**: `HEALTH_SCORE_WEIGHTS` constant

```typescript
export const HEALTH_SCORE_WEIGHTS = {
  MINERAL_WEIGHT: 0.6, // 60% - Mineral status (15 minerals)
  RATIO_WEIGHT: 0.3, // 30% - Critical ratios (6 ratios)
  RED_FLAG_WEIGHT: 0.1, // 10% - Red flag penalty
} as const;
```

**Impact**: These weights are now **immutable** and referenced by all score calculation and display code.

### 2. Score Ranges and Grades ✅

**Centralized in**: `SCORE_RANGES` array

| Score Range | Grade | Interpretation                                                       | Color            |
| ----------- | ----- | -------------------------------------------------------------------- | ---------------- |
| 90-100      | A     | Optimal mineral balance with minimal imbalances detected             | #10b981 (Green)  |
| 75-89       | B     | Minor mineral imbalances; consider targeted optimization             | #3b82f6 (Blue)   |
| 60-74       | C     | Moderate mineral imbalance patterns; supplementation may help        | #f59e0b (Amber)  |
| 45-59       | D     | Significant mineral imbalance patterns; consult practitioner         | #f97316 (Orange) |
| 0-44        | F     | Severe mineral imbalance patterns; professional guidance recommended | #ef4444 (Red)    |

**Impact**: Grade thresholds are **fixed** and cannot be changed without updating the centralized definition and versioning.

### 3. Clinical Disclaimers ✅

Three levels of disclaimers have been centralized:

#### `SHORT_DISCLAIMER` (for UI displays)

> "Health Score reflects mineral balance patterns only. Not diagnostic. Consult healthcare provider."

#### `FULL_DISCLAIMER` (for PDF reports)

> "This report is for educational purposes only. HTMA results should be interpreted by qualified healthcare practitioners in context with clinical findings, symptoms, and other laboratory tests. Not a substitute for professional medical advice, diagnosis, or treatment."

#### `PRACTITIONER_DISCLAIMER` (for technical metadata)

> "Analysis Engine v{version}. Ratios calculated per Trace Elements Inc. (TEI) HTMA interpretation guidelines. Results represent mineral patterns only and require clinical correlation."

**Impact**: All disclaimers are **consistent** across consumer UI, practitioner mode, and PDF exports.

### 4. Score Definition ✅

**Centralized in**: `SCORE_DEFINITION` object

**What the Health Score REPRESENTS**:

- Composite indicator of mineral balance patterns
- Reflects 15 essential minerals + 6 critical ratios
- Includes red flag detection for severe imbalances
- Based on established reference ranges

**What the Health Score DOES NOT represent**:

- Medical diagnosis or disease identification
- Individual disease risk assessment
- Treatment recommendations
- Comprehensive health status
- Replacement for lab work or clinical evaluation

**Impact**: Ensures consistent understanding of what the score means (and what it doesn't mean) across all user touchpoints.

---

## Files Modified

### Core Semantics Definition (NEW)

- ✅ **`src/lib/healthScoreSemantics.ts`** (293 lines)
  - `HEALTH_SCORE_WEIGHTS` - Centralized composition weights
  - `SCORE_RANGES` - Fixed grade thresholds and interpretations
  - `SCORE_DEFINITION` - What score represents (and doesn't)
  - `SHORT_DISCLAIMER`, `FULL_DISCLAIMER`, `PRACTITIONER_DISCLAIMER`
  - Helper functions: `getScoreRange()`, `getGrade()`, `getInterpretation()`, `getScoreColor()`, `formatScore()`, `getScoreMetadata()`
  - Version tracking: `HEALTH_SCORE_SEMANTICS_VERSION = "1.0.0"`

### Calculation Engine (UPDATED)

- ✅ **`src/lib/healthScore.ts`**
  - **Imports**: Added `HEALTH_SCORE_WEIGHTS`, `getGrade`, `HealthScoreGrade` from `healthScoreSemantics.ts`
  - **Mineral Score**: Now uses `HEALTH_SCORE_WEIGHTS.MINERAL_WEIGHT * 100` (60 points)
  - **Ratio Score**: Now uses `HEALTH_SCORE_WEIGHTS.RATIO_WEIGHT * 100` (30 points)
  - **Red Flag Score**: Now uses `HEALTH_SCORE_WEIGHTS.RED_FLAG_WEIGHT * 100` (10 points)
  - **Grade Calculation**: Replaced hardcoded if/else with `getGrade(totalScore)`
  - **Deprecated Functions**: Marked `getScoreColor()` and `getScoreInterpretation()` as deprecated with migration notes

### UI Components (UPDATED)

- ✅ **`src/components/HealthScoreCard.tsx`**

  - **Imports**: `getScoreColor`, `getInterpretation`, `SHORT_DISCLAIMER`, `HEALTH_SCORE_WEIGHTS`
  - **Interpretation**: Uses `getInterpretation(totalScore)` instead of deprecated function
  - **Disclaimer**: Added `<p className="disclaimer-text">{SHORT_DISCLAIMER}</p>` below interpretation
  - **Breakdown Weights**: All 3 sections (Mineral/Ratio/Red Flag) now display centralized weights dynamically
  - **Styling**: Added `.disclaimer-text` CSS class with italic, small font

- ✅ **`src/components/TrendChart.tsx`**

  - **Imports**: `SHORT_DISCLAIMER` from `healthScoreSemantics.ts`
  - **Disclaimer**: Added `<p className="chart-disclaimer">{SHORT_DISCLAIMER}</p>` to chart header
  - **Styling**: Added `.chart-disclaimer` CSS class for proper display

- ✅ **`src/components/ComparisonView.tsx`**

  - **Imports**: `SHORT_DISCLAIMER` from `healthScoreSemantics.ts`
  - **Disclaimer**: Added `<p className="comparison-disclaimer">{SHORT_DISCLAIMER}</p>` below date range
  - **Styling**: Added `.comparison-disclaimer` CSS class

- ⚠️ **`src/components/WhyThisChanged.tsx`**
  - **No changes needed**: Uses `getScoreDeltaColor()` from `scoreExplainer.ts` (different purpose - shows delta direction, not score color)

### PDF Generation (UPDATED)

- ✅ **`src/lib/pdfGenerator.ts`**
  - **Imports**: `FULL_DISCLAIMER` from `healthScoreSemantics.ts`
  - **Footer Disclaimer**: Replaced hardcoded string with `FULL_DISCLAIMER`
  - **Consistency**: All generated PDFs now use centralized disclaimer text

---

## Verification Checklist

### ✅ Semantic Consistency

- [x] Score composition weights are centralized (`HEALTH_SCORE_WEIGHTS`)
- [x] Grade thresholds are fixed and version-tracked (`SCORE_RANGES`)
- [x] Clinical interpretations are consistent across all displays
- [x] Disclaimers are identical in UI, PDFs, and trend charts

### ✅ No Functional Changes

- [x] Score calculation math unchanged (only references centralized constants)
- [x] No new features added
- [x] No UI layout changes (only added disclaimer text)
- [x] AI analysis logic unchanged

### ✅ Practitioner Mode Consistency

- [x] Score semantics **do not change** between consumer and practitioner modes
- [x] Only explanation depth varies, not score meaning
- [x] Same weights, ranges, and grades apply universally

### ✅ Version Tracking

- [x] `HEALTH_SCORE_SEMANTICS_VERSION = "1.0.0"` in `healthScoreSemantics.ts`
- [x] `SEMANTICS_LAST_REVIEWED = "2025-12-21"` timestamp
- [x] Linked to `ANALYSIS_ENGINE_VERSION` from `htmaConstants.ts`

### ✅ Code Quality

- [x] All TypeScript files compile without errors
- [x] Deprecated functions marked with `@deprecated` JSDoc tags
- [x] Helper functions have clear documentation
- [x] Constants exported with `as const` for immutability

---

## Migration Path for Future Changes

If score semantics need to be updated (e.g., changing grade thresholds or weights):

1. **Update `healthScoreSemantics.ts`**:

   - Modify `HEALTH_SCORE_WEIGHTS`, `SCORE_RANGES`, or disclaimers
   - Increment `HEALTH_SCORE_SEMANTICS_VERSION` (e.g., "1.0.0" → "1.1.0")
   - Update `SEMANTICS_LAST_REVIEWED` timestamp

2. **Document the Change**:

   - Add entry to version changelog
   - Note reason for change (clinical rationale, regulatory requirement, etc.)

3. **Propagation is Automatic**:

   - All components already reference centralized definitions
   - No need to update individual UI files
   - Snapshots will automatically record new version

4. **Test Impact**:
   - Verify score calculations remain deterministic
   - Confirm UI displays update correctly
   - Check PDF reports reflect new disclaimers

---

## Benefits

### 1. Clinical Reliability ⚕️

- Fixed semantics prevent misinterpretation
- Consistent disclaimers meet regulatory requirements
- Audit trail shows which semantics version was used

### 2. Maintainability 🛠️

- Single source of truth for all score definitions
- Changes propagate automatically to all components
- Reduced code duplication (deprecated 2 functions)

### 3. Auditability 📋

- Version tracking for semantic changes
- Immutable score definitions with timestamps
- Clear lineage from calculation → display → PDF

### 4. Governance 🔒

- Prevents ad-hoc score interpretation
- Ensures legal disclaimers are never omitted
- Supports compliance with health data regulations

---

## Deprecated Functions

The following functions in `src/lib/healthScore.ts` are **deprecated** and should not be used in new code:

```typescript
/**
 * @deprecated Use getScoreColor from healthScoreSemantics.ts
 */
export function getScoreColor(score: number): string { ... }

/**
 * @deprecated Use getInterpretation from healthScoreSemantics.ts
 */
export function getScoreInterpretation(score: number): string { ... }
```

**Migration**: Import from `healthScoreSemantics.ts` instead:

```typescript
import { getScoreColor, getInterpretation } from "../lib/healthScoreSemantics";
```

---

## Version Information

- **Semantics Version**: 1.0.0
- **Last Reviewed**: December 21, 2025
- **Linked Engine Version**: `ANALYSIS_ENGINE_VERSION` from `htmaConstants.ts`

---

## Related Documentation

- [Versioning and Audit System](./VERSIONING_AND_AUDIT.md) - Core infrastructure
- [Health Score Implementation](./IMPLEMENTATION_SUMMARY.md) - Original feature spec
- ["Why This Changed" Explainer](./WHY_THIS_CHANGED.md) - Score change explanations

---

## Summary

The Health Score semantics lock ensures that **clinical meaning is consistent, auditable, and governed** across the entire HTMA Genius platform. All score calculations, displays, and PDFs now reference centralized definitions, preventing semantic drift and ensuring regulatory compliance.

**Status**: ✅ Complete (December 21, 2025)
