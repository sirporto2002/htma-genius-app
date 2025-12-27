/**
 * Trend Analysis Panel
 *
 * Displays deterministic trend analysis across 3+ HTMA tests.
 * Shows overall patterns, mineral trends, and key insights.
 */

import { TrendExplanation } from "../lib/trendExplainer";

type Props = {
  trendAnalysis: TrendExplanation;
  isPractitionerMode?: boolean;
};

export default function TrendPanel({
  trendAnalysis,
  isPractitionerMode = false,
}: Props) {
  const { overall, headline, summary, keyInsights, mineralTrends, timespan } =
    trendAnalysis;

  // Direction styling
  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case "improving":
        return "#22c55e";
      case "declining":
        return "#ef4444";
      case "stable":
        return "#6b7280";
      case "volatile":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getStrengthLabel = (strength: string) => {
    switch (strength) {
      case "strong":
        return "Strong";
      case "moderate":
        return "Moderate";
      case "weak":
        return "Weak";
      default:
        return strength;
    }
  };

  return (
    <section className="trend-panel">
      <div className="panel-header">
        <h3>📈 Trend Analysis</h3>
        <span className="timespan-badge">
          {timespan.periodCount} tests over{" "}
          {Math.round(timespan.avgDaysBetween * timespan.periodCount)} days
        </span>
      </div>

      <div className="panel-content">
        {/* Headline */}
        <div className="trend-headline">
          <h4>{headline}</h4>
        </div>

        {/* Overall Pattern */}
        <div className="overall-pattern">
          <div className="pattern-row">
            <span className="pattern-label">Direction:</span>
            <span
              className="pattern-value"
              style={{ color: getDirectionColor(overall.direction) }}
            >
              {overall.direction.toUpperCase()}
            </span>
          </div>
          <div className="pattern-row">
            <span className="pattern-label">Strength:</span>
            <span className="pattern-value">
              {getStrengthLabel(overall.strength)}
            </span>
          </div>
          <div className="pattern-row">
            <span className="pattern-label">Total Change:</span>
            <span
              className="pattern-value"
              style={{
                color:
                  overall.scoreDelta > 0
                    ? "#22c55e"
                    : overall.scoreDelta < 0
                    ? "#ef4444"
                    : "#6b7280",
              }}
            >
              {overall.scoreDelta > 0 ? "+" : ""}
              {overall.scoreDelta} points
            </span>
          </div>
          <div className="pattern-row">
            <span className="pattern-label">Consistency:</span>
            <span className="pattern-value">
              {Math.round(overall.consistency * 100)}%
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="trend-summary">
          <p>{summary}</p>
        </div>

        {/* Key Insights */}
        {keyInsights.length > 0 && (
          <div className="key-insights">
            <h5>Key Insights</h5>
            <ul>
              {keyInsights.map((insight, i) => (
                <li key={i}>{insight}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Mineral Trends */}
        {mineralTrends.length > 0 && (
          <div className="mineral-trends">
            <h5>Notable Mineral Trends</h5>
            <div className="trends-list">
              {mineralTrends.map((trend, i) => (
                <div key={i} className="trend-item">
                  <div className="trend-header">
                    <span className="mineral-name">{trend.mineral}</span>
                    <span
                      className={`trend-direction direction-${trend.direction}`}
                    >
                      {trend.direction}
                    </span>
                  </div>
                  <div className="trend-note">{trend.note}</div>
                  {isPractitionerMode && trend.pattern !== "consistent" && (
                    <div className="trend-pattern">
                      Pattern: {trend.pattern.replace(/-/g, " ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practitioner Mode: Extended Data */}
        {isPractitionerMode && (
          <details className="practitioner-details">
            <summary>Extended Trend Data</summary>
            <div className="details-content">
              <div className="detail-row">
                <strong>Analysis Period:</strong>
                <span>
                  {new Date(timespan.firstDate).toLocaleDateString()} →{" "}
                  {new Date(timespan.lastDate).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-row">
                <strong>Average Test Interval:</strong>
                <span>{timespan.avgDaysBetween} days</span>
              </div>
              <div className="detail-row">
                <strong>Tests Analyzed:</strong>
                <span>{timespan.periodCount + 1}</span>
              </div>
              <div className="detail-row">
                <strong>Avg Change Per Period:</strong>
                <span>
                  {overall.avgChangePerPeriod > 0 ? "+" : ""}
                  {overall.avgChangePerPeriod} points
                </span>
              </div>
              <div className="detail-row">
                <strong>Engine Version:</strong>
                <span>{trendAnalysis.engine.version}</span>
              </div>
              <div className="detail-row">
                <strong>Semantics Version:</strong>
                <span>{trendAnalysis.engine.semanticsVersion}</span>
              </div>
            </div>
          </details>
        )}
      </div>

      <style jsx>{`
        .trend-panel {
          margin: 2rem 0;
          padding: 1.5rem;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 12px;
          border: 2px solid #f59e0b;
          box-shadow: 0 4px 6px rgba(245, 158, 11, 0.1);
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 1.5rem;
          color: #78350f;
        }

        .timespan-badge {
          padding: 0.25rem 0.75rem;
          background: #fbbf24;
          color: #78350f;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .panel-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .trend-headline h4 {
          margin: 0;
          font-size: 1.25rem;
          color: #92400e;
          line-height: 1.4;
        }

        .overall-pattern {
          padding: 1rem;
          background: white;
          border-radius: 8px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .pattern-row {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .pattern-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #78350f;
          letter-spacing: 0.05em;
        }

        .pattern-value {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1f2937;
        }

        .trend-summary {
          padding: 1rem;
          background: white;
          border-radius: 8px;
          line-height: 1.7;
        }

        .trend-summary p {
          margin: 0;
          color: #1e293b;
        }

        .key-insights h5,
        .mineral-trends h5 {
          margin: 0 0 0.75rem 0;
          font-size: 1rem;
          font-weight: 700;
          color: #78350f;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .key-insights {
          padding: 1rem;
          background: white;
          border-radius: 8px;
        }

        .key-insights ul {
          margin: 0;
          padding-left: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .key-insights li {
          color: #475569;
          line-height: 1.6;
        }

        .mineral-trends {
          padding: 1rem;
          background: white;
          border-radius: 8px;
        }

        .trends-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .trend-item {
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 6px;
          border-left: 3px solid #cbd5e1;
        }

        .trend-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .mineral-name {
          font-weight: 700;
          font-size: 1rem;
          color: #1e293b;
        }

        .trend-direction {
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .direction-improving {
          background: #d1fae5;
          color: #065f46;
        }

        .direction-declining {
          background: #fee2e2;
          color: #991b1b;
        }

        .direction-stable {
          background: #e5e7eb;
          color: #374151;
        }

        .direction-volatile {
          background: #fef3c7;
          color: #92400e;
        }

        .trend-note {
          font-size: 0.9rem;
          color: #64748b;
          line-height: 1.5;
        }

        .trend-pattern {
          margin-top: 0.5rem;
          font-size: 0.8rem;
          color: #94a3b8;
          font-style: italic;
        }

        .practitioner-details {
          margin-top: 1rem;
        }

        .practitioner-details summary {
          cursor: pointer;
          padding: 0.75rem;
          background: white;
          border-radius: 6px;
          font-weight: 600;
          color: #78350f;
          transition: background 0.2s;
        }

        .practitioner-details summary:hover {
          background: #fffbeb;
        }

        .details-content {
          margin-top: 0.5rem;
          padding: 1rem;
          background: white;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-row strong {
          color: #78350f;
          font-size: 0.9rem;
        }

        .detail-row span {
          color: #475569;
          font-size: 0.9rem;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .trend-panel {
            background: linear-gradient(135deg, #422006 0%, #713f12 100%);
            border-color: #f59e0b;
          }

          .panel-header h3 {
            color: #fde68a;
          }

          .timespan-badge {
            background: #92400e;
            color: #fde68a;
          }

          .trend-headline h4 {
            color: #fbbf24;
          }

          .overall-pattern,
          .trend-summary,
          .key-insights,
          .mineral-trends,
          .practitioner-details summary,
          .details-content {
            background: #1e293b;
            color: #e2e8f0;
          }

          .trend-summary p,
          .key-insights li {
            color: #cbd5e1;
          }

          .trend-item {
            background: #0f172a;
            border-left-color: #475569;
          }

          .mineral-name {
            color: #e2e8f0;
          }

          .trend-note {
            color: #94a3b8;
          }

          .detail-row {
            border-bottom-color: #334155;
          }

          .detail-row strong {
            color: #fbbf24;
          }

          .detail-row span {
            color: #cbd5e1;
          }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .trend-panel {
            padding: 1rem;
          }

          .panel-header h3 {
            font-size: 1.25rem;
          }

          .overall-pattern {
            grid-template-columns: 1fr;
          }

          .trend-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </section>
  );
}
