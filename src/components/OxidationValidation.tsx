/**
 * Oxidation Validation Component
 *
 * Dev/Practitioner-only regression test runner
 * Validates oxidation classification against known test cases
 * v1.0.1 - Calibration Sprint
 */

import React, { useState, useEffect } from "react";
import {
  classifyOxidation,
  getOxidationTypeLabel,
} from "../lib/oxidationClassification";
import {
  OXIDATION_TEST_CASES,
  OxidationTestCase,
} from "../lib/oxidationTestCases";

interface TestResult {
  testCase: OxidationTestCase;
  actualType: string;
  passed: boolean;
  confidence: string;
  explanation: string;
  thresholdWarnings: string[];
  ratios: {
    caK: number;
    naK: number;
    caMg: number;
  };
  ratioSignals: {
    caK: string;
    naK: string;
    caMg: string;
  };
}

export default function OxidationValidation() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [showOnlyFailures, setShowOnlyFailures] = useState(false);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = () => {
    const results: TestResult[] = [];

    OXIDATION_TEST_CASES.forEach((testCase) => {
      try {
        const classification = classifyOxidation(testCase.mineralValues);

        results.push({
          testCase,
          actualType: classification.type,
          passed: classification.type === testCase.expectedType,
          confidence: classification.confidence,
          explanation: classification.explanation,
          thresholdWarnings: classification.thresholdWarnings,
          ratios: classification.metadata.ratioValues,
          ratioSignals: {
            caK: classification.indicators.ratioSignals.caK,
            naK: classification.indicators.ratioSignals.naK,
            caMg: classification.indicators.ratioSignals.caMg,
          },
        });
      } catch (error) {
        console.error(`Test ${testCase.id} failed with error:`, error);
      }
    });

    setTestResults(results);
  };

  const filteredResults = testResults.filter((result) => {
    if (showOnlyFailures && result.passed) return false;
    if (filterType !== "all" && result.testCase.expectedType !== filterType)
      return false;
    return true;
  });

  const totalTests = testResults.length;
  const passedTests = testResults.filter((r) => r.passed).length;
  const failedTests = totalTests - passedTests;
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      fast: "#3b82f6",
      slow: "#f97316",
      mixed: "#a855f7",
      balanced: "#10b981",
    };
    return colors[type] || "#6b7280";
  };

  return (
    <div className="oxidation-validation">
      <div className="validation-header">
        <h1>🧪 Oxidation Classification Validation</h1>
        <p className="subtitle">
          Regression test suite for oxidation type calibration (v1.0.1)
        </p>
      </div>

      {/* Summary Stats */}
      <div className="summary-section">
        <div className="summary-card total">
          <div className="summary-label">Total Tests</div>
          <div className="summary-value">{totalTests}</div>
        </div>
        <div className="summary-card passed">
          <div className="summary-label">Passed</div>
          <div className="summary-value">{passedTests}</div>
        </div>
        <div className="summary-card failed">
          <div className="summary-label">Failed</div>
          <div className="summary-value">{failedTests}</div>
        </div>
        <div className="summary-card pass-rate">
          <div className="summary-label">Pass Rate</div>
          <div className="summary-value">{passRate.toFixed(1)}%</div>
        </div>
      </div>

      {/* Pass Rate Bar */}
      <div className="pass-rate-bar">
        <div
          className="pass-rate-fill"
          style={{
            width: `${passRate}%`,
            background:
              passRate >= 90
                ? "#10b981"
                : passRate >= 75
                ? "#f59e0b"
                : "#ef4444",
          }}
        />
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="fast">Fast Oxidizer</option>
            <option value="slow">Slow Oxidizer</option>
            <option value="mixed">Mixed Oxidizer</option>
            <option value="balanced">Balanced Oxidizer</option>
          </select>
        </div>

        <div className="filter-group">
          <label>
            <input
              type="checkbox"
              checked={showOnlyFailures}
              onChange={(e) => setShowOnlyFailures(e.target.checked)}
            />
            Show Only Failures
          </label>
        </div>

        <button className="btn-rerun" onClick={runTests}>
          🔄 Re-run Tests
        </button>
      </div>

      {/* Test Results */}
      <div className="results-section">
        <h2>
          Test Results ({filteredResults.length} of {totalTests})
        </h2>

        {filteredResults.map((result) => (
          <div
            key={result.testCase.id}
            className={`test-result-card ${
              result.passed ? "passed" : "failed"
            }`}
          >
            <div className="test-header">
              <div className="test-id">
                {result.passed ? "✅" : "❌"} {result.testCase.id}
              </div>
              <div className="test-description">
                {result.testCase.description}
              </div>
            </div>

            <div className="test-body">
              {/* Mineral Values */}
              <div className="test-section">
                <h4>Mineral Values</h4>
                <div className="mineral-values">
                  <span>Ca: {result.testCase.mineralValues.Ca}</span>
                  <span>Mg: {result.testCase.mineralValues.Mg}</span>
                  <span>Na: {result.testCase.mineralValues.Na}</span>
                  <span>K: {result.testCase.mineralValues.K}</span>
                </div>
              </div>

              {/* Classification Result */}
              <div className="test-section">
                <h4>Classification</h4>
                <div className="classification-comparison">
                  <div className="expected">
                    <span className="label">Expected:</span>
                    <span
                      className="type-badge"
                      style={{
                        backgroundColor: getTypeColor(
                          result.testCase.expectedType
                        ),
                      }}
                    >
                      {getOxidationTypeLabel(result.testCase.expectedType)}
                    </span>
                  </div>
                  <div className="actual">
                    <span className="label">Actual:</span>
                    <span
                      className="type-badge"
                      style={{
                        backgroundColor: getTypeColor(result.actualType),
                      }}
                    >
                      {getOxidationTypeLabel(result.actualType as any)}
                    </span>
                    <span className="confidence-badge">
                      {result.confidence} confidence
                    </span>
                  </div>
                </div>
              </div>

              {/* Ratios & Signals */}
              <div className="test-section">
                <h4>Ratios & Signals</h4>
                <div className="ratio-grid">
                  <div className="ratio-item">
                    <span className="ratio-name">Ca/K:</span>
                    <span className="ratio-value">{result.ratios.caK}</span>
                    <span className="ratio-signal">
                      ({result.ratioSignals.caK})
                    </span>
                  </div>
                  <div className="ratio-item">
                    <span className="ratio-name">Na/K:</span>
                    <span className="ratio-value">{result.ratios.naK}</span>
                    <span className="ratio-signal">
                      ({result.ratioSignals.naK})
                    </span>
                  </div>
                  <div className="ratio-item">
                    <span className="ratio-name">Ca/Mg:</span>
                    <span className="ratio-value">{result.ratios.caMg}</span>
                    <span className="ratio-signal">
                      ({result.ratioSignals.caMg})
                    </span>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="test-section">
                <h4>Why This Classification?</h4>
                <p className="explanation">{result.explanation}</p>
              </div>

              {/* Threshold Warnings */}
              {result.thresholdWarnings.length > 0 && (
                <div className="test-section warnings">
                  <h4>⚠️ Near-Threshold Warnings</h4>
                  <ul className="warning-list">
                    {result.thresholdWarnings.map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Test Case Note */}
              <div className="test-section note">
                <h4>Test Case Note</h4>
                <p>{result.testCase.note}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .oxidation-validation {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .validation-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .validation-header h1 {
          font-size: 2rem;
          color: #111827;
          margin: 0 0 0.5rem 0;
        }

        .subtitle {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .summary-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .summary-card {
          background: white;
          padding: 1.5rem;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .summary-card.passed {
          border-left: 4px solid #10b981;
        }

        .summary-card.failed {
          border-left: 4px solid #ef4444;
        }

        .summary-card.pass-rate {
          border-left: 4px solid #3b82f6;
        }

        .summary-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .summary-value {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
        }

        .pass-rate-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .pass-rate-fill {
          height: 100%;
          transition: width 0.3s;
        }

        .filters-section {
          background: white;
          padding: 1rem;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-group label {
          font-size: 0.875rem;
          color: #374151;
        }

        .filter-group select {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }

        .btn-rerun {
          margin-left: auto;
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .btn-rerun:hover {
          background: #2563eb;
        }

        .results-section h2 {
          font-size: 1.25rem;
          color: #111827;
          margin-bottom: 1rem;
        }

        .test-result-card {
          background: white;
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin-bottom: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .test-result-card.passed {
          border-left: 4px solid #10b981;
        }

        .test-result-card.failed {
          border-left: 4px solid #ef4444;
        }

        .test-header {
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .test-id {
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .test-description {
          font-size: 1rem;
          font-weight: 500;
          color: #111827;
        }

        .test-body {
          display: grid;
          gap: 1rem;
        }

        .test-section h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin: 0 0 0.5rem 0;
        }

        .mineral-values {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .classification-comparison {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .expected,
        .actual {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .type-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .confidence-badge {
          padding: 0.25rem 0.5rem;
          background: #f3f4f6;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .ratio-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.75rem;
        }

        .ratio-item {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
          align-items: center;
        }

        .ratio-name {
          font-weight: 500;
          color: #374151;
        }

        .ratio-value {
          font-weight: 600;
          color: #111827;
        }

        .ratio-signal {
          color: #6b7280;
          font-size: 0.75rem;
        }

        .explanation {
          font-size: 0.875rem;
          color: #374151;
          line-height: 1.6;
          margin: 0;
          background: #f9fafb;
          padding: 0.75rem;
          border-radius: 0.375rem;
        }

        .test-section.warnings {
          background: #fef3c7;
          padding: 0.75rem;
          border-radius: 0.375rem;
          border-left: 3px solid #f59e0b;
        }

        .test-section.warnings h4 {
          color: #92400e;
        }

        .warning-list {
          margin: 0;
          padding-left: 1.5rem;
          font-size: 0.875rem;
          color: #78350f;
        }

        .warning-list li {
          margin-bottom: 0.25rem;
        }

        .test-section.note {
          background: #eff6ff;
          padding: 0.75rem;
          border-radius: 0.375rem;
          border-left: 3px solid #3b82f6;
        }

        .test-section.note h4 {
          color: #1e40af;
        }

        .test-section.note p {
          margin: 0;
          font-size: 0.875rem;
          color: #1e3a8a;
        }
      `}</style>
    </div>
  );
}
