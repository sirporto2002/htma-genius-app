# HTMA Genius – System Overview

**Professional Documentation for Technical Stakeholders, Practitioners, and Cloud Partners**

**Version**: 1.0.0  
**Last Updated**: December 22, 2025  
**Status**: Production-Ready

---

## 1. Product Overview

### What HTMA Genius Is

HTMA Genius is a **Software-as-a-Service (SaaS) application** that analyzes Hair Tissue Mineral Analysis (HTMA) laboratory test results and provides educational interpretations of mineral balance patterns. The platform translates complex mineral data into actionable insights for consumers and healthcare practitioners, while maintaining strict non-diagnostic, educational positioning.

### Target Audiences

**Primary Users:**

- **Consumers**: Individuals who have received HTMA test results and seek to understand their mineral balance patterns
- **Healthcare Practitioners**: Qualified professionals who use HTMA data as one tool in comprehensive patient assessment

**Audience Separation:**
The platform maintains distinct user experiences and interpretation guardrails for each audience, with practitioner mode offering enhanced transparency, validation tools, and technical detail.

### Problems Solved

1. **Complexity Translation**: Converts 15+ mineral values and dozens of ratio calculations into comprehensible health scores and pattern recognition
2. **Longitudinal Tracking**: Enables users to track mineral balance changes over time through saved analyses and trend detection
3. **Pattern Recognition**: Identifies metabolic typing patterns (oxidation types) using deterministic, rule-based classification
4. **Educational Gap**: Bridges the knowledge gap between laboratory values and actionable lifestyle awareness
5. **Practitioner Efficiency**: Provides practitioners with validated analytical tools, transparent reference ranges, and audit-ready reporting

### Critical Non-Medical Positioning

**HTMA Genius explicitly DOES NOT:**

- ❌ Diagnose medical conditions
- ❌ Treat, cure, or prevent any disease
- ❌ Replace professional medical advice
- ❌ Prescribe medications or specific supplement protocols
- ❌ Make medical claims or guarantees
- ❌ Store Protected Health Information (PHI)

**All outputs are:**

- ✅ Educational interpretations only
- ✅ Awareness-building tools
- ✅ Subject to professional medical oversight
- ✅ Accompanied by explicit scope disclaimers

---

## 2. Core Capabilities

### Feature Inventory (Verified in Codebase)

#### 2.1 Mineral Data Input & Validation

- **15 TEI (Trace Elements Inc.) nutritional elements** supported:
  - **Major Minerals**: Calcium (Ca), Magnesium (Mg), Sodium (Na), Potassium (K), Phosphorus (P), Sulfur (S)
  - **Trace Minerals**: Copper (Cu), Zinc (Zn), Iron (Fe), Manganese (Mn), Chromium (Cr), Selenium (Se), Boron (B), Cobalt (Co), Molybdenum (Mo)
- Real-time input validation with range checking
- Support for partial mineral sets (backward compatibility)
- TEI-aligned reference ranges (locked, versioned)

#### 2.2 Health Score Calculation

**Composite Score Algorithm (0-100 scale):**

- **Mineral Status Component (60% weight)**: Measures how many minerals fall within optimal ranges
- **Critical Ratios Component (30% weight)**: Evaluates 7 key mineral ratios (Ca/Mg, Na/K, Ca/P, Zn/Cu, Fe/Cu, Ca/K, Ca/Na)
- **Red Flags Component (10% weight)**: Detects severe deficiencies or toxicities
- **Letter Grade Assignment**: A+ to F based on score thresholds
- **Grading Scale**:
  - 95-100: A+ (Exceptional)
  - 90-94: A (Excellent)
  - 85-89: A- (Very Good)
  - 80-84: B+ (Good)
  - 75-79: B (Above Average)
  - 70-74: B- (Satisfactory)
  - 65-69: C+ (Fair)
  - 60-64: C (Needs Improvement)
  - 55-59: C- (Below Average)
  - 50-54: D (Concerning)
  - <50: F (Critical Attention Needed)

#### 2.3 Oxidation Type Classification (Rule-Based)

**Deterministic Classification System v1.0.1:**

- **Four Canonical Types**:
  - **Fast Oxidizer**: Rapid metabolic rate indicators (Ca/K < 2.5, Na/K > 2.8, Ca/Mg < 6)
  - **Slow Oxidizer**: Slower metabolic rate indicators (Ca/K > 10, Na/K < 1.8, Ca/Mg > 10)
  - **Balanced Oxidizer**: All or most indicators within optimal ranges
  - **Mixed Oxidizer**: Conflicting signals suggesting adaptive or transitional state
- **Confidence Scoring**: High, Moderate, or Low based on signal alignment
- **Ratio-Based Logic**: Uses Ca/K, Na/K, Ca/Mg ratios with locked TEI thresholds
- **No AI Involvement**: Purely deterministic, reproducible classification
- **v1.0.1 Enhancements**:
  - Deterministic explanation generation ("Why this classification?")
  - Threshold proximity warnings (flags values within 5% of classification boundaries)
  - Regression test suite (20 test cases covering all types and edge cases)
  - Validation UI for practitioner transparency

#### 2.4 "Why This Changed" Score Delta Explanation

**Automated Change Analysis:**

- Compares current analysis to previous saved analysis
- Identifies **Delta Drivers**:
  - Mineral-level changes (magnitude, direction)
  - Ratio shifts (improvement or deterioration)
  - Red flag additions or resolutions
- Calculates point-level attribution (e.g., "Magnesium improvement contributed +8 points")
- Generates educational explanations of score changes

#### 2.5 Change Focus Summary (Guardrail-Aware Coaching)

**Non-Prescriptive Focus Guidance:**

- Analyzes score delta drivers to identify **priority focus areas**
- Ranks focus items by importance (0-100 scale) based on:
  - Impact magnitude (point contribution)
  - Clinical significance
  - Change direction (improving/worsening/stable)
- **Primary Focus**: Single highest-priority area
- **Secondary Focus**: 2-4 supporting areas
- **Neutral Language Only**: Uses "monitor," "observe," "review" (never "take," "supplement," "increase")
- **Guardrails-Enforced**: All outputs pass through interpretation safety filter

#### 2.6 Trend Analysis (Longitudinal)

**Requires 3+ Saved Analyses:**

- **Mineral Evolution Tracking**: Visual sparkline charts showing individual mineral trends over time
- **Reference Range Overlay**: Green bands showing TEI optimal ranges
- **Trend Classification**: Improving, declining, or stable for each mineral
- **Score Trajectory**: Overall health score trend with directional indicators
- **Milestone Detection**:
  - Score improvements ≥10 points
  - Reached excellent score (80+)
  - Oxidation pattern changes
  - Balanced oxidation achieved
  - Commitment milestones (5+ analyses)
  - Critical issues resolved

#### 2.7 Professional PDF Report Generation

**Immutable Snapshot Architecture:**

- All PDFs generated from **frozen snapshots** (not live state)
- **Snapshot Contents**:
  - Metadata (report ID, timestamps, engine versions)
  - Patient/test information
  - All 15 mineral values with status indicators
  - All 7 ratio calculations with status
  - AI insights (guardrails-filtered)
  - Health score breakdown
  - Oxidation type classification
- **Guardrails Double-Lock**: Insights filtered at API level AND again at PDF generation
- **Audit Trail**: Report includes version metadata (engine, AI model, prompt version, guardrails version)
- **Professional Formatting**: Multi-page layout with tables, color-coding, and visual hierarchy

#### 2.8 Practitioner Feedback System (Non-Intrusive)

**In-Context Feedback Capture:**

- **Inline Feedback Widgets**: Appear in practitioner mode next to AI-generated insights
- **Thumbs Up/Down Sentiment**: Quick binary feedback
- **Optional Comment Field**: Detailed practitioner notes
- **Contextual Tagging**: Feedback linked to specific contexts (e.g., "mineral_interpretation," "ratio_analysis," "oxidation_pattern")
- **Metadata Capture**: Timestamps, guardrails version, AI model, practitioner ID
- **Privacy**: No patient data stored, only mineral patterns and insight text
- **Non-Blocking**: Fully optional, does not interrupt workflow

#### 2.9 Practitioner Feedback Dashboard

**Analytics & Quality Assurance:**

- **Guardrails Issue Detection**: Identifies contexts with high negative feedback rates (>30%)
- **Pattern Analysis**: Extracts common phrases and concerns from practitioner comments
- **Severity Classification**: High/Medium/Low based on negative feedback percentage
- **Actionable Insights**:
  - Most mentioned concerns
  - Cross-context issues (problems spanning multiple sections)
  - Critical sections requiring immediate attention
- **Version Comparison**: Tracks guardrails effectiveness across versions
- **Recommendation Engine**: Generates specific action items for guardrails refinement

#### 2.10 AI-Powered Insights (Gemini)

**Google Vertex AI Integration:**

- **Model**: Gemini 1.5 Flash (fast, cost-effective)
- **Prompt Engineering**:
  - TEI reference ranges included
  - All 15 minerals with interactions
  - Key ratio analysis (Ca/Mg, Na/K, Ca/P, Zn/Cu, etc.)
  - Metabolic typing patterns
  - Audience-specific guardrails (consumer vs practitioner)
- **Safety Constraints**:
  - No diagnosis or treatment language
  - No disease names or medical conditions
  - No supplement dosages or protocols
  - Educational framing required
- **Output Filtering**: All AI responses pass through `applyGuardrails()` before display

#### 2.11 Saved Analyses & Comparison

**User-Specific Data Persistence:**

- **Cloud Firestore Storage**: Analyses saved per authenticated user
- **Historical Archive**: Unlimited saved analyses (within Firebase quotas)
- **Side-by-Side Comparison**: Select two analyses for detailed comparison view
- **Comparison Features**:
  - Score delta visualization
  - Mineral-by-mineral change tracking
  - Ratio shift analysis
  - Oxidation type transitions
- **Reload Functionality**: Click any saved analysis to restore full detail view

#### 2.12 Analysis Timeline (Progress Visualization)

**Chronological History View:**

- **Timeline Cards**: Each analysis displayed as interactive card with:
  - Date/timestamp
  - Health score with color-coded badge
  - Oxidation type badge
  - Trend indicator (improving/declining/stable)
  - Critical issues count (practitioner mode)
- **Progress Highlights Panel**:
  - Overall progress summary
  - Total analyses count
  - Current oxidation pattern
  - Milestone achievements
- **Mineral Evolution Charts**: 8-mineral tracking (Ca, Mg, Na, K, Fe, Cu, Zn, P)

---

## 3. Scientific / Analytical Foundations (Non-Diagnostic)

### Mineral Balance Analysis

HTMA Genius employs **deterministic, rule-based analysis** grounded in established nutritional science and TEI clinical protocols. All analytical outputs are **educational interpretations**, not medical diagnoses.

**Core Analytical Principles:**

1. **Reference Range Comparison**

   - Each mineral compared against TEI-established optimal ranges
   - Status classification: Optimal, Low, High, Very High, Very Low
   - Locked reference ranges ensure consistency and auditability

2. **Ratio-Based Pattern Detection**

   - Seven critical mineral ratios calculated:
     - **Ca/Mg**: Calcium-Magnesium balance (ideal ~6.7:1)
     - **Na/K**: Sodium-Potassium balance (ideal ~2.5:1)
     - **Ca/P**: Calcium-Phosphorus balance (ideal ~2.6:1)
     - **Zn/Cu**: Zinc-Copper balance (ideal ~6:1)
     - **Fe/Cu**: Iron-Copper relationship
     - **Ca/K**: Thyroid function indicator
     - **Ca/Na**: Adrenal pattern indicator
   - Ratio status assessed against TEI ideal ranges
   - No AI interpretation of ratios (deterministic logic only)

3. **Metabolic Typing (Oxidation Classification)**

   - **Deterministic algorithm** using Ca/K, Na/K, Ca/Mg ratios
   - Signal counting approach: Fast indicators vs Slow indicators
   - Balanced type: All or most indicators optimal
   - Mixed type: Conflicting signals (e.g., fast Ca/K but slow Na/K)
   - Confidence based on signal alignment strength
   - **Zero AI involvement**: Purely mathematical classification

4. **Longitudinal Comparison Logic**

   - **Snapshot-based comparison**: Compares frozen data points, not live state
   - **Change magnitude calculation**: Percentage and absolute changes
   - **Trend direction**: Improving (toward optimal), declining (away from optimal), stable
   - **Point attribution**: Delta drivers mapped to specific score components
   - **Milestone detection**: Predefined thresholds for significant events

5. **Educational Interpretation Framing**
   - All insights framed as "may suggest," "can reflect," "is sometimes associated with"
   - No causal claims or guarantees
   - Emphasis on patterns and correlations, not diagnoses
   - Disclaimer injection at all output points

---

## 4. Guardrails & Safety Architecture

HTMA Genius implements a **multi-layered interpretation safety system** to ensure all user-facing content remains educational, non-diagnostic, and legally compliant.

### Guardrails System Architecture

**Version**: v1.0.0  
**Last Reviewed**: December 21, 2025  
**Location**: [src/lib/interpretationGuardrails.ts](src/lib/interpretationGuardrails.ts)

#### Layer 1: AI Prompt Constraints

**Preventive Guardrails (Input Level):**

- Audience-specific prompts (consumer vs practitioner)
- Explicit rules embedded in AI instructions:
  - "Never diagnose medical conditions"
  - "Avoid disease names, treatments, prescriptions"
  - "Use 'may suggest' instead of 'you have'"
  - "Educational purpose only"
- Model temperature set conservatively (controlled creativity)
- Prompt versioning for auditability

#### Layer 2: Runtime Content Filtering

**Reactive Guardrails (Output Level):**

**Blocked Phrases (RegEx Patterns):**

```
- diagnos(e|is|ed)
- you (have|are|suffer from)
- this means you
- confirms?, definitely, guarantee(d)?
- cure(s|d)?, treat(s|ed|ment)?
- prescribe(d|s)?
- medication, dose
- mg, IU (catches supplement dosages)
- for \d+\s*(days|weeks|months) (timeline promises)
```

**Forbidden Medical Scope:**

```
- cancer, diabetes, autism, ADHD
- schizophrenia, bipolar, suicide
- pregnant, infant, pediatric, child
```

**Enforcement Actions:**

- **Block**: Sentence removed entirely if contains forbidden pattern
- **Soften**: Borderline statements rewritten with softeners ("may suggest," "can reflect")
- **Disclaimer Injection**: Educational disclaimer appended to all outputs

#### Layer 3: Evidence-Based Constraints

**Anti-Hallucination Guardrails:**

- AI insights must reference **specific mineral values or ratios** from user data
- "Empty claims" (vague statements without evidence) flagged and removed
- Practitioner mode: Evidence footnotes included for transparency

#### Layer 4: Audience-Specific Policies

**Consumer Mode:**

- Stricter language constraints
- No raw ratio values or complex technical terms
- Emphasis on lifestyle awareness over clinical detail
- Full disclaimers required

**Practitioner Mode:**

- Technical terminology permitted
- Ratio values and reference ranges visible
- Validation tools and explainability features exposed
- Practitioner-specific disclaimers (positioning as "one tool among many")

#### Layer 5: PDF Double-Lock

**Snapshot-Based Immutability:**

- All PDF content generated from **immutable snapshots**
- AI insights filtered at API level (Layer 2)
- **Second filtering pass** at PDF generation (defense-in-depth)
- Guardrails version stamped on every PDF for audit trail

### Blocked vs Allowed Language Examples

**❌ BLOCKED:**

- "You have adrenal fatigue"
- "This confirms hypothyroidism"
- "Take 500mg magnesium daily for 3 months"
- "Cure your anxiety with zinc supplementation"
- "This pattern is seen in diabetics"

**✅ ALLOWED:**

- "Low magnesium levels may be associated with stress response patterns"
- "Your Ca/Mg ratio suggests reviewing magnesium-rich foods with a practitioner"
- "This pattern sometimes reflects metabolic adaptation"
- "Consider discussing these findings with a qualified healthcare provider"

### Versioning & Auditability

**Guardrails Metadata Tracking:**

- Every analysis tagged with guardrails version
- Guardrails review date stamped
- Removed phrase count logged (practitioner feedback analytics)
- Version comparison enables effectiveness tracking
- Rollback capability if new guardrails version causes issues

---

## 5. Technical Architecture

### System Design Overview

HTMA Genius follows a **modern serverless architecture** deployed on Google Cloud Platform, optimizing for cost-efficiency, scalability, and security.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  Next.js 15.5 React Application (SSR + CSR)                     │
│  - HTMAInputForm.tsx (mineral data entry)                       │
│  - HealthScoreCard.tsx (score visualization)                    │
│  - OxidationTypeCard.tsx (metabolic type display)               │
│  - AnalysisTimeline.tsx (progress tracking)                     │
│  - PractitionerPanel.tsx (feedback widgets)                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                     API ROUTES (Next.js)                        │
│  /api/analyze       → AI insights generation (Gemini)           │
│  /api/save-analysis → Firestore write (snapshot storage)        │
│  /api/get-analyses  → Firestore read (user's saved tests)       │
│  /api/upload        → File handling (future: PDF upload)        │
│  /api/analyze-feedback → Practitioner feedback analytics        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      GOOGLE CLOUD SERVICES                      │
│  ┌──────────────────┐  ┌────────────────┐  ┌─────────────────┐ │
│  │ Firebase Auth    │  │ Firestore DB   │  │ Vertex AI       │ │
│  │ (User Identity)  │  │ (Analyses,     │  │ (Gemini 1.5)    │ │
│  │                  │  │  Feedback)     │  │                 │ │
│  └──────────────────┘  └────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DETERMINISTIC ENGINES                        │
│  - healthScore.ts (composite score calculation)                 │
│  - oxidationClassification.ts (metabolic typing)                │
│  - scoreDeltaExplainer.ts (change attribution)                  │
│  - changeCoachingEngine.ts (focus guidance)                     │
│  - trendExplainer.ts (longitudinal analysis)                    │
│  - interpretationGuardrails.ts (safety filter)                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        OUTPUT LAYER                             │
│  - PDF Report (jsPDF, snapshot-based)                           │
│  - UI Components (React with styled-jsx)                        │
│  - API Responses (JSON, guardrails-filtered)                    │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow: Input → Analysis → Storage → PDF

**1. User Input Phase**

- User enters 15 mineral values via `HTMAInputForm.tsx`
- Client-side validation (numeric ranges, required fields)
- Form submission triggers `handleAnalyze()` function

**2. Analysis Phase**

```typescript
// Parallel execution for performance
const [healthScore, oxidationType, aiInsights] = await Promise.all([
  calculateHealthScore(mineralData), // Deterministic, local
  classifyOxidation(mineralData), // Deterministic, local
  fetch("/api/analyze", { mineralData }), // AI call to Gemini
]);
```

**3. Guardrails Filtering Phase**

```typescript
// All AI insights pass through safety filter
const guardedInsights = applyGuardrails({
  insights: aiInsights,
  recommendations: aiRecommendations,
  ctx: {
    audience: isPractitionerMode ? "practitioner" : "consumer",
    channel: "ui",
    evidence: { abnormalMinerals, abnormalRatios },
  },
});
```

**4. Snapshot Creation Phase**

```typescript
// Freeze all analysis results in immutable snapshot
const snapshot: ReportSnapshot = {
  metadata: {
    reportId: uuid(),
    createdAt: new Date().toISOString(),
    analysisEngineVersion: "1.4.0",
    aiModel: "gemini-1.5-flash",
    promptVersion: "1.0",
    guardrailsVersion: "1.0.0",
  },
  patientInfo: {
    /* optional demographics */
  },
  minerals: [
    /* frozen mineral values + statuses */
  ],
  ratios: [
    /* frozen ratio calculations + statuses */
  ],
  aiInsights: guardedInsights, // Already filtered
  healthScore: {
    /* frozen breakdown */
  },
  oxidationType: {
    /* frozen classification */
  },
};
```

**5. Storage Phase**

```typescript
// Save to Firestore (user-scoped collection)
await db
  .collection("analyses")
  .doc(userId)
  .collection("userAnalyses")
  .add(snapshot);
```

**6. Retrieval & Display Phase**

- `SavedAnalyses` component fetches user's analyses
- Click on analysis → load snapshot → render in UI
- No recalculation: Display frozen snapshot exactly as saved

**7. PDF Generation Phase**

```typescript
// Generate PDF from immutable snapshot (not live state)
await generateHTMAPDFReport(snapshot);

// Inside PDF generator:
// - Second guardrails pass (defense-in-depth)
// - Layout mineral table
// - Layout ratio table
// - Render AI insights (already guarded)
// - Include metadata footer (version audit trail)
```

### Snapshot-Based Immutability

**Why Snapshots?**

1. **Consistency**: PDFs always match what user saw on screen
2. **Auditability**: Complete analysis state preserved with version metadata
3. **Reproducibility**: Regenerate PDF anytime without recalculation drift
4. **Legal Defense**: Timestamped, versioned records for compliance
5. **Rollback Safety**: Engine updates don't retroactively change old analyses

**Snapshot Structure:**

```typescript
interface ReportSnapshot {
  metadata: {
    reportId: string; // UUID
    createdAt: string; // ISO timestamp
    analysisEngineVersion: string;
    aiModel: string;
    promptVersion: string;
    guardrailsVersion: string;
  };
  patientInfo?: {
    /* optional */
  };
  minerals: MineralResult[]; // Frozen values + statuses
  ratios: RatioResult[]; // Frozen calculations + statuses
  aiInsights: string; // Guardrails-filtered
  healthScore: HealthScoreBreakdown;
  oxidationType?: OxidationClassification;
}
```

---

## 6. Technology Stack

### Frontend

**Framework & Libraries:**

- **Next.js 15.5.0**: React meta-framework (App Router + Pages Router hybrid)
- **React 19.1.0**: UI component library
- **TypeScript 5**: Type-safe development
- **styled-jsx**: CSS-in-JS for component styling
- **Sonner**: Toast notification system
- **Recharts 3.6.0**: Chart visualization library

**Key Frontend Components:**

- `HTMAInputForm.tsx`: 15-element mineral data entry
- `MineralChart.tsx`: Visual chart with reference range bars
- `HealthScoreCard.tsx`: Score display with letter grade
- `OxidationTypeCard.tsx`: Metabolic type visualization (consumer + practitioner views)
- `AnalysisTimeline.tsx`: Chronological history cards
- `MineralEvolutionChart.tsx`: Sparkline trend charts
- `ProgressHighlights.tsx`: Milestone detection and achievements
- `ComparisonView.tsx`: Side-by-side analysis comparison
- `PractitionerFeedbackInline.tsx`: In-context feedback widgets
- `OxidationValidation.tsx`: Regression test UI (practitioner-only)

### Backend

**API Framework:**

- **Next.js API Routes**: Serverless functions (`/api/*`)
- **Node.js 20**: Runtime environment

**Key API Endpoints:**

- `POST /api/analyze`: Gemini AI insights generation
  - Input: Mineral data object
  - Output: Guardrails-filtered insights
- `POST /api/save-analysis`: Firestore snapshot write
  - Input: Complete analysis snapshot
  - Output: Document ID
- `GET /api/get-analyses`: User's saved analyses retrieval
  - Input: User ID (from auth)
  - Output: Array of snapshots
- `POST /api/analyze-feedback`: Practitioner feedback analytics
  - Input: User ID, filters
  - Output: Patterns, issues, insights, version comparison

### Cloud Infrastructure

**Platform:** Google Cloud Platform (GCP)

**Services:**

- **Firebase Hosting**: Next.js app deployment (static + serverless)
- **Cloud Run**: Serverless container hosting (backend API fallback, if needed)
- **Firestore**: NoSQL document database
  - Collections: `analyses`, `practitionerFeedback`
  - User-scoped subcollections for data isolation
- **Firebase Authentication**: User identity management
  - Providers: Email/Password, Google OAuth
- **Vertex AI**: Gemini API access
  - Model: `gemini-1.5-flash`
  - Region: `us-central1`

**Environment Configuration:**

- `.env.local`: Local development secrets
- Firebase environment variables for production
- Separation of client (public) and server (private) credentials

### AI Integration

**Model:** Google Gemini 1.5 Flash

- **Access Method**: Vertex AI REST API (via Cloud Run backend or direct SDK)
- **Prompt Engineering**: Structured prompts with TEI context
- **Safety Settings**: Conservative thresholds for harmful content
- **Temperature**: 0.7 (balanced creativity + consistency)
- **Max Tokens**: ~2000 (typical response length)

**Prompt Structure:**

```
HTMA GENIUS ANALYSIS REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANALYSIS ENGINE VERSION: 1.4.0
PROMPT VERSION: 1.0
AI MODEL: gemini-1.5-flash
REFERENCE STANDARD: TEI (Trace Elements Inc.)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are an expert in Hair Tissue Mineral Analysis...

[Mineral values, ratio analysis requirements, guardrails]
```

### Database & Authentication

**Firestore Schema:**

```
/analyses/{userId}/userAnalyses/{analysisId}
  - ReportSnapshot document
  - Indexed by createdAt for chronological retrieval

/practitionerFeedback/{feedbackId}
  - sentiment: 'positive' | 'negative'
  - context: string (e.g., 'mineral_interpretation')
  - comment: string
  - metadata: { guardrailsVersion, aiModel, timestamp }
```

**Firebase Auth:**

- Email/password authentication
- Google OAuth provider
- Client SDK: `firebase@12.7.0`
- Admin SDK: `firebase-admin@13.5.0`

### PDF Generation

**Libraries:**

- **jsPDF 3.0.4**: Core PDF creation library
- **jspdf-autotable 5.0.2**: Table layout plugin
- **html2canvas 1.4.1**: Potential future use for chart rendering

**PDF Architecture:**

- **Input**: Immutable `ReportSnapshot`
- **Processing**:
  - Guardrails double-filtering
  - Layout mineral table (all 15 elements)
  - Layout ratio table (7 ratios)
  - Render AI insights with disclaimers
  - Health score summary
  - Oxidation type summary (v1.0.1+)
- **Output**: Downloaded PDF file (`HTMA_Report_${reportId}.pdf`)

---

## 7. Deployment & Infrastructure

### Deployment Platform

**Primary:** Firebase Hosting + Cloud Functions  
**Alternative:** Google Cloud Run (containerized Next.js app)

**Current Setup:**

- `firebase.json` configures hosting with frameworks backend
- Next.js deployed as serverless functions
- Static assets served via Firebase CDN
- API routes execute as Cloud Functions (auto-scaled)

### Serverless Design

**Advantages:**

- **Zero Infrastructure Management**: No server provisioning, patching, or scaling
- **Pay-Per-Use**: Cost only when users access the platform
- **Auto-Scaling**: Handles traffic spikes without manual intervention
- **Global CDN**: Static assets distributed worldwide (Firebase Hosting CDN)

**Serverless Components:**

- **Next.js API Routes**: Each route is a separate Cloud Function
- **Firebase Auth**: Fully managed user authentication
- **Firestore**: Auto-scaling NoSQL database
- **Vertex AI**: Managed AI inference (Gemini API)

### Environment Separation

**Development:**

- Local development server: `npm run dev` (port 3000 or 3008)
- `.env.local` for secrets (not committed to Git)
- Firebase Emulators (optional for offline development)

**Production:**

- Firebase Hosting deployment: `firebase deploy`
- Environment variables via Firebase config
- Production Firestore instance
- Production Firebase Auth project

**Configuration:**

```json
// package.json scripts
{
  "dev": "next dev --turbo",
  "build": "next build --turbo",
  "start": "next start",
  "lint": "eslint"
}
```

### Scalability Characteristics

**Database (Firestore):**

- **Concurrent connections**: 1 million+ (automatic sharding)
- **Writes per second**: 10,000+ (with proper indexing)
- **Reads per second**: Unlimited (eventually consistent reads)
- **Storage**: Unlimited (within Firebase quotas)

**API (Cloud Functions / Cloud Run):**

- **Concurrent executions**: 1,000+ instances (auto-scaled)
- **Cold start**: ~1-2 seconds (Next.js SSR)
- **Warm requests**: <100ms (cached routes)

**AI (Vertex AI):**

- **Rate limits**: Per-project quotas (configurable)
- **Latency**: 2-5 seconds typical (Gemini 1.5 Flash)
- **Concurrency**: Parallel requests supported

### Cost-Conscious Architecture

**Cost Optimization Strategies:**

1. **Gemini 1.5 Flash Selection**

   - Cheapest Gemini model (~5-10x less than Pro)
   - Sufficient for educational insights (not complex reasoning)
   - Fast response times (cost-per-token optimized)

2. **Firestore Document Design**

   - Snapshot storage prevents redundant calculations
   - Denormalized structure (minimal joins)
   - User-scoped subcollections (efficient querying)

3. **Client-Side Calculations**

   - Health score computed in browser (no API call)
   - Oxidation type classified locally (deterministic)
   - Only AI insights require backend API

4. **Serverless Cost Model**

   - Pay only for active requests (no idle server costs)
   - Free tier covers small user bases (Firebase Spark plan)
   - Predictable scaling costs (per-function invocation pricing)

5. **PDF Generation Client-Side**
   - `jsPDF` runs in browser (no server compute)
   - Reduces backend costs for PDF creation
   - Instant generation (no upload/download latency)

**Estimated Costs (Monthly, 100 users with 10 analyses each):**

- Firestore: ~$5 (1,000 writes, 10,000 reads)
- Cloud Functions: ~$3 (1,000 invocations)
- Vertex AI: ~$2 (1,000 Gemini Flash requests)
- Firebase Hosting: $0 (within free tier)
- **Total: ~$10/month** at small scale

---

## 8. Security & Privacy Considerations

### Authentication Approach

**Firebase Authentication:**

- Industry-standard OAuth 2.0 implementation
- Secure token-based session management
- Email verification for email/password accounts
- Google OAuth for single sign-on
- Client SDK handles token refresh automatically
- Server SDK validates tokens on API routes

**Access Control:**

```typescript
// API route protection pattern
export default async function handler(req, res) {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const decodedToken = await admin.auth().verifyIdToken(token);
  const userId = decodedToken.uid;

  // Proceed with authorized request
}
```

### Firestore Security Model

**Security Rules (High-Level):**

```javascript
// Conceptual rules (not exact syntax)
match /analyses/{userId}/userAnalyses/{analysisId} {
  // Users can only read their own analyses
  allow read: if request.auth.uid == userId;

  // Users can only write their own analyses
  allow write: if request.auth.uid == userId;
}

match /practitionerFeedback/{feedbackId} {
  // Authenticated users can create feedback
  allow create: if request.auth != null;

  // Only admins/practitioners can read all feedback
  allow read: if request.auth.token.practitioner == true;
}
```

**Data Isolation:**

- User analyses stored in user-specific subcollections
- No cross-user data access
- Practitioner feedback anonymized (no patient identifiers)

### No PHI Storage Claims

**What We DO Store:**

- Mineral test results (numeric values only, no identifiers)
- User account information (email, UID)
- Analysis snapshots (minerals, ratios, scores)
- Practitioner feedback (comments, sentiment, timestamps)

**What We DO NOT Store:**

- Patient names (optional `patientInfo` not required)
- Medical diagnoses
- Treatment histories
- Prescription information
- Insurance details
- Social Security Numbers
- Protected Health Information (PHI) as defined by HIPAA

**HIPAA Compliance Status:**
HTMA Genius is **not positioned as HIPAA-compliant** in current implementation. Practitioners using the platform should treat it as an educational tool and maintain HIPAA-compliant records in their own systems.

### Separation of Client vs Server Secrets

**Client-Side (Public) Secrets:**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

- Prefixed with `NEXT_PUBLIC_` (exposed to browser)
- Used for Firebase client SDK initialization
- Safe to expose (Firebase security rules enforce access control)

**Server-Side (Private) Secrets:**

```env
AI_BACKEND_URL=https://htma-genius-api-...
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account"...}
```

- Never exposed to browser
- Used in Next.js API routes only
- Access to Vertex AI and Firestore Admin SDK

### Guarded API Access

**Rate Limiting (Future Enhancement):**

- Not yet implemented
- Recommended: API Gateway with rate limits (e.g., 100 requests/hour per user)

**Input Validation:**

- All mineral values validated as numeric
- Range checking (e.g., Calcium: 0-200 mg%)
- SQL injection prevention (Firestore NoSQL, parameterized queries)

**Output Sanitization:**

- All AI insights pass through `applyGuardrails()`
- XSS prevention (React automatic escaping)
- No `dangerouslySetInnerHTML` usage in untrusted content

---

## 9. Practitioner Trust & Validation Features

### Practitioner Mode

**Activation:**

- URL parameter: `?practitioner=true`
- Persisted in `localStorage` (practitioner mode remains active across sessions)
- Deactivation via "Turn Off" button in practitioner badge

**Practitioner-Specific Features:**

1. **Enhanced Transparency**

   - Reference ranges visible on all minerals/ratios
   - TEI standards cited explicitly
   - Raw ratio values displayed (not just status)
   - Confidence levels shown for oxidation type

2. **Validation Tools**

   - **Oxidation Validation Page** (`/practitioner/oxidation-validation`):
     - 20-test regression suite
     - Expected vs Actual classification comparison
     - Pass/fail indicators
     - Explanation for each test case
     - Threshold proximity warnings
     - Summary: Total tests, passes, failures, pass rate
   - Inline feedback widgets for all AI insights
   - Feedback dashboard with analytics

3. **Technical Detail**

   - Mineral status breakdown (optimal/low/high counts)
   - Ratio signal breakdown (fast/slow/balanced indicators)
   - Critical issues list (specific mineral deficiencies/toxicities)
   - Version metadata visible (engine, AI model, guardrails)

4. **Audit Trail**
   - Report ID on every analysis
   - Timestamps (created, modified)
   - Engine version stamped on snapshots
   - Guardrails version tracked for compliance

### Reference Range Visibility

**Consumer View:**

- Simplified visual indicators (color-coded bars)
- "Optimal," "Low," "High" labels
- No numeric ranges shown

**Practitioner View:**

- **Full TEI Reference Ranges Displayed:**

  - Calcium: 35-55 mg%
  - Magnesium: 4-7 mg%
  - Sodium: 20-50 mg%
  - Potassium: 8-18 mg%
  - Phosphorus: 12-16 mg%
  - Copper: 1.1-2.5 mg%
  - Zinc: 13-20 mg%
  - Iron: 0.7-1.6 mg%
  - Manganese: 0.08-0.35 mg%
  - Chromium: 0.03-0.13 mg%
  - Selenium: 0.08-0.19 mg%
  - Boron: 0.5-2 mg%
  - Cobalt: 0.002-0.01 mg%
  - Molybdenum: 0.02-0.06 mg%
  - Sulfur: 4500-5500 mg%

- **Ratio Reference Ranges:**
  - Ca/Mg: 5-8 (ideal ~6.7)
  - Na/K: 2-3 (ideal ~2.5)
  - Ca/P: 2.3-2.8 (ideal ~2.6)
  - Zn/Cu: 5-8 (ideal ~6)
  - Fe/Cu: 0.7-1.3
  - Ca/K: 3-7
  - Ca/Na: 1-2

### Ratio Transparency

**Calculation Visibility:**

```typescript
// Example: Ca/Mg ratio
const calciumValue = 45; // mg%
const magnesiumValue = 6; // mg%
const caMgRatio = (calciumValue / magnesiumValue).toFixed(1); // 7.5

// Displayed to practitioner:
// "Ca/Mg Ratio: 7.5 (Optimal: 5-8)"
```

**Status Interpretation:**

- Optimal: Ratio within TEI ideal range
- Low: Below minimum ideal
- High: Above maximum ideal

### Explanation Traceability

**Oxidation Type Explanation (v1.0.1):**

```
Classified as fast oxidizer based on:
- Ca/K ratio 1.5 indicates fast (< 2.5)
- Na/K ratio 2.75 indicates fast (> 2.8)
- Ca/Mg ratio 5.5 indicates fast (< 6)

Supporting evidence:
- Ca low (supports fast)
- Na elevated (supports fast)
- K within range
```

**Deterministic Logic:**

- Every classification decision traceable to specific ratios/minerals
- No "black box" AI reasoning for oxidation types
- Threshold values explicitly stated
- Supporting mineral status listed

**AI Insight Traceability (Practitioner Mode):**

- Evidence footnotes: "Based on your Ca (45 mg%) and Mg (6 mg%)"
- Guardrails metadata: Version, review date, removed phrase count
- Source mineral/ratio citations

### Feedback Loop Integration

**Practitioner Feedback Workflow:**

1. **Inline Feedback Capture**

   - Practitioner sees AI insight in UI
   - Thumbs up/down widget appears inline
   - Optional comment field opens on click
   - Feedback submitted asynchronously (non-blocking)

2. **Contextual Tagging**

   - Feedback linked to specific context (e.g., "mineral_interpretation," "ratio_analysis")
   - Guardrails version captured
   - AI model version captured
   - Timestamp and practitioner ID logged

3. **Analytics Aggregation**

   - `POST /api/analyze-feedback` endpoint processes all feedback
   - Identifies high negative feedback contexts (>30% negative)
   - Extracts common phrases and concerns
   - Classifies severity (high/medium/low)
   - Generates actionable recommendations

4. **Guardrails Refinement**

   - Negative patterns inform guardrails updates
   - Blocked phrases list expanded based on feedback
   - Version incremented (e.g., v1.0.0 → v1.0.1)
   - A/B testing of guardrails effectiveness (version comparison)

5. **Continuous Improvement Loop**
   - Feedback dashboard reviewed regularly
   - High-severity issues prioritized
   - Guardrails updated and deployed
   - New version feedback compared to previous version
   - Iterative refinement based on real practitioner input

---

## 10. Extensibility & Roadmap Readiness

### Architecture Support for Future Enhancements

HTMA Genius is architected with **extensibility and modularity** as core principles, enabling future feature additions without major refactoring.

#### Additional Rule-Based Engines

**Current Engines:**

- Health Score Calculator (`healthScore.ts`)
- Oxidation Type Classifier (`oxidationClassification.ts`)
- Score Delta Explainer (`scoreDeltaExplainer.ts`)
- Change Coaching Engine (`changeCoachingEngine.ts`)
- Trend Analyzer (`trendExplainer.ts`)

**Future Engine Examples (Architecture-Ready):**

- **Adrenal Pattern Classifier**: Na/K ratio-based sympathetic/parasympathetic typing
- **Thyroid Function Estimator**: Ca/K ratio + T3/T4 mineral correlations
- **Heavy Metal Risk Assessor**: Ratio imbalances suggesting toxic metal burden
- **Methylation Pathway Analyzer**: Copper, Cobalt, Sulfur interaction patterns
- **Bone Health Calculator**: Ca, Mg, P, Boron composite score

**Implementation Pattern:**

```typescript
// New engine template
export function classifyAdrenalPattern(
  minerals: MineralData
): AdrenalClassification {
  const naKRatio = calculateRatio(minerals.sodium, minerals.potassium);

  if (naKRatio < 1.8) return { type: "slow", confidence: "high" };
  if (naKRatio > 2.8) return { type: "fast", confidence: "high" };
  return { type: "balanced", confidence: "moderate" };
}
```

**Integration Points:**

- Add engine import to `index.tsx`
- Create UI component (e.g., `AdrenalPatternCard.tsx`)
- Include in `ReportSnapshot` interface
- Render in PDF generator
- Track in version metadata

#### Practitioner-Only Features

**Current Practitioner-Exclusive Features:**

- Oxidation validation page
- Feedback widgets
- Feedback dashboard
- Enhanced technical detail
- Reference range visibility

**Future Practitioner Features (Architecture-Ready):**

- **Client Management**: Multi-patient tracking with HIPAA-compliant storage
- **Custom Reference Ranges**: Practitioner-defined ideal ranges (overriding TEI defaults)
- **Advanced Comparison**: Side-by-side comparison of 3+ analyses
- **Export to EHR**: Integration with electronic health record systems
- **White-Label Reports**: Practitioner branding on PDF reports
- **Supplement Protocol Builder**: Evidence-based supplement suggestions (guardrails-aware)
- **Lab Integration**: Direct import from TEI or other HTMA labs

**Monetization Readiness:**

- Practitioner mode flag already implemented (`isPractitionerMode` boolean)
- Easy upgrade path: Check subscription status instead of `localStorage` flag
- Firestore schema supports user tiers (e.g., `userTier: 'free' | 'practitioner' | 'enterprise'`)

#### Monetization Tiers (Future)

**Tier Structure (Conceptual):**

**Free Tier:**

- Unlimited analyses
- Basic health score
- Oxidation type classification
- PDF reports with watermark
- Consumer-level insights

**Practitioner Tier ($29/month):**

- All Free features
- Practitioner mode (technical detail)
- Validation tools
- Feedback dashboard access
- Custom branding on PDFs
- Multi-patient management

**Enterprise Tier ($199/month):**

- All Practitioner features
- White-label branding
- API access
- Priority support
- Custom guardrails configuration
- EHR integrations

**Implementation Path:**

1. Add Stripe/Firebase Extensions for billing
2. Create `subscriptions` Firestore collection
3. Gate practitioner features behind subscription check
4. Update Firebase Security Rules to enforce tier access
5. Add billing UI components (subscription management)

#### Continued Scientific Refinement

**Current Versioning System:**

- Analysis Engine: v1.4.0
- Oxidation Engine: v1.0.1
- Guardrails: v1.0.0
- Prompt: v1.0
- Health Score Semantics: v1.0.0

**Refinement Pathways:**

1. **Reference Range Updates**

   - TEI publishes new standards → Update `htmaConstants.ts`
   - Version increment (e.g., Reference Ranges v2.0)
   - Old analyses retain old ranges (snapshot immutability)
   - Migration script optional (recalculate with new ranges)

2. **Guardrails Evolution**

   - Practitioner feedback informs blocked phrases
   - Version increment (e.g., Guardrails v1.1.0)
   - A/B testing via version comparison analytics
   - Rollback capability if effectiveness declines

3. **AI Model Upgrades**

   - Gemini 1.5 Flash → Gemini 2.0 Flash (when available)
   - Update `AI_MODEL` constant in `htmaConstants.ts`
   - Version stamped on new analyses
   - Old analyses retain original model metadata

4. **Scoring Algorithm Refinement**

   - Adjust component weights (e.g., Mineral 60% → 55%, Ratios 30% → 35%)
   - Version increment (e.g., Health Score v2.0.0)
   - Document rationale in changelog
   - Legacy analyses preserve original scores

5. **New Mineral Support**
   - Add iodine, lithium, or other elements
   - Extend `MineralData` interface
   - Backward compatible (optional fields)
   - Update prompt and reference ranges

**Version Audit Trail:**
Every analysis snapshot includes:

```typescript
metadata: {
  analysisEngineVersion: '1.4.0',
  aiModel: 'gemini-1.5-flash',
  promptVersion: '1.0',
  guardrailsVersion: '1.0.0',
  oxidationEngineVersion: '1.0.1',
  healthScoreSemanticsVersion: '1.0.0'
}
```

This enables:

- **Reproducibility**: Regenerate analysis with exact engine versions
- **Compliance**: Demonstrate which guardrails version was active
- **Research**: Compare algorithm effectiveness across versions
- **Rollback**: Identify when bugs were introduced

---

## Conclusion

HTMA Genius represents a **mature, production-ready SaaS platform** that successfully translates complex nutritional science into accessible, guardrails-protected educational tools. The system's architecture prioritizes:

1. **Safety First**: Multi-layered guardrails ensure all outputs remain non-diagnostic and legally compliant
2. **Scientific Rigor**: Deterministic engines grounded in TEI standards and established clinical protocols
3. **Practitioner Trust**: Validation tools, transparent calculations, and feedback loops build professional confidence
4. **Scalability**: Serverless cloud architecture supports growth from 10 to 10,000+ users
5. **Auditability**: Version-stamped snapshots provide complete traceability and compliance documentation
6. **Extensibility**: Modular design enables rapid feature additions without refactoring

**Current Status:**

- ✅ Core features complete and tested
- ✅ Guardrails system operational (v1.0.0)
- ✅ Practitioner validation tools deployed (v1.0.1)
- ✅ Firebase hosting configured
- ✅ Cost-optimized AI integration (Gemini 1.5 Flash)
- ✅ Zero TypeScript errors, production-ready code

**Immediate Next Steps:**

- Production deployment to Firebase Hosting
- User acceptance testing (UAT) with real HTMA data
- Practitioner beta program for feedback collection
- Guardrails effectiveness monitoring
- Performance optimization (caching, lazy loading)

**Long-Term Vision:**

- Multi-tier monetization model (Free, Practitioner, Enterprise)
- EHR integrations for seamless clinical workflow
- Advanced analytics and trend prediction
- White-label solutions for HTMA laboratories
- Mobile application (React Native or PWA)

---

**Document Prepared By:** HTMA Genius Development Team  
**Last Reviewed:** December 22, 2025  
**Next Review:** Quarterly (March 22, 2026)  
**Classification:** Internal / Partner Distribution

---

_This document is provided for informational purposes and reflects the current state of the HTMA Genius codebase. Features and architecture are subject to change. For the most up-to-date technical documentation, refer to the GitHub repository._
