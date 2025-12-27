/**
 * HTMA Genius — Oxidation Pattern Delta Engine
 * Version: 1.0.0
 * Reviewed: 2025-12-22
 *
 * Purpose: Deterministic detection of oxidation pattern changes between tests
 * Identifies milestones (pattern shifts), calculates distance to balanced,
 * and provides non-diagnostic explanations for metabolic pattern changes.
 *
 * NOT a diagnosis, disease label, treatment directive, or prediction.
 * This engine uses pure mathematics and locked semantics.
 */

import {
  OxidationClassification,
  OxidationType,
} from "./oxidationClassification";

export const OXIDATION_DELTA_ENGINE_VERSION = "1.0.0";
export const OXIDATION_DELTA_ENGINE_REVIEWED_DATE = "2025-12-22";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type OxidationDirection =
  | "toward_balanced"
  | "away_from_balanced"
  | "stable";
export type PatternChangeType =
  | "major_shift"
  | "minor_adjustment"
  | "stable"
  | "new_test";

export interface OxidationDelta {
  /** Version info for audit trail */
  version: string;
  reviewedDate: string;

  /** Previous and current oxidation classifications */
  previous: OxidationClassification;
  current: OxidationClassification;

  /** Pattern change analysis */
  patternChange: {
    type: PatternChangeType;
    isMilestone: boolean;
    description: string;
  };

  /** Distance to balanced metabolic pattern */
  distanceToBalanced: {
    previous: number; // 0 = balanced, higher = further from balanced
    current: number;
    change: number; // negative = improving
    direction: OxidationDirection;
  };

  /** Key indicator changes */
  keyChanges: Array<{
    indicator: string;
    from: string;
    to: string;
    impact: "positive" | "neutral" | "negative";
    note: string;
  }>;

  /** Non-diagnostic summary */
  summary: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate "distance to balanced" metric
 * 0 = balanced pattern, higher values = further from balanced
 */
function calculateDistanceToBalanced(
  oxidation: OxidationClassification
): number {
  // Balanced = 0
  if (oxidation.type === "balanced") return 0;

  // Mixed = moderate distance (2)
  if (oxidation.type === "mixed") return 2;

  // Fast/Slow = distance based on confidence and alignment score
  const baseDistance =
    oxidation.type === "fast" || oxidation.type === "slow" ? 3 : 1;

  // Higher alignment score = stronger pattern = further from balanced
  const alignmentBonus = oxidation.metadata.alignmentScore * 0.5;

  // Higher confidence = more established pattern = further from balanced
  const confidenceMultiplier =
    oxidation.confidence === "high"
      ? 1.2
      : oxidation.confidence === "moderate"
      ? 1.0
      : 0.8;

  return (
    Math.round((baseDistance + alignmentBonus) * confidenceMultiplier * 10) / 10
  );
}

/**
 * Determine pattern change type
 */
function determinePatternChangeType(
  fromType: OxidationType,
  toType: OxidationType
): { type: PatternChangeType; isMilestone: boolean } {
  // No previous test
  if (!fromType) {
    return { type: "new_test", isMilestone: false };
  }

  // Same type = stable
  if (fromType === toType) {
    return { type: "stable", isMilestone: false };
  }

  // Major shifts (milestones)
  const majorShifts = [
    ["fast", "slow"],
    ["slow", "fast"],
    ["fast", "balanced"],
    ["slow", "balanced"],
  ];

  const isMajorShift = majorShifts.some(
    ([from, to]) => fromType === from && toType === to
  );

  if (isMajorShift) {
    return { type: "major_shift", isMilestone: true };
  }

  // Minor adjustments
  return { type: "minor_adjustment", isMilestone: false };
}

/**
 * Generate pattern change description
 */
function generatePatternChangeDescription(
  fromType: OxidationType,
  toType: OxidationType,
  changeType: PatternChangeType
): string {
  if (changeType === "new_test") {
    return `Initial oxidation pattern established: ${toType}`;
  }

  if (changeType === "stable") {
    return `Oxidation pattern remained ${toType}`;
  }

  if (changeType === "major_shift") {
    const shifts: Record<string, string> = {
      "fast→slow":
        "Pattern shifted from Fast to Slow Oxidation — a significant metabolic milestone",
      "slow→fast":
        "Pattern shifted from Slow to Fast Oxidation — a significant metabolic milestone",
      "fast→balanced":
        "Pattern shifted from Fast to Balanced — moving toward metabolic equilibrium",
      "slow→balanced":
        "Pattern shifted from Slow to Balanced — moving toward metabolic equilibrium",
      "balanced→fast":
        "Pattern shifted from Balanced to Fast — entering more active metabolic state",
      "balanced→slow":
        "Pattern shifted from Balanced to Slow — entering more conservative metabolic state",
    };

    const key = `${fromType}→${toType}`;
    return shifts[key] || `Pattern changed from ${fromType} to ${toType}`;
  }

  // Minor adjustment
  return `Pattern adjusted from ${fromType} to ${toType}`;
}

/**
 * Determine direction toward/away from balanced
 */
function determineDirection(
  previousDistance: number,
  currentDistance: number
): OxidationDirection {
  const change = currentDistance - previousDistance;

  if (Math.abs(change) < 0.3) return "stable";
  if (change < 0) return "toward_balanced";
  return "away_from_balanced";
}

/**
 * Generate key indicator changes
 */
function generateKeyChanges(
  previous: OxidationClassification,
  current: OxidationClassification
): Array<{
  indicator: string;
  from: string;
  to: string;
  impact: "positive" | "neutral" | "negative";
  note: string;
}> {
  const changes: Array<any> = [];

  // Ca/K ratio change (thyroid indicator)
  const caKPrev = previous.indicators.ratioSignals.caK;
  const caKCurr = current.indicators.ratioSignals.caK;
  if (caKPrev !== caKCurr) {
    const impact =
      caKCurr === "optimal"
        ? "positive"
        : caKPrev === "optimal"
        ? "negative"
        : "neutral";
    changes.push({
      indicator: "Ca/K Ratio",
      from: caKPrev,
      to: caKCurr,
      impact,
      note: `Ca/K signal changed (${caKPrev} → ${caKCurr}), associated with thyroid activity patterns`,
    });
  }

  // Na/K ratio change (adrenal indicator)
  const naKPrev = previous.indicators.ratioSignals.naK;
  const naKCurr = current.indicators.ratioSignals.naK;
  if (naKPrev !== naKCurr) {
    const impact =
      naKCurr === "optimal"
        ? "positive"
        : naKPrev === "optimal"
        ? "negative"
        : "neutral";
    changes.push({
      indicator: "Na/K Ratio",
      from: naKPrev,
      to: naKCurr,
      impact,
      note: `Na/K signal changed (${naKPrev} → ${naKCurr}), associated with adrenal activity patterns`,
    });
  }

  // Calcium status change
  const caPrev = previous.indicators.calciumStatus;
  const caCurr = current.indicators.calciumStatus;
  if (caPrev !== caCurr) {
    const impact =
      caCurr === "optimal"
        ? "positive"
        : caPrev === "optimal"
        ? "negative"
        : "neutral";
    changes.push({
      indicator: "Calcium",
      from: caPrev,
      to: caCurr,
      impact,
      note: `Calcium status changed (${caPrev} → ${caCurr})`,
    });
  }

  // Sodium status change
  const naPrev = previous.indicators.sodiumStatus;
  const naCurr = current.indicators.sodiumStatus;
  if (naPrev !== naCurr) {
    const impact =
      naCurr === "optimal"
        ? "positive"
        : naPrev === "optimal"
        ? "negative"
        : "neutral";
    changes.push({
      indicator: "Sodium",
      from: naPrev,
      to: naCurr,
      impact,
      note: `Sodium status changed (${naPrev} → ${naCurr})`,
    });
  }

  return changes;
}

/**
 * Generate non-diagnostic summary
 */
function generateSummary(
  patternChange: {
    type: PatternChangeType;
    isMilestone: boolean;
    description: string;
  },
  distanceToBalanced: { direction: OxidationDirection; change: number },
  fromType: OxidationType,
  toType: OxidationType
): string {
  if (patternChange.type === "new_test") {
    return `Initial oxidation pattern identified as ${toType}. This establishes a baseline for tracking metabolic pattern changes in future tests.`;
  }

  if (patternChange.type === "stable") {
    if (toType === "balanced") {
      return `Oxidation pattern remained balanced, suggesting stable metabolic equilibrium.`;
    }
    return `Oxidation pattern remained ${toType}, indicating consistent metabolic patterns between tests.`;
  }

  if (patternChange.isMilestone) {
    const directionText =
      distanceToBalanced.direction === "toward_balanced"
        ? "This represents progress toward metabolic balance."
        : distanceToBalanced.direction === "away_from_balanced"
        ? "This indicates a shift in metabolic pattern."
        : "Metabolic pattern has shifted.";

    return `${patternChange.description}. ${directionText} Pattern changes like this can reflect adjustments in thyroid and adrenal activity relationships over time.`;
  }

  // Minor adjustment
  return `Oxidation pattern adjusted from ${fromType} to ${toType}, suggesting evolving metabolic patterns.`;
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

/**
 * Analyze oxidation pattern changes between two tests
 * Pure deterministic logic, no AI, no diagnosis
 */
export function analyzeOxidationDelta(
  previous: OxidationClassification | null,
  current: OxidationClassification
): OxidationDelta | null {
  // No previous test = no delta
  if (!previous) {
    // Return "new test" analysis
    const currentDistance = calculateDistanceToBalanced(current);

    return {
      version: OXIDATION_DELTA_ENGINE_VERSION,
      reviewedDate: OXIDATION_DELTA_ENGINE_REVIEWED_DATE,
      previous: previous!,
      current,
      patternChange: {
        type: "new_test",
        isMilestone: false,
        description: generatePatternChangeDescription(
          null as any,
          current.type,
          "new_test"
        ),
      },
      distanceToBalanced: {
        previous: 0,
        current: currentDistance,
        change: 0,
        direction: "stable",
      },
      keyChanges: [],
      summary: generateSummary(
        { type: "new_test", isMilestone: false, description: "" },
        { direction: "stable", change: 0 },
        null as any,
        current.type
      ),
    };
  }

  // Calculate distances
  const previousDistance = calculateDistanceToBalanced(previous);
  const currentDistance = calculateDistanceToBalanced(current);
  const distanceChange = currentDistance - previousDistance;
  const direction = determineDirection(previousDistance, currentDistance);

  // Determine pattern change
  const { type: changeType, isMilestone } = determinePatternChangeType(
    previous.type,
    current.type
  );

  const description = generatePatternChangeDescription(
    previous.type,
    current.type,
    changeType
  );

  // Generate key changes
  const keyChanges = generateKeyChanges(previous, current);

  // Generate summary
  const summary = generateSummary(
    { type: changeType, isMilestone, description },
    { direction, change: distanceChange },
    previous.type,
    current.type
  );

  return {
    version: OXIDATION_DELTA_ENGINE_VERSION,
    reviewedDate: OXIDATION_DELTA_ENGINE_REVIEWED_DATE,
    previous,
    current,
    patternChange: {
      type: changeType,
      isMilestone,
      description,
    },
    distanceToBalanced: {
      previous: previousDistance,
      current: currentDistance,
      change: distanceChange,
      direction,
    },
    keyChanges,
    summary,
  };
}
