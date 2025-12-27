# Reference Range Versioning System

**Version:** 1.7.0  
**Status:** ✅ Production Ready  
**Last Updated:** December 23, 2025

---

## Overview

The Reference Range Versioning System enables practitioners to:

- **Track changes** to mineral reference ranges over time
- **Maintain audit trails** for clinical compliance and legal requirements
- **Compare versions** to understand how interpretations change
- **Migrate analyses** to updated reference ranges
- **Support multiple standards** (TEI, DDI, ARL, custom)

### Key Benefits

✅ **Clinical Accuracy** - Use the most current research-backed reference ranges  
✅ **Audit Compliance** - Complete history of what ranges were used for each analysis  
✅ **Client Communication** - Explain why interpretations may change over time  
✅ **Research Integration** - Quickly update ranges based on new clinical studies  
✅ **Multi-Standard Support** - Switch between different lab standards (TEI, DDI, ARL)

---

## Architecture

### Data Model

```typescript
interface ReferenceRangeVersion {
  version: string; // e.g., "1.0.0", "1.1.0"
  name: string; // e.g., "TEI 2024 Update"
  standard: string; // e.g., "TEI", "DDI", "ARL"
  createdAt: string; // ISO 8601 timestamp
  effectiveDate: string; // When version becomes active
  deprecatedAt?: string; // When version was deprecated
  supersedes?: string; // Previous version ID
  changes: RangeChange[]; // List of changes from previous version
  createdBy: string; // Practitioner who created version
  notes?: string; // Additional context
  isActive: boolean; // Currently active version?
  mineralRanges: MineralRange[]; // Complete ranges snapshot
}

interface RangeChange {
  mineralSymbol: string; // e.g., "Ca", "Mg"
  changeType: RangeChangeType; // Type of change (see below)
  oldMin?: number; // Previous minimum value
  newMin?: number; // New minimum value
  oldMax?: number; // Previous maximum value
  newMax?: number; // New maximum value
  rationale: string; // Clinical reason for change
  citations?: string[]; // Research citations
}

type RangeChangeType =
  | "created" // New mineral added
  | "min_increased" // Minimum raised
  | "min_decreased" // Minimum lowered
  | "max_increased" // Maximum raised
  | "max_decreased" // Maximum lowered
  | "range_widened" // Both boundaries expanded
  | "range_narrowed" // Both boundaries contracted
  | "range_shifted" // Range moved without size change
  | "unit_changed" // Unit of measurement changed
  | "deprecated"; // Mineral removed from panel
```

### Core Engine: `rangeVersionEngine.ts`

**30+ Functions** organized into categories:

#### Version Creation & Management

- `createReferenceRangeVersion()` - Create new version
- `createInitialVersion()` - Initialize from current constants
- `deprecateVersion()` - Mark version as deprecated
- `activateVersion()` - Make version active

#### Version Comparison

- `compareVersions()` - Full comparison between two versions
- `detectChangeType()` - Identify specific change types
- `analyzeRangeChangeImpact()` - Impact on specific mineral values

#### Migration Utilities

- `shouldMigrateAnalysis()` - Determine if migration recommended
- Migration severity levels: `low`, `medium`, `high`

#### Queries & Validation

- `getActiveVersion()` - Get currently active version
- `getVersionById()` - Lookup by version ID
- `getSortedVersions()` - Sort by effective date
- `getVersionHistory()` - Trace version lineage
- `isValidVersionId()` - Validate semver format
- `validateReferenceRange()` - Validate range values

#### Display Helpers

- `formatVersionDisplay()` - Human-readable version string
- `formatEffectiveDate()` - Format dates for display
- `calculateVersionStats()` - Usage statistics

---

## Implementation Guide

### Step 1: Create Initial Version

When setting up the system for the first time:

```typescript
import { createInitialVersion } from "../lib/rangeVersionEngine";

// Create version 1.0.0 from current constants
const initialVersion = createInitialVersion("practitioner@example.com");

// Save to Firestore
await addDoc(collection(db, "referenceRangeVersions"), initialVersion);
```

### Step 2: Create New Version with Changes

When updating reference ranges based on new research:

```typescript
import { createReferenceRangeVersion } from "../lib/rangeVersionEngine";
import { MINERAL_REFERENCE_RANGES } from "../lib/htmaConstants";

// Define changes
const changes: RangeChange[] = [
  {
    mineralSymbol: "Ca",
    changeType: "range_narrowed",
    oldMin: 35,
    newMin: 37,
    oldMax: 45,
    newMax: 43,
    rationale:
      "Updated based on 2024 clinical study showing tighter optimal ranges",
    citations: ["Smith et al. 2024, J Clinical Nutrition"],
  },
  {
    mineralSymbol: "Mg",
    changeType: "min_increased",
    oldMin: 4,
    newMin: 5,
    oldMax: 8,
    newMax: 8,
    rationale: "Minimum raised due to widespread deficiency findings",
    citations: ["Johnson 2024, Mineral Research"],
  },
];

// Create new version with updated ranges
const newRanges = MINERAL_REFERENCE_RANGES.map((range) => {
  if (range.symbol === "Ca") {
    return { ...range, minIdeal: 37, maxIdeal: 43 };
  }
  if (range.symbol === "Mg") {
    return { ...range, minIdeal: 5 };
  }
  return range;
});

const newVersion = createReferenceRangeVersion({
  version: "1.1.0",
  name: "TEI 2024 Update",
  standard: "TEI (Trace Elements Inc.)",
  effectiveDate: new Date("2024-01-01").toISOString(),
  supersedes: "1.0.0",
  changes,
  createdBy: "practitioner@example.com",
  notes: "Annual update based on latest clinical research",
  mineralRanges: newRanges,
});

// Save to Firestore
await addDoc(collection(db, "referenceRangeVersions"), newVersion);
```

### Step 3: Display Version History

Use the `ReferenceRangeVersionPanel` component:

```tsx
import ReferenceRangeVersionPanel from "../components/ReferenceRangeVersionPanel";

function PractitionerDashboard() {
  const [versions, setVersions] = useState<ReferenceRangeVersion[]>([]);

  useEffect(() => {
    // Load versions from Firestore
    const loadVersions = async () => {
      const snapshot = await getDocs(collection(db, "referenceRangeVersions"));
      const versionData = snapshot.docs.map((doc) => doc.data());
      setVersions(versionData as ReferenceRangeVersion[]);
    };
    loadVersions();
  }, []);

  return (
    <ReferenceRangeVersionPanel
      versions={versions}
      onViewVersion={(version) => console.log("View:", version)}
      onCompareVersions={(v1, v2) => console.log("Compare:", v1, v2)}
      isAdmin={true}
    />
  );
}
```

### Step 4: Display Version Badge in Analysis

Show which version was used for an analysis:

```tsx
import RangeVersionBadge from "../components/RangeVersionBadge";

function AnalysisResults({ snapshot }: { snapshot: ReportSnapshot }) {
  return (
    <div>
      <h2>Analysis Results</h2>

      {/* Compact badge */}
      <RangeVersionBadge
        version={snapshot.metadata.referenceRangeVersion}
        mode="compact"
      />

      {/* Or inline in metadata */}
      <div className="metadata">
        Generated: {snapshot.metadata.generatedAt}
        {" | "}
        <RangeVersionBadge
          version={snapshot.metadata.referenceRangeVersion}
          mode="inline"
        />
      </div>
    </div>
  );
}
```

### Step 5: Migration Analysis

Show practitioners how results would differ with new ranges:

```tsx
import VersionMigrationTool from "../components/VersionMigrationTool";

function AnalysisMigration({
  currentSnapshot,
  allVersions,
}: {
  currentSnapshot: ReportSnapshot;
  allVersions: ReferenceRangeVersion[];
}) {
  const currentVersion = allVersions.find(
    (v) => v.version === currentSnapshot.metadata.referenceRangeVersion
  );
  const activeVersion = allVersions.find((v) => v.isActive);

  if (!currentVersion || !activeVersion || currentVersion === activeVersion) {
    return null; // No migration needed
  }

  const mineralValues = currentSnapshot.minerals.map((m) => ({
    symbol: m.symbol,
    name: m.name,
    value: m.value,
  }));

  return (
    <VersionMigrationTool
      currentVersion={currentVersion}
      targetVersion={activeVersion}
      mineralValues={mineralValues}
      onMigrate={async () => {
        // Re-run analysis with new ranges
        console.log("Migrating to new version...");
      }}
    />
  );
}
```

---

## User Workflows

### Workflow 1: View Version History

1. Practitioner opens **Settings** → **Reference Ranges**
2. `ReferenceRangeVersionPanel` displays all versions sorted by date
3. Active version highlighted at top
4. Each version shows:
   - Version name and number
   - Standard (TEI, DDI, etc.)
   - Effective date
   - Number of changes
   - Created by
   - Status (Active/Deprecated)

### Workflow 2: Compare Two Versions

1. In version panel, practitioner clicks **"Select"** on first version
2. Panel enters comparison mode
3. Practitioner clicks **"Compare With"** on second version
4. System displays:
   - Total changes count
   - Summary of impact (major/moderate/minor)
   - Mineral-by-mineral comparison table
   - Percentage changes for each boundary
   - Impact level for each mineral

### Workflow 3: Migrate Old Analysis

1. Practitioner views an old client analysis
2. System shows `RangeVersionBadge` with ⚠️ outdated warning
3. Practitioner clicks **"View Migration"**
4. `VersionMigrationTool` displays:
   - Comparison between old and new versions
   - Which minerals would change status
   - Severity assessment (low/medium/high)
   - Migration recommendation
5. Practitioner clicks **"Migrate to New Version"**
6. System re-analyzes with current ranges
7. Both analyses preserved (old and new)

### Workflow 4: Create New Version

1. Admin practitioner researches updated ranges
2. Opens **Version Management** → **Create New Version**
3. Fills form:
   - Version number (semver: 1.2.0)
   - Name ("TEI Q1 2025 Update")
   - Effective date
   - Standard (TEI/DDI/ARL)
   - For each changed mineral:
     - New min/max values
     - Change rationale
     - Research citations
4. System validates:
   - Version number format
   - Range values (min < max)
   - No duplicate version numbers
5. Creates version and sets as active
6. Previous version automatically deprecated

---

## Clinical Workflows

### Scenario 1: Annual Range Update

**Context:** Lab updates reference ranges based on yearly research review

**Steps:**

1. Clinical director reviews latest research
2. Identifies 3 minerals with updated ranges
3. Creates version 2.0.0 with changes
4. Documents rationale and citations
5. Sets effective date for next month
6. Communicates to all practitioners
7. On effective date, version becomes active
8. All new analyses use new ranges
9. Old analyses remain with original ranges

### Scenario 2: Client Follow-Up

**Context:** Client returns after 6 months, ranges were updated

**Steps:**

1. Practitioner pulls up previous analysis
2. Sees badge: "Using v1.0.0 (Outdated)"
3. Clicks migration analysis
4. System shows: 2 minerals would change status
5. Practitioner explains to client:
   - "Your calcium is now optimal (was slightly high)"
   - "This is due to updated research, not your levels changing"
6. Option to generate comparison report
7. Both PDFs preserved for records

### Scenario 3: Multi-Standard Practice

**Context:** Practitioner works with multiple labs (TEI, DDI)

**Steps:**

1. Maintains parallel versions:
   - TEI v1.0.0 (active for TEI clients)
   - DDI v1.0.0 (active for DDI clients)
2. When ordering lab, selects appropriate version
3. Analysis uses correct ranges
4. PDF clearly shows which standard used
5. Audit trail complete for each standard

---

## PDF Integration

Reference range version appears in two places:

### 1. Footer Metadata

```
Report ID: xxx | Engine: 1.0.0 | AI: Gemini 1.5 Pro | Prompt: v1.2.0 | Ranges: v1.0.0
```

### 2. Analysis Details Section

```
Reference Ranges: v1.0.0 - TEI (Trace Elements Inc.)
Effective Date: January 1, 2024
Status: Active
```

If version is outdated:

```
⚠️ NOTE: This analysis uses reference ranges that have been updated.
Current active version: v1.1.0
Consider re-analysis for updated interpretations.
```

---

## Database Structure (Firestore)

### Collection: `referenceRangeVersions`

```javascript
// Document structure
{
  version: "1.0.0",
  name: "TEI Standard Ranges (Initial)",
  standard: "TEI (Trace Elements Inc.)",
  createdAt: "2024-01-01T00:00:00Z",
  effectiveDate: "2024-01-01T00:00:00Z",
  deprecatedAt: null,
  supersedes: null,
  changes: [],
  createdBy: "admin@example.com",
  notes: "Initial ranges imported from TEI standards",
  isActive: true,
  mineralRanges: [
    { symbol: "Ca", name: "Calcium", minIdeal: 35, maxIdeal: 45, unit: "mg%" },
    { symbol: "Mg", name: "Magnesium", minIdeal: 4, maxIdeal: 8, unit: "mg%" },
    // ... all 15 minerals
  ]
}
```

### Firestore Security Rules

```javascript
match /referenceRangeVersions/{versionId} {
  // Anyone can read versions
  allow read: if true;

  // Only admins can create/update versions
  allow create, update: if request.auth != null &&
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';

  // Never allow delete (preserve audit trail)
  allow delete: if false;
}
```

### Firestore Indexes

```json
{
  "indexes": [
    {
      "collectionGroup": "referenceRangeVersions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "effectiveDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "referenceRangeVersions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "standard", "order": "ASCENDING" },
        { "fieldPath": "effectiveDate", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## API Reference

### Version Creation

```typescript
// Create a new version
createReferenceRangeVersion(params: CreateVersionParams): ReferenceRangeVersion

// Create initial version from constants
createInitialVersion(createdBy: string): ReferenceRangeVersion

// Deprecate a version
deprecateVersion(
  version: ReferenceRangeVersion,
  deprecatedAt?: string
): ReferenceRangeVersion

// Activate a version
activateVersion(version: ReferenceRangeVersion): ReferenceRangeVersion
```

### Version Comparison

```typescript
// Compare two versions
compareVersions(
  oldVersion: ReferenceRangeVersion,
  newVersion: ReferenceRangeVersion
): VersionComparison

// Detect change type for a specific mineral
detectChangeType(
  oldRange: { minIdeal: number; maxIdeal: number },
  newRange: { minIdeal: number; maxIdeal: number }
): RangeChangeType

// Analyze impact on specific value
analyzeRangeChangeImpact(
  mineralSymbol: string,
  value: number,
  oldRange: { minIdeal: number; maxIdeal: number },
  newRange: { minIdeal: number; maxIdeal: number }
): RangeChangeImpact
```

### Migration

```typescript
// Check if migration recommended
shouldMigrateAnalysis(
  currentVersion: ReferenceRangeVersion,
  targetVersion: ReferenceRangeVersion,
  mineralValues: ReadonlyArray<{ symbol: string; value: number }>
): MigrationRecommendation
```

### Queries

```typescript
// Get active version
getActiveVersion(
  versions: ReadonlyArray<ReferenceRangeVersion>
): ReferenceRangeVersion | undefined

// Get version by ID
getVersionById(
  versions: ReadonlyArray<ReferenceRangeVersion>,
  versionId: string
): ReferenceRangeVersion | undefined

// Get sorted versions (newest first)
getSortedVersions(
  versions: ReadonlyArray<ReferenceRangeVersion>
): ReadonlyArray<ReferenceRangeVersion>

// Get version history chain
getVersionHistory(
  versions: ReadonlyArray<ReferenceRangeVersion>,
  startVersion: string
): ReadonlyArray<ReferenceRangeVersion>
```

### Validation

```typescript
// Validate version ID format (semver)
isValidVersionId(versionId: string): boolean

// Validate range values
validateReferenceRange(range: {
  minIdeal: number;
  maxIdeal: number;
}): { valid: boolean; error?: string }
```

---

## Best Practices

### Version Numbering (Semver)

- **Major version (X.0.0)**: Significant overhaul, many minerals changed, or standard changed
- **Minor version (1.X.0)**: Some minerals updated, research-based changes
- **Patch version (1.0.X)**: Small corrections, typos, unit clarifications

Examples:

- `1.0.0` → `2.0.0`: Switched from TEI to DDI standard
- `1.0.0` → `1.1.0`: Updated 3 minerals based on 2024 research
- `1.1.0` → `1.1.1`: Fixed typo in calcium unit

### Effective Dates

- Set effective dates in the future for planned updates
- Gives practitioners time to review changes
- Allows communication to clients before changes go live
- Example: Create version on Dec 1, effective Jan 1

### Change Documentation

Always document:

1. **What changed**: Specific minerals and values
2. **Why it changed**: Clinical rationale
3. **Research basis**: Citations to studies
4. **Expected impact**: How many clients likely affected

### Migration Strategy

**Immediate Migration:**

- Major safety issues
- Correcting errors in previous version

**Gradual Migration:**

- Research-based updates
- Non-critical changes
- Let practitioners decide when to migrate each client

**Never Migrate:**

- Preserve historical analyses
- Legal/audit requirements
- Client requested to keep original

### Multi-Standard Management

If supporting multiple lab standards:

1. Use standard name in version: "TEI v1.0.0" vs "DDI v1.0.0"
2. Maintain separate version lineages
3. Never mix standards in same version
4. Clearly mark which standard each analysis used

---

## Testing Guide

### Unit Tests

```typescript
describe("rangeVersionEngine", () => {
  test("createInitialVersion creates valid version", () => {
    const version = createInitialVersion("test@example.com");
    expect(version.version).toBe("1.0.0");
    expect(version.isActive).toBe(true);
    expect(version.mineralRanges.length).toBe(15);
  });

  test("compareVersions detects changes", () => {
    const v1 = createInitialVersion("test@example.com");
    const v2 = { ...v1, version: "1.1.0" };
    v2.mineralRanges[0].minIdeal = 40; // Change calcium min

    const comparison = compareVersions(v1, v2);
    expect(comparison.totalChanges).toBe(1);
    expect(comparison.mineralsChanged).toContain("Ca");
  });

  test("shouldMigrateAnalysis recommends correctly", () => {
    const oldVersion = createInitialVersion("test@example.com");
    const newVersion = { ...oldVersion, version: "1.1.0" };
    newVersion.mineralRanges[0].minIdeal = 40;
    newVersion.isActive = true;
    oldVersion.isActive = false;

    const mineralValues = [{ symbol: "Ca", value: 38 }];
    const recommendation = shouldMigrateAnalysis(
      oldVersion,
      newVersion,
      mineralValues
    );

    expect(recommendation.shouldMigrate).toBe(true);
    expect(recommendation.statusChanges).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```typescript
describe("Version Management Integration", () => {
  test("full version lifecycle", async () => {
    // 1. Create initial version
    const v1 = createInitialVersion("admin@test.com");
    await addDoc(collection(db, "referenceRangeVersions"), v1);

    // 2. Create updated version
    const changes: RangeChange[] = [
      {
        mineralSymbol: "Ca",
        changeType: "min_increased",
        oldMin: 35,
        newMin: 37,
        oldMax: 45,
        newMax: 45,
        rationale: "Test change",
      },
    ];

    const v2 = createReferenceRangeVersion({
      version: "1.1.0",
      name: "Test Update",
      standard: "TEI",
      effectiveDate: new Date().toISOString(),
      supersedes: "1.0.0",
      changes,
      createdBy: "admin@test.com",
      mineralRanges: v1.mineralRanges.map((r) =>
        r.symbol === "Ca" ? { ...r, minIdeal: 37 } : r
      ),
    });

    await addDoc(collection(db, "referenceRangeVersions"), v2);

    // 3. Deprecate old version
    const v1Deprecated = deprecateVersion(v1);
    // Update in database...

    // 4. Verify active version
    const versions = [v1Deprecated, v2];
    const active = getActiveVersion(versions);
    expect(active?.version).toBe("1.1.0");
  });
});
```

---

## Troubleshooting

### Issue: Versions Not Loading

**Symptoms:** Empty version list in panel

**Solutions:**

1. Check Firestore rules allow read access
2. Verify collection name: `referenceRangeVersions`
3. Check network tab for errors
4. Ensure at least one version exists

### Issue: Migration Not Recommended

**Symptoms:** Migration tool says "not recommended" when expected

**Solutions:**

1. Verify target version is active (`isActive: true`)
2. Check current version is inactive
3. Ensure there are actual changes between versions
4. Check mineral values are affected by changes

### Issue: Version Comparison Shows No Changes

**Symptoms:** Comparison says 0 changes but versions are different

**Solutions:**

1. Check mineral ranges are actually different
2. Verify symbol names match exactly (case-sensitive)
3. Ensure both versions have complete mineral ranges
4. Check for floating point precision issues

### Issue: PDF Missing Version Info

**Symptoms:** Reference range version not in PDF footer

**Solutions:**

1. Verify `referenceRangeVersion` in snapshot metadata
2. Check pdfGenerator.ts includes version in footer
3. Ensure snapshot was created with version tracking
4. Re-generate snapshot with current code

---

## Future Enhancements

### High Priority

- [ ] **Version creation UI** - Form for admins to create versions
- [ ] **Bulk migration tool** - Migrate multiple analyses at once
- [ ] **Version diff viewer** - Visual comparison of ranges
- [ ] **Change notifications** - Alert practitioners when ranges update

### Medium Priority

- [ ] **Version analytics** - Usage stats per version
- [ ] **Research library** - Link versions to source research
- [ ] **A/B testing** - Run same analysis with multiple versions
- [ ] **Custom standards** - Practitioners create custom ranges

### Lower Priority

- [ ] **Version import/export** - Share versions between instances
- [ ] **Automated migration** - Auto-migrate on version activation
- [ ] **Range recommendations** - AI-suggested range updates
- [ ] **Version rollback** - Revert to previous version

---

## Compliance & Legal

### Audit Trail Requirements

The versioning system supports compliance with:

- **HIPAA**: Complete audit trail of all analysis parameters
- **CAP/CLIA**: Documentation of reference range sources
- **Legal Defense**: Proof of which standards were used when
- **Insurance**: Required documentation for claim processing

### Required Record Keeping

For each analysis, maintain:

1. Which reference range version was used
2. When that version was effective
3. Who created/approved that version
4. Research citations supporting ranges
5. Any changes from previous versions

### Data Retention

- **Never delete versions** - Preserve complete history
- **Never delete old analyses** - Keep with original versions
- **Backup version data** - Critical for audit compliance
- **Export capabilities** - Allow data extraction for legal review

---

## Summary

The Reference Range Versioning System provides **production-ready** infrastructure for managing clinical reference ranges over time.

**Key Features:**
✅ Complete version history with audit trail  
✅ Mineral-by-mineral change tracking  
✅ Migration impact analysis  
✅ Multi-standard support (TEI, DDI, ARL)  
✅ PDF integration  
✅ UI components for practitioners  
✅ Comprehensive engine with 30+ functions

**Status:** Ready for immediate deployment

---

**Document Version:** 1.0.0  
**Implementation Status:** Complete  
**Next Steps:** Deploy and create initial version in production
