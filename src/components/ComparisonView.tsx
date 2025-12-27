import { MineralData } from "./HTMAInputForm";
import { SHORT_DISCLAIMER } from "../lib/healthScoreSemantics";

interface Analysis {
  id: string;
  createdAt: string;
  healthScore?: {
    totalScore: number;
    grade: string;
  };
  mineralData: MineralData;
}

interface ComparisonViewProps {
  oldAnalysis: Analysis;
  newAnalysis: Analysis;
}

export default function ComparisonView({
  oldAnalysis,
  newAnalysis,
}: ComparisonViewProps) {
  const minerals = [
    { key: "calcium", name: "Calcium (Ca)", unit: "mg%" },
    { key: "magnesium", name: "Magnesium (Mg)", unit: "mg%" },
    { key: "sodium", name: "Sodium (Na)", unit: "mg%" },
    { key: "potassium", name: "Potassium (K)", unit: "mg%" },
    { key: "phosphorus", name: "Phosphorus (P)", unit: "mg%" },
    { key: "copper", name: "Copper (Cu)", unit: "mg%" },
    { key: "zinc", name: "Zinc (Zn)", unit: "mg%" },
    { key: "iron", name: "Iron (Fe)", unit: "mg%" },
    { key: "manganese", name: "Manganese (Mn)", unit: "mg%" },
    { key: "chromium", name: "Chromium (Cr)", unit: "mg%" },
    { key: "selenium", name: "Selenium (Se)", unit: "mg%" },
    { key: "boron", name: "Boron (B)", unit: "mg%" },
    { key: "cobalt", name: "Cobalt (Co)", unit: "mg%" },
    { key: "molybdenum", name: "Molybdenum (Mo)", unit: "mg%" },
    { key: "sulfur", name: "Sulfur (S)", unit: "mg%" },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDelta = (oldValue: string, newValue: string) => {
    const old = parseFloat(oldValue) || 0;
    const newVal = parseFloat(newValue) || 0;
    const delta = newVal - old;
    const percentChange = old !== 0 ? (delta / old) * 100 : 0;

    return { delta, percentChange };
  };

  const getDeltaColor = (delta: number) => {
    if (Math.abs(delta) < 0.01) return "#6b7280"; // gray for no change
    return delta > 0 ? "#10b981" : "#ef4444"; // green for increase, red for decrease
  };

  const getDeltaIcon = (delta: number) => {
    if (Math.abs(delta) < 0.01) return "→";
    return delta > 0 ? "↑" : "↓";
  };

  const oldScore = oldAnalysis.healthScore?.totalScore || 0;
  const newScore = newAnalysis.healthScore?.totalScore || 0;
  const scoreDelta = newScore - oldScore;

  return (
    <div className="comparison-view">
      <div className="comparison-header">
        <h3>📊 Test Comparison</h3>
        <div className="date-range">
          <span className="old-date">{formatDate(oldAnalysis.createdAt)}</span>
          <span className="arrow">→</span>
          <span className="new-date">{formatDate(newAnalysis.createdAt)}</span>
        </div>{" "}
        <p className="comparison-disclaimer">{SHORT_DISCLAIMER}</p>{" "}
      </div>

      {/* Health Score Comparison */}
      <div className="score-comparison">
        <div className="score-item old-score">
          <div className="score-label">Previous Score</div>
          <div className="score-value">{oldScore}</div>
          <div className="score-grade">
            Grade: {oldAnalysis.healthScore?.grade || "N/A"}
          </div>
        </div>

        <div className="score-delta">
          <div
            className="delta-icon"
            style={{ color: getDeltaColor(scoreDelta) }}
          >
            {getDeltaIcon(scoreDelta)}
          </div>
          <div
            className="delta-value"
            style={{ color: getDeltaColor(scoreDelta) }}
          >
            {scoreDelta > 0 ? "+" : ""}
            {scoreDelta}
          </div>
        </div>

        <div className="score-item new-score">
          <div className="score-label">Current Score</div>
          <div className="score-value">{newScore}</div>
          <div className="score-grade">
            Grade: {newAnalysis.healthScore?.grade || "N/A"}
          </div>
        </div>
      </div>

      {/* Mineral Comparisons */}
      <div className="mineral-comparison-table">
        <table>
          <thead>
            <tr>
              <th>Mineral</th>
              <th>Previous</th>
              <th>Change</th>
              <th>Current</th>
            </tr>
          </thead>
          <tbody>
            {minerals.map(({ key, name, unit }) => {
              const oldValue =
                oldAnalysis.mineralData[key as keyof MineralData];
              const newValue =
                newAnalysis.mineralData[key as keyof MineralData];
              const { delta, percentChange } = calculateDelta(
                oldValue,
                newValue
              );
              const deltaColor = getDeltaColor(delta);
              const deltaIcon = getDeltaIcon(delta);

              return (
                <tr key={key}>
                  <td className="mineral-name">{name}</td>
                  <td className="old-value">
                    {parseFloat(oldValue).toFixed(2)} {unit}
                  </td>
                  <td className="delta-cell">
                    <span style={{ color: deltaColor }}>
                      {deltaIcon} {Math.abs(delta).toFixed(2)} (
                      {percentChange >= 0 ? "+" : ""}
                      {percentChange.toFixed(1)}%)
                    </span>
                  </td>
                  <td className="new-value">
                    {parseFloat(newValue).toFixed(2)} {unit}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .comparison-view {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .comparison-header {
          margin-bottom: 2rem;
        }

        .comparison-header h3 {
          margin: 0 0 0.75rem 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        .date-range {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.95rem;
          color: #6b7280;
        }

        .old-date,
        .new-date {
          font-weight: 600;
        }

        .arrow {
          font-size: 1.25rem;
        }

        .comparison-disclaimer {
          margin: 0.75rem 0 0 0;
          font-size: 0.75rem;
          color: #6b7280;
          font-style: italic;
          line-height: 1.4;
        }

        .score-comparison {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          margin-bottom: 2rem;
          color: white;
        }

        .score-item {
          text-align: center;
        }

        .score-label {
          font-size: 0.85rem;
          opacity: 0.9;
          margin-bottom: 0.5rem;
        }

        .score-value {
          font-size: 3rem;
          font-weight: 900;
          line-height: 1;
        }

        .score-grade {
          font-size: 0.9rem;
          opacity: 0.85;
          margin-top: 0.5rem;
        }

        .score-delta {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .delta-icon {
          font-size: 2rem;
          font-weight: 900;
        }

        .delta-value {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .mineral-comparison-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: #f9fafb;
        }

        th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.875rem;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }

        td {
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          border-bottom: 1px solid #f3f4f6;
        }

        tbody tr:hover {
          background: #f9fafb;
        }

        .mineral-name {
          font-weight: 600;
          color: #111827;
        }

        .old-value {
          color: #6b7280;
        }

        .delta-cell {
          font-weight: 600;
        }

        .new-value {
          color: #111827;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .comparison-view {
            padding: 1.5rem;
          }

          .score-comparison {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .score-delta {
            flex-direction: row;
          }

          table {
            font-size: 0.8rem;
          }

          th,
          td {
            padding: 0.5rem 0.75rem;
          }
        }

        @media (prefers-color-scheme: dark) {
          .comparison-view {
            background: #1f2937;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          .comparison-header h3 {
            color: #f9fafb;
          }

          thead {
            background: #374151;
          }

          th {
            color: #f3f4f6;
            border-bottom-color: #4b5563;
          }

          td {
            border-bottom-color: #374151;
          }

          tbody tr:hover {
            background: #374151;
          }

          .mineral-name,
          .new-value {
            color: #f9fafb;
          }
        }
      `}</style>
    </div>
  );
}
