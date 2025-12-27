/**
 * Reference Range Version Engine
 *
 * Manages versioning of mineral reference ranges, enabling:
 * - Historical tracking of range changes
 * - Impact analysis when ranges are updated
 * - Migration of old analyses to new ranges
 * - Audit trail for clinical compliance
 *
 * @module rangeVersionEngine
 * @version 1.7.0
 */

import { v4 as uuidv4 } from "uuid";
import {
  ReferenceRangeVersion,
  RangeChange,
  RangeChangeType,
  RangeVersionStats,
} from "./reportSnapshot";
import {
  MINERAL_REFERENCE_RANGES,
  MineralReferenceRange,
} from "./htmaConstants";

// ============================================================================
// VERSION CREATION & MANAGEMENT
// ============================================================================

/**
 * Parameters for creating a new reference range version
 */
export interface CreateVersionParams {
  /** Version identifier (semver format recommended: "1.0.0") */
  version: string;

  /** Human-readable name */
  name: string;

  /** Reference standard (e.g., "TEI", "DDI", "ARL") */
  standard: string;

  /** When this version becomes effective */
  effectiveDate: string;

  /** Version this supersedes (optional) */
  supersedes?: string;

  /** Changes from previous version */
  changes: ReadonlyArray<RangeChange>;

  /** Who created this version */
  createdBy: string;

  /** Additional notes */
  notes?: string;

  /** Complete mineral ranges for this version */
  mineralRanges: ReadonlyArray<MineralReferenceRange>;
}

/**
 * Create a new reference range version
 */
export function createReferenceRangeVersion(
  params: CreateVersionParams
): ReferenceRangeVersion {
  const now = new Date().toISOString();

  return {
    version: params.version,
    name: params.name,
    standard: params.standard,
    createdAt: now,
    effectiveDate: params.effectiveDate,
    supersedes: params.supersedes,
    changes: params.changes,
    createdBy: params.createdBy,
    notes: params.notes,
    isActive: new Date(params.effectiveDate) <= new Date(),
    mineralRanges: params.mineralRanges.map((range) => ({
      symbol: range.symbol,
      name: range.name,
      minIdeal: range.minIdeal,
      maxIdeal: range.maxIdeal,
      unit: range.unit,
    })),
  };
}

/**
 * Create initial version from current constants
 */
export function createInitialVersion(createdBy: string): ReferenceRangeVersion {
  return createReferenceRangeVersion({
    version: "1.0.0",
    name: "TEI Standard Ranges (Initial)",
    standard: "TEI (Trace Elements Inc.)",
    effectiveDate: new Date().toISOString(),
    changes: [],
    createdBy,
    notes: "Initial reference ranges imported from TEI standards",
    mineralRanges: [...MINERAL_REFERENCE_RANGES],
  });
}

/**
 * Mark a version as deprecated
 */
export function deprecateVersion(
  version: ReferenceRangeVersion,
  deprecatedAt: string = new Date().toISOString()
): ReferenceRangeVersion {
  return {
    ...version,
    deprecatedAt,
    isActive: false,
  };
}

/**
 * Activate a version (make it the current active version)
 */
export function activateVersion(
  version: ReferenceRangeVersion
): ReferenceRangeVersion {
  return {
    ...version,
    isActive: true,
    deprecatedAt: undefined,
  };
}

// ============================================================================
// VERSION COMPARISON
// ============================================================================

/**
 * Comparison result for a single mineral
 */
export interface MineralComparison {
  readonly symbol: string;
  readonly name: string;
  readonly changed: boolean;
  readonly oldMin?: number;
  readonly newMin?: number;
  readonly oldMax?: number;
  readonly newMax?: number;
  readonly minChange?: number; // Absolute change
  readonly maxChange?: number; // Absolute change
  readonly minChangePercent?: number; // Percentage change
  readonly maxChangePercent?: number; // Percentage change
  readonly impactLevel: "none" | "minor" | "moderate" | "major";
}

/**
 * Result of comparing two versions
 */
export interface VersionComparison {
  readonly fromVersion: string;
  readonly toVersion: string;
  readonly totalChanges: number;
  readonly mineralsChanged: ReadonlyArray<string>;
  readonly changes: ReadonlyArray<MineralComparison>;
  readonly summary: string;
}

/**
 * Compare two reference range versions
 */
export function compareVersions(
  oldVersion: ReferenceRangeVersion,
  newVersion: ReferenceRangeVersion
): VersionComparison {
  const changes: MineralComparison[] = [];
  const mineralsChanged: string[] = [];

  // Create lookup maps
  const oldRanges = new Map(oldVersion.mineralRanges.map((r) => [r.symbol, r]));
  const newRanges = new Map(newVersion.mineralRanges.map((r) => [r.symbol, r]));

  // Check all minerals in new version
  for (const [symbol, newRange] of newRanges) {
    const oldRange = oldRanges.get(symbol);

    if (!oldRange) {
      // New mineral added
      changes.push({
        symbol,
        name: newRange.name,
        changed: true,
        newMin: newRange.minIdeal,
        newMax: newRange.maxIdeal,
        impactLevel: "major",
      });
      mineralsChanged.push(symbol);
      continue;
    }

    // Compare ranges
    const minChanged = oldRange.minIdeal !== newRange.minIdeal;
    const maxChanged = oldRange.maxIdeal !== newRange.maxIdeal;

    if (minChanged || maxChanged) {
      const minChange = minChanged ? newRange.minIdeal - oldRange.minIdeal : 0;
      const maxChange = maxChanged ? newRange.maxIdeal - oldRange.maxIdeal : 0;

      const minChangePercent = minChanged
        ? ((newRange.minIdeal - oldRange.minIdeal) / oldRange.minIdeal) * 100
        : 0;
      const maxChangePercent = maxChanged
        ? ((newRange.maxIdeal - oldRange.maxIdeal) / oldRange.maxIdeal) * 100
        : 0;

      // Determine impact level
      const maxAbsChangePercent = Math.max(
        Math.abs(minChangePercent),
        Math.abs(maxChangePercent)
      );
      const impactLevel =
        maxAbsChangePercent >= 20
          ? "major"
          : maxAbsChangePercent >= 10
          ? "moderate"
          : "minor";

      changes.push({
        symbol,
        name: newRange.name,
        changed: true,
        oldMin: oldRange.minIdeal,
        newMin: newRange.minIdeal,
        oldMax: oldRange.maxIdeal,
        newMax: newRange.maxIdeal,
        minChange,
        maxChange,
        minChangePercent,
        maxChangePercent,
        impactLevel,
      });
      mineralsChanged.push(symbol);
    } else {
      changes.push({
        symbol,
        name: newRange.name,
        changed: false,
        impactLevel: "none",
      });
    }
  }

  // Check for removed minerals
  for (const [symbol, oldRange] of oldRanges) {
    if (!newRanges.has(symbol)) {
      changes.push({
        symbol,
        name: oldRange.name,
        changed: true,
        oldMin: oldRange.minIdeal,
        oldMax: oldRange.maxIdeal,
        impactLevel: "major",
      });
      mineralsChanged.push(symbol);
    }
  }

  // Generate summary
  const summary = generateComparisonSummary(changes);

  return {
    fromVersion: oldVersion.version,
    toVersion: newVersion.version,
    totalChanges: mineralsChanged.length,
    mineralsChanged,
    changes,
    summary,
  };
}

/**
 * Generate human-readable summary of version comparison
 */
function generateComparisonSummary(
  changes: ReadonlyArray<MineralComparison>
): string {
  const changedCount = changes.filter((c) => c.changed).length;
  const majorChanges = changes.filter((c) => c.impactLevel === "major");
  const moderateChanges = changes.filter((c) => c.impactLevel === "moderate");
  const minorChanges = changes.filter((c) => c.impactLevel === "minor");

  if (changedCount === 0) {
    return "No changes to reference ranges";
  }

  const parts: string[] = [];

  if (majorChanges.length > 0) {
    parts.push(
      `${majorChanges.length} major change${majorChanges.length > 1 ? "s" : ""}`
    );
  }
  if (moderateChanges.length > 0) {
    parts.push(
      `${moderateChanges.length} moderate change${
        moderateChanges.length > 1 ? "s" : ""
      }`
    );
  }
  if (minorChanges.length > 0) {
    parts.push(
      `${minorChanges.length} minor change${minorChanges.length > 1 ? "s" : ""}`
    );
  }

  return `${changedCount} total change${
    changedCount > 1 ? "s" : ""
  }: ${parts.join(", ")}`;
}

// ============================================================================
// CHANGE DETECTION & ANALYSIS
// ============================================================================

/**
 * Detect what type of change occurred for a mineral
 */
export function detectChangeType(
  oldRange: { minIdeal: number; maxIdeal: number },
  newRange: { minIdeal: number; maxIdeal: number }
): RangeChangeType {
  const minChanged = oldRange.minIdeal !== newRange.minIdeal;
  const maxChanged = oldRange.maxIdeal !== newRange.maxIdeal;

  if (!minChanged && !maxChanged) {
    return "range_shifted"; // Shouldn't happen in practice
  }

  const minIncreased = newRange.minIdeal > oldRange.minIdeal;
  const maxIncreased = newRange.maxIdeal > oldRange.maxIdeal;

  // Single boundary changes
  if (minChanged && !maxChanged) {
    return minIncreased ? "min_increased" : "min_decreased";
  }
  if (maxChanged && !minChanged) {
    return maxIncreased ? "max_increased" : "max_decreased";
  }

  // Both boundaries changed
  const oldWidth = oldRange.maxIdeal - oldRange.minIdeal;
  const newWidth = newRange.maxIdeal - newRange.minIdeal;

  if (newWidth > oldWidth) {
    return "range_widened";
  } else if (newWidth < oldWidth) {
    return "range_narrowed";
  } else {
    return "range_shifted";
  }
}

/**
 * Calculate the clinical impact of a range change on a specific mineral value
 */
export interface RangeChangeImpact {
  readonly mineralSymbol: string;
  readonly value: number;
  readonly oldStatus: "low" | "optimal" | "high";
  readonly newStatus: "low" | "optimal" | "high";
  readonly statusChanged: boolean;
  readonly impactDescription: string;
}

/**
 * Analyze impact of range change on a specific mineral value
 */
export function analyzeRangeChangeImpact(
  mineralSymbol: string,
  value: number,
  oldRange: { minIdeal: number; maxIdeal: number },
  newRange: { minIdeal: number; maxIdeal: number }
): RangeChangeImpact {
  // Determine old status
  const oldStatus =
    value < oldRange.minIdeal
      ? "low"
      : value > oldRange.maxIdeal
      ? "high"
      : "optimal";

  // Determine new status
  const newStatus =
    value < newRange.minIdeal
      ? "low"
      : value > newRange.maxIdeal
      ? "high"
      : "optimal";

  const statusChanged = oldStatus !== newStatus;

  // Generate description
  let impactDescription = "";
  if (!statusChanged) {
    impactDescription = `Status remains ${oldStatus} under both versions`;
  } else {
    impactDescription = `Status changed from ${oldStatus} to ${newStatus} due to updated reference ranges`;
  }

  return {
    mineralSymbol,
    value,
    oldStatus,
    newStatus,
    statusChanged,
    impactDescription,
  };
}

// ============================================================================
// MIGRATION UTILITIES
// ============================================================================

/**
 * Migration recommendation for a specific analysis
 */
export interface MigrationRecommendation {
  readonly shouldMigrate: boolean;
  readonly reason: string;
  readonly affectedMinerals: ReadonlyArray<string>;
  readonly statusChanges: number;
  readonly severity: "low" | "medium" | "high";
}

/**
 * Determine if an analysis should be migrated to a new version
 */
export function shouldMigrateAnalysis(
  currentVersion: ReferenceRangeVersion,
  targetVersion: ReferenceRangeVersion,
  mineralValues: ReadonlyArray<{ symbol: string; value: number }>
): MigrationRecommendation {
  const comparison = compareVersions(currentVersion, targetVersion);

  if (comparison.totalChanges === 0) {
    return {
      shouldMigrate: false,
      reason: "No changes between versions",
      affectedMinerals: [],
      statusChanges: 0,
      severity: "low",
    };
  }

  // Check which minerals would have status changes
  const affectedMinerals: string[] = [];
  let statusChanges = 0;

  const currentRanges = new Map(
    currentVersion.mineralRanges.map((r) => [r.symbol, r])
  );
  const targetRanges = new Map(
    targetVersion.mineralRanges.map((r) => [r.symbol, r])
  );

  for (const { symbol, value } of mineralValues) {
    const currentRange = currentRanges.get(symbol);
    const targetRange = targetRanges.get(symbol);

    if (currentRange && targetRange) {
      const impact = analyzeRangeChangeImpact(
        symbol,
        value,
        currentRange,
        targetRange
      );

      if (impact.statusChanged) {
        affectedMinerals.push(symbol);
        statusChanges++;
      }
    }
  }

  // Determine severity
  const changeRate = statusChanges / mineralValues.length;
  const severity =
    changeRate >= 0.3 ? "high" : changeRate >= 0.1 ? "medium" : "low";

  // Recommendation logic
  const shouldMigrate =
    statusChanges > 0 && targetVersion.isActive && !currentVersion.isActive;

  const reason = shouldMigrate
    ? `${statusChanges} mineral${
        statusChanges > 1 ? "s" : ""
      } would change status with updated ranges`
    : currentVersion.isActive
    ? "Current version is still active"
    : "No significant impact from version change";

  return {
    shouldMigrate,
    reason,
    affectedMinerals,
    statusChanges,
    severity,
  };
}

// ============================================================================
// VERSION QUERIES & UTILITIES
// ============================================================================

/**
 * Get the active version from a list of versions
 */
export function getActiveVersion(
  versions: ReadonlyArray<ReferenceRangeVersion>
): ReferenceRangeVersion | undefined {
  return versions.find((v) => v.isActive && !v.deprecatedAt);
}

/**
 * Get version by identifier
 */
export function getVersionById(
  versions: ReadonlyArray<ReferenceRangeVersion>,
  versionId: string
): ReferenceRangeVersion | undefined {
  return versions.find((v) => v.version === versionId);
}

/**
 * Get all versions sorted by effective date (newest first)
 */
export function getSortedVersions(
  versions: ReadonlyArray<ReferenceRangeVersion>
): ReadonlyArray<ReferenceRangeVersion> {
  return [...versions].sort(
    (a, b) =>
      new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
  );
}

/**
 * Get version history (chain of superseded versions)
 */
export function getVersionHistory(
  versions: ReadonlyArray<ReferenceRangeVersion>,
  startVersion: string
): ReadonlyArray<ReferenceRangeVersion> {
  const history: ReferenceRangeVersion[] = [];
  let current = getVersionById(versions, startVersion);

  while (current) {
    history.push(current);
    if (!current.supersedes) break;
    current = getVersionById(versions, current.supersedes);
  }

  return history;
}

/**
 * Validate a version identifier (semver format)
 */
export function isValidVersionId(versionId: string): boolean {
  // Basic semver validation: X.Y.Z where X, Y, Z are numbers
  const semverRegex = /^\d+\.\d+\.\d+$/;
  return semverRegex.test(versionId);
}

/**
 * Validate reference range values
 */
export function validateReferenceRange(range: {
  minIdeal: number;
  maxIdeal: number;
}): { valid: boolean; error?: string } {
  if (range.minIdeal >= range.maxIdeal) {
    return {
      valid: false,
      error: "Minimum value must be less than maximum value",
    };
  }

  if (range.minIdeal < 0 || range.maxIdeal < 0) {
    return {
      valid: false,
      error: "Range values must be non-negative",
    };
  }

  return { valid: true };
}

/**
 * Format version for display
 */
export function formatVersionDisplay(version: ReferenceRangeVersion): string {
  const status = version.isActive
    ? "Active"
    : version.deprecatedAt
    ? "Deprecated"
    : "Inactive";

  return `${version.name} (v${version.version}) - ${status}`;
}

/**
 * Format effective date for display
 */
export function formatEffectiveDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Calculate version statistics from analysis data
 */
export function calculateVersionStats(
  version: string,
  analyses: ReadonlyArray<{ version: string; timestamp: string }>
): RangeVersionStats {
  const versionAnalyses = analyses.filter((a) => a.version === version);
  const analysisCount = versionAnalyses.length;

  if (analysisCount === 0) {
    return {
      version,
      analysisCount: 0,
      migrationRecommended: false,
    };
  }

  const timestamps = versionAnalyses.map((a) => a.timestamp).sort();

  const firstUsed = timestamps[0];
  const lastUsed = timestamps[timestamps.length - 1];

  // Recommend migration if last use was more than 90 days ago
  const daysSinceLastUse =
    (Date.now() - new Date(lastUsed).getTime()) / (1000 * 60 * 60 * 24);
  const migrationRecommended = daysSinceLastUse > 90;

  return {
    version,
    analysisCount,
    firstUsed,
    lastUsed,
    migrationRecommended,
  };
}

// ============================================================================
// EXPORT SUMMARY
// ============================================================================

/**
 * EXPORTED FUNCTIONS:
 *
 * Version Creation:
 * - createReferenceRangeVersion() - Create new version
 * - createInitialVersion() - Create initial version from constants
 * - deprecateVersion() - Mark version as deprecated
 * - activateVersion() - Activate a version
 *
 * Version Comparison:
 * - compareVersions() - Compare two versions
 * - detectChangeType() - Detect type of range change
 * - analyzeRangeChangeImpact() - Analyze impact on specific value
 *
 * Migration:
 * - shouldMigrateAnalysis() - Check if migration recommended
 *
 * Queries:
 * - getActiveVersion() - Get currently active version
 * - getVersionById() - Get version by ID
 * - getSortedVersions() - Get versions sorted by date
 * - getVersionHistory() - Get version history chain
 *
 * Validation:
 * - isValidVersionId() - Validate version identifier
 * - validateReferenceRange() - Validate range values
 *
 * Utilities:
 * - formatVersionDisplay() - Format version for display
 * - formatEffectiveDate() - Format date for display
 * - calculateVersionStats() - Calculate usage statistics
 */
