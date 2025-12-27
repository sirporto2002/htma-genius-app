/**
 * HTMA Ratio Calculation Engine
 *
 * Centralized, deterministic engine for calculating all mineral ratios.
 * Ensures consistency across reports, UI, and audit trails.
 *
 * IMPORTANT: This is the SINGLE SOURCE OF TRUTH for ratio calculations.
 * Do not calculate ratios elsewhere in the codebase.
 */

import {
  RATIO_REFERENCE_RANGES,
  RatioReferenceRange,
  MineralStatus,
  getRatioStatus,
  calculateRatio,
  ANALYSIS_ENGINE_VERSION,
} from "./htmaConstants";

// ============================================================================
// RATIO RESULT INTERFACE
// ============================================================================

export interface RatioResult {
  /** Ratio name (e.g., "Ca/Mg") */
  readonly name: string;

  /** Numerator symbol (e.g., "Ca") */
  readonly numerator: string;

  /** Denominator symbol (e.g., "Mg") */
  readonly denominator: string;

  /** Calculated ratio value */
  readonly value: number;

  /** Ideal minimum value */
  readonly idealMin: number;

  /** Ideal maximum value */
  readonly idealMax: number;

  /** Status: "Low", "Optimal", or "High" */
  readonly status: MineralStatus;

  /** Clinical significance / interpretation key */
  readonly interpretationKey: string;

  /** Engine version used for this calculation */
  readonly engineVersion: string;
}

// ============================================================================
// MINERAL VALUE MAP
// ============================================================================

export interface MineralValues {
  readonly Ca: number;
  readonly Mg: number;
  readonly Na: number;
  readonly K: number;
  readonly P: number;
  readonly Cu: number;
  readonly Zn: number;
  readonly Fe: number;
  readonly [key: string]: number;
}

// ============================================================================
// RATIO CALCULATION ENGINE
// ============================================================================

/**
 * Calculate a single ratio with full metadata
 *
 * Pure function - always returns same output for same input
 *
 * @param ratioRef - Reference range definition
 * @param mineralValues - Map of mineral symbols to values
 * @returns Complete ratio result with status and interpretation
 */
export function calculateRatioResult(
  ratioRef: RatioReferenceRange,
  mineralValues: MineralValues
): RatioResult {
  const numeratorValue = mineralValues[ratioRef.numeratorSymbol] || 0;
  const denominatorValue = mineralValues[ratioRef.denominatorSymbol] || 0;

  const value = calculateRatio(numeratorValue, denominatorValue);
  const status = getRatioStatus(value, ratioRef.minIdeal, ratioRef.maxIdeal);

  return {
    name: ratioRef.name,
    numerator: ratioRef.numeratorSymbol,
    denominator: ratioRef.denominatorSymbol,
    value,
    idealMin: ratioRef.minIdeal,
    idealMax: ratioRef.maxIdeal,
    status,
    interpretationKey: ratioRef.clinicalSignificance,
    engineVersion: ANALYSIS_ENGINE_VERSION,
  };
}

/**
 * Calculate all 6 critical ratios
 *
 * This is the ONLY function that should be used to calculate ratios
 * throughout the application. Ensures consistency and traceability.
 *
 * @param mineralValues - Map of mineral symbols to values
 * @returns Array of all ratio results in display order
 */
export function calculateAllRatios(
  mineralValues: MineralValues
): ReadonlyArray<RatioResult> {
  return RATIO_REFERENCE_RANGES.map((ratioRef) =>
    calculateRatioResult(ratioRef, mineralValues)
  );
}

/**
 * Get ratio result by name (e.g., "Ca/Mg")
 *
 * @param ratioName - Name of the ratio
 * @param mineralValues - Map of mineral symbols to values
 * @returns Ratio result or undefined if not found
 */
export function getRatioByName(
  ratioName: string,
  mineralValues: MineralValues
): RatioResult | undefined {
  const ratioRef = RATIO_REFERENCE_RANGES.find((r) => r.name === ratioName);
  if (!ratioRef) return undefined;

  return calculateRatioResult(ratioRef, mineralValues);
}

/**
 * Calculate ratios and return only those with non-optimal status
 * Useful for highlighting concerning ratios in reports
 *
 * @param mineralValues - Map of mineral symbols to values
 * @returns Array of ratio results with Low or High status
 */
export function getNonOptimalRatios(
  mineralValues: MineralValues
): ReadonlyArray<RatioResult> {
  return calculateAllRatios(mineralValues).filter(
    (ratio) => ratio.status !== "Optimal"
  );
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate that all required minerals are present for ratio calculations
 *
 * @param mineralValues - Map of mineral symbols to values
 * @returns True if all required minerals are present
 */
export function hasRequiredMineralsForRatios(
  mineralValues: Partial<MineralValues>
): mineralValues is MineralValues {
  const requiredSymbols = new Set<string>();

  RATIO_REFERENCE_RANGES.forEach((ratio) => {
    requiredSymbols.add(ratio.numeratorSymbol);
    requiredSymbols.add(ratio.denominatorSymbol);
  });

  return Array.from(requiredSymbols).every(
    (symbol) => typeof mineralValues[symbol] === "number"
  );
}
