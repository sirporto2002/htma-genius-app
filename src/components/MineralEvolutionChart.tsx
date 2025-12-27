/**
 * MineralEvolutionChart Component
 *
 * Displays mineral trends over time with sparklines
 * Shows reference ranges and trend indicators
 */

import React from "react";
import { MINERAL_REFERENCE_RANGES } from "../lib/htmaConstants";

interface MineralDataPoint {
  date: string;
  value: number;
}

interface MineralEvolutionChartProps {
  mineralSymbol: string;
  mineralName: string;
  dataPoints: MineralDataPoint[];
  unit?: string;
  isPractitioner?: boolean;
}

export default function MineralEvolutionChart({
  mineralSymbol,
  mineralName,
  dataPoints,
  unit = "mg%",
  isPractitioner = false,
}: MineralEvolutionChartProps) {
  if (dataPoints.length === 0) return null;

  const referenceRange = MINERAL_REFERENCE_RANGES.find(
    (m) => m.symbol === mineralSymbol
  );

  if (!referenceRange) return null;

  const minIdeal = referenceRange.minIdeal;
  const maxIdeal = referenceRange.maxIdeal;

  // Calculate trend
  const calculateTrend = (): "improving" | "declining" | "stable" => {
    if (dataPoints.length < 2) return "stable";

    const latest = dataPoints[dataPoints.length - 1].value;
    const previous = dataPoints[dataPoints.length - 2].value;

    // Determine if moving toward optimal range
    const latestDistance = Math.min(
      Math.abs(latest - minIdeal),
      Math.abs(latest - maxIdeal),
      latest >= minIdeal && latest <= maxIdeal ? 0 : Infinity
    );

    const previousDistance = Math.min(
      Math.abs(previous - minIdeal),
      Math.abs(previous - maxIdeal),
      previous >= minIdeal && previous <= maxIdeal ? 0 : Infinity
    );

    if (latestDistance < previousDistance - 1) return "improving";
    if (latestDistance > previousDistance + 1) return "declining";
    return "stable";
  };

  const trend = calculateTrend();
  const latestValue = dataPoints[dataPoints.length - 1].value;
  const isInRange = latestValue >= minIdeal && latestValue <= maxIdeal;

  // Calculate chart dimensions
  const chartWidth = 200;
  const chartHeight = 60;
  const padding = 5;

  const values = dataPoints.map((dp) => dp.value);
  const minValue = Math.min(...values, minIdeal);
  const maxValue = Math.max(...values, maxIdeal);
  const range = maxValue - minValue || 1;

  // Generate SVG path for sparkline
  const generatePath = (): string => {
    if (dataPoints.length === 0) return "";

    const points = dataPoints.map((dp, index) => {
      const x =
        padding +
        (index / (dataPoints.length - 1 || 1)) * (chartWidth - 2 * padding);
      const y =
        chartHeight -
        padding -
        ((dp.value - minValue) / range) * (chartHeight - 2 * padding);
      return `${x},${y}`;
    });

    return `M ${points.join(" L ")}`;
  };

  // Generate reference range band
  const generateReferenceRangePath = (): string => {
    const minY =
      chartHeight -
      padding -
      ((minIdeal - minValue) / range) * (chartHeight - 2 * padding);
    const maxY =
      chartHeight -
      padding -
      ((maxIdeal - minValue) / range) * (chartHeight - 2 * padding);

    return `M ${padding},${maxY} L ${chartWidth - padding},${maxY} L ${
      chartWidth - padding
    },${minY} L ${padding},${minY} Z`;
  };

  const trendColors = {
    improving: "#10b981",
    declining: "#ef4444",
    stable: "#6b7280",
  };

  const trendIcons = {
    improving: "↗",
    declining: "↘",
    stable: "→",
  };

  return (
    <div className="mineral-evolution-chart">
      <div className="chart-header">
        <div className="mineral-info">
          <span className="mineral-symbol">{mineralSymbol}</span>
          <span className="mineral-name">{mineralName}</span>
        </div>
        <div
          className="trend-badge"
          style={{ backgroundColor: trendColors[trend] }}
        >
          {trendIcons[trend]} {trend}
        </div>
      </div>

      <div className="chart-body">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="sparkline"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          {/* Reference range band */}
          <path
            d={generateReferenceRangePath()}
            fill="#10b981"
            fillOpacity="0.1"
            stroke="none"
          />

          {/* Reference range borders */}
          <line
            x1={padding}
            y1={
              chartHeight -
              padding -
              ((minIdeal - minValue) / range) * (chartHeight - 2 * padding)
            }
            x2={chartWidth - padding}
            y2={
              chartHeight -
              padding -
              ((minIdeal - minValue) / range) * (chartHeight - 2 * padding)
            }
            stroke="#10b981"
            strokeWidth="1"
            strokeDasharray="3,3"
            opacity="0.5"
          />
          <line
            x1={padding}
            y1={
              chartHeight -
              padding -
              ((maxIdeal - minValue) / range) * (chartHeight - 2 * padding)
            }
            x2={chartWidth - padding}
            y2={
              chartHeight -
              padding -
              ((maxIdeal - minValue) / range) * (chartHeight - 2 * padding)
            }
            stroke="#10b981"
            strokeWidth="1"
            strokeDasharray="3,3"
            opacity="0.5"
          />

          {/* Sparkline */}
          <path
            d={generatePath()}
            fill="none"
            stroke={isInRange ? "#10b981" : "#f59e0b"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {dataPoints.map((dp, index) => {
            const x =
              padding +
              (index / (dataPoints.length - 1 || 1)) *
                (chartWidth - 2 * padding);
            const y =
              chartHeight -
              padding -
              ((dp.value - minValue) / range) * (chartHeight - 2 * padding);
            const isLast = index === dataPoints.length - 1;

            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={isLast ? 4 : 2}
                fill={
                  isInRange && isLast
                    ? "#10b981"
                    : isLast
                    ? "#f59e0b"
                    : "#6b7280"
                }
                stroke="white"
                strokeWidth={isLast ? 2 : 1}
              />
            );
          })}
        </svg>

        <div className="chart-stats">
          <div className="stat-item">
            <span className="stat-label">Latest</span>
            <span
              className="stat-value"
              style={{ color: isInRange ? "#10b981" : "#f59e0b" }}
            >
              {latestValue.toFixed(1)} {unit}
            </span>
          </div>

          {isPractitioner && (
            <>
              <div className="stat-item">
                <span className="stat-label">Range</span>
                <span className="stat-value">
                  {minIdeal}-{maxIdeal} {unit}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Tests</span>
                <span className="stat-value">{dataPoints.length}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .mineral-evolution-chart {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1rem;
          transition: box-shadow 0.2s;
        }

        .mineral-evolution-chart:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .mineral-info {
          display: flex;
          flex-direction: column;
        }

        .mineral-symbol {
          font-size: 1.125rem;
          font-weight: 700;
          color: #111827;
        }

        .mineral-name {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .trend-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          color: white;
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .chart-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .sparkline {
          width: 100%;
          height: auto;
        }

        .chart-stats {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.625rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #111827;
        }
      `}</style>
    </div>
  );
}
