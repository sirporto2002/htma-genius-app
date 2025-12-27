import { useState } from "react";
import { MineralData } from "./HTMAInputForm";
import { generateHTMAPDFReport } from "../lib/pdfGenerator";
import { createReportSnapshot } from "../lib/createReportSnapshot";
import { createAuditEvent, logAuditEvent } from "../lib/auditEvent";
import { HealthScoreBreakdown } from "../lib/healthScore";
import { ScoreDeltaExplanation } from "../lib/scoreDeltaExplainer";
import { ChangeFocusSummary } from "../lib/changeCoachingEngine";
import { TrendExplanation } from "../lib/trendExplainer";
import { OxidationClassification } from "../lib/oxidationClassification";
import { PractitionerAnnotation } from "../lib/reportSnapshot";
import { toast } from "sonner";

interface PDFReportButtonProps {
  mineralData: MineralData;
  insights: string;
  isPractitionerMode?: boolean;
  healthScore?: HealthScoreBreakdown | null;
  scoreDelta?: ScoreDeltaExplanation | null;
  focusSummary?: ChangeFocusSummary | null;
  trendAnalysis?: TrendExplanation | null;
  oxidationClassification?: OxidationClassification | null;
  currentAnalysisId?: string | null;
  practitionerAnnotations?: ReadonlyArray<PractitionerAnnotation>;
  onPdfGenerated?: () => void;
}

export default function PDFReportButton({
  mineralData,
  insights,
  isPractitionerMode = false,
  healthScore = null,
  scoreDelta = null,
  focusSummary = null,
  trendAnalysis = null,
  oxidationClassification = null,
  currentAnalysisId = null, // eslint-disable-line @typescript-eslint/no-unused-vars
  practitionerAnnotations = [],
  onPdfGenerated,
}: PDFReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [testDate, setTestDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      // Create immutable snapshot at generation time
      const snapshot = createReportSnapshot({
        mineralData,
        aiInsights: insights,
        isPractitionerMode,
        patientName: patientName || undefined,
        testDate,
        healthScore: healthScore || undefined,
        scoreDelta: scoreDelta || undefined,
        focusSummary: focusSummary || undefined,
        trendAnalysis: trendAnalysis || undefined,
        oxidationClassification: oxidationClassification || undefined,
        practitionerAnnotations:
          practitionerAnnotations.length > 0
            ? [...practitionerAnnotations]
            : undefined,
      });

      // Create audit event for PDF generation
      const auditEvent = createAuditEvent({
        eventType: "REPORT_GENERATED",
        reportId: snapshot.metadata.reportId,
        isPractitionerMode,
        metadata: {
          hasPatientName: Boolean(patientName),
          testDate,
        },
      });

      // Log audit event
      logAuditEvent(auditEvent);

      // Generate PDF from snapshot only (no live state)
      await generateHTMAPDFReport(snapshot);

      toast.success("PDF report generated successfully!");
      setShowOptions(false);

      // Trigger feedback callback if provided
      if (onPdfGenerated) {
        onPdfGenerated();
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF report");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="pdf-report-container">
      <button
        className="pdf-button"
        onClick={() => setShowOptions(!showOptions)}
        disabled={isGenerating}
      >
        <span className="pdf-icon">📄</span>
        <span className="pdf-text">
          {isGenerating ? "Generating..." : "Download PDF Report"}
        </span>
      </button>

      {showOptions && (
        <div className="pdf-options-panel">
          <h4>Report Options</h4>

          <div className="form-group">
            <label htmlFor="patientName">
              Patient Name (Optional)
              {isPractitionerMode && (
                <span className="practitioner-badge-small">👨‍⚕️</span>
              )}
            </label>
            <input
              id="patientName"
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient name"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="testDate">Test Date</label>
            <input
              id="testDate"
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="form-input"
            />
          </div>

          {isPractitionerMode && (
            <div className="info-box">
              <strong>📋 Practitioner Report Includes:</strong>
              <ul>
                <li>Complete mineral reference ranges</li>
                <li>Critical mineral ratios table</li>
                <li>Clinical interpretation data</li>
                <li>Space for practitioner notes</li>
              </ul>
            </div>
          )}

          <div className="button-group">
            <button
              className="btn-generate"
              onClick={handleGeneratePDF}
              disabled={isGenerating}
            >
              {isGenerating ? "⏳ Generating..." : "✅ Generate PDF"}
            </button>
            <button
              className="btn-cancel"
              onClick={() => setShowOptions(false)}
              disabled={isGenerating}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .pdf-report-container {
          margin-top: 1.5rem;
          position: relative;
        }

        .pdf-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          width: 100%;
          justify-content: center;
        }

        .pdf-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .pdf-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .pdf-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .pdf-icon {
          font-size: 1.5rem;
        }

        .pdf-text {
          font-size: 1rem;
        }

        .pdf-options-panel {
          margin-top: 1rem;
          padding: 1.5rem;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .pdf-options-panel h4 {
          margin: 0 0 1.25rem 0;
          font-size: 1.1rem;
          color: #333;
          font-weight: 600;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #555;
        }

        .practitioner-badge-small {
          margin-left: 0.5rem;
          font-size: 0.9rem;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .info-box {
          background: #f0f4ff;
          border: 1px solid #b6d4fe;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.25rem;
          font-size: 0.9rem;
          color: #004085;
        }

        .info-box strong {
          display: block;
          margin-bottom: 0.5rem;
        }

        .info-box ul {
          margin: 0;
          padding-left: 1.5rem;
          list-style-type: disc;
        }

        .info-box li {
          margin-bottom: 0.25rem;
        }

        .button-group {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .btn-generate,
        .btn-cancel {
          flex: 1;
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-generate {
          background: #28a745;
          color: white;
        }

        .btn-generate:hover:not(:disabled) {
          background: #218838;
          transform: translateY(-1px);
        }

        .btn-generate:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .btn-cancel {
          background: #6c757d;
          color: white;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #5a6268;
        }

        @media (max-width: 768px) {
          .pdf-button {
            padding: 0.75rem 1.25rem;
            font-size: 0.9rem;
          }

          .pdf-icon {
            font-size: 1.25rem;
          }

          .pdf-options-panel {
            padding: 1.25rem;
          }

          .button-group {
            flex-direction: column;
          }
        }

        @media (prefers-color-scheme: dark) {
          .pdf-options-panel {
            background: #1a1a1a;
            border-color: #404040;
          }

          .pdf-options-panel h4 {
            color: #e0e0e0;
          }

          .form-group label {
            color: #cccccc;
          }

          .form-input {
            background: #2a2a2a;
            border-color: #404040;
            color: #e0e0e0;
          }

          .form-input:focus {
            border-color: #667eea;
          }

          .info-box {
            background: #1a3a52;
            border-color: #2a5a7f;
            color: #a8d5ff;
          }
        }
      `}</style>
    </div>
  );
}
