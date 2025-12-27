/**
 * Chrome Built-In AI Service
 *
 * Uses Chrome's Prompt API for on-device AI analysis
 * Falls back to cloud-based Gemini if unavailable
 *
 * Supports:
 * - HTMA insight generation
 * - Trend summarization
 * - Coaching recommendations
 * - Change explanations
 *
 * @see https://developer.chrome.com/docs/ai/built-in
 */

import { MineralData } from "../components/HTMAInputForm";
import { applyGuardrails, GuardrailsResult } from "./interpretationGuardrails";
import {
  ANALYSIS_ENGINE_VERSION,
  PROMPT_VERSION,
  REFERENCE_STANDARD,
} from "./htmaConstants";

interface ChromeAI {
  capabilities: Promise<{
    available: "readily" | "after-download" | "no";
    defaultTemperature?: number;
    defaultTopK?: number;
    maxTopK?: number;
  }>;

  createTextSession(options?: {
    temperature?: number;
    topK?: number;
    systemPrompt?: string;
  }): Promise<ChromeAISession>;
}

interface ChromeAISession {
  prompt(text: string): Promise<string>;
  promptStreaming(text: string): ReadableStream;
  destroy(): void;
  clone(): Promise<ChromeAISession>;
}

// Type augmentation for Chrome AI
declare global {
  interface Window {
    ai?: ChromeAI;
  }
}

export interface ChromeAIAnalysisResult {
  insights: string;
  rawResponse: string;
  guardrails: GuardrailsResult;
  source: "chrome-ai" | "gemini-cloud";
  timestamp: string;
  metadata: {
    engineVersion: string;
    promptVersion: string;
    model: string;
  };
}

/**
 * Chrome AI Service for HTMA Analysis
 */
export class ChromeAIService {
  private session: ChromeAISession | null = null;
  private isInitializing = false;

  /**
   * HTMA-specific system prompt following TEI principles
   */
  private readonly SYSTEM_PROMPT = `You are an expert HTMA (Hair Tissue Mineral Analysis) interpreter trained in Trace Elements Inc. (TEI) methodology and Dr. Eck's Analytical Research Labs principles.

YOUR ROLE:
- Analyze mineral patterns, ratios, and oxidation types
- Provide evidence-based nutritional insights
- Suggest dietary and lifestyle recommendations
- Flag concerning patterns for professional review

CRITICAL CONSTRAINTS - YOU MUST FOLLOW THESE:
- DO NOT diagnose diseases or medical conditions
- DO NOT recommend specific dosages or treatment protocols
- DO NOT address pregnancy, children under 18, or serious medical conditions
- DO NOT use words like "cure", "treat", "diagnose", "confirm", "guarantee"
- FOCUS on educational nutritional guidance and patterns
- ALWAYS use softening language: "may suggest", "could indicate", "might benefit from"
- INCLUDE disclaimer: "Educational insight only. Not a medical diagnosis."

REFERENCE STANDARD: ${REFERENCE_STANDARD}
ENGINE VERSION: ${ANALYSIS_ENGINE_VERSION}
PROMPT VERSION: ${PROMPT_VERSION}

Keep responses clear, concise, and actionable. Focus on food-based recommendations.`;

  /**
   * Check if Chrome AI is available in this browser
   */
  async isAvailable(): Promise<boolean> {
    if (typeof window === "undefined" || !window.ai) {
      return false;
    }

    try {
      const capabilities = await window.ai.capabilities;
      return capabilities.available !== "no";
    } catch (error) {
      console.warn("Chrome AI capabilities check failed:", error);
      return false;
    }
  }

  /**
   * Get Chrome AI availability status with details
   */
  async getStatus(): Promise<{
    available: boolean;
    status: "readily" | "after-download" | "no" | "unsupported";
    message: string;
  }> {
    if (typeof window === "undefined" || !window.ai) {
      return {
        available: false,
        status: "unsupported",
        message: "Chrome AI is not supported in this browser. Using cloud AI.",
      };
    }

    try {
      const capabilities = await window.ai.capabilities;

      if (capabilities.available === "readily") {
        return {
          available: true,
          status: "readily",
          message: "Chrome AI is ready for private, on-device analysis",
        };
      } else if (capabilities.available === "after-download") {
        return {
          available: true,
          status: "after-download",
          message:
            "Chrome AI is downloading model... This may take a few minutes.",
        };
      } else {
        return {
          available: false,
          status: "no",
          message: "Chrome AI is not available. Enable it in chrome://flags",
        };
      }
    } catch (error) {
      return {
        available: false,
        status: "unsupported",
        message: "Chrome AI check failed. Using cloud AI.",
      };
    }
  }

  /**
   * Initialize AI session with HTMA-specific system prompt
   */
  async initialize(): Promise<void> {
    if (this.session || this.isInitializing) {
      return; // Already initialized or in progress
    }

    if (!window.ai) {
      throw new Error("Chrome AI not available");
    }

    this.isInitializing = true;

    try {
      this.session = await window.ai.createTextSession({
        temperature: 0.7,
        topK: 3,
        systemPrompt: this.SYSTEM_PROMPT,
      });
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Generate HTMA insights using Chrome AI
   */
  async analyzeHTMA(
    mineralData: Partial<MineralData>
  ): Promise<ChromeAIAnalysisResult> {
    if (!this.session) {
      await this.initialize();
    }

    if (!this.session) {
      throw new Error("Failed to initialize Chrome AI session");
    }

    const prompt = this.buildHTMAPrompt(mineralData);
    const rawResponse = await this.session.prompt(prompt);

    // Parse and apply guardrails
    const { insights, recommendations } = this.parseAIResponse(rawResponse);

    const guardrails = applyGuardrails({
      insights,
      recommendations,
      ctx: {
        audience: "consumer",
        channel: "api",
        evidence: {
          abnormalMinerals: this.extractAbnormalMinerals(mineralData),
          abnormalRatios: [],
          trends: [],
          flags: [],
        },
      },
    });

    // Combine guarded insights and recommendations
    const guardedText = [
      ...guardrails.insights,
      "",
      "**Recommendations:**",
      ...guardrails.recommendations,
    ].join("\n");

    return {
      insights: guardedText,
      rawResponse,
      guardrails,
      source: "chrome-ai",
      timestamp: new Date().toISOString(),
      metadata: {
        engineVersion: ANALYSIS_ENGINE_VERSION,
        promptVersion: PROMPT_VERSION,
        model: "Gemini Nano (Chrome AI)",
      },
    };
  }

  /**
   * Streaming analysis for real-time feedback
   */
  async *analyzeHTMAStreaming(
    mineralData: Partial<MineralData>
  ): AsyncGenerator<string> {
    if (!this.session) {
      await this.initialize();
    }

    if (!this.session) {
      throw new Error("Failed to initialize Chrome AI session");
    }

    const prompt = this.buildHTMAPrompt(mineralData);
    const stream = this.session.promptStreaming(prompt);
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    let fullResponse = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        yield chunk;
      }

      // After streaming is complete, apply guardrails to full response
      // This is a simplified version - in production you'd want to stream through guardrails too
      console.log(
        "Chrome AI streaming complete. Full response length:",
        fullResponse.length
      );
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Summarize trends across multiple analyses
   */
  async summarizeTrends(
    analyses: Array<{
      date: string;
      minerals: Partial<MineralData>;
      oxidationType?: string;
      score?: number;
    }>
  ): Promise<string> {
    if (!this.session) {
      await this.initialize();
    }

    if (!this.session) {
      throw new Error("Failed to initialize Chrome AI session");
    }

    const trendsPrompt = `Analyze these HTMA results over time and identify key trends:

${analyses
  .map(
    (a, i) => `
Test ${i + 1} (${new Date(a.date).toLocaleDateString()}):
${a.oxidationType ? `- Oxidation Type: ${a.oxidationType}` : ""}
${a.score ? `- Health Score: ${a.score}/100` : ""}
- Key Minerals: ${this.formatMineralsForPrompt(a.minerals)}
`
  )
  .join("\n")}

Provide a concise summary:
1. Overall trend direction (improving/declining/stable)
2. Key mineral changes (2-3 most significant)
3. What's working well
4. What needs attention
5. Next steps recommendation

Keep it brief and actionable. Include disclaimer.`;

    return await this.session.prompt(trendsPrompt);
  }

  /**
   * Generate "Why This Changed" explanations
   */
  async explainChange(
    before: Partial<MineralData>,
    after: Partial<MineralData>,
    context?: string
  ): Promise<string> {
    if (!this.session) {
      await this.initialize();
    }

    if (!this.session) {
      throw new Error("Failed to initialize Chrome AI session");
    }

    const changePrompt = `Compare these two HTMA results and explain what changed:

PREVIOUS TEST:
${this.formatMineralsForPrompt(before)}

CURRENT TEST:
${this.formatMineralsForPrompt(after)}

${context ? `Context: ${context}` : ""}

Explain briefly:
1. Top 2-3 significant changes
2. Whether changes are positive or need attention
3. Possible reasons (dietary, lifestyle, stress, etc.)
4. One actionable next step

Be encouraging if progress is shown. Include disclaimer.`;

    return await this.session.prompt(changePrompt);
  }

  /**
   * Build comprehensive HTMA analysis prompt
   */
  private buildHTMAPrompt(mineralData: Partial<MineralData>): string {
    return `Analyze this Hair Tissue Mineral Analysis (HTMA) result:

MINERAL VALUES (mg% unless noted):

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

PROVIDE:

1. **Overall Mineral Balance** (2-3 sentences)
   - General pattern assessment
   - Oxidation type (Fast/Slow/Mixed/Balanced)

2. **Key Ratio Analysis** (most important 3-4 ratios)
   - Ca/Mg (ideal ~6.7:1)
   - Na/K (ideal ~2.5:1)
   - Zn/Cu (ideal ~6:1)
   - Ca/P (ideal ~2.6:1)

3. **Health Implications** (3-4 key points)
   - Energy and metabolism
   - Stress response
   - Other relevant systems

4. **Dietary Recommendations** (4-5 specific foods)
   - Foods to emphasize
   - Foods to reduce
   - Focus on food-based, practical suggestions

5. **Lifestyle Guidance** (2-3 actionable items)
   - Stress management
   - Sleep/recovery
   - General wellness practices

Keep total response under 400 words. Be specific, practical, and encouraging.`;
  }

  /**
   * Parse AI response into insights and recommendations
   */
  private parseAIResponse(text: string): {
    insights: string[];
    recommendations: string[];
  } {
    const insights: string[] = [];
    const recommendations: string[] = [];

    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l);

    let currentSection = "insights";

    for (const line of lines) {
      // Detect recommendation sections
      if (
        /recommendation|dietary|supplement|lifestyle|action|next steps?/i.test(
          line
        ) &&
        line.length < 100
      ) {
        currentSection = "recommendations";
        continue;
      }

      // Skip headers, bullets, very short lines
      if (
        line.startsWith("#") ||
        line.startsWith("*") ||
        line.startsWith("-") ||
        line.length < 20
      ) {
        continue;
      }

      // Add to appropriate section
      if (currentSection === "recommendations" && line.length > 20) {
        recommendations.push(line);
      } else if (line.length > 20) {
        insights.push(line);
      }
    }

    // If no recommendations found, extract last section as recommendations
    if (recommendations.length === 0 && insights.length > 3) {
      const lastThird = Math.floor(insights.length * 0.7);
      recommendations.push(...insights.splice(lastThird));
    }

    return { insights, recommendations };
  }

  /**
   * Extract abnormal minerals for evidence tracking
   */
  private extractAbnormalMinerals(mineralData: Partial<MineralData>): string[] {
    // Simplified - you could integrate with MINERAL_REFERENCE_RANGES here
    return Object.entries(mineralData)
      .filter(([_, value]) => value && parseFloat(value as string) > 0)
      .map(([key]) => key);
  }

  /**
   * Format minerals for prompt display
   */
  private formatMineralsForPrompt(mineralData: Partial<MineralData>): string {
    return Object.entries(mineralData)
      .filter(([_, value]) => value && parseFloat(value as string) > 0)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
  }

  /**
   * Cleanup session
   */
  destroy(): void {
    if (this.session) {
      this.session.destroy();
      this.session = null;
    }
  }
}

// Singleton instance
export const chromeAI = new ChromeAIService();
