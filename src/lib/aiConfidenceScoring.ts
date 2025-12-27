/**
 * AI Evidence-Based Confidence Scoring
 *
 * Provides transparent confidence levels for AI-generated insights based on:
 * - Number of abnormal markers supporting the insight
 * - Severity of deviations from ideal ranges
 * - Agreement between ratios and underlying minerals
 * - Oxidation pattern consistency
 *
 * This increases scientific credibility and practitioner trust by showing
 * the strength of evidence behind each AI interpretation.
 *
 * Version: 1.0.0
 */

import { MineralSnapshot, RatioSnapshot } from "./reportSnapshot";
import { OxidationClassification } from "./oxidationClassification";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ConfidenceLevel = "High" | "Moderate" | "Low";

export interface EvidenceItem {
  /** Type of evidence: mineral, ratio, oxidation */
  readonly type: "mineral" | "ratio" | "oxidation" | "pattern";

  /** Description of the evidence */
  readonly description: string;

  /** Weight/importance of this evidence (0-1) */
  readonly weight: number;
}

export interface ConfidenceScore {
  /** Overall confidence level */
  readonly level: ConfidenceLevel;

  /** Confidence percentage (0-100) */
  readonly score: number;

  /** List of evidence supporting this confidence score */
  readonly evidence: ReadonlyArray<EvidenceItem>;

  /** Number of abnormal markers found */
  readonly abnormalCount: number;

  /** Whether multiple independent markers agree */
  readonly hasCorroboration: boolean;
}

// ============================================================================
// CONFIDENCE SCORING ENGINE
// ============================================================================

/**
 * Calculate confidence score based on mineral and ratio data
 *
 * @param minerals - All mineral measurements
 * @param ratios - All calculated ratios
 * @param oxidation - Oxidation classification (optional)
 * @returns Confidence score with evidence
 */
export function calculateConfidenceScore(
  minerals: ReadonlyArray<MineralSnapshot>,
  ratios: ReadonlyArray<RatioSnapshot>,
  oxidation?: OxidationClassification
): ConfidenceScore {
  const evidence: EvidenceItem[] = [];
  let totalWeight = 0;

  // === MINERAL EVIDENCE ===
  const abnormalMinerals = minerals.filter(
    (m) => m.status === "High" || m.status === "Low"
  );

  abnormalMinerals.forEach((mineral) => {
    const deviation = calculateDeviation(
      mineral.value,
      mineral.minIdeal,
      mineral.maxIdeal
    );
    const weight = getDeviationWeight(deviation);

    evidence.push({
      type: "mineral",
      description: `${mineral.name} (${
        mineral.symbol
      }) is ${mineral.status.toLowerCase()} (${mineral.value} ${mineral.unit})`,
      weight,
    });

    totalWeight += weight;
  });

  // === RATIO EVIDENCE ===
  const abnormalRatios = ratios.filter(
    (r) => r.status === "High" || r.status === "Low"
  );

  abnormalRatios.forEach((ratio) => {
    const deviation = calculateDeviation(
      ratio.value,
      ratio.minIdeal,
      ratio.maxIdeal
    );
    const weight = getDeviationWeight(deviation) * 1.2; // Ratios weighted slightly higher

    evidence.push({
      type: "ratio",
      description: `${
        ratio.name
      } ratio is ${ratio.status.toLowerCase()} (${ratio.value.toFixed(2)}) - ${
        ratio.clinicalSignificance
      }`,
      weight,
    });

    totalWeight += weight;
  });

  // === OXIDATION PATTERN EVIDENCE ===
  if (oxidation && oxidation.type !== "balanced") {
    const oxidationWeight = getOxidationWeight(oxidation);

    evidence.push({
      type: "oxidation",
      description: `${
        oxidation.type
      } oxidation type detected (Ca/K: ${oxidation.metadata.ratioValues.caK.toFixed(
        2
      )}, Na/K: ${oxidation.metadata.ratioValues.naK.toFixed(2)})`,
      weight: oxidationWeight,
    });

    totalWeight += oxidationWeight;
  }

  // === PATTERN AGREEMENT (CORROBORATION) ===
  const hasCorroboration = checkCorroboration(minerals, ratios);

  if (hasCorroboration) {
    evidence.push({
      type: "pattern",
      description: "Multiple independent markers show consistent patterns",
      weight: 0.3,
    });

    totalWeight += 0.3;
  }

  // === CALCULATE FINAL CONFIDENCE SCORE ===
  const abnormalCount = abnormalMinerals.length + abnormalRatios.length;
  const maxPossibleWeight = 5.0; // Theoretical maximum weight
  const rawScore = Math.min(100, (totalWeight / maxPossibleWeight) * 100);

  // Adjust score based on abnormal count
  let adjustedScore = rawScore;

  if (abnormalCount === 0) {
    // No abnormalities = low confidence in any specific insight
    adjustedScore = Math.min(rawScore, 30);
  } else if (abnormalCount === 1) {
    // Single marker = moderate confidence at best
    adjustedScore = Math.min(rawScore, 60);
  } else if (abnormalCount >= 5 && hasCorroboration) {
    // Many markers + agreement = boost confidence
    adjustedScore = Math.min(100, rawScore * 1.15);
  }

  const confidenceLevel = getConfidenceLevel(adjustedScore);

  return {
    level: confidenceLevel,
    score: Math.round(adjustedScore),
    evidence: evidence,
    abnormalCount,
    hasCorroboration,
  };
}

/**
 * Extract topic-specific confidence for individual insights
 *
 * @param insightText - The AI-generated insight text
 * @param minerals - All mineral measurements
 * @param ratios - All calculated ratios
 * @returns Confidence score for this specific insight
 */
export function getInsightConfidence(
  insightText: string,
  minerals: ReadonlyArray<MineralSnapshot>,
  ratios: ReadonlyArray<RatioSnapshot>
): ConfidenceScore {
  const evidence: EvidenceItem[] = [];
  let totalWeight = 0;

  // Find which minerals/ratios are mentioned in the insight
  const mentionedMinerals = minerals.filter(
    (m) =>
      insightText.toLowerCase().includes(m.name.toLowerCase()) ||
      insightText.toLowerCase().includes(m.symbol.toLowerCase())
  );

  const mentionedRatios = ratios.filter((r) =>
    insightText.toLowerCase().includes(r.name.toLowerCase().replace("/", ""))
  );

  // Score based on mentioned abnormal markers
  mentionedMinerals
    .filter((m) => m.status === "High" || m.status === "Low")
    .forEach((mineral) => {
      const deviation = calculateDeviation(
        mineral.value,
        mineral.minIdeal,
        mineral.maxIdeal
      );
      const weight = getDeviationWeight(deviation);

      evidence.push({
        type: "mineral",
        description: `${
          mineral.name
        } supports this insight (${mineral.status.toLowerCase()})`,
        weight,
      });

      totalWeight += weight;
    });

  mentionedRatios
    .filter((r) => r.status === "High" || r.status === "Low")
    .forEach((ratio) => {
      const deviation = calculateDeviation(
        ratio.value,
        ratio.minIdeal,
        ratio.maxIdeal
      );
      const weight = getDeviationWeight(deviation) * 1.2;

      evidence.push({
        type: "ratio",
        description: `${
          ratio.name
        } ratio supports this insight (${ratio.status.toLowerCase()})`,
        weight,
      });

      totalWeight += weight;
    });

  // Calculate score
  const abnormalCount = evidence.length;
  const maxWeight = 3.0;
  const rawScore = Math.min(100, (totalWeight / maxWeight) * 100);

  let adjustedScore = rawScore;
  if (abnormalCount === 0) adjustedScore = 20; // No direct evidence
  else if (abnormalCount === 1) adjustedScore = Math.min(rawScore, 55);
  else if (abnormalCount >= 3) adjustedScore = Math.min(100, rawScore * 1.1);

  return {
    level: getConfidenceLevel(adjustedScore),
    score: Math.round(adjustedScore),
    evidence,
    abnormalCount,
    hasCorroboration: abnormalCount >= 2,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate percentage deviation from ideal range
 */
function calculateDeviation(
  value: number,
  minIdeal: number,
  maxIdeal: number
): number {
  if (value < minIdeal) {
    return ((minIdeal - value) / minIdeal) * 100;
  } else if (value > maxIdeal) {
    return ((value - maxIdeal) / maxIdeal) * 100;
  }
  return 0;
}

/**
 * Convert deviation percentage to evidence weight
 * Higher deviations = stronger evidence
 */
function getDeviationWeight(deviationPercent: number): number {
  if (deviationPercent >= 50) return 1.0; // Severe deviation
  if (deviationPercent >= 30) return 0.7; // Moderate deviation
  if (deviationPercent >= 15) return 0.5; // Mild deviation
  return 0.3; // Borderline
}

/**
 * Get weight for oxidation pattern evidence
 */
function getOxidationWeight(oxidation: OxidationClassification): number {
  // Fast/Slow are stronger evidence than mixed
  if (oxidation.type === "fast" || oxidation.type === "slow") {
    return 0.8;
  }
  if (oxidation.type === "mixed") {
    return 0.5;
  }
  return 0.2; // Balanced
}

/**
 * Check if multiple independent markers corroborate
 * (e.g., Ca low + Mg low + Ca/Mg abnormal = strong corroboration)
 */
function checkCorroboration(
  minerals: ReadonlyArray<MineralSnapshot>,
  ratios: ReadonlyArray<RatioSnapshot>
): boolean {
  const abnormalMinerals = minerals.filter(
    (m) => m.status === "High" || m.status === "Low"
  );
  const abnormalRatios = ratios.filter(
    (r) => r.status === "High" || r.status === "Low"
  );

  // Need at least 2 abnormal minerals AND 1 abnormal ratio
  if (abnormalMinerals.length >= 2 && abnormalRatios.length >= 1) {
    // Check if any ratio uses the abnormal minerals
    for (const ratio of abnormalRatios) {
      const hasBothMinerals = abnormalMinerals.some(
        (m) => m.symbol === ratio.numerator || m.symbol === ratio.denominator
      );
      if (hasBothMinerals) return true;
    }
  }

  // Alternative: 3+ abnormal ratios = pattern
  if (abnormalRatios.length >= 3) return true;

  // Alternative: 5+ abnormal minerals = broad pattern
  if (abnormalMinerals.length >= 5) return true;

  return false;
}

/**
 * Convert numeric score to confidence level
 */
function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 70) return "High";
  if (score >= 40) return "Moderate";
  return "Low";
}

// ============================================================================
// UI HELPER FUNCTIONS
// ============================================================================

/**
 * Get color for confidence level (UI display)
 */
export function getConfidenceColor(level: ConfidenceLevel): string {
  switch (level) {
    case "High":
      return "#28a745"; // Green
    case "Moderate":
      return "#ffc107"; // Yellow
    case "Low":
      return "#6c757d"; // Gray
  }
}

/**
 * Get icon for confidence level
 */
export function getConfidenceIcon(level: ConfidenceLevel): string {
  switch (level) {
    case "High":
      return "✓✓✓";
    case "Moderate":
      return "✓✓";
    case "Low":
      return "✓";
  }
}

/**
 * Get description for confidence level
 */
export function getConfidenceDescription(level: ConfidenceLevel): string {
  switch (level) {
    case "High":
      return "Strong evidence from multiple markers";
    case "Moderate":
      return "Moderate evidence from several markers";
    case "Low":
      return "Limited evidence, interpret with caution";
  }
}

/**
 * Format evidence list for display
 */
export function formatEvidence(
  evidence: ReadonlyArray<EvidenceItem>
): string[] {
  return Array.from(evidence)
    .sort((a: EvidenceItem, b: EvidenceItem) => b.weight - a.weight) // Sort by weight (highest first)
    .map((e: EvidenceItem) => e.description);
}
