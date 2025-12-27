/**
 * EXAMPLE: How to Integrate Toxic & Additional Elements Panels
 *
 * This file demonstrates the exact code needed to display toxic and additional
 * elements panels in the main index.tsx page.
 *
 * IMPORTANT: This is an EXAMPLE only. Do not run this file directly.
 * Copy the relevant sections into your src/pages/index.tsx file.
 */

// ============================================================================
// STEP 1: Add Imports at Top of index.tsx
// ============================================================================

import ToxicElementsPanel from "../components/ToxicElementsPanel";
import AdditionalElementsPanel from "../components/AdditionalElementsPanel";
import { ToxicElement, AdditionalElement } from "../lib/reportSnapshot";
import {
  getToxicElementReference,
  getAdditionalElementReference,
} from "../lib/htmaConstants";

// ============================================================================
// STEP 2: Add State Variables (inside Home component)
// ============================================================================

export default function Home() {
  // ... existing state variables ...

  const [toxicElements, setToxicElements] = useState<ToxicElement[]>([]);
  const [additionalElements, setAdditionalElements] = useState<
    AdditionalElement[]
  >([]);

  // ... rest of component ...
}

// ============================================================================
// STEP 3: Create Demo Data (for testing - add after handleAnalyze success)
// ============================================================================

// Inside handleAnalyze(), after setInsights() and setHealthScore():

// DEMO: Create sample toxic elements data
const demoToxic: ToxicElement[] = [
  {
    key: "Hg",
    name: "Mercury",
    value: 1.2,
    unit: "mg%",
    referenceHigh: 0.8,
    status: "elevated",
  },
  {
    key: "Pb",
    name: "Lead",
    value: 0.4,
    unit: "mg%",
    referenceHigh: 0.6,
    status: "within",
  },
  {
    key: "Cd",
    name: "Cadmium",
    value: 0.08,
    unit: "mg%",
    referenceHigh: 0.06,
    status: "elevated",
  },
  {
    key: "Al",
    name: "Aluminum",
    value: 0.5,
    unit: "mg%",
    referenceHigh: 1.0,
    status: "within",
  },
];

const demoAdditional: AdditionalElement[] = [
  {
    key: "Li",
    name: "Lithium",
    value: 0.005,
    unit: "mg%",
    detected: true,
  },
  {
    key: "Ni",
    name: "Nickel",
    value: 0.012,
    unit: "mg%",
    detected: true,
  },
  {
    key: "Sr",
    name: "Strontium",
    value: 0,
    unit: "mg%",
    detected: false,
  },
  {
    key: "Ba",
    name: "Barium",
    value: 0.003,
    unit: "mg%",
    detected: true,
  },
];

setToxicElements(demoToxic);
setAdditionalElements(demoAdditional);

// ============================================================================
// STEP 4: Process Real User Input (alternative to demo data)
// ============================================================================

// If you add toxic/additional element inputs to the form:
function processToxicElements(formData: any): ToxicElement[] {
  const elements: ToxicElement[] = [];

  // Example: Process mercury input
  if (formData.mercury) {
    const value = parseFloat(formData.mercury);
    const ref = getToxicElementReference("Hg");
    if (ref) {
      elements.push({
        key: ref.key,
        name: ref.name,
        value,
        unit: ref.unit,
        referenceHigh: ref.referenceHigh,
        status: value > ref.referenceHigh ? "elevated" : "within",
      });
    }
  }

  // Repeat for other toxic elements: Pb, Cd, As, Al, Be, Sb

  return elements;
}

function processAdditionalElements(formData: any): AdditionalElement[] {
  const elements: AdditionalElement[] = [];

  // Example: Process lithium input
  if (formData.lithium !== undefined) {
    const value = parseFloat(formData.lithium) || 0;
    const ref = getAdditionalElementReference("Li");
    if (ref) {
      elements.push({
        key: ref.key,
        name: ref.name,
        value,
        unit: ref.unit,
        detected: value > 0,
      });
    }
  }

  // Repeat for other additional elements: Ni, Sr, Ba, Bi, Rb, Ge, Pt, Ti, V, Sn, W, Zr

  return elements;
}

// ============================================================================
// STEP 5: Add Panels to JSX (in the results section)
// ============================================================================

// Find this section in index.tsx:
{
  /* Oxidation Type Classification */
}
{
  oxidationClassification && hasAnalyzed && (
    <>
      <OxidationTypeCard
        classification={oxidationClassification}
        isPractitioner={isPractitionerMode}
      />
      {isPractitionerMode && currentAnalysisId && (
        <PractitionerFeedbackInline
          context="oxidation_pattern"
          analysisId={currentAnalysisId}
        />
      )}
    </>
  );
}

// ADD THESE PANELS RIGHT AFTER THE OXIDATION TYPE CARD:

{
  /* Toxic Elements Panel */
}
{
  toxicElements && toxicElements.length > 0 && (
    <ToxicElementsPanel
      toxicElements={toxicElements}
      isPractitionerMode={isPractitionerMode}
    />
  );
}

{
  /* Additional Elements Panel */
}
{
  additionalElements && additionalElements.length > 0 && (
    <AdditionalElementsPanel
      additionalElements={additionalElements}
      isPractitionerMode={isPractitionerMode}
    />
  );
}

// ============================================================================
// STEP 6: Include in PDF Snapshot
// ============================================================================

// Find the createReportSnapshot() call in your code and add the optional fields:

const snapshot = createReportSnapshot({
  mineralData,
  aiInsights,
  isPractitionerMode,
  patientName: patientInfo.name,
  testDate: patientInfo.testDate,
  healthScore,
  scoreDelta,
  focusSummary,
  trendAnalysis,
  oxidationClassification,
  // NEW: Add toxic and additional elements
  toxicElements: toxicElements.length > 0 ? toxicElements : undefined,
  additionalElements:
    additionalElements.length > 0 ? additionalElements : undefined,
});

// ============================================================================
// STEP 7: Save to Database (if using saveAnalysis)
// ============================================================================

// In your saveAnalysis function, make sure to include the data:

const response = await fetch("/api/save-analysis", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    userId: user.uid,
    mineralData: data,
    insights,
    isPractitionerMode,
    // NEW: Include toxic and additional elements
    toxicElements,
    additionalElements,
  }),
});

// ============================================================================
// STEP 8: Load Saved Analyses (handleLoadAnalysis)
// ============================================================================

const handleLoadAnalysis = (analysis: any) => {
  setMineralData(analysis.mineralData);
  setInsights(analysis.insights);
  setHasAnalyzed(true);
  setHealthScore(analysis.healthScore || null);
  setOxidationClassification(analysis.oxidationClassification || null);

  // NEW: Load toxic and additional elements if they exist
  setToxicElements(analysis.toxicElements || []);
  setAdditionalElements(analysis.additionalElements || []);

  // ... rest of function
};

// ============================================================================
// COMPLETE EXAMPLE FLOW
// ============================================================================

/**
 * 1. User enters mineral data (+ optionally toxic/additional elements)
 * 2. handleAnalyze processes data:
 *    - Calls /api/analyze for AI insights (15 minerals only)
 *    - Calculates health score (15 minerals only)
 *    - Classifies oxidation (Ca, Mg, Na, K only)
 *    - Processes toxic elements (if present)
 *    - Processes additional elements (if present)
 * 3. UI displays:
 *    - MineralChart (15 minerals)
 *    - AIInsights (based on 15 minerals)
 *    - HealthScoreCard (based on 15 minerals)
 *    - OxidationTypeCard (based on Ca/Mg/Na/K)
 *    - ToxicElementsPanel (display-only, collapsed)
 *    - AdditionalElementsPanel (display-only, collapsed)
 * 4. PDF includes all sections with clear disclaimers
 * 5. Snapshot saved to database with full audit trail
 */

// ============================================================================
// IMPORTANT NOTES
// ============================================================================

/**
 * ⚠️ SAFETY REMINDERS:
 *
 * 1. Toxic/additional elements NEVER affect:
 *    - Health score calculation
 *    - Oxidation classification
 *    - AI insights
 *    - Change coaching
 *    - Score deltas
 *    - Trend analysis
 *
 * 2. Always include disclaimers:
 *    - "Environmental context only"
 *    - "Not diagnostic"
 *    - "Not used in scoring or analysis"
 *
 * 3. Panels must be collapsed by default
 *
 * 4. No AI interpretation of toxic/additional elements
 *
 * 5. Reference values from htmaConstants.ts are TEI-aligned
 */

/**
 * 🎨 CUSTOMIZATION OPTIONS:
 *
 * - Change default collapsed state in component props
 * - Customize colors in component styles
 * - Add/remove elements from TOXIC_ELEMENT_REFERENCES
 * - Adjust reference thresholds (with documentation)
 * - Show/hide panels based on user role
 */

/**
 * 🧪 TESTING RECOMMENDATIONS:
 *
 * 1. Test with no toxic/additional data (should hide panels)
 * 2. Test with mixed elevated/within reference values
 * 3. Test practitioner mode toggle
 * 4. Generate PDF with and without elements
 * 5. Verify old analyses load correctly
 * 6. Confirm health score unchanged when toxic elements present
 */
