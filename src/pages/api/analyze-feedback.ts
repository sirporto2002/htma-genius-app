import { NextApiRequest, NextApiResponse } from "next";
import { admin } from "../../lib/firebaseAdmin";

interface FeedbackPattern {
  phrase: string;
  occurrences: number;
  contexts: string[];
  sentiment: "negative" | "positive";
  examples: string[];
}

interface GuardrailsIssue {
  context: string;
  negativePercent: number;
  totalFeedback: number;
  commonPhrases: string[];
  criticalComments: string[];
  severity: "high" | "medium" | "low";
  recommendedAction: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, minNegativePercent = 30 } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const db = admin.firestore();

    // Fetch all feedback
    const feedbackSnapshot = await db.collection("practitionerFeedback").get();

    const allFeedback = feedbackSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Analyze patterns
    const patterns = analyzePatterns(allFeedback as any[]);

    // Identify guardrails issues
    const issues = identifyGuardrailsIssues(
      allFeedback as any[],
      minNegativePercent
    );

    // Extract actionable insights
    const insights = generateActionableInsights(issues, patterns);

    // Track version effectiveness
    const versionComparison = compareVersions(allFeedback as any[]);

    return res.status(200).json({
      patterns,
      issues,
      insights,
      versionComparison,
      summary: {
        totalIssues: issues.length,
        highSeverityIssues: issues.filter((i) => i.severity === "high").length,
        mostProblematicContext: issues.sort(
          (a, b) => b.negativePercent - a.negativePercent
        )[0]?.context,
      },
    });
  } catch (error) {
    console.error("Error analyzing feedback:", error);
    return res.status(500).json({
      error: "Failed to analyze feedback",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

function analyzePatterns(feedback: any[]): FeedbackPattern[] {
  const patternMap = new Map<string, FeedbackPattern>();

  // Extract common words/phrases from comments
  feedback
    .filter((f) => f.comment && f.comment.trim())
    .forEach((f) => {
      const words = extractKeywords(f.comment);

      words.forEach((word) => {
        const existing = patternMap.get(word);
        if (existing) {
          existing.occurrences++;
          if (!existing.contexts.includes(f.context)) {
            existing.contexts.push(f.context);
          }
          if (existing.examples.length < 3) {
            existing.examples.push(f.comment.substring(0, 100));
          }
        } else {
          patternMap.set(word, {
            phrase: word,
            occurrences: 1,
            contexts: [f.context],
            sentiment: f.sentiment,
            examples: [f.comment.substring(0, 100)],
          });
        }
      });
    });

  // Return top patterns (mentioned at least twice)
  return Array.from(patternMap.values())
    .filter((p) => p.occurrences >= 2)
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 20);
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - extract meaningful phrases
  const stopWords = new Set([
    "the",
    "is",
    "at",
    "which",
    "on",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "with",
    "to",
    "for",
    "of",
    "as",
    "by",
    "this",
    "that",
    "it",
    "was",
    "be",
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));

  // Also extract 2-3 word phrases
  const phrases: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i] && words[i + 1]) {
      phrases.push(`${words[i]} ${words[i + 1]}`);
    }
    if (words[i] && words[i + 1] && words[i + 2]) {
      phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
  }

  return [...words, ...phrases];
}

function identifyGuardrailsIssues(
  feedback: any[],
  minNegativePercent: number
): GuardrailsIssue[] {
  const issues: GuardrailsIssue[] = [];

  // Group by context
  const contextGroups = feedback.reduce((acc, f) => {
    if (!acc[f.context]) {
      acc[f.context] = [];
    }
    acc[f.context].push(f);
    return acc;
  }, {} as Record<string, any[]>);

  // Analyze each context
  Object.entries(contextGroups).forEach(([context, items]) => {
    const itemsArray = items as any[];
    const total = itemsArray.length;
    const negative = itemsArray.filter(
      (i: any) => i.sentiment === "negative"
    ).length;
    const negativePercent = total > 0 ? (negative / total) * 100 : 0;

    if (negativePercent >= minNegativePercent) {
      const negativeComments = itemsArray
        .filter((i: any) => i.sentiment === "negative" && i.comment)
        .map((i: any) => i.comment);

      const commonPhrases = extractCommonPhrases(negativeComments);
      const criticalComments = negativeComments
        .filter((c: any) =>
          /unclear|confusing|risky|inaccurate|misleading|dangerous/i.test(c)
        )
        .slice(0, 5);

      issues.push({
        context,
        negativePercent: Math.round(negativePercent),
        totalFeedback: total,
        commonPhrases: commonPhrases.slice(0, 10),
        criticalComments,
        severity:
          negativePercent >= 50
            ? "high"
            : negativePercent >= 30
            ? "medium"
            : "low",
        recommendedAction: generateRecommendation(
          context,
          negativePercent,
          commonPhrases
        ),
      });
    }
  });

  return issues.sort((a, b) => b.negativePercent - a.negativePercent);
}

function extractCommonPhrases(comments: string[]): string[] {
  const phraseCount = new Map<string, number>();

  comments.forEach((comment) => {
    const keywords = extractKeywords(comment);
    keywords.forEach((keyword) => {
      phraseCount.set(keyword, (phraseCount.get(keyword) || 0) + 1);
    });
  });

  return Array.from(phraseCount.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([phrase]) => phrase);
}

function generateRecommendation(
  context: string,
  negativePercent: number,
  commonPhrases: string[]
): string {
  if (negativePercent >= 50) {
    return `URGENT: Review and revise ${context} section. High negative feedback (${negativePercent}%). Consider rewriting with stronger guardrails.`;
  } else if (negativePercent >= 40) {
    return `IMPORTANT: ${context} section needs improvement. Common concerns: ${commonPhrases
      .slice(0, 3)
      .join(", ")}. Review language for clarity and safety.`;
  } else {
    return `Monitor ${context} section. Some practitioners find it unclear. Consider minor refinements.`;
  }
}

function generateActionableInsights(
  issues: GuardrailsIssue[],
  patterns: FeedbackPattern[]
): any[] {
  const insights: any[] = [];

  // Insight 1: Most problematic terms
  const negativePatterns = patterns.filter((p) => p.sentiment === "negative");
  if (negativePatterns.length > 0) {
    insights.push({
      type: "problematic_terms",
      title: "Most Mentioned Concerns",
      data: negativePatterns.slice(0, 5).map((p) => ({
        term: p.phrase,
        occurrences: p.occurrences,
        contexts: p.contexts,
      })),
      action:
        "Review these terms in guardrails and consider blocking or rewording",
    });
  }

  // Insight 2: Cross-context issues
  const crossContextPatterns = patterns.filter((p) => p.contexts.length >= 2);
  if (crossContextPatterns.length > 0) {
    insights.push({
      type: "cross_context_issues",
      title: "Issues Spanning Multiple Sections",
      data: crossContextPatterns.slice(0, 3).map((p) => ({
        term: p.phrase,
        contexts: p.contexts,
        occurrences: p.occurrences,
      })),
      action:
        "These concerns appear across multiple sections. Consider global guardrails update.",
    });
  }

  // Insight 3: High severity issues
  const highSeverityIssues = issues.filter((i) => i.severity === "high");
  if (highSeverityIssues.length > 0) {
    insights.push({
      type: "high_severity",
      title: "Critical Sections Requiring Immediate Attention",
      data: highSeverityIssues.map((i) => ({
        context: i.context,
        negativePercent: i.negativePercent,
        recommendation: i.recommendedAction,
      })),
      action: "Prioritize these sections for immediate guardrails revision",
    });
  }

  return insights;
}

function compareVersions(feedback: any[]): any {
  const versionGroups = feedback.reduce((acc, f) => {
    const version = f.metadata?.guardrailsVersion || "unknown";
    if (!acc[version]) {
      acc[version] = { positive: 0, negative: 0, total: 0 };
    }
    acc[version].total++;
    if (f.sentiment === "positive") {
      acc[version].positive++;
    } else {
      acc[version].negative++;
    }
    return acc;
  }, {} as Record<string, any>);

  // Calculate improvement between versions
  const versions = Object.keys(versionGroups).sort();
  const comparisons: any[] = [];

  for (let i = 1; i < versions.length; i++) {
    const prev = versionGroups[versions[i - 1]];
    const curr = versionGroups[versions[i]];

    const prevNegativePercent = (prev.negative / prev.total) * 100;
    const currNegativePercent = (curr.negative / curr.total) * 100;
    const improvement = prevNegativePercent - currNegativePercent;

    comparisons.push({
      fromVersion: versions[i - 1],
      toVersion: versions[i],
      improvement: Math.round(improvement * 10) / 10,
      status:
        improvement > 0
          ? "improved"
          : improvement < 0
          ? "worsened"
          : "unchanged",
      details: {
        previous: {
          negativePercent: Math.round(prevNegativePercent),
          total: prev.total,
        },
        current: {
          negativePercent: Math.round(currNegativePercent),
          total: curr.total,
        },
      },
    });
  }

  return {
    versions: versionGroups,
    comparisons,
    trend:
      comparisons.length > 0 &&
      comparisons[comparisons.length - 1].improvement > 0
        ? "improving"
        : "needs_attention",
  };
}
