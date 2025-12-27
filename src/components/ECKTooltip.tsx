import { ReactNode, useState } from "react";

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export default function ECKTooltip({
  content,
  children,
  position = "top",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="eck-tooltip-wrapper"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`eck-tooltip eck-tooltip-${position}`}>
          <div className="tooltip-content">{content}</div>
          <div className="tooltip-arrow" />
        </div>
      )}

      <style jsx>{`
        .eck-tooltip-wrapper {
          position: relative;
          display: inline-block;
        }

        .eck-tooltip {
          position: absolute;
          z-index: 10000;
          background: #2a2520;
          color: #f8f0e5;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          line-height: 1.5;
          max-width: 300px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border: 1px solid #4a4338;
          white-space: normal;
          animation: tooltipFadeIn 0.2s ease-out;
        }

        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .eck-tooltip-top {
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
        }

        .eck-tooltip-bottom {
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
        }

        .eck-tooltip-left {
          right: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%);
        }

        .eck-tooltip-right {
          left: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%);
        }

        .tooltip-content {
          position: relative;
        }

        .tooltip-arrow {
          position: absolute;
          width: 0;
          height: 0;
          border-style: solid;
        }

        .eck-tooltip-top .tooltip-arrow {
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 6px 6px 0 6px;
          border-color: #2a2520 transparent transparent transparent;
        }

        .eck-tooltip-bottom .tooltip-arrow {
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 0 6px 6px 6px;
          border-color: transparent transparent #2a2520 transparent;
        }

        .eck-tooltip-left .tooltip-arrow {
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          border-width: 6px 0 6px 6px;
          border-color: transparent transparent transparent #2a2520;
        }

        .eck-tooltip-right .tooltip-arrow {
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          border-width: 6px 6px 6px 0;
          border-color: transparent #2a2520 transparent transparent;
        }

        @media (max-width: 768px) {
          .eck-tooltip {
            max-width: 250px;
            font-size: 0.8rem;
            padding: 0.6rem 0.8rem;
          }
        }

        @media (prefers-color-scheme: light) {
          .eck-tooltip {
            background: white;
            color: #2a2520;
            border-color: #e8dcc8;
            box-shadow: 0 4px 12px rgba(90, 74, 58, 0.15);
          }

          .eck-tooltip-top .tooltip-arrow {
            border-color: white transparent transparent transparent;
          }

          .eck-tooltip-bottom .tooltip-arrow {
            border-color: transparent transparent white transparent;
          }

          .eck-tooltip-left .tooltip-arrow {
            border-color: transparent transparent transparent white;
          }

          .eck-tooltip-right .tooltip-arrow {
            border-color: transparent white transparent transparent;
          }
        }
      `}</style>
    </div>
  );
}
