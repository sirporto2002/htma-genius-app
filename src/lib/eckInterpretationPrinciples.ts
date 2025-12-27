/**
 * ECK (Dr. Paul Eck) Interpretation Principles
 *
 * This module contains foundational interpretation principles from
 * Dr. Paul Eck's pioneering work in Hair Tissue Mineral Analysis (HTMA)
 * and mineral balancing.
 *
 * ⚠️ IMPORTANT: These are NOT computational rules or algorithms.
 * They are philosophical context for:
 * - Practitioner education
 * - Interpretation framing
 * - Understanding mineral relationships
 * - Historical/scientific context
 *
 * DO NOT use this text to:
 * - Generate AI insights
 * - Create scoring thresholds
 * - Infer health conditions
 * - Suggest medical actions
 *
 * Version: 1.0.0
 * Source: Dr. Paul Eck's HTMA Mineral Balancing principles
 * Last updated: December 22, 2025
 */

export interface ECKPrinciple {
  readonly id: number;
  readonly title: string;
  readonly principle: string;
  readonly category?:
    | "minerals"
    | "ratios"
    | "oxidation"
    | "patterns"
    | "general";
}

/**
 * Core interpretation principles from Dr. Paul Eck's work
 * Arranged by fundamental concepts in HTMA interpretation
 */
export const ECK_PRINCIPLES: ReadonlyArray<ECKPrinciple> = [
  {
    id: 1,
    title: "High and low mineral levels can both be problematic",
    principle:
      "A mineral that is excessively high or low may be equally difficult for the body to utilize. Both extremes can indicate imbalance rather than adequacy.",
    category: "minerals",
  },
  {
    id: 2,
    title: "Mineral ratios are more important than individual levels",
    principle:
      "The relationship between minerals (ratios) often provides more insight than individual mineral levels alone. Minerals work synergistically and antagonistically with each other.",
    category: "ratios",
  },
  {
    id: 3,
    title: "HTMA reveals trends, not acute conditions",
    principle:
      "Hair analysis reflects mineral patterns over 2-3 months of hair growth, representing longer-term metabolic tendencies rather than immediate or acute states.",
    category: "general",
  },
  {
    id: 4,
    title: "Oxidation rate reflects metabolic activity",
    principle:
      "The oxidation rate, determined by calcium, magnesium, sodium, and potassium levels and their ratios, indicates the rate of cellular energy production and metabolic activity.",
    category: "oxidation",
  },
  {
    id: 5,
    title: "Ideal levels exist within a range, not a single number",
    principle:
      "Reference ranges represent a spectrum of healthy values. Being at the lower or upper end of the reference range may still indicate a tendency that, when combined with other factors, suggests a pattern.",
    category: "general",
  },
  {
    id: 6,
    title: "Calcium-to-magnesium ratio reflects thyroid activity patterns",
    principle:
      "The Ca/Mg ratio is associated with thyroid function patterns. A very high ratio may suggest a slow oxidation pattern, while a very low ratio may suggest a fast oxidation pattern.",
    category: "ratios",
  },
  {
    id: 7,
    title: "Sodium-to-potassium ratio reflects adrenal activity patterns",
    principle:
      "The Na/K ratio is associated with adrenal function patterns and stress response. Imbalances in this ratio may reflect patterns related to stress adaptation and vitality.",
    category: "ratios",
  },
  {
    id: 8,
    title: "Hidden mineral deficiencies can exist despite normal levels",
    principle:
      "A mineral may appear normal in hair but be unavailable at the cellular level due to other mineral imbalances. The presence of high levels of one mineral can mask or create deficiency patterns in another.",
    category: "patterns",
  },
  {
    id: 9,
    title: "Mineral patterns are more significant than single values",
    principle:
      "A constellation of mineral imbalances creates patterns that are more interpretively valuable than focusing on any single mineral in isolation.",
    category: "patterns",
  },
  {
    id: 10,
    title: "Fast and slow oxidation represent different metabolic states",
    principle:
      "Fast oxidizers tend to have lower calcium and magnesium with higher sodium and potassium, associated with higher sympathetic nervous system activity. Slow oxidizers show the opposite pattern, associated with lower metabolic activity.",
    category: "oxidation",
  },
  {
    id: 11,
    title: "HTMA is a screening tool, not a diagnostic test",
    principle:
      "Hair analysis is used to identify patterns and tendencies that may warrant further investigation or support, not to diagnose disease or medical conditions.",
    category: "general",
  },
  {
    id: 12,
    title: "Toxic metals can displace essential minerals",
    principle:
      "Heavy metals such as mercury, lead, cadmium, and arsenic can interfere with essential mineral utilization and may occupy binding sites intended for beneficial minerals.",
    category: "minerals",
  },
  {
    id: 13,
    title: "Mineral imbalances develop over time",
    principle:
      "Patterns seen in HTMA typically reflect long-standing imbalances rather than recent changes. Correction may also require sustained effort over time.",
    category: "general",
  },
  {
    id: 14,
    title: "The body compensates for mineral imbalances",
    principle:
      "The body has adaptive mechanisms to maintain function despite mineral imbalances. These compensatory patterns may themselves create secondary imbalances.",
    category: "patterns",
  },
  {
    id: 15,
    title: "Retesting shows progress and pattern evolution",
    principle:
      "Periodic retesting allows tracking of how mineral patterns change over time, providing insight into whether interventions are moving patterns in a favorable direction.",
    category: "general",
  },
] as const;

/**
 * Attribution text for Dr. Paul Eck
 */
export const ECK_ATTRIBUTION =
  "Interpretation principles adapted from the work of Dr. Paul Eck (HTMA Mineral Balancing).";

/**
 * UI-safe attribution for practitioner panels, PDFs, and tooltips
 */
export const ECK_UI_ATTRIBUTION =
  "Interpretation principles adapted from the work of Dr. Paul Eck, pioneer of mineral balancing and HTMA analysis.";

/**
 * Full attribution with biographical context
 */
export const ECK_FULL_ATTRIBUTION =
  "Dr. Paul Eck (1925-1996) was a pioneer in the field of hair tissue mineral analysis and developed the metabolic typing system based on oxidation rates. His work established foundational principles for interpreting mineral relationships and patterns.";

// ============================================================================
// THE NINE MOST IMPORTANT RULES (UI-READY, PRACTITIONER-FACING)
// ============================================================================

/**
 * UI-ready header for the Nine Rules
 * Use this in practitioner panels, PDF appendices, or educational sections
 */
export const ECK_NINE_RULES_HEADER = {
  title: "🧭 HTMA Interpretation Principles",
  subtitle: "Based on the work of Dr. Paul Eck",
  description:
    "These principles describe how mineral patterns behave in Hair Tissue Mineral Analysis (HTMA). They are provided for interpretive context only and are not diagnostic or prescriptive.",
};

/**
 * The Nine Most Important Rules in HTMA Mineral Balancing
 *
 * ✅ Practitioner-only
 * ✅ Educational, not prescriptive
 * ✅ Static (non-AI)
 * ✅ Legally safe
 * ✅ Drop-in ready for UI panels, tooltips, or PDF appendices
 *
 * Recommended UI placements:
 * - Practitioner-only collapsible panels
 * - "Interpretation Framework" sections
 * - PDF appendices (clearly labeled educational content)
 * - Validation / explainability views
 * - Onboarding or practitioner education flows
 */
export interface ECKCoreRule {
  readonly number: number;
  readonly title: string;
  readonly explanation: string;
}

export const ECK_NINE_RULES: ReadonlyArray<ECKCoreRule> = [
  {
    number: 1,
    title: "High and Low Mineral Levels Can Both Be Problematic",
    explanation:
      "A mineral that appears excessively high or excessively low may be equally difficult for the body to utilize effectively. Both extremes can reflect imbalance rather than adequacy.",
  },
  {
    number: 2,
    title: "Mineral Levels May Not Reflect True Tissue Status",
    explanation:
      "Mineral values on a hair test may not always represent true functional status. A mineral can appear within the reference range while still being functionally deficient or excessive due to stress, antagonisms, or compensatory mechanisms.",
  },
  {
    number: 3,
    title: "Low Levels Do Not Necessarily Rise With Direct Supplementation",
    explanation:
      "A mineral that appears low on an HTMA does not reliably increase simply by adding that mineral. Mineral balance is governed by broader physiological relationships, not isolated intake.",
  },
  {
    number: 4,
    title: "Long-Standing Imbalances Require Time to Shift",
    explanation:
      "The longer a mineral ratio or metabolic pattern has been out of balance, the longer it may take to normalize. Changes in HTMA patterns typically occur gradually over multiple test cycles.",
  },
  {
    number: 5,
    title: "Fast and Slow Patterns Do Not Change Symmetrically",
    explanation:
      "It is generally easier for fast metabolic patterns to slow than for slow patterns to accelerate. This asymmetry reflects underlying physiological energy dynamics.",
  },
  {
    number: 6,
    title: "Minerals Often Shift Together to Preserve Ratios",
    explanation:
      "Minerals frequently rise or fall in combination to preserve key ratios. As a result, absolute mineral values may change while ratios remain relatively stable.",
  },
  {
    number: 7,
    title: "Ratios Often Normalize Before Individual Mineral Levels",
    explanation:
      "During rebalancing, mineral ratios commonly improve before absolute mineral values normalize. This can make individual mineral levels appear temporarily more abnormal despite overall improvement.",
  },
  {
    number: 8,
    title: "Mineral Interactions Are Context-Dependent",
    explanation:
      "The effect of a mineral on another mineral can vary depending on the individual's metabolic state. The same mineral may raise or lower another at different times.",
  },
  {
    number: 9,
    title:
      "Greater Deviation From Optimal Ranges Often Reflects Lower Systemic Energy",
    explanation:
      "The further a mineral deviates from its optimal range, the more likely it is to reflect reduced metabolic efficiency — regardless of how balanced other ratios may appear.",
  },
] as const;

/**
 * Practitioner note to accompany the Nine Rules
 */
export const ECK_NINE_RULES_PRACTITIONER_NOTE =
  "These principles explain why HTMA interpretation prioritizes patterns, ratios, and trends over isolated values. They support longitudinal analysis and cautious interpretation rather than single-test conclusions.";

/**
 * Get formatted text for all Nine Rules (for PDF or full-page display)
 */
export function getECKNineRulesFormattedText(): string {
  let output = `${ECK_NINE_RULES_HEADER.title}\n${ECK_NINE_RULES_HEADER.subtitle}\n\n${ECK_NINE_RULES_HEADER.description}\n\n`;

  ECK_NINE_RULES.forEach((rule) => {
    output += `${rule.number}. ${rule.title}\n\n${rule.explanation}\n\n`;
  });

  output += `ℹ️ Practitioner Note\n\n${ECK_NINE_RULES_PRACTITIONER_NOTE}\n\n`;
  output += `${ECK_UI_ATTRIBUTION}`;

  return output;
}

/**
 * Get a specific rule from the Nine Rules
 */
export function getECKNineRule(number: number): ECKCoreRule | undefined {
  return ECK_NINE_RULES.find((r) => r.number === number);
}

/**
 * Get Nine Rules formatted for UI panel display
 * Returns object with header, rules array, note, and attribution
 */
export function getECKNineRulesForUI(): {
  header: typeof ECK_NINE_RULES_HEADER;
  rules: ReadonlyArray<ECKCoreRule>;
  practitionerNote: string;
  attribution: string;
} {
  return {
    header: ECK_NINE_RULES_HEADER,
    rules: ECK_NINE_RULES,
    practitionerNote: ECK_NINE_RULES_PRACTITIONER_NOTE,
    attribution: ECK_UI_ATTRIBUTION,
  };
}

// ============================================================================
// ORIGINAL HELPER FUNCTIONS (15 broader principles)
// ============================================================================

/**
 * Get principles by category
 */
export function getECKPrinciplesByCategory(
  category: "minerals" | "ratios" | "oxidation" | "patterns" | "general"
): ReadonlyArray<ECKPrinciple> {
  return ECK_PRINCIPLES.filter((p) => p.category === category);
}

/**
 * Get specific principle by ID
 */
export function getECKPrinciple(id: number): ECKPrinciple | undefined {
  return ECK_PRINCIPLES.find((p) => p.id === id);
}

/**
 * Get random principle (for educational "tip of the day" features)
 */
export function getRandomECKPrinciple(): ECKPrinciple {
  const randomIndex = Math.floor(Math.random() * ECK_PRINCIPLES.length);
  return ECK_PRINCIPLES[randomIndex];
}

/**
 * Get principles relevant to oxidation classification
 */
export function getOxidationPrinciples(): ReadonlyArray<ECKPrinciple> {
  return ECK_PRINCIPLES.filter(
    (p) => p.category === "oxidation" || p.id === 2 || p.id === 6 || p.id === 7
  );
}

/**
 * Get principles relevant to ratio interpretation
 */
export function getRatioPrinciples(): ReadonlyArray<ECKPrinciple> {
  return ECK_PRINCIPLES.filter((p) => p.category === "ratios" || p.id === 2);
}

/**
 * Format principle for display (with title and text)
 */
export function formatECKPrinciple(
  principle: ECKPrinciple,
  includeAttribution: boolean = false
): string {
  const formatted = `${principle.title}\n\n${principle.principle}`;
  return includeAttribution ? `${formatted}\n\n${ECK_ATTRIBUTION}` : formatted;
}

/**
 * Get all principles as formatted text (for user manual, onboarding, etc.)
 */
export function getAllECKPrinciplesText(): string {
  const sections = {
    general: "General Principles",
    minerals: "Mineral Levels",
    ratios: "Mineral Ratios",
    oxidation: "Oxidation Rate",
    patterns: "Mineral Patterns",
  };

  let output = `DR. PAUL ECK'S HTMA INTERPRETATION PRINCIPLES\n\n${ECK_FULL_ATTRIBUTION}\n\n`;

  Object.entries(sections).forEach(([category, title]) => {
    const principles = getECKPrinciplesByCategory(category as any);
    if (principles.length > 0) {
      output += `\n${title.toUpperCase()}\n${"=".repeat(title.length)}\n\n`;
      principles.forEach((p) => {
        output += `${p.id}. ${p.title}\n${p.principle}\n\n`;
      });
    }
  });

  return output.trim();
}

/**
 * Get educational context for practitioner panels
 * Similar to TEI principles, but focused on ECK's interpretive philosophy
 */
export function getECKEducationalContext(
  topic: "ratios" | "oxidation" | "minerals" | "overview"
): { title: string; content: string } {
  switch (topic) {
    case "ratios":
      return {
        title: "Dr. Paul Eck on Mineral Ratios",
        content: getRatioPrinciples()
          .map((p) => `${p.title}: ${p.principle}`)
          .join("\n\n"),
      };
    case "oxidation":
      return {
        title: "Dr. Paul Eck on Oxidation Rate",
        content: getOxidationPrinciples()
          .map((p) => `${p.title}: ${p.principle}`)
          .join("\n\n"),
      };
    case "minerals":
      return {
        title: "Dr. Paul Eck on Mineral Levels",
        content: getECKPrinciplesByCategory("minerals")
          .map((p) => `${p.title}: ${p.principle}`)
          .join("\n\n"),
      };
    case "overview":
      return {
        title: "Dr. Paul Eck's HTMA Philosophy",
        content: getECKPrinciplesByCategory("general")
          .map((p) => `${p.title}: ${p.principle}`)
          .join("\n\n"),
      };
  }
}

/**
 * Get combined ECK + TEI context for comprehensive education
 * Use when you want to show both laboratory standards (TEI) and
 * interpretive philosophy (ECK) together
 */
export function getCombinedInterpretationContext(): string {
  return `HTMA INTERPRETATION FOUNDATIONS

LABORATORY STANDARDS (Trace Elements Inc.)
Reference intervals are guidelines, not absolute limits. HTMA measures minerals incorporated into hair during growth, reflecting long-term patterns.

INTERPRETIVE PHILOSOPHY (Dr. Paul Eck)
${ECK_PRINCIPLES.slice(0, 5)
  .map((p) => `• ${p.title}: ${p.principle}`)
  .join("\n")}

This platform combines laboratory rigor with established interpretive frameworks to provide comprehensive mineral pattern analysis.`;
}
