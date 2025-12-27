# HTMA Genius - Versioning & Audit Safety System

## Overview

This document describes the comprehensive versioning and audit trail system implemented in HTMA Genius to ensure clinical reliability, legal compliance, and reproducible results.

## Key Principles

1. **Single Source of Truth** - All constants, calculations, and versions centralized
2. **Immutability** - Analysis snapshots are frozen and unchangeable
3. **Traceability** - Every analysis has version metadata for reproducibility
4. **Non-PHI Auditing** - Audit events contain NO patient health information
5. **Deterministic Calculations** - Same inputs always produce same outputs

---

## Version Constants

**Location:** `src/lib/htmaConstants.ts`

### Version Metadata

```typescript
HTMA_GENIUS_VERSION = "1.0.0"; // Application version
ANALYSIS_ENGINE_VERSION = "1.0.0"; // Calculation engine version
AI_MODEL = "Gemini 1.5 Pro"; // AI model identifier
PROMPT_VERSION = "1.2.0"; // AI prompt template version
REFERENCE_STANDARD = "TEI"; // Testing standard (Trace Elements Inc.)
```

### Version Usage

These constants are automatically included in:

1. **AI Prompt Generation** (`src/lib/htmaPrompt.ts`)

   - Headers show engine and prompt versions
   - Ensures AI knows exact calculation standards

2. **Report Snapshots** (`src/lib/reportSnapshot.ts`)

   - All metadata stored in ReportSnapshot
   - Enables recreation of analysis at any future date

3. **PDF Reports** (`src/lib/pdfGenerator.ts`)

   - Footer contains all version information
   - Legal/clinical compliance for audit trails

4. **API Responses** (`src/pages/api/analyze.ts`)
   - Metadata included in analysis response
   - Client can verify versions used

---

## Centralized Ratio Calculation Engine

**Location:** `src/lib/ratioEngine.ts`

### Purpose

Ensures ALL ratio calculations use identical logic, preventing inconsistencies between:

- UI displays
- PDF reports
- Health score calculations
- Saved analyses

### Core Functions

#### `calculateRatioResult(ratioRef, mineralValues)`

Calculates a single ratio with full metadata:

- `value` - Computed ratio value
- `idealMin/idealMax` - Reference range
- `status` - "Low", "Optimal", or "High"
- `interpretationKey` - Clinical significance
- `engineVersion` - Version used for calculation

#### `calculateAllRatios(mineralValues)`

**ONLY function to use for ratio calculations throughout the app**

Returns all 6 critical ratios:

- Ca/Mg (Calcium/Magnesium)
- Na/K (Sodium/Potassium)
- Ca/P (Calcium/Phosphorus)
- Zn/Cu (Zinc/Copper)
- Fe/Cu (Iron/Copper)
- Ca/K (Calcium/Potassium)

#### `getNonOptimalRatios(mineralValues)`

Returns only ratios with Low or High status - useful for highlighting concerns

### Integration Points

1. **Report Snapshots** - Uses ratio engine for all snapshot creation
2. **Health Score** - Calculates ratio component of health score
3. **UI Charts** - Displays ratios consistently
4. **PDF Reports** - Ensures printed ratios match UI

---

## Audit Event System

**Location:** `src/lib/auditEvent.ts`

### Design Principles

#### ✅ ALLOWED in Audit Events:

- Report/Analysis UUIDs
- Timestamps
- Version numbers
- Practitioner mode flag (boolean)
- User IDs (Firebase UID - NOT patient identifier)
- Mineral counts (how many minerals tested)
- Health scores (numeric only, no context)

#### ❌ FORBIDDEN in Audit Events:

- Patient names
- Dates of birth
- Test result values
- AI insights text
- Addresses, phone, email
- Any PHI (Protected Health Information)

### Event Types

```typescript
type AuditEventType =
  | "ANALYSIS_CREATED" // New analysis saved to database
  | "REPORT_GENERATED" // PDF report downloaded
  | "ANALYSIS_LOADED" // Saved analysis retrieved
  | "SNAPSHOT_CREATED"; // Immutable snapshot created
```

### Audit Event Structure

```typescript
interface AuditEvent {
  eventType: AuditEventType;
  reportId: string; // UUID (not patient ID)
  timestamp: string; // ISO 8601
  engineVersion: string; // e.g., "1.0.0"
  promptVersion: string; // e.g., "1.2.0"
  aiModel: string; // e.g., "Gemini 1.5 Pro"
  appVersion: string; // e.g., "1.0.0"
  isPractitionerMode: boolean; // true/false
  userId?: string; // Firebase UID (optional)
  metadata?: Record<string, any>; // Non-PHI metadata only
}
```

### Key Functions

#### `createAuditEvent(options)`

Creates an immutable audit event with current version constants

#### `logAuditEvent(event)`

Logs event to console (dev) or external audit system (production)

#### `validateNoPHI(event)`

Safety check to prevent PHI leakage into audit logs

#### `serializeAuditEvent(event)`

Converts to plain object for Firestore storage

### Current Integration

1. **save-analysis.ts** - Creates `ANALYSIS_CREATED` event
2. **PDFReportButton.tsx** - Creates `REPORT_GENERATED` event
3. All events stored in Firestore alongside analyses
4. Console logging in development mode

### Future Expansion

In production, audit events can be sent to:

- Google Cloud Logging
- SIEM systems (Splunk, Datadog)
- Dedicated audit database
- Compliance monitoring tools

---

## Data Flow with Versioning

### 1. User Enters Mineral Data

```
HTMAInputForm
  ↓
mineralData object
```

### 2. AI Analysis Request

```
generateHTMAPrompt(mineralData)
  ↓
Prompt with version headers:
  - ANALYSIS_ENGINE_VERSION: 1.0.0
  - PROMPT_VERSION: 1.2.0
  - AI_MODEL: Gemini 1.5 Pro
  ↓
Cloud Run Backend (Gemini AI)
  ↓
AI Insights + Metadata
```

### 3. Analysis Save (if user logged in)

```
save-analysis.ts
  ↓
1. Generate reportId (UUID)
2. Calculate health score
3. Create audit event (ANALYSIS_CREATED)
4. Save to Firestore:
   - reportId
   - mineralData
   - insights
   - healthScore
   - isPractitionerMode
   - auditEvent (serialized)
   - versions (engine, prompt, AI model)
```

### 4. PDF Report Generation

```
PDFReportButton click
  ↓
1. Create immutable snapshot
   - Includes all version metadata
   - Uses ratioEngine for calculations
   - Freezes all data (dev mode)
  ↓
2. Create audit event (REPORT_GENERATED)
  ↓
3. Generate PDF
   - Reads ONLY from snapshot (not live state)
   - Footer includes:
     * Report ID
     * HTMA Genius Version
     * Analysis Engine Version
     * AI Model
     * Prompt Version
     * Generation timestamp
```

---

## Compliance Benefits

### Clinical Reliability

1. **Reproducibility** - Any report can be regenerated with identical results
2. **Version Tracking** - Know exactly which calculation engine produced results
3. **Audit Trail** - Complete history of when/how reports were generated
4. **Immutability** - Snapshots cannot be altered after creation

### Legal Compliance

1. **HIPAA Compliant** - Audit events contain NO PHI
2. **Traceability** - Every analysis has unique UUID
3. **Metadata** - Complete version information for expert review
4. **Consistency** - Single source of truth prevents discrepancies

### Quality Assurance

1. **Deterministic** - Same inputs → same outputs, always
2. **Centralized** - All calculations in one place
3. **Versioned** - Can identify which version produced results
4. **Validated** - PHI validation prevents data leakage

---

## Version Update Procedures

### When to Increment Versions

#### ANALYSIS_ENGINE_VERSION

Increment when changing:

- Mineral reference ranges
- Ratio calculation formulas
- Status determination logic
- Health score algorithm

#### PROMPT_VERSION

Increment when changing:

- AI prompt template structure
- Instructions to AI
- Clinical guidelines in prompt
- Analysis requirements

#### HTMA_GENIUS_VERSION

Increment per standard semantic versioning:

- Major: Breaking changes
- Minor: New features
- Patch: Bug fixes

### How to Update

1. **Update constant in `htmaConstants.ts`**
2. **Document change in CHANGELOG.md** (create if needed)
3. **Test thoroughly** - ensure backwards compatibility
4. **Deploy** - versions automatically propagate to all systems

### Example Version Change

```typescript
// OLD
export const ANALYSIS_ENGINE_VERSION = "1.0.0";

// NEW (after changing Ca/Mg ideal range)
export const ANALYSIS_ENGINE_VERSION = "1.1.0";

// CHANGELOG.md
## [1.1.0] - 2025-12-21
### Changed
- Updated Ca/Mg ratio ideal range from 6.0-7.5 to 6.5-7.0
- Reason: New TEI standard published December 2025
```

---

## File Reference

### Core Files

- `src/lib/htmaConstants.ts` - All version constants and reference ranges
- `src/lib/ratioEngine.ts` - Centralized ratio calculation engine
- `src/lib/auditEvent.ts` - Non-PHI audit event system
- `src/lib/createReportSnapshot.ts` - Immutable snapshot creator
- `src/lib/reportSnapshot.ts` - TypeScript interfaces for snapshots

### Integration Files

- `src/lib/htmaPrompt.ts` - AI prompt with version headers
- `src/lib/pdfGenerator.ts` - PDF with version metadata
- `src/pages/api/analyze.ts` - Analysis API with version response
- `src/pages/api/save-analysis.ts` - Save with audit events
- `src/components/PDFReportButton.tsx` - PDF generation with audit

---

## Testing Checklist

Before deploying version changes:

- [ ] All version constants updated
- [ ] CHANGELOG.md entry created
- [ ] Unit tests pass (if implemented)
- [ ] PDF generation works with new versions
- [ ] Audit events validate (no PHI)
- [ ] AI prompts include correct versions
- [ ] Firestore documents include audit metadata
- [ ] Backwards compatibility verified
- [ ] ReportSnapshot can be recreated from old versions

---

## Monitoring Recommendations

### Development

- Console logs show audit events
- Snapshot validation in browser DevTools
- Version headers visible in network tab

### Production

- Send audit events to Cloud Logging
- Alert on version mismatches
- Monitor ratio calculation consistency
- Track reportId usage for compliance

---

## Future Enhancements

1. **Version Migration Tool** - Upgrade old analyses to new engine versions
2. **Audit Dashboard** - View all events for a patient/practitioner
3. **Compliance Reports** - Generate regulatory compliance documents
4. **A/B Testing** - Compare results across engine versions
5. **Snapshot Comparison** - Visual diff between versions

---

**Last Updated:** December 21, 2025  
**Document Version:** 1.0.0  
**Maintainer:** HTMA Genius Development Team
