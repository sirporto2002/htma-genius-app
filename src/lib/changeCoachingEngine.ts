/**
 * Change Coaching Engine
 *
 * Generates guardrail-safe focus guidance based on score delta explanations.
 * This engine provides FOCUS and PRIORITIES, not advice or recommendations.
 *
 * CRITICAL SAFETY CONSTRAINTS:
 * ❌ NO action verbs (take, start, increase, add, supplement)
 * ❌ NO substances or protocols
 * ❌ NO diagnoses or disease language
 * ✅ ONLY neutral verbs: monitor, observe, prioritize, review, track
 * ✅ ONLY educational, awareness-building language
 * ✅ ALWAYS includes scope notice
 *
 * @version 1.0.0
 * @reviewedDate 2025-12-21
 */

import { ScoreDeltaExplanation, DeltaDriver } from "./scoreDeltaExplainer";
import { HEALTH_SCORE_SEMANTICS_VERSION } from "./healthScoreSemantics";

// ============================================================================
// TYPES
// ============================================================================

export type FocusConfidence = "high" | "moderate" | "low";
export type FocusDomain = "mineral" | "ratio" | "redFlag";

export interface FocusItem {
  domain: FocusDomain;
  key: string; // e.g., "Mg", "Ca/Mg", "Low Zinc"
  importance: number; // 0-100
  direction: "improving" | "worsening" | "stable";
  impactPoints: number;
  reason: string; // Why this is a focus area
}

export interface ChangeFocusSummary {
  primaryFocus: FocusItem;
  secondaryFocus: FocusItem[];
  explanation: string; // 2-3 sentences, neutral language
  confidence: FocusConfidence;
  scopeNotice: string; // Always included disclaimer
  metadata: {
    version: string;
    semanticsVersion: string;
    audience: "consumer" | "practitioner";
    computedAt: string;
  };
}

// ============================================================================
// BLOCKED LANGUAGE (Safety Enforcement)
// ============================================================================

const BLOCKED_ACTION_VERBS = [
  "take",
  "start",
  "stop",
  "increase",
  "decrease",
  "add",
  "remove",
  "supplement",
  "dose",
  "prescribe",
  "treat",
  "cure",
  "fix",
  "heal",
  "boost",
  "reduce",
];

const BLOCKED_SUBSTANCE_TERMS = [
  "mg",
  "mcg",
  "IU",
  "tablet",
  "capsule",
  "pill",
  "medication",
  "drug",
  "supplement",
];

const ALLOWED_NEUTRAL_VERBS = [
  "monitor",
  "observe",
  "track",
  "review",
  "prioritize",
  "focus on",
  "pay attention to",
  "watch",
  "note",
  "consider discussing with",
];

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Generate change-focused coaching summary
 *
 * Analyzes delta drivers to determine what the user should focus on
 * (monitor, observe) without prescribing actions.
 */
export function generateChangeFocusSummary(
  delta: ScoreDeltaExplanation,
  audience: "consumer" | "practitioner"
): ChangeFocusSummary {
  // === STEP 1: Rank Focus Areas ===
  const focusItems = rankFocusAreas(delta);

  if (focusItems.length === 0) {
    // Edge case: no significant changes
    return createStableFocusSummary(audience);
  }

  const primaryFocus = focusItems[0];
  const secondaryFocus = focusItems.slice(1, 3); // Top 2-3 secondary

  // === STEP 2: Determine Confidence ===
  const confidence = determineConfidence(delta, focusItems);

  // === STEP 3: Generate Explanation ===
  const explanation = generateExplanation(
    primaryFocus,
    secondaryFocus,
    delta,
    audience
  );

  // === STEP 4: Scope Notice ===
  const scopeNotice = getScopeNotice(audience);

  // === STEP 5: Safety Check ===
  validateLanguageSafety(explanation);

  return {
    primaryFocus,
    secondaryFocus,
    explanation,
    confidence,
    scopeNotice,
    metadata: {
      version: "1.0.0",
      semanticsVersion: HEALTH_SCORE_SEMANTICS_VERSION,
      audience,
      computedAt: new Date().toISOString(),
    },
  };
}

// ============================================================================
// FOCUS RANKING
// ============================================================================

function rankFocusAreas(delta: ScoreDeltaExplanation): FocusItem[] {
  const items: FocusItem[] = [];

  // Process all drivers
  delta.allDrivers.forEach((driver) => {
    const importance = calculateImportance(driver);

    if (importance < 10) return; // Skip low-importance items

    // Map direction from DeltaDriver (improved/worsened/unchanged) to FocusItem (improving/worsening/stable)
    const direction: "improving" | "worsening" | "stable" =
      driver.direction === "improved"
        ? "improving"
        : driver.direction === "worsened"
        ? "worsening"
        : "stable";
    const reason = generateFocusReason(driver);

    items.push({
      domain: driver.type,
      key: driver.key,
      importance,
      direction,
      impactPoints: driver.impactPoints,
      reason,
    });
  });

  // Sort by importance (descending)
  items.sort((a, b) => b.importance - a.importance);

  return items;
}

function calculateImportance(driver: DeltaDriver): number {
  let importance = 0;

  // Factor 1: Absolute impact on score
  importance += Math.abs(driver.impactPoints) * 10; // Scale up

  // Factor 2: Direction (worsening is more important)
  if (driver.direction === "worsened") {
    importance += 20;
  } else if (driver.direction === "improved") {
    importance += 10;
  }

  // Factor 3: Type priority (red flags most important)
  if (driver.type === "redFlag") {
    importance += 30;
  } else if (driver.type === "ratio") {
    importance += 15;
  } else {
    importance += 5;
  }

  // Factor 4: Status severity
  if (driver.to === "high" || driver.to === "low") {
    importance += 15;
  }

  // Factor 5: Movement into critical range
  if (
    driver.from === "optimal" &&
    (driver.to === "high" || driver.to === "low")
  ) {
    importance += 25; // Moving OUT of optimal is critical
  }

  return Math.min(importance, 100); // Cap at 100
}

function generateFocusReason(driver: DeltaDriver): string {
  const { type, direction, from, to, impactPoints } = driver;

  let reason = "";

  // Build reason based on what changed
  if (type === "redFlag") {
    if (direction === "worsened") {
      reason = `New critical issue emerged, contributing ${Math.abs(
        impactPoints
      )} point impact`;
    } else {
      reason = `Critical issue resolved, improving score by ${impactPoints} points`;
    }
  } else if (type === "ratio") {
    if (direction === "worsened") {
      reason = `Ratio moved from ${from} to ${to}, reducing score by ${Math.abs(
        impactPoints
      )} points`;
    } else if (direction === "improved") {
      reason = `Ratio improved from ${from} to ${to}, adding ${impactPoints} points`;
    } else {
      reason = `Ratio status unchanged at ${to}`;
    }
  } else {
    // mineral
    if (direction === "worsened") {
      reason = `Mineral moved from ${from} to ${to}, impacting score by ${Math.abs(
        impactPoints
      )} points`;
    } else if (direction === "improved") {
      reason = `Mineral improved from ${from} to ${to}, contributing ${impactPoints} points`;
    } else {
      reason = `Mineral status unchanged at ${to}`;
    }
  }

  return reason;
}

// ============================================================================
// CONFIDENCE DETERMINATION
// ============================================================================

function determineConfidence(
  delta: ScoreDeltaExplanation,
  focusItems: FocusItem[]
): FocusConfidence {
  // High confidence if:
  // - Clear primary focus (importance > 70)
  // - Consistent direction among top items
  // - Large score change

  if (focusItems.length === 0) {
    return "low";
  }

  const primaryImportance = focusItems[0].importance;
  const scoreChangeMagnitude = Math.abs(delta.delta);

  // Check direction consistency
  const topThree = focusItems.slice(0, 3);
  const worseningCount = topThree.filter(
    (f) => f.direction === "worsening"
  ).length;
  const improvingCount = topThree.filter(
    (f) => f.direction === "improving"
  ).length;

  const isConsistent =
    worseningCount >= 2 || improvingCount >= 2 || topThree.length === 1;

  if (primaryImportance >= 70 && scoreChangeMagnitude >= 10 && isConsistent) {
    return "high";
  } else if (primaryImportance >= 50 || scoreChangeMagnitude >= 5) {
    return "moderate";
  } else {
    return "low";
  }
}

// ============================================================================
// EXPLANATION GENERATION
// ============================================================================

function generateExplanation(
  primary: FocusItem,
  secondary: FocusItem[],
  delta: ScoreDeltaExplanation,
  audience: "consumer" | "practitioner"
): string {
  let explanation = "";

  // Sentence 1: Primary focus
  if (audience === "consumer") {
    explanation += `Your primary focus area is ${formatFocusKey(
      primary.key,
      primary.domain
    )}. `;

    if (primary.direction === "worsening") {
      explanation += `This area declined and contributed ${Math.abs(
        primary.impactPoints
      )} point${
        Math.abs(primary.impactPoints) === 1 ? "" : "s"
      } to the score change. `;
    } else if (primary.direction === "improving") {
      explanation += `This area improved and contributed ${
        primary.impactPoints
      } point${primary.impactPoints === 1 ? "" : "s"} to your progress. `;
    } else {
      explanation += `This area requires monitoring despite stable status. `;
    }
  } else {
    // Practitioner mode
    explanation += `Primary clinical priority: ${formatFocusKey(
      primary.key,
      primary.domain
    )} (${primary.direction}, ${Math.abs(
      primary.impactPoints
    )} point impact). `;
  }

  // Sentence 2: Secondary contributors (if significant)
  if (secondary.length > 0) {
    const secondaryKeys = secondary
      .map((s) => formatFocusKey(s.key, s.domain))
      .join(", ");

    if (audience === "consumer") {
      explanation += `Also pay attention to: ${secondaryKeys}. `;
    } else {
      explanation += `Secondary contributors: ${secondaryKeys}. `;
    }
  }

  // Sentence 3: Context and next steps (neutral)
  if (audience === "consumer") {
    explanation += `Review these patterns with your healthcare provider during your next consultation.`;
  } else {
    explanation += `Consider multi-driver pattern in clinical context.`;
  }

  return explanation;
}

function formatFocusKey(key: string, domain: FocusDomain): string {
  if (domain === "ratio") {
    return `${key} balance`;
  } else if (domain === "redFlag") {
    return key; // Already formatted (e.g., "Low Zinc")
  } else {
    return key; // Mineral symbol (e.g., "Mg")
  }
}

// ============================================================================
// SCOPE NOTICE
// ============================================================================

function getScopeNotice(audience: "consumer" | "practitioner"): string {
  if (audience === "consumer") {
    return "This summary identifies focus areas for observation and discussion with your healthcare provider. It does not diagnose conditions or recommend treatments.";
  } else {
    return "Clinical coaching intelligence for practitioner review. Not diagnostic. Educational framework only.";
  }
}

// ============================================================================
// STABLE FOCUS (Edge Case)
// ============================================================================

function createStableFocusSummary(
  audience: "consumer" | "practitioner"
): ChangeFocusSummary {
  const stableFocus: FocusItem = {
    domain: "mineral",
    key: "Overall Balance",
    importance: 50,
    direction: "stable",
    impactPoints: 0,
    reason: "All markers showed minimal change",
  };

  return {
    primaryFocus: stableFocus,
    secondaryFocus: [],
    explanation:
      audience === "consumer"
        ? "Your mineral patterns remain relatively stable. Continue monitoring overall balance and maintain consistency with your current protocol."
        : "Stable pattern observed. Maintain current monitoring protocol.",
    confidence: "moderate",
    scopeNotice: getScopeNotice(audience),
    metadata: {
      version: "1.0.0",
      semanticsVersion: HEALTH_SCORE_SEMANTICS_VERSION,
      audience,
      computedAt: new Date().toISOString(),
    },
  };
}

// ============================================================================
// LANGUAGE SAFETY VALIDATION
// ============================================================================

/**
 * Validates that generated text contains no blocked language
 * Throws error if unsafe language detected (fail-safe)
 */
function validateLanguageSafety(text: string): void {
  const lowerText = text.toLowerCase();

  // Check for blocked action verbs
  for (const verb of BLOCKED_ACTION_VERBS) {
    if (lowerText.includes(` ${verb} `)) {
      throw new Error(
        `GUARDRAIL VIOLATION: Blocked action verb detected: "${verb}"`
      );
    }
  }

  // Check for blocked substance terms
  for (const term of BLOCKED_SUBSTANCE_TERMS) {
    if (lowerText.includes(term)) {
      throw new Error(
        `GUARDRAIL VIOLATION: Blocked substance term detected: "${term}"`
      );
    }
  }

  // Verify at least one allowed verb is present
  const hasAllowedVerb = ALLOWED_NEUTRAL_VERBS.some((verb) =>
    lowerText.includes(verb)
  );

  if (!hasAllowedVerb) {
    console.warn(
      "WARNING: No neutral verbs detected. Text may be too passive."
    );
  }
}

// ============================================================================
// UTILITY: CONFIDENCE LABEL
// ============================================================================

export function getConfidenceLabel(confidence: FocusConfidence): string {
  return {
    high: "High confidence",
    moderate: "Moderate confidence",
    low: "Low confidence - multiple factors",
  }[confidence];
}
