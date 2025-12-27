# HTMA Genius - Audit & Version Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HTMA GENIUS AUDIT FLOW                              │
│                    Versioning & Traceability System                         │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: User Enters Mineral Data                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────┐
                     │  HTMAInputForm          │
                     │  15 Minerals            │
                     └─────────────────────────┘
                                    │
                                    ▼


┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: AI Analysis Request (with Version Headers)                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                     ┌──────────────┴───────────────┐
                     │  generateHTMAPrompt()        │
                     │                              │
                     │  ═════════════════════════   │
                     │  ENGINE: 1.0.0               │
                     │  PROMPT: 1.2.0               │
                     │  AI MODEL: Gemini 1.5 Pro    │
                     │  STANDARD: TEI               │
                     │  ═════════════════════════   │
                     │                              │
                     │  [Full prompt with minerals] │
                     └──────────────┬───────────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │  Cloud Run       │
                          │  Gemini AI       │
                          │  Analysis        │
                          └──────────────────┘
                                    │
                                    ▼
                     ┌──────────────────────────┐
                     │  AI Insights + Metadata  │
                     │  {                       │
                     │    insights: "...",      │
                     │    metadata: {           │
                     │      engineVersion,      │
                     │      promptVersion,      │
                     │      aiModel             │
                     │    }                     │
                     │  }                       │
                     └──────────────────────────┘
                                    │
                                    ▼


┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: Save Analysis (Audit Event: ANALYSIS_CREATED)                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            │                                               │
            ▼                                               ▼
  ┌──────────────────┐                          ┌──────────────────────┐
  │ Generate UUID    │                          │ Calculate Ratios     │
  │ reportId:        │                          │ (ratioEngine.ts)     │
  │ "a1b2c3d4..."    │                          │                      │
  └──────────────────┘                          │ calculateAllRatios() │
            │                                   │ - Ca/Mg              │
            │                                   │ - Na/K               │
            │                                   │ - Ca/P               │
            │                                   │ - Zn/Cu              │
            │                                   │ - Fe/Cu              │
            │                                   │ - Ca/K               │
            │                                   │                      │
            │                                   │ Returns:             │
            │                                   │ - value              │
            │                                   │ - idealMin/Max       │
            │                                   │ - status             │
            │                                   │ - interpretationKey  │
            │                                   │ - engineVersion      │
            │                                   └──────────────────────┘
            │                                               │
            └───────────────────┬───────────────────────────┘
                                │
                                ▼
                  ┌─────────────────────────────┐
                  │  Calculate Health Score     │
                  │  - Mineral Status (60%)     │
                  │  - Ratio Balance (30%)      │
                  │  - Red Flags (10%)          │
                  │  → Total Score: 0-100       │
                  │  → Grade: A-F               │
                  └─────────────────────────────┘
                                │
                                ▼
                  ┌─────────────────────────────┐
                  │  Create Audit Event         │
                  │  createAuditEvent({         │
                  │    eventType:               │
                  │      "ANALYSIS_CREATED",    │
                  │    reportId: "a1b2c3d4...", │
                  │    timestamp: ISO8601,      │
                  │    engineVersion: "1.0.0",  │
                  │    promptVersion: "1.2.0",  │
                  │    aiModel: "Gemini 1.5",   │
                  │    appVersion: "1.0.0",     │
                  │    isPractitionerMode: T/F, │
                  │    userId: "firebase_uid",  │
                  │    metadata: {              │
                  │      mineralCount: 15,      │
                  │      healthScore: 85,       │
                  │      grade: "B"             │
                  │    }                        │
                  │  })                         │
                  └─────────────────────────────┘
                                │
                                ▼
                  ┌─────────────────────────────┐
                  │  validateNoPHI(event)       │
                  │  ✓ No patient names         │
                  │  ✓ No test values           │
                  │  ✓ No insights content      │
                  │  ✓ Only metadata            │
                  └─────────────────────────────┘
                                │
                                ▼
                  ┌─────────────────────────────┐
                  │  logAuditEvent()            │
                  │  [Development]              │
                  │    → Console log            │
                  │  [Production]               │
                  │    → Cloud Logging          │
                  │    → SIEM system            │
                  └─────────────────────────────┘
                                │
                                ▼
                  ┌─────────────────────────────┐
                  │  Save to Firestore          │
                  │  {                          │
                  │    reportId,                │
                  │    userId,                  │
                  │    mineralData,             │
                  │    insights,                │
                  │    isPractitionerMode,      │
                  │    healthScore,             │
                  │    auditEvent: {            │
                  │      [serialized event]     │
                  │    },                       │
                  │    createdAt: timestamp     │
                  │  }                          │
                  └─────────────────────────────┘
                                │
                                ▼


┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: Generate PDF Report (Audit Event: REPORT_GENERATED)                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                     ┌──────────────┴───────────────┐
                     │  User clicks "Download PDF"  │
                     └──────────────┬───────────────┘
                                    │
                                    ▼
                  ┌─────────────────────────────────┐
                  │  Create Immutable Snapshot      │
                  │  createReportSnapshot({         │
                  │    mineralData,                 │
                  │    aiInsights,                  │
                  │    isPractitionerMode,          │
                  │    patientName,                 │
                  │    testDate                     │
                  │  })                             │
                  └─────────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
            ▼                       ▼                       ▼
  ┌──────────────┐       ┌──────────────────┐    ┌──────────────┐
  │ Generate     │       │ Calculate Ratios │    │ Create       │
  │ UUID         │       │ (ratioEngine)    │    │ Metadata     │
  │ reportId     │       │                  │    │              │
  └──────────────┘       │ All 6 ratios     │    │ - reportId   │
                         │ with full data   │    │ - timestamp  │
                         └──────────────────┘    │ - versions   │
                                    │             │ - isPrac     │
                                    │             └──────────────┘
                                    │                       │
            ┌───────────────────────┴───────────────────────┘
            │
            ▼
  ┌─────────────────────────────────────┐
  │  ReportSnapshot (IMMUTABLE)         │
  │  {                                  │
  │    metadata: {                      │
  │      reportId: UUID,                │
  │      generatedAt: ISO8601,          │
  │      htmaGeniusVersion: "1.0.0",    │
  │      analysisEngineVersion: "1.0.0",│
  │      aiModel: "Gemini 1.5 Pro",     │
  │      promptVersion: "1.2.0",        │
  │      isPractitionerMode: boolean    │
  │    },                               │
  │    patientInfo: {                   │
  │      name?, testDate?               │
  │    },                               │
  │    minerals: [15 minerals],         │
  │    ratios: [6 ratios],              │
  │    aiInsights: string               │
  │  }                                  │
  │  Object.freeze() in dev mode        │
  └─────────────────────────────────────┘
            │
            ▼
  ┌─────────────────────────────────────┐
  │  Create Audit Event                 │
  │  createAuditEvent({                 │
  │    eventType: "REPORT_GENERATED",   │
  │    reportId: snapshot.reportId,     │
  │    isPractitionerMode: boolean,     │
  │    metadata: {                      │
  │      hasPatientName: boolean,       │
  │      testDate: string               │
  │    }                                │
  │  })                                 │
  └─────────────────────────────────────┘
            │
            ▼
  ┌─────────────────────────────────────┐
  │  logAuditEvent()                    │
  │  → Console / Cloud Logging          │
  └─────────────────────────────────────┘
            │
            ▼
  ┌─────────────────────────────────────┐
  │  Generate PDF (jsPDF)               │
  │                                     │
  │  Header:                            │
  │    - Patient info (if provided)     │
  │    - Test date                      │
  │    - Report ID                      │
  │                                     │
  │  Body:                              │
  │    - 15 Mineral table               │
  │    - 6 Ratio table (if practitioner)│
  │    - AI Insights                    │
  │    - Practitioner notes section     │
  │                                     │
  │  Footer:                            │
  │    ───────────────────────────────  │
  │    Report ID: a1b2c3d4...           │
  │    HTMA Genius: 1.0.0               │
  │    Engine: 1.0.0                    │
  │    AI: Gemini 1.5 Pro               │
  │    Prompt: 1.2.0                    │
  │    Generated: 2025-12-21 14:30 UTC  │
  │    ───────────────────────────────  │
  └─────────────────────────────────────┘
            │
            ▼
        Download PDF
      (Audit trail complete)


┌─────────────────────────────────────────────────────────────────────────────┐
│ AUDIT TRAIL STORED IN FIRESTORE                                            │
└─────────────────────────────────────────────────────────────────────────────┘

analyses/{documentId}/
  ├── reportId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  ├── userId: "firebase_uid_xyz"
  ├── mineralData: { Ca: 40, Mg: 6, ... }
  ├── insights: "Your analysis shows..."
  ├── isPractitionerMode: true
  ├── healthScore: { totalScore: 85, grade: "B", ... }
  ├── auditEvent: {
  │     eventType: "ANALYSIS_CREATED",
  │     reportId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  │     timestamp: "2025-12-21T14:30:00.000Z",
  │     engineVersion: "1.0.0",
  │     promptVersion: "1.2.0",
  │     aiModel: "Gemini 1.5 Pro",
  │     appVersion: "1.0.0",
  │     isPractitionerMode: true,
  │     userId: "firebase_uid_xyz",
  │     metadata: {
  │       mineralCount: 15,
  │       healthScore: 85,
  │       grade: "B"
  │     }
  │   }
  └── createdAt: Timestamp(2025-12-21 14:30:00 UTC)


┌─────────────────────────────────────────────────────────────────────────────┐
│ VERSION TRACEABILITY                                                        │
└─────────────────────────────────────────────────────────────────────────────┘

Given a reportId, we can trace:

1. Which ANALYSIS_ENGINE_VERSION calculated the results
2. Which PROMPT_VERSION generated the AI analysis
3. Which AI_MODEL (Gemini version) processed the data
4. When the analysis was created (ISO 8601 timestamp)
5. Whether practitioner mode was enabled
6. When PDFs were generated from this analysis
7. All metadata without any PHI

This enables:
✓ Reproducibility - Recreate analysis with exact versions
✓ Compliance - Full audit trail for legal/clinical review
✓ Quality Assurance - Compare results across versions
✓ Debugging - Identify version-specific issues
✓ Migration - Upgrade old analyses to new engine versions


┌─────────────────────────────────────────────────────────────────────────────┐
│ DATA FLOW SUMMARY                                                           │
└─────────────────────────────────────────────────────────────────────────────┘

INPUT                VERSION CONTROL              OUTPUT
─────                ───────────────              ──────
Minerals      →      htmaConstants.ts      →      Reference Ranges
              →      ratioEngine.ts        →      Ratio Results
              →      htmaPrompt.ts         →      Versioned Prompt
              →      Gemini AI             →      AI Insights
              →      healthScore.ts        →      Health Score
              →      createReportSnapshot  →      Immutable Snapshot
              →      auditEvent.ts         →      Audit Event
              →      pdfGenerator.ts       →      PDF with Footer
              →      Firestore             →      Stored with Metadata

Every step includes version metadata for complete traceability.
```
