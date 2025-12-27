import { ConfidenceScore } from "../lib/aiConfidenceScoring";
import {
  getConfidenceIcon,
  getConfidenceDescription,
  formatEvidence,
} from "../lib/aiConfidenceScoring";
import { PractitionerAnnotation } from "../lib/reportSnapshot";
import AnnotationBadge from "./AnnotationBadge";

interface AIInsightsProps {
  insights: string;
  isLoading?: boolean;
  confidenceScore?: ConfidenceScore;
  isPractitionerMode?: boolean;
  annotations?: ReadonlyArray<PractitionerAnnotation>;
}

export default function AIInsights({
  insights,
  isLoading = false,
  confidenceScore,
  isPractitionerMode = false,
  annotations = [],
}: AIInsightsProps) {
  if (isLoading) {
    return (
      <div className="ai-insights loading">
        <div className="header">
          <div className="icon">🤖</div>
          <h2>AI Analysis</h2>
        </div>
        <div className="loading-content">
          <div className="spinner" />
          <p>Analyzing your mineral patterns with Gemini AI...</p>
        </div>

        <style jsx>{`
          .ai-insights {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
          }

          .icon {
            font-size: 2rem;
          }

          h2 {
            margin: 0;
            color: #1a1a1a;
            font-size: 1.5rem;
          }

          .loading-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem 0;
            gap: 1rem;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f0f0f0;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          .loading-content p {
            color: #666;
            font-size: 0.9rem;
          }

          @media (prefers-color-scheme: dark) {
            .ai-insights {
              background: #1a1a1a;
            }

            h2 {
              color: #ffffff;
            }

            .spinner {
              border-color: #2a2a2a;
              border-top-color: #667eea;
            }

            .loading-content p {
              color: #999;
            }
          }
        `}</style>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  // Parse insights into sections
  const sections = insights.split("\n\n").filter((s) => s.trim());

  return (
    <div className="ai-insights">
      <div className="header">
        <div className="icon">🤖</div>
        <h2>AI-Powered Insights</h2>
        <div className="badge">Gemini</div>
      </div>

      {/* Confidence Score Display */}
      {confidenceScore && (
        <div className="confidence-banner">
          <div className="confidence-header">
            <span className="confidence-icon">
              {getConfidenceIcon(confidenceScore.level)}
            </span>
            <div className="confidence-info">
              <div className="confidence-level">
                <strong>{confidenceScore.level} Confidence</strong>
                <span className="confidence-score">
                  {confidenceScore.score}%
                </span>
              </div>
              <div className="confidence-desc">
                {getConfidenceDescription(confidenceScore.level)}
              </div>
            </div>
          </div>

          {isPractitionerMode && confidenceScore.evidence.length > 0 && (
            <details className="evidence-details">
              <summary>
                View Evidence ({confidenceScore.evidence.length} markers)
              </summary>
              <ul className="evidence-list">
                {formatEvidence(confidenceScore.evidence).map((ev, idx) => (
                  <li key={idx}>{ev}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {/* Practitioner Annotations for AI Insights */}
      {isPractitionerMode && annotations.length > 0 && (
        <AnnotationBadge annotations={annotations} target="ai_insights" />
      )}

      <div className="insights-content">
        {sections.map((section, index) => {
          // Check if section is a header (starts with ##, ###, or bold **)
          const isHeader = section.startsWith("##") || section.startsWith("**");

          if (isHeader) {
            const headerText = section
              .replace(/^#+\s*/, "")
              .replace(/\*\*/g, "");
            return (
              <h3 key={index} className="section-header">
                {headerText}
              </h3>
            );
          }

          // Check for bullet points
          if (section.includes("- ") || section.includes("• ")) {
            const items = section.split("\n").filter((s) => s.trim());
            return (
              <ul key={index} className="bullet-list">
                {items.map((item, i) => (
                  <li key={i}>{item.replace(/^[-•]\s*/, "")}</li>
                ))}
              </ul>
            );
          }

          return (
            <p key={index} className="insight-text">
              {section}
            </p>
          );
        })}
      </div>

      <style jsx>{`
        .ai-insights {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
          color: white;
        }

        .header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .icon {
          font-size: 2rem;
        }

        h2 {
          margin: 0;
          color: white;
          font-size: 1.5rem;
          flex: 1;
        }

        .badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
        }

        .insights-content {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .section-header {
          margin: 1rem 0 0.5rem 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
          border-bottom: 2px solid rgba(255, 255, 255, 0.3);
          padding-bottom: 0.5rem;
        }

        .insight-text {
          margin: 0;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.95);
          font-size: 0.95rem;
        }

        .bullet-list {
          margin: 0;
          padding-left: 1.5rem;
          list-style-type: disc;
        }

        .bullet-list li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.95);
        }

        /* Confidence Score Styles */
        .confidence-banner {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .confidence-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .confidence-icon {
          font-size: 1.5rem;
        }

        .confidence-info {
          flex: 1;
        }

        .confidence-level {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.25rem;
        }

        .confidence-level strong {
          font-size: 1rem;
          color: white;
        }

        .confidence-score {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .confidence-desc {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.85);
        }

        .evidence-details {
          margin-top: 1rem;
          cursor: pointer;
        }

        .evidence-details summary {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.9);
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          user-select: none;
        }

        .evidence-details summary:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .evidence-list {
          margin: 0.75rem 0 0 0;
          padding-left: 1.5rem;
          list-style-type: circle;
        }

        .evidence-list li {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }

        @media (prefers-color-scheme: dark) {
          .ai-insights {
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
          }
        }
      `}</style>
    </div>
  );
}
