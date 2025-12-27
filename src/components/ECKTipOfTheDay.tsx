import { useState, useEffect } from "react";
import {
  getRandomECKPrinciple,
  ECKPrinciple,
} from "../lib/eckInterpretationPrinciples";

interface ECKTipOfTheDayProps {
  onDismiss?: () => void;
}

export default function ECKTipOfTheDay({ onDismiss }: ECKTipOfTheDayProps) {
  const [tip, setTip] = useState<ECKPrinciple | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if tip was already shown today
    const lastShown = localStorage.getItem("eckTipLastShown");
    const today = new Date().toDateString();

    if (lastShown !== today) {
      // Show new tip
      const newTip = getRandomECKPrinciple();
      setTip(newTip);
      localStorage.setItem("eckTipLastShown", today);
    } else {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleNewTip = () => {
    const newTip = getRandomECKPrinciple();
    setTip(newTip);
  };

  if (!isVisible || !tip) {
    return null;
  }

  return (
    <div className="eck-tip-container">
      <div className="eck-tip-card">
        <div className="eck-tip-header">
          <div className="header-left">
            <span className="tip-icon">💡</span>
            <h3>HTMA Principle of the Day</h3>
          </div>
          <button
            className="dismiss-btn"
            onClick={handleDismiss}
            aria-label="Dismiss tip"
          >
            ✕
          </button>
        </div>

        <div className="eck-tip-content">
          <h4 className="tip-title">{tip.title}</h4>
          <p className="tip-principle">{tip.principle}</p>
          {tip.category && (
            <span className="tip-category">
              {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}
            </span>
          )}
        </div>

        <div className="eck-tip-footer">
          <button className="new-tip-btn" onClick={handleNewTip}>
            Show Another Principle
          </button>
          <span className="tip-attribution">— Dr. Paul Eck</span>
        </div>
      </div>

      <style jsx>{`
        .eck-tip-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          max-width: 400px;
          animation: slideInUp 0.5s ease-out;
        }

        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .eck-tip-card {
          background: linear-gradient(135deg, #f8f0e5 0%, #fef9f4 100%);
          border: 2px solid #e8dcc8;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(90, 74, 58, 0.2);
          overflow: hidden;
        }

        .eck-tip-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          background: linear-gradient(135deg, #8a7a6a 0%, #6a5a4a 100%);
          border-bottom: 1px solid #e8dcc8;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .tip-icon {
          font-size: 1.5rem;
        }

        h3 {
          margin: 0;
          color: white;
          font-size: 1rem;
          font-weight: 600;
        }

        .dismiss-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .dismiss-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .eck-tip-content {
          padding: 1.25rem;
        }

        .tip-title {
          margin: 0 0 0.75rem 0;
          color: #5a4a3a;
          font-size: 1rem;
          font-weight: 700;
          line-height: 1.4;
        }

        .tip-principle {
          margin: 0 0 1rem 0;
          color: #6a5a4a;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .tip-category {
          display: inline-block;
          background: rgba(138, 122, 106, 0.15);
          color: #8a7a6a;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .eck-tip-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1.25rem;
          background: rgba(138, 122, 106, 0.08);
          border-top: 1px solid #e8dcc8;
        }

        .new-tip-btn {
          background: linear-gradient(135deg, #8a7a6a 0%, #6a5a4a 100%);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .new-tip-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(90, 74, 58, 0.3);
        }

        .new-tip-btn:active {
          transform: translateY(0);
        }

        .tip-attribution {
          font-size: 0.85rem;
          color: #8a7a6a;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .eck-tip-container {
            bottom: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
          }

          .eck-tip-header {
            padding: 0.75rem 1rem;
          }

          h3 {
            font-size: 0.9rem;
          }

          .eck-tip-content {
            padding: 1rem;
          }

          .tip-title {
            font-size: 0.95rem;
          }

          .tip-principle {
            font-size: 0.85rem;
          }
        }

        @media (prefers-color-scheme: dark) {
          .eck-tip-card {
            background: linear-gradient(135deg, #2a2520 0%, #332e28 100%);
            border-color: #4a4338;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          }

          .eck-tip-header {
            background: linear-gradient(135deg, #3a3530 0%, #433d35 100%);
            border-bottom-color: #4a4338;
          }

          .tip-title {
            color: #e8dcc8;
          }

          .tip-principle {
            color: #c8bcb0;
          }

          .tip-category {
            background: rgba(232, 220, 200, 0.15);
            color: #d8ccc8;
          }

          .eck-tip-footer {
            background: rgba(232, 220, 200, 0.05);
            border-top-color: #4a4338;
          }

          .tip-attribution {
            color: #b8a898;
          }
        }
      `}</style>
    </div>
  );
}
