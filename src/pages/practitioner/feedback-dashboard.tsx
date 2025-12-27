import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { usePractitionerMode } from "../../hooks/usePractitionerMode";
import { useRouter } from "next/router";

interface FeedbackMetrics {
  total: number;
  positive: number;
  negative: number;
  positivePercent: number;
  negativePercent: number;
}

interface ContextMetrics {
  positive: number;
  negative: number;
  total: number;
  positivePercent: number;
  negativePercent: number;
}

interface FeedbackComment {
  id: string;
  context: string;
  sentiment: string;
  comment: string;
  analysisId: string;
  metadata: {
    timestamp: string;
    guardrailsVersion: string;
    semanticsVersion: string;
  };
}

export default function FeedbackDashboard() {
  const { user } = useAuth();
  const { isPractitionerMode } = usePractitionerMode();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<FeedbackMetrics | null>(null);
  const [byContext, setByContext] = useState<Record<string, ContextMetrics>>(
    {}
  );
  const [byGuardrailsVersion, setByGuardrailsVersion] = useState<
    Record<string, any>
  >({});
  const [recentComments, setRecentComments] = useState<FeedbackComment[]>([]);
  const [selectedContext, setSelectedContext] = useState<string>("all");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">(
    "30d"
  );

  // Redirect if not practitioner
  useEffect(() => {
    if (!isPractitionerMode) {
      router.push("/");
    }
  }, [isPractitionerMode, router]);

  const loadFeedback = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Calculate date range
      let startDate: string | undefined;
      const now = new Date();
      if (dateRange === "7d") {
        startDate = new Date(
          now.getTime() - 7 * 24 * 60 * 60 * 1000
        ).toISOString();
      } else if (dateRange === "30d") {
        startDate = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000
        ).toISOString();
      } else if (dateRange === "90d") {
        startDate = new Date(
          now.getTime() - 90 * 24 * 60 * 60 * 1000
        ).toISOString();
      }

      const params = new URLSearchParams({
        userId: user.uid,
        context: selectedContext,
      });
      if (startDate) {
        params.append("startDate", startDate);
      }

      const response = await fetch(`/api/get-feedback?${params}`);
      const data = await response.json();

      if (response.ok) {
        setMetrics(data.metrics);
        setByContext(data.byContext);
        setByGuardrailsVersion(data.byGuardrailsVersion);
        setRecentComments(data.recentComments);
      }
    } catch (error) {
      console.error("Failed to load feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isPractitionerMode) {
      loadFeedback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isPractitionerMode, selectedContext, dateRange]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getContextLabel = (context: string) => {
    const labels: Record<string, string> = {
      health_score: "Health Score",
      score_delta: "Score Delta",
      focus_summary: "Focus Summary",
      pdf_report: "PDF Report",
    };
    return labels[context] || context;
  };

  if (!isPractitionerMode) {
    return null;
  }

  return (
    <div className="feedback-dashboard">
      <div className="dashboard-header">
        <h1>📊 Practitioner Feedback Dashboard</h1>
        <p className="subtitle">
          Clinical feedback on guardrails, explanations, and reports
        </p>

        <div className="controls">
          <div className="filter-group">
            <label>Date Range:</label>
            <select
              value={dateRange}
              onChange={(e) =>
                setDateRange(e.target.value as "7d" | "30d" | "90d" | "all")
              }
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Context:</label>
            <select
              value={selectedContext}
              onChange={(e) => setSelectedContext(e.target.value)}
            >
              <option value="all">All contexts</option>
              <option value="health_score">Health Score</option>
              <option value="score_delta">Score Delta</option>
              <option value="focus_summary">Focus Summary</option>
              <option value="pdf_report">PDF Report</option>
            </select>
          </div>

          <button onClick={loadFeedback} className="refresh-btn">
            🔄 Refresh
          </button>

          <a href="/practitioner/guardrails-review" className="review-link">
            🛡️ Review Guardrails
          </a>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading feedback data...</p>
        </div>
      ) : (
        <>
          {/* Overall Metrics */}
          <div className="metrics-grid">
            <div className="metric-card total">
              <div className="metric-value">{metrics?.total || 0}</div>
              <div className="metric-label">Total Feedback</div>
            </div>
            <div className="metric-card positive">
              <div className="metric-value">
                {metrics?.positive || 0} ({metrics?.positivePercent || 0}%)
              </div>
              <div className="metric-label">👍 Makes Sense</div>
            </div>
            <div className="metric-card negative">
              <div className="metric-value">
                {metrics?.negative || 0} ({metrics?.negativePercent || 0}%)
              </div>
              <div className="metric-label">👎 Feels Off</div>
            </div>
          </div>

          {/* By Context Breakdown */}
          <div className="section">
            <h2>Feedback by Context</h2>
            <div className="context-grid">
              {Object.entries(byContext).map(([context, data]) => (
                <div key={context} className="context-card">
                  <h3>{getContextLabel(context)}</h3>
                  <div className="context-stats">
                    <div className="stat-row">
                      <span>Total:</span>
                      <strong>{data.total}</strong>
                    </div>
                    <div className="stat-row positive">
                      <span>👍 Positive:</span>
                      <strong>
                        {data.positive} ({data.positivePercent}%)
                      </strong>
                    </div>
                    <div className="stat-row negative">
                      <span>👎 Negative:</span>
                      <strong>
                        {data.negative} ({data.negativePercent}%)
                      </strong>
                    </div>
                  </div>
                  {data.total > 0 && (
                    <div className="progress-bar">
                      <div
                        className="progress-positive"
                        style={{ width: `${data.positivePercent}%` }}
                      />
                      <div
                        className="progress-negative"
                        style={{ width: `${data.negativePercent}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Guardrails Version Analysis */}
          {Object.keys(byGuardrailsVersion).length > 0 && (
            <div className="section">
              <h2>By Guardrails Version</h2>
              <div className="version-grid">
                {Object.entries(byGuardrailsVersion).map(
                  ([version, data]: [string, any]) => (
                    <div key={version} className="version-card">
                      <div className="version-header">
                        <span className="version-label">v{version}</span>
                        <span className="version-total">
                          {data.total} items
                        </span>
                      </div>
                      <div className="version-sentiment">
                        <span className="positive">👍 {data.positive}</span>
                        <span className="negative">
                          👎 {data.negative} ({data.negativePercent}%)
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Recent Comments */}
          <div className="section">
            <h2>Recent Comments</h2>
            {recentComments.length === 0 ? (
              <p className="empty-state">No comments yet</p>
            ) : (
              <div className="comments-list">
                {recentComments.map((item) => (
                  <div
                    key={item.id}
                    className={`comment-card ${item.sentiment}`}
                  >
                    <div className="comment-header">
                      <span className="context-badge">
                        {getContextLabel(item.context)}
                      </span>
                      <span className={`sentiment-badge ${item.sentiment}`}>
                        {item.sentiment === "positive" ? "👍" : "👎"}
                      </span>
                      <span className="timestamp">
                        {formatDate(item.metadata.timestamp)}
                      </span>
                    </div>
                    <p className="comment-text">{item.comment}</p>
                    <div className="comment-meta">
                      <span>
                        Guardrails: v{item.metadata.guardrailsVersion}
                      </span>
                      <span>Semantics: v{item.metadata.semanticsVersion}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        .feedback-dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .dashboard-header {
          margin-bottom: 2rem;
        }

        .dashboard-header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
          color: #1f2937;
        }

        .subtitle {
          color: #6b7280;
          margin: 0 0 1.5rem 0;
        }

        .controls {
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
          color: #4b5563;
        }

        .filter-group select {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .refresh-btn {
          padding: 0.5rem 1rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .refresh-btn:hover {
          background: #5568d3;
        }

        .review-link {
          padding: 0.5rem 1rem;
          background: #f59e0b;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          transition: background 0.2s;
        }

        .review-link:hover {
          background: #d97706;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
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
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .metric-card.total {
          border-left: 4px solid #667eea;
        }

        .metric-card.positive {
          border-left: 4px solid #10b981;
        }

        .metric-card.negative {
          border-left: 4px solid #ef4444;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .metric-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .section {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .section h2 {
          margin: 0 0 1.5rem 0;
          font-size: 1.25rem;
          color: #1f2937;
        }

        .context-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        .context-card {
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .context-card h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          color: #374151;
        }

        .context-stats {
          margin-bottom: 1rem;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .stat-row.positive {
          color: #059669;
        }

        .stat-row.negative {
          color: #dc2626;
        }

        .progress-bar {
          display: flex;
          height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-positive {
          background: #10b981;
        }

        .progress-negative {
          background: #ef4444;
        }

        .version-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .version-card {
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .version-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .version-label {
          font-weight: 600;
          color: #374151;
        }

        .version-total {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .version-sentiment {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .version-sentiment .positive {
          color: #059669;
        }

        .version-sentiment .negative {
          color: #dc2626;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .comment-card {
          padding: 1rem;
          border-left: 4px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 4px;
        }

        .comment-card.negative {
          border-left-color: #ef4444;
          background: #fef2f2;
        }

        .comment-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }

        .context-badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          background: #667eea;
          color: white;
          border-radius: 4px;
        }

        .sentiment-badge {
          font-size: 0.875rem;
        }

        .timestamp {
          font-size: 0.75rem;
          color: #6b7280;
          margin-left: auto;
        }

        .comment-text {
          margin: 0 0 0.75rem 0;
          color: #374151;
          line-height: 1.5;
        }

        .comment-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .empty-state {
          text-align: center;
          color: #6b7280;
          padding: 2rem;
        }
      `}</style>
    </div>
  );
}
