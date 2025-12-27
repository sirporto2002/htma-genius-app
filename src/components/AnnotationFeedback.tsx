/**
 * Annotation Feature Feedback Component
 *
 * Dedicated feedback collector for the Practitioner Annotation System.
 * Helps gather real-world usage data and improvement suggestions.
 */

import React, { useState } from "react";
import { getFirebaseDb } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "sonner";

interface AnnotationFeedbackProps {
  practitionerId: string;
  practitionerName: string;
  currentAnnotationCount: number;
}

export default function AnnotationFeedback({
  practitionerId,
  practitionerName,
  currentAnnotationCount,
}: AnnotationFeedbackProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<
    "bug" | "feature" | "usability" | "general"
  >("general");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (comment.trim().length === 0) {
      toast.error("Please provide feedback before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const db = getFirebaseDb();
      if (!db) {
        toast.error("Database not initialized");
        return;
      }

      await addDoc(collection(db, "annotationFeedback"), {
        practitionerId,
        practitionerName,
        feedbackType,
        rating,
        comment: comment.trim(),
        annotationCount: currentAnnotationCount,
        timestamp: new Date().toISOString(),
        version: "1.6.0",
      });

      toast.success("Thank you for your feedback!");
      setIsOpen(false);
      setComment("");
      setRating(0);
      setFeedbackType("general");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="feedback-trigger">
        <button
          className="feedback-button"
          onClick={() => setIsOpen(true)}
          title="Share feedback on the annotation system"
        >
          💬 Annotation Feedback
        </button>
        <style jsx>{`
          .feedback-trigger {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            z-index: 100;
          }

          .feedback-button {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 2rem;
            font-weight: 500;
            font-size: 0.9375rem;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            transition: all 0.3s;
          }

          .feedback-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="feedback-modal-overlay" onClick={() => setIsOpen(false)}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="feedback-header">
          <h3>📝 Annotation System Feedback</h3>
          <button className="close-button" onClick={() => setIsOpen(false)}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="feedback-intro">
            <p>
              Help us improve the annotation system! Your feedback shapes future
              updates.
            </p>
            <div className="usage-stats">
              <span className="stat-badge">
                {currentAnnotationCount} annotations created
              </span>
            </div>
          </div>

          {/* Rating */}
          <div className="form-section">
            <label>How satisfied are you with the annotation system?</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${rating >= star ? "filled" : ""}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Type */}
          <div className="form-section">
            <label>Feedback Type</label>
            <div className="feedback-types">
              <button
                type="button"
                className={`type-button ${
                  feedbackType === "bug" ? "active" : ""
                }`}
                onClick={() => setFeedbackType("bug")}
              >
                🐛 Bug Report
              </button>
              <button
                type="button"
                className={`type-button ${
                  feedbackType === "feature" ? "active" : ""
                }`}
                onClick={() => setFeedbackType("feature")}
              >
                💡 Feature Request
              </button>
              <button
                type="button"
                className={`type-button ${
                  feedbackType === "usability" ? "active" : ""
                }`}
                onClick={() => setFeedbackType("usability")}
              >
                🎨 Usability Issue
              </button>
              <button
                type="button"
                className={`type-button ${
                  feedbackType === "general" ? "active" : ""
                }`}
                onClick={() => setFeedbackType("general")}
              >
                💬 General Feedback
              </button>
            </div>
          </div>

          {/* Comment */}
          <div className="form-section">
            <label>
              Your Feedback
              {feedbackType === "bug" && (
                <span className="label-hint">
                  {" "}
                  - Describe what happened and steps to reproduce
                </span>
              )}
              {feedbackType === "feature" && (
                <span className="label-hint">
                  {" "}
                  - What feature would help your workflow?
                </span>
              )}
              {feedbackType === "usability" && (
                <span className="label-hint">
                  {" "}
                  - What&apos;s confusing or could be improved?
                </span>
              )}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                feedbackType === "bug"
                  ? "When I try to... the annotation panel..."
                  : feedbackType === "feature"
                  ? "It would be helpful if I could..."
                  : feedbackType === "usability"
                  ? "I find it difficult to..."
                  : "I think the annotation system..."
              }
              rows={6}
              maxLength={2000}
              required
            />
            <div className="char-count">{comment.length} / 2000</div>
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>

        <style jsx>{`
          .feedback-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.2s ease-out;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .feedback-modal {
            background: white;
            border-radius: 0.75rem;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease-out;
          }

          @keyframes slideUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          .feedback-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 2px solid #e5e7eb;
          }

          .feedback-header h3 {
            margin: 0;
            font-size: 1.25rem;
            color: #111827;
          }

          .close-button {
            background: transparent;
            border: none;
            font-size: 1.5rem;
            color: #6b7280;
            cursor: pointer;
            padding: 0.25rem 0.5rem;
            transition: color 0.2s;
          }

          .close-button:hover {
            color: #111827;
          }

          form {
            padding: 1.5rem;
          }

          .feedback-intro {
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: #f9fafb;
            border-radius: 0.5rem;
          }

          .feedback-intro p {
            margin: 0 0 0.75rem 0;
            color: #374151;
          }

          .usage-stats {
            display: flex;
            gap: 0.5rem;
          }

          .stat-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: #dbeafe;
            color: #1e40af;
            border-radius: 0.25rem;
            font-size: 0.8125rem;
            font-weight: 500;
          }

          .form-section {
            margin-bottom: 1.5rem;
          }

          .form-section label {
            display: block;
            font-weight: 500;
            color: #374151;
            margin-bottom: 0.5rem;
            font-size: 0.9375rem;
          }

          .label-hint {
            font-weight: 400;
            color: #6b7280;
            font-size: 0.875rem;
          }

          .star-rating {
            display: flex;
            gap: 0.5rem;
          }

          .star {
            background: transparent;
            border: none;
            font-size: 2rem;
            color: #d1d5db;
            cursor: pointer;
            transition: all 0.2s;
            padding: 0;
          }

          .star.filled {
            color: #fbbf24;
          }

          .star:hover {
            transform: scale(1.1);
          }

          .feedback-types {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }

          .type-button {
            padding: 0.75rem;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
          }

          .type-button:hover {
            border-color: #667eea;
            background: #f9fafb;
          }

          .type-button.active {
            border-color: #667eea;
            background: #eff6ff;
            color: #1e40af;
          }

          textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            font-family: inherit;
            font-size: 0.9375rem;
            line-height: 1.5;
            resize: vertical;
          }

          textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }

          .char-count {
            text-align: right;
            font-size: 0.8125rem;
            color: #9ca3af;
            margin-top: 0.25rem;
          }

          .form-actions {
            display: flex;
            gap: 0.75rem;
            justify-content: flex-end;
          }

          .btn-cancel {
            padding: 0.75rem 1.5rem;
            background: #f3f4f6;
            color: #374151;
            border: none;
            border-radius: 0.5rem;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
          }

          .btn-cancel:hover {
            background: #e5e7eb;
          }

          .btn-submit {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 0.5rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-submit:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }

          .btn-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          @media (max-width: 640px) {
            .feedback-types {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
