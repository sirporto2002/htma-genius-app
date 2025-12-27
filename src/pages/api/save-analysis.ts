import { NextApiRequest, NextApiResponse } from "next";
import { admin } from "../../lib/firebaseAdmin";
import { calculateHealthScore } from "../../lib/healthScore";
import {
  createAuditEvent,
  serializeAuditEvent,
  logAuditEvent,
} from "../../lib/auditEvent";
import { explainScoreDelta } from "../../lib/scoreDeltaExplainer";
import { v4 as uuidv4 } from "uuid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    userId,
    mineralData,
    insights,
    isPractitionerMode = false,
  } = req.body;

  if (!userId || !mineralData || !insights) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const db = admin.firestore();

    // Generate unique report ID for this analysis
    const reportId = uuidv4();

    // Calculate health score
    const healthScore = calculateHealthScore(mineralData);

    // Fetch most recent previous analysis for delta computation
    let scoreDelta = null;
    try {
      const previousAnalyses = await db
        .collection("analyses")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (!previousAnalyses.empty) {
        const previousDoc = previousAnalyses.docs[0];
        const previousData = previousDoc.data();

        // Prepare previous analysis shape for delta explainer
        const previousAnalysis = {
          minerals: previousData.mineralData,
          ratios: {}, // TODO: Extract ratios if available
          score: previousData.healthScore?.totalScore || 0,
          flags: previousData.healthScore?.criticalIssues || [],
        };

        // Prepare current analysis shape
        const currentAnalysis = {
          minerals: mineralData,
          ratios: {}, // TODO: Extract ratios if available
          score: healthScore.totalScore,
          flags: healthScore.criticalIssues || [],
        };

        // Compute delta explanation
        scoreDelta = explainScoreDelta(previousAnalysis, currentAnalysis);
      }
    } catch (deltaError) {
      console.warn("Failed to compute score delta:", deltaError);
      // Continue without delta - non-critical
    }

    // Create audit event
    const auditEvent = createAuditEvent({
      eventType: "ANALYSIS_CREATED",
      reportId,
      isPractitionerMode: Boolean(isPractitionerMode),
      userId,
      metadata: {
        mineralCount: Object.keys(mineralData).length,
        healthScore: healthScore.totalScore,
        grade: healthScore.grade,
      },
    });

    // Log audit event
    logAuditEvent(auditEvent);

    // Save analysis to Firestore with health score, delta, and audit data
    const analysisRef = await db.collection("analyses").add({
      reportId, // Unique identifier for audit trail
      userId,
      mineralData,
      insights,
      isPractitionerMode,
      healthScore: {
        totalScore: healthScore.totalScore,
        mineralScore: healthScore.mineralScore,
        ratioScore: healthScore.ratioScore,
        redFlagScore: healthScore.redFlagScore,
        grade: healthScore.grade,
        statusCounts: healthScore.statusCounts,
        criticalIssues: healthScore.criticalIssues,
      },
      scoreDelta: scoreDelta, // Immutable delta explanation
      auditEvent: serializeAuditEvent(auditEvent), // Store audit metadata
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      success: true,
      analysisId: analysisRef.id,
      reportId, // Return reportId for client-side reference
      healthScore,
      message: "Analysis saved successfully",
    });
  } catch (error) {
    console.error("Error saving analysis:", error);
    return res.status(500).json({
      error: "Failed to save analysis",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
