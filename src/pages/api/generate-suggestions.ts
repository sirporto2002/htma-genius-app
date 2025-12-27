import { NextApiRequest, NextApiResponse } from "next";
import { admin } from "../../lib/firebaseAdmin";
import { INTERPRETATION_GUARDRAILS_VERSION } from "../../lib/interpretationGuardrails";

interface GuardrailsSuggestion {
  id: string;
  context: string;
  issue: string;
  currentBehavior: string;
  suggestedChange: string;
  rationale: string;
  priority: "critical" | "high" | "medium" | "low";
  affectedFeedbackCount: number;
  relatedComments: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const db = admin.firestore();

    // Fetch all negative feedback
    const feedbackSnapshot = await db
      .collection("practitionerFeedback")
      .where("sentiment", "==", "negative")
      .get();

    const negativeFeedback = feedbackSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Generate suggestions based on feedback patterns
    const suggestions = generateSuggestions(negativeFeedback as any[]);

    // Save suggestions to Firestore for tracking
    const batch = db.batch();
    suggestions.forEach((suggestion) => {
      const docRef = db.collection("guardrailsSuggestions").doc();
      batch.set(docRef, {
        ...suggestion,
        currentGuardrailsVersion: INTERPRETATION_GUARDRAILS_VERSION,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: userId,
      });
    });
    await batch.commit();

    return res.status(200).json({
      suggestions,
      summary: {
        total: suggestions.length,
        critical: suggestions.filter((s) => s.priority === "critical").length,
        high: suggestions.filter((s) => s.priority === "high").length,
        medium: suggestions.filter((s) => s.priority === "medium").length,
        low: suggestions.filter((s) => s.priority === "low").length,
      },
    });
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return res.status(500).json({
      error: "Failed to generate suggestions",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

function generateSuggestions(negativeFeedback: any[]): GuardrailsSuggestion[] {
  const suggestions: GuardrailsSuggestion[] = [];
  let suggestionId = 1;

  // Group feedback by context
  const contextGroups = negativeFeedback.reduce((acc, f) => {
    if (!acc[f.context]) {
      acc[f.context] = [];
    }
    acc[f.context].push(f);
    return acc;
  }, {} as Record<string, any[]>);

  // Analyze each context
  Object.entries(contextGroups).forEach(([context, items]) => {
    const itemsArray = items as any[];
    const comments = itemsArray
      .filter((i: any) => i.comment && i.comment.trim())
      .map((i: any) => i.comment);

    // Detect common issues
    const issues = detectCommonIssues(comments);

    issues.forEach((issue) => {
      const suggestion = createSuggestion(
        suggestionId++,
        context,
        issue,
        comments
      );
      if (suggestion) {
        suggestions.push(suggestion);
      }
    });
  });

  return suggestions.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return (
      priorityOrder[a.priority] - priorityOrder[b.priority] ||
      b.affectedFeedbackCount - a.affectedFeedbackCount
    );
  });
}

function detectCommonIssues(comments: string[]): string[] {
  const issues: string[] = [];

  // Issue patterns to detect
  const patterns = [
    {
      keywords: ["unclear", "confusing", "vague", "ambiguous"],
      issue: "clarity",
    },
    {
      keywords: ["risky", "dangerous", "concerning", "liability"],
      issue: "safety",
    },
    {
      keywords: ["inaccurate", "wrong", "incorrect", "misleading"],
      issue: "accuracy",
    },
    {
      keywords: ["medical", "diagnostic", "treatment", "prescription"],
      issue: "scope_violation",
    },
    {
      keywords: ["technical", "jargon", "complicated", "hard to understand"],
      issue: "complexity",
    },
    {
      keywords: ["actionable", "directive", "tells", "recommends"],
      issue: "action_language",
    },
  ];

  patterns.forEach(({ keywords, issue }) => {
    const matchCount = comments.filter((comment) =>
      keywords.some((kw) => comment.toLowerCase().includes(kw))
    ).length;

    if (matchCount >= 2) {
      issues.push(issue);
    }
  });

  return issues;
}

function createSuggestion(
  id: number,
  context: string,
  issue: string,
  comments: string[]
): GuardrailsSuggestion | null {
  const relatedComments = comments
    .filter((c) => isRelatedToIssue(c, issue))
    .slice(0, 5);

  if (relatedComments.length === 0) return null;

  const templates: Record<
    string,
    {
      currentBehavior: string;
      suggestedChange: string;
      rationale: string;
      priority: "critical" | "high" | "medium" | "low";
    }
  > = {
    clarity: {
      currentBehavior: "Section uses complex or ambiguous language",
      suggestedChange:
        "Simplify language, use shorter sentences, add specific examples",
      rationale:
        "Practitioners report confusion. Clearer language reduces misinterpretation risk.",
      priority: "high",
    },
    safety: {
      currentBehavior: "Language may imply medical advice or create liability",
      suggestedChange:
        "Add stronger disclaimers, remove action verbs, emphasize educational purpose",
      rationale:
        "Practitioners flag safety concerns. Critical for legal protection.",
      priority: "critical",
    },
    accuracy: {
      currentBehavior: "Information perceived as inaccurate or misleading",
      suggestedChange:
        "Review factual claims, add citations, clarify limitations",
      rationale:
        "Practitioners question accuracy. Trust depends on correctness.",
      priority: "critical",
    },
    scope_violation: {
      currentBehavior: "May cross into diagnostic or treatment territory",
      suggestedChange:
        "Remove diagnostic language, block medical terminology, add scope notices",
      rationale:
        "Practitioners warn of scope creep. Must stay educational/informational only.",
      priority: "critical",
    },
    complexity: {
      currentBehavior:
        "Technical language may confuse non-specialist practitioners",
      suggestedChange:
        "Simplify technical terms, add glossary, provide plain-language alternatives",
      rationale:
        "Practitioners struggle with complexity. Accessibility improves adoption.",
      priority: "medium",
    },
    action_language: {
      currentBehavior: "Uses action verbs that imply recommendations",
      suggestedChange:
        'Replace "take", "start", "increase" with "consider discussing", "monitor", "observe"',
      rationale:
        "Practitioners note directive language. Must maintain neutral, observational tone.",
      priority: "high",
    },
  };

  const template = templates[issue];
  if (!template) return null;

  return {
    id: `suggestion-${id}`,
    context: getContextLabel(context),
    issue: issue.replace(/_/g, " ").toUpperCase(),
    currentBehavior: template.currentBehavior,
    suggestedChange: template.suggestedChange,
    rationale: template.rationale,
    priority: template.priority,
    affectedFeedbackCount: relatedComments.length,
    relatedComments,
  };
}

function isRelatedToIssue(comment: string, issue: string): boolean {
  const patterns: Record<string, string[]> = {
    clarity: ["unclear", "confusing", "vague", "ambiguous", "dont understand"],
    safety: ["risky", "dangerous", "concerning", "liability", "careful"],
    accuracy: ["inaccurate", "wrong", "incorrect", "misleading", "false"],
    scope_violation: [
      "medical",
      "diagnostic",
      "treatment",
      "prescription",
      "diagnose",
    ],
    complexity: ["technical", "jargon", "complicated", "hard", "difficult"],
    action_language: ["tells", "recommends", "suggests", "should", "directive"],
  };

  const keywords = patterns[issue] || [];
  return keywords.some((kw) => comment.toLowerCase().includes(kw));
}

function getContextLabel(context: string): string {
  const labels: Record<string, string> = {
    health_score: "Health Score",
    score_delta: "Score Delta",
    focus_summary: "Focus Summary",
    pdf_report: "PDF Report",
  };
  return labels[context] || context;
}
