/**
 * Version Migration Tool
 *
 * Allows practitioners to:
 * - See how a client's results would differ with newer reference ranges
 * - Perform "what-if" analysis across versions
 * - Migrate old analyses to new ranges
 *
 * @version 1.7.0
 */

import { useState } from "react";
import { ReferenceRangeVersion } from "../lib/reportSnapshot";
import {
  shouldMigrateAnalysis,
  analyzeRangeChangeImpact,
  MigrationRecommendation,
  RangeChangeImpact,
} from "../lib/rangeVersionEngine";

interface VersionMigrationToolProps {
  /** Current version used for analysis */
  currentVersion: ReferenceRangeVersion;

  /** Target version to migrate to */
  targetVersion: ReferenceRangeVersion;

  /** Mineral values from the analysis */
  mineralValues: ReadonlyArray<{ symbol: string; name: string; value: number }>;

  /** Callback when user confirms migration */
  onMigrate?: () => void;

  /** Whether migration is in progress */
  isMigrating?: boolean;
}

export default function VersionMigrationTool({
  currentVersion,
  targetVersion,
  mineralValues,
  onMigrate,
  isMigrating = false,
}: VersionMigrationToolProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate migration recommendation
  const recommendation = shouldMigrateAnalysis(
    currentVersion,
    targetVersion,
    mineralValues
  );

  // Calculate impact for each mineral
  const impacts: RangeChangeImpact[] = [];
  const currentRanges = new Map(
    currentVersion.mineralRanges.map((r) => [r.symbol, r])
  );
  const targetRanges = new Map(
    targetVersion.mineralRanges.map((r) => [r.symbol, r])
  );

  for (const { symbol, value } of mineralValues) {
    const currentRange = currentRanges.get(symbol);
    const targetRange = targetRanges.get(symbol);

    if (currentRange && targetRange) {
      const impact = analyzeRangeChangeImpact(
        symbol,
        value,
        currentRange,
        targetRange
      );
      impacts.push(impact);
    }
  }

  const statusChanges = impacts.filter((i) => i.statusChanged);

  return (
    <div className="version-migration-tool">
      <div className="tool-header">
        <h4>📈 Version Migration Analysis</h4>
        <p className="subtitle">
          See how this analysis would differ with updated reference ranges
        </p>
      </div>

      {/* Version Comparison Summary */}
      <div className="version-comparison">
        <div className="version-box current">
          <label>Current Version</label>
          <div className="version-details">
            <strong>{currentVersion.name}</strong>
            <span className="version-id">v{currentVersion.version}</span>
          </div>
          <span className="standard">{currentVersion.standard}</span>
        </div>

        <div className="arrow">→</div>

        <div className="version-box target">
          <label>Target Version</label>
          <div className="version-details">
            <strong>{targetVersion.name}</strong>
            <span className="version-id">v{targetVersion.version}</span>
          </div>
          <span className="standard">{targetVersion.standard}</span>
          {targetVersion.isActive && (
            <span className="badge active-badge">Active</span>
          )}
        </div>
      </div>

      {/* Recommendation Card */}
      <div
        className={`recommendation-card severity-${recommendation.severity}`}
      >
        <div className="recommendation-header">
          <div className="icon">
            {recommendation.shouldMigrate ? "⚠️" : "ℹ️"}
          </div>
          <div className="content">
            <h5>
              {recommendation.shouldMigrate
                ? "Migration Recommended"
                : "Migration Not Required"}
            </h5>
            <p>{recommendation.reason}</p>
          </div>
        </div>

        {recommendation.statusChanges > 0 && (
          <div className="impact-summary">
            <div className="stat">
              <span className="stat-value">{recommendation.statusChanges}</span>
              <span className="stat-label">
                Mineral{recommendation.statusChanges > 1 ? "s" : ""} Affected
              </span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {recommendation.affectedMinerals.length}
              </span>
              <span className="stat-label">Status Change(s)</span>
            </div>
            <div className="stat">
              <span
                className={`stat-value severity-${recommendation.severity}`}
              >
                {recommendation.severity.toUpperCase()}
              </span>
              <span className="stat-label">Impact Severity</span>
            </div>
          </div>
        )}

        {recommendation.affectedMinerals.length > 0 && (
          <div className="affected-minerals">
            <strong>Affected Minerals:</strong>
            <div className="mineral-tags">
              {recommendation.affectedMinerals.map((symbol) => (
                <span key={symbol} className="mineral-tag">
                  {symbol}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Impact Analysis */}
      {statusChanges.length > 0 && (
        <div className="detailed-impacts">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="toggle-details"
          >
            {showDetails ? "▼" : "▶"} Detailed Impact Analysis
          </button>

          {showDetails && (
            <div className="impacts-table-container">
              <table className="impacts-table">
                <thead>
                  <tr>
                    <th>Mineral</th>
                    <th>Value</th>
                    <th>Current Status</th>
                    <th>New Status</th>
                    <th>Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {statusChanges.map((impact) => {
                    const mineral = mineralValues.find(
                      (m) => m.symbol === impact.mineralSymbol
                    );
                    return (
                      <tr key={impact.mineralSymbol} className="status-changed">
                        <td>
                          <strong>{impact.mineralSymbol}</strong>
                          <span className="mineral-name">{mineral?.name}</span>
                        </td>
                        <td className="value-cell">
                          {impact.value.toFixed(2)}
                        </td>
                        <td>
                          <span
                            className={`status-badge status-${impact.oldStatus}`}
                          >
                            {impact.oldStatus}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge status-${impact.newStatus}`}
                          >
                            {impact.newStatus}
                          </span>
                        </td>
                        <td className="impact-description">
                          {impact.impactDescription}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Unchanged minerals */}
              {impacts.filter((i) => !i.statusChanged).length > 0 && (
                <details className="unchanged-minerals">
                  <summary>
                    {impacts.filter((i) => !i.statusChanged).length} minerals
                    unchanged
                  </summary>
                  <div className="unchanged-list">
                    {impacts
                      .filter((i) => !i.statusChanged)
                      .map((impact) => {
                        const mineral = mineralValues.find(
                          (m) => m.symbol === impact.mineralSymbol
                        );
                        return (
                          <div
                            key={impact.mineralSymbol}
                            className="unchanged-item"
                          >
                            <strong>{impact.mineralSymbol}</strong>
                            <span>{mineral?.name}</span>
                            <span
                              className={`status-badge status-${impact.oldStatus}`}
                            >
                              {impact.oldStatus}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      )}

      {/* Migration Actions */}
      {onMigrate && recommendation.shouldMigrate && (
        <div className="migration-actions">
          <div className="action-info">
            <h5>Ready to migrate?</h5>
            <p>
              This will update the analysis to use{" "}
              <strong>{targetVersion.name}</strong> reference ranges. The
              original analysis will be preserved in the version history.
            </p>
          </div>
          <button
            onClick={onMigrate}
            disabled={isMigrating}
            className="migrate-button"
          >
            {isMigrating ? "Migrating..." : "Migrate to New Version"}
          </button>
        </div>
      )}

      <style jsx>{`
        .version-migration-tool {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .tool-header {
          margin-bottom: 24px;
        }

        .tool-header h4 {
          margin: 0 0 8px 0;
          font-size: 20px;
          color: #1a202c;
        }

        .subtitle {
          margin: 0;
          color: #718096;
          font-size: 14px;
        }

        .version-comparison {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 16px;
          align-items: center;
          margin-bottom: 24px;
          padding: 20px;
          background: #f7fafc;
          border-radius: 8px;
        }

        .version-box {
          background: white;
          padding: 16px;
          border-radius: 8px;
          border: 2px solid #e2e8f0;
        }

        .version-box.current {
          border-color: #cbd5e0;
        }

        .version-box.target {
          border-color: #667eea;
        }

        .version-box label {
          display: block;
          font-size: 12px;
          color: #718096;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .version-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 8px;
        }

        .version-details strong {
          color: #2d3748;
          font-size: 16px;
        }

        .version-id {
          font-family: monospace;
          color: #718096;
          font-size: 14px;
        }

        .standard {
          font-size: 13px;
          color: #4a5568;
        }

        .arrow {
          font-size: 24px;
          color: #cbd5e0;
          text-align: center;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          margin-top: 8px;
          display: inline-block;
        }

        .active-badge {
          background: #48bb78;
          color: white;
        }

        .recommendation-card {
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .recommendation-card.severity-low {
          background: #f0fff4;
          border: 2px solid #9ae6b4;
        }

        .recommendation-card.severity-medium {
          background: #fffaf0;
          border: 2px solid #fbd38d;
        }

        .recommendation-card.severity-high {
          background: #fff5f5;
          border: 2px solid #fc8181;
        }

        .recommendation-header {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }

        .recommendation-header .icon {
          font-size: 32px;
        }

        .recommendation-header .content h5 {
          margin: 0 0 8px 0;
          color: #2d3748;
          font-size: 18px;
        }

        .recommendation-header .content p {
          margin: 0;
          color: #4a5568;
          font-size: 14px;
        }

        .impact-summary {
          display: flex;
          gap: 24px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 6px;
          margin-bottom: 16px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #2d3748;
        }

        .stat-value.severity-low {
          color: #38a169;
        }

        .stat-value.severity-medium {
          color: #dd6b20;
        }

        .stat-value.severity-high {
          color: #e53e3e;
        }

        .stat-label {
          font-size: 12px;
          color: #718096;
          text-align: center;
        }

        .affected-minerals {
          padding-top: 16px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .affected-minerals strong {
          display: block;
          margin-bottom: 8px;
          color: #2d3748;
        }

        .mineral-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .mineral-tag {
          padding: 4px 12px;
          background: #667eea;
          color: white;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
        }

        .detailed-impacts {
          margin-bottom: 24px;
        }

        .toggle-details {
          width: 100%;
          padding: 12px;
          background: #edf2f7;
          border: 1px solid #cbd5e0;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: #2d3748;
          text-align: left;
          transition: all 0.2s;
        }

        .toggle-details:hover {
          background: #e2e8f0;
        }

        .impacts-table-container {
          margin-top: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          overflow: hidden;
        }

        .impacts-table {
          width: 100%;
          border-collapse: collapse;
        }

        .impacts-table thead {
          background: #f7fafc;
        }

        .impacts-table th {
          padding: 12px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #4a5568;
          text-transform: uppercase;
          border-bottom: 2px solid #e2e8f0;
        }

        .impacts-table td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 14px;
        }

        .impacts-table tr.status-changed {
          background: #fffaf0;
        }

        .mineral-name {
          display: block;
          font-size: 12px;
          color: #718096;
          margin-top: 2px;
        }

        .value-cell {
          font-family: monospace;
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

        .status-low {
          background: #fed7d7;
          color: #742a2a;
        }

        .status-optimal {
          background: #c6f6d5;
          color: #22543d;
        }

        .status-high {
          background: #feebc8;
          color: #7c2d12;
        }

        .impact-description {
          color: #4a5568;
          font-size: 13px;
        }

        .unchanged-minerals {
          margin-top: 12px;
          padding: 12px;
          background: #f7fafc;
          border-radius: 6px;
        }

        .unchanged-minerals summary {
          cursor: pointer;
          font-size: 14px;
          color: #4a5568;
          font-weight: 600;
        }

        .unchanged-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }

        .unchanged-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 8px;
          background: white;
          border-radius: 4px;
          font-size: 13px;
        }

        .unchanged-item strong {
          color: #2d3748;
        }

        .unchanged-item span:not(.status-badge) {
          color: #718096;
        }

        .migration-actions {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .action-info h5 {
          margin: 0 0 8px 0;
          font-size: 18px;
        }

        .action-info p {
          margin: 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .migrate-button {
          padding: 12px 24px;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .migrate-button:hover:not(:disabled) {
          background: #f7fafc;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .migrate-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
