/**
 * Toxic Elements Panel
 *
 * Display-only component for toxic elements
 * DOES NOT affect health score, oxidation classification, or AI insights
 * Shown for environmental and observational context only
 *
 * SAFETY CONSTRAINTS:
 * - No treatment, detox, chelation, diagnosis, or supplement language
 * - No AI interpretation
 * - No trends or deltas
 * - Collapsed by default
 */

import { useState } from "react";
import { ToxicElement } from "../lib/reportSnapshot";
import { getTEIPractitionerContext } from "../lib/teiInterpretationPrinciples";

interface ToxicElementsPanelProps {
  toxicElements: ReadonlyArray<ToxicElement>;
  isPractitionerMode?: boolean;
}

export default function ToxicElementsPanel({
  toxicElements,
  isPractitionerMode = false,
}: ToxicElementsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTEIContext, setShowTEIContext] = useState(false);

  if (!toxicElements || toxicElements.length === 0) {
    return null;
  }

  const elevatedCount = toxicElements.filter(
    (e) => e.status === "elevated"
  ).length;

  return (
    <div className="toxic-elements-panel">
      <div
        className="panel-header"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="header-content">
          <h3>
            <span className="toxic-icon">⚠️</span>
            Toxic Elements
            {elevatedCount > 0 && (
              <span className="badge-elevated">{elevatedCount} elevated</span>
            )}
          </h3>
          <p className="header-subtitle">Environmental context only</p>
        </div>
        <span className={`expand-icon ${isExpanded ? "expanded" : ""}`}>▼</span>
      </div>

      {isExpanded && (
        <div className="panel-content">
          {/* Safety Disclaimer */}
          <div className="disclaimer-box">
            <div className="disclaimer-icon">🔒</div>
            <div className="disclaimer-text">
              <strong>Non-Diagnostic Display</strong>
              <p>
                These elements are shown for environmental and observational
                context only. They are not diagnostic and are not used in
                scoring or analysis.
              </p>
            </div>
          </div>

          {/* Toxic Elements Table */}
          <div className="elements-table">
            <table>
              <thead>
                <tr>
                  <th>Element</th>
                  <th>Value</th>
                  {isPractitionerMode && <th>Reference High</th>}
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {toxicElements.map((element) => (
                  <tr key={element.key} className={`row-${element.status}`}>
                    <td className="element-name">
                      <strong>{element.name}</strong>
                      <span className="element-symbol">({element.key})</span>
                    </td>
                    <td className="element-value">
                      {element.value.toFixed(3)} {element.unit}
                    </td>
                    {isPractitionerMode && (
                      <td className="reference-value">
                        &lt; {element.referenceHigh.toFixed(3)} {element.unit}
                      </td>
                    )}
                    <td className="element-status">
                      <span className={`status-badge status-${element.status}`}>
                        {element.status === "elevated"
                          ? "Above Reference"
                          : "Within Reference"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Practitioner Mode Context */}
          {isPractitionerMode && (
            <>
              <div className="practitioner-badge">
                <span className="badge-icon">👨‍⚕️</span>
                Practitioner Context • Non-Actionable •{" "}
                <a
                  href="https://www.traceelements.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  TEI Reference
                </a>
              </div>

              {/* TEI Practitioner Education - About Toxic Elements */}
              <div className="tei-education-section">
                <button
                  className="tei-education-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTEIContext(!showTEIContext);
                  }}
                >
                  <span className="info-icon">ℹ️</span>
                  {getTEIPractitionerContext("toxicElements").title}
                  <span
                    className={`toggle-arrow ${
                      showTEIContext ? "expanded" : ""
                    }`}
                  >
                    ▶
                  </span>
                </button>

                {showTEIContext && (
                  <div className="tei-education-content">
                    <p>{getTEIPractitionerContext("toxicElements").content}</p>
                    <div className="tei-attribution">— Trace Elements Inc.</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .toxic-elements-panel {
          background: white;
          border: 2px solid #ff6b6b;
          border-radius: 12px;
          margin: 2rem 0;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(255, 107, 107, 0.1);
        }

        .panel-header {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
          color: white;
          padding: 1.5rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background 0.2s;
        }

        .panel-header:hover {
          background: linear-gradient(135deg, #ff5252 0%, #e04e5f 100%);
        }

        .header-content h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .toxic-icon {
          font-size: 1.5rem;
        }

        .badge-elevated {
          background: rgba(255, 255, 255, 0.3);
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
          margin-left: 0.5rem;
        }

        .header-subtitle {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.95;
        }

        .expand-icon {
          font-size: 1rem;
          transition: transform 0.3s;
        }

        .expand-icon.expanded {
          transform: rotate(180deg);
        }

        .panel-content {
          padding: 1.5rem;
        }

        .disclaimer-box {
          background: #fff3cd;
          border: 2px solid #ffc107;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          gap: 1rem;
        }

        .disclaimer-icon {
          font-size: 1.5rem;
        }

        .disclaimer-text strong {
          display: block;
          color: #856404;
          margin-bottom: 0.25rem;
        }

        .disclaimer-text p {
          margin: 0;
          color: #856404;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .elements-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: #f8f9fa;
        }

        th {
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          color: #495057;
          border-bottom: 2px solid #dee2e6;
        }

        td {
          padding: 0.75rem;
          border-bottom: 1px solid #dee2e6;
        }

        .element-name {
          font-size: 0.95rem;
        }

        .element-symbol {
          color: #6c757d;
          margin-left: 0.25rem;
          font-size: 0.85rem;
        }

        .element-value {
          font-family: "Courier New", monospace;
          font-weight: 600;
        }

        .reference-value {
          color: #6c757d;
          font-size: 0.9rem;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .status-within {
          background: #d4edda;
          color: #155724;
        }

        .status-elevated {
          background: #f8d7da;
          color: #721c24;
        }

        .row-elevated {
          background: #fff5f5;
        }

        .practitioner-badge {
          margin-top: 1.5rem;
          padding: 0.75rem;
          background: #e7f3ff;
          border-left: 4px solid #0066cc;
          border-radius: 4px;
          font-size: 0.9rem;
          color: #004a99;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .badge-icon {
          font-size: 1.2rem;
        }

        .practitioner-badge a {
          color: #0066cc;
          text-decoration: underline;
        }

        .tei-education-section {
          margin-top: 1rem;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          overflow: hidden;
        }

        .tei-education-toggle {
          width: 100%;
          padding: 0.75rem 1rem;
          background: #f8f9fa;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #495057;
          transition: background 0.2s;
        }

        .tei-education-toggle:hover {
          background: #e9ecef;
        }

        .info-icon {
          font-size: 1rem;
        }

        .toggle-arrow {
          margin-left: auto;
          font-size: 0.8rem;
          transition: transform 0.2s;
        }

        .toggle-arrow.expanded {
          transform: rotate(90deg);
        }

        .tei-education-content {
          padding: 1rem;
          background: white;
          border-top: 1px solid #dee2e6;
        }

        .tei-education-content p {
          margin: 0 0 0.75rem 0;
          line-height: 1.6;
          color: #495057;
          font-size: 0.9rem;
          white-space: pre-line;
        }

        .tei-attribution {
          text-align: right;
          font-style: italic;
          color: #6c757d;
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .panel-header {
            padding: 1rem;
          }

          .header-content h3 {
            font-size: 1.1rem;
          }

          .panel-content {
            padding: 1rem;
          }

          table {
            font-size: 0.9rem;
          }

          th,
          td {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
