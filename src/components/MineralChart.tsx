import { MineralData } from "./HTMAInputForm";

interface MineralChartProps {
  data: MineralData;
}

export default function MineralChart({ data }: MineralChartProps) {
  // TEI Reference Ranges (for educational reference only, not medical advice)
  const minerals = [
    { key: "calcium", label: "Calcium (Ca)", optimal: 40, color: "#3b82f6" },
    { key: "magnesium", label: "Magnesium (Mg)", optimal: 6, color: "#8b5cf6" },
    { key: "sodium", label: "Sodium (Na)", optimal: 25, color: "#ec4899" },
    { key: "potassium", label: "Potassium (K)", optimal: 10, color: "#10b981" },
    { key: "copper", label: "Copper (Cu)", optimal: 2.5, color: "#f59e0b" },
    { key: "zinc", label: "Zinc (Zn)", optimal: 15, color: "#06b6d4" },
    {
      key: "phosphorus",
      label: "Phosphorus (P)",
      optimal: 16,
      color: "#14b8a6",
    },
    { key: "iron", label: "Iron (Fe)", optimal: 2, color: "#ef4444" },
    {
      key: "manganese",
      label: "Manganese (Mn)",
      optimal: 0.06,
      color: "#a855f7",
    },
    {
      key: "chromium",
      label: "Chromium (Cr)",
      optimal: 0.08,
      color: "#6366f1",
    },
    { key: "selenium", label: "Selenium (Se)", optimal: 0.1, color: "#84cc16" },
    { key: "boron", label: "Boron (B)", optimal: 0.25, color: "#22d3ee" },
    { key: "cobalt", label: "Cobalt (Co)", optimal: 0.005, color: "#f472b6" },
    {
      key: "molybdenum",
      label: "Molybdenum (Mo)",
      optimal: 0.05,
      color: "#fb923c",
    },
    { key: "sulfur", label: "Sulfur (S)", optimal: 4500, color: "#facc15" },
  ];

  const getBarWidth = (value: string, optimal: number) => {
    const numValue = parseFloat(value) || 0;
    const max = optimal * 3; // Scale to 3x optimal for visualization
    const percentage = Math.min((numValue / max) * 100, 100);
    return percentage;
  };

  const getStatus = (value: string, optimal: number) => {
    const numValue = parseFloat(value) || 0;
    const ratio = numValue / optimal;

    if (ratio < 0.7) return { label: "Low", color: "#ef4444" };
    if (ratio > 1.3) return { label: "High", color: "#f59e0b" };
    return { label: "Optimal", color: "#10b981" };
  };

  return (
    <div className="mineral-chart">
      <h2>Mineral Levels</h2>
      <p className="chart-description">
        Comparing your results to optimal reference ranges
      </p>

      <div className="chart-container">
        {minerals.map((mineral) => {
          const value = data[mineral.key as keyof MineralData];
          const status = getStatus(value, mineral.optimal);
          const barWidth = getBarWidth(value, mineral.optimal);

          return (
            <div key={mineral.key} className="mineral-row">
              <div className="mineral-info">
                <span className="mineral-label">{mineral.label}</span>
                <span className="mineral-value">
                  {value || "0"} <span className="unit">mg%</span>
                </span>
              </div>

              <div className="bar-container">
                <div
                  className="bar"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: mineral.color,
                  }}
                />
                <div
                  className="optimal-marker"
                  style={{
                    left: `${(mineral.optimal / (mineral.optimal * 3)) * 100}%`,
                  }}
                />
              </div>

              <span className="status" style={{ color: status.color }}>
                {status.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-marker optimal" />
          <span>Optimal Range</span>
        </div>
      </div>

      <style jsx>{`
        .mineral-chart {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        h2 {
          margin: 0 0 0.5rem 0;
          color: #1a1a1a;
          font-size: 1.5rem;
        }

        .chart-description {
          color: #666;
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }

        .chart-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .mineral-row {
          display: grid;
          grid-template-columns: 150px 1fr 80px;
          align-items: center;
          gap: 1rem;
        }

        .mineral-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .mineral-label {
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
        }

        .mineral-value {
          color: #666;
          font-size: 0.85rem;
        }

        .unit {
          color: #999;
          font-size: 0.75rem;
        }

        .bar-container {
          position: relative;
          height: 32px;
          background: #f0f0f0;
          border-radius: 16px;
          overflow: hidden;
        }

        .bar {
          height: 100%;
          border-radius: 16px;
          transition: width 0.5s ease;
          position: relative;
        }

        .optimal-marker {
          position: absolute;
          top: 0;
          height: 100%;
          width: 3px;
          background: #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
        }

        .status {
          text-align: right;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .legend {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 2rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #666;
        }

        .legend-marker {
          width: 3px;
          height: 20px;
          border-radius: 2px;
        }

        .legend-marker.optimal {
          background: #10b981;
          box-shadow: 0 0 4px rgba(16, 185, 129, 0.6);
        }

        @media (max-width: 768px) {
          .mineral-row {
            grid-template-columns: 120px 1fr 70px;
            gap: 0.5rem;
          }

          .mineral-label {
            font-size: 0.8rem;
          }

          .mineral-value {
            font-size: 0.75rem;
          }

          .status {
            font-size: 0.75rem;
          }
        }

        @media (prefers-color-scheme: dark) {
          .mineral-chart {
            background: #1a1a1a;
          }

          h2 {
            color: #ffffff;
          }

          .chart-description {
            color: #999;
          }

          .mineral-label {
            color: #e0e0e0;
          }

          .mineral-value {
            color: #999;
          }

          .bar-container {
            background: #2a2a2a;
          }

          .legend {
            border-top-color: #404040;
          }

          .legend-item {
            color: #999;
          }
        }
      `}</style>
    </div>
  );
}
