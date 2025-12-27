interface AISourceBadgeProps {
  usingChromeAI: boolean;
  model?: string;
}

export default function AISourceBadge({
  usingChromeAI,
  model,
}: AISourceBadgeProps) {
  return (
    <div className={`ai-source-badge ${usingChromeAI ? "chrome" : "cloud"}`}>
      <span className="icon">{usingChromeAI ? "🔒" : "☁️"}</span>
      <span className="text">
        {usingChromeAI ? "Private On-Device AI" : "Cloud AI"}
      </span>
      {model && <span className="model">{model}</span>}

      <style jsx>{`
        .ai-source-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.875rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1.5px solid;
          margin-bottom: 1rem;
        }

        .ai-source-badge.chrome {
          background: linear-gradient(135deg, #e6f4ea 0%, #d4edda 100%);
          color: #137333;
          border-color: #81c995;
        }

        .ai-source-badge.cloud {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          color: #1565c0;
          border-color: #64b5f6;
        }

        .icon {
          font-size: 1rem;
        }

        .model {
          opacity: 0.7;
          font-weight: 400;
          margin-left: 0.25rem;
        }

        @media (max-width: 768px) {
          .ai-source-badge {
            font-size: 0.7rem;
            padding: 0.4rem 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
