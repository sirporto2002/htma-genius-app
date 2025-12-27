/**
 * OxidationTypeCard Component
 *
 * Displays oxidation type classification with:
 * - Consumer view: Minimal badge with tooltip
 * - Practitioner view: Full breakdown with ratios, indicators, and confidence
 * - ECK educational tooltips for practitioner mode
 */

import React, { useState } from "react";
import {
  OxidationClassification,
  getOxidationTypeLabel,
  getConfidenceDescription,
} from "../lib/oxidationClassification";
import { OxidationDelta } from "../lib/oxidationDeltaEngine";
import ECKTooltip from "./ECKTooltip";

interface OxidationTypeCardProps {
  classification: OxidationClassification;
  oxidationDelta?: OxidationDelta | null;
  isPractitioner?: boolean;
}

export default function OxidationTypeCard({
  classification,
  oxidationDelta,
  isPractitioner = false,
}: OxidationTypeCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const typeColors: Record<string, string> = {
    fast: "#3b82f6", // blue
    slow: "#f97316", // orange
    mixed: "#a855f7", // purple
    balanced: "#10b981", // green
  };

  const typeColor = typeColors[classification.type] || "#6b7280";

  const confidenceColors: Record<string, string> = {
    high: "#10b981", // green
    moderate: "#f59e0b", // amber
    low: "#ef4444", // red
  };

  const statusBadgeColor = (status: string): string => {
    if (status === "optimal") return "#10b981";
    if (status === "high") return "#f97316";
    if (status === "low") return "#3b82f6";
    return "#6b7280";
  };

  const signalBadgeColor = (signal: string): string => {
    if (signal === "optimal") return "#10b981";
    if (signal === "fast") return "#3b82f6";
    if (signal === "slow") return "#f97316";
    return "#6b7280";
  };

  // Consumer View (Minimal)
  if (!isPractitioner) {
    return (
      <div className="oxidation-consumer-card">
        <div className="oxidation-badge-container">
          <div
            className="oxidation-badge"
            style={{ borderColor: typeColor, color: typeColor }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <span className="oxidation-label">Oxidation Pattern:</span>
            <span className="oxidation-type">
              {getOxidationTypeLabel(classification.type)}
            </span>
          </div>

          {/* Show comparison if delta available */}
          {oxidationDelta &&
            oxidationDelta.patternChange.type !== "new_test" &&
            oxidationDelta.previous.type !== oxidationDelta.current.type && (
              <div className="comparison-badge">
                vs. previous:{" "}
                {getOxidationTypeLabel(oxidationDelta.previous.type)}
                {oxidationDelta.patternChange.isMilestone && (
                  <span className="milestone-indicator"> 🎯</span>
                )}
              </div>
            )}

          {showTooltip && (
            <div className="oxidation-tooltip">
              Based on mineral relationships only. Educational insight.
            </div>
          )}
        </div>

        <p className="oxidation-interpretation">
          {classification.interpretation}
        </p>

        <style jsx>{`
          .oxidation-consumer-card {
            margin: 1.5rem 0;
            padding: 1rem;
            background: transparent;
          }

          .oxidation-badge-container {
            position: relative;
            display: inline-block;
            margin-bottom: 0.75rem;
          }

          .oxidation-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border: 2px solid;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            cursor: help;
            transition: all 0.2s;
          }

          .oxidation-badge:hover {
            background: rgba(59, 130, 246, 0.05);
          }

          .oxidation-label {
            font-weight: 500;
            color: #6b7280;
          }

          .oxidation-type {
            font-weight: 600;
          }

          .comparison-badge {
            display: inline-block;
            margin-left: 0.75rem;
            padding: 0.25rem 0.75rem;
            background: #f3f4f6;
            color: #6b7280;
            font-size: 0.75rem;
            border-radius: 0.375rem;
            font-weight: 500;
          }

          .milestone-indicator {
            font-size: 0.9rem;
          }

          .oxidation-tooltip {
            position: absolute;
            top: 100%;
            left: 0;
            margin-top: 0.5rem;
            padding: 0.5rem 0.75rem;
            background: #1f2937;
            color: white;
            font-size: 0.75rem;
            border-radius: 0.375rem;
            white-space: nowrap;
            z-index: 10;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .oxidation-interpretation {
            font-size: 0.875rem;
            color: #4b5563;
            line-height: 1.5;
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  // Practitioner View (Full Breakdown)
  return (
    <div className="oxidation-practitioner-card">
      <div className="oxidation-header">
        <h3>Oxidation Pattern Classification</h3>
        <div className="oxidation-version">
          v{classification.semanticsVersion}
        </div>
      </div>

      <div className="oxidation-main-result">
        <div
          className="oxidation-type-badge"
          style={{ backgroundColor: typeColor }}
        >
          {getOxidationTypeLabel(classification.type)}
        </div>
        <div
          className="oxidation-confidence-badge"
          style={{
            backgroundColor: confidenceColors[classification.confidence],
          }}
        >
          {classification.confidence.toUpperCase()} confidence
        </div>
      </div>

      <p className="oxidation-interpretation-text">
        {classification.interpretation}
      </p>

      <div className="oxidation-details">
        {/* Mineral Values & Status */}
        <div className="detail-section">
          <h4>Mineral Status</h4>
          <div className="mineral-grid">
            <div className="mineral-item">
              <span className="mineral-name">Calcium (Ca)</span>
              <span className="mineral-value">
                {classification.metadata.mineralValues.ca}
              </span>
              <span
                className="status-badge"
                style={{
                  backgroundColor: statusBadgeColor(
                    classification.indicators.calciumStatus
                  ),
                }}
              >
                {classification.indicators.calciumStatus}
              </span>
            </div>

            <div className="mineral-item">
              <span className="mineral-name">Magnesium (Mg)</span>
              <span className="mineral-value">
                {classification.metadata.mineralValues.mg}
              </span>
              <span
                className="status-badge"
                style={{
                  backgroundColor: statusBadgeColor(
                    classification.indicators.magnesiumStatus
                  ),
                }}
              >
                {classification.indicators.magnesiumStatus}
              </span>
            </div>

            <div className="mineral-item">
              <span className="mineral-name">Sodium (Na)</span>
              <span className="mineral-value">
                {classification.metadata.mineralValues.na}
              </span>
              <span
                className="status-badge"
                style={{
                  backgroundColor: statusBadgeColor(
                    classification.indicators.sodiumStatus
                  ),
                }}
              >
                {classification.indicators.sodiumStatus}
              </span>
            </div>

            <div className="mineral-item">
              <span className="mineral-name">Potassium (K)</span>
              <span className="mineral-value">
                {classification.metadata.mineralValues.k}
              </span>
              <span
                className="status-badge"
                style={{
                  backgroundColor: statusBadgeColor(
                    classification.indicators.potassiumStatus
                  ),
                }}
              >
                {classification.indicators.potassiumStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Ratio Signals */}
        <div className="detail-section">
          <h4>
            <ECKTooltip
              content="ECK Principle: Ratios reveal metabolic tendencies. The Ca/K ratio reflects thyroid influence on metabolic rate, while Na/K shows adrenal stress response patterns."
              position="top"
            >
              <span
                style={{ borderBottom: "2px dotted #d97706", cursor: "help" }}
              >
                Ratio Signals
              </span>
            </ECKTooltip>
          </h4>
          <div className="ratio-grid">
            <div className="ratio-item">
              <span className="ratio-name">
                <ECKTooltip
                  content="Ca/K (Thyroid Ratio): Calcium-to-potassium balance reflects thyroid influence. High ratios suggest slower metabolism, low ratios suggest faster metabolism."
                  position="right"
                >
                  <span
                    style={{
                      borderBottom: "1px dotted #6b7280",
                      cursor: "help",
                    }}
                  >
                    Ca/K
                  </span>
                </ECKTooltip>
              </span>
              <span className="ratio-value">
                {classification.metadata.ratioValues.caK}
              </span>
              <span
                className="signal-badge"
                style={{
                  backgroundColor: signalBadgeColor(
                    classification.indicators.ratioSignals.caK
                  ),
                }}
              >
                {classification.indicators.ratioSignals.caK}
              </span>
              <span className="ratio-description">thyroid influence</span>
            </div>

            <div className="ratio-item">
              <span className="ratio-name">
                <ECKTooltip
                  content="Na/K (Adrenal Ratio): Sodium-to-potassium ratio reflects stress response and adrenal function. Optimal range suggests balanced stress adaptation."
                  position="right"
                >
                  <span
                    style={{
                      borderBottom: "1px dotted #6b7280",
                      cursor: "help",
                    }}
                  >
                    Na/K
                  </span>
                </ECKTooltip>
              </span>
              <span className="ratio-value">
                {classification.metadata.ratioValues.naK}
              </span>
              <span
                className="signal-badge"
                style={{
                  backgroundColor: signalBadgeColor(
                    classification.indicators.ratioSignals.naK
                  ),
                }}
              >
                {classification.indicators.ratioSignals.naK}
              </span>
              <span className="ratio-description">adrenal balance</span>
            </div>

            <div className="ratio-item">
              <span className="ratio-name">
                <ECKTooltip
                  content="Ca/Mg (Metabolic Ratio): Calcium-to-magnesium balance indicates overall metabolic rate and nervous system tone. Used alongside Ca/K for pattern confirmation."
                  position="right"
                >
                  <span
                    style={{
                      borderBottom: "1px dotted #6b7280",
                      cursor: "help",
                    }}
                  >
                    Ca/Mg
                  </span>
                </ECKTooltip>
              </span>
              <span className="ratio-value">
                {classification.metadata.ratioValues.caMg}
              </span>
              <span
                className="signal-badge"
                style={{
                  backgroundColor: signalBadgeColor(
                    classification.indicators.ratioSignals.caMg
                  ),
                }}
              >
                {classification.indicators.ratioSignals.caMg}
              </span>
              <span className="ratio-description">metabolic rate</span>
            </div>
          </div>
        </div>

        {/* Confidence Details */}
        <div className="detail-section">
          <h4>
            <ECKTooltip
              content="ECK Principle: Pattern confidence depends on ratio alignment. Multiple ratios pointing to the same oxidation type increases interpretive confidence."
              position="top"
            >
              <span
                style={{ borderBottom: "2px dotted #d97706", cursor: "help" }}
              >
                Confidence Analysis
              </span>
            </ECKTooltip>
          </h4>
          <div className="confidence-details">
            <div className="confidence-item">
              <span className="confidence-label">Alignment Score:</span>
              <span className="confidence-value">
                {classification.metadata.alignmentScore} / 6 indicators
              </span>
            </div>
            <div className="confidence-item">
              <span className="confidence-label">Level:</span>
              <span className="confidence-value">
                {classification.confidence.toUpperCase()}
              </span>
            </div>
            <div className="confidence-description">
              {getConfidenceDescription(classification.confidence)}
            </div>
          </div>
        </div>
      </div>

      <div className="oxidation-disclaimer">
        <strong>⚠️ Classification Scope:</strong> This is a pattern
        classification and metabolic tendency indicator. NOT a diagnosis,
        disease label, treatment directive, or prediction.
      </div>

      <style jsx>{`
        .oxidation-practitioner-card {
          background: white;
          border-radius: 0.5rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin: 1.5rem 0;
        }

        .oxidation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .oxidation-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #111827;
        }

        .oxidation-version {
          font-size: 0.75rem;
          color: #6b7280;
          background: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
        }

        .oxidation-main-result {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .oxidation-type-badge {
          padding: 0.75rem 1.5rem;
          color: white;
          font-weight: 600;
          font-size: 1.125rem;
          border-radius: 0.5rem;
        }

        .oxidation-confidence-badge {
          padding: 0.75rem 1rem;
          color: white;
          font-weight: 500;
          font-size: 0.875rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
        }

        .oxidation-interpretation-text {
          font-size: 0.9375rem;
          color: #374151;
          line-height: 1.6;
          margin: 1rem 0;
          padding: 1rem;
          background: #f9fafb;
          border-left: 3px solid ${typeColor};
          border-radius: 0.25rem;
        }

        .oxidation-details {
          margin-top: 1.5rem;
        }

        .detail-section {
          margin-bottom: 1.5rem;
        }

        .detail-section h4 {
          font-size: 1rem;
          color: #111827;
          margin: 0 0 0.75rem 0;
          font-weight: 600;
        }

        .mineral-grid,
        .ratio-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .mineral-item,
        .ratio-item {
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 0.375rem;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .mineral-name,
        .ratio-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
        }

        .mineral-value,
        .ratio-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
        }

        .status-badge,
        .signal-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          color: white;
          font-weight: 500;
          text-transform: uppercase;
          width: fit-content;
        }

        .ratio-description {
          font-size: 0.75rem;
          color: #9ca3af;
          font-style: italic;
        }

        .confidence-details {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 0.375rem;
        }

        .confidence-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .confidence-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .confidence-value {
          font-size: 0.875rem;
          color: #111827;
          font-weight: 600;
        }

        .confidence-description {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
          font-size: 0.8125rem;
          color: #6b7280;
          line-height: 1.5;
        }

        .oxidation-disclaimer {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #fef3c7;
          border-left: 3px solid #f59e0b;
          border-radius: 0.25rem;
          font-size: 0.8125rem;
          color: #92400e;
          line-height: 1.5;
        }

        .oxidation-disclaimer strong {
          display: block;
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  );
}
