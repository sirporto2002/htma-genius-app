/**
 * Reference Range Version Badge
 *
 * Displays the reference range version used for an analysis.
 * Shows warnings if version is outdated or deprecated.
 *
 * @version 1.7.0
 */

import { ReferenceRangeVersion } from "../lib/reportSnapshot";
import { formatEffectiveDate } from "../lib/rangeVersionEngine";

interface RangeVersionBadgeProps {
  /** The version used for this analysis */
  version: string;

  /** Full version details (optional, for tooltips) */
  versionDetails?: ReferenceRangeVersion;

  /** Whether this version is still active */
  isActive?: boolean;

  /** Display mode */
  mode?: "compact" | "full" | "inline";

  /** Show warning if outdated */
  showWarning?: boolean;
}

export default function RangeVersionBadge({
  version,
  versionDetails,
  isActive = true,
  mode = "compact",
  showWarning = true,
}: RangeVersionBadgeProps) {
  const isOutdated = !isActive && versionDetails?.deprecatedAt;
  const shouldWarn = showWarning && isOutdated;

  if (mode === "inline") {
    return (
      <span className="range-version-inline">
        <span className="label">Ranges:</span>
        <span className={`version ${shouldWarn ? "outdated" : ""}`}>
          v{version}
        </span>
        {shouldWarn && (
          <span className="warning-icon" title="Outdated version">
            ⚠️
          </span>
        )}
        <style jsx>{`
          .range-version-inline {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 13px;
          }

          .label {
            color: #718096;
          }

          .version {
            font-family: monospace;
            font-weight: 600;
            color: #2d3748;
          }

          .version.outdated {
            color: #d69e2e;
          }

          .warning-icon {
            font-size: 14px;
          }
        `}</style>
      </span>
    );
  }

  if (mode === "compact") {
    return (
      <div className="range-version-badge compact">
        <span className="badge-label">📊 Ranges</span>
        <span className={`badge-version ${isActive ? "active" : "inactive"}`}>
          v{version}
        </span>
        {shouldWarn && (
          <span className="badge-warning" title="Outdated reference ranges">
            ⚠️
          </span>
        )}
        <style jsx>{`
          .range-version-badge.compact {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-size: 13px;
          }

          .badge-label {
            color: #4a5568;
            font-weight: 500;
          }

          .badge-version {
            font-family: monospace;
            font-weight: 600;
            padding: 2px 6px;
            border-radius: 3px;
          }

          .badge-version.active {
            background: #c6f6d5;
            color: #22543d;
          }

          .badge-version.inactive {
            background: #feebc8;
            color: #7c2d12;
          }

          .badge-warning {
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  // Full mode
  return (
    <div
      className={`range-version-badge full ${shouldWarn ? "has-warning" : ""}`}
    >
      <div className="badge-header">
        <div className="badge-title">
          <span className="icon">📊</span>
          <span className="title">Reference Ranges</span>
        </div>
        <span className={`status-badge ${isActive ? "active" : "inactive"}`}>
          {isActive ? "Active" : "Outdated"}
        </span>
      </div>

      <div className="badge-content">
        <div className="content-row">
          <span className="label">Version:</span>
          <span className="value">v{version}</span>
        </div>

        {versionDetails && (
          <>
            <div className="content-row">
              <span className="label">Name:</span>
              <span className="value">{versionDetails.name}</span>
            </div>
            <div className="content-row">
              <span className="label">Standard:</span>
              <span className="value">{versionDetails.standard}</span>
            </div>
            <div className="content-row">
              <span className="label">Effective:</span>
              <span className="value">
                {formatEffectiveDate(versionDetails.effectiveDate)}
              </span>
            </div>
          </>
        )}
      </div>

      {shouldWarn && versionDetails && (
        <div className="badge-warning-box">
          <div className="warning-icon">⚠️</div>
          <div className="warning-content">
            <strong>Outdated Reference Ranges</strong>
            <p>
              This analysis uses deprecated reference ranges. Consider
              re-analyzing with the current active version for up-to-date
              interpretations.
            </p>
            {versionDetails.deprecatedAt && (
              <p className="deprecated-date">
                Deprecated: {formatEffectiveDate(versionDetails.deprecatedAt)}
              </p>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .range-version-badge.full {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
        }

        .range-version-badge.full.has-warning {
          border-color: #d69e2e;
        }

        .badge-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e2e8f0;
        }

        .badge-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .icon {
          font-size: 20px;
        }

        .title {
          font-size: 16px;
          font-weight: 600;
          color: #2d3748;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.active {
          background: #c6f6d5;
          color: #22543d;
        }

        .status-badge.inactive {
          background: #feebc8;
          color: #7c2d12;
        }

        .badge-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .content-row {
          display: flex;
          gap: 8px;
          font-size: 14px;
        }

        .content-row .label {
          color: #718096;
          min-width: 80px;
        }

        .content-row .value {
          color: #2d3748;
          font-weight: 500;
        }

        .badge-warning-box {
          margin-top: 12px;
          padding: 12px;
          background: #fffaf0;
          border: 1px solid #d69e2e;
          border-radius: 6px;
          display: flex;
          gap: 12px;
        }

        .warning-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .warning-content {
          flex: 1;
        }

        .warning-content strong {
          display: block;
          color: #7c2d12;
          margin-bottom: 4px;
          font-size: 14px;
        }

        .warning-content p {
          margin: 0 0 4px 0;
          color: #744210;
          font-size: 13px;
          line-height: 1.5;
        }

        .deprecated-date {
          font-size: 12px;
          color: #975a16;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
