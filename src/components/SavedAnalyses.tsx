import { useEffect, useState } from "react";
import { MineralData } from "./HTMAInputForm";

interface Analysis {
  id: string;
  mineralData: MineralData;
  insights: string;
  createdAt: string;
}

interface SavedAnalysesProps {
  userId: string;
  onLoadAnalysis: (analysis: Analysis) => void;
  onAnalysesLoaded?: (analyses: Analysis[]) => void;
}

export default function SavedAnalyses({
  userId,
  onLoadAnalysis,
  onAnalysesLoaded,
}: SavedAnalysesProps) {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalyses = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/get-analyses?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setAnalyses(data.analyses);
        // Notify parent component of loaded analyses
        if (onAnalysesLoaded) {
          onAnalysesLoaded(data.analyses);
        }
      } else {
        setError(data.error || "Failed to load analyses");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Error loading analyses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="saved-analyses loading">
        <div className="spinner" />
        <p>Loading your saved analyses...</p>

        <style jsx>{`
          .saved-analyses {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 200px;
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

          p {
            color: #666;
            font-size: 0.9rem;
          }

          @media (prefers-color-scheme: dark) {
            .saved-analyses {
              background: #1a1a1a;
            }

            .spinner {
              border-color: #2a2a2a;
              border-top-color: #667eea;
            }

            p {
              color: #999;
            }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="saved-analyses error">
        <p>❌ {error}</p>
        <button onClick={loadAnalyses}>Try Again</button>

        <style jsx>{`
          .saved-analyses {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
          }

          p {
            color: #ef4444;
            margin-bottom: 1rem;
          }

          button {
            padding: 0.75rem 1.5rem;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
          }

          button:hover {
            background: #5568d3;
          }

          @media (prefers-color-scheme: dark) {
            .saved-analyses {
              background: #1a1a1a;
            }
          }
        `}</style>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="saved-analyses empty">
        <div className="icon">📊</div>
        <h3>No Saved Analyses Yet</h3>
        <p>
          Your analysis results will be automatically saved here for future
          reference.
        </p>

        <style jsx>{`
          .saved-analyses {
            background: white;
            border-radius: 12px;
            padding: 3rem 2rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
          }

          .icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }

          h3 {
            margin: 0 0 0.5rem 0;
            color: #1a1a1a;
            font-size: 1.25rem;
          }

          p {
            margin: 0;
            color: #666;
            font-size: 0.9rem;
          }

          @media (prefers-color-scheme: dark) {
            .saved-analyses {
              background: #1a1a1a;
            }

            h3 {
              color: #ffffff;
            }

            p {
              color: #999;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="saved-analyses">
      <h2>Your Saved Analyses</h2>
      <p className="subtitle">Click any analysis to view details</p>

      <div className="analyses-list">
        {analyses.map((analysis) => (
          <div
            key={analysis.id}
            className="analysis-card"
            onClick={() => onLoadAnalysis(analysis)}
          >
            <div className="card-header">
              <span className="date">{formatDate(analysis.createdAt)}</span>
              <span className="badge">View</span>
            </div>
            <div className="minerals-preview">
              <span>Ca: {analysis.mineralData.calcium}</span>
              <span>Mg: {analysis.mineralData.magnesium}</span>
              <span>Na: {analysis.mineralData.sodium}</span>
              <span>K: {analysis.mineralData.potassium}</span>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .saved-analyses {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        h2 {
          margin: 0 0 0.5rem 0;
          color: #1a1a1a;
          font-size: 1.5rem;
        }

        .subtitle {
          color: #666;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        .analyses-list {
          display: grid;
          gap: 1rem;
        }

        .analysis-card {
          background: #f9fafb;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          padding: 1.25rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .analysis-card:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .date {
          font-weight: 600;
          color: #333;
          font-size: 0.95rem;
        }

        .badge {
          background: #667eea;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .minerals-preview {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .minerals-preview span {
          color: #666;
          font-size: 0.85rem;
          background: white;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
        }

        @media (prefers-color-scheme: dark) {
          .saved-analyses {
            background: #1a1a1a;
          }

          h2 {
            color: #ffffff;
          }

          .subtitle {
            color: #999;
          }

          .analysis-card {
            background: #2a2a2a;
            border-color: #404040;
          }

          .analysis-card:hover {
            border-color: #667eea;
          }

          .date {
            color: #e0e0e0;
          }

          .minerals-preview span {
            color: #999;
            background: #1a1a1a;
            border-color: #404040;
          }
        }
      `}</style>
    </div>
  );
}
