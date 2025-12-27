/**
 * Why This Changed Component
 *
 * Displays clinical explanation for health score changes between analyses.
 * Only appears when user has 2+ saved analyses.
 */

import {
  ScoreExplanation,
  formatScoreDelta,
  getScoreDeltaColor,
  getDirectionIcon,
} from "../lib/scoreExplainer";

interface WhyThisChangedProps {
  explanation: ScoreExplanation;
}

export default function WhyThisChanged({ explanation }: WhyThisChangedProps) {
  const {
    scoreDelta,
    direction,
    primaryDrivers,
    secondaryContributors,
    offsettingFactors,
    breakdown,
  } = explanation;

  // Don't show if change is negligible
  if (Math.abs(scoreDelta) < 1) {
    return null;
  }

  return (
    <div className="why-changed-container">
      <div className="why-changed-header">
        <h3>{getDirectionIcon(direction)} Why Your Score Changed</h3>
        <div
          className="score-delta"
          style={{ color: getScoreDeltaColor(scoreDelta) }}
        >
          {formatScoreDelta(scoreDelta)} points
        </div>
      </div>

      <div className="why-changed-content">
        {/* Primary Drivers */}
        {primaryDrivers.length > 0 && (
          <div className="change-section primary">
            <h4 className="section-title">
              {direction === "improved"
                ? "🎯 Key Improvements"
                : "⚠️ Primary Concerns"}
            </h4>
            <ul className="change-list">
              {primaryDrivers.map((driver, index) => (
                <li key={index} className="change-item primary-item">
                  {driver}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Secondary Contributors */}
        {secondaryContributors.length > 0 && (
          <div className="change-section secondary">
            <h4 className="section-title">
              {direction === "improved"
                ? "✨ Also Improved"
                : "📊 Additional Changes"}
            </h4>
            <ul className="change-list">
              {secondaryContributors.map((contributor, index) => (
                <li key={index} className="change-item secondary-item">
                  {contributor}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Offsetting Factors */}
        {offsettingFactors.length > 0 && (
          <div className="change-section offsetting">
            <h4 className="section-title">⚖️ Offsetting Factors</h4>
            <ul className="change-list">
              {offsettingFactors.map((factor, index) => (
                <li key={index} className="change-item offsetting-item">
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Breakdown Summary */}
        <div className="breakdown-summary">
          <div className="breakdown-item">
            <span className="breakdown-label">Mineral Changes:</span>
            <span
              className="breakdown-value"
              style={{ color: getScoreDeltaColor(breakdown.mineralScoreDelta) }}
            >
              {formatScoreDelta(breakdown.mineralScoreDelta)}
            </span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Ratio Changes:</span>
            <span
              className="breakdown-value"
              style={{ color: getScoreDeltaColor(breakdown.ratioScoreDelta) }}
            >
              {formatScoreDelta(breakdown.ratioScoreDelta)}
            </span>
          </div>
          {Math.abs(breakdown.redFlagScoreDelta) > 0.5 && (
            <div className="breakdown-item">
              <span className="breakdown-label">Red Flag Changes:</span>
              <span
                className="breakdown-value"
                style={{
                  color: getScoreDeltaColor(breakdown.redFlagScoreDelta),
                }}
              >
                {formatScoreDelta(breakdown.redFlagScoreDelta)}
              </span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .why-changed-container {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-left: 4px solid ${getScoreDeltaColor(scoreDelta)};
        }

        .why-changed-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .why-changed-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #1a1a1a;
          font-weight: 600;
        }

        .score-delta {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .why-changed-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .change-section {
          background: #f9fafb;
          border-radius: 8px;
          padding: 1rem;
        }

        .change-section.primary {
          background: ${direction === "improved" ? "#f0fdf4" : "#fef2f2"};
        }

        .change-section.secondary {
          background: #f0f9ff;
        }

        .change-section.offsetting {
          background: #fefce8;
        }

        .section-title {
          margin: 0 0 0.75rem 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: #374151;
        }

        .change-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .change-item {
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .primary-item {
          background: white;
          color: #1a1a1a;
          font-weight: 500;
          border-left: 3px solid
            ${direction === "improved" ? "#10b981" : "#ef4444"};
        }

        .secondary-item {
          background: white;
          color: #374151;
        }

        .offsetting-item {
          background: white;
          color: #92400e;
          border-left: 3px solid #f59e0b;
        }

        .breakdown-summary {
          display: flex;
          gap: 1.5rem;
          padding: 1rem;
          background: #f3f4f6;
          border-radius: 8px;
          flex-wrap: wrap;
        }

        .breakdown-item {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .breakdown-label {
          font-size: 0.85rem;
          color: #6b7280;
          font-weight: 500;
        }

        .breakdown-value {
          font-size: 0.95rem;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .why-changed-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .breakdown-summary {
            flex-direction: column;
            gap: 0.75rem;
          }
        }

        @media (prefers-color-scheme: dark) {
          .why-changed-container {
            background: #1a1a1a;
            border-left-color: ${getScoreDeltaColor(scoreDelta)};
          }

          .why-changed-header h3 {
            color: #ffffff;
          }

          .why-changed-header {
            border-bottom-color: #2a2a2a;
          }

          .change-section {
            background: #2a2a2a;
          }

          .change-section.primary {
            background: ${direction === "improved" ? "#064e3b" : "#7f1d1d"};
          }

          .change-section.secondary {
            background: #172554;
          }

          .change-section.offsetting {
            background: #78350f;
          }

          .section-title {
            color: #d1d5db;
          }

          .primary-item,
          .secondary-item,
          .offsetting-item {
            background: #1a1a1a;
          }

          .primary-item {
            color: #ffffff;
          }

          .secondary-item {
            color: #d1d5db;
          }

          .offsetting-item {
            color: #fbbf24;
          }

          .breakdown-summary {
            background: #2a2a2a;
          }

          .breakdown-label {
            color: #9ca3af;
          }
        }
      `}</style>
    </div>
  );
}
