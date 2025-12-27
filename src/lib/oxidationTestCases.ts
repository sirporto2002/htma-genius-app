/**
 * Oxidation Classification Test Cases
 *
 * Regression test dataset for validating oxidation type classification
 * Covers clear cases, boundary cases, and edge scenarios
 *
 * Version: 1.0.1
 */

import { OxidationType } from "./oxidationClassification";

export interface OxidationTestCase {
  id: string;
  description: string;
  mineralValues: {
    Ca: number;
    Mg: number;
    Na: number;
    K: number;
  };
  expectedType: OxidationType;
  note: string;
}

export const OXIDATION_TEST_CASES: OxidationTestCase[] = [
  // === CLEAR FAST OXIDIZER CASES ===
  {
    id: "FAST_01",
    description: "Classic fast oxidizer - all indicators aligned",
    mineralValues: { Ca: 30, Mg: 5, Na: 55, K: 20 },
    expectedType: "fast",
    note: "Low Ca, high Na/K, Ca/K=1.5 (fast), Na/K=2.75 (fast), Ca/Mg=6 (fast)",
  },
  {
    id: "FAST_02",
    description: "Fast oxidizer with high metabolic activity",
    mineralValues: { Ca: 28, Mg: 6, Na: 60, K: 22 },
    expectedType: "fast",
    note: "Very low Ca, very high Na, Ca/K=1.27, Na/K=2.73, strong fast signals",
  },
  {
    id: "FAST_03",
    description: "Fast oxidizer - borderline low Ca/Mg",
    mineralValues: { Ca: 32, Mg: 5.5, Na: 52, K: 19 },
    expectedType: "fast",
    note: "Ca/K=1.68 (fast), Na/K=2.74 (fast), Ca/Mg=5.8 (fast)",
  },

  // === CLEAR SLOW OXIDIZER CASES ===
  {
    id: "SLOW_01",
    description: "Classic slow oxidizer - all indicators aligned",
    mineralValues: { Ca: 60, Mg: 5, Na: 18, K: 6 },
    expectedType: "slow",
    note: "High Ca, low Na/K, Ca/K=10 (slow), Na/K=3 (fast but overridden), Ca/Mg=12 (slow)",
  },
  {
    id: "SLOW_02",
    description: "Slow oxidizer with very low stress response",
    mineralValues: { Ca: 65, Mg: 4.5, Na: 15, K: 5 },
    expectedType: "slow",
    note: "Very high Ca, very low Na/K, Ca/K=13, Na/K=3, Ca/Mg=14.4",
  },
  {
    id: "SLOW_03",
    description: "Slow oxidizer - calcium dominance pattern",
    mineralValues: { Ca: 58, Mg: 4.8, Na: 22, K: 7 },
    expectedType: "slow",
    note: "Ca/K=8.3 (borderline slow), Na/K=3.14, Ca/Mg=12.1 (slow)",
  },

  // === BALANCED OXIDIZER CASES ===
  {
    id: "BALANCED_01",
    description: "Perfect balanced - all minerals optimal",
    mineralValues: { Ca: 45, Mg: 5.5, Na: 35, K: 12 },
    expectedType: "balanced",
    note: "Ca/K=3.75 (optimal), Na/K=2.92 (optimal), Ca/Mg=8.2 (optimal)",
  },
  {
    id: "BALANCED_02",
    description: "Balanced with slight variations but within range",
    mineralValues: { Ca: 42, Mg: 6, Na: 38, K: 14 },
    expectedType: "balanced",
    note: "All values within optimal ranges, Ca/K=3.0, Na/K=2.71",
  },
  {
    id: "BALANCED_03",
    description: "Balanced - upper optimal ranges",
    mineralValues: { Ca: 50, Mg: 6.5, Na: 45, K: 16 },
    expectedType: "balanced",
    note: "Near upper optimal limits but all within range",
  },

  // === MIXED OXIDIZER CASES ===
  {
    id: "MIXED_01",
    description: "Mixed - conflicting Ca/K vs Na/K signals",
    mineralValues: { Ca: 60, Mg: 6, Na: 55, K: 18 },
    expectedType: "mixed",
    note: "Ca high (slow), Na high (fast), Ca/K=3.33 (optimal), Na/K=3.06 (fast), conflicting",
  },
  {
    id: "MIXED_02",
    description: "Mixed - some fast, some slow indicators",
    mineralValues: { Ca: 58, Mg: 4, Na: 25, K: 20 },
    expectedType: "mixed",
    note: "Ca high (slow), K high (fast), Ca/K=2.9 (optimal), Ca/Mg=14.5 (slow)",
  },
  {
    id: "MIXED_03",
    description: "Mixed - adaptive transitional pattern",
    mineralValues: { Ca: 40, Mg: 7, Na: 52, K: 10 },
    expectedType: "mixed",
    note: "Ca optimal, Na high, K optimal, Na/K=5.2 (fast), Ca/Mg=5.7 (fast), partial signals",
  },

  // === BOUNDARY CASES - NEAR THRESHOLDS ===
  {
    id: "BOUNDARY_01",
    description: "Near Ca/K slow threshold (10.0)",
    mineralValues: { Ca: 52, Mg: 5.5, Na: 20, K: 5.2 },
    expectedType: "slow",
    note: "Ca/K=10.0 exactly (threshold), should classify as slow",
  },
  {
    id: "BOUNDARY_02",
    description: "Near Ca/K fast threshold (2.5)",
    mineralValues: { Ca: 32, Mg: 5, Na: 48, K: 12.8 },
    expectedType: "fast",
    note: "Ca/K=2.5 exactly (threshold), Na/K=3.75 (fast), should classify as fast",
  },
  {
    id: "BOUNDARY_03",
    description: "Near Na/K slow threshold (1.8)",
    mineralValues: { Ca: 55, Mg: 5, Na: 14.5, K: 8 },
    expectedType: "slow",
    note: "Na/K=1.81 (just above slow threshold), Ca high, Ca/K=6.875",
  },
  {
    id: "BOUNDARY_04",
    description: "Near Na/K fast threshold (2.8)",
    mineralValues: { Ca: 36, Mg: 6, Na: 47, K: 16.8 },
    expectedType: "balanced",
    note: "Na/K=2.8 exactly (threshold), most minerals optimal, should be balanced",
  },
  {
    id: "BOUNDARY_05",
    description: "Near Ca/Mg slow threshold (10.0)",
    mineralValues: { Ca: 50, Mg: 5.0, Na: 25, K: 10 },
    expectedType: "balanced",
    note: "Ca/Mg=10.0 exactly (threshold), Ca/K=5.0 (optimal), Na/K=2.5 (optimal)",
  },

  // === EDGE CASES ===
  {
    id: "EDGE_01",
    description: "High calcium but optimal ratios",
    mineralValues: { Ca: 58, Mg: 7, Na: 35, K: 13 },
    expectedType: "balanced",
    note: "Ca high but ratios compensate: Ca/K=4.46, Na/K=2.69, Ca/Mg=8.3",
  },
  {
    id: "EDGE_02",
    description: "Low minerals but balanced relationships",
    mineralValues: { Ca: 36, Mg: 4.2, Na: 22, K: 9 },
    expectedType: "balanced",
    note: "All minerals on lower end but within optimal, ratios balanced",
  },
  {
    id: "EDGE_03",
    description: "Multiple borderline values",
    mineralValues: { Ca: 54.9, Mg: 3.95, Na: 50.1, K: 17.9 },
    expectedType: "mixed",
    note: "Ca borderline high, Mg borderline low, Na borderline high, K optimal",
  },
];

/**
 * Get test cases by oxidation type
 */
export function getTestCasesByType(type: OxidationType): OxidationTestCase[] {
  return OXIDATION_TEST_CASES.filter((tc) => tc.expectedType === type);
}

/**
 * Get boundary test cases (those near thresholds)
 */
export function getBoundaryTestCases(): OxidationTestCase[] {
  return OXIDATION_TEST_CASES.filter((tc) => tc.id.startsWith("BOUNDARY_"));
}

/**
 * Get edge test cases
 */
export function getEdgeTestCases(): OxidationTestCase[] {
  return OXIDATION_TEST_CASES.filter((tc) => tc.id.startsWith("EDGE_"));
}
