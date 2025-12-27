/**
 * Practitioner Annotation Engine
 *
 * Manages creation, modification, and validation of practitioner annotations.
 * Provides audit trail for all practitioner overrides and notes.
 *
 * Version: 1.6.0
 * Added: December 2025
 *
 * SEMANTIC LOCK: Functions in this module follow immutable patterns.
 * All operations return new arrays/objects rather than mutating existing data.
 */

import {
  PractitionerAnnotation,
  AnnotationType,
  OverrideStatus,
} from "./reportSnapshot";

// ============================================================================
// ANNOTATION CREATION
// ============================================================================

export interface CreateAnnotationParams {
  type: AnnotationType;
  target: string;
  content: string;
  overrideStatus?: OverrideStatus;
  originalContent?: string;
  practitionerId: string;
  practitionerName: string;
  visibleToClient?: boolean;
}

/**
 * Create a new practitioner annotation with full audit trail
 *
 * @param params - Annotation creation parameters
 * @returns New immutable PractitionerAnnotation
 */
export function createAnnotation(
  params: CreateAnnotationParams
): PractitionerAnnotation {
  const now = new Date().toISOString();

  return {
    id: generateAnnotationId(),
    type: params.type,
    target: params.target,
    content: params.content.trim(),
    overrideStatus: params.overrideStatus,
    originalContent: params.originalContent,
    practitionerId: params.practitionerId,
    practitionerName: params.practitionerName,
    createdAt: now,
    visibleToClient: params.visibleToClient ?? false,
  };
}

/**
 * Update an existing annotation
 *
 * @param annotation - Original annotation
 * @param updates - Fields to update
 * @returns New annotation with updates applied
 */
export function updateAnnotation(
  annotation: PractitionerAnnotation,
  updates: Partial<
    Pick<
      PractitionerAnnotation,
      "content" | "overrideStatus" | "visibleToClient"
    >
  >
): PractitionerAnnotation {
  return {
    ...annotation,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Add annotation to annotations array (immutable)
 *
 * @param annotations - Existing annotations array
 * @param newAnnotation - Annotation to add
 * @returns New array with annotation added
 */
export function addAnnotation(
  annotations: ReadonlyArray<PractitionerAnnotation>,
  newAnnotation: PractitionerAnnotation
): ReadonlyArray<PractitionerAnnotation> {
  return [...annotations, newAnnotation];
}

/**
 * Remove annotation from annotations array (immutable)
 *
 * @param annotations - Existing annotations array
 * @param annotationId - ID of annotation to remove
 * @returns New array without the specified annotation
 */
export function removeAnnotation(
  annotations: ReadonlyArray<PractitionerAnnotation>,
  annotationId: string
): ReadonlyArray<PractitionerAnnotation> {
  return annotations.filter((a) => a.id !== annotationId);
}

/**
 * Replace annotation in annotations array (immutable)
 *
 * @param annotations - Existing annotations array
 * @param annotationId - ID of annotation to replace
 * @param updatedAnnotation - New annotation data
 * @returns New array with annotation replaced
 */
export function replaceAnnotation(
  annotations: ReadonlyArray<PractitionerAnnotation>,
  annotationId: string,
  updatedAnnotation: PractitionerAnnotation
): ReadonlyArray<PractitionerAnnotation> {
  return annotations.map((a) =>
    a.id === annotationId ? updatedAnnotation : a
  );
}

// ============================================================================
// ANNOTATION QUERIES
// ============================================================================

/**
 * Get all annotations for a specific target
 *
 * @param annotations - All annotations
 * @param target - Target element (e.g., "ca", "ca_mg", "ai_insights")
 * @returns Annotations for the specified target
 */
export function getAnnotationsForTarget(
  annotations: ReadonlyArray<PractitionerAnnotation>,
  target: string
): ReadonlyArray<PractitionerAnnotation> {
  return annotations.filter((a) => a.target === target);
}

/**
 * Get all annotations of a specific type
 *
 * @param annotations - All annotations
 * @param type - Annotation type
 * @returns Annotations of the specified type
 */
export function getAnnotationsByType(
  annotations: ReadonlyArray<PractitionerAnnotation>,
  type: AnnotationType
): ReadonlyArray<PractitionerAnnotation> {
  return annotations.filter((a) => a.type === type);
}

/**
 * Get all client-visible annotations
 *
 * @param annotations - All annotations
 * @returns Annotations marked as visible to client
 */
export function getClientVisibleAnnotations(
  annotations: ReadonlyArray<PractitionerAnnotation>
): ReadonlyArray<PractitionerAnnotation> {
  return annotations.filter((a) => a.visibleToClient);
}

/**
 * Get all practitioner-only annotations
 *
 * @param annotations - All annotations
 * @returns Annotations marked as practitioner-only
 */
export function getPractitionerOnlyAnnotations(
  annotations: ReadonlyArray<PractitionerAnnotation>
): ReadonlyArray<PractitionerAnnotation> {
  return annotations.filter((a) => !a.visibleToClient);
}

/**
 * Check if a target has any annotations
 *
 * @param annotations - All annotations
 * @param target - Target element
 * @returns True if target has at least one annotation
 */
export function hasAnnotations(
  annotations: ReadonlyArray<PractitionerAnnotation>,
  target: string
): boolean {
  return annotations.some((a) => a.target === target);
}

/**
 * Count annotations for a target
 *
 * @param annotations - All annotations
 * @param target - Target element
 * @returns Number of annotations for target
 */
export function countAnnotations(
  annotations: ReadonlyArray<PractitionerAnnotation>,
  target: string
): number {
  return annotations.filter((a) => a.target === target).length;
}

// ============================================================================
// OVERRIDE STATUS HELPERS
// ============================================================================

/**
 * Check if AI insights have been overridden
 *
 * @param annotations - All annotations
 * @returns True if insights have override annotation
 */
export function hasInsightOverride(
  annotations: ReadonlyArray<PractitionerAnnotation>
): boolean {
  return annotations.some(
    (a) => a.target === "ai_insights" && a.overrideStatus !== undefined
  );
}

/**
 * Get override status for AI insights
 *
 * @param annotations - All annotations
 * @returns Override status or undefined if not overridden
 */
export function getInsightOverrideStatus(
  annotations: ReadonlyArray<PractitionerAnnotation>
): OverrideStatus | undefined {
  const override = annotations.find(
    (a) => a.target === "ai_insights" && a.overrideStatus !== undefined
  );
  return override?.overrideStatus;
}

/**
 * Get the most recent annotation for a target
 *
 * @param annotations - All annotations
 * @param target - Target element
 * @returns Most recent annotation or undefined
 */
export function getLatestAnnotation(
  annotations: ReadonlyArray<PractitionerAnnotation>,
  target: string
): PractitionerAnnotation | undefined {
  const targetAnnotations = getAnnotationsForTarget(annotations, target);
  if (targetAnnotations.length === 0) return undefined;

  return [...targetAnnotations].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt).getTime();
    return bTime - aTime; // Most recent first
  })[0];
}

// ============================================================================
// ANNOTATION STATISTICS
// ============================================================================

export interface AnnotationStats {
  total: number;
  byType: Record<AnnotationType, number>;
  clientVisible: number;
  practitionerOnly: number;
  withOverrides: number;
}

/**
 * Calculate statistics for annotations
 *
 * @param annotations - All annotations
 * @returns Annotation statistics
 */
export function getAnnotationStats(
  annotations: ReadonlyArray<PractitionerAnnotation>
): AnnotationStats {
  const stats: AnnotationStats = {
    total: annotations.length,
    byType: {
      insight_review: 0,
      mineral_note: 0,
      ratio_note: 0,
      oxidation_note: 0,
      general_note: 0,
      override: 0,
    },
    clientVisible: 0,
    practitionerOnly: 0,
    withOverrides: 0,
  };

  for (const annotation of annotations) {
    stats.byType[annotation.type]++;
    if (annotation.visibleToClient) {
      stats.clientVisible++;
    } else {
      stats.practitionerOnly++;
    }
    if (annotation.overrideStatus) {
      stats.withOverrides++;
    }
  }

  return stats;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate annotation content
 *
 * @param content - Annotation content to validate
 * @returns Error message or undefined if valid
 */
export function validateAnnotationContent(content: string): string | undefined {
  if (!content || content.trim().length === 0) {
    return "Annotation content cannot be empty";
  }

  if (content.length > 5000) {
    return "Annotation content must be 5000 characters or less";
  }

  return undefined;
}

/**
 * Validate practitioner info
 *
 * @param practitionerId - Practitioner ID
 * @param practitionerName - Practitioner name
 * @returns Error message or undefined if valid
 */
export function validatePractitionerInfo(
  practitionerId: string,
  practitionerName: string
): string | undefined {
  if (!practitionerId || practitionerId.trim().length === 0) {
    return "Practitioner ID is required";
  }

  if (!practitionerName || practitionerName.trim().length === 0) {
    return "Practitioner name is required";
  }

  return undefined;
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

/**
 * Get display label for annotation type
 *
 * @param type - Annotation type
 * @returns Human-readable label
 */
export function getAnnotationTypeLabel(type: AnnotationType): string {
  const labels: Record<AnnotationType, string> = {
    insight_review: "AI Insight Review",
    mineral_note: "Mineral Note",
    ratio_note: "Ratio Note",
    oxidation_note: "Oxidation Note",
    general_note: "General Note",
    override: "Override",
  };
  return labels[type];
}

/**
 * Get display label for override status
 *
 * @param status - Override status
 * @returns Human-readable label
 */
export function getOverrideStatusLabel(status: OverrideStatus): string {
  const labels: Record<OverrideStatus, string> = {
    reviewed: "Reviewed & Approved",
    modified: "Modified by Practitioner",
    replaced: "Replaced by Practitioner",
    flagged: "Flagged for Review",
  };
  return labels[status];
}

/**
 * Get color for override status badge
 *
 * @param status - Override status
 * @returns Hex color code
 */
export function getOverrideStatusColor(status: OverrideStatus): string {
  const colors: Record<OverrideStatus, string> = {
    reviewed: "#10b981", // green
    modified: "#f59e0b", // amber
    replaced: "#3b82f6", // blue
    flagged: "#ef4444", // red
  };
  return colors[status];
}

/**
 * Get icon for annotation type
 *
 * @param type - Annotation type
 * @returns Emoji icon
 */
export function getAnnotationTypeIcon(type: AnnotationType): string {
  const icons: Record<AnnotationType, string> = {
    insight_review: "🔍",
    mineral_note: "⚗️",
    ratio_note: "📊",
    oxidation_note: "⚡",
    general_note: "📝",
    override: "✏️",
  };
  return icons[type];
}

/**
 * Format annotation timestamp for display
 *
 * @param annotation - Annotation
 * @returns Formatted timestamp string
 */
export function formatAnnotationTimestamp(
  annotation: PractitionerAnnotation
): string {
  const timestamp = annotation.updatedAt || annotation.createdAt;
  const date = new Date(timestamp);

  // Format as "Dec 22, 2025 at 3:45 PM"
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };

  return date.toLocaleString("en-US", options);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate unique annotation ID
 * Uses timestamp + random string for uniqueness
 *
 * @returns Unique annotation ID
 */
function generateAnnotationId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `ann_${timestamp}_${randomStr}`;
}

/**
 * Check if target is valid annotation target
 *
 * @param target - Target string to validate
 * @returns True if target is valid
 */
export function isValidAnnotationTarget(target: string): boolean {
  // Valid targets: mineral symbols, ratio names, "ai_insights", "oxidation", "general"
  const validTargets = [
    // Minerals
    "ca",
    "mg",
    "na",
    "k",
    "cu",
    "zn",
    "p",
    "fe",
    "mn",
    "cr",
    "se",
    "b",
    "co",
    "mo",
    "s",
    // Ratios
    "ca_mg",
    "ca_k",
    "zn_cu",
    "na_mg",
    "ca_p",
    "zn_cd",
    // Special targets
    "ai_insights",
    "oxidation",
    "health_score",
    "general",
  ];

  return validTargets.includes(target.toLowerCase());
}

/**
 * Get display name for annotation target
 *
 * @param target - Target identifier
 * @returns Human-readable target name
 */
export function getTargetDisplayName(target: string): string {
  // If it's a ratio with underscore, format it
  if (target.includes("_")) {
    return target.toUpperCase().replace("_", "/");
  }

  // Special cases
  const specialNames: Record<string, string> = {
    ai_insights: "AI Insights",
    oxidation: "Oxidation Classification",
    health_score: "Health Score",
    general: "General Report",
  };

  if (specialNames[target]) {
    return specialNames[target];
  }

  // Default: capitalize mineral symbol
  return target.toUpperCase();
}
