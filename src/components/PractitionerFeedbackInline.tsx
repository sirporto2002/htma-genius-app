import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { getFirebaseDb } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { INTERPRETATION_GUARDRAILS_VERSION } from "../lib/interpretationGuardrails";
import { HEALTH_SCORE_SEMANTICS_VERSION } from "../lib/healthScoreSemantics";

export type FeedbackContext =
  | "health_score"
  | "score_delta"
  | "focus_summary"
  | "pdf_report"
  | "oxidation_pattern";

interface PractitionerFeedbackInlineProps {
  context: FeedbackContext;
  analysisId: string;
}

export default function PractitionerFeedbackInline({
  context,
  analysisId,
}: PractitionerFeedbackInlineProps) {
  const { user } = useAuth();
  const [sentiment, setSentiment] = useState<"positive" | "negative" | null>(
    null
  );
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSentimentClick = async (
    selectedSentiment: "positive" | "negative"
  ) => {
    if (!user || isSubmitting) return;

    setSentiment(selectedSentiment);
    setIsSubmitting(true);

    try {
      const db = getFirebaseDb();
      if (!db) {
        console.warn("Firestore not initialized");
        return;
      }
      
      await addDoc(collection(db, "practitionerFeedback"), {
        analysisId,
        context,
        sentiment: selectedSentiment,
        comment: "",
        metadata: {
          guardrailsVersion: INTERPRETATION_GUARDRAILS_VERSION,
          semanticsVersion: HEALTH_SCORE_SEMANTICS_VERSION,
          timestamp: new Date().toISOString(),
        },
        userId: user.uid,
      });
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!user || !sentiment || !comment.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const db = getFirebaseDb();
      if (!db) {
        console.warn("Firestore not initialized");
        return;
      }
      
      await addDoc(collection(db, "practitionerFeedback"), {
        analysisId,
        context,
        sentiment,
        comment: comment.trim(),
        metadata: {
          guardrailsVersion: INTERPRETATION_GUARDRAILS_VERSION,
          semanticsVersion: HEALTH_SCORE_SEMANTICS_VERSION,
          timestamp: new Date().toISOString(),
        },
        userId: user.uid,
      });
    } catch (error) {
      console.error("Failed to submit feedback comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommentSubmit();
    }
  };

  if (!user) return null;

  return (
    <div className="practitioner-feedback-inline">
      <p className="feedback-question">Was this section clinically helpful?</p>

      <div className="feedback-buttons">
        <button
          onClick={() => handleSentimentClick("positive")}
          disabled={sentiment !== null || isSubmitting}
          className="feedback-btn positive"
        >
          👍 Makes sense
        </button>
        <button
          onClick={() => handleSentimentClick("negative")}
          disabled={sentiment !== null || isSubmitting}
          className="feedback-btn negative"
        >
          👎 Feels off
        </button>
      </div>

      {sentiment !== null && (
        <input
          type="text"
          placeholder="What felt unclear, risky, or inaccurate? (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onBlur={handleCommentSubmit}
          onKeyDown={handleCommentKeyDown}
          disabled={isSubmitting}
          className="feedback-comment"
        />
      )}

      <style jsx>{`
        .practitioner-feedback-inline {
          margin-top: 0.5rem;
          margin-bottom: 1rem;
        }

        .feedback-question {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0 0 0.5rem 0;
        }

        .feedback-buttons {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .feedback-btn {
          font-size: 0.75rem;
          color: #6b7280;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: color 0.2s;
        }

        .feedback-btn:hover:not(:disabled) {
          color: #374151;
        }

        .feedback-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .feedback-comment {
          width: 100%;
          font-size: 0.75rem;
          color: #6b7280;
          background: transparent;
          border: none;
          border-bottom: 1px solid #e5e7eb;
          padding: 0.25rem 0;
          outline: none;
        }

        .feedback-comment::placeholder {
          color: #9ca3af;
        }

        .feedback-comment:focus {
          border-bottom-color: #d1d5db;
        }
      `}</style>
    </div>
  );
}
