/**
 * Annotation Badge Component
 *
 * Small badge to indicate practitioner annotations are present.
 * Shows count and allows expanding to view annotations.
 */

import React, { useState } from "react";
import { PractitionerAnnotation } from "../lib/reportSnapshot";
import {
  getAnnotationTypeIcon,
  getAnnotationTypeLabel,
  getOverrideStatusLabel,
  getOverrideStatusColor,
  formatAnnotationTimestamp,
} from "../lib/annotationEngine";

interface AnnotationBadgeProps {
  annotations: ReadonlyArray<PractitionerAnnotation>;
  target: string;
  compact?: boolean;
}

export default function AnnotationBadge({
  annotations,
  target,
  compact = false,
}: AnnotationBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter annotations for this target
  const targetAnnotations = annotations.filter((a) => a.target === target);

  if (targetAnnotations.length === 0) {
    return null;
  }

  // Get most recent annotation
  const latest = [...targetAnnotations].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt).getTime();
    return bTime - aTime;
  })[0];

  if (compact) {
    return (
      <span
        className="annotation-badge-compact"
        onClick={() => setIsExpanded(!isExpanded)}
        title={`${targetAnnotations.length} practitioner ${
          targetAnnotations.length === 1 ? "note" : "notes"
        }`}
      >
        📝 {targetAnnotations.length}
        <style jsx>{`
          .annotation-badge-compact {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.125rem 0.5rem;
            background: #dbeafe;
            color: #1e40af;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            margin-left: 0.5rem;
          }

          .annotation-badge-compact:hover {
            background: #bfdbfe;
          }
        `}</style>
      </span>
    );
  }

  return (
    <div className="annotation-badge">
      <div
        className="annotation-badge-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="badge-info">
          <span className="badge-icon">📝</span>
          <span className="badge-text">
            {targetAnnotations.length} Practitioner{" "}
            {targetAnnotations.length === 1 ? "Note" : "Notes"}
          </span>
          {latest.overrideStatus && (
            <span
              className="override-indicator"
              style={{
                backgroundColor: getOverrideStatusColor(latest.overrideStatus),
              }}
            >
              {getOverrideStatusLabel(latest.overrideStatus)}
            </span>
          )}
        </div>
        <button className="badge-toggle">{isExpanded ? "−" : "+"}</button>
      </div>

      {isExpanded && (
        <div className="annotation-badge-content">
          {targetAnnotations
            .sort((a, b) => {
              const aTime = new Date(a.updatedAt || a.createdAt).getTime();
              const bTime = new Date(b.updatedAt || b.createdAt).getTime();
              return bTime - aTime;
            })
            .map((annotation) => (
              <div key={annotation.id} className="annotation-item">
                <div className="annotation-item-header">
                  <span className="annotation-type">
                    {getAnnotationTypeIcon(annotation.type)}{" "}
                    {getAnnotationTypeLabel(annotation.type)}
                  </span>
                  {annotation.visibleToClient && (
                    <span className="client-visible-tag">
                      👁️ Client Visible
                    </span>
                  )}
                </div>
                <div className="annotation-text">{annotation.content}</div>
                <div className="annotation-meta">
                  <span>{annotation.practitionerName}</span>
                  <span>{formatAnnotationTimestamp(annotation)}</span>
                </div>
              </div>
            ))}
        </div>
      )}

      <style jsx>{`
        .annotation-badge {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 0.375rem;
          margin: 1rem 0;
          overflow: hidden;
        }

        .annotation-badge-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .annotation-badge-header:hover {
          background: #dbeafe;
        }

        .badge-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .badge-icon {
          font-size: 1.25rem;
        }

        .badge-text {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1e40af;
        }

        .override-indicator {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          color: white;
          font-weight: 500;
        }

        .badge-toggle {
          width: 1.5rem;
          height: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #bfdbfe;
          border-radius: 0.25rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e40af;
          cursor: pointer;
          transition: all 0.2s;
        }

        .badge-toggle:hover {
          background: #dbeafe;
        }

        .annotation-badge-content {
          padding: 0 1rem 1rem 1rem;
          border-top: 1px solid #bfdbfe;
          background: white;
        }

        .annotation-item {
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 0.375rem;
          margin-top: 0.75rem;
        }

        .annotation-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .annotation-type {
          font-size: 0.8125rem;
          font-weight: 500;
          color: #6b7280;
        }

        .client-visible-tag {
          font-size: 0.75rem;
          padding: 0.125rem 0.5rem;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 0.25rem;
        }

        .annotation-text {
          font-size: 0.875rem;
          color: #374151;
          line-height: 1.5;
          white-space: pre-wrap;
          margin-bottom: 0.5rem;
        }

        .annotation-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
