/**
 * ProgressHighlights Component
 *
 * Shows key achievements, improvements, and areas needing attention
 * Detects milestones and celebrates progress
 */

import React from "react";
import {
  OxidationType,
  getOxidationTypeLabel,
} from "../lib/oxidationClassification";

interface Analysis {
  id: string;
  createdAt: string;
  healthScore?: {
    totalScore: number;
    criticalIssues?: string[];
  };
  oxidationType?: OxidationType;
  mineralData: any;
}

interface ProgressHighlightsProps {
  analyses: Analysis[];
  isPractitioner?: boolean;
}

export default function ProgressHighlights({
  analyses,
  isPractitioner = false,
}: ProgressHighlightsProps) {
  if (analyses.length < 2) {
    return (
      <div className="progress-highlights">
        <h3>Progress Highlights</h3>
        <p className="no-data">
          Complete at least 2 analyses to see your progress highlights and
          achievements!
        </p>
      </div>
    );
  }

  const sortedAnalyses = [...analyses].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const firstAnalysis = sortedAnalyses[0];
  const latestAnalysis = sortedAnalyses[sortedAnalyses.length - 1];

  const firstScore = firstAnalysis.healthScore?.totalScore || 0;
  const latestScore = latestAnalysis.healthScore?.totalScore || 0;
  const scoreDelta = latestScore - firstScore;

  // Detect milestones
  const milestones: Array<{
    icon: string;
    title: string;
    description: string;
  }> = [];

  // Milestone: Score improvement
  if (scoreDelta >= 10) {
    milestones.push({
      icon: "🎯",
      title: "Significant Improvement",
      description: `Health score improved by ${Math.round(
        scoreDelta
      )} points since your first analysis`,
    });
  }

  // Milestone: Reached excellent
  if (latestScore >= 80 && firstScore < 80) {
    milestones.push({
      icon: "⭐",
      title: "Excellent Health Score",
      description: "You've achieved an excellent health score!",
    });
  }

  // Milestone: Oxidation evolution
  if (
    firstAnalysis.oxidationType &&
    latestAnalysis.oxidationType &&
    firstAnalysis.oxidationType !== latestAnalysis.oxidationType
  ) {
    milestones.push({
      icon: "🔄",
      title: "Oxidation Pattern Changed",
      description: `Evolved from ${getOxidationTypeLabel(
        firstAnalysis.oxidationType
      )} to ${getOxidationTypeLabel(latestAnalysis.oxidationType)}`,
    });
  }

  // Milestone: Balanced oxidation
  if (latestAnalysis.oxidationType === "balanced") {
    milestones.push({
      icon: "⚖️",
      title: "Balanced Oxidation",
      description: "You've achieved a balanced oxidation pattern!",
    });
  }

  // Milestone: Consistency
  if (analyses.length >= 5) {
    milestones.push({
      icon: "📊",
      title: "Committed to Progress",
      description: `You've completed ${analyses.length} analyses - great dedication!`,
    });
  }

  // Milestone: Reduced critical issues
  const firstCritical = firstAnalysis.healthScore?.criticalIssues?.length || 0;
  const latestCritical =
    latestAnalysis.healthScore?.criticalIssues?.length || 0;

  if (firstCritical > 0 && latestCritical < firstCritical) {
    milestones.push({
      icon: "✅",
      title: "Critical Issues Reduced",
      description: `Resolved ${firstCritical - latestCritical} critical ${
        firstCritical - latestCritical === 1 ? "issue" : "issues"
      }`,
    });
  }

  // Find biggest improvements in minerals
  const mineralImprovements: Array<{
    mineral: string;
    change: number;
    direction: "improved" | "declined";
  }> = [];

  if (isPractitioner) {
    const minerals = ["Ca", "Mg", "Na", "K", "Fe", "Cu", "Zn", "P", "Se"];

    minerals.forEach((mineral) => {
      const firstValue = firstAnalysis.mineralData?.[mineral];
      const latestValue = latestAnalysis.mineralData?.[mineral];

      if (firstValue !== undefined && latestValue !== undefined) {
        const change = Math.abs(latestValue - firstValue);
        const percentChange = (change / firstValue) * 100;

        if (percentChange > 10) {
          mineralImprovements.push({
            mineral,
            change: percentChange,
            direction: latestValue > firstValue ? "improved" : "declined",
          });
        }
      }
    });

    mineralImprovements.sort((a, b) => b.change - a.change);
  }

  return (
    <div className="progress-highlights">
      <h3>🏆 Progress Highlights</h3>

      {/* Overall Progress Summary */}
      <div className="summary-section">
        <div className="summary-card">
          <div className="summary-label">Overall Progress</div>
          <div
            className="summary-value"
            style={{
              color: scoreDelta >= 0 ? "#10b981" : "#ef4444",
            }}
          >
            {scoreDelta >= 0 ? "+" : ""}
            {Math.round(scoreDelta)} points
          </div>
          <div className="summary-detail">
            From {Math.round(firstScore)} to {Math.round(latestScore)}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Total Analyses</div>
          <div className="summary-value" style={{ color: "#3b82f6" }}>
            {analyses.length}
          </div>
          <div className="summary-detail">
            Since{" "}
            {new Date(firstAnalysis.createdAt).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>

        {latestAnalysis.oxidationType && (
          <div className="summary-card">
            <div className="summary-label">Current Pattern</div>
            <div className="summary-value" style={{ color: "#a855f7" }}>
              {
                getOxidationTypeLabel(latestAnalysis.oxidationType).split(
                  " "
                )[0]
              }
            </div>
            <div className="summary-detail">Oxidation Type</div>
          </div>
        )}
      </div>

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="milestones-section">
          <h4>🎖️ Milestones Achieved</h4>
          <div className="milestones-grid">
            {milestones.map((milestone, index) => (
              <div key={index} className="milestone-card">
                <div className="milestone-icon">{milestone.icon}</div>
                <div className="milestone-content">
                  <div className="milestone-title">{milestone.title}</div>
                  <div className="milestone-description">
                    {milestone.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Biggest Changes (Practitioner Only) */}
      {isPractitioner && mineralImprovements.length > 0 && (
        <div className="changes-section">
          <h4>📈 Biggest Changes</h4>
          <div className="changes-list">
            {mineralImprovements.slice(0, 5).map((change, index) => (
              <div key={index} className="change-item">
                <span className="change-mineral">{change.mineral}</span>
                <span
                  className="change-percentage"
                  style={{
                    color:
                      change.direction === "improved" ? "#10b981" : "#f59e0b",
                  }}
                >
                  {change.direction === "improved" ? "↑" : "↓"}{" "}
                  {Math.round(change.change)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keep Going Message */}
      <div className="encouragement-section">
        <p>
          {scoreDelta > 0
            ? "🌟 Keep up the great work! Your progress is showing."
            : latestScore >= 70
            ? "💪 You're maintaining good mineral balance. Stay consistent!"
            : "🎯 Every analysis helps you understand your mineral patterns better. Keep going!"}
        </p>
      </div>

      <style jsx>{`
        .progress-highlights {
          background: white;
          border-radius: 0.5rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin: 1.5rem 0;
        }

        .progress-highlights h3 {
          font-size: 1.25rem;
          color: #111827;
          margin: 0 0 1.5rem 0;
        }

        .progress-highlights h4 {
          font-size: 1rem;
          color: #374151;
          margin: 0 0 1rem 0;
        }

        .no-data {
          color: #6b7280;
          text-align: center;
          padding: 2rem;
        }

        .summary-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }

        .summary-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .summary-value {
          font-size: 1.875rem;
          font-weight: 700;
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .summary-detail {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .milestones-section {
          margin-bottom: 2rem;
        }

        .milestones-grid {
          display: grid;
          gap: 0.75rem;
        }

        .milestone-card {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: linear-gradient(to right, #fef3c7, #fef9c3);
          border-left: 4px solid #f59e0b;
          border-radius: 0.5rem;
        }

        .milestone-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .milestone-content {
          flex: 1;
        }

        .milestone-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #78350f;
          margin-bottom: 0.25rem;
        }

        .milestone-description {
          font-size: 0.75rem;
          color: #92400e;
        }

        .changes-section {
          margin-bottom: 2rem;
        }

        .changes-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .change-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 0.375rem;
        }

        .change-mineral {
          font-weight: 600;
          color: #111827;
        }

        .change-percentage {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .encouragement-section {
          margin-top: 2rem;
          padding: 1rem;
          background: linear-gradient(to right, #dbeafe, #e0e7ff);
          border-radius: 0.5rem;
          text-align: center;
        }

        .encouragement-section p {
          margin: 0;
          color: #1e3a8a;
          font-size: 0.875rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
