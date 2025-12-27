/**
 * Why This Changed Panel
 *
 * Displays deterministic, rule-based explanation of Health Score changes.
 * Tied to locked health score semantics - no AI, no speculation, no diagnosis.
 */

import { ScoreDeltaExplanation } from "../lib/scoreDeltaExplainer";
import { OxidationDelta } from "../lib/oxidationDeltaEngine";

type Props = {
  delta: ScoreDeltaExplanation;
  oxidationDelta?: OxidationDelta | null;
  isPractitionerMode?: boolean;
};

export default function WhyThisChangedPanel({
  delta,
  oxidationDelta,
  isPractitionerMode = false,
}: Props) {
  // Separate drivers by type for better organization
  const mineralDrivers = delta.topDrivers.filter((d) => d.type === "mineral");
  const ratioDrivers = delta.topDrivers.filter((d) => d.type === "ratio");
  const flagDrivers = delta.topDrivers.filter((d) => d.type === "redFlag");
  const hasMultipleTypes =
    [
      mineralDrivers.length > 0,
      ratioDrivers.length > 0,
      flagDrivers.length > 0,
    ].filter(Boolean).length > 1;

  return (
    <section className="why-changed-panel">
      <div className="panel-header">
        <h3>📊 Why Your Health Score Changed</h3>
      </div>

      <div className="panel-content">
        <p className="headline">{delta.headline}</p>
        <p className="summary">{delta.summary}</p>

        {/* Ratio Drivers Section (shown first if present, as they're 30% of score) */}
        {ratioDrivers.length > 0 && (
          <div className="driver-section">
            {hasMultipleTypes && (
              <h4 className="section-title">⚖️ Ratio Changes</h4>
            )}
            <ul className="drivers-list">
              {ratioDrivers.map((d, i) => (
                <li key={`ratio-${i}`} className="driver-item">
                  <span className="driver-note">{d.note}</span>
                  <span
                    className={`driver-impact ${
                      d.impactPoints > 0 ? "positive" : "negative"
                    }`}
                  >
                    {d.impactPoints > 0 ? "+" : ""}
                    {d.impactPoints}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mineral Drivers Section */}
        {mineralDrivers.length > 0 && (
          <div className="driver-section">
            {hasMultipleTypes && (
              <h4 className="section-title">🔬 Mineral Changes</h4>
            )}
            <ul className="drivers-list">
              {mineralDrivers.map((d, i) => (
                <li key={`mineral-${i}`} className="driver-item">
                  <span className="driver-note">{d.note}</span>
                  <span
                    className={`driver-impact ${
                      d.impactPoints > 0 ? "positive" : "negative"
                    }`}
                  >
                    {d.impactPoints > 0 ? "+" : ""}
                    {d.impactPoints}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Red Flag Drivers Section */}
        {flagDrivers.length > 0 && (
          <div className="driver-section">
            {hasMultipleTypes && (
              <h4 className="section-title">⚠️ Critical Flags</h4>
            )}
            <ul className="drivers-list">
              {flagDrivers.map((d, i) => (
                <li key={`flag-${i}`} className="driver-item">
                  <span className="driver-note">{d.note}</span>
                  <span
                    className={`driver-impact ${
                      d.impactPoints > 0 ? "positive" : "negative"
                    }`}
                  >
                    {d.impactPoints > 0 ? "+" : ""}
                    {d.impactPoints}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isPractitionerMode &&
          delta.allDrivers.length > delta.topDrivers.length && (
            <details className="practitioner-details">
              <summary>
                Show full driver breakdown ({delta.allDrivers.length} total)
              </summary>
              <ul className="all-drivers-list">
                {delta.allDrivers.map((d, i) => (
                  <li key={i} className="driver-detail">
                    <div className="driver-meta">
                      <span className="driver-type">{d.type}</span>
                      <span className="driver-key">{d.key}</span>
                      <span className="driver-change">
                        {d.from} → {d.to}
                      </span>
                    </div>
                    <div className="driver-info">
                      <span className="driver-note-detail">{d.note}</span>
                      <span
                        className={`driver-impact ${
                          d.impactPoints > 0 ? "positive" : "negative"
                        }`}
                      >
                        {d.impactPoints > 0 ? "+" : ""}
                        {d.impactPoints}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </details>
          )}

        {/* Oxidation Pattern Change Section (if available) */}
        {oxidationDelta && oxidationDelta.patternChange.type !== "new_test" && (
          <div className="oxidation-delta-section">
            <h4 className="oxidation-section-title">
              {oxidationDelta.patternChange.isMilestone && (
                <span className="milestone-badge">🎯 MILESTONE</span>
              )}
              <span>🔄 Oxidation Pattern Change</span>
            </h4>

            <div className="oxidation-pattern-change">
              <div className="pattern-comparison">
                <div className="pattern-item previous">
                  <span className="pattern-label">Previous</span>
                  <span className="pattern-type">
                    {oxidationDelta.previous.type}
                  </span>
                </div>
                <div className="pattern-arrow">→</div>
                <div className="pattern-item current">
                  <span className="pattern-label">Current</span>
                  <span className="pattern-type">
                    {oxidationDelta.current.type}
                  </span>
                </div>
              </div>

              <p className="oxidation-summary">{oxidationDelta.summary}</p>

              {/* Distance to Balanced */}
              <div className="distance-metric">
                <span className="metric-label">Distance to Balanced:</span>
                <span className="metric-values">
                  {oxidationDelta.distanceToBalanced.previous.toFixed(1)} →{" "}
                  {oxidationDelta.distanceToBalanced.current.toFixed(1)}
                  {oxidationDelta.distanceToBalanced.direction ===
                    "toward_balanced" && (
                    <span className="direction-indicator positive">
                      {" "}
                      (improving)
                    </span>
                  )}
                  {oxidationDelta.distanceToBalanced.direction ===
                    "away_from_balanced" && (
                    <span className="direction-indicator negative">
                      {" "}
                      (diverging)
                    </span>
                  )}
                </span>
              </div>

              {/* Key Indicator Changes */}
              {oxidationDelta.keyChanges.length > 0 && isPractitionerMode && (
                <details className="key-changes-details">
                  <summary>
                    Key indicator changes ({oxidationDelta.keyChanges.length})
                  </summary>
                  <ul className="key-changes-list">
                    {oxidationDelta.keyChanges.map((change, i) => (
                      <li key={i} className={`change-item ${change.impact}`}>
                        <strong>{change.indicator}:</strong> {change.note}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>
        )}

        <p className="version-info">
          Health Score interpretation uses locked semantics (v
          {delta.engine.semanticsVersion})
        </p>
      </div>

      <style jsx>{`
        .why-changed-panel {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          padding: 1.5rem;
          margin-top: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .panel-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }

        .panel-content {
          margin-top: 1rem;
        }

        .headline {
          margin: 0.5rem 0 0 0;
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .summary {
          margin: 0.75rem 0 0 0;
          font-size: 0.9rem;
          color: #374151;
          line-height: 1.5;
        }

        .driver-section {
          margin-top: 1.5rem;
        }

        .driver-section:first-of-type {
          margin-top: 1rem;
        }

        .section-title {
          margin: 0 0 0.75rem 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .drivers-list {
          margin: 1rem 0 0 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .driver-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          font-size: 0.875rem;
          padding: 0.5rem;
          background: #f9fafb;
          border-radius: 6px;
        }

        .driver-note {
          flex: 1;
          color: #374151;
        }

        .driver-impact {
          font-weight: 700;
          margin-left: 1rem;
          min-width: 3rem;
          text-align: right;
        }

        .driver-impact.positive {
          color: #10b981;
        }

        .driver-impact.negative {
          color: #ef4444;
        }

        .practitioner-details {
          margin-top: 1rem;
          padding: 1rem;
          background: #f3f4f6;
          border-radius: 8px;
        }

        .practitioner-details summary {
          font-size: 0.75rem;
          color: #6b7280;
          cursor: pointer;
          font-weight: 600;
          user-select: none;
        }

        .practitioner-details summary:hover {
          color: #374151;
        }

        .all-drivers-list {
          margin: 1rem 0 0 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .driver-detail {
          padding: 0.75rem;
          background: white;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }

        .driver-meta {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.75rem;
        }

        .driver-type {
          display: inline-block;
          padding: 0.125rem 0.5rem;
          background: #667eea;
          color: white;
          border-radius: 4px;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.65rem;
        }

        .driver-key {
          font-weight: 700;
          color: #111827;
        }

        .driver-change {
          color: #6b7280;
          font-family: monospace;
        }

        .driver-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .driver-note-detail {
          flex: 1;
          color: #374151;
          font-size: 0.875rem;
        }

        /* Oxidation Delta Styling */
        .oxidation-delta-section {
          margin-top: 2rem;
          padding: 1rem;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 2px solid #f59e0b;
          border-radius: 10px;
        }

        .oxidation-section-title {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #92400e;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .milestone-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #dc2626;
          color: white;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .oxidation-pattern-change {
          background: white;
          padding: 1rem;
          border-radius: 8px;
        }

        .pattern-comparison {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .pattern-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .pattern-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 600;
        }

        .pattern-type {
          font-size: 1.1rem;
          font-weight: 700;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          text-transform: capitalize;
        }

        .pattern-item.previous .pattern-type {
          background: #e5e7eb;
          color: #6b7280;
        }

        .pattern-item.current .pattern-type {
          background: #fbbf24;
          color: #92400e;
        }

        .pattern-arrow {
          font-size: 1.5rem;
          color: #6b7280;
          font-weight: bold;
        }

        .oxidation-summary {
          margin: 1rem 0;
          font-size: 0.9rem;
          color: #374151;
          line-height: 1.6;
        }

        .distance-metric {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .metric-label {
          font-weight: 600;
          color: #374151;
        }

        .metric-values {
          color: #6b7280;
          font-family: monospace;
        }

        .direction-indicator {
          font-weight: 600;
          font-family: sans-serif;
        }

        .direction-indicator.positive {
          color: #10b981;
        }

        .direction-indicator.negative {
          color: #ef4444;
        }

        .key-changes-details {
          margin-top: 1rem;
          padding: 0.75rem;
          background: #f3f4f6;
          border-radius: 6px;
        }

        .key-changes-details summary {
          font-size: 0.75rem;
          color: #6b7280;
          cursor: pointer;
          font-weight: 600;
        }

        .key-changes-list {
          margin: 0.75rem 0 0 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .change-item {
          padding: 0.5rem;
          background: white;
          border-radius: 4px;
          font-size: 0.85rem;
          border-left: 3px solid #9ca3af;
        }

        .change-item.positive {
          border-left-color: #10b981;
        }

        .change-item.negative {
          border-left-color: #ef4444;
        }

        .version-info {
          margin: 1rem 0 0 0;
          font-size: 0.75rem;
          color: #9ca3af;
          font-style: italic;
        }

        .version-info {
          margin: 1rem 0 0 0;
          font-size: 0.75rem;
          color: #9ca3af;
          font-style: italic;
        }

        @media (prefers-color-scheme: dark) {
          .why-changed-panel {
            background: #1f2937;
            border-color: #374151;
          }

          .panel-header h3 {
            color: #f9fafb;
          }

          .headline {
            color: #9ca3af;
          }

          .summary {
            color: #d1d5db;
          }

          .driver-item {
            background: #111827;
          }

          .driver-note,
          .driver-note-detail {
            color: #d1d5db;
          }

          .practitioner-details {
            background: #111827;
          }

          .driver-detail {
            background: #1f2937;
            border-color: #374151;
          }

          .driver-key {
            color: #f9fafb;
          }

          .driver-change {
            color: #9ca3af;
          }
        }
      `}</style>
    </section>
  );
}
