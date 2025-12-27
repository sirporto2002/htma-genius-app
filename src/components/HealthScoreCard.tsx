import { HealthScoreBreakdown } from "../lib/healthScore";
import {
  getScoreColor,
  getInterpretation,
  SHORT_DISCLAIMER,
  HEALTH_SCORE_WEIGHTS,
} from "../lib/healthScoreSemantics";

interface HealthScoreCardProps {
  scoreData: HealthScoreBreakdown;
}

export default function HealthScoreCard({ scoreData }: HealthScoreCardProps) {
  const {
    totalScore,
    mineralScore,
    ratioScore,
    redFlagScore,
    grade,
    statusCounts,
    criticalIssues,
  } = scoreData;
  const scoreColor = getScoreColor(totalScore);
  const interpretation = getInterpretation(totalScore);

  return (
    <div className="health-score-card">
      <div className="score-header">
        <h3>🎯 HTMA Health Score</h3>
        <div className="score-circle" style={{ borderColor: scoreColor }}>
          <div className="score-value" style={{ color: scoreColor }}>
            {totalScore}
          </div>
          <div className="score-grade">Grade: {grade}</div>
        </div>
      </div>

      <div className="score-interpretation">
        <p className="interpretation-text">{interpretation}</p>
        <p className="disclaimer-text">{SHORT_DISCLAIMER}</p>
      </div>

      {/* Score Breakdown */}
      <div className="score-breakdown">
        <h4>Score Breakdown</h4>
        <div className="breakdown-item">
          <div className="breakdown-header">
            <span className="breakdown-label">Mineral Status</span>
            <span className="breakdown-value">
              {mineralScore}/{HEALTH_SCORE_WEIGHTS.MINERAL_WEIGHT * 100}
            </span>
          </div>
          <div className="breakdown-bar">
            <div
              className="breakdown-fill"
              style={{
                width: `${
                  (mineralScore / (HEALTH_SCORE_WEIGHTS.MINERAL_WEIGHT * 100)) *
                  100
                }%`,
                backgroundColor: scoreColor,
              }}
            />
          </div>
          <div className="breakdown-detail">
            {statusCounts.optimal} optimal, {statusCounts.low} low,{" "}
            {statusCounts.high} high
          </div>
        </div>

        <div className="breakdown-item">
          <div className="breakdown-header">
            <span className="breakdown-label">Critical Ratios</span>
            <span className="breakdown-value">
              {ratioScore}/{HEALTH_SCORE_WEIGHTS.RATIO_WEIGHT * 100}
            </span>
          </div>
          <div className="breakdown-bar">
            <div
              className="breakdown-fill"
              style={{
                width: `${
                  (ratioScore / (HEALTH_SCORE_WEIGHTS.RATIO_WEIGHT * 100)) * 100
                }%`,
                backgroundColor: scoreColor,
              }}
            />
          </div>
        </div>

        <div className="breakdown-item">
          <div className="breakdown-header">
            <span className="breakdown-label">Red Flags</span>
            <span className="breakdown-value">
              {redFlagScore}/{HEALTH_SCORE_WEIGHTS.RED_FLAG_WEIGHT * 100}
            </span>
          </div>
          <div className="breakdown-bar">
            <div
              className="breakdown-fill"
              style={{
                width: `${
                  (redFlagScore /
                    (HEALTH_SCORE_WEIGHTS.RED_FLAG_WEIGHT * 100)) *
                  100
                }%`,
                backgroundColor: scoreColor,
              }}
            />
          </div>
        </div>
      </div>

      {/* Critical Issues */}
      {criticalIssues.length > 0 && (
        <div className="critical-issues">
          <h4>⚠️ Critical Issues</h4>
          <ul>
            {criticalIssues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        .health-score-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 2rem;
          color: white;
          margin-bottom: 2rem;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
        }

        .score-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .score-header h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .score-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 6px solid;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .score-value {
          font-size: 3rem;
          font-weight: 900;
          line-height: 1;
        }

        .score-grade {
          font-size: 0.85rem;
          opacity: 0.9;
          margin-top: 0.25rem;
        }

        .score-interpretation {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
        }

        .score-interpretation .interpretation-text {
          margin: 0 0 0.75rem 0;
          font-size: 1rem;
          line-height: 1.5;
        }

        .score-interpretation .disclaimer-text {
          margin: 0;
          font-size: 0.75rem;
          opacity: 0.8;
          font-style: italic;
          line-height: 1.4;
        }

        .score-breakdown {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .score-breakdown h4 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .breakdown-item {
          margin-bottom: 1.25rem;
        }

        .breakdown-item:last-child {
          margin-bottom: 0;
        }

        .breakdown-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .breakdown-label {
          font-weight: 500;
        }

        .breakdown-value {
          font-weight: 700;
        }

        .breakdown-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }

        .breakdown-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .breakdown-detail {
          margin-top: 0.5rem;
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .critical-issues {
          background: rgba(239, 68, 68, 0.2);
          border: 2px solid rgba(239, 68, 68, 0.5);
          border-radius: 12px;
          padding: 1rem 1.25rem;
        }

        .critical-issues h4 {
          margin: 0 0 0.75rem 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .critical-issues ul {
          margin: 0;
          padding-left: 1.5rem;
          list-style-type: disc;
        }

        .critical-issues li {
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .critical-issues li:last-child {
          margin-bottom: 0;
        }

        @media (max-width: 768px) {
          .health-score-card {
            padding: 1.5rem;
          }

          .score-header {
            flex-direction: column;
            gap: 1.5rem;
            text-align: center;
          }

          .score-circle {
            width: 100px;
            height: 100px;
          }

          .score-value {
            font-size: 2.5rem;
          }
        }

        @media (prefers-color-scheme: dark) {
          .health-score-card {
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
          }
        }
      `}</style>
    </div>
  );
}
