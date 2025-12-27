/**
 * Report Snapshot Creator
 *
 * Creates immutable ReportSnapshot from live mineral data.
 * This ensures all PDF reports are generated from consistent, frozen state.
 *
 * Uses centralized ratio calculation engine for consistency and traceability.
 */

import { v4 as uuidv4 } from "uuid";
import { MineralData } from "../components/HTMAInputForm";
import {
  ReportSnapshot,
  ReportMetadata,
  MineralSnapshot,
  RatioSnapshot,
  PatientInfo,
  ToxicElement,
  AdditionalElement,
  PractitionerAnnotation,
} from "./reportSnapshot";
import {
  MINERAL_REFERENCE_RANGES,
  HTMA_GENIUS_VERSION,
  ANALYSIS_ENGINE_VERSION,
  AI_MODEL,
  PROMPT_VERSION,
  getMineralStatus,
} from "./htmaConstants";
import { calculateAllRatios, MineralValues } from "./ratioEngine";
import { HealthScoreBreakdown } from "./healthScore";
import { ScoreDeltaExplanation } from "./scoreDeltaExplainer";
import { ChangeFocusSummary } from "./changeCoachingEngine";
import { TrendExplanation } from "./trendExplainer";
import { OxidationClassification } from "./oxidationClassification";
import {
  calculateConfidenceScore,
  ConfidenceScore,
} from "./aiConfidenceScoring";

// Default reference range version (will be configurable in the future)
const DEFAULT_REFERENCE_RANGE_VERSION = "1.0.0";

interface CreateSnapshotOptions {
  mineralData: MineralData;
  aiInsights: string;
  isPractitionerMode: boolean;
  patientName?: string;
  testDate?: string;
  healthScore?: HealthScoreBreakdown;
  scoreDelta?: ScoreDeltaExplanation;
  focusSummary?: ChangeFocusSummary;
  trendAnalysis?: TrendExplanation;
  oxidationClassification?: OxidationClassification;
  toxicElements?: ToxicElement[];
  additionalElements?: AdditionalElement[];
  aiConfidence?: ConfidenceScore;
  practitionerAnnotations?: PractitionerAnnotation[];
}

/**
 * Create an immutable snapshot of an HTMA analysis
 *
 * This function freezes all data at a single point in time, ensuring
 * consistency and providing an audit trail for legal/clinical compliance.
 *
 * @param options - Analysis data and metadata
 * @returns Immutable ReportSnapshot
 */
export function createReportSnapshot(
  options: CreateSnapshotOptions
): ReportSnapshot {
  const {
    mineralData,
    aiInsights,
    isPractitionerMode,
    patientName,
    testDate,
    healthScore,
    scoreDelta,
    focusSummary,
    trendAnalysis,
    oxidationClassification,
    toxicElements,
    additionalElements,
    aiConfidence,
    practitionerAnnotations,
  } = options;

  // Create metadata
  const metadata: ReportMetadata = {
    reportId: uuidv4(),
    generatedAt: new Date().toISOString(),
    htmaGeniusVersion: HTMA_GENIUS_VERSION,
    analysisEngineVersion: ANALYSIS_ENGINE_VERSION,
    aiModel: AI_MODEL,
    promptVersion: PROMPT_VERSION,
    referenceRangeVersion: DEFAULT_REFERENCE_RANGE_VERSION,
    isPractitionerMode,
  };

  // Create patient info
  const patientInfo: PatientInfo = {
    name: patientName,
    testDate,
  };

  // Helper to safely parse mineral values
  const getValue = (val: string): number => parseFloat(val) || 0;

  // Extract mineral values from form data
  const mineralValues = {
    Ca: getValue(mineralData.calcium),
    Mg: getValue(mineralData.magnesium),
    Na: getValue(mineralData.sodium),
    K: getValue(mineralData.potassium),
    P: getValue(mineralData.phosphorus),
    Cu: getValue(mineralData.copper),
    Zn: getValue(mineralData.zinc),
    Fe: getValue(mineralData.iron),
    Mn: getValue(mineralData.manganese),
    Cr: getValue(mineralData.chromium),
    Se: getValue(mineralData.selenium),
    B: getValue(mineralData.boron),
    Co: getValue(mineralData.cobalt),
    Mo: getValue(mineralData.molybdenum),
    S: getValue(mineralData.sulfur),
  };

  // Create mineral snapshots using constants
  const minerals: MineralSnapshot[] = MINERAL_REFERENCE_RANGES.map((ref) => {
    const value = mineralValues[ref.symbol as keyof typeof mineralValues];
    const status = getMineralStatus(value, ref.minIdeal, ref.maxIdeal);

    return {
      symbol: ref.symbol,
      name: ref.name,
      value,
      unit: ref.unit,
      minIdeal: ref.minIdeal,
      maxIdeal: ref.maxIdeal,
      status,
    };
  });

  // Create ratio snapshots using centralized ratio engine
  // This ensures consistency across all ratio calculations
  const ratioResults = calculateAllRatios(mineralValues as MineralValues);
  const ratios: RatioSnapshot[] = ratioResults.map((ratioResult) => ({
    name: ratioResult.name,
    numerator: ratioResult.numerator,
    denominator: ratioResult.denominator,
    value: ratioResult.value,
    minIdeal: ratioResult.idealMin,
    maxIdeal: ratioResult.idealMax,
    status: ratioResult.status,
    clinicalSignificance: ratioResult.interpretationKey,
  }));

  // Calculate AI confidence score if not provided
  const calculatedConfidence =
    aiConfidence ||
    calculateConfidenceScore(minerals, ratios, oxidationClassification);

  // Create immutable snapshot
  const snapshot: ReportSnapshot = {
    metadata,
    patientInfo,
    minerals,
    ratios,
    aiInsights,
    healthScore,
    scoreDelta,
    focusSummary,
    trendAnalysis,
    oxidationClassification,
    toxicElements,
    additionalElements,
    aiConfidence: calculatedConfidence,
    practitionerAnnotations,
  };

  // Deep freeze for immutability (development safety)
  if (process.env.NODE_ENV === "development") {
    Object.freeze(snapshot);
    Object.freeze(snapshot.metadata);
    Object.freeze(snapshot.patientInfo);
    Object.freeze(snapshot.minerals);
    Object.freeze(snapshot.ratios);
  }

  return snapshot;
}
