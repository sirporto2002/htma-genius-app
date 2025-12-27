/**
 * Reference Range Version Panel
 *
 * Practitioner interface for viewing and managing reference range versions.
 * Displays version history, comparisons, and migration recommendations.
 *
 * @version 1.7.0
 */

import { useState, useEffect } from "react";
import {
  ReferenceRangeVersion,
  RangeChange,
  RangeChangeType,
} from "../lib/reportSnapshot";
import {
  compareVersions,
  formatVersionDisplay,
  formatEffectiveDate,
  getSortedVersions,
  getActiveVersion,
  createInitialVersion,
  VersionComparison,
  MineralComparison,
} from "../lib/rangeVersionEngine";

interface ReferenceRangeVersionPanelProps {
  /** Current versions (from Firestore or local state) */
  versions: ReadonlyArray<ReferenceRangeVersion>;

  /** Callback when user wants to view version details */
  onViewVersion?: (version: ReferenceRangeVersion) => void;

  /** Callback when user wants to compare versions */
  onCompareVersions?: (
    oldVersion: ReferenceRangeVersion,
    newVersion: ReferenceRangeVersion
  ) => void;

  /** Whether user has admin privileges */
  isAdmin?: boolean;
}

export default function ReferenceRangeVersionPanel({
  versions,
  onViewVersion,
  onCompareVersions,
  isAdmin = false,
}: ReferenceRangeVersionPanelProps) {
  const [selectedVersion, setSelectedVersion] =
    useState<ReferenceRangeVersion | null>(null);
  const [compareWithVersion, setCompareWithVersion] =
    useState<ReferenceRangeVersion | null>(null);
  const [comparison, setComparison] = useState<VersionComparison | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const sortedVersions = getSortedVersions(versions);
  const activeVersion = getActiveVersion(versions);

  // Handle version comparison
  useEffect(() => {
    if (selectedVersion && compareWithVersion) {
      const result = compareVersions(selectedVersion, compareWithVersion);
      setComparison(result);
      setShowComparison(true);
    } else {
      setComparison(null);
      setShowComparison(false);
    }
  }, [selectedVersion, compareWithVersion]);

  const handleCompare = (version: ReferenceRangeVersion) => {
    if (selectedVersion) {
      setCompareWithVersion(version);
      if (onCompareVersions) {
        onCompareVersions(selectedVersion, version);
      }
    } else {
      setSelectedVersion(version);
    }
  };

  const clearComparison = () => {
    setSelectedVersion(null);
    setCompareWithVersion(null);
    setComparison(null);
    setShowComparison(false);
  };

  return (
    <div className="reference-range-version-panel">
      <div className="panel-header">
        <h3>📊 Reference Range Versions</h3>
        <p className="subtitle">
          Track changes to clinical reference ranges over time
        </p>
      </div>

      {/* Active Version Banner */}
      {activeVersion && (
        <div className="active-version-banner">
          <div className="banner-content">
            <span className="badge active-badge">ACTIVE</span>
            <strong>{activeVersion.name}</strong>
            <span className="version-id">v{activeVersion.version}</span>
          </div>
          <div className="banner-meta">
            <span>Standard: {activeVersion.standard}</span>
            <span>
              Effective: {formatEffectiveDate(activeVersion.effectiveDate)}
            </span>
          </div>
        </div>
      )}

      {/* Comparison Mode Indicator */}
      {(selectedVersion || compareWithVersion) && (
        <div className="comparison-mode">
          <div className="comparison-header">
            <h4>Comparison Mode</h4>
            <button onClick={clearComparison} className="clear-button">
              ✕ Clear
            </button>
          </div>
          <div className="comparison-selections">
            <div className="selection-box">
              <label>From Version:</label>
              {selectedVersion ? (
                <div className="selected-version">
                  <strong>{selectedVersion.name}</strong>
                  <span>v{selectedVersion.version}</span>
                </div>
              ) : (
                <div className="placeholder">Select first version...</div>
              )}
            </div>
            <div className="arrow">→</div>
            <div className="selection-box">
              <label>To Version:</label>
              {compareWithVersion ? (
                <div className="selected-version">
                  <strong>{compareWithVersion.name}</strong>
                  <span>v{compareWithVersion.version}</span>
                </div>
              ) : (
                <div className="placeholder">Select second version...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Version List */}
      <div className="version-list">
        <h4>Version History</h4>
        {sortedVersions.length === 0 ? (
          <div className="empty-state">
            <p>No version history available</p>
            <p className="hint">
              Reference range versions will appear here as they are created
            </p>
          </div>
        ) : (
          <div className="versions">
            {sortedVersions.map((version) => (
              <div
                key={version.version}
                className={`version-card ${version.isActive ? "active" : ""} ${
                  selectedVersion?.version === version.version ||
                  compareWithVersion?.version === version.version
                    ? "selected"
                    : ""
                }`}
              >
                <div className="version-header">
                  <div className="version-title">
                    <h5>{version.name}</h5>
                    <span className="version-number">v{version.version}</span>
                    {version.isActive && (
                      <span className="badge active-badge-small">Active</span>
                    )}
                    {version.deprecatedAt && (
                      <span className="badge deprecated-badge">Deprecated</span>
                    )}
                  </div>
                  <div className="version-actions">
                    <button
                      onClick={() => handleCompare(version)}
                      className="compare-button"
                      disabled={
                        selectedVersion?.version === version.version ||
                        compareWithVersion?.version === version.version
                      }
                    >
                      {selectedVersion && !compareWithVersion
                        ? "Compare With"
                        : "Select"}
                    </button>
                    {onViewVersion && (
                      <button
                        onClick={() => onViewVersion(version)}
                        className="view-button"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>

                <div className="version-meta">
                  <div className="meta-row">
                    <span className="label">Standard:</span>
                    <span className="value">{version.standard}</span>
                  </div>
                  <div className="meta-row">
                    <span className="label">Effective Date:</span>
                    <span className="value">
                      {formatEffectiveDate(version.effectiveDate)}
                    </span>
                  </div>
                  {version.supersedes && (
                    <div className="meta-row">
                      <span className="label">Supersedes:</span>
                      <span className="value">v{version.supersedes}</span>
                    </div>
                  )}
                  {version.createdBy && (
                    <div className="meta-row">
                      <span className="label">Created By:</span>
                      <span className="value">{version.createdBy}</span>
                    </div>
                  )}
                </div>

                {version.changes.length > 0 && (
                  <div className="change-summary">
                    <strong>{version.changes.length} change(s):</strong>
                    <ul className="change-list">
                      {version.changes.slice(0, 3).map((change, idx) => (
                        <li key={idx}>
                          {change.mineralSymbol}:{" "}
                          {formatChangeType(change.changeType)}
                        </li>
                      ))}
                      {version.changes.length > 3 && (
                        <li className="more">
                          +{version.changes.length - 3} more...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {version.notes && (
                  <div className="version-notes">
                    <p>{version.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comparison Results */}
      {showComparison && comparison && (
        <div className="comparison-results">
          <h4>Version Comparison Results</h4>

          <div className="comparison-summary">
            <div className="summary-stat">
              <span className="stat-value">{comparison.totalChanges}</span>
              <span className="stat-label">Total Changes</span>
            </div>
            <div className="summary-text">{comparison.summary}</div>
          </div>

          <div className="mineral-changes">
            <h5>Mineral-by-Mineral Changes</h5>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Mineral</th>
                  <th>Status</th>
                  <th>Old Range</th>
                  <th>New Range</th>
                  <th>Change</th>
                  <th>Impact</th>
                </tr>
              </thead>
              <tbody>
                {comparison.changes.map((change) => (
                  <tr
                    key={change.symbol}
                    className={change.changed ? "changed" : "unchanged"}
                  >
                    <td>
                      <strong>{change.symbol}</strong> {change.name}
                    </td>
                    <td>
                      {change.changed ? (
                        <span className="badge changed-badge">Changed</span>
                      ) : (
                        <span className="badge unchanged-badge">Unchanged</span>
                      )}
                    </td>
                    <td>
                      {change.oldMin !== undefined &&
                      change.oldMax !== undefined
                        ? `${change.oldMin} - ${change.oldMax}`
                        : "—"}
                    </td>
                    <td>
                      {change.newMin !== undefined &&
                      change.newMax !== undefined
                        ? `${change.newMin} - ${change.newMax}`
                        : "—"}
                    </td>
                    <td>
                      {change.minChangePercent !== undefined ||
                      change.maxChangePercent !== undefined ? (
                        <div className="change-details">
                          {change.minChangePercent !== undefined && (
                            <div>
                              Min: {change.minChangePercent > 0 ? "+" : ""}
                              {change.minChangePercent.toFixed(1)}%
                            </div>
                          )}
                          {change.maxChangePercent !== undefined && (
                            <div>
                              Max: {change.maxChangePercent > 0 ? "+" : ""}
                              {change.maxChangePercent.toFixed(1)}%
                            </div>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <span
                        className={`impact-badge impact-${change.impactLevel}`}
                      >
                        {change.impactLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style jsx>{`
        .reference-range-version-panel {
          padding: 24px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .panel-header {
          margin-bottom: 24px;
        }

        .panel-header h3 {
          margin: 0 0 8px 0;
          font-size: 24px;
          color: #1a202c;
        }

        .subtitle {
          margin: 0;
          color: #718096;
          font-size: 14px;
        }

        .active-version-banner {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .banner-content {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .banner-content strong {
          font-size: 18px;
        }

        .version-id {
          font-family: monospace;
          opacity: 0.9;
        }

        .banner-meta {
          display: flex;
          gap: 20px;
          font-size: 14px;
          opacity: 0.9;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .active-badge {
          background: rgba(255, 255, 255, 0.3);
          color: white;
        }

        .active-badge-small {
          background: #48bb78;
          color: white;
        }

        .deprecated-badge {
          background: #fc8181;
          color: white;
        }

        .comparison-mode {
          background: #edf2f7;
          border: 2px dashed #cbd5e0;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .comparison-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .comparison-header h4 {
          margin: 0;
          color: #2d3748;
        }

        .clear-button {
          background: transparent;
          border: 1px solid #cbd5e0;
          padding: 4px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          color: #4a5568;
        }

        .clear-button:hover {
          background: white;
        }

        .comparison-selections {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 16px;
          align-items: center;
        }

        .selection-box {
          background: white;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .selection-box label {
          display: block;
          font-size: 12px;
          color: #718096;
          margin-bottom: 4px;
          font-weight: 600;
        }

        .selected-version {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .selected-version strong {
          color: #2d3748;
        }

        .selected-version span {
          font-size: 12px;
          color: #718096;
          font-family: monospace;
        }

        .placeholder {
          color: #a0aec0;
          font-style: italic;
          font-size: 14px;
        }

        .arrow {
          font-size: 24px;
          color: #cbd5e0;
          text-align: center;
        }

        .version-list {
          margin-bottom: 24px;
        }

        .version-list h4 {
          margin: 0 0 16px 0;
          color: #2d3748;
        }

        .empty-state {
          text-align: center;
          padding: 48px 24px;
          color: #a0aec0;
        }

        .empty-state p {
          margin: 8px 0;
        }

        .hint {
          font-size: 14px;
        }

        .versions {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .version-card {
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          transition: all 0.2s;
        }

        .version-card:hover {
          border-color: #cbd5e0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .version-card.active {
          border-color: #667eea;
          background: #f7fafc;
        }

        .version-card.selected {
          border-color: #48bb78;
          background: #f0fff4;
        }

        .version-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .version-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .version-title h5 {
          margin: 0;
          color: #2d3748;
        }

        .version-number {
          font-family: monospace;
          color: #718096;
          font-size: 14px;
        }

        .version-actions {
          display: flex;
          gap: 8px;
        }

        .compare-button,
        .view-button {
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .compare-button {
          background: #667eea;
          color: white;
          border: none;
        }

        .compare-button:hover:not(:disabled) {
          background: #5a67d8;
        }

        .compare-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .view-button {
          background: white;
          color: #667eea;
          border: 1px solid #667eea;
        }

        .view-button:hover {
          background: #f7fafc;
        }

        .version-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
        }

        .meta-row {
          display: flex;
          gap: 8px;
          font-size: 14px;
        }

        .meta-row .label {
          color: #718096;
          min-width: 120px;
        }

        .meta-row .value {
          color: #2d3748;
          font-weight: 500;
        }

        .change-summary {
          background: #f7fafc;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .change-summary strong {
          display: block;
          margin-bottom: 8px;
          color: #2d3748;
        }

        .change-list {
          margin: 0;
          padding-left: 20px;
          font-size: 14px;
          color: #4a5568;
        }

        .change-list li {
          margin: 4px 0;
        }

        .change-list .more {
          font-style: italic;
          color: #718096;
        }

        .version-notes {
          margin-top: 8px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
        }

        .version-notes p {
          margin: 0;
          color: #4a5568;
          font-size: 14px;
          font-style: italic;
        }

        .comparison-results {
          background: #f7fafc;
          border-radius: 8px;
          padding: 20px;
          margin-top: 24px;
        }

        .comparison-results h4 {
          margin: 0 0 16px 0;
          color: #2d3748;
        }

        .comparison-summary {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 24px;
          padding: 16px;
          background: white;
          border-radius: 6px;
        }

        .summary-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 6px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: bold;
        }

        .stat-label {
          font-size: 12px;
          opacity: 0.9;
          text-transform: uppercase;
        }

        .summary-text {
          flex: 1;
          font-size: 16px;
          color: #2d3748;
        }

        .mineral-changes h5 {
          margin: 0 0 12px 0;
          color: #2d3748;
        }

        .comparison-table {
          width: 100%;
          background: white;
          border-radius: 6px;
          overflow: hidden;
          border-collapse: collapse;
        }

        .comparison-table thead {
          background: #edf2f7;
        }

        .comparison-table th {
          padding: 12px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #4a5568;
          text-transform: uppercase;
        }

        .comparison-table td {
          padding: 12px;
          border-top: 1px solid #e2e8f0;
          font-size: 14px;
        }

        .comparison-table tr.changed {
          background: #fffaf0;
        }

        .comparison-table tr.unchanged {
          opacity: 0.6;
        }

        .changed-badge {
          background: #fc8181;
          color: white;
        }

        .unchanged-badge {
          background: #e2e8f0;
          color: #718096;
        }

        .change-details {
          font-size: 13px;
          color: #4a5568;
        }

        .impact-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .impact-none {
          background: #e2e8f0;
          color: #718096;
        }

        .impact-minor {
          background: #c6f6d5;
          color: #22543d;
        }

        .impact-moderate {
          background: #feebc8;
          color: #7c2d12;
        }

        .impact-major {
          background: #fed7d7;
          color: #742a2a;
        }
      `}</style>
    </div>
  );
}

/**
 * Format change type for display
 */
function formatChangeType(changeType: RangeChangeType): string {
  const labels: Record<RangeChangeType, string> = {
    created: "Added",
    min_increased: "Min ↑",
    min_decreased: "Min ↓",
    max_increased: "Max ↑",
    max_decreased: "Max ↓",
    range_widened: "Widened",
    range_narrowed: "Narrowed",
    range_shifted: "Shifted",
    unit_changed: "Unit Changed",
    deprecated: "Removed",
  };

  return labels[changeType] || changeType;
}
