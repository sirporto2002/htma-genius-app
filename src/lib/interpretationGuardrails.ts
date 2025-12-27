/**
 * HTMA Genius — Interpretation Guardrails
 * Central "policy engine" that constrains tone, scope, safety, and traceability.
 *
 * Any user-facing insight/recommendation MUST be passed through applyGuardrails().
 *
 * Anchored to Trace Elements Inc. (TEI) interpretation principles.
 */

import { TEI_PRINCIPLES } from "./teiInterpretationPrinciples";

export const INTERPRETATION_GUARDRAILS_VERSION = "1.0.0";
export const INTERPRETATION_GUARDRAILS_REVIEWED_DATE = "2025-12-21";

export type Audience = "consumer" | "practitioner";
export type Channel = "ui" | "pdf" | "api" | "storage";

export type Confidence = "low" | "moderate" | "high";

export type GuardrailsContext = {
  audience: Audience;
  channel: Channel;
  /**
   * Optional: any structured "evidence" we can use to enforce "no empty claims".
   * If your pipeline doesn't provide this yet, it can be empty.
   */
  evidence?: {
    abnormalMinerals?: string[]; // e.g. ["Ca", "Na"]
    abnormalRatios?: string[]; // e.g. ["Ca/Mg", "Na/K"]
    trends?: string[]; // e.g. ["Na down vs last test"]
    flags?: string[]; // e.g. ["very_high_calcium"]
  };
};

export type GuardrailsResult = {
  ok: boolean;
  version: string;
  reviewedDate: string;
  removedCount: number;
  /** sanitized, safe outputs */
  insights: string[];
  recommendations: string[];
  /** optional info for debugging / practitioner validation mode */
  notes?: string[];
};

const SHORT_DISCLAIMER = "Educational insight only. Not a medical diagnosis.";
const FULL_DISCLAIMER =
  "This content is for educational purposes only and is not intended to diagnose, treat, cure, or prevent any disease, or replace professional medical advice.";

/**
 * TEI Reference Intervals Disclaimer (authoritative lab language)
 * Used in PDFs and practitioner education contexts
 */
const TEI_REFERENCE_DISCLAIMER = TEI_PRINCIPLES.referenceIntervals.disclaimer;

/**
 * Words/phrases that often push content into diagnosis/prescription territory.
 * We don't try to be perfect — we enforce guardrails conservatively.
 */
const BLOCKED_PHRASES: RegExp[] = [
  /\bdiagnos(e|is|ed)\b/i,
  /\byou (have|are|suffer from)\b/i,
  /\bthis means you\b/i,
  /\bconfirms?\b/i,
  /\bdefinitely\b/i,
  /\bguarantee(d)?\b/i,
  /\bcure(s|d)?\b/i,
  /\btreat(s|ed|ment)?\b/i,
  /\bprescribe(d|s)?\b/i,
  /\bmedication\b/i,
  /\bdose\b/i, // dosages should be avoided in consumer output
  /\bmg\b/i, // catches "500mg", "mg/day" etc; we'll allow practitioner to override later
  /\bIU\b/i,
  /\bfor \d+\s*(days|weeks|months)\b/i, // timeline promises
];

/**
 * Forbidden medical scope: disease names / high-risk areas.
 * (Keep small at first; expand over time.)
 */
const FORBIDDEN_SCOPE: RegExp[] = [
  /\bcancer\b/i,
  /\bdiabetes\b/i,
  /\bautis(m|tic)\b/i,
  /\bADHD\b/i,
  /\bschizophren/i,
  /\bbipolar\b/i,
  /\bsuicide\b/i,
  /\bpregnan(t|cy)\b/i,
  /\binfant\b/i,
  /\bpediatric\b/i,
  /\bchild\b/i,
];

/**
 * Tone "softeners" we enforce when something is borderline.
 */
const SOFTENERS = [
  "may suggest",
  "can reflect",
  "is sometimes associated with",
  "may be worth discussing with a qualified practitioner",
] as const;

function hasBlockedPhrase(text: string): boolean {
  return BLOCKED_PHRASES.some((re) => re.test(text));
}

function hasForbiddenScope(text: string): boolean {
  return FORBIDDEN_SCOPE.some((re) => re.test(text));
}

function normalizeWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function ensureEducationalTone(text: string): string {
  // If already contains a softener, leave it.
  const lower = text.toLowerCase();
  if (SOFTENERS.some((s) => lower.includes(s))) return text;

  // Add a gentle softener at the front for safety.
  return `This pattern ${SOFTENERS[0]}: ${text}`;
}

/**
 * Evidence rule: If we have evidence context and none exists, we don't allow strong claims.
 * (We don't remove, we soften heavily.)
 */
function applyEvidenceConstraint(text: string, ctx: GuardrailsContext): string {
  const evidence = ctx.evidence;
  if (!evidence) return text;

  const totalEvidence =
    (evidence.abnormalMinerals?.length ?? 0) +
    (evidence.abnormalRatios?.length ?? 0) +
    (evidence.trends?.length ?? 0) +
    (evidence.flags?.length ?? 0);

  if (totalEvidence <= 0) {
    // No supporting evidence available → force very cautious tone
    return `Educational note (limited data context): ${ensureEducationalTone(
      text
    )}`;
  }
  return text;
}

/**
 * Consumer policy: strip dosage-like content more aggressively.
 * Practitioner policy: allow more detail (still no diagnosis claims).
 */
function enforceAudiencePolicy(text: string, ctx: GuardrailsContext): string {
  const t = text;

  if (ctx.audience === "consumer") {
    // Remove explicit dosage/timing patterns if they slipped through
    const stripped = t
      .replace(
        /\b\d+(\.\d+)?\s*(mg|mcg|g|iu|IU)\/?(day|daily)?\b/g,
        "[supplement amount]"
      )
      .replace(/\b\d+(\.\d+)?\s*(mg|mcg|g|iu|IU)\b/g, "[supplement amount]")
      .replace(/\bfor\s+\d+\s*(days|weeks|months)\b/gi, "for a period of time");

    return stripped;
  }

  // Practitioner: keep details, but still soften tone if needed.
  return t;
}

export function applyGuardrails(input: {
  insights: string[];
  recommendations: string[];
  ctx: GuardrailsContext;
}): GuardrailsResult {
  const notes: string[] = [];
  let removedCount = 0;

  const sanitizeList = (
    items: string[],
    kind: "insight" | "recommendation"
  ) => {
    const out: string[] = [];

    for (const raw of items || []) {
      let text = normalizeWhitespace(String(raw ?? ""));

      if (!text) continue;

      // Block forbidden scope
      if (hasForbiddenScope(text)) {
        removedCount++;
        notes.push(`[removed:${kind}] forbidden scope → "${text}"`);
        continue;
      }

      // Block diagnosis/prescription language (conservative)
      if (hasBlockedPhrase(text)) {
        // Instead of outright delete, we can soften if it's not too risky.
        // But if it contains "diagnose/cure/treat/prescribe" we remove.
        const hardBlock = /\b(diagnos|cure|treat|prescrib)\b/i.test(text);
        if (hardBlock) {
          removedCount++;
          notes.push(`[removed:${kind}] blocked phrase → "${text}"`);
          continue;
        }
        // Soft block → soften tone
        text = ensureEducationalTone(text);
        notes.push(`[softened:${kind}] blocked phrase softened`);
      }

      // Enforce evidence constraint
      text = applyEvidenceConstraint(text, input.ctx);

      // Enforce audience policy
      text = enforceAudiencePolicy(text, input.ctx);

      out.push(text);
    }

    return out;
  };

  const safeInsights = sanitizeList(input.insights, "insight");
  const safeRecs = sanitizeList(input.recommendations, "recommendation");

  // Always append disclaimers as LAST recommendations (UI/PDF can choose to render)
  const disclaimer =
    input.ctx.channel === "pdf" ? FULL_DISCLAIMER : SHORT_DISCLAIMER;

  const finalRecs = [...safeRecs];
  if (finalRecs.length === 0) {
    finalRecs.push(
      "Consider discussing these patterns with a qualified practitioner for personalized context."
    );
  }

  // Add TEI reference intervals disclaimer for scientific credibility (PDF only)
  if (input.ctx.channel === "pdf") {
    finalRecs.push(`Note: ${TEI_REFERENCE_DISCLAIMER} — Trace Elements Inc.`);
  }

  finalRecs.push(disclaimer);

  return {
    ok: true,
    version: INTERPRETATION_GUARDRAILS_VERSION,
    reviewedDate: INTERPRETATION_GUARDRAILS_REVIEWED_DATE,
    removedCount,
    insights: safeInsights,
    recommendations: finalRecs,
    notes: input.ctx.audience === "practitioner" ? notes : undefined,
  };
}
