/**
 * Trend Explainer
 *
 * Analyzes patterns across 3+ HTMA analyses to identify improving/worsening trends.
 * Provides deterministic, rule-based explanations tied to locked health score semantics.
 *
 * NO AI, NO SPECULATION, NON-DIAGNOSTIC.
 *
 * @version 1.0.0
 * @reviewedDate 2025-12-21
 */

import { HEALTH_SCORE_SEMANTICS_VERSION } from "./healthScoreSemantics";

// ============================================================================
// TYPES
// ============================================================================

export type TrendDirection = "improving" | "stable" | "declining" | "volatile";
export type TrendStrength = "strong" | "moderate" | "weak";

export interface TrendDataPoint {
  date: string; // ISO 8601
  score: number;
  minerals: Record<string, number>;
  ratios?: Record<string, number>;
  flags?: string[];
}

export interface TrendPattern {
  direction: TrendDirection;
  strength: TrendStrength;
  scoreDelta: number; // Total change from first to last
  avgChangePerPeriod: number; // Average change between consecutive analyses
  consistency: number; // 0-1, how consistent is the trend
}

export interface MineralTrend {
  mineral: string;
  direction: TrendDirection;
  pattern:
    | "consistent"
    | "improving-then-declining"
    | "declining-then-improving"
    | "erratic";
  note: string;
}

export interface TrendExplanation {
  overall: TrendPattern;
  headline: string; // e.g., "Health Score improving steadily over 3 months"
  summary: string; // 2-3 sentence explanation
  keyInsights: string[]; // 3-5 bullet points
  mineralTrends: MineralTrend[]; // Top 5 minerals with notable trends
  timespan: {
    firstDate: string;
    lastDate: string;
    periodCount: number;
    avgDaysBetween: number;
  };
  engine: {
    version: string;
    semanticsVersion: string;
    computedAt: string;
  };
}

// ============================================================================
// TREND ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Analyze trends across 3+ analyses
 *
 * Requires at least 3 data points for meaningful trend analysis.
 * Returns deterministic explanation based on statistical patterns.
 */
export function analyzeTrends(
  dataPoints: TrendDataPoint[]
): TrendExplanation | null {
  // Require at least 3 data points
  if (dataPoints.length < 3) {
    return null;
  }

  // Sort by date (oldest first)
  const sorted = [...dataPoints].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // === OVERALL SCORE TREND ===
  const overall = analyzeScoreTrend(sorted);

  // === MINERAL TRENDS ===
  const mineralTrends = analyzeMineralTrends(sorted);

  // === TIMESPAN CALCULATION ===
  const firstDate = sorted[0].date;
  const lastDate = sorted[sorted.length - 1].date;
  const periodCount = sorted.length - 1;

  const daysBetweenPairs = [];
  for (let i = 1; i < sorted.length; i++) {
    const days =
      (new Date(sorted[i].date).getTime() -
        new Date(sorted[i - 1].date).getTime()) /
      (1000 * 60 * 60 * 24);
    daysBetweenPairs.push(days);
  }
  const avgDaysBetween =
    daysBetweenPairs.reduce((sum, d) => sum + d, 0) / daysBetweenPairs.length;

  // === GENERATE EXPLANATION ===
  const headline = generateHeadline(overall, sorted.length);
  const summary = generateSummary(overall, mineralTrends);
  const keyInsights = generateKeyInsights(overall, mineralTrends);

  return {
    overall,
    headline,
    summary,
    keyInsights,
    mineralTrends: mineralTrends.slice(0, 5), // Top 5
    timespan: {
      firstDate,
      lastDate,
      periodCount,
      avgDaysBetween: Math.round(avgDaysBetween),
    },
    engine: {
      version: "1.0.0",
      semanticsVersion: HEALTH_SCORE_SEMANTICS_VERSION,
      computedAt: new Date().toISOString(),
    },
  };
}

// ============================================================================
// SCORE TREND ANALYSIS
// ============================================================================

function analyzeScoreTrend(sorted: TrendDataPoint[]): TrendPattern {
  const scores = sorted.map((d) => d.score);
  const scoreDelta = scores[scores.length - 1] - scores[0];

  // Calculate consecutive deltas
  const deltas = [];
  for (let i = 1; i < scores.length; i++) {
    deltas.push(scores[i] - scores[i - 1]);
  }
  const avgChangePerPeriod =
    deltas.reduce((sum, d) => sum + d, 0) / deltas.length;

  // Determine direction
  let direction: TrendDirection;
  if (Math.abs(scoreDelta) < 3) {
    direction = "stable";
  } else if (scoreDelta > 0) {
    // Check for volatility (if deltas have opposite signs)
    const positiveCount = deltas.filter((d) => d > 0).length;
    const negativeCount = deltas.filter((d) => d < 0).length;
    if (positiveCount > 0 && negativeCount > 0 && Math.abs(scoreDelta) < 8) {
      direction = "volatile";
    } else {
      direction = "improving";
    }
  } else {
    const positiveCount = deltas.filter((d) => d > 0).length;
    const negativeCount = deltas.filter((d) => d < 0).length;
    if (positiveCount > 0 && negativeCount > 0 && Math.abs(scoreDelta) < 8) {
      direction = "volatile";
    } else {
      direction = "declining";
    }
  }

  // Determine strength
  let strength: TrendStrength;
  if (Math.abs(scoreDelta) < 5) {
    strength = "weak";
  } else if (Math.abs(scoreDelta) < 15) {
    strength = "moderate";
  } else {
    strength = "strong";
  }

  // Calculate consistency (0-1)
  // High consistency = all deltas have same sign
  const positiveCount = deltas.filter((d) => d > 0).length;
  const negativeCount = deltas.filter((d) => d < 0).length;
  const consistency =
    deltas.length === 0
      ? 1
      : Math.max(positiveCount, negativeCount) / deltas.length;

  return {
    direction,
    strength,
    scoreDelta: Math.round(scoreDelta * 10) / 10,
    avgChangePerPeriod: Math.round(avgChangePerPeriod * 10) / 10,
    consistency: Math.round(consistency * 100) / 100,
  };
}

// ============================================================================
// MINERAL TREND ANALYSIS
// ============================================================================

function analyzeMineralTrends(sorted: TrendDataPoint[]): MineralTrend[] {
  const trends: MineralTrend[] = [];

  // Get all minerals that appear in data
  const allMinerals = new Set<string>();
  sorted.forEach((dp) => {
    Object.keys(dp.minerals).forEach((m) => allMinerals.add(m));
  });

  // Analyze each mineral
  allMinerals.forEach((mineral) => {
    const values = sorted
      .map((dp) => dp.minerals[mineral])
      .filter((v) => v !== undefined && !isNaN(v));

    if (values.length < 3) return; // Skip if not enough data

    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const delta = lastValue - firstValue;
    const percentChange = (delta / firstValue) * 100;

    // Calculate pattern
    const deltas = [];
    for (let i = 1; i < values.length; i++) {
      deltas.push(values[i] - values[i - 1]);
    }

    const positiveCount = deltas.filter((d) => d > 0).length;
    const negativeCount = deltas.filter((d) => d < 0).length;

    let direction: TrendDirection;
    let pattern: MineralTrend["pattern"];

    // Determine direction
    if (Math.abs(percentChange) < 5) {
      direction = "stable";
      pattern = "consistent";
    } else if (positiveCount > negativeCount * 2) {
      direction = "improving";
      pattern = "consistent";
    } else if (negativeCount > positiveCount * 2) {
      direction = "declining";
      pattern = "consistent";
    } else if (positiveCount > 0 && negativeCount > 0) {
      direction = "volatile";
      // Determine specific pattern
      const midpoint = Math.floor(deltas.length / 2);
      const firstHalfPositive = deltas
        .slice(0, midpoint)
        .filter((d) => d > 0).length;
      const secondHalfPositive = deltas
        .slice(midpoint)
        .filter((d) => d > 0).length;

      if (firstHalfPositive > secondHalfPositive) {
        pattern = "improving-then-declining";
      } else if (secondHalfPositive > firstHalfPositive) {
        pattern = "declining-then-improving";
      } else {
        pattern = "erratic";
      }
    } else {
      direction = delta > 0 ? "improving" : "declining";
      pattern = "consistent";
    }

    // Generate note
    let note = "";
    if (direction === "stable") {
      note = `${mineral} remained stable (${Math.abs(percentChange).toFixed(
        1
      )}% change)`;
    } else if (direction === "improving") {
      note = `${mineral} improved by ${percentChange.toFixed(1)}%`;
    } else if (direction === "declining") {
      note = `${mineral} decreased by ${Math.abs(percentChange).toFixed(1)}%`;
    } else {
      note = `${mineral} showed ${pattern.replace(
        /-/g,
        " "
      )} pattern (${percentChange.toFixed(1)}% net change)`;
    }

    trends.push({
      mineral,
      direction,
      pattern,
      note,
    });
  });

  // Sort by importance (declining/volatile first, then largest absolute changes)
  return trends.sort((a, b) => {
    // Prioritize declining/volatile
    const aPriority =
      a.direction === "declining" || a.direction === "volatile" ? 1 : 0;
    const bPriority =
      b.direction === "declining" || b.direction === "volatile" ? 1 : 0;
    if (aPriority !== bPriority) return bPriority - aPriority;

    // Then sort by pattern complexity
    const aComplexity = a.pattern === "consistent" ? 0 : 1;
    const bComplexity = b.pattern === "consistent" ? 0 : 1;
    return bComplexity - aComplexity;
  });
}

// ============================================================================
// EXPLANATION GENERATION
// ============================================================================

function generateHeadline(trend: TrendPattern, count: number): string {
  const directionText = {
    improving: "improving steadily",
    stable: "remaining stable",
    declining: "showing decline",
    volatile: "fluctuating",
  }[trend.direction];

  return `Health Score ${directionText} over ${count} analyses`;
}

function generateSummary(
  trend: TrendPattern,
  mineralTrends: MineralTrend[]
): string {
  let summary = "";

  if (trend.direction === "improving") {
    summary = `Your health score has improved by ${Math.abs(
      trend.scoreDelta
    )} points, with an average gain of ${Math.abs(
      trend.avgChangePerPeriod
    ).toFixed(1)} points per test. `;

    const improvingMinerals = mineralTrends
      .filter((m) => m.direction === "improving")
      .slice(0, 3);
    if (improvingMinerals.length > 0) {
      summary += `Key improvements: ${improvingMinerals
        .map((m) => m.mineral)
        .join(", ")}.`;
    }
  } else if (trend.direction === "declining") {
    summary = `Your health score has declined by ${Math.abs(
      trend.scoreDelta
    )} points, with an average decrease of ${Math.abs(
      trend.avgChangePerPeriod
    ).toFixed(1)} points per test. `;

    const decliningMinerals = mineralTrends
      .filter((m) => m.direction === "declining")
      .slice(0, 3);
    if (decliningMinerals.length > 0) {
      summary += `Areas needing attention: ${decliningMinerals
        .map((m) => m.mineral)
        .join(", ")}.`;
    }
  } else if (trend.direction === "stable") {
    summary = `Your health score has remained relatively stable (${trend.scoreDelta} point change). `;
    summary +=
      "This consistency suggests your current protocol is maintaining balance.";
  } else {
    summary = `Your health score has shown volatility, changing by an average of ${Math.abs(
      trend.avgChangePerPeriod
    ).toFixed(1)} points between tests. `;
    summary +=
      "This variability may indicate recent protocol changes or lifestyle factors.";
  }

  return summary;
}

function generateKeyInsights(
  trend: TrendPattern,
  mineralTrends: MineralTrend[]
): string[] {
  const insights: string[] = [];

  // Insight 1: Overall trajectory
  if (trend.direction === "improving") {
    insights.push(
      `Consistent improvement: ${
        trend.consistency >= 0.8 ? "Strong" : "Moderate"
      } upward trajectory with ${(trend.consistency * 100).toFixed(
        0
      )}% consistency`
    );
  } else if (trend.direction === "declining") {
    insights.push(
      `Declining trend: ${(trend.consistency * 100).toFixed(
        0
      )}% of tests showed decrease`
    );
  } else if (trend.direction === "stable") {
    insights.push(
      `Maintained balance: Score variance within ${Math.abs(
        trend.scoreDelta
      )} points`
    );
  } else {
    insights.push(
      `Volatile pattern: Score fluctuated with ${(
        trend.consistency * 100
      ).toFixed(0)}% directional consistency`
    );
  }

  // Insight 2: Top improving minerals
  const improving = mineralTrends.filter((m) => m.direction === "improving");
  if (improving.length > 0) {
    insights.push(
      `Improving minerals: ${improving
        .slice(0, 3)
        .map((m) => m.mineral)
        .join(", ")}`
    );
  }

  // Insight 3: Top declining minerals
  const declining = mineralTrends.filter((m) => m.direction === "declining");
  if (declining.length > 0) {
    insights.push(
      `Declining minerals: ${declining
        .slice(0, 3)
        .map((m) => m.mineral)
        .join(", ")}`
    );
  }

  // Insight 4: Volatile minerals
  const volatile = mineralTrends.filter((m) => m.direction === "volatile");
  if (volatile.length > 0) {
    insights.push(
      `Fluctuating: ${volatile
        .slice(0, 2)
        .map((m) => m.mineral)
        .join(", ")} showing variable patterns`
    );
  }

  // Insight 5: Rate of change
  if (trend.direction !== "stable") {
    insights.push(
      `Average change: ${Math.abs(trend.avgChangePerPeriod).toFixed(
        1
      )} points per test period`
    );
  }

  return insights.slice(0, 5); // Limit to 5 insights
}
