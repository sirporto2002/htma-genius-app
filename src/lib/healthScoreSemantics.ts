/**
 * HTMA Health Score Semantics
 *
 * CENTRALIZED DEFINITION - Single Source of Truth
 *
 * This file defines the FIXED, clinically consistent meaning of the Health Score.
 * These semantics MUST NOT change implicitly. Any changes require:
 * 1. Clinical review
 * 2. Version increment (ANALYSIS_ENGINE_VERSION)
 * 3. Documentation update
 * 4. Migration plan for existing scores
 *
 * DO NOT modify these definitions without proper governance.
 */

import { ANALYSIS_ENGINE_VERSION } from "./htmaConstants";

// ============================================================================
// SCORE COMPOSITION WEIGHTS (LOCKED)
// ============================================================================

/**
 * Fixed weights for Health Score calculation
 *
 * These weights determine how different factors contribute to the total score.
 * Changing these weights changes the clinical meaning of the score.
 */
export const HEALTH_SCORE_WEIGHTS = {
  /** Mineral status contribution (60%) - How many minerals are in optimal range */
  MINERAL_WEIGHT: 0.6,

  /** Core ratios contribution (30%) - Balance of key mineral relationships */
  RATIO_WEIGHT: 0.3,

  /** Red flags contribution (10%) - Penalties for severe patterns */
  RED_FLAG_WEIGHT: 0.1,

  /** Total expected (should always be 1.0) */
  TOTAL: 1.0,
} as const;

// Compile-time check that weights sum to 1.0 (with floating-point tolerance)
const _WEIGHT_CHECK: number =
  HEALTH_SCORE_WEIGHTS.MINERAL_WEIGHT +
  HEALTH_SCORE_WEIGHTS.RATIO_WEIGHT +
  HEALTH_SCORE_WEIGHTS.RED_FLAG_WEIGHT;

const _EPSILON = 0.0001; // Tolerance for floating-point comparison
if (Math.abs(_WEIGHT_CHECK - HEALTH_SCORE_WEIGHTS.TOTAL) > _EPSILON) {
  throw new Error(
    `Health Score weights must sum to ${HEALTH_SCORE_WEIGHTS.TOTAL}, got ${_WEIGHT_CHECK}`
  );
}

// ============================================================================
// SCORE RANGES & GRADES (LOCKED)
// ============================================================================

export type HealthScoreGrade = "A" | "B" | "C" | "D" | "F";

export interface ScoreRange {
  readonly minScore: number;
  readonly maxScore: number;
  readonly grade: HealthScoreGrade;
  readonly interpretation: string;
  readonly colorHex: string;
}

/**
 * Fixed score ranges with clinical interpretations
 *
 * These ranges define what each letter grade means clinically.
 * DO NOT modify without clinical review and version increment.
 */
export const SCORE_RANGES: ReadonlyArray<ScoreRange> = [
  {
    minScore: 90,
    maxScore: 100,
    grade: "A",
    interpretation: "Optimal mineral balance",
    colorHex: "#10b981", // Green
  },
  {
    minScore: 75,
    maxScore: 89,
    grade: "B",
    interpretation: "Minor mineral imbalances",
    colorHex: "#3b82f6", // Blue
  },
  {
    minScore: 60,
    maxScore: 74,
    grade: "C",
    interpretation: "Moderate mineral imbalance patterns",
    colorHex: "#f59e0b", // Amber
  },
  {
    minScore: 45,
    maxScore: 59,
    grade: "D",
    interpretation: "Significant mineral imbalance patterns",
    colorHex: "#f97316", // Orange
  },
  {
    minScore: 0,
    maxScore: 44,
    grade: "F",
    interpretation: "Severe mineral imbalance patterns",
    colorHex: "#ef4444", // Red
  },
] as const;

// ============================================================================
// CLINICAL MEANING (LOCKED)
// ============================================================================

/**
 * What the Health Score represents (FIXED DEFINITION)
 */
export const SCORE_DEFINITION = {
  /** Primary purpose */
  represents: "A composite indicator of mineral balance patterns",

  /** Scope of interpretation */
  scope: [
    "Relative balance of 15 essential minerals",
    "Key mineral ratio relationships",
    "Patterns suggesting potential imbalances",
  ],

  /** What it is NOT */
  notRepresenting: [
    "A medical diagnosis",
    "A disease risk score",
    "A treatment recommendation",
    "A definitive health assessment",
  ],

  /** Clinical context */
  context:
    "HTMA results should be interpreted by qualified healthcare practitioners familiar with mineral analysis",
} as const;

// ============================================================================
// STANDARD DISCLAIMERS (LOCKED)
// ============================================================================

/**
 * Short disclaimer for inline display
 */
export const SHORT_DISCLAIMER =
  "Health Score reflects mineral balance patterns only. Not diagnostic.";

/**
 * Full disclaimer for detailed views
 */
export const FULL_DISCLAIMER = `The Health Score is a composite indicator of mineral balance patterns based on Hair Tissue Mineral Analysis (HTMA). This score is for educational purposes only and does not constitute medical advice, diagnosis, or treatment recommendation. HTMA results should be interpreted by a qualified healthcare practitioner familiar with mineral analysis. Always consult with your healthcare provider before making changes to your diet or supplement regimen.`;

/**
 * Practitioner disclaimer
 */
export const PRACTITIONER_DISCLAIMER = `This Health Score is calculated using the HTMA Genius analysis engine (v${ANALYSIS_ENGINE_VERSION}). Scoring methodology is based on Trace Elements Inc. (TEI) reference ranges and established clinical patterns. Use this score as one tool among many in your comprehensive patient assessment.`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get grade and interpretation for a given score
 *
 * @param score - Health score (0-100)
 * @returns Score range information
 */
export function getScoreRange(score: number): ScoreRange {
  // Clamp score to valid range
  const clampedScore = Math.max(0, Math.min(100, score));

  // Find matching range
  const range = SCORE_RANGES.find(
    (r) => clampedScore >= r.minScore && clampedScore <= r.maxScore
  );

  if (!range) {
    // Fallback (should never happen with proper ranges)
    return SCORE_RANGES[SCORE_RANGES.length - 1]; // Return F grade
  }

  return range;
}

/**
 * Get letter grade for a score
 *
 * @param score - Health score (0-100)
 * @returns Letter grade (A-F)
 */
export function getGrade(score: number): HealthScoreGrade {
  return getScoreRange(score).grade;
}

/**
 * Get clinical interpretation for a score
 *
 * @param score - Health score (0-100)
 * @returns Clinical interpretation text
 */
export function getInterpretation(score: number): string {
  return getScoreRange(score).interpretation;
}

/**
 * Get color for a score
 *
 * @param score - Health score (0-100)
 * @returns Hex color code
 */
export function getScoreColor(score: number): string {
  return getScoreRange(score).colorHex;
}

/**
 * Validate that a score is within valid range
 *
 * @param score - Health score to validate
 * @returns true if valid (0-100)
 */
export function isValidScore(score: number): boolean {
  return (
    typeof score === "number" && !isNaN(score) && score >= 0 && score <= 100
  );
}

/**
 * Format score for display
 *
 * @param score - Health score (0-100)
 * @returns Formatted string (e.g., "85")
 */
export function formatScore(score: number): string {
  if (!isValidScore(score)) {
    return "N/A";
  }
  return Math.round(score).toString();
}

/**
 * Get complete score metadata
 *
 * @param score - Health score (0-100)
 * @returns Complete metadata object
 */
export function getScoreMetadata(score: number) {
  const range = getScoreRange(score);
  return {
    score: Math.round(score),
    grade: range.grade,
    interpretation: range.interpretation,
    color: range.colorHex,
    isValid: isValidScore(score),
    weights: HEALTH_SCORE_WEIGHTS,
    disclaimer: SHORT_DISCLAIMER,
  };
}

// ============================================================================
// SCORE BREAKDOWN LABELS (LOCKED)
// ============================================================================

/**
 * Human-readable labels for score components
 */
export const SCORE_COMPONENT_LABELS = {
  mineralScore: "Mineral Status",
  ratioScore: "Critical Ratios",
  redFlagScore: "Red Flag Adjustment",
  totalScore: "Total Health Score",
} as const;

/**
 * Descriptions for score components
 */
export const SCORE_COMPONENT_DESCRIPTIONS = {
  mineralScore: `How many of the 15 essential minerals are in optimal range (${
    HEALTH_SCORE_WEIGHTS.MINERAL_WEIGHT * 100
  }% of total score)`,
  ratioScore: `Balance of 6 key mineral relationships like Ca/Mg, Na/K (${
    HEALTH_SCORE_WEIGHTS.RATIO_WEIGHT * 100
  }% of total score)`,
  redFlagScore: `Penalties for severe deficiencies or toxicities (${
    HEALTH_SCORE_WEIGHTS.RED_FLAG_WEIGHT * 100
  }% of total score)`,
  totalScore: "Composite indicator of overall mineral balance patterns",
} as const;

// ============================================================================
// VERSION & AUDIT
// ============================================================================

/**
 * Semantics version tracking
 *
 * Increment this when:
 * - Score ranges change
 * - Grade definitions change
 * - Clinical interpretations change
 * - Weights change
 *
 * This is separate from ANALYSIS_ENGINE_VERSION but should be coordinated.
 */
export const HEALTH_SCORE_SEMANTICS_VERSION = "1.0.0";

/**
 * Last review date
 */
export const SEMANTICS_LAST_REVIEWED = "2025-12-21";

/**
 * Export all semantics for audit trail
 */
export function exportSemantics() {
  return {
    version: HEALTH_SCORE_SEMANTICS_VERSION,
    engineVersion: ANALYSIS_ENGINE_VERSION,
    lastReviewed: SEMANTICS_LAST_REVIEWED,
    weights: HEALTH_SCORE_WEIGHTS,
    ranges: SCORE_RANGES,
    definition: SCORE_DEFINITION,
    disclaimers: {
      short: SHORT_DISCLAIMER,
      full: FULL_DISCLAIMER,
      practitioner: PRACTITIONER_DISCLAIMER,
    },
  };
}
