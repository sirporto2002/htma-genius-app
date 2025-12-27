/**
 * TEI (Trace Elements Inc.) Interpretation Principles
 *
 * This module contains authoritative framing text from Trace Elements Inc.
 * that explains how HTMA should be interpreted.
 *
 * ⚠️ IMPORTANT: These are NOT computational rules or algorithms.
 * They are philosophical context for:
 * - Interpretation guardrails
 * - Practitioner education
 * - Legal disclaimers
 * - User onboarding
 *
 * DO NOT use this text to:
 * - Generate AI insights
 * - Create scoring thresholds
 * - Infer health conditions
 * - Suggest medical actions
 *
 * Version: 1.0.0
 * Source: Trace Elements Inc. official documentation
 * Last updated: December 22, 2025
 */

export const TEI_PRINCIPLES = {
  /**
   * How mineral levels are reported in HTMA
   */
  levels: {
    title: "LEVELS",
    text: `All mineral levels are reported in milligrams percent (milligrams per one-hundred grams of hair). One milligram percent (mg%) is equal to parts per million (ppm).`,
  },

  /**
   * Definition and importance of nutritional elements
   */
  nutritionalElements: {
    title: "NUTRITIONAL ELEMENTS",
    text: `Extensively studied, the nutrient elements have been well defined and are considered essential for many biological functions in the human body. They play key roles in such metabolic processes as muscular activity, endocrine function, reproduction, skeletal integrity and overall development.`,
  },

  /**
   * Context for toxic elements - emphasizes interference, not diagnosis
   */
  toxicElements: {
    title: "TOXIC ELEMENTS",
    text: `The toxic elements or "heavy metals" are well-known for their interference upon normal biochemical function. They are commonly found in the environment and therefore are present to some degree, in all biological systems. However, these metals clearly pose a concern for toxicity when accumulation occurs in excess.`,
  },

  /**
   * Research-oriented elements, not yet fully understood
   */
  additionalElements: {
    title: "ADDITIONAL ELEMENTS",
    text: `These elements are considered as possibly essential by the human body. Additional studies are being conducted to better define their requirements and amounts needed.`,
  },

  /**
   * What ratios are and how to calculate them
   */
  ratios: {
    title: "RATIOS",
    text: `A calculated comparison of two elements to each other is called a ratio. To calculate a ratio value, the first mineral level is divided by the second mineral level.`,
    example: `EXAMPLE: A sodium (Na) test level of 24 mg% divided by a potassium (K) level of 10 mg% equals a Na/K ratio of 2.4 to 1.`,
  },

  /**
   * Why ratios matter - synergistic relationships affect metabolism
   */
  significantRatios: {
    title: "SIGNIFICANT RATIOS",
    text: `If the synergistic relationship (or ratio) between certain minerals in the body is imbalanced, studies show that normal biological functions and metabolic activity can be adversely affected. Even at extremely low concentrations, the synergistic and/or antagonistic relationships between minerals still exist, which can indirectly affect metabolism.`,
  },

  /**
   * Critical context: toxic ratios show disruption, not diagnosis
   */
  toxicRatios: {
    title: "TOXIC RATIOS",
    text: `It is important to note that individuals with elevated toxic levels may not always exhibit clinical symptoms associated with those particular toxic minerals. However, research has shown that toxic minerals can also produce an antagonistic effect on various essential minerals eventually leading to disturbances in their metabolic utilization.`,
  },

  /**
   * Additional ratios are research-oriented, not clinical
   */
  additionalRatios: {
    title: "ADDITIONAL RATIOS",
    text: `These ratios are being reported solely for the purpose of gathering research data. This information should not be used to help the attending health-care professional in evaluating their impact upon health.`,
  },

  /**
   * MOST IMPORTANT: Reference intervals are guidelines, not absolutes
   * This is the foundation for all non-diagnostic framing
   */
  referenceIntervals: {
    title: "REFERENCE INTERVALS",
    text: `Generally, reference intervals should be considered as guidelines for comparison with the reported test values. These reference intervals have been statistically established from studying an international population of "healthy" individuals over many years.`,
    disclaimer: `Important Note: The reference intervals should not be considered as absolute limits for determining deficiency, toxicity or acceptance.`,
  },

  /**
   * Laboratory quality procedures and result interpretation
   * Source: Dr. David L. Watts, Ph.D., Director of Research, TEI
   */
  laboratoryProcedures: {
    title: "LABORATORY PERSPECTIVE",
    exposureVsAbsorption: `Hair tissue mineral analysis (HTMA) measures nutritional minerals and the heavy metals that are incorporated into the hair shaft during its development. It is generally known and accepted that HTMA reflects the accumulation of these metals within the tissues of the body, providing a record of long-term intake, retention, or excretion of these metals. What is less recognized, but a fact nevertheless, HTMA also provides an indication of the interrelationships between nutritional minerals as well as the interrelationships between nutritional minerals and heavy metals.`,
    universalExposure: `Everyone is exposed to heavy metals. They cannot be avoided completely, as clinicians know, since everyone is exposed to them. Most clinician's are aware that hair tissue mineral analysis (HTMA) measures nutritional minerals and the heavy metals that are incorporated into the hair shaft during its development.`,
    recheckProtocol: `From a laboratory perspective, when an elevated heavy metal is found above a certain level in a specimen being analyzed, the elevated test result(s) for that specimen are flagged and the entire specimen is placed on hold for review. The test data for that specimen will not be released for administrative purposes until the particular elements in question have been verified. The verification of recheck protocols involves retesting the specimen on a completely independent analytical run, which involves preparing another 'test sample' from the original specimen. After a high level has been confirmed or verified within the laboratory and the specimen has been sent to the clinician, there still remains the clinical question and the possibility of an external source that may have inadvertently contaminated the sample before it was received in the laboratory.`,
  },
} as const;

/**
 * Helper function to get formatted disclaimer text for PDFs or UI
 */
export function getTEIDisclaimer(
  type: "referenceIntervals" | "toxicRatios" | "additionalRatios"
): string {
  switch (type) {
    case "referenceIntervals":
      return `${TEI_PRINCIPLES.referenceIntervals.disclaimer}\n— Trace Elements Inc.`;
    case "toxicRatios":
      return `Note: ${TEI_PRINCIPLES.toxicRatios.text}\n— Trace Elements Inc.`;
    case "additionalRatios":
      return `Note: ${TEI_PRINCIPLES.additionalRatios.text}\n— Trace Elements Inc.`;
  }
}

/**
 * Get practitioner education text for "Learn more" panels
 */
export function getTEIPractitionerContext(
  topic:
    | "ratios"
    | "toxicElements"
    | "additionalElements"
    | "referenceIntervals"
): { title: string; content: string } {
  switch (topic) {
    case "ratios":
      return {
        title: "About Ratios",
        content: `${TEI_PRINCIPLES.ratios.text}\n\n${TEI_PRINCIPLES.ratios.example}\n\n${TEI_PRINCIPLES.significantRatios.text}`,
      };
    case "toxicElements":
      return {
        title: "About Toxic Elements",
        content: `${TEI_PRINCIPLES.toxicElements.text}\n\n${TEI_PRINCIPLES.toxicRatios.text}\n\nUNDERSTANDING EXPOSURE VS. ABSORPTION:\n${TEI_PRINCIPLES.laboratoryProcedures.exposureVsAbsorption}\n\nLABORATORY QUALITY PROCEDURES:\n${TEI_PRINCIPLES.laboratoryProcedures.recheckProtocol}`,
      };
    case "additionalElements":
      return {
        title: "About Additional Elements",
        content: TEI_PRINCIPLES.additionalElements.text,
      };
    case "referenceIntervals":
      return {
        title: "Understanding Reference Intervals",
        content: `${TEI_PRINCIPLES.referenceIntervals.text}\n\n${TEI_PRINCIPLES.referenceIntervals.disclaimer}`,
      };
  }
}

/**
 * Get all TEI principles as plain text (for user manual, onboarding, etc.)
 */
export function getAllTEIPrinciplesText(): string {
  return `
TRACE ELEMENTS INC. INTERPRETATION PRINCIPLES

${TEI_PRINCIPLES.levels.title}
${TEI_PRINCIPLES.levels.text}

${TEI_PRINCIPLES.nutritionalElements.title}
${TEI_PRINCIPLES.nutritionalElements.text}

${TEI_PRINCIPLES.toxicElements.title}
${TEI_PRINCIPLES.toxicElements.text}

${TEI_PRINCIPLES.additionalElements.title}
${TEI_PRINCIPLES.additionalElements.text}

${TEI_PRINCIPLES.ratios.title}
${TEI_PRINCIPLES.ratios.text}

${TEI_PRINCIPLES.ratios.example}

${TEI_PRINCIPLES.significantRatios.title}
${TEI_PRINCIPLES.significantRatios.text}

${TEI_PRINCIPLES.toxicRatios.title}
${TEI_PRINCIPLES.toxicRatios.text}

${TEI_PRINCIPLES.additionalRatios.title}
${TEI_PRINCIPLES.additionalRatios.text}

${TEI_PRINCIPLES.referenceIntervals.title}
${TEI_PRINCIPLES.referenceIntervals.text}

${TEI_PRINCIPLES.referenceIntervals.disclaimer}
`.trim();
}
