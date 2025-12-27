/**
 * HTMA Genius — Oxidation Type Classification Engine
 * Version: 1.0.0
 * Reviewed: 2025-12-21
 *
 * Purpose: Pattern classification based on mineral relationships
 * NOT a diagnosis, disease label, treatment directive, or prediction
 */

export const OXIDATION_ENGINE_VERSION = "1.0.0";
export const OXIDATION_ENGINE_REVIEWED_DATE = "2025-12-21";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type OxidationType = "fast" | "slow" | "mixed" | "balanced";

export type MineralStatus = "low" | "optimal" | "high";
export type RatioSignal = "fast" | "slow" | "optimal";
export type ConfidenceLevel = "high" | "moderate" | "low";

export interface OxidationClassification {
  type: OxidationType;
  confidence: ConfidenceLevel;
  indicators: {
    calciumStatus: MineralStatus;
    magnesiumStatus: MineralStatus;
    sodiumStatus: MineralStatus;
    potassiumStatus: MineralStatus;
    ratioSignals: {
      caK: RatioSignal;
      naK: RatioSignal;
      caMg: RatioSignal;
    };
  };
  interpretation: string;
  explanation: string; // Why this classification - deterministic reasoning
  thresholdWarnings: string[]; // Near-threshold cautions
  semanticsVersion: string;
  metadata: {
    mineralValues: {
      ca: number;
      mg: number;
      na: number;
      k: number;
    };
    ratioValues: {
      caK: number;
      naK: number;
      caMg: number;
    };
    alignmentScore: number; // 0-3, how many indicators agree
  };
}

export interface MineralInput {
  Ca: number;
  Mg: number;
  Na: number;
  K: number;
}

// ============================================================================
// REFERENCE RANGES (TEI-Aligned, Locked)
// ============================================================================

const MINERAL_RANGES = {
  Ca: { low: 35, high: 55 },
  Mg: { low: 4.0, high: 7.0 },
  Na: { low: 20, high: 50 },
  K: { low: 8, high: 18 },
} as const;

const RATIO_RANGES = {
  caK: { fast: 2.5, slow: 10 }, // <2.5 = fast, >10 = slow
  naK: { fast: 2.8, slow: 1.8 }, // >2.8 = fast, <1.8 = slow
  caMg: { fast: 6, slow: 10 }, // <6 = fast, >10 = slow
} as const;

// ============================================================================
// LOCKED INTERPRETATIONS
// ============================================================================

const INTERPRETATIONS: Record<OxidationType, string> = {
  slow: "Pattern commonly associated with slower metabolic activity and reduced stress response.",
  fast: "Pattern commonly associated with higher metabolic activity and increased sympathetic drive.",
  mixed:
    "Mixed metabolic signals suggesting adaptive or transitional patterns.",
  balanced:
    "Balanced mineral relationships with no dominant oxidation pattern.",
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getMineralStatus(
  value: number,
  ranges: { low: number; high: number }
): MineralStatus {
  if (value < ranges.low) return "low";
  if (value > ranges.high) return "high";
  return "optimal";
}

function getCaKSignal(ratio: number): RatioSignal {
  if (ratio < RATIO_RANGES.caK.fast) return "fast";
  if (ratio > RATIO_RANGES.caK.slow) return "slow";
  return "optimal";
}

function getNaKSignal(ratio: number): RatioSignal {
  if (ratio > RATIO_RANGES.naK.fast) return "fast";
  if (ratio < RATIO_RANGES.naK.slow) return "slow";
  return "optimal";
}

function getCaMgSignal(ratio: number): RatioSignal {
  if (ratio < RATIO_RANGES.caMg.fast) return "fast";
  if (ratio > RATIO_RANGES.caMg.slow) return "slow";
  return "optimal";
}

// ============================================================================
// CORE CLASSIFICATION LOGIC
// ============================================================================

function classifyOxidationType(
  caStatus: MineralStatus,
  mgStatus: MineralStatus,
  naStatus: MineralStatus,
  kStatus: MineralStatus,
  caKSignal: RatioSignal,
  naKSignal: RatioSignal,
  caMgSignal: RatioSignal
): { type: OxidationType; alignmentScore: number } {
  // Count indicators for each type
  let slowScore = 0;
  let fastScore = 0;

  // Calcium indicators
  if (caStatus === "high") slowScore++;
  if (caStatus === "low") fastScore++;

  // Sodium indicators
  if (naStatus === "low") slowScore++;
  if (naStatus === "high") fastScore++;

  // Potassium indicators
  if (kStatus === "low") slowScore++;
  if (kStatus === "high") fastScore++;

  // Ratio indicators
  if (caKSignal === "slow") slowScore++;
  if (caKSignal === "fast") fastScore++;

  if (naKSignal === "slow") slowScore++;
  if (naKSignal === "fast") fastScore++;

  if (caMgSignal === "slow") slowScore++;
  if (caMgSignal === "fast") fastScore++;

  // Balanced: all or nearly all minerals and ratios optimal
  const allOptimal =
    caStatus === "optimal" &&
    mgStatus === "optimal" &&
    naStatus === "optimal" &&
    kStatus === "optimal" &&
    caKSignal === "optimal" &&
    naKSignal === "optimal" &&
    caMgSignal === "optimal";

  const mostlyOptimal =
    [caStatus, mgStatus, naStatus, kStatus].filter((s) => s === "optimal")
      .length >= 3 &&
    [caKSignal, naKSignal, caMgSignal].filter((s) => s === "optimal").length >=
      2;

  if (allOptimal || mostlyOptimal) {
    return { type: "balanced", alignmentScore: 6 };
  }

  // Mixed: conflicting signals
  if (slowScore > 0 && fastScore > 0 && Math.abs(slowScore - fastScore) <= 1) {
    return { type: "mixed", alignmentScore: Math.max(slowScore, fastScore) };
  }

  // Slow: majority slow indicators (3+)
  if (slowScore >= 3 && slowScore > fastScore) {
    return { type: "slow", alignmentScore: slowScore };
  }

  // Fast: majority fast indicators (3+)
  if (fastScore >= 3 && fastScore > slowScore) {
    return { type: "fast", alignmentScore: fastScore };
  }

  // Default to mixed if unclear
  return { type: "mixed", alignmentScore: Math.max(slowScore, fastScore) };
}

function calculateConfidence(
  alignmentScore: number,
  type: OxidationType
): ConfidenceLevel {
  if (type === "balanced") {
    return alignmentScore >= 6 ? "high" : "moderate";
  }

  if (alignmentScore >= 4) return "high";
  if (alignmentScore >= 2) return "moderate";
  return "low";
}

/**
 * Generate deterministic explanation of why this classification was made
 * v1.0.1 - Educational transparency for practitioner calibration
 */
function generateExplanation(
  type: OxidationType,
  caStatus: MineralStatus,
  mgStatus: MineralStatus,
  naStatus: MineralStatus,
  kStatus: MineralStatus,
  caKSignal: RatioSignal,
  naKSignal: RatioSignal,
  caMgSignal: RatioSignal,
  caK: number,
  naK: number,
  caMg: number
): string {
  const parts: string[] = [];

  // Start with type classification
  parts.push(`Classified as ${type.toUpperCase()} oxidizer based on:`);

  // Ratio signals (primary drivers)
  const ratioSignals: string[] = [];
  if (caKSignal === "fast")
    ratioSignals.push(`Ca/K ratio ${caK.toFixed(1)} indicates fast (< 2.5)`);
  if (caKSignal === "slow")
    ratioSignals.push(`Ca/K ratio ${caK.toFixed(1)} indicates slow (> 10)`);
  if (caKSignal === "optimal")
    ratioSignals.push(`Ca/K ratio ${caK.toFixed(1)} is optimal (2.5-10)`);

  if (naKSignal === "fast")
    ratioSignals.push(`Na/K ratio ${naK.toFixed(1)} indicates fast (> 2.8)`);
  if (naKSignal === "slow")
    ratioSignals.push(`Na/K ratio ${naK.toFixed(1)} indicates slow (< 1.8)`);
  if (naKSignal === "optimal")
    ratioSignals.push(`Na/K ratio ${naK.toFixed(1)} is optimal (1.8-2.8)`);

  if (caMgSignal === "fast")
    ratioSignals.push(`Ca/Mg ratio ${caMg.toFixed(1)} indicates fast (< 6)`);
  if (caMgSignal === "slow")
    ratioSignals.push(`Ca/Mg ratio ${caMg.toFixed(1)} indicates slow (> 10)`);
  if (caMgSignal === "optimal")
    ratioSignals.push(`Ca/Mg ratio ${caMg.toFixed(1)} is optimal (6-10)`);

  if (ratioSignals.length > 0) {
    parts.push("Ratio signals: " + ratioSignals.join("; "));
  }

  // Mineral status (supporting evidence)
  const mineralSignals: string[] = [];
  if (caStatus === "high") mineralSignals.push("Ca elevated (supports slow)");
  if (caStatus === "low") mineralSignals.push("Ca low (supports fast)");
  if (naStatus === "high") mineralSignals.push("Na elevated (supports fast)");
  if (naStatus === "low") mineralSignals.push("Na low (supports slow)");
  if (kStatus === "high") mineralSignals.push("K elevated (supports fast)");
  if (kStatus === "low") mineralSignals.push("K low (supports slow)");

  if (mineralSignals.length > 0) {
    parts.push("Mineral status: " + mineralSignals.join("; "));
  }

  // Type-specific notes
  if (type === "balanced") {
    parts.push("All or most indicators within optimal ranges");
  } else if (type === "mixed") {
    parts.push(
      "Conflicting signals suggest adaptive or transitional metabolic state"
    );
  }

  return parts.join(". ") + ".";
}

/**
 * Detect if any ratio values are near threshold boundaries
 * Within 5% proximity triggers caution note
 * v1.0.1 - Helps identify borderline cases
 */
function detectThresholdProximity(
  caK: number,
  naK: number,
  caMg: number
): string[] {
  const warnings: string[] = [];
  const PROXIMITY_PERCENT = 0.05; // 5% threshold

  // Ca/K thresholds: 2.5 (fast) and 10 (slow)
  const caKFastThreshold = RATIO_RANGES.caK.fast;
  const caKSlowThreshold = RATIO_RANGES.caK.slow;

  if (
    Math.abs(caK - caKFastThreshold) / caKFastThreshold <=
    PROXIMITY_PERCENT
  ) {
    warnings.push(
      `Ca/K ratio (${caK.toFixed(
        2
      )}) is within 5% of fast threshold (${caKFastThreshold})`
    );
  }
  if (
    Math.abs(caK - caKSlowThreshold) / caKSlowThreshold <=
    PROXIMITY_PERCENT
  ) {
    warnings.push(
      `Ca/K ratio (${caK.toFixed(
        2
      )}) is within 5% of slow threshold (${caKSlowThreshold})`
    );
  }

  // Na/K thresholds: 1.8 (slow) and 2.8 (fast)
  const naKSlowThreshold = RATIO_RANGES.naK.slow;
  const naKFastThreshold = RATIO_RANGES.naK.fast;

  if (
    Math.abs(naK - naKSlowThreshold) / naKSlowThreshold <=
    PROXIMITY_PERCENT
  ) {
    warnings.push(
      `Na/K ratio (${naK.toFixed(
        2
      )}) is within 5% of slow threshold (${naKSlowThreshold})`
    );
  }
  if (
    Math.abs(naK - naKFastThreshold) / naKFastThreshold <=
    PROXIMITY_PERCENT
  ) {
    warnings.push(
      `Na/K ratio (${naK.toFixed(
        2
      )}) is within 5% of fast threshold (${naKFastThreshold})`
    );
  }

  // Ca/Mg thresholds: 6 (fast) and 10 (slow)
  const caMgFastThreshold = RATIO_RANGES.caMg.fast;
  const caMgSlowThreshold = RATIO_RANGES.caMg.slow;

  if (
    Math.abs(caMg - caMgFastThreshold) / caMgFastThreshold <=
    PROXIMITY_PERCENT
  ) {
    warnings.push(
      `Ca/Mg ratio (${caMg.toFixed(
        2
      )}) is within 5% of fast threshold (${caMgFastThreshold})`
    );
  }
  if (
    Math.abs(caMg - caMgSlowThreshold) / caMgSlowThreshold <=
    PROXIMITY_PERCENT
  ) {
    warnings.push(
      `Ca/Mg ratio (${caMg.toFixed(
        2
      )}) is within 5% of slow threshold (${caMgSlowThreshold})`
    );
  }

  return warnings;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Classify oxidation type from mineral values
 *
 * @param minerals - Core mineral values (Ca, Mg, Na, K)
 * @returns Complete oxidation classification with confidence and interpretation
 */
export function classifyOxidation(
  minerals: MineralInput
): OxidationClassification {
  const { Ca, Mg, Na, K } = minerals;

  // Validate inputs - return safe fallback instead of throwing
  if (!Ca || !Mg || !Na || !K || Ca <= 0 || Mg <= 0 || Na <= 0 || K <= 0) {
    console.warn(
      "⚠️ Oxidation classification skipped: invalid or missing mineral values"
    );

    // Return safe fallback object
    return {
      type: "balanced" as OxidationType,
      confidence: "low" as ConfidenceLevel,
      indicators: {
        calciumStatus: "optimal" as MineralStatus,
        magnesiumStatus: "optimal" as MineralStatus,
        sodiumStatus: "optimal" as MineralStatus,
        potassiumStatus: "optimal" as MineralStatus,
        ratioSignals: {
          caK: "optimal" as RatioSignal,
          naK: "optimal" as RatioSignal,
          caMg: "optimal" as RatioSignal,
        },
      },
      interpretation: "Classification unavailable - insufficient mineral data",
      explanation:
        "Cannot classify oxidation type: one or more required minerals (Ca, Mg, Na, K) are missing or invalid",
      thresholdWarnings: ["Incomplete mineral data provided"],
      semanticsVersion: OXIDATION_ENGINE_VERSION,
      metadata: {
        mineralValues: {
          ca: Ca || 0,
          mg: Mg || 0,
          na: Na || 0,
          k: K || 0,
        },
        ratioValues: {
          caK: 0,
          naK: 0,
          caMg: 0,
        },
        alignmentScore: 0,
      },
    };
  }

  // Calculate ratios
  const caK = Ca / K;
  const naK = Na / K;
  const caMg = Ca / Mg;

  // Determine mineral statuses
  const caStatus = getMineralStatus(Ca, MINERAL_RANGES.Ca);
  const mgStatus = getMineralStatus(Mg, MINERAL_RANGES.Mg);
  const naStatus = getMineralStatus(Na, MINERAL_RANGES.Na);
  const kStatus = getMineralStatus(K, MINERAL_RANGES.K);

  // Determine ratio signals
  const caKSignal = getCaKSignal(caK);
  const naKSignal = getNaKSignal(naK);
  const caMgSignal = getCaMgSignal(caMg);

  // Classify type and get alignment score
  const { type, alignmentScore } = classifyOxidationType(
    caStatus,
    mgStatus,
    naStatus,
    kStatus,
    caKSignal,
    naKSignal,
    caMgSignal
  );

  // Calculate confidence
  const confidence = calculateConfidence(alignmentScore, type);

  // Generate deterministic explanation
  const explanation = generateExplanation(
    type,
    caStatus,
    mgStatus,
    naStatus,
    kStatus,
    caKSignal,
    naKSignal,
    caMgSignal,
    caK,
    naK,
    caMg
  );

  // Detect near-threshold warnings
  const thresholdWarnings = detectThresholdProximity(caK, naK, caMg);

  // Build result
  return {
    type,
    confidence,
    indicators: {
      calciumStatus: caStatus,
      magnesiumStatus: mgStatus,
      sodiumStatus: naStatus,
      potassiumStatus: kStatus,
      ratioSignals: {
        caK: caKSignal,
        naK: naKSignal,
        caMg: caMgSignal,
      },
    },
    interpretation: INTERPRETATIONS[type],
    explanation,
    thresholdWarnings,
    semanticsVersion: OXIDATION_ENGINE_VERSION,
    metadata: {
      mineralValues: {
        ca: Math.round(Ca * 10) / 10,
        mg: Math.round(Mg * 10) / 10,
        na: Math.round(Na * 10) / 10,
        k: Math.round(K * 10) / 10,
      },
      ratioValues: {
        caK: Math.round(caK * 10) / 10,
        naK: Math.round(naK * 10) / 10,
        caMg: Math.round(caMg * 10) / 10,
      },
      alignmentScore,
    },
  };
}

/**
 * Get human-readable oxidation type label
 */
export function getOxidationTypeLabel(type: OxidationType): string {
  const labels: Record<OxidationType, string> = {
    fast: "Fast Oxidizer",
    slow: "Slow Oxidizer",
    mixed: "Mixed Oxidizer",
    balanced: "Balanced Oxidizer",
  };
  return labels[type];
}

/**
 * Get confidence level description (practitioner mode only)
 */
export function getConfidenceDescription(confidence: ConfidenceLevel): string {
  const descriptions: Record<ConfidenceLevel, string> = {
    high: "Strong agreement across multiple indicators (3+)",
    moderate: "Partial agreement across indicators (2)",
    low: "Conflicting or unclear indicators",
  };
  return descriptions[confidence];
}
