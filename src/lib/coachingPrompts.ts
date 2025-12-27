/**
 * Coaching Prompt System
 *
 * Provides actionable, educational guidance based on HTMA analysis results.
 * Generates AI prompts that respect interpretation guardrails - non-diagnostic,
 * educational only, evidence-based.
 *
 * This system creates structured prompts for AI coaching that:
 * - Focus on education and lifestyle factors
 * - Avoid medical diagnosis or treatment
 * - Provide context-aware guidance
 * - Respect practitioner vs consumer audience
 *
 * @version 1.0.0
 * @reviewedDate 2025-12-21
 */

import { HealthScoreBreakdown } from "./healthScore";
import { ScoreDeltaExplanation } from "./scoreDeltaExplainer";
import { TrendExplanation } from "./trendExplainer";
import { INTERPRETATION_GUARDRAILS_VERSION } from "./interpretationGuardrails";

// ============================================================================
// TYPES
// ============================================================================

export type CoachingFocus =
  | "general-wellness"
  | "improvement-maintenance"
  | "addressing-decline"
  | "volatility-management"
  | "beginner-education";

export interface CoachingContext {
  healthScore: HealthScoreBreakdown;
  scoreDelta?: ScoreDeltaExplanation | null;
  trends?: TrendExplanation | null;
  isPractitionerMode: boolean;
  abnormalMinerals: string[];
  abnormalRatios: string[];
}

export interface CoachingPrompt {
  focus: CoachingFocus;
  systemPrompt: string; // Instructions for AI
  userPrompt: string; // Specific question/request
  context: string; // Evidence summary for AI
  guardrails: string[]; // Explicit rules AI must follow
  metadata: {
    version: string;
    guardrailsVersion: string;
    audience: "consumer" | "practitioner";
    generatedAt: string;
  };
}

// ============================================================================
// COACHING PROMPT GENERATOR
// ============================================================================

/**
 * Generate coaching prompt based on analysis context
 *
 * Creates structured AI prompt that respects guardrails and provides
 * context-appropriate guidance.
 */
export function generateCoachingPrompt(
  context: CoachingContext
): CoachingPrompt {
  const focus = determineCoachingFocus(context);
  const audience = context.isPractitionerMode ? "practitioner" : "consumer";

  // Build system prompt (AI instructions)
  const systemPrompt = buildSystemPrompt(audience, focus);

  // Build user prompt (specific request)
  const userPrompt = buildUserPrompt(context, focus);

  // Build context summary (evidence)
  const contextSummary = buildContextSummary(context);

  // Build guardrails (explicit rules)
  const guardrails = buildGuardrails(audience);

  return {
    focus,
    systemPrompt,
    userPrompt,
    context: contextSummary,
    guardrails,
    metadata: {
      version: "1.0.0",
      guardrailsVersion: INTERPRETATION_GUARDRAILS_VERSION,
      audience,
      generatedAt: new Date().toISOString(),
    },
  };
}

// ============================================================================
// FOCUS DETERMINATION
// ============================================================================

function determineCoachingFocus(context: CoachingContext): CoachingFocus {
  const { healthScore, scoreDelta, trends } = context;

  // Beginner (low score, no history)
  if (healthScore.totalScore < 50 && !trends) {
    return "beginner-education";
  }

  // Volatility
  if (trends && trends.overall.direction === "volatile") {
    return "volatility-management";
  }

  // Addressing decline
  if (
    (scoreDelta && scoreDelta.delta < -5) ||
    (trends && trends.overall.direction === "declining")
  ) {
    return "addressing-decline";
  }

  // Improvement maintenance
  if (
    (scoreDelta && scoreDelta.delta > 5) ||
    (trends && trends.overall.direction === "improving")
  ) {
    return "improvement-maintenance";
  }

  // Default: general wellness
  return "general-wellness";
}

// ============================================================================
// SYSTEM PROMPT BUILDER
// ============================================================================

function buildSystemPrompt(
  audience: "consumer" | "practitioner",
  focus: CoachingFocus
): string {
  const basePrompt = `You are an HTMA wellness coach providing educational guidance based on hair tissue mineral analysis results. Your role is to:

1. EDUCATE about mineral relationships, lifestyle factors, and wellness principles
2. PROVIDE evidence-based information from peer-reviewed research
3. EMPOWER users to make informed decisions in consultation with healthcare providers
4. RESPECT scope: You are NOT diagnosing, treating, or prescribing

`;

  const audienceContext =
    audience === "practitioner"
      ? `AUDIENCE: Healthcare practitioner (functional medicine, nutrition)
- You may use clinical terminology
- You may discuss complex biochemical relationships
- You may reference research studies and mechanisms
- You must still maintain non-diagnostic stance

`
      : `AUDIENCE: General consumer (health-conscious individual)
- Use clear, accessible language
- Avoid medical jargon without explanation
- Focus on practical lifestyle factors
- Emphasize consulting healthcare providers

`;

  const focusContext = {
    "general-wellness": `FOCUS: General wellness optimization
- Discuss balanced nutrition and lifestyle
- Emphasize holistic health principles
- Provide gentle, sustainable recommendations`,

    "improvement-maintenance": `FOCUS: Maintaining positive momentum
- Acknowledge progress and validate efforts
- Discuss consistency and sustainability
- Identify patterns to maintain`,

    "addressing-decline": `FOCUS: Understanding decline patterns
- Explore recent lifestyle/protocol changes
- Discuss stress, sleep, and environmental factors
- Suggest areas for investigation (with provider)`,

    "volatility-management": `FOCUS: Stabilizing fluctuations
- Discuss factors causing variability
- Emphasize consistency in protocol
- Explore timing and testing methodology`,

    "beginner-education": `FOCUS: HTMA fundamentals education
- Explain what minerals do and why they matter
- Discuss the importance of balance over single values
- Set realistic expectations for improvement timeline`,
  }[focus];

  return basePrompt + audienceContext + focusContext;
}

// ============================================================================
// USER PROMPT BUILDER
// ============================================================================

function buildUserPrompt(
  context: CoachingContext,
  focus: CoachingFocus
): string {
  const { healthScore, scoreDelta, trends } = context;

  let prompt = "";

  // Start with current status
  prompt += `Based on an HTMA analysis showing a health score of ${healthScore.totalScore}/100 (${healthScore.grade} grade)`;

  // Add delta context
  if (scoreDelta) {
    const direction = scoreDelta.delta > 0 ? "improved" : "decreased";
    prompt += `, which has ${direction} by ${Math.abs(
      scoreDelta.delta
    )} points since the last test`;
  }

  // Add trend context
  if (trends) {
    prompt += `, and is ${trends.overall.direction} over ${trends.timespan.periodCount} recent tests`;
  }

  prompt += ":\n\n";

  // Add specific question based on focus
  const questions = {
    "general-wellness":
      "What are the top 3 lifestyle and nutritional factors I should focus on to optimize my mineral balance?",
    "improvement-maintenance":
      "What strategies should I maintain to continue this positive trend, and what should I watch out for?",
    "addressing-decline":
      "What lifestyle or environmental factors might explain this decline, and what areas should I investigate with my healthcare provider?",
    "volatility-management":
      "What factors could cause these fluctuations, and how can I create more consistency in my results?",
    "beginner-education":
      "Help me understand what this HTMA analysis reveals about my mineral status and what I can do to improve it. What should I focus on first?",
  };

  prompt += questions[focus];

  return prompt;
}

// ============================================================================
// CONTEXT SUMMARY BUILDER
// ============================================================================

function buildContextSummary(context: CoachingContext): string {
  const { healthScore, scoreDelta, trends, abnormalMinerals, abnormalRatios } =
    context;

  let summary = "ANALYSIS EVIDENCE:\n\n";

  // Health Score Breakdown
  summary += `Health Score: ${healthScore.totalScore}/100 (${healthScore.grade})\n`;
  summary += `- Mineral Score: ${healthScore.mineralScore.toFixed(1)}/60\n`;
  summary += `- Ratio Score: ${healthScore.ratioScore.toFixed(1)}/30\n`;
  summary += `- Red Flag Score: ${healthScore.redFlagScore.toFixed(1)}/10\n`;
  summary += `- Status: ${healthScore.statusCounts.optimal} optimal, ${healthScore.statusCounts.low} low, ${healthScore.statusCounts.high} high\n\n`;

  // Critical Issues
  if (healthScore.criticalIssues.length > 0) {
    summary += `Critical Issues:\n`;
    healthScore.criticalIssues.forEach((issue) => {
      summary += `- ${issue}\n`;
    });
    summary += "\n";
  }

  // Abnormal Minerals
  if (abnormalMinerals.length > 0) {
    summary += `Minerals Outside Optimal Range: ${abnormalMinerals.join(
      ", "
    )}\n\n`;
  }

  // Abnormal Ratios
  if (abnormalRatios.length > 0) {
    summary += `Ratios Outside Optimal Range: ${abnormalRatios.join(", ")}\n\n`;
  }

  // Score Delta
  if (scoreDelta) {
    summary += `Recent Change:\n`;
    summary += `- ${scoreDelta.headline}\n`;
    summary += `- Top drivers:\n`;
    scoreDelta.topDrivers.slice(0, 3).forEach((driver) => {
      summary += `  * ${driver.note} (${driver.impactPoints > 0 ? "+" : ""}${
        driver.impactPoints
      })\n`;
    });
    summary += "\n";
  }

  // Trends
  if (trends) {
    summary += `Trend Analysis (${trends.timespan.periodCount} tests over ${trends.timespan.avgDaysBetween} avg days):\n`;
    summary += `- Direction: ${trends.overall.direction}\n`;
    summary += `- Strength: ${trends.overall.strength}\n`;
    summary += `- Total change: ${trends.overall.scoreDelta} points\n`;
    if (trends.mineralTrends.length > 0) {
      summary += `- Notable mineral trends:\n`;
      trends.mineralTrends.slice(0, 3).forEach((mt) => {
        summary += `  * ${mt.note}\n`;
      });
    }
    summary += "\n";
  }

  return summary;
}

// ============================================================================
// GUARDRAILS BUILDER
// ============================================================================

function buildGuardrails(audience: "consumer" | "practitioner"): string[] {
  const baseGuardrails = [
    "DO NOT diagnose medical conditions or diseases",
    "DO NOT prescribe supplements, medications, or specific dosages",
    "DO NOT claim to treat, cure, or prevent any disease",
    "DO NOT make predictions about specific health outcomes",
    "DO provide educational information about minerals and their functions",
    "DO discuss lifestyle factors (diet, stress, sleep, exercise)",
    "DO reference peer-reviewed research when possible",
    "DO encourage consultation with healthcare providers for medical concerns",
    "DO maintain a tone that is supportive, educational, and empowering",
  ];

  const consumerGuardrails = [
    ...baseGuardrails,
    "Use accessible language - avoid medical jargon without clear explanation",
    "Emphasize that HTMA is one data point, not a complete health picture",
    "Remind users to work with qualified healthcare providers",
  ];

  const practitionerGuardrails = [
    ...baseGuardrails,
    "You may use clinical terminology appropriate for healthcare professionals",
    "You may discuss biochemical mechanisms and pathways",
    "Still maintain educational stance - do not prescribe or diagnose",
  ];

  return audience === "practitioner"
    ? practitionerGuardrails
    : consumerGuardrails;
}

// ============================================================================
// COACHING PROMPT FORMATTER
// ============================================================================

/**
 * Format coaching prompt for AI API call
 *
 * Returns a formatted prompt ready to send to OpenAI or similar API
 */
export function formatPromptForAPI(prompt: CoachingPrompt): {
  system: string;
  user: string;
} {
  const systemMessage = `${prompt.systemPrompt}

GUARDRAILS (MUST FOLLOW):
${prompt.guardrails.map((g) => `- ${g}`).join("\n")}

${prompt.context}`;

  return {
    system: systemMessage,
    user: prompt.userPrompt,
  };
}

/**
 * Quick coaching prompt for simple use cases
 *
 * Generates a basic coaching prompt without trends or delta context
 */
export function generateQuickCoachingPrompt(
  healthScore: HealthScoreBreakdown,
  abnormalMinerals: string[],
  abnormalRatios: string[],
  isPractitionerMode: boolean = false
): CoachingPrompt {
  return generateCoachingPrompt({
    healthScore,
    abnormalMinerals,
    abnormalRatios,
    isPractitionerMode,
  });
}
