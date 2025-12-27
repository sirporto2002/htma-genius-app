/**
 * HTMA Pattern Graph Component
 *
 * Displays mineral levels as a horizontal bar chart showing deviation
 * from optimal reference ranges. Purely presentational visualization
 * with no diagnostic interpretation.
 *
 * Educational use only - not a medical diagnostic tool.
 */

import React from "react";

interface HTMAPatternGraphProps {
  minerals: {
    key: string;
    name: string;
    value: number;
    minOptimal: number;
    maxOptimal: number;
  }[];
}

export default function HTMAPatternGraph({ minerals }: HTMAPatternGraphProps) {
  // 🔧 NORMALIZE INCOMING DATA: Support both object and array formats
  const normalizedMinerals = React.useMemo(() => {
    console.log(
      "🔍 HTMAPatternGraph - Raw input type:",
      Array.isArray(minerals) ? "array" : typeof minerals
    );
    console.log(
      "🔍 HTMAPatternGraph - Raw input length/keys:",
      Array.isArray(minerals)
        ? minerals.length
        : Object.keys(minerals || {}).length
    );

    // Already in array format?
    if (Array.isArray(minerals)) {
      const normalized = minerals
        .map((m) => ({
          key: String(m.key || "").toLowerCase(),
          name: String(m.name || ""),
          value: Number(m.value) || 0,
          minOptimal: Number(m.minOptimal) || 0,
          maxOptimal: Number(m.maxOptimal) || 0,
        }))
        .filter((m) => m.value > 0 && m.key); // Only valid minerals with positive values

      console.log(
        "✅ Normalized from array:",
        normalized.length,
        "valid minerals"
      );
      console.log("📊 Sample:", normalized[0]);
      return normalized;
    }

    // Object format? Convert to array
    if (minerals && typeof minerals === "object") {
      const normalized = Object.entries(minerals)
        .map(([key, val]) => {
          const value = Number(val) || 0;
          return {
            key: key.toLowerCase(),
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value,
            minOptimal: 0, // Will need reference ranges if using object format
            maxOptimal: 100,
          };
        })
        .filter((m) => m.value > 0);

      console.log(
        "✅ Normalized from object:",
        normalized.length,
        "valid minerals"
      );
      console.log("📊 Sample:", normalized[0]);
      return normalized;
    }

    console.warn("⚠️ HTMAPatternGraph received invalid data format");
    return [];
  }, [minerals]);

  console.log("✅ Final valid minerals:", normalizedMinerals.length);

  // Filter out minerals with no value
  const validMinerals = normalizedMinerals;

  // Map mineral symbols to their abbreviated forms
  const symbolMap: Record<string, string> = {
    calcium: "ca",
    ca: "ca",
    magnesium: "mg",
    mg: "mg",
    sodium: "na",
    na: "na",
    potassium: "k",
    k: "k",
    phosphorus: "p",
    p: "p",
    sulfur: "s",
    s: "s",
    copper: "cu",
    cu: "cu",
    zinc: "zn",
    zn: "zn",
    iron: "fe",
    fe: "fe",
    manganese: "mn",
    mn: "mn",
    chromium: "cr",
    cr: "cr",
    selenium: "se",
    se: "se",
    boron: "b",
    b: "b",
    cobalt: "co",
    co: "co",
    molybdenum: "mo",
    mo: "mo",
  };

  // Define mineral order for display (matches HTMA conventions)
  const mineralOrder = [
    "ca",
    "mg",
    "na",
    "k",
    "p",
    "s",
    "cu",
    "zn",
    "fe",
    "mn",
    "cr",
    "se",
    "b",
    "co",
    "mo",
  ];

  // Group minerals
  const majorKeys = ["ca", "mg", "na", "k", "p", "s"];

  // Get abbreviated symbol for a mineral key
  const getSymbol = (key: string): string => {
    const lowerKey = key.toLowerCase().trim();
    return symbolMap[lowerKey] || lowerKey;
  };

  // Sort minerals by conventional order
  const sortedMinerals = [...validMinerals].sort((a, b) => {
    const symbolA = getSymbol(a.key);
    const symbolB = getSymbol(b.key);
    const indexA = mineralOrder.indexOf(symbolA);
    const indexB = mineralOrder.indexOf(symbolB);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const majorMinerals = sortedMinerals.filter((m) =>
    majorKeys.includes(getSymbol(m.key))
  );

  const traceMinerals = sortedMinerals.filter(
    (m) => !majorKeys.includes(getSymbol(m.key))
  );

  // Calculate normalized position for each mineral
  const calculateBarPosition = (
    value: number,
    minOptimal: number,
    maxOptimal: number
  ) => {
    const optimalMidpoint = (minOptimal + maxOptimal) / 2;
    const optimalRange = maxOptimal - minOptimal;

    // Check if in optimal range first
    const isOptimal = value >= minOptimal && value <= maxOptimal;

    if (isOptimal) {
      return {
        deviation: 0,
        isAbove: false,
        isBelow: false,
        isOptimal: true,
        percentDeviation: 0,
      };
    }

    // Normalize deviation from midpoint as percentage
    const deviation = value - optimalMidpoint;
    const normalizedDeviation = (deviation / optimalRange) * 50; // Scale to 50% max

    // Clamp to prevent extreme visual distortion
    const clampedDeviation = Math.max(-50, Math.min(50, normalizedDeviation));

    return {
      deviation: clampedDeviation,
      isAbove: value > maxOptimal,
      isBelow: value < minOptimal,
      isOptimal: false,
      percentDeviation: Math.abs(clampedDeviation),
    };
  };

  return (
    <div className="htma-pattern-graph">
      <div className="graph-header">
        <h3>HTMA Pattern Visualization</h3>
        <p className="graph-caption">
          Visual pattern representation based on reference ranges (educational).
        </p>
      </div>

      {/* Major Minerals */}
      <div className="mineral-group">
        <h4 className="group-label">Major Minerals</h4>
        <div className="graph-grid">
          {majorMinerals.map((mineral) => {
            const position = calculateBarPosition(
              mineral.value,
              mineral.minOptimal,
              mineral.maxOptimal
            );

            return (
              <div key={mineral.key} className="mineral-row">
                <div className="mineral-label">
                  <span className="mineral-name">{mineral.name}</span>
                  <span className="mineral-value">
                    {mineral.value.toFixed(2)} mg%
                  </span>
                </div>

                <div className="bar-container">
                  <div className="reference-line" />

                  {position.isBelow && (
                    <div
                      className="bar bar-below"
                      style={{
                        width: `${position.percentDeviation}%`,
                      }}
                    />
                  )}

                  {position.isOptimal && <div className="bar bar-optimal" />}

                  {position.isAbove && (
                    <div
                      className="bar bar-above"
                      style={{
                        width: `${position.percentDeviation}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trace Minerals */}
      <div className="mineral-group">
        <h4 className="group-label">Trace Minerals</h4>
        <div className="graph-grid">
          {traceMinerals.map((mineral) => {
            const position = calculateBarPosition(
              mineral.value,
              mineral.minOptimal,
              mineral.maxOptimal
            );

            return (
              <div key={mineral.key} className="mineral-row">
                <div className="mineral-label">
                  <span className="mineral-name">{mineral.name}</span>
                  <span className="mineral-value">
                    {mineral.value.toFixed(2)} mg%
                  </span>
                </div>

                <div className="bar-container">
                  <div className="reference-line" />

                  {position.isBelow && (
                    <div
                      className="bar bar-below"
                      style={{
                        width: `${position.percentDeviation}%`,
                      }}
                    />
                  )}

                  {position.isOptimal && <div className="bar bar-optimal" />}

                  {position.isAbove && (
                    <div
                      className="bar bar-above"
                      style={{
                        width: `${position.percentDeviation}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .htma-pattern-graph {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          margin-bottom: 2rem;
        }

        .graph-header {
          margin-bottom: 2rem;
        }

        .graph-header h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 0.5rem 0;
        }

        .graph-caption {
          font-size: 0.875rem;
          color: #666;
          margin: 0;
          font-style: italic;
        }

        .mineral-group {
          margin-bottom: 2rem;
        }

        .mineral-group:last-child {
          margin-bottom: 0;
        }

        .group-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .graph-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .mineral-row {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 1rem;
          align-items: center;
        }

        .mineral-label {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 0.5rem;
        }

        .mineral-name {
          font-weight: 500;
          color: #374151;
          font-size: 0.9rem;
        }

        .mineral-value {
          font-size: 0.85rem;
          color: #6b7280;
          font-variant-numeric: tabular-nums;
        }

        .bar-container {
          position: relative;
          height: 24px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
          display: flex;
          align-items: center;
        }

        .reference-line {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #6b7280;
          transform: translateX(-1px);
          z-index: 2;
        }

        .bar {
          position: absolute;
          height: 100%;
          transition: width 0.3s ease;
          z-index: 1;
        }

        .bar-below {
          background: linear-gradient(270deg, #3b82f6 0%, #60a5fa 100%);
          right: 50%;
          border-radius: 4px 0 0 4px;
        }

        .bar-optimal {
          background: #10b981;
          width: 6px;
          left: calc(50% - 3px);
          border-radius: 3px;
          box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
        }

        .bar-above {
          background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
          left: 50%;
          border-radius: 0 4px 4px 0;
        }

        @media (max-width: 768px) {
          .htma-pattern-graph {
            padding: 1rem;
          }

          .mineral-row {
            grid-template-columns: 140px 1fr;
            gap: 0.75rem;
          }

          .mineral-label {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }

          .mineral-name {
            font-size: 0.85rem;
          }

          .mineral-value {
            font-size: 0.75rem;
          }

          .graph-header h3 {
            font-size: 1.25rem;
          }

          .graph-caption {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .mineral-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .mineral-label {
            flex-direction: row;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}
