/**
 * Practitioner Annotation Panel
 *
 * UI for creating, editing, and managing practitioner annotations.
 * Allows practitioners to review, modify, and override AI insights with full audit trail.
 *
 * Features:
 * - Add new annotations with type/target selection
 * - Edit/delete existing annotations
 * - Mark annotations as client-visible or practitioner-only
 * - Set override status for AI insight reviews
 * - View annotation history with timestamps
 */

import React, { useState } from "react";
import {
  PractitionerAnnotation,
  AnnotationType,
  OverrideStatus,
} from "../lib/reportSnapshot";
import {
  createAnnotation,
  updateAnnotation,
  getAnnotationTypeLabel,
  getAnnotationTypeIcon,
  getOverrideStatusLabel,
  getOverrideStatusColor,
  formatAnnotationTimestamp,
  getTargetDisplayName,
  validateAnnotationContent,
} from "../lib/annotationEngine";

interface PractitionerAnnotationPanelProps {
  annotations: ReadonlyArray<PractitionerAnnotation>;
  onAnnotationsChange: (
    annotations: ReadonlyArray<PractitionerAnnotation>
  ) => void;
  practitionerId: string;
  practitionerName: string;
  availableTargets?: string[]; // Optional: limit selectable targets
}

export default function PractitionerAnnotationPanel({
  annotations,
  onAnnotationsChange,
  practitionerId,
  practitionerName,
  availableTargets,
}: PractitionerAnnotationPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formType, setFormType] = useState<AnnotationType>("general_note");
  const [formTarget, setFormTarget] = useState("general");
  const [formContent, setFormContent] = useState("");
  const [formOverrideStatus, setFormOverrideStatus] = useState<
    OverrideStatus | undefined
  >(undefined);
  const [formVisibleToClient, setFormVisibleToClient] = useState(false);
  const [formError, setFormError] = useState<string | undefined>(undefined);

  // Default targets if not provided
  const targets = availableTargets || [
    "ai_insights",
    "oxidation",
    "health_score",
    "ca",
    "mg",
    "na",
    "k",
    "ca_mg",
    "ca_k",
    "zn_cu",
    "na_mg",
    "general",
  ];

  const handleAddNew = () => {
    setIsAdding(true);
    setEditingId(null);
    resetForm();
  };

  const handleEdit = (annotation: PractitionerAnnotation) => {
    setEditingId(annotation.id);
    setIsAdding(false);
    setFormType(annotation.type);
    setFormTarget(annotation.target);
    setFormContent(annotation.content);
    setFormOverrideStatus(annotation.overrideStatus);
    setFormVisibleToClient(annotation.visibleToClient);
    setFormError(undefined);
  };

  const handleSave = () => {
    // Validate
    const contentError = validateAnnotationContent(formContent);
    if (contentError) {
      setFormError(contentError);
      return;
    }

    if (editingId) {
      // Update existing annotation
      const existing = annotations.find((a) => a.id === editingId);
      if (existing) {
        const updated = updateAnnotation(existing, {
          content: formContent,
          overrideStatus: formOverrideStatus,
          visibleToClient: formVisibleToClient,
        });
        const newAnnotations = annotations.map((a) =>
          a.id === editingId ? updated : a
        );
        onAnnotationsChange(newAnnotations);
      }
    } else {
      // Create new annotation
      const newAnnotation = createAnnotation({
        type: formType,
        target: formTarget,
        content: formContent,
        overrideStatus: formOverrideStatus,
        practitionerId,
        practitionerName,
        visibleToClient: formVisibleToClient,
      });
      onAnnotationsChange([...annotations, newAnnotation]);
    }

    handleCancel();
  };

  const handleDelete = (annotationId: string) => {
    if (confirm("Are you sure you want to delete this annotation?")) {
      const newAnnotations = annotations.filter((a) => a.id !== annotationId);
      onAnnotationsChange(newAnnotations);
      if (editingId === annotationId) {
        handleCancel();
      }
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormType("general_note");
    setFormTarget("general");
    setFormContent("");
    setFormOverrideStatus(undefined);
    setFormVisibleToClient(false);
    setFormError(undefined);
  };

  // Group annotations by target
  const annotationsByTarget: Record<string, PractitionerAnnotation[]> = {};
  for (const annotation of annotations) {
    if (!annotationsByTarget[annotation.target]) {
      annotationsByTarget[annotation.target] = [];
    }
    annotationsByTarget[annotation.target].push(annotation);
  }

  return (
    <div className="annotation-panel">
      <div className="annotation-header">
        <h3>📝 Practitioner Annotations</h3>
        <div className="annotation-stats">
          <span className="stat-item">
            {annotations.length} {annotations.length === 1 ? "note" : "notes"}
          </span>
          <span className="stat-item">
            {annotations.filter((a) => a.visibleToClient).length} client-visible
          </span>
        </div>
      </div>

      {/* Add New Button */}
      {!isAdding && !editingId && (
        <button className="btn-add-annotation" onClick={handleAddNew}>
          + Add Annotation
        </button>
      )}

      {/* Annotation Form */}
      {(isAdding || editingId) && (
        <div className="annotation-form">
          <h4>{editingId ? "Edit Annotation" : "New Annotation"}</h4>

          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as AnnotationType)}
                disabled={!!editingId}
              >
                <option value="general_note">General Note</option>
                <option value="insight_review">AI Insight Review</option>
                <option value="mineral_note">Mineral Note</option>
                <option value="ratio_note">Ratio Note</option>
                <option value="oxidation_note">Oxidation Note</option>
                <option value="override">Override</option>
              </select>
            </div>

            <div className="form-group">
              <label>Target</label>
              <select
                value={formTarget}
                onChange={(e) => setFormTarget(e.target.value)}
                disabled={!!editingId}
              >
                {targets.map((target) => (
                  <option key={target} value={target}>
                    {getTargetDisplayName(target)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Override Status (only for insight_review and override types) */}
          {(formType === "insight_review" || formType === "override") && (
            <div className="form-group">
              <label>Override Status</label>
              <select
                value={formOverrideStatus || ""}
                onChange={(e) =>
                  setFormOverrideStatus(
                    e.target.value
                      ? (e.target.value as OverrideStatus)
                      : undefined
                  )
                }
              >
                <option value="">None</option>
                <option value="reviewed">Reviewed & Approved</option>
                <option value="modified">Modified</option>
                <option value="replaced">Replaced</option>
                <option value="flagged">Flagged for Review</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label>
              Annotation Content
              <span className="char-count">
                {formContent.length} / 5000 characters
              </span>
            </label>
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Enter your professional note or observation..."
              rows={6}
              maxLength={5000}
            />
            {formError && <div className="form-error">{formError}</div>}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formVisibleToClient}
                onChange={(e) => setFormVisibleToClient(e.target.checked)}
              />
              <span>Make visible to client in reports</span>
            </label>
            <p className="form-help">
              {formVisibleToClient
                ? "⚠️ This annotation will appear in client-facing PDF reports"
                : "This annotation is for practitioner use only"}
            </p>
          </div>

          <div className="form-actions">
            <button className="btn-save" onClick={handleSave}>
              {editingId ? "Update" : "Save"} Annotation
            </button>
            <button className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Annotations List */}
      <div className="annotations-list">
        {Object.keys(annotationsByTarget).length === 0 &&
          !isAdding &&
          !editingId && (
            <div className="empty-state">
              <p>
                No annotations yet. Click &quot;Add Annotation&quot; to get
                started.
              </p>
            </div>
          )}

        {Object.entries(annotationsByTarget)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([target, targetAnnotations]) => (
            <div key={target} className="annotation-group">
              <div className="group-header">
                <h4>{getTargetDisplayName(target)}</h4>
                <span className="annotation-count">
                  {targetAnnotations.length}{" "}
                  {targetAnnotations.length === 1 ? "note" : "notes"}
                </span>
              </div>

              {targetAnnotations
                .sort((a, b) => {
                  const aTime = new Date(a.updatedAt || a.createdAt).getTime();
                  const bTime = new Date(b.updatedAt || b.createdAt).getTime();
                  return bTime - aTime; // Most recent first
                })
                .map((annotation) => (
                  <div
                    key={annotation.id}
                    className={`annotation-card ${
                      editingId === annotation.id ? "editing" : ""
                    }`}
                  >
                    <div className="annotation-card-header">
                      <div className="annotation-meta">
                        <span className="annotation-type-icon">
                          {getAnnotationTypeIcon(annotation.type)}
                        </span>
                        <span className="annotation-type-label">
                          {getAnnotationTypeLabel(annotation.type)}
                        </span>
                        {annotation.overrideStatus && (
                          <span
                            className="override-badge"
                            style={{
                              backgroundColor: getOverrideStatusColor(
                                annotation.overrideStatus
                              ),
                            }}
                          >
                            {getOverrideStatusLabel(annotation.overrideStatus)}
                          </span>
                        )}
                        {annotation.visibleToClient && (
                          <span className="visibility-badge client-visible">
                            👁️ Client Visible
                          </span>
                        )}
                      </div>
                      <div className="annotation-actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleEdit(annotation)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleDelete(annotation.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="annotation-content">
                      {annotation.content}
                    </div>

                    <div className="annotation-footer">
                      <span className="annotation-author">
                        {annotation.practitionerName}
                      </span>
                      <span className="annotation-timestamp">
                        {formatAnnotationTimestamp(annotation)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ))}
      </div>

      <style jsx>{`
        .annotation-panel {
          background: white;
          border-radius: 0.5rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin: 1.5rem 0;
        }

        .annotation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .annotation-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #111827;
        }

        .annotation-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .stat-item {
          padding: 0.25rem 0.75rem;
          background: #f3f4f6;
          border-radius: 0.25rem;
        }

        .btn-add-annotation {
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 1rem;
        }

        .btn-add-annotation:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
        }

        .annotation-form {
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .annotation-form h4 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          color: #111827;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .char-count {
          float: right;
          font-weight: 400;
          color: #9ca3af;
        }

        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-family: inherit;
        }

        .form-group textarea {
          resize: vertical;
          line-height: 1.5;
        }

        .form-error {
          margin-top: 0.5rem;
          color: #ef4444;
          font-size: 0.8125rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 1rem;
          height: 1rem;
          cursor: pointer;
        }

        .form-help {
          margin: 0.5rem 0 0 0;
          font-size: 0.8125rem;
          color: #6b7280;
        }

        .form-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .btn-save {
          flex: 1;
          padding: 0.75rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-save:hover {
          background: #059669;
        }

        .btn-cancel {
          padding: 0.75rem 1.5rem;
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
        }

        .annotations-list {
          margin-top: 1.5rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #9ca3af;
        }

        .annotation-group {
          margin-bottom: 2rem;
        }

        .group-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .group-header h4 {
          margin: 0;
          font-size: 1rem;
          color: #374151;
        }

        .annotation-count {
          font-size: 0.8125rem;
          color: #9ca3af;
        }

        .annotation-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          padding: 1rem;
          margin-bottom: 0.75rem;
          transition: all 0.2s;
        }

        .annotation-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .annotation-card.editing {
          border-color: #f59e0b;
          background: #fffbeb;
        }

        .annotation-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .annotation-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .annotation-type-icon {
          font-size: 1rem;
        }

        .annotation-type-label {
          font-size: 0.8125rem;
          font-weight: 500;
          color: #6b7280;
        }

        .override-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          color: white;
          font-weight: 500;
        }

        .visibility-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .visibility-badge.client-visible {
          background: #dbeafe;
          color: #1e40af;
        }

        .annotation-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-icon {
          padding: 0.25rem 0.5rem;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .btn-icon:hover {
          opacity: 1;
        }

        .annotation-content {
          font-size: 0.9375rem;
          color: #374151;
          line-height: 1.6;
          white-space: pre-wrap;
          margin-bottom: 0.75rem;
        }

        .annotation-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8125rem;
          color: #9ca3af;
        }

        .annotation-author {
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
