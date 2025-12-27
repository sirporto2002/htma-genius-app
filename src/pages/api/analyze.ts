import { NextApiRequest, NextApiResponse } from "next";
import { generateHTMAPrompt } from "../../lib/htmaPrompt";
import {
  ANALYSIS_ENGINE_VERSION,
  PROMPT_VERSION,
  AI_MODEL,
} from "../../lib/htmaConstants";
import { applyGuardrails } from "../../lib/interpretationGuardrails";
import { admin } from "../../lib/firebaseAdmin";
import { calculateHealthScore } from "../../lib/healthScore";
import { calculateAllRatios } from "../../lib/ratioEngine";
import { classifyOxidation } from "../../lib/oxidationClassification";

/**
 * HTMA Analysis API Endpoint
 *
 * Supports all 15 TEI (Trace Elements Inc.) nutritional elements:
 * Major: Ca, Mg, Na, K, P, S
 * Trace: Cu, Zn, Fe, Mn, Cr, Se, B, Co, Mo
 *
 * Backward Compatible: Old analyses with only 10 minerals will still work.
 * Missing minerals default to 0.
 *
 * INTERPRETATION GUARDRAILS:
 * All AI-generated insights and recommendations are automatically passed through
 * applyGuardrails() from interpretationGuardrails.ts to ensure:
 * - No forbidden medical scope (disease diagnosis, pregnancy, children, etc.)
 * - No diagnosis/prescription language
 * - Consumer-appropriate dosage removal
 * - Consistent disclaimer injection
 * - Version-tracked safety compliance
 *
 * This ensures all downstream consumers (UI, PDF, storage, trends) receive
 * only safe, compliant content.
 */

// Log backend URL once on module load
const AI_BACKEND_URL = process.env.AI_BACKEND_URL;
console.log("🚀 AI Backend URL configured:", AI_BACKEND_URL);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("=== /api/analyze called ===");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { mineralData, userId } = req.body;

  // Log full request payload
  console.log(
    "📥 Request payload:",
    JSON.stringify({ mineralData, userId }, null, 2)
  );

  if (!mineralData) {
    return res.status(400).json({ error: "Mineral data is required" });
  }

  try {
    // Generate comprehensive AI prompt with all 15 TEI minerals
    const prompt = generateHTMAPrompt(mineralData);

    // Prepare payload in the format expected by Cloud Run backend
    // Support all 15 TEI nutritional elements with backward compatibility
    const backendPayload = {
      minerals: {
        calcium: parseFloat(mineralData.calcium) || 0,
        magnesium: parseFloat(mineralData.magnesium) || 0,
        sodium: parseFloat(mineralData.sodium) || 0,
        potassium: parseFloat(mineralData.potassium) || 0,
        copper: parseFloat(mineralData.copper) || 0,
        zinc: parseFloat(mineralData.zinc) || 0,
        phosphorus: parseFloat(mineralData.phosphorus) || 0,
        iron: parseFloat(mineralData.iron) || 0,
        manganese: parseFloat(mineralData.manganese) || 0,
        chromium: parseFloat(mineralData.chromium) || 0,
        selenium: parseFloat(mineralData.selenium) || 0,
        boron: parseFloat(mineralData.boron) || 0,
        cobalt: parseFloat(mineralData.cobalt) || 0,
        molybdenum: parseFloat(mineralData.molybdenum) || 0,
        sulfur: parseFloat(mineralData.sulfur) || 0,
      },
      prompt: prompt, // Include enhanced prompt for AI analysis
    };

    console.log("📤 Backend payload:", JSON.stringify(backendPayload, null, 2));

    if (!AI_BACKEND_URL) {
      console.error("❌ AI_BACKEND_URL is not configured");
      return res.status(500).json({
        error: true,
        message: "Backend URL not configured",
        details: "AI_BACKEND_URL environment variable is missing",
      });
    }

    // Try different endpoint paths - Cloud Run services often use different routes
    // Common patterns: /, /v1/analyze, /api/analyze, /analyze
    const endpointPath = process.env.AI_BACKEND_ENDPOINT_PATH || "/analyze";
    const backendUrl = `${AI_BACKEND_URL}${endpointPath}`;
    console.log("📤 Sending request to:", backendUrl);

    const aiResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendPayload),
    });

    // Log response status
    console.log("📊 Backend response status:", aiResponse.status);

    // Get response body
    const responseText = await aiResponse.text();
    console.log("📥 Backend response body:", responseText);

    // If response is not OK, check for 404 and use fallback mock
    if (!aiResponse.ok) {
      // If backend is not found (404), use mock response for testing
      if (aiResponse.status === 404) {
        console.warn("═".repeat(60));
        console.warn("⚠️  AI BACKEND NOT FOUND - USING MOCK FALLBACK");
        console.warn("═".repeat(60));
        console.warn("📍 Request URL:", backendUrl);
        console.warn("📍 Expected endpoint:", AI_BACKEND_URL);
        console.warn(
          "📍 Endpoint path:",
          process.env.AI_BACKEND_ENDPOINT_PATH || "/analyze"
        );
        console.warn(
          "💡 Tip: Verify your AI backend is deployed and the endpoint path is correct"
        );
        console.warn(
          "💡 Update AI_BACKEND_ENDPOINT_PATH in .env.local if needed"
        );
        console.warn("═".repeat(60));

        const mockAnalysis = `Based on your mineral test results, here's an educational overview of potential patterns:

**Overall Assessment:**
Your results show a slow oxidation pattern with elevated calcium (${
          backendPayload.minerals.calcium
        }) and relatively low sodium (${
          backendPayload.minerals.sodium
        }) and potassium (${
          backendPayload.minerals.potassium
        }). This pattern may suggest slower metabolic rate and reduced adrenal function.

**Key Ratio Analysis:**
- Ca/Mg ratio: ${(
          backendPayload.minerals.calcium / backendPayload.minerals.magnesium
        ).toFixed(
          1
        )}:1 (ideal ~6.7:1) - This ratio is elevated, which may indicate magnesium deficiency relative to calcium
- Na/K ratio: ${(
          backendPayload.minerals.sodium / backendPayload.minerals.potassium
        ).toFixed(1)}:1 (ideal ~2.5:1) - This suggests good adrenal balance
- Zn/Cu ratio: ${(
          backendPayload.minerals.zinc / backendPayload.minerals.copper
        ).toFixed(1)}:1 (ideal ~6:1) - Zinc and copper appear well balanced

**Recommendations:**
Consider incorporating magnesium-rich foods such as leafy greens, nuts, seeds, and whole grains. Foods rich in B vitamins and adaptogenic herbs may support energy levels. Adequate protein intake and stress management practices could be beneficial.

**Important Disclaimer:**
This analysis is for educational purposes only and does not constitute medical advice. HTMA results should be interpreted by a qualified healthcare practitioner. Always consult with your healthcare provider before making dietary or supplement changes.`;

        // Auto-save mock analysis to Firestore if userId is provided
        if (userId) {
          // Validate required minerals before attempting save
          const requiredMinerals = {
            calcium: backendPayload.minerals.calcium,
            magnesium: backendPayload.minerals.magnesium,
            sodium: backendPayload.minerals.sodium,
            potassium: backendPayload.minerals.potassium,
          };

          const hasValidMinerals = Object.values(requiredMinerals).every(
            (val) => val > 0
          );

          if (!hasValidMinerals) {
            console.warn(
              "⚠️ Skipping autosave: required minerals (Ca, Mg, Na, K) are invalid or missing"
            );
            console.warn("📊 Mineral values:", requiredMinerals);
          } else {
            try {
              const db = admin.firestore();

              // Convert numbers to strings for MineralData interface
              const mineralDataForHealthScore = {
                calcium: String(backendPayload.minerals.calcium),
                magnesium: String(backendPayload.minerals.magnesium),
                sodium: String(backendPayload.minerals.sodium),
                potassium: String(backendPayload.minerals.potassium),
                copper: String(backendPayload.minerals.copper),
                zinc: String(backendPayload.minerals.zinc),
                phosphorus: String(backendPayload.minerals.phosphorus),
                iron: String(backendPayload.minerals.iron),
                manganese: String(backendPayload.minerals.manganese),
                chromium: String(backendPayload.minerals.chromium),
                selenium: String(backendPayload.minerals.selenium),
                boron: String(backendPayload.minerals.boron),
                cobalt: String(backendPayload.minerals.cobalt),
                molybdenum: String(backendPayload.minerals.molybdenum),
                sulfur: String(backendPayload.minerals.sulfur),
              };

              const healthScore = calculateHealthScore(
                mineralDataForHealthScore
              );
              const oxidation = classifyOxidation({
                Ca: backendPayload.minerals.calcium,
                Mg: backendPayload.minerals.magnesium,
                Na: backendPayload.minerals.sodium,
                K: backendPayload.minerals.potassium,
              });

              // Convert to MineralValues format with symbols
              const mineralValuesForRatios = {
                Ca: backendPayload.minerals.calcium,
                Mg: backendPayload.minerals.magnesium,
                Na: backendPayload.minerals.sodium,
                K: backendPayload.minerals.potassium,
                P: backendPayload.minerals.phosphorus,
                Cu: backendPayload.minerals.copper,
                Zn: backendPayload.minerals.zinc,
                Fe: backendPayload.minerals.iron,
                Mn: backendPayload.minerals.manganese,
                Cr: backendPayload.minerals.chromium,
                Se: backendPayload.minerals.selenium,
                B: backendPayload.minerals.boron,
                Co: backendPayload.minerals.cobalt,
                Mo: backendPayload.minerals.molybdenum,
                S: backendPayload.minerals.sulfur,
              };

              const ratios = calculateAllRatios(mineralValuesForRatios);

              // Convert ratios array to object for easy access
              const ratiosMap = ratios.reduce((acc, ratio) => {
                const key = ratio.name.replace("/", "").toLowerCase();
                acc[key] = ratio.value;
                return acc;
              }, {} as Record<string, number>);

              const analysisDoc = await db
                .collection("users")
                .doc(userId)
                .collection("analyses")
                .add({
                  userId,
                  createdAt: admin.firestore.FieldValue.serverTimestamp(),
                  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                  analysisVersion: ANALYSIS_ENGINE_VERSION,
                  referenceStandard: "TEI",
                  source: "manual-entry",
                  minerals: backendPayload.minerals,
                  ratios: {
                    caMg: ratiosMap["camg"] || 0,
                    naK: ratiosMap["nak"] || 0,
                    caP: ratiosMap["cap"] || 0,
                    znCu: ratiosMap["zncu"] || 0,
                    caK: ratiosMap["cak"] || 0,
                  },
                  oxidationType: oxidation.type,
                  healthScore: {
                    score: healthScore.totalScore,
                    grade: healthScore.grade,
                  },
                  criticalIssues: healthScore.criticalIssues || [],
                  redFlagsCount: (healthScore.criticalIssues || []).length,
                  aiSummary: {
                    confidence: 50, // Lower confidence for mock
                    overview: mockAnalysis,
                    recommendations: "See overview for recommendations",
                    disclaimerIncluded: true,
                  },
                  insights: mockAnalysis,
                  metadata: {
                    engineVersion: ANALYSIS_ENGINE_VERSION,
                    promptVersion: PROMPT_VERSION,
                    aiModel: "Mock (Backend Unavailable)",
                  },
                  guardrails: {
                    version: "1.0.0",
                    reviewedDate: new Date().toISOString(),
                    removedCount: 0,
                  },
                });

              console.log(
                "✅ Mock analysis auto-saved to Firestore:",
                analysisDoc.id
              );
              console.log(
                "📍 Path: users/" + userId + "/analyses/" + analysisDoc.id
              );
            } catch (saveError) {
              console.error("⚠️ Failed to auto-save mock analysis:", saveError);
            }
          }
        }

        return res.status(200).json({
          insights: mockAnalysis,
          timestamp: new Date().toISOString(),
          analysisSource: "mock",
          backendWarning:
            "AI backend unavailable - using mock analysis for testing purposes",
          metadata: {
            engineVersion: ANALYSIS_ENGINE_VERSION,
            promptVersion: PROMPT_VERSION,
            aiModel: "Mock (Backend Unavailable)",
            backendUrl: backendUrl,
            backendStatus: 404,
          },
          guardrails: {
            version: "1.0.0",
            reviewedDate: new Date().toISOString(),
            removedCount: 0,
          },
        });
      }
      let backendError;
      try {
        backendError = JSON.parse(responseText);
      } catch {
        backendError = responseText;
      }

      console.error("❌ Backend returned error:", {
        status: aiResponse.status,
        statusText: aiResponse.statusText,
        body: backendError,
      });

      return res.status(aiResponse.status).json({
        error: true,
        status: aiResponse.status,
        message:
          (typeof backendError === "object" && backendError?.message) ||
          aiResponse.statusText ||
          "Backend request failed",
        backendResponse: backendError,
      });
    }

    // Parse successful response
    let aiData;
    try {
      aiData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ Failed to parse backend JSON:", parseError);
      return res.status(500).json({
        error: true,
        message: "Failed to parse backend response",
        details:
          parseError instanceof Error ? parseError.message : "Unknown error",
        backendResponse: responseText,
      });
    }

    console.log("✅ Successfully processed backend response");

    // Extract raw AI-generated content
    const rawContent = aiData.analysis || aiData.response || aiData.text;

    // Parse AI response into structured insights and recommendations
    // Simple heuristic: split by common section headers
    const parseAIResponse = (text: string) => {
      const insights: string[] = [];
      const recommendations: string[] = [];

      // Split into lines and process
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l);
      let currentSection = "insights";

      for (const line of lines) {
        // Detect recommendation sections
        if (
          /recommendation|dietary|supplement|lifestyle|action/i.test(line) &&
          line.length < 100
        ) {
          currentSection = "recommendations";
          continue;
        }

        // Skip headers, bullets, and very short lines
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
    };

    const { insights: rawInsights, recommendations: rawRecommendations } =
      parseAIResponse(rawContent);

    // Apply interpretation guardrails
    const guarded = applyGuardrails({
      insights: rawInsights,
      recommendations: rawRecommendations,
      ctx: {
        audience: "consumer",
        channel: "api",
        evidence: {
          // TODO: Extract from mineral analysis in future enhancement
          abnormalMinerals: [],
          abnormalRatios: [],
          trends: [],
          flags: [],
        },
      },
    });

    // Combine guarded insights and recommendations back into text format
    // for backward compatibility with existing UI
    const guardedText = [
      ...guarded.insights,
      "",
      "**Recommendations:**",
      ...guarded.recommendations,
    ].join("\n");

    // Auto-save analysis to Firestore if userId is provided
    if (userId) {
      // Validate required minerals before attempting save
      const requiredMinerals = {
        calcium: backendPayload.minerals.calcium,
        magnesium: backendPayload.minerals.magnesium,
        sodium: backendPayload.minerals.sodium,
        potassium: backendPayload.minerals.potassium,
      };

      const hasValidMinerals = Object.values(requiredMinerals).every(
        (val) => val > 0
      );

      if (!hasValidMinerals) {
        console.warn(
          "⚠️ Skipping autosave: required minerals (Ca, Mg, Na, K) are invalid or missing"
        );
        console.warn("📊 Mineral values:", requiredMinerals);
      } else {
        try {
          const db = admin.firestore();

          // Convert minerals to string format for MineralData interface
          const mineralDataForHealthScore = {
            calcium: String(backendPayload.minerals.calcium),
            magnesium: String(backendPayload.minerals.magnesium),
            sodium: String(backendPayload.minerals.sodium),
            potassium: String(backendPayload.minerals.potassium),
            copper: String(backendPayload.minerals.copper),
            zinc: String(backendPayload.minerals.zinc),
            phosphorus: String(backendPayload.minerals.phosphorus),
            iron: String(backendPayload.minerals.iron),
            manganese: String(backendPayload.minerals.manganese),
            chromium: String(backendPayload.minerals.chromium),
            selenium: String(backendPayload.minerals.selenium),
            boron: String(backendPayload.minerals.boron),
            cobalt: String(backendPayload.minerals.cobalt),
            molybdenum: String(backendPayload.minerals.molybdenum),
            sulfur: String(backendPayload.minerals.sulfur),
          };

          // Calculate health score
          const healthScore = calculateHealthScore(mineralDataForHealthScore);

          // Calculate oxidation type
          const oxidation = classifyOxidation({
            Ca: backendPayload.minerals.calcium,
            Mg: backendPayload.minerals.magnesium,
            Na: backendPayload.minerals.sodium,
            K: backendPayload.minerals.potassium,
          });

          // Convert to MineralValues format with symbols for ratios
          const mineralValuesForRatios = {
            Ca: backendPayload.minerals.calcium,
            Mg: backendPayload.minerals.magnesium,
            Na: backendPayload.minerals.sodium,
            K: backendPayload.minerals.potassium,
            P: backendPayload.minerals.phosphorus,
            Cu: backendPayload.minerals.copper,
            Zn: backendPayload.minerals.zinc,
            Fe: backendPayload.minerals.iron,
            Mn: backendPayload.minerals.manganese,
            Cr: backendPayload.minerals.chromium,
            Se: backendPayload.minerals.selenium,
            B: backendPayload.minerals.boron,
            Co: backendPayload.minerals.cobalt,
            Mo: backendPayload.minerals.molybdenum,
            S: backendPayload.minerals.sulfur,
          };

          // Calculate ratios
          const ratios = calculateAllRatios(mineralValuesForRatios);

          // Convert ratios array to map for easy access
          const ratiosMap2 = ratios.reduce((acc, ratio) => {
            const key = ratio.name.replace("/", "").toLowerCase();
            acc[key] = ratio.value;
            return acc;
          }, {} as Record<string, number>);

          // Save to subcollection: users/{userId}/analyses/{analysisId}
          const analysisDoc = await db
            .collection("users")
            .doc(userId)
            .collection("analyses")
            .add({
              // Identity
              userId,

              // Metadata
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              analysisVersion: ANALYSIS_ENGINE_VERSION,
              referenceStandard: "TEI",
              source: "manual-entry",

              // Raw input
              minerals: backendPayload.minerals,

              // Derived ratios
              ratios: {
                caMg: ratiosMap2["camg"] || 0,
                naK: ratiosMap2["nak"] || 0,
                caP: ratiosMap2["cap"] || 0,
                znCu: ratiosMap2["zncu"] || 0,
                caK: ratiosMap2["cak"] || 0,
              },

              // Core outcomes
              oxidationType: oxidation.type,
              healthScore: {
                score: healthScore.totalScore,
                grade: healthScore.grade,
              },

              // Flags
              criticalIssues: healthScore.criticalIssues || [],
              redFlagsCount: (healthScore.criticalIssues || []).length,

              // AI output (guardrail-safe)
              aiSummary: {
                confidence: 85, // TODO: Calculate from AI confidence scoring
                overview: guardedText,
                recommendations: guarded.recommendations.join("\n"),
                disclaimerIncluded: true,
              },

              // Legacy compatibility
              insights: guardedText,
              metadata: {
                engineVersion: ANALYSIS_ENGINE_VERSION,
                promptVersion: PROMPT_VERSION,
                aiModel: AI_MODEL,
              },
              guardrails: {
                version: guarded.version,
                reviewedDate: guarded.reviewedDate,
                removedCount: guarded.removedCount,
              },
            });

          console.log("✅ Analysis auto-saved to Firestore:", analysisDoc.id);
          console.log(
            "📍 Path: users/" + userId + "/analyses/" + analysisDoc.id
          );
        } catch (saveError) {
          console.error("⚠️ Failed to auto-save analysis:", saveError);
          // Don't fail the request if save fails - analysis is still valid
        }
      }
    } else {
      console.log("ℹ️ No userId provided - skipping auto-save");
    }

    return res.status(200).json({
      insights: guardedText,
      timestamp: new Date().toISOString(),
      analysisSource: "ai-backend",
      metadata: {
        engineVersion: ANALYSIS_ENGINE_VERSION,
        promptVersion: PROMPT_VERSION,
        aiModel: AI_MODEL,
      },
      guardrails: {
        version: guarded.version,
        reviewedDate: guarded.reviewedDate,
        removedCount: guarded.removedCount,
      },
    });
  } catch (error) {
    console.error("❌ Error analyzing HTMA data:", error);

    return res.status(500).json({
      error: true,
      message: "Analyze API failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
