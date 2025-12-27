import { NextApiRequest, NextApiResponse } from "next";
import { admin } from "../../lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, startDate, endDate, context } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const db = admin.firestore();

    // Build query with proper typing
    let query:
      | admin.firestore.Query<admin.firestore.DocumentData>
      | admin.firestore.CollectionReference<admin.firestore.DocumentData> =
      db.collection("practitionerFeedback");

    // Filter by date range if provided
    if (startDate) {
      query = query.where(
        "metadata.timestamp",
        ">=",
        new Date(startDate as string).toISOString()
      );
    }
    if (endDate) {
      query = query.where(
        "metadata.timestamp",
        "<=",
        new Date(endDate as string).toISOString()
      );
    }

    // Filter by context if provided
    if (context && context !== "all") {
      query = query.where("context", "==", context);
    }

    const snapshot = await query.get();

    // Aggregate data
    const feedbackItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate metrics
    const total = feedbackItems.length;
    const positive = feedbackItems.filter(
      (f: any) => f.sentiment === "positive"
    ).length;
    const negative = feedbackItems.filter(
      (f: any) => f.sentiment === "negative"
    ).length;

    // Aggregate by context
    const byContext: Record<string, any> = {
      health_score: { positive: 0, negative: 0, total: 0 },
      score_delta: { positive: 0, negative: 0, total: 0 },
      focus_summary: { positive: 0, negative: 0, total: 0 },
      pdf_report: { positive: 0, negative: 0, total: 0 },
    };

    feedbackItems.forEach((item: any) => {
      if (byContext[item.context]) {
        byContext[item.context].total++;
        if (item.sentiment === "positive") {
          byContext[item.context].positive++;
        } else {
          byContext[item.context].negative++;
        }
      }
    });

    // Calculate percentages
    Object.keys(byContext).forEach((ctx) => {
      const data = byContext[ctx];
      data.positivePercent =
        data.total > 0 ? Math.round((data.positive / data.total) * 100) : 0;
      data.negativePercent =
        data.total > 0 ? Math.round((data.negative / data.total) * 100) : 0;
    });

    // Get recent comments (negative sentiment first, with comments only)
    const recentComments = feedbackItems
      .filter((f: any) => f.comment && f.comment.trim())
      .sort((a: any, b: any) => {
        // Sort by sentiment (negative first) then by timestamp
        if (a.sentiment !== b.sentiment) {
          return a.sentiment === "negative" ? -1 : 1;
        }
        return (
          new Date(b.metadata.timestamp).getTime() -
          new Date(a.metadata.timestamp).getTime()
        );
      })
      .slice(0, 20);

    // Aggregate by guardrails version
    const byGuardrailsVersion: Record<string, any> = {};
    feedbackItems.forEach((item: any) => {
      const version = item.metadata?.guardrailsVersion || "unknown";
      if (!byGuardrailsVersion[version]) {
        byGuardrailsVersion[version] = { positive: 0, negative: 0, total: 0 };
      }
      byGuardrailsVersion[version].total++;
      if (item.sentiment === "positive") {
        byGuardrailsVersion[version].positive++;
      } else {
        byGuardrailsVersion[version].negative++;
      }
    });

    // Calculate version percentages
    Object.keys(byGuardrailsVersion).forEach((version) => {
      const data = byGuardrailsVersion[version];
      data.negativePercent =
        data.total > 0 ? Math.round((data.negative / data.total) * 100) : 0;
    });

    return res.status(200).json({
      metrics: {
        total,
        positive,
        negative,
        positivePercent: total > 0 ? Math.round((positive / total) * 100) : 0,
        negativePercent: total > 0 ? Math.round((negative / total) * 100) : 0,
      },
      byContext,
      byGuardrailsVersion,
      recentComments,
      rawData: feedbackItems,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return res.status(500).json({
      error: "Failed to fetch feedback",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
