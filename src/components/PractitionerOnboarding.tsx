import { useState } from "react";
import {
  getECKNineRulesForUI,
  ECK_UI_ATTRIBUTION,
} from "../lib/eckInterpretationPrinciples";

interface PractitionerOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function PractitionerOnboarding({
  onComplete,
  onSkip,
}: PractitionerOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const eckRules = getECKNineRulesForUI();

  const steps = [
    {
      title: "Welcome to Practitioner Mode",
      icon: "⚕️",
      content: (
        <div>
          <p>
            Practitioner Mode unlocks advanced features designed for healthcare
            professionals working with Hair Tissue Mineral Analysis (HTMA).
          </p>
          <h4>What You&apos;ll Get:</h4>
          <ul>
            <li>
              <strong>TEI Laboratory Standards</strong> - Reference ranges and
              quality procedures from Trace Elements Inc.
            </li>
            <li>
              <strong>ECK Interpretation Framework</strong> - Dr. Paul
              Eck&apos;s foundational HTMA principles
            </li>
            <li>
              <strong>Evidence-Based Confidence Scoring</strong> - Transparent
              AI reliability indicators
            </li>
            <li>
              <strong>Advanced Analytics</strong> - Ratio deltas, oxidation
              changes, pattern analysis
            </li>
            <li>
              <strong>Clinical Context</strong> - Educational panels,
              disclaimers, and validation tools
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "TEI Laboratory Standards",
      icon: "🔬",
      content: (
        <div>
          <p>
            <strong>Trace Elements Inc. (TEI)</strong> is a leading HTMA
            laboratory that has established industry-standard reference ranges
            and quality procedures.
          </p>
          <div className="framework-section">
            <h4>What TEI Provides:</h4>
            <p>
              Trace Elements Inc. provides industry-standard laboratory
              procedures, reference ranges, and quality control protocols for
              HTMA testing. Their standards ensure consistency and reliability
              across mineral measurements, toxic element detection, and ratio
              interpretations.
            </p>
            <p className="note">
              <strong>Note:</strong> TEI principles are used for educational
              context and laboratory disclaimers. They inform reference ranges
              but do not drive AI interpretations.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "ECK Interpretation Framework",
      icon: "🧭",
      content: (
        <div>
          <h4>{eckRules.header.title}</h4>
          <p className="subtitle">{eckRules.header.subtitle}</p>
          <p>{eckRules.header.description}</p>

          <div className="framework-section">
            <h4>Core Principles (Sample):</h4>
            <div className="principles-preview">
              {eckRules.rules.slice(0, 3).map((rule) => (
                <div key={rule.number} className="principle-item">
                  <span className="principle-number">{rule.number}</span>
                  <div>
                    <strong>{rule.title}</strong>
                    <p>{rule.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="note">
              {eckRules.rules.length - 3} more principles available in
              Practitioner Panel
            </p>
          </div>

          <p className="attribution">{ECK_UI_ATTRIBUTION}</p>
        </div>
      ),
    },
    {
      title: "How to Use These Frameworks",
      icon: "📚",
      content: (
        <div>
          <h4>Dual-Source Credibility</h4>
          <p>
            HTMA Genius integrates both TEI and ECK frameworks to provide
            comprehensive educational context:
          </p>

          <div className="usage-grid">
            <div className="usage-item">
              <h5>TEI Standards</h5>
              <ul>
                <li>Laboratory quality procedures</li>
                <li>Reference range validation</li>
                <li>Toxic element disclaimers</li>
                <li>Industry best practices</li>
              </ul>
            </div>

            <div className="usage-item">
              <h5>ECK Principles</h5>
              <ul>
                <li>Mineral relationship patterns</li>
                <li>Ratio interpretation context</li>
                <li>Oxidation type framework</li>
                <li>Clinical reasoning foundation</li>
              </ul>
            </div>
          </div>

          <div className="important-note">
            <strong>⚠️ Important:</strong>
            <p>
              Both frameworks are for <em>educational context only</em>. They
              inform your clinical reasoning but do not replace professional
              judgment or constitute medical advice.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "You're All Set!",
      icon: "✅",
      content: (
        <div>
          <h4>Practitioner Mode Features Unlocked</h4>
          <p>
            You now have access to all advanced features. Look for these
            throughout the app:
          </p>

          <div className="features-checklist">
            <div className="feature-item">
              <span className="checkmark">✓</span>
              <div>
                <strong>Practitioner Validation Panel</strong>
                <p>Reference ranges, ratios, and ECK principles</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="checkmark">✓</span>
              <div>
                <strong>Evidence-Based Confidence</strong>
                <p>See what supports each AI insight</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="checkmark">✓</span>
              <div>
                <strong>Pattern Change Detection</strong>
                <p>Track oxidation shifts and ratio deltas</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="checkmark">✓</span>
              <div>
                <strong>Educational Tooltips</strong>
                <p>Hover over elements for ECK/TEI context</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="checkmark">✓</span>
              <div>
                <strong>Tip of the Day</strong>
                <p>Daily HTMA principle reminders</p>
              </div>
            </div>
          </div>

          <p className="final-note">
            Ready to explore? Click &quot;Complete Onboarding&quot; to start
            analyzing!
          </p>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      localStorage.setItem("practitionerOnboardingComplete", "true");
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("practitionerOnboardingComplete", "true");
    onSkip();
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <div className="onboarding-header">
          <div className="header-content">
            <span className="step-icon">{currentStepData.icon}</span>
            <div>
              <h2>{currentStepData.title}</h2>
              <div className="step-indicator">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>
          </div>
          <button className="skip-btn" onClick={handleSkip}>
            Skip Tour
          </button>
        </div>

        <div className="onboarding-content">{currentStepData.content}</div>

        <div className="onboarding-footer">
          <div className="progress-dots">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${
                  index === currentStep ? "active" : ""
                } ${index < currentStep ? "completed" : ""}`}
              />
            ))}
          </div>

          <div className="footer-buttons">
            {!isFirstStep && (
              <button className="back-btn" onClick={handleBack}>
                ← Back
              </button>
            )}
            <button className="next-btn" onClick={handleNext}>
              {isLastStep ? "Complete Onboarding" : "Next →"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .onboarding-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: overlayFadeIn 0.3s ease-out;
        }

        @keyframes overlayFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .onboarding-modal {
          background: white;
          border-radius: 16px;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          animation: modalSlideIn 0.4s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .onboarding-header {
          padding: 1.5rem 2rem;
          border-bottom: 2px solid #e8dcc8;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: linear-gradient(135deg, #f8f0e5 0%, #fef9f4 100%);
          border-radius: 16px 16px 0 0;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .step-icon {
          font-size: 2.5rem;
          line-height: 1;
        }

        h2 {
          margin: 0 0 0.25rem 0;
          font-size: 1.5rem;
          color: #2a2520;
          font-weight: 700;
        }

        .step-indicator {
          font-size: 0.85rem;
          color: #8a7a6a;
          font-weight: 500;
        }

        .skip-btn {
          background: transparent;
          border: 1px solid #d4c5b0;
          color: #8a7a6a;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .skip-btn:hover {
          background: rgba(138, 122, 106, 0.1);
          border-color: #8a7a6a;
        }

        .onboarding-content {
          padding: 2rem;
          overflow-y: auto;
          flex: 1;
        }

        .onboarding-content p {
          margin: 0 0 1rem 0;
          line-height: 1.6;
          color: #4a4338;
        }

        .onboarding-content h4 {
          margin: 1.5rem 0 0.75rem 0;
          color: #2a2520;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .onboarding-content ul {
          margin: 0.5rem 0 1rem 0;
          padding-left: 1.5rem;
        }

        .onboarding-content li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
          color: #4a4338;
        }

        .onboarding-content strong {
          color: #2a2520;
        }

        .subtitle {
          font-style: italic;
          color: #8a7a6a;
          margin-bottom: 0.5rem !important;
        }

        .framework-section {
          background: #f8f0e5;
          border-left: 4px solid #8a7a6a;
          padding: 1rem 1.25rem;
          border-radius: 4px;
          margin: 1.5rem 0;
        }

        .principles-preview {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin: 1rem 0;
        }

        .principle-item {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .principle-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: #8a7a6a;
          color: white;
          border-radius: 50%;
          font-weight: 700;
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .principle-item p {
          margin: 0.25rem 0 0 0;
          font-size: 0.9rem;
        }

        .usage-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin: 1.5rem 0;
        }

        .usage-item {
          background: #f8f0e5;
          padding: 1.25rem;
          border-radius: 8px;
          border: 1px solid #e8dcc8;
        }

        .usage-item h5 {
          margin: 0 0 0.75rem 0;
          color: #2a2520;
          font-size: 1rem;
          font-weight: 700;
        }

        .usage-item ul {
          margin: 0;
          padding-left: 1.25rem;
        }

        .usage-item li {
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .important-note {
          background: #fff8f0;
          border: 2px solid #d4a574;
          border-radius: 8px;
          padding: 1rem 1.25rem;
          margin: 1.5rem 0;
        }

        .important-note strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #8a5a3a;
        }

        .important-note p {
          margin: 0;
          color: #5a4a3a;
        }

        .important-note em {
          font-weight: 600;
          font-style: normal;
          color: #8a5a3a;
        }

        .features-checklist {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .feature-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          background: #f8f0e5;
          padding: 1rem;
          border-radius: 8px;
        }

        .checkmark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #28a745;
          color: white;
          border-radius: 50%;
          font-weight: 700;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .feature-item strong {
          display: block;
          margin-bottom: 0.25rem;
          color: #2a2520;
          font-size: 0.95rem;
        }

        .feature-item p {
          margin: 0;
          font-size: 0.85rem;
          color: #6a5a4a;
        }

        .note {
          font-size: 0.85rem !important;
          color: #8a7a6a !important;
          font-style: italic;
        }

        .attribution {
          font-size: 0.85rem !important;
          color: #8a7a6a !important;
          font-style: italic;
          text-align: center;
          margin-top: 1.5rem !important;
        }

        .final-note {
          text-align: center;
          font-size: 1rem !important;
          color: #2a2520 !important;
          font-weight: 600;
          margin-top: 1.5rem !important;
        }

        .onboarding-footer {
          padding: 1.5rem 2rem;
          border-top: 2px solid #e8dcc8;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fafafa;
          border-radius: 0 0 16px 16px;
        }

        .progress-dots {
          display: flex;
          gap: 0.5rem;
        }

        .progress-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #d4c5b0;
          transition: all 0.3s;
        }

        .progress-dot.active {
          background: #8a7a6a;
          transform: scale(1.3);
        }

        .progress-dot.completed {
          background: #28a745;
        }

        .footer-buttons {
          display: flex;
          gap: 1rem;
        }

        .back-btn,
        .next-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .back-btn {
          background: transparent;
          color: #8a7a6a;
          border: 1px solid #d4c5b0;
        }

        .back-btn:hover {
          background: rgba(138, 122, 106, 0.1);
          border-color: #8a7a6a;
        }

        .next-btn {
          background: linear-gradient(135deg, #8a7a6a 0%, #6a5a4a 100%);
          color: white;
        }

        .next-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(90, 74, 58, 0.3);
        }

        .next-btn:active {
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .onboarding-modal {
            max-height: 95vh;
          }

          .onboarding-header {
            padding: 1rem 1.25rem;
          }

          .step-icon {
            font-size: 2rem;
          }

          h2 {
            font-size: 1.25rem;
          }

          .onboarding-content {
            padding: 1.25rem;
          }

          .usage-grid {
            grid-template-columns: 1fr;
          }

          .onboarding-footer {
            padding: 1rem 1.25rem;
            flex-direction: column;
            gap: 1rem;
          }

          .footer-buttons {
            width: 100%;
          }

          .back-btn,
          .next-btn {
            flex: 1;
            padding: 0.625rem 1rem;
            font-size: 0.9rem;
          }
        }

        @media (prefers-color-scheme: dark) {
          .onboarding-modal {
            background: #1a1715;
          }

          .onboarding-header {
            background: linear-gradient(135deg, #2a2520 0%, #332e28 100%);
            border-bottom-color: #4a4338;
          }

          h2 {
            color: #e8dcc8;
          }

          .step-indicator {
            color: #b8a898;
          }

          .skip-btn {
            border-color: #4a4338;
            color: #b8a898;
          }

          .skip-btn:hover {
            background: rgba(232, 220, 200, 0.1);
            border-color: #8a7a6a;
          }

          .onboarding-content p,
          .onboarding-content li {
            color: #c8bcb0;
          }

          .onboarding-content h4,
          .onboarding-content strong {
            color: #e8dcc8;
          }

          .framework-section,
          .usage-item,
          .feature-item {
            background: #2a2520;
            border-color: #4a4338;
          }

          .important-note {
            background: #332e28;
            border-color: #8a7a6a;
          }

          .important-note strong {
            color: #d4a574;
          }

          .important-note p {
            color: #c8bcb0;
          }

          .important-note em {
            color: #d4a574;
          }

          .onboarding-footer {
            background: #2a2520;
            border-top-color: #4a4338;
          }

          .progress-dot {
            background: #4a4338;
          }

          .progress-dot.active {
            background: #8a7a6a;
          }

          .back-btn {
            color: #b8a898;
            border-color: #4a4338;
          }

          .back-btn:hover {
            background: rgba(232, 220, 200, 0.1);
            border-color: #8a7a6a;
          }
        }
      `}</style>
    </div>
  );
}
