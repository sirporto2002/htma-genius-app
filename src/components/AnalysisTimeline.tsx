/**
 * AnalysisTimeline Component
 *
 * Visual timeline showing all HTMA analyses chronologically
 * Displays health scores, oxidation types, and allows quick comparison
 */

import React, { useState } from "react";
import {
  OxidationType,
  getOxidationTypeLabel,
} from "../lib/oxidationClassification";

interface AnalysisTimelineProps {
  analyses: any[];
  isPractitioner?: boolean;
  onAnalysisClick?: (analysis: any) => void;
  onCompareClick?: (analysis1: any, analysis2: any) => void;
}

export default function AnalysisTimeline({
  analyses,
  isPractitioner = false,
  onAnalysisClick,
  onCompareClick,
}: AnalysisTimelineProps) {
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>(
    []
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Sort analyses by date (newest first)
  const sortedAnalyses = [...analyses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleAnalysisClick = (analysis: any) => {
    if (onAnalysisClick) {
      onAnalysisClick(analysis);
    }
  };

  const handleCompareToggle = (analysisId: string) => {
    setSelectedForComparison((prev) => {
      if (prev.includes(analysisId)) {
        return prev.filter((id) => id !== analysisId);
      } else if (prev.length < 2) {
        return [...prev, analysisId];
      } else {
        // Replace first selection with new one
        return [prev[1], analysisId];
      }
    });
  };

  const handleCompare = () => {
    if (selectedForComparison.length === 2 && onCompareClick) {
      const analysis1 = analyses.find((a) => a.id === selectedForComparison[0]);
      const analysis2 = analyses.find((a) => a.id === selectedForComparison[1]);
      if (analysis1 && analysis2) {
        onCompareClick(analysis1, analysis2);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "#10b981"; // green
    if (score >= 60) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const getScoreStatus = (score: number): string => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Attention";
  };

  const getOxidationColor = (type: OxidationType): string => {
    const colors: Record<OxidationType, string> = {
      fast: "#3b82f6", // blue
      slow: "#f97316", // orange
      mixed: "#a855f7", // purple
      balanced: "#10b981", // green
    };
    return colors[type];
  };

  const calculateTrend = (index: number): "up" | "down" | "stable" | null => {
    if (index >= sortedAnalyses.length - 1) return null;

    const current = sortedAnalyses[index].healthScore?.totalScore || 0;
    const previous = sortedAnalyses[index + 1].healthScore?.totalScore || 0;

    if (current > previous + 2) return "up";
    if (current < previous - 2) return "down";
    return "stable";
  };

  if (analyses.length === 0) {
    return (
      <div className="timeline-empty">
        <p>
          No analyses yet. Complete your first HTMA analysis to start tracking
          your progress!
        </p>
      </div>
    );
  }

  return (
    <div className="analysis-timeline">
      <div className="timeline-header">
        <h2>Your Progress Timeline</h2>
        <p className="timeline-subtitle">
          {analyses.length} {analyses.length === 1 ? "analysis" : "analyses"} •
          Track your mineral balance journey
        </p>
        {selectedForComparison.length === 2 && (
          <button className="compare-button" onClick={handleCompare}>
            Compare Selected ({selectedForComparison.length})
          </button>
        )}
      </div>

      <div className="timeline-container">
        <div className="timeline-line" />

        {sortedAnalyses.map((analysis, index) => {
          const score = analysis.healthScore?.totalScore || 0;
          const oxidationType = analysis.oxidationType as
            | OxidationType
            | undefined;
          const trend = calculateTrend(index);
          const isSelected = selectedForComparison.includes(analysis.id);
          const isHovered = hoveredId === analysis.id;

          return (
            <div
              key={analysis.id}
              className={`timeline-item ${isSelected ? "selected" : ""} ${
                isHovered ? "hovered" : ""
              }`}
              onMouseEnter={() => setHoveredId(analysis.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="timeline-dot-container">
                <div
                  className="timeline-dot"
                  style={{ backgroundColor: getScoreColor(score) }}
                />
                {trend && (
                  <div className={`trend-indicator trend-${trend}`}>
                    {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
                  </div>
                )}
              </div>

              <div className="timeline-card">
                <div className="timeline-card-header">
                  <div className="timeline-date">
                    {formatDate(analysis.createdAt)}
                  </div>
                  <div className="timeline-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleAnalysisClick(analysis)}
                      title="View details"
                    >
                      👁️
                    </button>
                    <button
                      className={`action-btn compare-btn ${
                        isSelected ? "active" : ""
                      }`}
                      onClick={() => handleCompareToggle(analysis.id)}
                      title="Select for comparison"
                    >
                      {isSelected ? "✓" : "⚖️"}
                    </button>
                  </div>
                </div>

                <div className="timeline-card-body">
                  <div className="score-section">
                    <div className="score-label">Health Score</div>
                    <div
                      className="score-value"
                      style={{ color: getScoreColor(score) }}
                    >
                      {Math.round(score)}
                    </div>
                    <div className="score-status">{getScoreStatus(score)}</div>
                  </div>

                  {oxidationType && (
                    <div className="oxidation-section">
                      <div className="oxidation-label">Oxidation Pattern</div>
                      <div
                        className="oxidation-badge"
                        style={{
                          backgroundColor: getOxidationColor(oxidationType),
                        }}
                      >
                        {getOxidationTypeLabel(oxidationType)}
                      </div>
                    </div>
                  )}

                  {isPractitioner && analysis.healthScore?.criticalIssues && (
                    <div className="issues-section">
                      <div className="issues-count">
                        {analysis.healthScore.criticalIssues.length} critical
                        {analysis.healthScore.criticalIssues.length === 1
                          ? " issue"
                          : " issues"}
                      </div>
                    </div>
                  )}
                </div>

                {index === 0 && <div className="latest-badge">Latest</div>}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .analysis-timeline {
          background: white;
          border-radius: 0.5rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin: 1.5rem 0;
        }

        .timeline-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .timeline-header h2 {
          font-size: 1.5rem;
          color: #111827;
          margin: 0 0 0.5rem 0;
        }

        .timeline-subtitle {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0 0 1rem 0;
        }

        .compare-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .compare-button:hover {
          background: #2563eb;
        }

        .timeline-empty {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .timeline-container {
          position: relative;
          padding: 0 1rem;
        }

        .timeline-line {
          position: absolute;
          left: 2rem;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, #e5e7eb, #f3f4f6);
        }

        .timeline-item {
          position: relative;
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
          transition: transform 0.2s;
        }

        .timeline-item.hovered {
          transform: translateX(4px);
        }

        .timeline-item.selected .timeline-card {
          border: 2px solid #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .timeline-dot-container {
          position: relative;
          flex-shrink: 0;
          width: 3rem;
          display: flex;
          align-items: flex-start;
          padding-top: 1.5rem;
        }

        .timeline-dot {
          width: 1rem;
          height: 1rem;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 0 2px #e5e7eb;
          z-index: 2;
        }

        .trend-indicator {
          position: absolute;
          left: 1.25rem;
          top: 1.25rem;
          font-size: 1.25rem;
          font-weight: bold;
        }

        .trend-indicator.trend-up {
          color: #10b981;
        }

        .trend-indicator.trend-down {
          color: #ef4444;
        }

        .trend-indicator.trend-stable {
          color: #6b7280;
        }

        .timeline-card {
          flex: 1;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1rem;
          transition: all 0.2s;
          position: relative;
        }

        .timeline-card:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .timeline-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .timeline-date {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .timeline-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.25rem;
          padding: 0.25rem 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .action-btn.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .timeline-card-body {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .score-section {
          flex: 1;
          min-width: 120px;
        }

        .score-label,
        .oxidation-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .score-value {
          font-size: 2rem;
          font-weight: 700;
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .score-status {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .oxidation-section {
          flex: 1;
          min-width: 140px;
        }

        .oxidation-badge {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          margin-top: 0.25rem;
        }

        .issues-section {
          flex: 1;
          min-width: 120px;
        }

        .issues-count {
          font-size: 0.875rem;
          color: #ef4444;
          font-weight: 500;
          margin-top: 0.5rem;
        }

        .latest-badge {
          position: absolute;
          top: -0.5rem;
          right: -0.5rem;
          background: #10b981;
          color: white;
          font-size: 0.625rem;
          font-weight: 700;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
}
