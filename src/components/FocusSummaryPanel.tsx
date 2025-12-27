/**
 * Focus Summary Panel
 *
 * Displays guardrail-safe focus guidance based on score changes.
 * Shows what to MONITOR and PRIORITIZE, not what to do or take.
 *
 * This panel answers: "Given what changed, what should I pay attention to next?"
 */

import {
  ChangeFocusSummary,
  getConfidenceLabel,
} from "../lib/changeCoachingEngine";

type Props = {
  focusSummary: ChangeFocusSummary;
  isPractitionerMode?: boolean;
};

export default function FocusSummaryPanel({
  focusSummary,
  isPractitionerMode = false,
}: Props) {
  const { primaryFocus, secondaryFocus, explanation, confidence, scopeNotice } =
    focusSummary;

  return (
    <section className="focus-summary-panel">
      <div className="panel-header">
        <h3>🧭 Change Focus Summary</h3>
        <span className={`confidence-badge confidence-${confidence}`}>
          {getConfidenceLabel(confidence)}
        </span>
      </div>

      <div className="panel-content">
        {/* Primary Focus */}
        <div className="primary-focus">
          <div className="focus-label">Primary Focus</div>
          <div className="focus-item">
            <span className={`focus-key domain-${primaryFocus.domain}`}>
              {primaryFocus.key}
            </span>
            <span
              className={`direction-badge direction-${primaryFocus.direction}`}
            >
              {primaryFocus.direction}
            </span>
            <span className="importance-score">
              {primaryFocus.importance}/100
            </span>
          </div>
          <div className="focus-reason">{primaryFocus.reason}</div>
        </div>

        {/* Secondary Focus (if any) */}
        {secondaryFocus.length > 0 && (
          <div className="secondary-focus">
            <div className="focus-label">Also Monitor</div>
            <ul className="focus-list">
              {secondaryFocus.map((item, i) => (
                <li key={i} className="focus-item-compact">
                  <span className={`focus-key domain-${item.domain}`}>
                    {item.key}
                  </span>
                  <span
                    className={`direction-badge direction-${item.direction}`}
                  >
                    {item.direction}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Explanation */}
        <div className="focus-explanation">
          <p>{explanation}</p>
        </div>

        {/* Scope Notice */}
        <div className="scope-notice">
          <span className="notice-icon">ℹ️</span>
          <span className="notice-text">{scopeNotice}</span>
        </div>

        {/* Metadata (practitioner mode) */}
        {isPractitionerMode && (
          <details className="metadata-details">
            <summary>Focus Engine Metadata</summary>
            <div className="metadata-content">
              <div className="metadata-row">
                <strong>Version:</strong> {focusSummary.metadata.version}
              </div>
              <div className="metadata-row">
                <strong>Semantics:</strong>{" "}
                {focusSummary.metadata.semanticsVersion}
              </div>
              <div className="metadata-row">
                <strong>Audience:</strong> {focusSummary.metadata.audience}
              </div>
              <div className="metadata-row">
                <strong>Computed:</strong>{" "}
                {new Date(focusSummary.metadata.computedAt).toLocaleString()}
              </div>
            </div>
          </details>
        )}
      </div>

      <style jsx>{`
        .focus-summary-panel {
          margin: 2rem 0;
          padding: 1.5rem;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 12px;
          border: 2px solid #0ea5e9;
          box-shadow: 0 4px 6px rgba(14, 165, 233, 0.1);
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
          color: #0c4a6e;
        }

        .confidence-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .confidence-high {
          background: #22c55e;
          color: white;
        }

        .confidence-moderate {
          background: #f59e0b;
          color: white;
        }

        .confidence-low {
          background: #6b7280;
          color: white;
        }

        .panel-content {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .primary-focus {
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border-left: 4px solid #0ea5e9;
        }

        .focus-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
        }

        .focus-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 0.5rem;
        }

        .focus-key {
          font-size: 1.1rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
        }

        .domain-mineral {
          background: #dbeafe;
          color: #1e40af;
        }

        .domain-ratio {
          background: #fef3c7;
          color: #92400e;
        }

        .domain-redFlag {
          background: #fee2e2;
          color: #991b1b;
        }

        .direction-badge {
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .direction-improving {
          background: #d1fae5;
          color: #065f46;
        }

        .direction-worsening {
          background: #fee2e2;
          color: #991b1b;
        }

        .direction-stable {
          background: #e5e7eb;
          color: #374151;
        }

        .importance-score {
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 600;
        }

        .focus-reason {
          font-size: 0.9rem;
          color: #475569;
          margin-top: 0.5rem;
          line-height: 1.5;
        }

        .secondary-focus {
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border-left: 4px solid #94a3b8;
        }

        .focus-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .focus-item-compact {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .focus-explanation {
          padding: 1rem;
          background: white;
          border-radius: 8px;
          line-height: 1.7;
          color: #1e293b;
        }

        .focus-explanation p {
          margin: 0;
        }

        .scope-notice {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.75rem;
          background: #fffbeb;
          border: 1px solid #fbbf24;
          border-radius: 6px;
          font-size: 0.85rem;
          color: #92400e;
          line-height: 1.5;
        }

        .notice-icon {
          flex-shrink: 0;
          font-size: 1rem;
        }

        .notice-text {
          flex: 1;
        }

        .metadata-details {
          margin-top: 0.5rem;
          font-size: 0.85rem;
        }

        .metadata-details summary {
          cursor: pointer;
          color: #64748b;
          font-weight: 600;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .metadata-details summary:hover {
          background: rgba(148, 163, 184, 0.1);
        }

        .metadata-content {
          padding: 1rem;
          background: white;
          border-radius: 6px;
          margin-top: 0.5rem;
        }

        .metadata-row {
          display: flex;
          gap: 0.5rem;
          padding: 0.25rem 0;
          color: #475569;
        }

        .metadata-row strong {
          min-width: 100px;
          color: #1e293b;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .focus-summary-panel {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            border-color: #0ea5e9;
          }

          .panel-header h3 {
            color: #e0f2fe;
          }

          .primary-focus,
          .secondary-focus,
          .focus-explanation,
          .metadata-content {
            background: #1e293b;
            color: #e2e8f0;
          }

          .focus-reason,
          .focus-explanation p {
            color: #cbd5e1;
          }

          .scope-notice {
            background: #422006;
            border-color: #f59e0b;
            color: #fbbf24;
          }

          .metadata-row {
            color: #cbd5e1;
          }

          .metadata-row strong {
            color: #e2e8f0;
          }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .focus-summary-panel {
            padding: 1rem;
          }

          .panel-header h3 {
            font-size: 1.25rem;
          }

          .focus-item {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </section>
  );
}
