import { useState } from "react";
import { MineralData } from "./HTMAInputForm";
import { getECKNineRulesForUI } from "../lib/eckInterpretationPrinciples";

interface PractitionerPanelProps {
  mineralData: MineralData;
  insights?: string;
}

interface ReferenceRange {
  mineral: string;
  value: number;
  ideal: string;
  status: "Low" | "Optimal" | "High";
  unit: string;
}

interface Ratio {
  name: string;
  value: number;
  ideal: string;
  status: "Low" | "Optimal" | "High";
  interpretation: string;
}

export default function PractitionerPanel({
  mineralData,
}: PractitionerPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPrinciplesExpanded, setIsPrinciplesExpanded] = useState(false);

  // Get ECK Nine Rules for UI
  const eckRules = getECKNineRulesForUI();

  // Parse mineral values
  const getValue = (val: string): number => parseFloat(val) || 0;

  const ca = getValue(mineralData.calcium);
  const mg = getValue(mineralData.magnesium);
  const na = getValue(mineralData.sodium);
  const k = getValue(mineralData.potassium);
  const cu = getValue(mineralData.copper);
  const zn = getValue(mineralData.zinc);
  const p = getValue(mineralData.phosphorus);
  const fe = getValue(mineralData.iron);
  const cr = getValue(mineralData.chromium);
  const se = getValue(mineralData.selenium);
  const b = getValue(mineralData.boron);
  const co = getValue(mineralData.cobalt);
  const mo = getValue(mineralData.molybdenum);
  const s = getValue(mineralData.sulfur);
  const mn = getValue(mineralData.manganese);

  // TEI Reference Ranges
  const referenceRanges: ReferenceRange[] = [
    {
      mineral: "Calcium (Ca)",
      value: ca,
      ideal: "35-45",
      status: getStatus(ca, 35, 45),
      unit: "mg%",
    },
    {
      mineral: "Magnesium (Mg)",
      value: mg,
      ideal: "4-8",
      status: getStatus(mg, 4, 8),
      unit: "mg%",
    },
    {
      mineral: "Sodium (Na)",
      value: na,
      ideal: "20-30",
      status: getStatus(na, 20, 30),
      unit: "mg%",
    },
    {
      mineral: "Potassium (K)",
      value: k,
      ideal: "8-12",
      status: getStatus(k, 8, 12),
      unit: "mg%",
    },
    {
      mineral: "Phosphorus (P)",
      value: p,
      ideal: "14-18",
      status: getStatus(p, 14, 18),
      unit: "mg%",
    },
    {
      mineral: "Copper (Cu)",
      value: cu,
      ideal: "2.0-3.0",
      status: getStatus(cu, 2.0, 3.0),
      unit: "mg%",
    },
    {
      mineral: "Zinc (Zn)",
      value: zn,
      ideal: "12-18",
      status: getStatus(zn, 12, 18),
      unit: "mg%",
    },
    {
      mineral: "Iron (Fe)",
      value: fe,
      ideal: "1.5-2.5",
      status: getStatus(fe, 1.5, 2.5),
      unit: "mg%",
    },
    {
      mineral: "Manganese (Mn)",
      value: mn,
      ideal: "0.04-0.08",
      status: getStatus(mn, 0.04, 0.08),
      unit: "mg%",
    },
    {
      mineral: "Chromium (Cr)",
      value: cr,
      ideal: "0.06-0.10",
      status: getStatus(cr, 0.06, 0.1),
      unit: "mg%",
    },
    {
      mineral: "Selenium (Se)",
      value: se,
      ideal: "0.08-0.12",
      status: getStatus(se, 0.08, 0.12),
      unit: "mg%",
    },
    {
      mineral: "Boron (B)",
      value: b,
      ideal: "0.20-0.30",
      status: getStatus(b, 0.2, 0.3),
      unit: "mg%",
    },
    {
      mineral: "Cobalt (Co)",
      value: co,
      ideal: "0.004-0.006",
      status: getStatus(co, 0.004, 0.006),
      unit: "mg%",
    },
    {
      mineral: "Molybdenum (Mo)",
      value: mo,
      ideal: "0.04-0.06",
      status: getStatus(mo, 0.04, 0.06),
      unit: "mg%",
    },
    {
      mineral: "Sulfur (S)",
      value: s,
      ideal: "4000-5000",
      status: getStatus(s, 4000, 5000),
      unit: "mg%",
    },
  ];

  // Calculate Ratios
  const ratios: Ratio[] = [
    {
      name: "Ca/Mg",
      value: mg > 0 ? ca / mg : 0,
      ideal: "6.0-7.5",
      status: getRatioStatus(mg > 0 ? ca / mg : 0, 6.0, 7.5),
      interpretation: interpretCaMg(mg > 0 ? ca / mg : 0),
    },
    {
      name: "Na/K",
      value: k > 0 ? na / k : 0,
      ideal: "2.0-3.0",
      status: getRatioStatus(k > 0 ? na / k : 0, 2.0, 3.0),
      interpretation: interpretNaK(k > 0 ? na / k : 0),
    },
    {
      name: "Ca/P",
      value: p > 0 ? ca / p : 0,
      ideal: "2.4-2.8",
      status: getRatioStatus(p > 0 ? ca / p : 0, 2.4, 2.8),
      interpretation: interpretCaP(p > 0 ? ca / p : 0),
    },
    {
      name: "Zn/Cu",
      value: cu > 0 ? zn / cu : 0,
      ideal: "5.0-7.0",
      status: getRatioStatus(cu > 0 ? zn / cu : 0, 5.0, 7.0),
      interpretation: interpretZnCu(cu > 0 ? zn / cu : 0),
    },
    {
      name: "Fe/Cu",
      value: cu > 0 ? fe / cu : 0,
      ideal: "0.6-1.0",
      status: getRatioStatus(cu > 0 ? fe / cu : 0, 0.6, 1.0),
      interpretation: interpretFeCu(cu > 0 ? fe / cu : 0),
    },
    {
      name: "Ca/K",
      value: k > 0 ? ca / k : 0,
      ideal: "3.5-4.5",
      status: getRatioStatus(k > 0 ? ca / k : 0, 3.5, 4.5),
      interpretation: interpretCaK(k > 0 ? ca / k : 0),
    },
  ];

  // Extract AI factors (mock from ratios and minerals if not provided)
  const aiFactors = extractAIFactors(ratios, referenceRanges);

  function getStatus(
    value: number,
    min: number,
    max: number
  ): "Low" | "Optimal" | "High" {
    if (value < min * 0.7) return "Low";
    if (value > max * 1.3) return "High";
    return "Optimal";
  }

  function getRatioStatus(
    value: number,
    min: number,
    max: number
  ): "Low" | "Optimal" | "High" {
    if (value === 0) return "Low";
    if (value < min) return "Low";
    if (value > max) return "High";
    return "Optimal";
  }

  // Ratio Interpretations
  function interpretCaMg(ratio: number): string {
    if (ratio < 6.0)
      return "Low Ca/Mg ratio may indicate magnesium dominance. Consider thyroid and adrenal function.";
    if (ratio > 7.5)
      return "High Ca/Mg ratio suggests calcium dominance. May indicate slow metabolism or magnesium deficiency.";
    return "Ca/Mg ratio is optimal for metabolic balance.";
  }

  function interpretNaK(ratio: number): string {
    if (ratio < 2.0)
      return "Low Na/K ratio may indicate aldosterone insufficiency or adrenal fatigue. Consider stress and inflammation.";
    if (ratio > 3.0)
      return "High Na/K ratio suggests acute stress response or sympathetic dominance. Monitor for inflammation.";
    return "Na/K ratio indicates balanced adrenal function.";
  }

  function interpretCaP(ratio: number): string {
    if (ratio < 2.4)
      return "Low Ca/P ratio may indicate excessive phosphorus intake or parathyroid imbalance.";
    if (ratio > 2.8)
      return "High Ca/P ratio suggests phosphorus deficiency or calcium retention issues.";
    return "Ca/P ratio is optimal for bone metabolism.";
  }

  function interpretZnCu(ratio: number): string {
    if (ratio < 5.0)
      return "Low Zn/Cu ratio indicates copper dominance. May affect immune function and estrogen metabolism.";
    if (ratio > 7.0)
      return "High Zn/Cu ratio suggests zinc excess or copper deficiency. Monitor for immune and cardiovascular effects.";
    return "Zn/Cu ratio is balanced for immune and hormonal function.";
  }

  function interpretFeCu(ratio: number): string {
    if (ratio < 0.6)
      return "Low Fe/Cu ratio may indicate copper excess or iron deficiency anemia risk.";
    if (ratio > 1.0)
      return "High Fe/Cu ratio suggests iron overload or copper insufficiency. Consider oxidative stress.";
    return "Fe/Cu ratio is optimal for oxygen transport and energy production.";
  }

  function interpretCaK(ratio: number): string {
    if (ratio < 3.5)
      return "Low Ca/K ratio may indicate thyroid hyperactivity or potassium retention.";
    if (ratio > 4.5)
      return "High Ca/K ratio suggests thyroid hypofunction or potassium depletion. Consider metabolic rate.";
    return "Ca/K ratio indicates balanced thyroid activity.";
  }

  function extractAIFactors(
    ratios: Ratio[],
    ranges: ReferenceRange[]
  ): string[] {
    const factors: string[] = [];

    // Add abnormal ratios
    ratios.forEach((ratio) => {
      if (ratio.status !== "Optimal") {
        factors.push(
          `${ratio.name} ratio: ${ratio.value.toFixed(2)} (${ratio.status})`
        );
      }
    });

    // Add extreme mineral values
    ranges.forEach((range) => {
      if (range.status === "Low" || range.status === "High") {
        factors.push(
          `${range.mineral}: ${range.value.toFixed(2)} ${range.unit} (${
            range.status
          })`
        );
      }
    });

    // If no abnormalities, add positive factors
    if (factors.length === 0) {
      factors.push("All minerals within reference ranges");
      factors.push("All major ratios balanced");
    }

    return factors;
  }

  return (
    <div className="practitioner-panel">
      <div className="panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-content">
          <span className="header-icon">⚕️</span>
          <h3>Practitioner Validation Panel</h3>
        </div>
        <button className="toggle-btn">{isExpanded ? "▼" : "▶"}</button>
      </div>

      {isExpanded && (
        <div className="panel-body">
          {/* Reference Ranges Section */}
          <section className="panel-section">
            <h4>📊 Reference Ranges (TEI Standards)</h4>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mineral</th>
                    <th>Value</th>
                    <th>Ideal Range</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {referenceRanges.map((range, idx) => (
                    <tr
                      key={idx}
                      className={range.status !== "Optimal" ? "abnormal" : ""}
                    >
                      <td>{range.mineral}</td>
                      <td className="value">
                        {range.value.toFixed(3)} {range.unit}
                      </td>
                      <td>
                        {range.ideal} {range.unit}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${range.status.toLowerCase()}`}
                        >
                          {range.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Ratios Table Section */}
          <section className="panel-section">
            <h4>⚖️ Critical Mineral Ratios</h4>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ratio</th>
                    <th>Calculated</th>
                    <th>Ideal Range</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ratios.map((ratio, idx) => (
                    <tr
                      key={idx}
                      className={ratio.status !== "Optimal" ? "abnormal" : ""}
                    >
                      <td className="ratio-name">{ratio.name}</td>
                      <td className="value">{ratio.value.toFixed(2)}</td>
                      <td>{ratio.ideal}</td>
                      <td>
                        <span
                          className={`status-badge ${ratio.status.toLowerCase()}`}
                        >
                          {ratio.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Clinical Interpretations */}
          <section className="panel-section">
            <h4>🔬 Rule-Based Clinical Interpretation</h4>
            <div className="interpretations">
              {ratios
                .filter((r) => r.status !== "Optimal")
                .map((ratio, idx) => (
                  <div key={idx} className="interpretation-card">
                    <div className="interpretation-header">
                      <strong>{ratio.name}</strong>
                      <span
                        className={`status-badge ${ratio.status.toLowerCase()}`}
                      >
                        {ratio.status}
                      </span>
                    </div>
                    <p className="interpretation-text">
                      {ratio.interpretation}
                    </p>
                  </div>
                ))}
              {ratios.every((r) => r.status === "Optimal") && (
                <div className="interpretation-card optimal">
                  <p>
                    ✅ All mineral ratios are within optimal ranges. No
                    immediate concerns indicated.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* AI Factors Used */}
          <section className="panel-section">
            <h4>🤖 AI Analysis Factors</h4>
            <div className="factors-list">
              <p className="factors-intro">
                Key factors considered in AI analysis:
              </p>
              <ul>
                {aiFactors.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* ECK Interpretation Principles */}
          <section className="panel-section eck-principles-section">
            <div
              className="eck-principles-header"
              onClick={() => setIsPrinciplesExpanded(!isPrinciplesExpanded)}
            >
              <div className="eck-header-content">
                <span className="eck-icon">🧭</span>
                <div className="eck-title-block">
                  <h4>{eckRules.header.title}</h4>
                  <p className="eck-subtitle">{eckRules.header.subtitle}</p>
                </div>
              </div>
              <button className="eck-toggle-btn">
                {isPrinciplesExpanded ? "▼" : "▶"}
              </button>
            </div>

            {isPrinciplesExpanded && (
              <div className="eck-principles-content">
                <div className="eck-description">
                  <p>{eckRules.header.description}</p>
                </div>

                <div className="eck-rules-grid">
                  {eckRules.rules.map((rule) => (
                    <div key={rule.number} className="eck-rule-card">
                      <div className="eck-rule-header">
                        <span className="eck-rule-number">{rule.number}</span>
                        <h5 className="eck-rule-title">{rule.title}</h5>
                      </div>
                      <p className="eck-rule-explanation">{rule.explanation}</p>
                    </div>
                  ))}
                </div>

                <div className="eck-practitioner-note">
                  <strong>📘 Practitioner Note:</strong>{" "}
                  {eckRules.practitionerNote}
                </div>

                <div className="eck-attribution">{eckRules.attribution}</div>
              </div>
            )}
          </section>

          <div className="panel-disclaimer">
            <strong>⚠️ Clinical Note:</strong> This panel is for practitioner
            validation only. All interpretations should be considered alongside
            patient history, symptoms, and other clinical data.
          </div>
        </div>
      )}

      <style jsx>{`
        .practitioner-panel {
          background: #f8f9fa;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          margin-top: 2rem;
          overflow: hidden;
        }

        .panel-header {
          background: #e9ecef;
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          user-select: none;
          border-bottom: 1px solid #dee2e6;
        }

        .panel-header:hover {
          background: #dde0e3;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-icon {
          font-size: 1.5rem;
        }

        h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #212529;
          font-weight: 600;
        }

        .toggle-btn {
          background: transparent;
          border: none;
          font-size: 1rem;
          color: #6c757d;
          cursor: pointer;
          padding: 0.5rem;
        }

        .panel-body {
          padding: 1.5rem;
        }

        .panel-section {
          margin-bottom: 2rem;
        }

        .panel-section:last-of-type {
          margin-bottom: 1rem;
        }

        h4 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: #495057;
          font-weight: 600;
        }

        .table-container {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 4px;
          overflow: hidden;
        }

        .data-table thead {
          background: #e9ecef;
        }

        .data-table th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          color: #495057;
          font-size: 0.9rem;
          border-bottom: 2px solid #dee2e6;
        }

        .data-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #dee2e6;
          font-size: 0.9rem;
          color: #212529;
        }

        .data-table tr.abnormal {
          background: #fff3cd;
        }

        .data-table tr:hover {
          background: #f8f9fa;
        }

        .data-table tr.abnormal:hover {
          background: #ffeaa7;
        }

        .value {
          font-family: "Courier New", monospace;
          font-weight: 600;
        }

        .ratio-name {
          font-weight: 600;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.optimal {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.low {
          background: #fff3cd;
          color: #856404;
        }

        .status-badge.high {
          background: #f8d7da;
          color: #721c24;
        }

        .interpretations {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .interpretation-card {
          background: white;
          padding: 1rem;
          border-left: 4px solid #ffc107;
          border-radius: 4px;
        }

        .interpretation-card.optimal {
          border-left-color: #28a745;
        }

        .interpretation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .interpretation-text {
          margin: 0;
          color: #495057;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .factors-list {
          background: white;
          padding: 1rem;
          border-radius: 4px;
        }

        .factors-intro {
          margin: 0 0 0.75rem 0;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .factors-list ul {
          margin: 0;
          padding-left: 1.5rem;
          list-style-type: disc;
        }

        .factors-list li {
          color: #495057;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }

        .panel-disclaimer {
          background: #e7f3ff;
          border: 1px solid #b6d4fe;
          padding: 1rem;
          border-radius: 4px;
          font-size: 0.85rem;
          color: #004085;
        }

        /* ECK Principles Styles */
        .eck-principles-section {
          background: linear-gradient(135deg, #fff8f0 0%, #fef9f4 100%);
          border: 2px solid #f0e5d8;
          border-radius: 8px;
          padding: 0;
          margin-bottom: 1.5rem;
          overflow: hidden;
        }

        .eck-principles-header {
          background: linear-gradient(135deg, #f8f0e5 0%, #f5ebe0 100%);
          padding: 1.25rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          user-select: none;
          border-bottom: 1px solid #e8dcc8;
          transition: background 0.2s;
        }

        .eck-principles-header:hover {
          background: linear-gradient(135deg, #f5ebe0 0%, #f0e5d8 100%);
        }

        .eck-header-content {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          flex: 1;
        }

        .eck-icon {
          font-size: 2rem;
          line-height: 1;
        }

        .eck-title-block h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1.15rem;
          color: #5a4a3a;
          font-weight: 700;
        }

        .eck-subtitle {
          margin: 0;
          font-size: 0.9rem;
          color: #8a7a6a;
          font-style: italic;
        }

        .eck-toggle-btn {
          background: transparent;
          border: none;
          font-size: 1rem;
          color: #8a7a6a;
          cursor: pointer;
          padding: 0.5rem;
          flex-shrink: 0;
        }

        .eck-principles-content {
          padding: 1.5rem;
        }

        .eck-description {
          margin-bottom: 1.5rem;
        }

        .eck-description p {
          margin: 0;
          color: #5a4a3a;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .eck-rules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .eck-rule-card {
          background: white;
          border: 1px solid #e8dcc8;
          border-radius: 6px;
          padding: 1rem;
          transition: all 0.2s;
        }

        .eck-rule-card:hover {
          border-color: #d4c5b0;
          box-shadow: 0 2px 8px rgba(90, 74, 58, 0.1);
        }

        .eck-rule-header {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .eck-rule-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #8a7a6a 0%, #6a5a4a 100%);
          color: white;
          border-radius: 50%;
          font-weight: 700;
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .eck-rule-title {
          margin: 0;
          font-size: 0.95rem;
          color: #5a4a3a;
          font-weight: 600;
          line-height: 1.4;
          flex: 1;
        }

        .eck-rule-explanation {
          margin: 0;
          color: #6a5a4a;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .eck-practitioner-note {
          background: #fff8f0;
          border-left: 4px solid #d4a574;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          color: #5a4a3a;
          line-height: 1.6;
        }

        .eck-attribution {
          text-align: center;
          font-size: 0.85rem;
          color: #8a7a6a;
          font-style: italic;
          padding-top: 1rem;
          border-top: 1px solid #e8dcc8;
        }

        @media (max-width: 768px) {
          .panel-header {
            padding: 0.75rem 1rem;
          }

          .panel-body {
            padding: 1rem;
          }

          h3 {
            font-size: 1rem;
          }

          h4 {
            font-size: 1rem;
          }

          .data-table th,
          .data-table td {
            padding: 0.5rem 0.75rem;
            font-size: 0.85rem;
          }

          .eck-principles-header {
            padding: 1rem;
          }

          .eck-principles-content {
            padding: 1rem;
          }

          .eck-rules-grid {
            grid-template-columns: 1fr;
          }

          .eck-icon {
            font-size: 1.5rem;
          }
        }

        @media (prefers-color-scheme: dark) {
          .practitioner-panel {
            background: #2a2a2a;
            border-color: #404040;
          }

          .panel-header {
            background: #333333;
            border-bottom-color: #404040;
          }

          .panel-header:hover {
            background: #3a3a3a;
          }

          h3,
          h4 {
            color: #e0e0e0;
          }

          .data-table {
            background: #1a1a1a;
          }

          .data-table thead {
            background: #333333;
          }

          .data-table th {
            color: #e0e0e0;
            border-bottom-color: #404040;
          }

          .data-table td {
            color: #e0e0e0;
            border-bottom-color: #404040;
          }

          .data-table tr:hover {
            background: #2a2a2a;
          }

          .interpretation-card,
          .factors-list {
            background: #1a1a1a;
          }

          .interpretation-text,
          .factors-list li {
            color: #cccccc;
          }

          .factors-intro {
            color: #999999;
          }

          .panel-disclaimer {
            background: #1a3a52;
            border-color: #2a5a7f;
            color: #a8d5ff;
          }

          /* ECK Dark Mode */
          .eck-principles-section {
            background: linear-gradient(135deg, #2a2520 0%, #332e28 100%);
            border-color: #4a4338;
          }

          .eck-principles-header {
            background: linear-gradient(135deg, #3a3530 0%, #433d35 100%);
            border-bottom-color: #4a4338;
          }

          .eck-principles-header:hover {
            background: linear-gradient(135deg, #433d35 0%, #4a4338 100%);
          }

          .eck-title-block h4 {
            color: #e8dcc8;
          }

          .eck-subtitle {
            color: #b8a898;
          }

          .eck-toggle-btn {
            color: #b8a898;
          }

          .eck-description p {
            color: #d8ccc8;
          }

          .eck-rule-card {
            background: #1a1715;
            border-color: #4a4338;
          }

          .eck-rule-card:hover {
            border-color: #5a5348;
            box-shadow: 0 2px 8px rgba(232, 220, 200, 0.1);
          }

          .eck-rule-title {
            color: #e8dcc8;
          }

          .eck-rule-explanation {
            color: #c8bcb0;
          }

          .eck-practitioner-note {
            background: #2a2520;
            border-left-color: #d4a574;
            color: #d8ccc8;
          }

          .eck-attribution {
            color: #b8a898;
            border-top-color: #4a4338;
          }
        }
      `}</style>
    </div>
  );
}
