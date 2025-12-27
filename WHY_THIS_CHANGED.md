# "Why This Changed" Feature - Technical Documentation

## Overview

The "Why This Changed" explanation system provides users with clear, clinical explanations for health score changes between analyses. The system is fully deterministic, rule-based, and transparent.

## Architecture

### Core Components

1. **scoreExplainer.ts** - Core logic engine
2. **WhyThisChanged.tsx** - UI component
3. **index.tsx** - Integration point

### Data Flow

```
Previous Analysis + Current Analysis
           ↓
    explainScoreChange()
           ↓
    Compare minerals (15)
    Compare ratios (6)
    Calculate impacts
           ↓
    Categorize changes:
    - Primary Drivers
    - Secondary Contributors
    - Offsetting Factors
           ↓
    ScoreExplanation object
           ↓
    WhyThisChanged component
           ↓
    Display to user
```

## Scoring Logic

### Weights (from healthScore.ts)

- **Minerals: 60%** (4 points per optimal mineral × 15)
- **Ratios: 30%** (5 points per optimal ratio × 6)
- **Red Flags: 10%** (penalties for severe issues)

### Impact Calculation

#### Mineral Status Change

- Became optimal: **+4 points**
- Left optimal range: **-4 points**
- No status change: **0 points**

#### Ratio Status Change

- Became optimal: **+5 points**
- Left optimal range: **-5 points**
- No status change: **0 points**

### Categorization Rules

**Primary Drivers** (Top 3 most impactful):

- Absolute impact ≥ 4 points
- Match score direction (improved/declined)
- Sorted by absolute impact

**Secondary Contributors** (Next 3 significant):

- Absolute impact ≥ 2 points
- Match score direction
- Below primary driver threshold

**Offsetting Factors** (Counter-direction changes):

- Absolute impact ≥ 3 points
- Opposite to score direction
- Reduced the overall change

## Usage

### When Displayed

The "Why This Changed" card appears when:

1. User has ≥2 saved analyses
2. Score change ≥ ±1 point (negligible changes hidden)
3. Health score card is visible

### Comparison Logic

#### New Analysis

Compares current analysis to most recent saved analysis

#### Loaded Analysis

Compares loaded analysis to the one immediately before it in chronological order

## Clinical Language

### Status Changes Displayed

**Minerals:**

- "Calcium: Low → Optimal"
- "Magnesium: Optimal → High"
- "Zinc: High → Optimal"

**Ratios:**

- "Ca/Mg ratio: Low → Optimal"
- "Na/K ratio: Optimal → High"
- "Zn/Cu ratio: High → Optimal"

### Section Headers

**Improved Score:**

- 🎯 Key Improvements
- ✨ Also Improved
- ⚖️ Offsetting Factors

**Declined Score:**

- ⚠️ Primary Concerns
- 📊 Additional Changes
- ⚖️ Offsetting Factors

## Examples

### Example 1: Score Improved (+8 points)

```
📈 Why Your Score Changed: +8.0 points

🎯 Key Improvements
- Magnesium: Low → Optimal
- Zinc: Low → Optimal

✨ Also Improved
- Ca/Mg ratio: High → Optimal

⚖️ Offsetting Factors
- Calcium: Optimal → High

Breakdown:
Mineral Changes: +8.0
Ratio Changes: +5.0
Red Flag Changes: -5.0
```

**Explanation:**

- Magnesium normalized (+4)
- Zinc normalized (+4)
- Ca/Mg ratio improved (+5)
- But calcium went too high (-4)
- And introduced a red flag (-5)
- Net change: +8

### Example 2: Score Declined (-6 points)

```
📉 Why Your Score Changed: -6.0 points

⚠️ Primary Concerns
- Iron: Optimal → Low
- Na/K ratio: Optimal → Low

📊 Additional Changes
- Copper: Optimal → High

⚖️ Offsetting Factors
- Selenium: Low → Optimal

Breakdown:
Mineral Changes: -4.0
Ratio Changes: -5.0
Red Flag Changes: +3.0
```

**Explanation:**

- Iron dropped below optimal (-4)
- Na/K ratio worsened (-5)
- Copper elevated (-4)
- But selenium improved (+4)
- And red flag reduced (+3)
- Net change: -6

### Example 3: Minimal Change (+0.5 points)

Card not displayed - change too small (<1 point threshold)

## Determinism Guarantee

### Input → Output Mapping

Given identical:

- Previous mineral values
- Current mineral values
- Reference ranges (from htmaConstants.ts)

The system ALWAYS produces:

- Identical score delta
- Identical direction
- Identical primary drivers (same order)
- Identical secondary contributors (same order)
- Identical offsetting factors (same order)

### No Randomness

- No AI calls
- No external API dependencies
- No timestamps affecting logic
- No user-specific variations
- Pure functions only

### Version Control

All logic tied to:

- `ANALYSIS_ENGINE_VERSION` in htmaConstants.ts
- Ratios calculated via ratioEngine.ts
- Health scores via healthScore.ts

## Integration Points

### State Management (index.tsx)

```typescript
const [scoreExplanation, setScoreExplanation] =
  useState<ScoreExplanation | null>(null);

// Generate explanation after analysis
if (savedAnalyses.length > 0) {
  const explanation = explainScoreChange(
    {
      mineralData: previousAnalysis.mineralData,
      healthScore: previousAnalysis.healthScore,
    },
    { mineralData: data, healthScore: score }
  );
  setScoreExplanation(explanation);
}
```

### UI Rendering

```tsx
{
  scoreExplanation && hasAnalyzed && (
    <div className="why-changed-wrapper">
      <WhyThisChanged explanation={scoreExplanation} />
    </div>
  );
}
```

## Performance

### Computational Complexity

- O(n) where n = 15 minerals + 6 ratios = 21 comparisons
- Sorting: O(21 log 21) ≈ constant time
- Total: **< 1ms on modern hardware**

### Memory Usage

- ScoreExplanation object: ~2KB
- No large data structures
- Garbage collected immediately after display

## Testing Considerations

### Unit Test Cases

1. **No change scenario** - All minerals/ratios same
2. **Single mineral improvement** - One mineral optimal
3. **Multiple improvements** - 3+ minerals improve
4. **Mixed changes** - Some improve, some decline
5. **Ratio-driven change** - Ratios change, minerals stable
6. **Red flag scenario** - Severe deficiency introduced/removed
7. **Offsetting factors** - Positive and negative changes cancel

### Edge Cases Handled

- Division by zero in ratios (returns 0)
- Missing mineral data (defaults to 0)
- First analysis (no previous data - explanation not shown)
- Identical analyses (minimal change - card hidden)
- All minerals/ratios unchanged (shows summary message)

## Future Enhancements

### Possible Additions

1. **Personalized Recommendations** - "Focus on increasing Magnesium"
2. **Trend Analysis** - "This is your 3rd consecutive improvement"
3. **Goal Tracking** - "You're 2 points away from Grade A"
4. **Dietary Insights** - "These changes suggest improved diet"
5. **Time-based Context** - "Change occurred over 30 days"

### Architectural Considerations

All future enhancements must maintain:

- Deterministic behavior
- No AI dependencies for core logic
- Clinical accuracy
- Version control integration

## Maintenance

### When to Update

1. **Scoring weights change** - Update impact calculations
2. **New minerals added** - Add to comparison logic
3. **New ratios added** - Include in ratio analysis
4. **Clinical guidelines change** - Adjust categorization thresholds

### Version Tracking

Changes to this system should increment:

- `ANALYSIS_ENGINE_VERSION` if logic changes
- Component version in comments if UI changes only

---

**Created:** December 21, 2025  
**Version:** 1.0.0  
**Deterministic:** ✓  
**Rule-Based:** ✓  
**AI-Free:** ✓
