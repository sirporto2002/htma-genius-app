import { useState, useEffect } from "react";
import { chromeAI } from "../lib/chromeAI";

interface ChromeAIStatusProps {
  onPreferenceChange?: (preferChromeAI: boolean) => void;
}

export default function ChromeAIStatus({
  onPreferenceChange,
}: ChromeAIStatusProps) {
  const [status, setStatus] = useState<{
    available: boolean;
    status: "readily" | "after-download" | "no" | "unsupported" | "checking";
    message: string;
  }>({
    available: false,
    status: "checking",
    message: "Checking Chrome AI availability...",
  });

  const [userPreference, setUserPreference] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("preferChromeAI");
      return saved !== null ? saved === "true" : true; // Default to true
    }
    return true;
  });

  useEffect(() => {
    chromeAI.getStatus().then((result) => {
      setStatus(result);
    });
  }, []);

  const handleToggle = () => {
    const newPreference = !userPreference;
    setUserPreference(newPreference);
    localStorage.setItem("preferChromeAI", String(newPreference));
    onPreferenceChange?.(newPreference);
  };

  if (status.status === "checking") {
    return null;
  }

  return (
    <div className={`chrome-ai-status ${status.status}`}>
      <div className="status-content">
        <div className="status-info">
          {status.status === "readily" && (
            <>
              <span className="icon">🔒</span>
              <div className="text">
                <strong>Chrome AI Available</strong>
                <p>
                  Private, on-device analysis • Zero API costs • Instant results
                </p>
              </div>
            </>
          )}
          {status.status === "after-download" && (
            <>
              <span className="icon">⏳</span>
              <div className="text">
                <strong>Chrome AI Downloading...</strong>
                <p>Model is being downloaded. This may take a few minutes.</p>
              </div>
            </>
          )}
          {(status.status === "no" || status.status === "unsupported") && (
            <>
              <span className="icon">ℹ️</span>
              <div className="text">
                <strong>Chrome AI Not Available</strong>
                <p>Using cloud AI. Enable Chrome AI for private analysis.</p>
              </div>
              <a
                href="chrome://flags/#optimization-guide-on-device-model"
                target="_blank"
                rel="noopener noreferrer"
                className="enable-link"
              >
                Enable Chrome AI
              </a>
            </>
          )}
        </div>

        {status.available && (
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={userPreference}
              onChange={handleToggle}
            />
            <span className="slider"></span>
            <span className="label-text">
              {userPreference ? "Using Chrome AI" : "Using Cloud AI"}
            </span>
          </label>
        )}
      </div>

      <style jsx>{`
        .chrome-ai-status {
          display: flex;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
          border: 2px solid;
          transition: all 0.3s ease;
        }

        .status-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 1rem;
        }

        .status-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .text {
          flex: 1;
        }

        .text strong {
          display: block;
          margin-bottom: 0.25rem;
          font-weight: 600;
        }

        .text p {
          margin: 0;
          opacity: 0.8;
          font-size: 0.8rem;
        }

        .chrome-ai-status.readily {
          background: linear-gradient(135deg, #e6f4ea 0%, #d4edda 100%);
          color: #137333;
          border-color: #81c995;
        }

        .chrome-ai-status.after-download {
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          color: #856404;
          border-color: #ffc107;
        }

        .chrome-ai-status.no,
        .chrome-ai-status.unsupported {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          color: #495057;
          border-color: #dee2e6;
        }

        .enable-link {
          color: inherit;
          text-decoration: none;
          padding: 0.5rem 1rem;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 6px;
          font-weight: 600;
          transition: background 0.2s;
          white-space: nowrap;
        }

        .enable-link:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        .toggle-switch {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          user-select: none;
        }

        .toggle-switch input {
          display: none;
        }

        .slider {
          position: relative;
          width: 48px;
          height: 24px;
          background: #ccc;
          border-radius: 24px;
          transition: background 0.3s;
        }

        .slider::before {
          content: "";
          position: absolute;
          width: 18px;
          height: 18px;
          left: 3px;
          top: 3px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s;
        }

        .toggle-switch input:checked + .slider {
          background: #137333;
        }

        .toggle-switch input:checked + .slider::before {
          transform: translateX(24px);
        }

        .label-text {
          font-weight: 600;
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .chrome-ai-status {
            padding: 0.875rem 1rem;
          }

          .status-content {
            flex-direction: column;
            align-items: stretch;
          }

          .toggle-switch {
            justify-content: space-between;
            padding-top: 0.75rem;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
          }
        }
      `}</style>
    </div>
  );
}
