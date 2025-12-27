import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { usePractitionerMode } from "../../hooks/usePractitionerMode";
import { useRouter } from "next/router";

interface GuardrailsIssue {
  context: string;
  negativePercent: number;
  totalFeedback: number;
  commonPhrases: string[];
  criticalComments: string[];
  severity: "high" | "medium" | "low";
  recommendedAction: string;
}

interface Suggestion {
  id: string;
  context: string;
  issue: string;
  currentBehavior: string;
  suggestedChange: string;
  rationale: string;
  priority: "critical" | "high" | "medium" | "low";
  affectedFeedbackCount: number;
  relatedComments: string[];
}

interface VersionComparison {
  fromVersion: string;
  toVersion: string;
  improvement: number;
  status: "improved" | "worsened" | "unchanged";
  details: {
    previous: { negativePercent: number; total: number };
    current: { negativePercent: number; total: number };
  };
}

export default function GuardrailsReview() {
  const { user } = useAuth();
  const { isPractitionerMode } = usePractitionerMode();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState<GuardrailsIssue[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [versionComparisons, setVersionComparisons] = useState<
    VersionComparison[]
  >([]);
  const [activeTab, setActiveTab] = useState<
    "issues" | "suggestions" | "versions"
  >("issues");

  useEffect(() => {
    if (!isPractitionerMode) {
      router.push("/");
    }
  }, [isPractitionerMode, router]);

  const analyzeFeedback = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch("/api/analyze-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, minNegativePercent: 20 }),
      });

      const data = await response.json();
      if (response.ok) {
        setIssues(data.issues || []);
        setVersionComparisons(data.versionComparison?.comparisons || []);
      }
    } catch (error) {
      console.error("Failed to analyze feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch("/api/generate-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuggestions(data.suggestions || []);
        setActiveTab("suggestions");
      }
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isPractitionerMode) {
      analyzeFeedback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isPractitionerMode]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "#dc2626";
      case "high":
        return "#f59e0b";
      case "medium":
        return "#3b82f6";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  if (!isPractitionerMode) {
    return null;
  }

  return (
    <div className="guardrails-review">
      <div className="review-header">
        <h1>🛡️ Guardrails Review & Improvement</h1>
        <p className="subtitle">
          Identify issues, review suggestions, and validate improvements
        </p>

        <div className="header-actions">
          <button
            onClick={analyzeFeedback}
            className="analyze-btn"
            disabled={loading}
          >
            {loading ? "Analyzing..." : "🔍 Analyze Feedback"}
          </button>
          <button
            onClick={generateSuggestions}
            className="suggest-btn"
            disabled={loading}
          >
            💡 Generate Suggestions
          </button>
          <a href="/practitioner/feedback-dashboard" className="back-link">
            ← Back to Dashboard
          </a>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "issues" ? "active" : ""}`}
          onClick={() => setActiveTab("issues")}
        >
          🚨 Issues ({issues.length})
        </button>
        <button
          className={`tab ${activeTab === "suggestions" ? "active" : ""}`}
          onClick={() => setActiveTab("suggestions")}
        >
          💡 Suggestions ({suggestions.length})
        </button>
        <button
          className={`tab ${activeTab === "versions" ? "active" : ""}`}
          onClick={() => setActiveTab("versions")}
        >
          📊 Version Tracking ({versionComparisons.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Analyzing feedback and generating insights...</p>
        </div>
      ) : (
        <>
          {/* Issues Tab */}
          {activeTab === "issues" && (
            <div className="tab-content">
              {issues.length === 0 ? (
                <div className="empty-state">
                  <p>
                    No issues detected. Click &quot;Analyze Feedback&quot; to
                    start.
                  </p>
                </div>
              ) : (
                <div className="issues-list">
                  {issues.map((issue, idx) => (
                    <div key={idx} className="issue-card">
                      <div className="issue-header">
                        <h3>{issue.context}</h3>
                        <span
                          className="severity-badge"
                          style={{
                            background: getSeverityColor(issue.severity),
                          }}
                        >
                          {issue.severity.toUpperCase()}
                        </span>
                      </div>

                      <div className="issue-stats">
                        <div className="stat">
                          <span className="stat-label">Negative Feedback:</span>
                          <span className="stat-value negative">
                            {issue.negativePercent}%
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Total Responses:</span>
                          <span className="stat-value">
                            {issue.totalFeedback}
                          </span>
                        </div>
                      </div>

                      <div className="issue-section">
                        <h4>Common Concerns:</h4>
                        <div className="phrases">
                          {issue.commonPhrases.map((phrase, i) => (
                            <span key={i} className="phrase-badge">
                              {phrase}
                            </span>
                          ))}
                        </div>
                      </div>

                      {issue.criticalComments.length > 0 && (
                        <div className="issue-section">
                          <h4>Critical Comments:</h4>
                          <ul className="comments">
                            {issue.criticalComments.map((comment, i) => (
                              <li key={i}>{comment}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="issue-recommendation">
                        <strong>Recommended Action:</strong>
                        <p>{issue.recommendedAction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Suggestions Tab */}
          {activeTab === "suggestions" && (
            <div className="tab-content">
              {suggestions.length === 0 ? (
                <div className="empty-state">
                  <p>
                    No suggestions yet. Click &quot;Generate Suggestions&quot;
                    to create improvement recommendations.
                  </p>
                </div>
              ) : (
                <div className="suggestions-list">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="suggestion-card">
                      <div className="suggestion-header">
                        <div>
                          <h3>{suggestion.context}</h3>
                          <span className="issue-type">{suggestion.issue}</span>
                        </div>
                        <span
                          className="priority-badge"
                          style={{
                            background: getSeverityColor(suggestion.priority),
                          }}
                        >
                          {suggestion.priority.toUpperCase()}
                        </span>
                      </div>

                      <div className="suggestion-body">
                        <div className="suggestion-section">
                          <h4>Current Behavior:</h4>
                          <p className="current">
                            {suggestion.currentBehavior}
                          </p>
                        </div>

                        <div className="suggestion-section">
                          <h4>Suggested Change:</h4>
                          <p className="suggested">
                            {suggestion.suggestedChange}
                          </p>
                        </div>

                        <div className="suggestion-section">
                          <h4>Rationale:</h4>
                          <p className="rationale">{suggestion.rationale}</p>
                        </div>

                        <div className="suggestion-meta">
                          <span>
                            Affects {suggestion.affectedFeedbackCount} feedback
                            items
                          </span>
                        </div>

                        {suggestion.relatedComments.length > 0 && (
                          <details className="related-comments">
                            <summary>
                              View Related Comments (
                              {suggestion.relatedComments.length})
                            </summary>
                            <ul>
                              {suggestion.relatedComments.map((comment, i) => (
                                <li key={i}>{comment}</li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Versions Tab */}
          {activeTab === "versions" && (
            <div className="tab-content">
              {versionComparisons.length === 0 ? (
                <div className="empty-state">
                  <p>
                    No version comparisons available. Need at least 2 guardrails
                    versions with feedback.
                  </p>
                </div>
              ) : (
                <div className="versions-list">
                  {versionComparisons.map((comparison, idx) => (
                    <div key={idx} className="version-card">
                      <div className="version-header">
                        <h3>
                          v{comparison.fromVersion} → v{comparison.toVersion}
                        </h3>
                        <span className={`status-badge ${comparison.status}`}>
                          {comparison.status === "improved" && "✓ "}
                          {comparison.status === "worsened" && "⚠ "}
                          {comparison.status}
                        </span>
                      </div>

                      <div className="version-stats">
                        <div className="version-col">
                          <h4>Previous (v{comparison.fromVersion})</h4>
                          <div className="version-data">
                            <div>
                              Negative:{" "}
                              {comparison.details.previous.negativePercent}%
                            </div>
                            <div>
                              Total: {comparison.details.previous.total}
                            </div>
                          </div>
                        </div>

                        <div className="version-arrow">→</div>

                        <div className="version-col">
                          <h4>Current (v{comparison.toVersion})</h4>
                          <div className="version-data">
                            <div>
                              Negative:{" "}
                              {comparison.details.current.negativePercent}%
                            </div>
                            <div>Total: {comparison.details.current.total}</div>
                          </div>
                        </div>
                      </div>

                      <div className="improvement-metric">
                        <strong>
                          {comparison.improvement > 0
                            ? `${comparison.improvement}% Improvement`
                            : comparison.improvement < 0
                            ? `${Math.abs(comparison.improvement)}% Regression`
                            : "No Change"}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .guardrails-review {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .review-header {
          margin-bottom: 2rem;
        }

        .review-header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
          color: #1f2937;
        }

        .subtitle {
          color: #6b7280;
          margin: 0 0 1.5rem 0;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .analyze-btn,
        .suggest-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .analyze-btn {
          background: #667eea;
          color: white;
        }

        .analyze-btn:hover:not(:disabled) {
          background: #5568d3;
        }

        .suggest-btn {
          background: #f59e0b;
          color: white;
        }

        .suggest-btn:hover:not(:disabled) {
          background: #d97706;
        }

        .analyze-btn:disabled,
        .suggest-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .back-link {
          padding: 0.75rem 1.5rem;
          background: #f3f4f6;
          color: #374151;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: background 0.2s;
        }

        .back-link:hover {
          background: #e5e7eb;
        }

        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .tab {
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          font-size: 1rem;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab:hover {
          color: #374151;
        }

        .tab.active {
          color: #667eea;
          border-bottom-color: #667eea;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4rem;
          color: #6b7280;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f0f0f0;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .empty-state {
          text-align: center;
          padding: 4rem;
          color: #6b7280;
          background: #f9fafb;
          border-radius: 12px;
        }

        .tab-content {
          animation: fadeIn 0.3s;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .issues-list,
        .suggestions-list,
        .versions-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .issue-card,
        .suggestion-card,
        .version-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .issue-header,
        .suggestion-header,
        .version-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .issue-header h3,
        .suggestion-header h3,
        .version-header h3 {
          margin: 0;
          color: #1f2937;
        }

        .severity-badge,
        .priority-badge,
        .status-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .status-badge.improved {
          background: #10b981;
        }

        .status-badge.worsened {
          background: #ef4444;
        }

        .status-badge.unchanged {
          background: #6b7280;
        }

        .issue-stats {
          display: flex;
          gap: 2rem;
          margin-bottom: 1rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
        }

        .stat-value.negative {
          color: #dc2626;
        }

        .issue-section,
        .suggestion-section {
          margin: 1rem 0;
        }

        .issue-section h4,
        .suggestion-section h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          color: #6b7280;
          text-transform: uppercase;
        }

        .phrases {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .phrase-badge {
          padding: 0.25rem 0.75rem;
          background: #e0e7ff;
          color: #4338ca;
          border-radius: 999px;
          font-size: 0.875rem;
        }

        .comments {
          margin: 0;
          padding-left: 1.5rem;
          color: #374151;
        }

        .comments li {
          margin-bottom: 0.5rem;
        }

        .issue-recommendation {
          margin-top: 1rem;
          padding: 1rem;
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          border-radius: 4px;
        }

        .issue-recommendation strong {
          color: #92400e;
        }

        .issue-recommendation p {
          margin: 0.5rem 0 0 0;
          color: #78350f;
        }

        .issue-type {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: #f3f4f6;
          border-radius: 4px;
          font-size: 0.75rem;
          color: #6b7280;
          margin-left: 0.5rem;
        }

        .current {
          padding: 0.75rem;
          background: #fee2e2;
          border-radius: 6px;
          color: #7f1d1d;
        }

        .suggested {
          padding: 0.75rem;
          background: #d1fae5;
          border-radius: 6px;
          color: #065f46;
        }

        .rationale {
          padding: 0.75rem;
          background: #e0e7ff;
          border-radius: 6px;
          color: #312e81;
        }

        .suggestion-meta {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .related-comments {
          margin-top: 1rem;
        }

        .related-comments summary {
          cursor: pointer;
          color: #667eea;
          font-weight: 600;
        }

        .related-comments ul {
          margin-top: 0.5rem;
          padding-left: 1.5rem;
          color: #374151;
        }

        .version-stats {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 2rem;
          align-items: center;
          margin: 1rem 0;
        }

        .version-col h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .version-data {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.875rem;
          color: #374151;
        }

        .version-arrow {
          font-size: 2rem;
          color: #9ca3af;
        }

        .improvement-metric {
          margin-top: 1rem;
          padding: 0.75rem;
          background: #f0fdf4;
          border-radius: 6px;
          text-align: center;
          color: #065f46;
        }
      `}</style>
    </div>
  );
}
