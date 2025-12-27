/**
 * HTMA Genius - Shared Constants & Reference Standards
 * Single source of truth for mineral ranges, ratio thresholds, and clinical interpretation
 *
 * DO NOT modify these values without documenting version changes
 * These constants are used for:
 * - PDF report generation (immutable snapshots)
 * - UI display and charts
 * - Clinical interpretations
 * - Audit trails
 */

// ============================================================================
// VERSION METADATA
// ============================================================================

export const HTMA_GENIUS_VERSION = "1.0.0";
export const ANALYSIS_ENGINE_VERSION = "1.0.0";
export const AI_MODEL = "Gemini 1.5 Pro";
export const PROMPT_VERSION = "1.2.0"; // Updated for 15 minerals
export const REFERENCE_STANDARD = "TEI (Trace Elements Inc.)";

// ============================================================================
// MINERAL REFERENCE RANGES (TEI Standards)
// ============================================================================

export interface MineralReferenceRange {
  readonly symbol: string;
  readonly name: string;
  readonly minIdeal: number;
  readonly maxIdeal: number;
  readonly unit: string;
  readonly displayOrder: number;
}

export const MINERAL_REFERENCE_RANGES: ReadonlyArray<MineralReferenceRange> = [
  {
    symbol: "Ca",
    name: "Calcium",
    minIdeal: 35,
    maxIdeal: 45,
    unit: "mg%",
    displayOrder: 1,
  },
  {
    symbol: "Mg",
    name: "Magnesium",
    minIdeal: 4,
    maxIdeal: 8,
    unit: "mg%",
    displayOrder: 2,
  },
  {
    symbol: "Na",
    name: "Sodium",
    minIdeal: 20,
    maxIdeal: 30,
    unit: "mg%",
    displayOrder: 3,
  },
  {
    symbol: "K",
    name: "Potassium",
    minIdeal: 8,
    maxIdeal: 12,
    unit: "mg%",
    displayOrder: 4,
  },
  {
    symbol: "P",
    name: "Phosphorus",
    minIdeal: 14,
    maxIdeal: 18,
    unit: "mg%",
    displayOrder: 5,
  },
  {
    symbol: "Cu",
    name: "Copper",
    minIdeal: 2.0,
    maxIdeal: 3.0,
    unit: "mg%",
    displayOrder: 6,
  },
  {
    symbol: "Zn",
    name: "Zinc",
    minIdeal: 12,
    maxIdeal: 18,
    unit: "mg%",
    displayOrder: 7,
  },
  {
    symbol: "Fe",
    name: "Iron",
    minIdeal: 1.5,
    maxIdeal: 2.5,
    unit: "mg%",
    displayOrder: 8,
  },
  {
    symbol: "Mn",
    name: "Manganese",
    minIdeal: 0.04,
    maxIdeal: 0.08,
    unit: "mg%",
    displayOrder: 9,
  },
  {
    symbol: "Cr",
    name: "Chromium",
    minIdeal: 0.06,
    maxIdeal: 0.1,
    unit: "mg%",
    displayOrder: 10,
  },
  {
    symbol: "Se",
    name: "Selenium",
    minIdeal: 0.08,
    maxIdeal: 0.12,
    unit: "mg%",
    displayOrder: 11,
  },
  {
    symbol: "B",
    name: "Boron",
    minIdeal: 0.2,
    maxIdeal: 0.3,
    unit: "mg%",
    displayOrder: 12,
  },
  {
    symbol: "Co",
    name: "Cobalt",
    minIdeal: 0.004,
    maxIdeal: 0.006,
    unit: "mg%",
    displayOrder: 13,
  },
  {
    symbol: "Mo",
    name: "Molybdenum",
    minIdeal: 0.04,
    maxIdeal: 0.06,
    unit: "mg%",
    displayOrder: 14,
  },
  {
    symbol: "S",
    name: "Sulfur",
    minIdeal: 4000,
    maxIdeal: 5000,
    unit: "mg%",
    displayOrder: 15,
  },
] as const;

// ============================================================================
// RATIO REFERENCE RANGES
// ============================================================================

export interface RatioReferenceRange {
  readonly name: string;
  readonly numeratorSymbol: string;
  readonly denominatorSymbol: string;
  readonly minIdeal: number;
  readonly maxIdeal: number;
  readonly displayOrder: number;
  readonly clinicalSignificance: string;
}

export const RATIO_REFERENCE_RANGES: ReadonlyArray<RatioReferenceRange> = [
  {
    name: "Ca/Mg",
    numeratorSymbol: "Ca",
    denominatorSymbol: "Mg",
    minIdeal: 6.0,
    maxIdeal: 7.5,
    displayOrder: 1,
    clinicalSignificance: "Thyroid and metabolic rate",
  },
  {
    name: "Na/K",
    numeratorSymbol: "Na",
    denominatorSymbol: "K",
    minIdeal: 2.0,
    maxIdeal: 3.0,
    displayOrder: 2,
    clinicalSignificance: "Adrenal function and stress response",
  },
  {
    name: "Ca/P",
    numeratorSymbol: "Ca",
    denominatorSymbol: "P",
    minIdeal: 2.4,
    maxIdeal: 2.8,
    displayOrder: 3,
    clinicalSignificance: "Bone metabolism and parathyroid function",
  },
  {
    name: "Zn/Cu",
    numeratorSymbol: "Zn",
    denominatorSymbol: "Cu",
    minIdeal: 5.0,
    maxIdeal: 7.0,
    displayOrder: 4,
    clinicalSignificance: "Immune function and hormonal balance",
  },
  {
    name: "Fe/Cu",
    numeratorSymbol: "Fe",
    denominatorSymbol: "Cu",
    minIdeal: 0.6,
    maxIdeal: 1.0,
    displayOrder: 5,
    clinicalSignificance: "Oxygen transport and energy production",
  },
  {
    name: "Ca/K",
    numeratorSymbol: "Ca",
    denominatorSymbol: "K",
    minIdeal: 3.5,
    maxIdeal: 4.5,
    displayOrder: 6,
    clinicalSignificance: "Thyroid activity and metabolic rate",
  },
] as const;

// ============================================================================
// STATUS THRESHOLDS & COLORS
// ============================================================================

export const STATUS_THRESHOLDS = {
  /** Multiplier for determining "Low" threshold (e.g., 0.7 = 70% of minimum) */
  LOW_THRESHOLD_MULTIPLIER: 0.7,
  /** Multiplier for determining "High" threshold (e.g., 1.3 = 130% of maximum) */
  HIGH_THRESHOLD_MULTIPLIER: 1.3,
} as const;

export type MineralStatus = "Low" | "Optimal" | "High";

export const STATUS_COLORS = {
  Optimal: {
    background: "#d4edda",
    text: "#155724",
    rgb: [40, 167, 69] as const,
  },
  Low: {
    background: "#fff3cd",
    text: "#856404",
    rgb: [220, 53, 69] as const,
  },
  High: {
    background: "#f8d7da",
    text: "#721c24",
    rgb: [220, 53, 69] as const,
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS (Pure, Stateless)
// ============================================================================

/**
 * Determine mineral status based on value and reference range
 * Pure function - always returns same output for same input
 */
export function getMineralStatus(
  value: number,
  minIdeal: number,
  maxIdeal: number
): MineralStatus {
  if (value < minIdeal * STATUS_THRESHOLDS.LOW_THRESHOLD_MULTIPLIER) {
    return "Low";
  }
  if (value > maxIdeal * STATUS_THRESHOLDS.HIGH_THRESHOLD_MULTIPLIER) {
    return "High";
  }
  return "Optimal";
}

/**
 * Determine ratio status based on calculated value and ideal range
 * Pure function - always returns same output for same input
 */
export function getRatioStatus(
  value: number,
  minIdeal: number,
  maxIdeal: number
): MineralStatus {
  if (value === 0) return "Low";
  if (value < minIdeal) return "Low";
  if (value > maxIdeal) return "High";
  return "Optimal";
}

/**
 * Get mineral reference range by symbol
 */
export function getMineralReferenceBySymbol(
  symbol: string
): MineralReferenceRange | undefined {
  return MINERAL_REFERENCE_RANGES.find((m) => m.symbol === symbol);
}

/**
 * Calculate a ratio given two mineral values
 * Returns 0 if denominator is 0 (division by zero protection)
 */
export function calculateRatio(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return numerator / denominator;
}

// ============================================================================
// MINERAL SYMBOL MAPPING
// ============================================================================

export const MINERAL_SYMBOLS = {
  calcium: "Ca",
  magnesium: "Mg",
  sodium: "Na",
  potassium: "K",
  phosphorus: "P",
  copper: "Cu",
  zinc: "Zn",
  iron: "Fe",
  manganese: "Mn",
  chromium: "Cr",
  selenium: "Se",
  boron: "B",
  cobalt: "Co",
  molybdenum: "Mo",
  sulfur: "S",
} as const;

// ============================================================================
// TOXIC ELEMENTS REFERENCE RANGES (TEI Standards)
// ============================================================================

/**
 * Toxic Elements - Display-only, non-scoring
 * These elements are shown for environmental context only
 * They DO NOT affect health score, oxidation classification, or AI insights
 */
export interface ToxicElementReference {
  readonly key: string;
  readonly name: string;
  readonly symbol: string;
  readonly referenceHigh: number;
  readonly unit: string;
  readonly displayOrder: number;
}

export const TOXIC_ELEMENT_REFERENCES: ReadonlyArray<ToxicElementReference> = [
  {
    key: "Sb",
    name: "Antimony",
    symbol: "Sb",
    referenceHigh: 0.06,
    unit: "mg%",
    displayOrder: 1,
  },
  {
    key: "As",
    name: "Arsenic",
    symbol: "As",
    referenceHigh: 0.08,
    unit: "mg%",
    displayOrder: 2,
  },
  {
    key: "Hg",
    name: "Mercury",
    symbol: "Hg",
    referenceHigh: 0.8,
    unit: "mg%",
    displayOrder: 3,
  },
  {
    key: "Be",
    name: "Beryllium",
    symbol: "Be",
    referenceHigh: 0.02,
    unit: "mg%",
    displayOrder: 4,
  },
  {
    key: "Cd",
    name: "Cadmium",
    symbol: "Cd",
    referenceHigh: 0.06,
    unit: "mg%",
    displayOrder: 5,
  },
  {
    key: "Pb",
    name: "Lead",
    symbol: "Pb",
    referenceHigh: 0.6,
    unit: "mg%",
    displayOrder: 6,
  },
  {
    key: "Al",
    name: "Aluminum",
    symbol: "Al",
    referenceHigh: 1.0,
    unit: "mg%",
    displayOrder: 7,
  },
] as const;

// ============================================================================
// ADDITIONAL ELEMENTS (TEI Standards)
// ============================================================================

/**
 * Additional Elements - Display-only, observational context
 * These elements are shown for informational purposes only
 * They DO NOT affect health score, oxidation classification, or AI insights
 */
export interface AdditionalElementReference {
  readonly key: string;
  readonly name: string;
  readonly symbol: string;
  readonly unit: string;
  readonly displayOrder: number;
}

export const ADDITIONAL_ELEMENT_REFERENCES: ReadonlyArray<AdditionalElementReference> =
  [
    {
      key: "Ge",
      name: "Germanium",
      symbol: "Ge",
      unit: "mg%",
      displayOrder: 1,
    },
    {
      key: "Ba",
      name: "Barium",
      symbol: "Ba",
      unit: "mg%",
      displayOrder: 2,
    },
    {
      key: "Bi",
      name: "Bismuth",
      symbol: "Bi",
      unit: "mg%",
      displayOrder: 3,
    },
    {
      key: "Rb",
      name: "Rubidium",
      symbol: "Rb",
      unit: "mg%",
      displayOrder: 4,
    },
    {
      key: "Li",
      name: "Lithium",
      symbol: "Li",
      unit: "mg%",
      displayOrder: 5,
    },
    {
      key: "Ni",
      name: "Nickel",
      symbol: "Ni",
      unit: "mg%",
      displayOrder: 6,
    },
    {
      key: "Pt",
      name: "Platinum",
      symbol: "Pt",
      unit: "mg%",
      displayOrder: 7,
    },
    {
      key: "Ti",
      name: "Titanium",
      symbol: "Ti",
      unit: "mg%",
      displayOrder: 8,
    },
    {
      key: "V",
      name: "Vanadium",
      symbol: "V",
      unit: "mg%",
      displayOrder: 9,
    },
    {
      key: "Sr",
      name: "Strontium",
      symbol: "Sr",
      unit: "mg%",
      displayOrder: 10,
    },
    {
      key: "Sn",
      name: "Tin",
      symbol: "Sn",
      unit: "mg%",
      displayOrder: 11,
    },
    {
      key: "W",
      name: "Tungsten",
      symbol: "W",
      unit: "mg%",
      displayOrder: 12,
    },
    {
      key: "Zr",
      name: "Zirconium",
      symbol: "Zr",
      unit: "mg%",
      displayOrder: 13,
    },
  ] as const;

/**
 * Get toxic element reference by symbol
 */
export function getToxicElementReference(
  symbol: string
): ToxicElementReference | undefined {
  return TOXIC_ELEMENT_REFERENCES.find(
    (e) => e.key === symbol || e.symbol === symbol
  );
}

/**
 * Get additional element reference by symbol
 */
export function getAdditionalElementReference(
  symbol: string
): AdditionalElementReference | undefined {
  return ADDITIONAL_ELEMENT_REFERENCES.find(
    (e) => e.key === symbol || e.symbol === symbol
  );
}
