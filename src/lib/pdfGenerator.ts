/**
 * HTMA PDF Report Generator
 *
 * Generates clinically and legally reliable PDF reports from immutable snapshots.
 * This module uses ONLY ReportSnapshot data - no live state or dynamic calculations.
 *
 * All mineral values, ratios, and statuses are frozen at snapshot creation time,
 * ensuring consistency and providing audit trail capabilities.
 *
 * INTERPRETATION GUARDRAILS:
 * All insights are passed through applyGuardrails() before rendering to PDF,
 * ensuring medical/legal compliance regardless of how the PDF logic evolves.
 * This creates the final safety lock: API → Storage → PDF all guarded.
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ReportSnapshot, PractitionerAnnotation } from "./reportSnapshot";
import { STATUS_COLORS } from "./htmaConstants";
import { applyGuardrails } from "./interpretationGuardrails";
import { getScoreColor, getInterpretation } from "./healthScoreSemantics";
import { getTEIDisclaimer } from "./teiInterpretationPrinciples";
import { getECKNineRulesFormattedText } from "./eckInterpretationPrinciples";
import { OxidationDelta } from "./oxidationDeltaEngine";
import {
  getConfidenceIcon,
  getConfidenceDescription,
  formatEvidence,
} from "./aiConfidenceScoring";

/**
 * Generate a PDF report from an immutable ReportSnapshot
 *
 * @param snapshot - Immutable snapshot containing all report data
 * @param oxidationDelta - Optional oxidation pattern delta analysis
 * @returns Promise that resolves when PDF is generated and downloaded
 */
export async function generateHTMAPDFReport(
  snapshot: ReportSnapshot,
  oxidationDelta?: OxidationDelta | null
): Promise<void> {
  // Extract data from immutable snapshot (read-only)
  const { metadata, patientInfo, minerals, ratios, aiInsights } = snapshot;

  // === APPLY INTERPRETATION GUARDRAILS FIRST ===
  // Parse insights and apply safety guardrails before any rendering
  const parseInsightsForGuardrails = (text: string) => {
    const insights: string[] = [];
    const recommendations: string[] = [];

    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l);
    let currentSection = "insights";

    for (const line of lines) {
      if (
        /recommendation|dietary|supplement|lifestyle|action/i.test(line) &&
        line.length < 100
      ) {
        currentSection = "recommendations";
        continue;
      }

      if (
        line.startsWith("#") ||
        line.startsWith("*") ||
        line.startsWith("-") ||
        line.length < 20
      ) {
        continue;
      }

      if (currentSection === "recommendations" && line.length > 20) {
        recommendations.push(line);
      } else if (line.length > 20) {
        insights.push(line);
      }
    }

    if (recommendations.length === 0 && insights.length > 3) {
      const lastThird = Math.floor(insights.length * 0.7);
      recommendations.push(...insights.splice(lastThird));
    }

    return { insights, recommendations };
  };

  const { insights: rawInsights, recommendations: rawRecommendations } =
    parseInsightsForGuardrails(aiInsights);

  // Extract evidence from snapshot for guardrails context
  const abnormalMinerals = minerals
    .filter((m) => m.status === "Low" || m.status === "High")
    .map((m) => m.symbol);
  const abnormalRatios = ratios
    .filter((r) => r.status === "Low" || r.status === "High")
    .map((r) => r.name);

  // Apply interpretation guardrails
  const guarded = applyGuardrails({
    insights: rawInsights,
    recommendations: rawRecommendations,
    ctx: {
      audience: metadata.isPractitionerMode ? "practitioner" : "consumer",
      channel: "pdf",
      evidence: {
        abnormalMinerals,
        abnormalRatios,
        trends: [],
        flags: [],
      },
    },
  });

  // Create PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper to add footer with metadata
  const addFooter = (
    guardrailsVersion?: string,
    guardrailsReviewedDate?: string
  ) => {
    const footerY = pageHeight - 18;
    doc.setFontSize(7);
    doc.setTextColor(128, 128, 128);

    // Disclaimer is auto-injected by guardrails - extract from guarded recommendations
    const disclaimer =
      guarded.recommendations[guarded.recommendations.length - 1];
    doc.text(disclaimer, pageWidth / 2, footerY, { align: "center" });

    // Generated timestamp and version info
    const generatedDate = new Date(metadata.generatedAt).toLocaleString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }
    );
    doc.text(
      `Generated: ${generatedDate} | HTMA Genius v${metadata.htmaGeniusVersion}`,
      pageWidth / 2,
      footerY + 3.5,
      { align: "center" }
    );

    // Metadata footer (subtle)
    doc.setFontSize(6);
    const metadataText = guardrailsVersion
      ? `Report ID: ${metadata.reportId} | Engine: ${metadata.analysisEngineVersion} | AI: ${metadata.aiModel} | Prompt: v${metadata.promptVersion} | Ranges: v${metadata.referenceRangeVersion} | Guardrails: v${guardrailsVersion} (${guardrailsReviewedDate})`
      : `Report ID: ${metadata.reportId} | Engine: ${metadata.analysisEngineVersion} | AI: ${metadata.aiModel} | Prompt: v${metadata.promptVersion} | Ranges: v${metadata.referenceRangeVersion}`;

    doc.text(metadataText, pageWidth / 2, footerY + 6.5, { align: "center" });

    // Page number
    doc.setFontSize(7);
    doc.text(
      `Page ${doc.getCurrentPageInfo().pageNumber}`,
      pageWidth - margin,
      footerY,
      { align: "right" }
    );
  };

  // === HEADER ===
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("🧬 HTMA Analysis Report", margin, 20);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Hair Tissue Mineral Analysis", margin, 30);

  yPosition = 50;

  // === PATIENT INFO ===
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");

  if (patientInfo.name) {
    doc.text(`Patient: ${patientInfo.name}`, margin, yPosition);
    yPosition += 7;
  }

  doc.text(
    `Test Date: ${
      patientInfo.testDate ||
      new Date(metadata.generatedAt).toLocaleDateString()
    }`,
    margin,
    yPosition
  );
  yPosition += 7;
  doc.text(`Report ID: ${metadata.reportId}`, margin, yPosition);
  yPosition += 12;

  // === EXECUTIVE SUMMARY ===
  checkPageBreak(40);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(102, 126, 234);
  doc.text("Executive Summary", margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  // Extract first 3 paragraphs from insights (from snapshot)
  const paragraphs = aiInsights
    .split("\n\n")
    .filter((p) => p.trim().length > 0);
  const summaryText = paragraphs.slice(0, 3).join("\n\n");
  const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 2 * margin);

  splitSummary.forEach((line: string) => {
    if (checkPageBreak(6)) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
    }
    doc.text(line, margin, yPosition);
    yPosition += 5;
  });

  yPosition += 10;

  // === HEALTH SCORE SECTION ===
  if (snapshot.healthScore) {
    checkPageBreak(60);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(102, 126, 234);
    doc.text("Health Score", margin, yPosition);
    yPosition += 8;

    // Score box
    const scoreColor = getScoreColor(snapshot.healthScore.totalScore);
    const rgbColor = hexToRgb(scoreColor);
    doc.setFillColor(rgbColor.r, rgbColor.g, rgbColor.b);
    doc.roundedRect(margin, yPosition - 2, 50, 16, 2, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(
      `${snapshot.healthScore.totalScore}/100`,
      margin + 25,
      yPosition + 8,
      { align: "center" }
    );

    // Interpretation
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(
      getInterpretation(snapshot.healthScore.totalScore),
      margin + 55,
      yPosition + 8
    );
    yPosition += 22;

    // Score breakdown (if practitioner mode)
    if (metadata.isPractitionerMode) {
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(
        `Minerals: ${snapshot.healthScore.mineralScore.toFixed(
          1
        )} | Ratios: ${snapshot.healthScore.ratioScore.toFixed(
          1
        )} | Red Flags: ${snapshot.healthScore.redFlagScore.toFixed(1)}`,
        margin,
        yPosition
      );
      yPosition += 6;
    }

    yPosition += 10;
  }

  // === SCORE DELTA SECTION ===
  if (snapshot.scoreDelta) {
    checkPageBreak(80);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(102, 126, 234);
    doc.text("📊 Why Your Health Score Changed", margin, yPosition);
    yPosition += 8;

    // Headline
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(snapshot.scoreDelta.headline, margin, yPosition);
    yPosition += 8;

    // Summary
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(
      snapshot.scoreDelta.summary,
      pageWidth - 2 * margin
    );
    summaryLines.forEach((line: string) => {
      if (checkPageBreak(6)) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
      }
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });
    yPosition += 5;

    // Separate drivers by type for better organization
    const mineralDrivers = snapshot.scoreDelta.topDrivers.filter(
      (d) => d.type === "mineral"
    );
    const ratioDrivers = snapshot.scoreDelta.topDrivers.filter(
      (d) => d.type === "ratio"
    );
    const flagDrivers = snapshot.scoreDelta.topDrivers.filter(
      (d) => d.type === "redFlag"
    );
    const hasMultipleTypes =
      [
        mineralDrivers.length > 0,
        ratioDrivers.length > 0,
        flagDrivers.length > 0,
      ].filter(Boolean).length > 1;

    // Ratio Drivers First (30% of score weight)
    if (ratioDrivers.length > 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      if (hasMultipleTypes) {
        doc.text("⚖️ Ratio Changes:", margin, yPosition);
        yPosition += 6;
      } else {
        doc.text("Top Changes:", margin, yPosition);
        yPosition += 6;
      }

      doc.setFont("helvetica", "normal");
      ratioDrivers.forEach((driver) => {
        if (checkPageBreak(8)) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
        }

        // Bullet point
        doc.circle(margin + 2, yPosition - 1, 0.5, "F");

        // Driver note
        const noteLines = doc.splitTextToSize(
          driver.note,
          pageWidth - 2 * margin - 25
        );
        doc.text(noteLines[0], margin + 5, yPosition);

        // Impact points (colored)
        const impactColor =
          driver.impactPoints > 0 ? [34, 197, 94] : [239, 68, 68];
        doc.setTextColor(impactColor[0], impactColor[1], impactColor[2]);
        doc.setFont("helvetica", "bold");
        doc.text(
          `${driver.impactPoints > 0 ? "+" : ""}${driver.impactPoints}`,
          pageWidth - margin - 15,
          yPosition,
          { align: "right" }
        );
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");

        yPosition += 6;

        // Additional lines if wrapped
        for (let i = 1; i < noteLines.length; i++) {
          if (checkPageBreak(6)) {
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
          }
          doc.text(noteLines[i], margin + 5, yPosition);
          yPosition += 6;
        }
      });

      if (hasMultipleTypes) yPosition += 4;
    }

    // Mineral Drivers
    if (mineralDrivers.length > 0) {
      if (!ratioDrivers.length && !flagDrivers.length) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Top Changes:", margin, yPosition);
        yPosition += 6;
      } else if (hasMultipleTypes) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("🔬 Mineral Changes:", margin, yPosition);
        yPosition += 6;
      }

      doc.setFont("helvetica", "normal");
      mineralDrivers.forEach((driver) => {
        if (checkPageBreak(8)) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
        }

        // Bullet point
        doc.circle(margin + 2, yPosition - 1, 0.5, "F");

        // Driver note
        const noteLines = doc.splitTextToSize(
          driver.note,
          pageWidth - 2 * margin - 25
        );
        doc.text(noteLines[0], margin + 5, yPosition);

        // Impact points (colored)
        const impactColor =
          driver.impactPoints > 0 ? [34, 197, 94] : [239, 68, 68];
        doc.setTextColor(impactColor[0], impactColor[1], impactColor[2]);
        doc.setFont("helvetica", "bold");
        doc.text(
          `${driver.impactPoints > 0 ? "+" : ""}${driver.impactPoints}`,
          pageWidth - margin - 15,
          yPosition,
          { align: "right" }
        );
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");

        yPosition += 6;

        // Additional lines if wrapped
        for (let i = 1; i < noteLines.length; i++) {
          if (checkPageBreak(6)) {
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
          }
          doc.text(noteLines[i], margin + 5, yPosition);
          yPosition += 6;
        }
      });

      if (hasMultipleTypes && flagDrivers.length > 0) yPosition += 4;
    }

    // Red Flag Drivers
    if (flagDrivers.length > 0) {
      if (!ratioDrivers.length && !mineralDrivers.length) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Top Changes:", margin, yPosition);
        yPosition += 6;
      } else if (hasMultipleTypes) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("⚠️ Critical Flags:", margin, yPosition);
        yPosition += 6;
      }

      doc.setFont("helvetica", "normal");
      flagDrivers.forEach((driver) => {
        if (checkPageBreak(8)) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
        }

        // Bullet point
        doc.circle(margin + 2, yPosition - 1, 0.5, "F");

        // Driver note
        const noteLines = doc.splitTextToSize(
          driver.note,
          pageWidth - 2 * margin - 25
        );
        doc.text(noteLines[0], margin + 5, yPosition);

        // Impact points (colored)
        const impactColor =
          driver.impactPoints > 0 ? [34, 197, 94] : [239, 68, 68];
        doc.setTextColor(impactColor[0], impactColor[1], impactColor[2]);
        doc.setFont("helvetica", "bold");
        doc.text(
          `${driver.impactPoints > 0 ? "+" : ""}${driver.impactPoints}`,
          pageWidth - margin - 15,
          yPosition,
          { align: "right" }
        );
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");

        yPosition += 6;

        // Additional lines if wrapped
        for (let i = 1; i < noteLines.length; i++) {
          if (checkPageBreak(6)) {
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
          }
          doc.text(noteLines[i], margin + 5, yPosition);
          yPosition += 6;
        }
      });
    }

    // Version info (subtle)
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Locked semantics (v${snapshot.scoreDelta.engine.semanticsVersion})`,
      margin,
      yPosition + 3
    );
    doc.setTextColor(0, 0, 0);

    yPosition += 15;
  }

  // === CHANGE FOCUS SUMMARY SECTION ===
  if (snapshot.focusSummary) {
    checkPageBreak(100);

    // Section header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(14, 165, 233); // Blue
    doc.text("🧭 Change Focus Summary", margin, yPosition);
    yPosition += 10;

    // Draw box around focus summary
    const boxStartY = yPosition;
    const boxPadding = 10;

    doc.setDrawColor(14, 165, 233);
    doc.setLineWidth(2);

    // Content inside box (calculate height first)
    const tempY = yPosition + boxPadding;

    // Primary Focus header
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139); // Gray
    doc.text("PRIMARY FOCUS", margin + boxPadding, tempY);

    let contentY = tempY + 6;

    // Primary focus key and direction
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    const focusKey = snapshot.focusSummary.primaryFocus.key;
    const direction =
      snapshot.focusSummary.primaryFocus.direction.toUpperCase();
    doc.text(`${focusKey} (${direction})`, margin + boxPadding, contentY);

    contentY += 8;

    // Primary focus reason
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const reasonLines = doc.splitTextToSize(
      snapshot.focusSummary.primaryFocus.reason,
      pageWidth - 2 * margin - 2 * boxPadding
    );
    reasonLines.forEach((line: string) => {
      doc.text(line, margin + boxPadding, contentY);
      contentY += 5;
    });

    contentY += 5;

    // Secondary focus (if any)
    if (snapshot.focusSummary.secondaryFocus.length > 0) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text("ALSO MONITOR", margin + boxPadding, contentY);
      contentY += 6;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      snapshot.focusSummary.secondaryFocus.forEach((item) => {
        doc.circle(margin + boxPadding + 2, contentY - 1, 0.5, "F");
        doc.text(
          `${item.key} (${item.direction})`,
          margin + boxPadding + 5,
          contentY
        );
        contentY += 5;
      });

      contentY += 3;
    }

    // Explanation
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("GUIDANCE", margin + boxPadding, contentY);
    contentY += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    const explanationLines = doc.splitTextToSize(
      snapshot.focusSummary.explanation,
      pageWidth - 2 * margin - 2 * boxPadding
    );
    explanationLines.forEach((line: string) => {
      doc.text(line, margin + boxPadding, contentY);
      contentY += 5;
    });

    contentY += 5;

    // Scope notice (important)
    doc.setFillColor(255, 251, 235); // Light yellow
    doc.roundedRect(
      margin + boxPadding,
      contentY - 3,
      pageWidth - 2 * margin - 2 * boxPadding,
      20,
      2,
      2,
      "F"
    );

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(146, 64, 14); // Brown
    doc.text("ℹ️ SCOPE NOTICE", margin + boxPadding + 3, contentY + 2);
    contentY += 7;

    doc.setFont("helvetica", "normal");
    const noticeLines = doc.splitTextToSize(
      snapshot.focusSummary.scopeNotice,
      pageWidth - 2 * margin - 2 * boxPadding - 6
    );
    noticeLines.forEach((line: string) => {
      doc.text(line, margin + boxPadding + 3, contentY);
      contentY += 4;
    });

    contentY += boxPadding;

    // Draw the box
    const boxHeight = contentY - boxStartY;
    doc.roundedRect(margin, boxStartY, pageWidth - 2 * margin, boxHeight, 3, 3);

    yPosition = contentY + 10;
  }

  // === OXIDATION PATTERN CLASSIFICATION SECTION ===
  if (snapshot.oxidationClassification) {
    checkPageBreak(80);

    // Section header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(168, 85, 247); // Purple
    doc.text("🔄 Oxidation Pattern Summary", margin, yPosition);
    yPosition += 10;

    // Type badge colors
    const typeColors: Record<string, [number, number, number]> = {
      fast: [59, 130, 246], // blue
      slow: [249, 115, 22], // orange
      mixed: [168, 85, 247], // purple
      balanced: [16, 185, 129], // green
    };

    const typeColor = typeColors[snapshot.oxidationClassification.type] || [
      107, 114, 128,
    ];

    // Type badge
    doc.setFillColor(...typeColor);
    doc.roundedRect(margin, yPosition, 65, 8, 2, 2, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    const typeLabel =
      snapshot.oxidationClassification.type.charAt(0).toUpperCase() +
      snapshot.oxidationClassification.type.slice(1) +
      " Oxidizer";
    doc.text(typeLabel, margin + 3, yPosition + 5.5);

    yPosition += 12;

    // Interpretation text
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    const interpretationLines = doc.splitTextToSize(
      snapshot.oxidationClassification.interpretation,
      pageWidth - 2 * margin
    );
    interpretationLines.forEach((line: string) => {
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });

    yPosition += 5;

    // Scope disclaimer
    doc.setFillColor(254, 243, 199); // Light amber
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 22, 2, 2, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(146, 64, 14);
    doc.text("⚠️ CLASSIFICATION SCOPE", margin + 3, yPosition + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    const disclaimerText =
      "This is a pattern classification and metabolic tendency indicator. NOT a diagnosis, disease label, treatment directive, or prediction. Based on mineral relationships only.";
    const disclaimerLines = doc.splitTextToSize(
      disclaimerText,
      pageWidth - 2 * margin - 6
    );
    let disclaimerY = yPosition + 10;
    disclaimerLines.forEach((line: string) => {
      doc.text(line, margin + 3, disclaimerY);
      disclaimerY += 4;
    });

    yPosition += 27;

    // Version metadata
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Oxidation Engine v${snapshot.oxidationClassification.semanticsVersion}`,
      margin,
      yPosition
    );

    yPosition += 15;
  }

  // === OXIDATION PATTERN CHANGE SECTION (DELTA) ===
  if (oxidationDelta && oxidationDelta.patternChange.type !== "new_test") {
    checkPageBreak(100);

    // Section header with milestone badge if applicable
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(245, 158, 11); // Amber

    if (oxidationDelta.patternChange.isMilestone) {
      // Milestone badge
      doc.setFillColor(220, 38, 38); // Red
      doc.roundedRect(margin, yPosition, 40, 7, 2, 2, "F");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("🎯 MILESTONE", margin + 2, yPosition + 5);
      doc.setTextColor(245, 158, 11);
      doc.setFontSize(14);
      doc.text("🔄 Oxidation Pattern Change", margin + 45, yPosition + 5);
      yPosition += 12;
    } else {
      doc.text("🔄 Oxidation Pattern Change", margin, yPosition);
      yPosition += 10;
    }

    // Pattern comparison box
    doc.setFillColor(254, 252, 232); // Very light yellow
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 24, 2, 2, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);

    const previousLabel = `Previous: ${oxidationDelta.previous.type}`;
    const currentLabel = `Current: ${oxidationDelta.current.type}`;
    const arrow = "→";

    doc.text(previousLabel, margin + 5, yPosition + 8);
    doc.text(arrow, margin + 60, yPosition + 8);
    doc.setFont("helvetica", "bold");
    doc.text(currentLabel, margin + 70, yPosition + 8);

    yPosition += 15;

    // Distance to balanced metric
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const distanceText = `Distance to Balanced: ${oxidationDelta.distanceToBalanced.previous.toFixed(
      1
    )} → ${oxidationDelta.distanceToBalanced.current.toFixed(1)}`;
    doc.text(distanceText, margin + 5, yPosition + 3);

    if (oxidationDelta.distanceToBalanced.direction === "toward_balanced") {
      doc.setTextColor(16, 185, 129); // Green
      doc.text(" (improving)", margin + 90, yPosition + 3);
    } else if (
      oxidationDelta.distanceToBalanced.direction === "away_from_balanced"
    ) {
      doc.setTextColor(239, 68, 68); // Red
      doc.text(" (diverging)", margin + 90, yPosition + 3);
    }

    yPosition += 12;
    doc.setTextColor(55, 65, 81);

    // Summary text
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(
      oxidationDelta.summary,
      pageWidth - 2 * margin
    );
    summaryLines.forEach((line: string) => {
      checkPageBreak(6);
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });

    yPosition += 5;

    // Key changes (if present)
    if (oxidationDelta.keyChanges.length > 0) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(107, 114, 128);
      doc.text("Key Indicator Changes:", margin, yPosition);
      yPosition += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      oxidationDelta.keyChanges.slice(0, 3).forEach((change) => {
        checkPageBreak(5);
        const changeText = `• ${change.indicator}: ${change.from} → ${change.to}`;
        doc.setTextColor(55, 65, 81);
        doc.text(changeText, margin + 5, yPosition);
        yPosition += 5;
      });

      yPosition += 5;
    }

    // Version info
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Oxidation Delta Engine v${oxidationDelta.version}`,
      margin,
      yPosition
    );

    yPosition += 15;
  }

  // === TREND ANALYSIS SECTION ===
  if (snapshot.trendAnalysis) {
    checkPageBreak(100);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(251, 191, 36); // Yellow/amber
    doc.text("📈 Trend Analysis", margin, yPosition);
    yPosition += 8;

    const boxPadding = 5;
    const boxStartY = yPosition;
    let contentY = boxStartY + boxPadding;

    // Headline
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(snapshot.trendAnalysis.headline, margin + boxPadding, contentY);
    contentY += 8;

    // Overall pattern
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Overall Pattern:", margin + boxPadding, contentY);
    contentY += 6;

    doc.setFont("helvetica", "normal");
    const pattern = snapshot.trendAnalysis.overall;
    doc.text(
      `Direction: ${
        pattern.direction.charAt(0).toUpperCase() + pattern.direction.slice(1)
      }`,
      margin + boxPadding + 5,
      contentY
    );
    contentY += 5;
    doc.text(
      `Strength: ${
        pattern.strength.charAt(0).toUpperCase() + pattern.strength.slice(1)
      }`,
      margin + boxPadding + 5,
      contentY
    );
    contentY += 5;
    doc.text(
      `Total Change: ${
        pattern.scoreDelta > 0 ? "+" : ""
      }${pattern.scoreDelta.toFixed(1)} points`,
      margin + boxPadding + 5,
      contentY
    );
    contentY += 5;
    doc.text(
      `Consistency: ${(pattern.consistency * 100).toFixed(0)}%`,
      margin + boxPadding + 5,
      contentY
    );
    contentY += 8;

    // Summary
    doc.setFont("helvetica", "bold");
    doc.text("Summary:", margin + boxPadding, contentY);
    contentY += 6;

    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(
      snapshot.trendAnalysis.summary,
      pageWidth - 2 * margin - 2 * boxPadding
    );
    summaryLines.forEach((line: string) => {
      doc.text(line, margin + boxPadding, contentY);
      contentY += 5;
    });

    contentY += 5;

    // Key insights
    if (snapshot.trendAnalysis.keyInsights.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Key Insights:", margin + boxPadding, contentY);
      contentY += 6;

      doc.setFont("helvetica", "normal");
      snapshot.trendAnalysis.keyInsights.forEach((insight: string) => {
        const insightLines = doc.splitTextToSize(
          `• ${insight}`,
          pageWidth - 2 * margin - 2 * boxPadding - 5
        );
        insightLines.forEach((line: string) => {
          doc.text(line, margin + boxPadding + 5, contentY);
          contentY += 5;
        });
      });

      contentY += 5;
    }

    // Notable mineral trends
    if (snapshot.trendAnalysis.mineralTrends.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Notable Mineral Trends:", margin + boxPadding, contentY);
      contentY += 6;

      doc.setFont("helvetica", "normal");
      snapshot.trendAnalysis.mineralTrends.forEach((trend: any) => {
        const direction =
          trend.direction === "improving"
            ? "↑"
            : trend.direction === "worsening"
            ? "↓"
            : "→";
        doc.text(
          `${direction} ${trend.mineral}: ${trend.note}`,
          margin + boxPadding + 5,
          contentY
        );
        contentY += 5;
      });

      contentY += 5;
    }

    // Timespan info
    doc.setFillColor(254, 252, 232); // Very light yellow
    doc.roundedRect(
      margin + boxPadding,
      contentY - 3,
      pageWidth - 2 * margin - 2 * boxPadding,
      15,
      2,
      2,
      "F"
    );

    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(113, 63, 18); // Amber-900
    const totalDays = Math.round(
      (new Date(snapshot.trendAnalysis.timespan.lastDate).getTime() -
        new Date(snapshot.trendAnalysis.timespan.firstDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    doc.text(
      `Analysis based on ${snapshot.trendAnalysis.timespan.periodCount} tests over ${totalDays} days`,
      margin + boxPadding + 3,
      contentY + 3
    );
    contentY += 12;

    contentY += boxPadding;

    // Draw the box
    const trendBoxHeight = contentY - boxStartY;
    doc.roundedRect(
      margin,
      boxStartY,
      pageWidth - 2 * margin,
      trendBoxHeight,
      3,
      3
    );

    yPosition = contentY + 10;
  }

  // === MINERAL LEVELS TABLE ===
  checkPageBreak(80);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(102, 126, 234);
  doc.text("Mineral Levels & Reference Ranges", margin, yPosition);
  yPosition += 8;

  // Use minerals from immutable snapshot
  autoTable(doc, {
    startY: yPosition,
    head: [["Mineral", "Value", "Ideal Range", "Status"]],
    body: minerals.map((m) => [
      `${m.name} (${m.symbol})`,
      `${m.value.toFixed(3)} ${m.unit}`,
      `${m.minIdeal}-${m.maxIdeal} ${m.unit}`,
      m.status,
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [102, 126, 234],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    didParseCell: function (data) {
      if (data.section === "body" && data.column.index === 3) {
        const status = data.cell.raw as string;
        // Use constants for color consistency
        if (status === "Low" || status === "High") {
          data.cell.styles.textColor = STATUS_COLORS.Low.rgb as any;
          data.cell.styles.fontStyle = "bold";
        } else if (status === "Optimal") {
          data.cell.styles.textColor = STATUS_COLORS.Optimal.rgb as any;
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // === CRITICAL RATIOS (Practitioner Mode Only) ===
  if (metadata.isPractitionerMode) {
    checkPageBreak(80);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(102, 126, 234);
    doc.text("Critical Mineral Ratios", margin, yPosition);
    yPosition += 8;

    // Use ratios from immutable snapshot
    autoTable(doc, {
      startY: yPosition,
      head: [["Ratio", "Calculated", "Ideal Range", "Status"]],
      body: ratios.map((r) => [
        r.name,
        r.value.toFixed(2),
        `${r.minIdeal}-${r.maxIdeal}`,
        r.status,
      ]),
      theme: "grid",
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      didParseCell: function (data) {
        if (data.section === "body" && data.column.index === 3) {
          const status = data.cell.raw as string;
          // Use constants for color consistency
          if (status === "Low" || status === "High") {
            data.cell.styles.textColor = STATUS_COLORS.Low.rgb as any;
            data.cell.styles.fontStyle = "bold";
          } else if (status === "Optimal") {
            data.cell.styles.textColor = STATUS_COLORS.Optimal.rgb as any;
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // === TOXIC ELEMENTS (Optional) ===
  if (snapshot.toxicElements && snapshot.toxicElements.length > 0) {
    checkPageBreak(80);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 53, 69); // Red color for toxic elements
    doc.text("⚠️ Toxic Elements", margin, yPosition);
    yPosition += 6;

    // Disclaimer box
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(133, 100, 4); // Warning color
    doc.setDrawColor(255, 193, 7);
    doc.setFillColor(255, 243, 205);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 12, 2, 2, "FD");
    doc.text(
      "Environmental context only. Not diagnostic. Not used in scoring or analysis.",
      margin + 3,
      yPosition + 5
    );
    doc.text(
      "These values were not used in health score, interpretation, or recommendations.",
      margin + 3,
      yPosition + 9
    );
    yPosition += 16;

    const toxicTableHeaders = metadata.isPractitionerMode
      ? ["Element", "Value", "Reference High", "Status"]
      : ["Element", "Value", "Status"];

    const toxicTableBody = snapshot.toxicElements.map((element) => {
      const row = [
        `${element.name} (${element.key})`,
        `${element.value.toFixed(3)} ${element.unit}`,
      ];
      if (metadata.isPractitionerMode) {
        row.push(`< ${element.referenceHigh.toFixed(3)} ${element.unit}`);
      }
      row.push(
        element.status === "elevated" ? "Above Reference" : "Within Reference"
      );
      return row;
    });

    autoTable(doc, {
      startY: yPosition,
      head: [toxicTableHeaders],
      body: toxicTableBody,
      theme: "grid",
      headStyles: {
        fillColor: [220, 53, 69],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [255, 245, 245],
      },
      didParseCell: function (data) {
        const statusColIndex = metadata.isPractitionerMode ? 3 : 2;
        if (data.section === "body" && data.column.index === statusColIndex) {
          const status = data.cell.raw as string;
          if (status === "Above Reference") {
            data.cell.styles.textColor = [220, 53, 69];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // === ADDITIONAL ELEMENTS (Optional) ===
  if (snapshot.additionalElements && snapshot.additionalElements.length > 0) {
    checkPageBreak(80);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 167, 69); // Green color for additional elements
    doc.text("🔬 Additional Elements", margin, yPosition);
    yPosition += 6;

    // Disclaimer box
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(133, 100, 4);
    doc.setDrawColor(255, 193, 7);
    doc.setFillColor(255, 243, 205);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 12, 2, 2, "FD");
    doc.text(
      "Observational context only. Not diagnostic. Not used in scoring or analysis.",
      margin + 3,
      yPosition + 5
    );
    doc.text(
      "These values were not used in health score, interpretation, or recommendations.",
      margin + 3,
      yPosition + 9
    );
    yPosition += 16;

    autoTable(doc, {
      startY: yPosition,
      head: [["Element", "Value", "Detection Status"]],
      body: snapshot.additionalElements.map((element) => [
        `${element.name} (${element.key})`,
        element.value > 0
          ? `${element.value.toFixed(3)} ${element.unit}`
          : "< 0.001 mg%",
        element.detected ? "Detected" : "Not Detected",
      ]),
      theme: "grid",
      headStyles: {
        fillColor: [40, 167, 69],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [248, 255, 249],
      },
      didParseCell: function (data) {
        if (data.section === "body" && data.column.index === 2) {
          const status = data.cell.raw as string;
          if (status === "Detected") {
            data.cell.styles.textColor = [40, 167, 69];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // === AI INSIGHTS (Full) ===
  checkPageBreak(40);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(102, 126, 234);
  doc.text("AI-Powered Health Insights", margin, yPosition);
  yPosition += 8;

  // Add confidence score banner if available
  if (snapshot.aiConfidence) {
    const confidence = snapshot.aiConfidence;
    checkPageBreak(25);

    // Confidence banner box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 20, 2, 2, "FD");

    yPosition += 5;

    // Confidence icon and level
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    const icon = getConfidenceIcon(confidence.level);
    doc.text(
      `${icon} ${confidence.level} Confidence (${confidence.score}%)`,
      margin + 3,
      yPosition
    );

    yPosition += 5;

    // Confidence description
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const desc = getConfidenceDescription(confidence.level);
    doc.text(desc, margin + 3, yPosition);

    yPosition += 5;

    // Evidence count in practitioner mode
    if (metadata.isPractitionerMode && confidence.evidence.length > 0) {
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `Based on ${confidence.abnormalCount} abnormal markers (${confidence.evidence.length} pieces of evidence)`,
        margin + 3,
        yPosition
      );
    }

    yPosition += 10;

    // Add evidence list for practitioner mode
    if (metadata.isPractitionerMode && confidence.evidence.length > 0) {
      checkPageBreak(15 + confidence.evidence.length * 4);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(102, 126, 234);
      doc.text("Supporting Evidence:", margin, yPosition);
      yPosition += 5;

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);

      const evidenceList = formatEvidence(confidence.evidence);
      evidenceList.forEach((ev) => {
        checkPageBreak(5);
        doc.circle(margin + 2, yPosition - 1, 0.5, "F");
        const splitEv = doc.splitTextToSize(ev, pageWidth - 2 * margin - 10);
        splitEv.forEach((line: string, lineIdx: number) => {
          if (lineIdx > 0) {
            checkPageBreak(4);
          }
          doc.text(line, margin + 5, yPosition);
          yPosition += 4;
        });
      });

      yPosition += 5;
    }
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  // Use guarded insights (already sanitized at top of function)
  // Exclude last recommendation (disclaimer - goes in footer)
  const guardedText = [
    ...guarded.insights,
    "",
    "**Recommendations:**",
    ...guarded.recommendations.slice(0, -1),
  ].join("\n");

  const formattedInsights = formatInsightsForPDF(guardedText);
  const splitInsights = doc.splitTextToSize(
    formattedInsights,
    pageWidth - 2 * margin
  );

  splitInsights.forEach((line: string) => {
    if (checkPageBreak(6)) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
    }

    // Handle bullet points
    if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
      doc.circle(margin + 2, yPosition - 1, 0.5, "F");
      doc.text(line.substring(1).trim(), margin + 5, yPosition);
    } else if (line.trim().startsWith("**") || line.includes("###")) {
      // Bold headers
      doc.setFont("helvetica", "bold");
      doc.text(
        line.replace(/\*\*/g, "").replace(/###/g, "").trim(),
        margin,
        yPosition
      );
      doc.setFont("helvetica", "normal");
    } else {
      doc.text(line, margin, yPosition);
    }

    yPosition += 5;
  });

  // === PRACTITIONER NOTES SECTION ===
  if (metadata.isPractitionerMode) {
    checkPageBreak(50);
    yPosition += 10;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(102, 126, 234);
    doc.text("Practitioner Notes", margin, yPosition);
    yPosition += 8;

    // Draw note-taking area
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    for (let i = 0; i < 5; i++) {
      doc.line(
        margin,
        yPosition + i * 8,
        pageWidth - margin,
        yPosition + i * 8
      );
    }

    // Add TEI toxic ratios disclaimer if toxic elements present
    if (snapshot.toxicElements && snapshot.toxicElements.length > 0) {
      checkPageBreak(20);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const teiToxicDisclaimer = getTEIDisclaimer("toxicRatios");
      const splitDisclaimer = doc.splitTextToSize(
        teiToxicDisclaimer,
        pageWidth - 2 * margin
      );
      splitDisclaimer.forEach((line: string) => {
        doc.text(line, margin, yPosition);
        yPosition += 4;
      });
      yPosition += 10;
    }

    yPosition += 50;
  }

  // === PRACTITIONER ANNOTATIONS SECTION ===
  if (
    metadata.isPractitionerMode &&
    snapshot.practitionerAnnotations &&
    snapshot.practitionerAnnotations.length > 0
  ) {
    checkPageBreak(60);
    yPosition += 10;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 130, 246); // Blue
    doc.text("📝 Practitioner Annotations", margin, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(
      `${snapshot.practitionerAnnotations.length} professional ${
        snapshot.practitionerAnnotations.length === 1 ? "note" : "notes"
      } recorded`,
      margin,
      yPosition
    );
    yPosition += 10;

    // Group annotations by target
    const annotationsByTarget: Record<string, PractitionerAnnotation[]> = {};
    for (const annotation of snapshot.practitionerAnnotations) {
      // Only show client-visible annotations in PDF (unless explicitly all)
      if (!annotation.visibleToClient) continue;

      if (!annotationsByTarget[annotation.target]) {
        annotationsByTarget[annotation.target] = [];
      }
      annotationsByTarget[annotation.target].push(annotation);
    }

    // Helper to get target display name
    const getTargetDisplayName = (target: string): string => {
      if (target.includes("_")) {
        return target.toUpperCase().replace("_", "/");
      }
      const specialNames: Record<string, string> = {
        ai_insights: "AI Insights",
        oxidation: "Oxidation Classification",
        health_score: "Health Score",
        general: "General Report",
      };
      return specialNames[target] || target.toUpperCase();
    };

    // Render each target group
    for (const [target, targetAnnotations] of Object.entries(
      annotationsByTarget
    )) {
      checkPageBreak(30);

      // Target header
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(55, 65, 81);
      doc.text(`${getTargetDisplayName(target)}:`, margin, yPosition);
      yPosition += 7;

      // Render annotations for this target
      for (const annotation of targetAnnotations) {
        checkPageBreak(25);

        // Annotation type label
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(156, 163, 175);
        const typeLabels: Record<string, string> = {
          insight_review: "🔍 AI Insight Review",
          mineral_note: "⚗️ Mineral Note",
          ratio_note: "📊 Ratio Note",
          oxidation_note: "⚡ Oxidation Note",
          general_note: "📝 General Note",
          override: "✏️ Override",
        };
        doc.text(typeLabels[annotation.type] || "Note", margin + 3, yPosition);
        yPosition += 5;

        // Override status badge if present
        if (annotation.overrideStatus) {
          const statusLabels: Record<string, string> = {
            reviewed: "✓ Reviewed & Approved",
            modified: "⚠ Modified by Practitioner",
            replaced: "↻ Replaced by Practitioner",
            flagged: "🚩 Flagged for Review",
          };
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(59, 130, 246);
          doc.text(
            statusLabels[annotation.overrideStatus],
            margin + 3,
            yPosition
          );
          yPosition += 5;
        }

        // Annotation content
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(55, 65, 81);
        const contentLines = doc.splitTextToSize(
          annotation.content,
          pageWidth - 2 * margin - 6
        );
        contentLines.forEach((line: string) => {
          checkPageBreak(5);
          doc.text(line, margin + 3, yPosition);
          yPosition += 4.5;
        });

        // Annotation metadata
        doc.setFontSize(7);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(156, 163, 175);
        const timestamp = annotation.updatedAt || annotation.createdAt;
        const date = new Date(timestamp);
        const formattedDate = date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
        doc.text(
          `— ${annotation.practitionerName}, ${formattedDate}`,
          margin + 3,
          yPosition
        );
        yPosition += 8;
      }
    }

    yPosition += 5;
  }

  // === ECK INTERPRETATION PRINCIPLES APPENDIX ===
  // Add educational content based on Dr. Paul Eck's foundational HTMA principles
  checkPageBreak(80);
  yPosition += 15;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(90, 74, 58); // Warm brown
  doc.text("🧭 HTMA Interpretation Principles", margin, yPosition);
  yPosition += 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(138, 122, 106);
  doc.text("Based on the work of Dr. Paul Eck", margin, yPosition);
  yPosition += 10;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);

  // Get formatted ECK Nine Rules text
  const eckPrinciplesText = getECKNineRulesFormattedText();
  const eckLines = doc.splitTextToSize(
    eckPrinciplesText,
    pageWidth - 2 * margin
  );

  eckLines.forEach((line: string) => {
    checkPageBreak(6);
    // Bold the rule numbers and titles
    if (line.match(/^\d+\./)) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(90, 74, 58);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
    }
    doc.text(line, margin, yPosition);
    yPosition += 5;
  });

  // Add ECK attribution
  yPosition += 5;
  checkPageBreak(10);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(138, 122, 106);
  const attribution =
    "These principles are based on Dr. Paul Eck's research in nutritional balancing and HTMA interpretation.";
  const attrLines = doc.splitTextToSize(attribution, pageWidth - 2 * margin);
  attrLines.forEach((line: string) => {
    doc.text(line, margin, yPosition);
    yPosition += 4;
  });

  // Add footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(guarded.version, guarded.reviewedDate);
  }

  // Save the PDF with snapshot data
  const fileName = `HTMA_Report_${
    patientInfo.testDate?.replace(/\//g, "-") ||
    new Date(metadata.generatedAt).toISOString().split("T")[0]
  }_${metadata.reportId.substring(0, 8)}.pdf`;
  doc.save(fileName);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format AI insights text for PDF display
 * Removes markdown formatting while preserving structure
 */
function formatInsightsForPDF(insights: string): string {
  const formatted = insights
    .replace(/\*\*\*/g, "")
    .replace(/\*\*/g, "")
    .replace(/###/g, "")
    .replace(/##/g, "")
    .replace(/#/g, "");

  return formatted;
}

/**
 * Convert hex color to RGB for jsPDF
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 102, g: 126, b: 234 }; // Default blue
}
