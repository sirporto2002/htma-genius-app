/**
 * HTMA Health Score Calculator
 *
 * Calculates a composite health score (0-100) based on:
 * - Mineral Status (60%): How many minerals are in optimal range
 * - Critical Ratios (30%): Balance of key mineral relationships
 * - Red Flags (10%): Severe deficiencies or toxicities
 *
 * IMPORTANT: Score weights and semantics are defined in healthScoreSemantics.ts
 * Do not modify weights here - use centralized constants.
 */

import { MineralData } from "../components/HTMAInputForm";
import {
  MINERAL_REFERENCE_RANGES,
  RATIO_REFERENCE_RANGES,
  getMineralStatus,
  getRatioStatus,
  calculateRatio,
} from "./htmaConstants";
import {
  HEALTH_SCORE_WEIGHTS,
  getGrade,
  HealthScoreGrade,
} from "./healthScoreSemantics";

export interface HealthScoreBreakdown {
  totalScore: number;
  mineralScore: number;
  ratioScore: number;
  redFlagScore: number;
  grade: HealthScoreGrade; // Now using centralized type
  statusCounts: {
    optimal: number;
    low: number;
    high: number;
  };
  criticalIssues: string[];
}

/**
 * Calculate comprehensive HTMA health score
 */
export function calculateHealthScore(
  mineralData: MineralData
): HealthScoreBreakdown {
  // Parse mineral values
  const getValue = (val: string): number => parseFloat(val) || 0;

  const mineralValues = {
    Ca: getValue(mineralData.calcium),
    Mg: getValue(mineralData.magnesium),
    Na: getValue(mineralData.sodium),
    K: getValue(mineralData.potassium),
    P: getValue(mineralData.phosphorus),
    Cu: getValue(mineralData.copper),
    Zn: getValue(mineralData.zinc),
    Fe: getValue(mineralData.iron),
    Mn: getValue(mineralData.manganese),
    Cr: getValue(mineralData.chromium),
    Se: getValue(mineralData.selenium),
    B: getValue(mineralData.boron),
    Co: getValue(mineralData.cobalt),
    Mo: getValue(mineralData.molybdenum),
    S: getValue(mineralData.sulfur),
  };

  // ===== 1. MINERAL STATUS SCORE (weight from semantics) =====
  let optimalCount = 0;
  let lowCount = 0;
  let highCount = 0;

  MINERAL_REFERENCE_RANGES.forEach((ref) => {
    const value = mineralValues[ref.symbol as keyof typeof mineralValues];
    const status = getMineralStatus(value, ref.minIdeal, ref.maxIdeal);

    if (status === "Optimal") optimalCount++;
    else if (status === "Low") lowCount++;
    else if (status === "High") highCount++;
  });

  // Score: 100% if all optimal, decreases linearly
  // Uses centralized weight from healthScoreSemantics.ts
  const mineralScore =
    (optimalCount / 15) * (HEALTH_SCORE_WEIGHTS.MINERAL_WEIGHT * 100);

  // ===== 2. CRITICAL RATIOS SCORE (weight from semantics) =====
  let optimalRatios = 0;

  RATIO_REFERENCE_RANGES.forEach((ref) => {
    const numeratorValue =
      mineralValues[ref.numeratorSymbol as keyof typeof mineralValues];
    const denominatorValue =
      mineralValues[ref.denominatorSymbol as keyof typeof mineralValues];
    const ratioValue = calculateRatio(numeratorValue, denominatorValue);
    const status = getRatioStatus(ratioValue, ref.minIdeal, ref.maxIdeal);

    if (status === "Optimal") optimalRatios++;
  });

  // Uses centralized weight from healthScoreSemantics.ts
  const ratioScore =
    (optimalRatios / 6) * (HEALTH_SCORE_WEIGHTS.RATIO_WEIGHT * 100);

  // ===== 3. RED FLAGS SCORE (weight from semantics) =====
  const criticalIssues: string[] = [];
  let redFlagPenalty = 0;

  // Check for severe deficiencies (< 50% of minimum)
  MINERAL_REFERENCE_RANGES.forEach((ref) => {
    const value = mineralValues[ref.symbol as keyof typeof mineralValues];

    if (value < ref.minIdeal * 0.5) {
      criticalIssues.push(`Severe ${ref.name} deficiency`);
      redFlagPenalty += 2;
    }

    // Check for severe excesses (> 150% of maximum)
    if (value > ref.maxIdeal * 1.5) {
      criticalIssues.push(`Severe ${ref.name} excess`);
      redFlagPenalty += 2;
    }
  });

  // Check for critical ratio imbalances
  const caMgRatio = calculateRatio(mineralValues.Ca, mineralValues.Mg);
  if (caMgRatio > 10 || caMgRatio < 4) {
    criticalIssues.push("Critical Ca/Mg imbalance");
    redFlagPenalty += 1;
  }

  const naKRatio = calculateRatio(mineralValues.Na, mineralValues.K);
  if (naKRatio > 4 || naKRatio < 1.5) {
    criticalIssues.push("Critical Na/K imbalance");
    redFlagPenalty += 1;
  }

  const znCuRatio = calculateRatio(mineralValues.Zn, mineralValues.Cu);
  if (znCuRatio > 10 || znCuRatio < 3) {
    criticalIssues.push("Critical Zn/Cu imbalance");
    redFlagPenalty += 1;
  }

  const redFlagScore = Math.max(
    0,
    HEALTH_SCORE_WEIGHTS.RED_FLAG_WEIGHT * 100 - redFlagPenalty
  );

  // ===== FINAL SCORE =====
  const totalScore = mineralScore + ratioScore + redFlagScore;

  // Grade calculation using centralized semantics
  const grade = getGrade(totalScore);

  return {
    totalScore: Math.round(totalScore),
    mineralScore: Math.round(mineralScore),
    ratioScore: Math.round(ratioScore),
    redFlagScore: Math.round(redFlagScore),
    grade,
    statusCounts: {
      optimal: optimalCount,
      low: lowCount,
      high: highCount,
    },
    criticalIssues,
  };
}

// ============================================================================
// DEPRECATED FUNCTIONS - Use healthScoreSemantics.ts instead
// ============================================================================

/**
 * @deprecated Use getScoreColor from healthScoreSemantics.ts
 * Get color for score display
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return "#10b981"; // green
  if (score >= 75) return "#3b82f6"; // blue
  if (score >= 60) return "#f59e0b"; // amber
  if (score >= 45) return "#f97316"; // orange
  return "#ef4444"; // red
}

/**
 * @deprecated Use getInterpretation from healthScoreSemantics.ts
 * Get interpretation message for score
 */
export function getScoreInterpretation(score: number): string {
  if (score >= 90) return "Optimal mineral balance";
  if (score >= 75) return "Minor mineral imbalances";
  if (score >= 60) return "Moderate mineral imbalance patterns";
  if (score >= 45) return "Significant mineral imbalance patterns";
  return "Severe mineral imbalance patterns";
}
