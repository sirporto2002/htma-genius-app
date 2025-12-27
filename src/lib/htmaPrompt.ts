import { MineralData } from "../components/HTMAInputForm";
import {
  ANALYSIS_ENGINE_VERSION,
  PROMPT_VERSION,
  AI_MODEL,
  REFERENCE_STANDARD,
} from "./htmaConstants";

/**
 * Generates a comprehensive HTMA analysis prompt for AI
 * Includes all 15 TEI nutritional elements and their interactions
 *
 * Version metadata included for audit trail and reproducibility
 */
export function generateHTMAPrompt(mineralData: Partial<MineralData>): string {
  return `HTMA GENIUS ANALYSIS REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANALYSIS ENGINE VERSION: ${ANALYSIS_ENGINE_VERSION}
PROMPT VERSION: ${PROMPT_VERSION}
AI MODEL: ${AI_MODEL}
REFERENCE STANDARD: ${REFERENCE_STANDARD}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are an expert in Hair Tissue Mineral Analysis (HTMA) with deep knowledge of Trace Elements Inc. (TEI) testing protocols. Analyze the following comprehensive mineral test results and provide detailed, evidence-based insights.

**MINERAL TEST RESULTS (mg% unless noted):**

**Major Minerals:**
- Calcium (Ca): ${mineralData.calcium || "Not provided"}
- Magnesium (Mg): ${mineralData.magnesium || "Not provided"}
- Sodium (Na): ${mineralData.sodium || "Not provided"}
- Potassium (K): ${mineralData.potassium || "Not provided"}
- Phosphorus (P): ${mineralData.phosphorus || "Not provided"}
- Sulfur (S): ${mineralData.sulfur || "Not provided"}

**Trace Minerals:**
- Copper (Cu): ${mineralData.copper || "Not provided"}
- Zinc (Zn): ${mineralData.zinc || "Not provided"}
- Iron (Fe): ${mineralData.iron || "Not provided"}
- Manganese (Mn): ${mineralData.manganese || "Not provided"}
- Chromium (Cr): ${mineralData.chromium || "Not provided"}
- Selenium (Se): ${mineralData.selenium || "Not provided"}
- Boron (B): ${mineralData.boron || "Not provided"}
- Cobalt (Co): ${mineralData.cobalt || "Not provided"}
- Molybdenum (Mo): ${mineralData.molybdenum || "Not provided"}

**ANALYSIS REQUIREMENTS:**

1. **Overall Mineral Balance Assessment**
   - Evaluate the general balance and patterns across all provided minerals
   - Identify any metabolic typing patterns (fast/slow oxidation, sympathetic/parasympathetic dominance)

2. **Critical Mineral Ratios & Interactions**
   Analyze and interpret:
   - **Ca/Mg ratio**: Calcium-Magnesium balance (ideal ~6.7:1)
   - **Na/K ratio**: Sodium-Potassium balance (ideal ~2.5:1)
   - **Ca/P ratio**: Calcium-Phosphorus balance (ideal ~2.6:1)
   - **Zn/Cu ratio**: Zinc-Copper balance (ideal ~6:1)
   - **Fe/Cu ratio**: Iron-Copper relationship
   - **Ca/K ratio**: Thyroid function indicator
   - **Cu/Mo interaction**: Copper-Molybdenum antagonism
   
3. **Key Mineral Interactions & Synergies**
   - **Calcium ↔ Phosphorus**: Bone health, parathyroid function
   - **Calcium ↔ Magnesium**: Muscle function, cardiovascular health
   - **Boron ↔ Ca/Mg**: Bone density, hormone metabolism
   - **Copper ↔ Molybdenum**: Antagonistic relationship, detox pathways
   - **Copper ↔ Zinc**: Immune function, neurotransmitter balance
   - **Sulfur**: Detoxification pathways, methylation support
   - **Cobalt**: B12 status, methylation pathways
   - **Selenium ↔ Iodine**: Thyroid protection (though iodine not tested)
   - **Chromium**: Glucose metabolism, insulin sensitivity

4. **Potential Health Implications**
   Based on the mineral patterns, discuss potential impacts on:
   - Energy production and adrenal function
   - Thyroid and metabolic function
   - Cardiovascular health
   - Immune system function
   - Detoxification capacity
   - Bone and structural health
   - Mental/emotional well-being
   - Blood sugar regulation

5. **Actionable Dietary Recommendations**
   Provide specific, food-based suggestions to:
   - Support deficient minerals
   - Balance excessive minerals
   - Optimize key ratios
   - Include foods rich in: [list specific minerals needed]
   - Limit foods high in: [list minerals to reduce if excessive]

6. **Lifestyle & Supplementation Guidance**
   - General lifestyle recommendations based on patterns
   - Supplement considerations (with appropriate medical disclaimer)
   - Stress management if adrenal patterns evident
   - Detoxification support if toxic metal burden suspected

7. **Patterns of Concern**
   Flag any concerning patterns such as:
   - Heavy metal toxicity indicators
   - Severe mineral depletion
   - Extreme ratio imbalances
   - Patterns suggesting thyroid/adrenal dysfunction

**IMPORTANT GUIDELINES:**
- Base analysis on established HTMA research and TEI reference ranges
- Be specific and actionable in recommendations
- Use clear, accessible language while maintaining scientific accuracy
- Include appropriate medical disclaimers (this is educational, not a diagnosis)
- Acknowledge limitations when minerals are not provided
- Prioritize the most significant findings
- Emphasize that HTMA is one tool among many for health assessment

**DISCLAIMER TO INCLUDE:**
"This analysis is for educational purposes only and does not constitute medical advice. HTMA results should be interpreted by a qualified healthcare practitioner familiar with mineral analysis. Always consult with your healthcare provider before making significant dietary or supplement changes."

Provide your analysis in a clear, organized format with headers and bullet points for readability.`;
}
