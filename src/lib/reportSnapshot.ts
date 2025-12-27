/**
 * HTMA Report Snapshot
 *
 * Immutable snapshot of an HTMA analysis at a specific point in time.
 * Used to ensure PDF reports are generated from consistent, unchanging data.
 *
 * This snapshot is the single source of truth for PDF generation and provides
 * audit trail capabilities for legal and clinical compliance.
 */

import { MineralStatus } from "./htmaConstants";
import { ScoreDeltaExplanation } from "./scoreDeltaExplainer";
import { HealthScoreBreakdown } from "./healthScore";
import { ChangeFocusSummary } from "./changeCoachingEngine";
import { TrendExplanation } from "./trendExplainer";
import { OxidationClassification } from "./oxidationClassification";
import { ConfidenceScore } from "./aiConfidenceScoring";

// ============================================================================
// PRACTITIONER ANNOTATIONS (v1.6.0)
// ============================================================================

/**
 * Annotation type - categorizes the kind of practitioner note
 */
export type AnnotationType =
  | "insight_review" // Review/modification of AI insights
  | "mineral_note" // Note about specific mineral
  | "ratio_note" // Note about specific ratio
  | "oxidation_note" // Note about oxidation classification
  | "general_note" // General practitioner observation
  | "override"; // Complete override of AI interpretation

/**
 * Override status - tracks practitioner review state
 */
export type OverrideStatus =
  | "reviewed" // Practitioner reviewed and agrees with AI
  | "modified" // Practitioner modified AI interpretation
  | "replaced" // Practitioner completely replaced AI interpretation
  | "flagged"; // Practitioner flagged for further review

/**
 * Individual practitioner annotation
 */
export interface PractitionerAnnotation {
  /** Unique annotation ID (UUID v4) */
  readonly id: string;

  /** Type of annotation */
  readonly type: AnnotationType;

  /** Target element (e.g., "ca", "ca_mg", "ai_insights", "oxidation") */
  readonly target: string;

  /** Annotation text content */
  readonly content: string;

  /** Override status (optional, only for insight_review type) */
  readonly overrideStatus?: OverrideStatus;

  /** Original AI content (for comparison, only if modified/replaced) */
  readonly originalContent?: string;

  /** Practitioner name/ID who created annotation */
  readonly practitionerId: string;

  /** Practitioner name for display */
  readonly practitionerName: string;

  /** ISO 8601 timestamp when annotation was created */
  readonly createdAt: string;

  /** ISO 8601 timestamp when annotation was last updated (optional) */
  readonly updatedAt?: string;

  /** Whether this annotation should appear in client-facing reports */
  readonly visibleToClient: boolean;
}

// ============================================================================
// REFERENCE RANGE VERSIONING (v1.7.0)
// ============================================================================

/**
 * Change type for a specific mineral's reference range
 */
export type RangeChangeType =
  | "created" // New mineral added to reference ranges
  | "min_increased" // Minimum ideal value increased
  | "min_decreased" // Minimum ideal value decreased
  | "max_increased" // Maximum ideal value increased
  | "max_decreased" // Maximum ideal value decreased
  | "range_widened" // Both min and max changed to widen range
  | "range_narrowed" // Both min and max changed to narrow range
  | "range_shifted" // Range moved up or down without size change
  | "unit_changed" // Unit of measurement changed
  | "deprecated"; // Mineral no longer in standard panel

/**
 * Individual change to a mineral's reference range
 */
export interface RangeChange {
  /** Mineral symbol (e.g., "Ca", "Mg") */
  readonly mineralSymbol: string;

  /** Type of change */
  readonly changeType: RangeChangeType;

  /** Previous min value (if applicable) */
  readonly oldMin?: number;

  /** New min value (if applicable) */
  readonly newMin?: number;

  /** Previous max value (if applicable) */
  readonly oldMax?: number;

  /** New max value (if applicable) */
  readonly newMax?: number;

  /** Previous unit (if changed) */
  readonly oldUnit?: string;

  /** New unit (if changed) */
  readonly newUnit?: string;

  /** Clinical rationale for the change */
  readonly rationale: string;

  /** Research citations supporting the change */
  readonly citations?: ReadonlyArray<string>;
}

/**
 * Reference Range Version
 * Tracks a specific version of mineral reference ranges
 */
export interface ReferenceRangeVersion {
  /** Unique version identifier (e.g., "1.0.0", "1.1.0") */
  readonly version: string;

  /** Human-readable version name (e.g., "TEI 2024 Update") */
  readonly name: string;

  /** Reference standard source (e.g., "TEI", "DDI", "ARL") */
  readonly standard: string;

  /** ISO 8601 timestamp when version was created */
  readonly createdAt: string;

  /** ISO 8601 timestamp when version becomes effective */
  readonly effectiveDate: string;

  /** ISO 8601 timestamp when version is deprecated (if applicable) */
  readonly deprecatedAt?: string;

  /** Version this supersedes (if applicable) */
  readonly supersedes?: string;

  /** List of changes from previous version */
  readonly changes: ReadonlyArray<RangeChange>;

  /** Practitioner who created/approved this version */
  readonly createdBy: string;

  /** Additional notes about this version */
  readonly notes?: string;

  /** Whether this is the currently active version */
  readonly isActive: boolean;

  /** Complete mineral ranges for this version (snapshot) */
  readonly mineralRanges: ReadonlyArray<{
    readonly symbol: string;
    readonly name: string;
    readonly minIdeal: number;
    readonly maxIdeal: number;
    readonly unit: string;
  }>;
}

/**
 * Statistics about range version usage
 */
export interface RangeVersionStats {
  /** Version identifier */
  readonly version: string;

  /** Number of analyses using this version */
  readonly analysisCount: number;

  /** First analysis using this version */
  readonly firstUsed?: string;

  /** Most recent analysis using this version */
  readonly lastUsed?: string;

  /** Whether migration is recommended */
  readonly migrationRecommended: boolean;
}

// ============================================================================
// TOXIC & ADDITIONAL ELEMENTS (Display-Only, Non-Scoring)
// ============================================================================

/**
 * Toxic Element - Environmental context only
 * MUST NOT affect health score, oxidation classification, or AI insights
 */
export interface ToxicElement {
  readonly key: string;
  readonly name: string;
  readonly value: number;
  readonly unit: string;
  readonly referenceHigh: number;
  readonly status: "within" | "elevated";
}

/**
 * Additional Element - Observational context only
 * MUST NOT affect health score, oxidation classification, or AI insights
 */
export interface AdditionalElement {
  readonly key: string;
  readonly name: string;
  readonly value: number;
  readonly unit: string;
  readonly detected: boolean;
}

// ============================================================================
// SNAPSHOT METADATA
// ============================================================================

export interface ReportMetadata {
  /** Unique identifier for this report (UUID v4) */
  readonly reportId: string;

  /** ISO 8601 timestamp when this snapshot was created */
  readonly generatedAt: string;

  /** HTMA Genius application version */
  readonly htmaGeniusVersion: string;

  /** Analysis engine version */
  readonly analysisEngineVersion: string;

  /** AI model used for analysis */
  readonly aiModel: string;

  /** Prompt template version */
  readonly promptVersion: string;

  /** Reference range version used for this analysis */
  readonly referenceRangeVersion: string;

  /** Whether practitioner mode was enabled */
  readonly isPractitionerMode: boolean;
}

// ============================================================================
// MINERAL DATA
// ============================================================================

export interface MineralSnapshot {
  readonly symbol: string;
  readonly name: string;
  readonly value: number;
  readonly unit: string;
  readonly minIdeal: number;
  readonly maxIdeal: number;
  readonly status: MineralStatus;
}

// ============================================================================
// RATIO DATA
// ============================================================================

export interface RatioSnapshot {
  readonly name: string;
  readonly numerator: string;
  readonly denominator: string;
  readonly value: number;
  readonly minIdeal: number;
  readonly maxIdeal: number;
  readonly status: MineralStatus;
  readonly clinicalSignificance: string;
}

// ============================================================================
// PATIENT INFORMATION (Optional)
// ============================================================================

export interface PatientInfo {
  readonly name?: string;
  readonly testDate?: string;
}

// ============================================================================
// COMPLETE REPORT SNAPSHOT
// ============================================================================

export interface ReportSnapshot {
  /** Report metadata - versions, timestamps, IDs */
  readonly metadata: ReportMetadata;

  /** Patient information (optional) */
  readonly patientInfo: PatientInfo;

  /** All 15 mineral measurements with reference ranges and status */
  readonly minerals: ReadonlyArray<MineralSnapshot>;

  /** All 6 calculated ratios with reference ranges and status */
  readonly ratios: ReadonlyArray<RatioSnapshot>;

  /** Complete AI-generated insights text (immutable) */
  readonly aiInsights: string;

  /** Health score breakdown (optional, added v1.1.0) */
  readonly healthScore?: HealthScoreBreakdown;

  /** Score delta explanation (optional, added v1.1.0) */
  readonly scoreDelta?: ScoreDeltaExplanation;

  /** Change focus summary (optional, added v1.1.0) */
  readonly focusSummary?: ChangeFocusSummary;

  /** Trend analysis (optional, added v1.2.0) */
  readonly trendAnalysis?: TrendExplanation;

  /** Oxidation type classification (optional, added v1.3.0) */
  readonly oxidationClassification?: OxidationClassification;

  /** Toxic elements (optional, added v1.4.0) - Display-only, non-scoring */
  readonly toxicElements?: ReadonlyArray<ToxicElement>;

  /** Additional elements (optional, added v1.4.0) - Display-only, non-scoring */
  readonly additionalElements?: ReadonlyArray<AdditionalElement>;

  /** AI confidence score (optional, added v1.5.0) - Evidence-based confidence */
  readonly aiConfidence?: ConfidenceScore;

  /** Practitioner annotations (optional, added v1.6.0) - Review and override system */
  readonly practitionerAnnotations?: ReadonlyArray<PractitionerAnnotation>;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isValidReportSnapshot(obj: any): obj is ReportSnapshot {
  return (
    obj &&
    typeof obj === "object" &&
    obj.metadata &&
    typeof obj.metadata.reportId === "string" &&
    typeof obj.metadata.generatedAt === "string" &&
    Array.isArray(obj.minerals) &&
    obj.minerals.length === 15 &&
    Array.isArray(obj.ratios) &&
    obj.ratios.length === 6 &&
    typeof obj.aiInsights === "string" &&
    // healthScore, scoreDelta, focusSummary, and trendAnalysis are optional (added in v1.1.0+)
    (obj.healthScore === undefined || typeof obj.healthScore === "object") &&
    (obj.scoreDelta === undefined || typeof obj.scoreDelta === "object") &&
    (obj.focusSummary === undefined || typeof obj.focusSummary === "object") &&
    (obj.trendAnalysis === undefined ||
      typeof obj.trendAnalysis === "object") &&
    // toxicElements and additionalElements are optional (added in v1.4.0)
    (obj.toxicElements === undefined || Array.isArray(obj.toxicElements)) &&
    (obj.additionalElements === undefined ||
      Array.isArray(obj.additionalElements))
  );
}
