# AI Evidence-Based Confidence Scoring Implementation

**Version:** 1.0.0  
**Implemented:** December 22, 2025  
**Status:** ✅ Complete - Production Ready

## Overview

AI Evidence-Based Confidence Scoring adds transparent, deterministic confidence levels to AI-generated insights based on objective evidence from mineral and ratio measurements. This increases scientific credibility, practitioner trust, and user confidence in AI interpretations.

## Core Components

### 1. Confidence Scoring Engine (`aiConfidenceScoring.ts`)

**Purpose:** Calculate evidence-based confidence scores using deterministic logic

**Key Features:**

- **Three confidence levels:** High (≥70%), Moderate (40-69%), Low (<40%)
- **Multi-factor scoring:**
  - Number of abnormal markers (minerals + ratios)
  - Severity of deviations from ideal ranges
  - Agreement between ratios and underlying minerals (corroboration)
  - Oxidation pattern consistency
- **Evidence tracking:** Each insight includes supporting evidence list
- **Weighted scoring:** Ratios weighted 1.2x higher than individual minerals

**Functions:**

```typescript
// Calculate overall confidence for entire analysis
calculateConfidenceScore(
  minerals: ReadonlyArray<MineralSnapshot>,
  ratios: ReadonlyArray<RatioSnapshot>,
  oxidation?: OxidationClassification
): ConfidenceScore

// Get confidence for specific insight text
getInsightConfidence(
  insightText: string,
  minerals: ReadonlyArray<MineralSnapshot>,
  ratios: ReadonlyArray<RatioSnapshot>
): ConfidenceScore

// UI helper functions
getConfidenceColor(level: ConfidenceLevel): string
getConfidenceIcon(level: ConfidenceLevel): string
getConfidenceDescription(level: ConfidenceLevel): string
formatEvidence(evidence: ReadonlyArray<EvidenceItem>): string[]
```

**Scoring Algorithm:**

1. **Mineral Evidence:** Each abnormal mineral contributes weight based on deviation severity

   - Severe deviation (≥50%): 1.0 weight
   - Moderate deviation (30-49%): 0.7 weight
   - Mild deviation (15-29%): 0.5 weight
   - Borderline (<15%): 0.3 weight

2. **Ratio Evidence:** Each abnormal ratio contributes 1.2x weight (higher clinical significance)

3. **Oxidation Evidence:** Pattern classification adds weight

   - Fast/Slow: 0.8 weight
   - Mixed: 0.5 weight
   - Balanced: 0.2 weight

4. **Corroboration Bonus:** If multiple independent markers agree (+0.3 weight)

   - 2+ abnormal minerals AND 1+ abnormal ratio using those minerals, OR
   - 3+ abnormal ratios, OR
   - 5+ abnormal minerals

5. **Final Score Adjustment:**
   - No abnormalities: Max 30% confidence
   - Single marker: Max 60% confidence
   - 5+ markers with corroboration: 1.15x boost

### 2. Data Model Updates (`reportSnapshot.ts`)

**Added Interface:**

```typescript
export interface ConfidenceScore {
  readonly level: ConfidenceLevel; // "High" | "Moderate" | "Low"
  readonly score: number; // 0-100
  readonly evidence: ReadonlyArray<EvidenceItem>;
  readonly abnormalCount: number;
  readonly hasCorroboration: boolean;
}

export interface EvidenceItem {
  readonly type: "mineral" | "ratio" | "oxidation" | "pattern";
  readonly description: string;
  readonly weight: number; // 0-1
}
```

**ReportSnapshot Enhancement:**

```typescript
export interface ReportSnapshot {
  // ... existing fields
  /** AI confidence score (optional, added v1.5.0) - Evidence-based confidence */
  readonly aiConfidence?: ConfidenceScore;
}
```

### 3. Automatic Confidence Calculation (`createReportSnapshot.ts`)

**Integration:**

- Confidence automatically calculated when creating snapshots
- Uses minerals, ratios, and oxidation classification from snapshot
- Stored with immutable snapshot for audit trail

**Code:**

```typescript
// Calculate AI confidence score if not provided
const calculatedConfidence =
  aiConfidence ||
  calculateConfidenceScore(minerals, ratios, oxidationClassification);

const snapshot: ReportSnapshot = {
  // ... other fields
  aiConfidence: calculatedConfidence,
};
```

### 4. UI Component (`AIInsights.tsx`)

**New Features:**

**Confidence Banner:**

- Visual indicator with icon (✓✓✓ High, ✓✓ Moderate, ✓ Low)
- Confidence level and percentage score
- Description of confidence level
- Glassmorphic design matching AI insights gradient

**Practitioner Mode - Evidence Panel:**

- Collapsible "View Evidence" section
- Sorted list of supporting markers (highest weight first)
- Shows all evidence items with descriptions

**Props:**

```typescript
interface AIInsightsProps {
  insights: string;
  isLoading?: boolean;
  confidenceScore?: ConfidenceScore; // NEW
  isPractitionerMode?: boolean; // NEW
}
```

**Visual Design:**

- Confidence banner: Semi-transparent white overlay with backdrop blur
- Evidence panel: Collapsible `<details>` element
- Icons: ✓✓✓ (High), ✓✓ (Moderate), ✓ (Low)
- Colors: Inherited from gradient background

### 5. PDF Integration (`pdfGenerator.ts`)

**New Section:** Confidence Score Banner (after "AI-Powered Health Insights" header)

**Consumer View:**

- Confidence level with percentage
- Description of confidence
- Light gray box with rounded corners

**Practitioner View:**

- All consumer features PLUS:
- Evidence count summary
- Complete evidence list with bullets
- Sorted by weight (strongest evidence first)

**Styling:**

- Gray background box (248, 249, 250)
- Border (200, 200, 200)
- Rounded corners
- Automatic page breaks
- Multi-line text wrapping for evidence

### 6. Live Analysis Integration (`index.tsx`)

**State Management:**

```typescript
const [aiConfidence, setAiConfidence] = useState<ConfidenceScore | null>(null);
```

**Calculation Flow:**

1. User submits analysis
2. Calculate health score
3. Calculate oxidation classification
4. Build minerals/ratios arrays from form data
5. Calculate confidence score using all three
6. Pass to AIInsights component

**Code:**

```typescript
// Build minerals and ratios arrays
const minerals: MineralSnapshot[] = MINERAL_REFERENCE_RANGES.map(/* ... */);
const ratios: RatioSnapshot[] =
  calculateAllRatios(mineralValues).map(/* ... */);

// Calculate confidence
const confidence = calculateConfidenceScore(minerals, ratios, oxidation);
setAiConfidence(confidence);
```

## Confidence Level Semantics

| Level        | Score Range | Meaning                                  | When It Occurs                         |
| ------------ | ----------- | ---------------------------------------- | -------------------------------------- |
| **High**     | ≥70%        | Strong evidence from multiple markers    | 3+ abnormal markers with corroboration |
| **Moderate** | 40-69%      | Moderate evidence from several markers   | 2-4 abnormal markers                   |
| **Low**      | <40%        | Limited evidence, interpret with caution | 0-1 abnormal markers or weak patterns  |

## Example Evidence Items

**Mineral Evidence:**

- "Calcium (Ca) is low (25 mg%)"
- "Magnesium (Mg) is high (12 mg%)"

**Ratio Evidence:**

- "Ca/Mg ratio is high (9.5) - thyroid/metabolic rate"
- "Na/K ratio is low (1.8) - adrenal function"

**Oxidation Evidence:**

- "slow oxidation type detected (Ca/K: 5.2, Na/K: 1.6)"

**Pattern Evidence:**

- "Multiple independent markers show consistent patterns"

## Benefits

✅ **Scientific Credibility:** Transparent, evidence-based confidence scoring  
✅ **Practitioner Trust:** Clear visibility into AI reasoning  
✅ **User Confidence:** Visual indicators of insight reliability  
✅ **Legal Safety:** Deterministic scoring (no black-box AI)  
✅ **Audit Trail:** Confidence stored in immutable snapshots  
✅ **Educational Value:** Evidence lists teach practitioners HTMA patterns

## Technical Specifications

**Engine Type:** Deterministic, rule-based (no AI/ML)  
**Inputs:** Minerals, ratios, oxidation classification  
**Outputs:** Confidence level, score, evidence list, flags  
**Performance:** O(n) where n = number of minerals + ratios  
**Safety:** Pure functions, no side effects, immutable data

## Integration Points

1. **Live Analysis:** `index.tsx` → `AIInsights.tsx` (UI display)
2. **Saved Analysis:** `createReportSnapshot.ts` → `reportSnapshot.ts` (storage)
3. **PDF Generation:** `pdfGenerator.ts` (immutable report)
4. **Future API:** Can be exposed via `/api/confidence` endpoint

## Testing Recommendations

### Unit Tests (aiConfidenceScoring.ts)

```typescript
describe("calculateConfidenceScore", () => {
  it("returns HIGH confidence with 5+ abnormal markers and corroboration");
  it("returns MODERATE confidence with 2-4 abnormal markers");
  it("returns LOW confidence with 0-1 abnormal markers");
  it("returns LOW confidence when all markers optimal");
  it("weights ratios 1.2x higher than minerals");
  it("adds corroboration bonus when patterns agree");
  it("includes oxidation evidence when pattern is not balanced");
});

describe("getInsightConfidence", () => {
  it("scores based on markers mentioned in insight text");
  it("returns low confidence when no markers mentioned");
});

describe("formatEvidence", () => {
  it("sorts evidence by weight (highest first)");
  it("handles readonly arrays correctly");
});
```

### Integration Tests

```typescript
describe("AI Confidence Integration", () => {
  it("calculates confidence automatically in snapshot creation");
  it("displays confidence in AIInsights component");
  it("includes confidence in PDF reports");
  it("shows evidence panel in practitioner mode");
  it("handles missing oxidation classification gracefully");
});
```

### Acceptance Criteria

✅ Confidence score calculated for every analysis  
✅ Visual indicator appears in UI  
✅ Evidence list visible in practitioner mode  
✅ Confidence included in PDF reports  
✅ Stored in immutable snapshots  
✅ No TypeScript errors  
✅ Backward compatible (optional field)

## Future Enhancements

### Potential Improvements

1. **Per-Insight Confidence:** Score each insight paragraph individually using `getInsightConfidence()`
2. **Confidence Trends:** Track confidence over time in trend analysis
3. **Evidence Strength Visualization:** Bar chart showing weight of each evidence item
4. **Practitioner Override:** Allow practitioners to adjust confidence based on clinical context
5. **AI Model Integration:** Compare deterministic confidence vs. AI model confidence
6. **Confidence Thresholds:** Configurable thresholds for High/Moderate/Low boundaries

### API Endpoint (Not Implemented)

```typescript
// Future: /api/confidence
POST /api/confidence
Body: { minerals, ratios, oxidation? }
Response: { level, score, evidence, abnormalCount, hasCorroboration }
```

## Version History

- **v1.0.0** (2025-12-22): Initial implementation
  - Deterministic confidence engine
  - UI integration (AIInsights component)
  - PDF integration
  - Evidence tracking
  - Automatic snapshot calculation

## Related Documentation

- [HEALTH_SCORE_SEMANTICS_LOCK.md](HEALTH_SCORE_SEMANTICS_LOCK.md) - Health score calculation
- [RATIO_DELTA_ENGINE_SUMMARY.md](RATIO_DELTA_ENGINE_SUMMARY.md) - Ratio analysis
- [OXIDATION_DELTA_IMPLEMENTATION.md](OXIDATION_DELTA_IMPLEMENTATION.md) - Oxidation patterns
- [VERSIONING_AND_AUDIT.md](VERSIONING_AND_AUDIT.md) - Snapshot immutability

---

**Implementation Status:** ✅ Complete - Zero TypeScript errors  
**Production Ready:** Yes  
**Backward Compatible:** Yes (optional field)  
**Safety Verified:** Deterministic, non-AI, immutable snapshots
