/**
 * HTMA Audit Event System
 *
 * Lightweight, non-PHI event logging for compliance and traceability.
 * Records metadata about analysis operations without storing patient data.
 *
 * CRITICAL: This module MUST NOT store any Protected Health Information (PHI):
 * - No patient names
 * - No dates of birth
 * - No test results
 * - No AI insights content
 *
 * Only metadata for audit trails and version tracking.
 */

import {
  ANALYSIS_ENGINE_VERSION,
  PROMPT_VERSION,
  AI_MODEL,
  HTMA_GENIUS_VERSION,
} from "./htmaConstants";

// ============================================================================
// AUDIT EVENT TYPES
// ============================================================================

export type AuditEventType =
  | "ANALYSIS_CREATED"
  | "REPORT_GENERATED"
  | "ANALYSIS_LOADED"
  | "SNAPSHOT_CREATED";

// ============================================================================
// AUDIT EVENT INTERFACE
// ============================================================================

export interface AuditEvent {
  /** Event type */
  readonly eventType: AuditEventType;

  /** Unique report/analysis ID (UUID) - NOT patient ID */
  readonly reportId: string;

  /** ISO 8601 timestamp */
  readonly timestamp: string;

  /** Analysis engine version used */
  readonly engineVersion: string;

  /** AI prompt template version */
  readonly promptVersion: string;

  /** AI model used for analysis */
  readonly aiModel: string;

  /** Application version */
  readonly appVersion: string;

  /** Whether practitioner mode was enabled */
  readonly isPractitionerMode: boolean;

  /** Optional user ID (Firebase UID - NOT patient identifier) */
  readonly userId?: string;

  /** Optional additional metadata (non-PHI only) */
  readonly metadata?: Record<string, string | number | boolean>;
}

// ============================================================================
// AUDIT EVENT CREATION
// ============================================================================

export interface CreateAuditEventOptions {
  /** Event type */
  eventType: AuditEventType;

  /** Report/analysis UUID */
  reportId: string;

  /** Whether practitioner mode was active */
  isPractitionerMode: boolean;

  /** Optional user ID (Firebase UID) */
  userId?: string;

  /** Optional additional non-PHI metadata */
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Create an audit event
 *
 * Pure function that creates an immutable audit event record.
 * Uses current version constants to ensure traceability.
 *
 * @param options - Event creation options
 * @returns Immutable audit event
 */
export function createAuditEvent(options: CreateAuditEventOptions): AuditEvent {
  return {
    eventType: options.eventType,
    reportId: options.reportId,
    timestamp: new Date().toISOString(),
    engineVersion: ANALYSIS_ENGINE_VERSION,
    promptVersion: PROMPT_VERSION,
    aiModel: AI_MODEL,
    appVersion: HTMA_GENIUS_VERSION,
    isPractitionerMode: options.isPractitionerMode,
    userId: options.userId,
    metadata: options.metadata,
  };
}

// ============================================================================
// AUDIT EVENT FORMATTING
// ============================================================================

/**
 * Format audit event for logging
 *
 * @param event - Audit event
 * @returns Formatted string for console/file logging
 */
export function formatAuditEvent(event: AuditEvent): string {
  return [
    `[${event.timestamp}]`,
    `Event: ${event.eventType}`,
    `ReportID: ${event.reportId}`,
    `Engine: ${event.engineVersion}`,
    `Prompt: ${event.promptVersion}`,
    `Practitioner: ${event.isPractitionerMode}`,
    event.userId ? `User: ${event.userId}` : null,
  ]
    .filter(Boolean)
    .join(" | ");
}

/**
 * Format audit event for JSON storage
 *
 * @param event - Audit event
 * @returns Plain object suitable for Firestore/database storage
 */
export function serializeAuditEvent(event: AuditEvent): Record<string, any> {
  return {
    eventType: event.eventType,
    reportId: event.reportId,
    timestamp: event.timestamp,
    engineVersion: event.engineVersion,
    promptVersion: event.promptVersion,
    aiModel: event.aiModel,
    appVersion: event.appVersion,
    isPractitionerMode: event.isPractitionerMode,
    userId: event.userId || null,
    metadata: event.metadata || {},
  };
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate that an audit event contains no PHI
 *
 * This is a safety check to ensure no sensitive data leaks into audit logs.
 *
 * @param event - Audit event to validate
 * @returns True if event passes PHI validation
 */
export function validateNoPHI(event: AuditEvent): boolean {
  // Check that metadata doesn't contain suspicious keys
  const prohibitedKeys = [
    "patientName",
    "name",
    "dob",
    "dateOfBirth",
    "ssn",
    "address",
    "phone",
    "email",
    "insights",
    "aiInsights",
    "mineralData",
    "testResults",
  ];

  if (event.metadata) {
    const metadataKeys = Object.keys(event.metadata).map((k) =>
      k.toLowerCase()
    );
    const hasPHI = prohibitedKeys.some((key) =>
      metadataKeys.includes(key.toLowerCase())
    );

    if (hasPHI) {
      console.error("⚠️ Audit event contains prohibited PHI keys:", event);
      return false;
    }
  }

  return true;
}

// ============================================================================
// AUDIT EVENT LOGGER
// ============================================================================

/**
 * Log audit event to console (development) or external system (production)
 *
 * In production, this could be extended to send events to:
 * - Cloud logging service (Google Cloud Logging, AWS CloudWatch)
 * - SIEM system for compliance
 * - Audit database
 *
 * @param event - Audit event to log
 */
export function logAuditEvent(event: AuditEvent): void {
  // Validate no PHI before logging
  if (!validateNoPHI(event)) {
    console.error("❌ Refusing to log audit event with potential PHI");
    return;
  }

  // Console logging for development
  if (process.env.NODE_ENV === "development") {
    console.log("📋 AUDIT:", formatAuditEvent(event));
  }

  // In production, you would send to external audit system:
  // - Google Cloud Logging
  // - Datadog
  // - Splunk
  // - Custom audit database
  //
  // Example:
  // if (process.env.NODE_ENV === 'production') {
  //   await sendToAuditService(serializeAuditEvent(event));
  // }
}
