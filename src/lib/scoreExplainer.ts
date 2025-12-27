/**
 * Health Score Change Explainer
 *
 * Deterministic, rule-based system for explaining why health scores change
 * between analyses. Uses the same weights as healthScore.ts:
 * - Minerals: 60% (4 points per optimal mineral out of 15)
 * - Ratios: 30% (5 points per optimal ratio out of 6)
 * - Red Flags: 10% (penalties for severe issues)
 *
 * Logic is fully transparent and clinically grounded.
 */

import { MineralData } from "../components/HTMAInputForm";
import {
  MINERAL_REFERENCE_RANGES,
  RATIO_REFERENCE_RANGES,
  getMineralStatus,
  getRatioStatus,
  calculateRatio,
  MineralStatus,
} from "./htmaConstants";
import { calculateHealthScore, HealthScoreBreakdown } from "./healthScore";

// ============================================================================
// INTERFACES
// ============================================================================

export interface ScoreExplanation {
  /** Change in total health score */
  scoreDelta: number;

  /** Direction: "improved", "declined", or "unchanged" */
  direction: "improved" | "declined" | "unchanged";

  /** Primary drivers: factors that contributed most to the score change */
  primaryDrivers: string[];

  /** Secondary contributors: smaller but meaningful changes */
  secondaryContributors: string[];

  /** Offsetting factors: improvements that reduced a decline or vice versa */
  offsettingFactors: string[];

  /** Detailed breakdown of changes */
  breakdown: {
    mineralScoreDelta: number;
    ratioScoreDelta: number;
    redFlagScoreDelta: number;
  };
}

interface MineralChange {
  symbol: string;
  name: string;
  oldValue: number;
  newValue: number;
  oldStatus: MineralStatus;
  newStatus: MineralStatus;
  valueDelta: number;
  statusChanged: boolean;
  scoreImpact: number; // How much this changed the mineral component (0-4 points)
}

interface RatioChange {
  name: string;
  oldValue: number;
  newValue: number;
  oldStatus: MineralStatus;
  newStatus: MineralStatus;
  statusChanged: boolean;
  scoreImpact: number; // How much this changed the ratio component (0-5 points)
}

// ============================================================================
// CORE COMPARISON FUNCTION
// ============================================================================

/**
 * Compare two analyses and generate explanation for score change
 *
 * @param previousAnalysis - Older analysis
 * @param currentAnalysis - Newer analysis
 * @returns Structured explanation of what changed
 */
export function explainScoreChange(
  previousAnalysis: {
    mineralData: MineralData;
    healthScore?: HealthScoreBreakdown;
  },
  currentAnalysis: {
    mineralData: MineralData;
    healthScore?: HealthScoreBreakdown;
  }
): ScoreExplanation {
  // Calculate health scores if not provided
  const prevScore =
    previousAnalysis.healthScore ||
    calculateHealthScore(previousAnalysis.mineralData);
  const currScore =
    currentAnalysis.healthScore ||
    calculateHealthScore(currentAnalysis.mineralData);

  const scoreDelta = currScore.totalScore - prevScore.totalScore;

  // Determine direction
  let direction: "improved" | "declined" | "unchanged";
  if (scoreDelta > 2) direction = "improved";
  else if (scoreDelta < -2) direction = "declined";
  else direction = "unchanged";

  // Calculate breakdown deltas
  const breakdown = {
    mineralScoreDelta: currScore.mineralScore - prevScore.mineralScore,
    ratioScoreDelta: currScore.ratioScore - prevScore.ratioScore,
    redFlagScoreDelta: currScore.redFlagScore - prevScore.redFlagScore,
  };

  // Analyze mineral changes
  const mineralChanges = analyzeMineralChanges(
    previousAnalysis.mineralData,
    currentAnalysis.mineralData
  );

  // Analyze ratio changes
  const ratioChanges = analyzeRatioChanges(
    previousAnalysis.mineralData,
    currentAnalysis.mineralData
  );

  // Identify primary drivers, secondary contributors, and offsetting factors
  const { primaryDrivers, secondaryContributors, offsettingFactors } =
    categorizeChanges(mineralChanges, ratioChanges, direction);

  return {
    scoreDelta,
    direction,
    primaryDrivers,
    secondaryContributors,
    offsettingFactors,
    breakdown,
  };
}

// ============================================================================
// MINERAL CHANGE ANALYSIS
// ============================================================================

function analyzeMineralChanges(
  prevData: MineralData,
  currData: MineralData
): MineralChange[] {
  const changes: MineralChange[] = [];

  MINERAL_REFERENCE_RANGES.forEach((ref) => {
    const symbol = ref.symbol.toLowerCase();
    const oldValue = parseFloat((prevData as any)[symbol]) || 0;
    const newValue = parseFloat((currData as any)[symbol]) || 0;

    const oldStatus = getMineralStatus(oldValue, ref.minIdeal, ref.maxIdeal);
    const newStatus = getMineralStatus(newValue, ref.minIdeal, ref.maxIdeal);

    const statusChanged = oldStatus !== newStatus;
    const valueDelta = newValue - oldValue;

    // Calculate score impact (minerals are worth 4 points each when optimal)
    let scoreImpact = 0;
    if (statusChanged) {
      if (oldStatus !== "Optimal" && newStatus === "Optimal") {
        scoreImpact = 4; // Became optimal
      } else if (oldStatus === "Optimal" && newStatus !== "Optimal") {
        scoreImpact = -4; // Left optimal range
      }
    }

    changes.push({
      symbol: ref.symbol,
      name: ref.name,
      oldValue,
      newValue,
      oldStatus,
      newStatus,
      valueDelta,
      statusChanged,
      scoreImpact,
    });
  });

  return changes;
}

// ============================================================================
// RATIO CHANGE ANALYSIS
// ============================================================================

function analyzeRatioChanges(
  prevData: MineralData,
  currData: MineralData
): RatioChange[] {
  const changes: RatioChange[] = [];

  RATIO_REFERENCE_RANGES.forEach((ref) => {
    const prevNumerator =
      parseFloat((prevData as any)[ref.numeratorSymbol.toLowerCase()]) || 0;
    const prevDenominator =
      parseFloat((prevData as any)[ref.denominatorSymbol.toLowerCase()]) || 0;
    const currNumerator =
      parseFloat((currData as any)[ref.numeratorSymbol.toLowerCase()]) || 0;
    const currDenominator =
      parseFloat((currData as any)[ref.denominatorSymbol.toLowerCase()]) || 0;

    const oldValue = calculateRatio(prevNumerator, prevDenominator);
    const newValue = calculateRatio(currNumerator, currDenominator);

    const oldStatus = getRatioStatus(oldValue, ref.minIdeal, ref.maxIdeal);
    const newStatus = getRatioStatus(newValue, ref.minIdeal, ref.maxIdeal);

    const statusChanged = oldStatus !== newStatus;

    // Calculate score impact (ratios are worth 5 points each when optimal)
    let scoreImpact = 0;
    if (statusChanged) {
      if (oldStatus !== "Optimal" && newStatus === "Optimal") {
        scoreImpact = 5; // Became optimal
      } else if (oldStatus === "Optimal" && newStatus !== "Optimal") {
        scoreImpact = -5; // Left optimal range
      }
    }

    changes.push({
      name: ref.name,
      oldValue,
      newValue,
      oldStatus,
      newStatus,
      statusChanged,
      scoreImpact,
    });
  });

  return changes;
}

// ============================================================================
// CHANGE CATEGORIZATION
// ============================================================================

function categorizeChanges(
  mineralChanges: MineralChange[],
  ratioChanges: RatioChange[],
  direction: "improved" | "declined" | "unchanged"
): {
  primaryDrivers: string[];
  secondaryContributors: string[];
  offsettingFactors: string[];
} {
  const primaryDrivers: string[] = [];
  const secondaryContributors: string[] = [];
  const offsettingFactors: string[] = [];

  // Combine all changes with their impacts
  const allChanges: Array<{
    type: "mineral" | "ratio";
    name: string;
    impact: number;
    statusChange: string;
  }> = [];

  // Add mineral changes
  mineralChanges.forEach((change) => {
    if (change.statusChanged) {
      allChanges.push({
        type: "mineral",
        name: change.name,
        impact: change.scoreImpact,
        statusChange: `${change.oldStatus} → ${change.newStatus}`,
      });
    }
  });

  // Add ratio changes
  ratioChanges.forEach((change) => {
    if (change.statusChanged) {
      allChanges.push({
        type: "ratio",
        name: change.name,
        impact: change.scoreImpact,
        statusChange: `${change.oldStatus} → ${change.newStatus}`,
      });
    }
  });

  // Sort by absolute impact
  allChanges.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  // Categorize based on impact and direction
  allChanges.forEach((change, index) => {
    const absImpact = Math.abs(change.impact);
    const isPositive = change.impact > 0;
    const matchesDirection =
      (direction === "improved" && isPositive) ||
      (direction === "declined" && !isPositive);

    let description = "";
    if (change.type === "mineral") {
      description = `${change.name}: ${change.statusChange}`;
    } else {
      description = `${change.name} ratio: ${change.statusChange}`;
    }

    // Primary drivers: top 3 changes that match the direction
    if (index < 3 && matchesDirection && absImpact >= 4) {
      primaryDrivers.push(description);
    }
    // Secondary contributors: next significant changes matching direction
    else if (index < 6 && matchesDirection && absImpact >= 2) {
      secondaryContributors.push(description);
    }
    // Offsetting factors: significant changes going opposite direction
    else if (!matchesDirection && absImpact >= 3) {
      offsettingFactors.push(description);
    }
  });

  // If no primary drivers, add the most significant changes
  if (primaryDrivers.length === 0 && allChanges.length > 0) {
    const topChange = allChanges[0];
    const description =
      topChange.type === "mineral"
        ? `${topChange.name}: ${topChange.statusChange}`
        : `${topChange.name} ratio: ${topChange.statusChange}`;
    primaryDrivers.push(description);
  }

  // Add summary if no changes detected
  if (allChanges.length === 0) {
    primaryDrivers.push("Minimal changes across all minerals and ratios");
  }

  return {
    primaryDrivers,
    secondaryContributors,
    offsettingFactors,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format score delta for display
 * @param delta - Score change
 * @returns Formatted string with +/- and color indicator
 */
export function formatScoreDelta(delta: number): string {
  if (delta > 0) return `+${delta.toFixed(1)}`;
  return delta.toFixed(1);
}

/**
 * Get color for score delta
 * @param delta - Score change
 * @returns CSS color string
 */
export function getScoreDeltaColor(delta: number): string {
  if (delta > 2) return "#10b981"; // Green (improved)
  if (delta < -2) return "#ef4444"; // Red (declined)
  return "#6b7280"; // Gray (unchanged)
}

/**
 * Get icon for score direction
 * @param direction - Score direction
 * @returns Emoji icon
 */
export function getDirectionIcon(
  direction: "improved" | "declined" | "unchanged"
): string {
  if (direction === "improved") return "📈";
  if (direction === "declined") return "📉";
  return "➡️";
}
