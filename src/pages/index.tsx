import { useState, useEffect } from "react";
import HTMAInputForm, { MineralData } from "../components/HTMAInputForm";
import MineralChart from "../components/MineralChart";
import HTMAPatternGraph from "../components/HTMAPatternGraph";
import AIInsights from "../components/AIInsights";
import ChromeAIStatus from "../components/ChromeAIStatus";
import AISourceBadge from "../components/AISourceBadge";
import PractitionerPanel from "../components/PractitionerPanel";
import PractitionerAnnotationPanel from "../components/PractitionerAnnotationPanel";
import AnnotationFeedback from "../components/AnnotationFeedback";
import PDFReportButton from "../components/PDFReportButton";
import AuthModal from "../components/AuthModal";
import SavedAnalyses from "../components/SavedAnalyses";
import HealthScoreCard from "../components/HealthScoreCard";
import TrendChart from "../components/TrendChart";
import ComparisonView from "../components/ComparisonView";
import WhyThisChanged from "../components/WhyThisChanged";
import WhyThisChangedPanel from "../components/WhyThisChangedPanel";
import FocusSummaryPanel from "../components/FocusSummaryPanel";
import TrendPanel from "../components/TrendPanel";
import PractitionerFeedbackInline from "../components/PractitionerFeedbackInline";
import OxidationTypeCard from "../components/OxidationTypeCard";
import AnalysisTimeline from "../components/AnalysisTimeline";
import MineralEvolutionChart from "../components/MineralEvolutionChart";
import ProgressHighlights from "../components/ProgressHighlights";
import ECKTipOfTheDay from "../components/ECKTipOfTheDay";
import PractitionerOnboarding from "../components/PractitionerOnboarding";
import { useAuth } from "../contexts/AuthContext";
import { usePractitionerMode } from "../hooks/usePractitionerMode";
import { useAIAnalysis } from "../hooks/useAIAnalysis";
import { calculateHealthScore, HealthScoreBreakdown } from "../lib/healthScore";
import {
  classifyOxidation,
  OxidationClassification,
} from "../lib/oxidationClassification";
import {
  calculateConfidenceScore,
  ConfidenceScore,
} from "../lib/aiConfidenceScoring";
import {
  MINERAL_REFERENCE_RANGES,
  getMineralStatus,
} from "../lib/htmaConstants";
import { calculateAllRatios, MineralValues } from "../lib/ratioEngine";
import { MineralSnapshot, RatioSnapshot } from "../lib/reportSnapshot";
import { explainScoreChange, ScoreExplanation } from "../lib/scoreExplainer";
import { ScoreDeltaExplanation } from "../lib/scoreDeltaExplainer";
import {
  ChangeFocusSummary,
  generateChangeFocusSummary,
} from "../lib/changeCoachingEngine";
import { TrendExplanation, analyzeTrends } from "../lib/trendExplainer";
import { PractitionerAnnotation } from "../lib/reportSnapshot";
import { toast } from "sonner";

export default function Home() {
  const { user, signOut } = useAuth();
  const { isPractitionerMode, disablePractitionerMode } = usePractitionerMode();
  const [preferChromeAI, setPreferChromeAI] = useState(true);
  const aiAnalysis = useAIAnalysis({
    preferChromeAI,
    streamingEnabled: true,
    autoDetect: true,
  });
  const [mineralData, setMineralData] = useState<MineralData | null>(null);
  const [insights, setInsights] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSavedAnalyses, setShowSavedAnalyses] = useState(false);
  const [healthScore, setHealthScore] = useState<HealthScoreBreakdown | null>(
    null
  );
  const [savedAnalyses, setSavedAnalyses] = useState<any[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonAnalyses, setComparisonAnalyses] = useState<
    [any, any] | null
  >(null);
  const [scoreExplanation, setScoreExplanation] =
    useState<ScoreExplanation | null>(null);
  const [scoreDelta, setScoreDelta] = useState<ScoreDeltaExplanation | null>(
    null
  );
  const [focusSummary, setFocusSummary] = useState<ChangeFocusSummary | null>(
    null
  );
  const [trendAnalysis, setTrendAnalysis] = useState<TrendExplanation | null>(
    null
  );
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(
    null
  );
  const [showPdfFeedback, setShowPdfFeedback] = useState(false);
  const [oxidationClassification, setOxidationClassification] =
    useState<OxidationClassification | null>(null);
  const [aiConfidence, setAiConfidence] = useState<ConfidenceScore | null>(
    null
  );
  const [showTimeline, setShowTimeline] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTipOfTheDay, setShowTipOfTheDay] = useState(false);
  const [practitionerAnnotations, setPractitionerAnnotations] = useState<
    ReadonlyArray<PractitionerAnnotation>
  >([]);

  // Compute trend analysis when savedAnalyses changes (3+ analyses required)
  useEffect(() => {
    if (savedAnalyses.length >= 3) {
      try {
        // Prepare data points for trend analysis
        const dataPoints = savedAnalyses.map((analysis) => ({
          date: analysis.createdAt || new Date().toISOString(),
          score: analysis.healthScore?.totalScore || 0,
          minerals: analysis.mineralData || {},
          ratios: {}, // Could extract from analysis if available
          flags: analysis.healthScore?.criticalIssues || [],
        }));

        const trends = analyzeTrends(dataPoints);
        setTrendAnalysis(trends);
      } catch (error) {
        console.error("Failed to compute trend analysis:", error);
        setTrendAnalysis(null);
      }
    } else {
      setTrendAnalysis(null);
    }
  }, [savedAnalyses]);

  // Check if practitioner onboarding should be shown
  useEffect(() => {
    if (isPractitionerMode) {
      const onboardingComplete = localStorage.getItem(
        "practitionerOnboardingComplete"
      );
      if (!onboardingComplete) {
        setShowOnboarding(true);
      } else {
        // Show tip of the day after onboarding is complete
        setShowTipOfTheDay(true);
      }
    } else {
      setShowOnboarding(false);
      setShowTipOfTheDay(false);
    }
  }, [isPractitionerMode]);

  const handleAnalyze = async (data: MineralData) => {
    setIsAnalyzing(true);
    setMineralData(data);
    setHasAnalyzed(false);
    setHealthScore(null);
    setAiConfidence(null);

    try {
      // Try Chrome AI analysis first - pass userId for auto-save
      await aiAnalysis.analyze(data, user?.uid);

      // Use Chrome AI insights if available, otherwise fall back to cloud API
      if (aiAnalysis.insights && !aiAnalysis.error) {
        setInsights(aiAnalysis.insights);
        setHasAnalyzed(true);

        // Calculate health score
        const score = calculateHealthScore(data);
        setHealthScore(score);

        // Calculate oxidation classification
        try {
          const getValue = (val: string): number => parseFloat(val) || 0;
          const ca = getValue(data.calcium);
          const mg = getValue(data.magnesium);
          const na = getValue(data.sodium);
          const k = getValue(data.potassium);

          // Classify oxidation type
          let oxidation = null;
          if (ca > 0 && mg > 0 && na > 0 && k > 0) {
            oxidation = classifyOxidation({
              Ca: ca,
              Mg: mg,
              Na: na,
              K: k,
            });
            setOxidationClassification(oxidation);
          }

          // Calculate AI confidence score
          // Build minerals and ratios arrays for confidence calculation
          const mineralValues = {
            Ca: getValue(data.calcium),
            Mg: getValue(data.magnesium),
            Na: getValue(data.sodium),
            K: getValue(data.potassium),
            P: getValue(data.phosphorus),
            Cu: getValue(data.copper),
            Zn: getValue(data.zinc),
            Fe: getValue(data.iron),
            Mn: getValue(data.manganese),
            Cr: getValue(data.chromium),
            Se: getValue(data.selenium),
            B: getValue(data.boron),
            Co: getValue(data.cobalt),
            Mo: getValue(data.molybdenum),
            S: getValue(data.sulfur),
          };

          // Create mineral snapshots
          const minerals: MineralSnapshot[] = MINERAL_REFERENCE_RANGES.map(
            (ref) => {
              const value =
                mineralValues[ref.symbol as keyof typeof mineralValues];
              const status = getMineralStatus(
                value,
                ref.minIdeal,
                ref.maxIdeal
              );
              return {
                symbol: ref.symbol,
                name: ref.name,
                value,
                unit: ref.unit,
                minIdeal: ref.minIdeal,
                maxIdeal: ref.maxIdeal,
                status,
              };
            }
          );

          // Create ratio snapshots
          const ratioResults = calculateAllRatios(
            mineralValues as MineralValues
          );
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

          // Calculate confidence
          const confidence = calculateConfidenceScore(
            minerals,
            ratios,
            oxidation || undefined
          );
          setAiConfidence(confidence);
        } catch (error) {
          console.error("Failed to classify oxidation:", error);
          setOxidationClassification(null);
          setAiConfidence(null);
        }

        // Generate explanation if we have previous analyses
        if (savedAnalyses.length > 0) {
          const previousAnalysis = savedAnalyses[0]; // Most recent saved analysis
          const explanation = explainScoreChange(
            {
              mineralData: previousAnalysis.mineralData,
              healthScore: previousAnalysis.healthScore,
            },
            { mineralData: data, healthScore: score }
          );
          setScoreExplanation(explanation);
        } else {
          setScoreExplanation(null);
        }

        toast.success("Analysis complete!");

        // Auto-save if user is logged in
        if (user) {
          await saveAnalysis(data, aiAnalysis.insights);
        }
      } else if (aiAnalysis.error) {
        toast.error(aiAnalysis.error || "Failed to analyze data");
        console.error("Analysis error:", aiAnalysis.error);
      }
    } catch (error) {
      toast.error("Failed to connect to analysis service");
      console.error("Network error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Function to refresh saved analyses from API
  const refreshSavedAnalyses = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/get-analyses?userId=${user.uid}`);
      const data = await response.json();

      if (response.ok && data.analyses) {
        setSavedAnalyses(data.analyses);
        console.log("✅ Refreshed saved analyses:", data.analyses.length);
      }
    } catch (error) {
      console.error("Failed to refresh saved analyses:", error);
    }
  };

  const saveAnalysis = async (data: MineralData, insights: string) => {
    if (!user) {
      console.warn("Cannot save analysis: User not authenticated");
      return;
    }

    console.log("Attempting to save analysis for user:", user.uid);

    try {
      const response = await fetch("/api/save-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          mineralData: data,
          insights,
          isPractitionerMode, // Include practitioner mode in audit trail
        }),
      });

      console.log("Save analysis response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Save analysis result:", result);
        if (result.analysisId) {
          setCurrentAnalysisId(result.analysisId);
        }
        toast.success("Analysis saved to your account!");

        // Immediately refresh saved analyses to show the new one
        await refreshSavedAnalyses();
      } else {
        const errorData = await response.text();
        console.error("Save failed with status:", response.status, errorData);
        toast.error("Failed to save analysis");
      }
    } catch (error) {
      console.error("Failed to save analysis:", error);
      toast.error("Failed to save analysis - network error");
    }
  };

  const handleLoadAnalysis = (analysis: any) => {
    setMineralData(analysis.mineralData);
    setInsights(analysis.insights);
    setHasAnalyzed(true);
    setCurrentAnalysisId(analysis.id);

    // Calculate health score if not stored
    const score =
      analysis.healthScore || calculateHealthScore(analysis.mineralData);
    setHealthScore(score);

    // Use stored scoreDelta if available (immutable from save time)
    if (analysis.scoreDelta) {
      setScoreDelta(analysis.scoreDelta);

      // Generate focus summary from delta
      try {
        const audience = isPractitionerMode ? "practitioner" : "consumer";
        const focus = generateChangeFocusSummary(analysis.scoreDelta, audience);
        setFocusSummary(focus);
      } catch (error) {
        console.error("Failed to generate focus summary:", error);
        setFocusSummary(null);
      }
    } else {
      setScoreDelta(null);
      setFocusSummary(null);
    }

    // Legacy: Generate explanation if we have multiple saved analyses (old WhyThisChanged)
    if (savedAnalyses.length > 1) {
      // Find the analysis that comes before the loaded one
      const loadedIndex = savedAnalyses.findIndex((a) => a.id === analysis.id);
      if (loadedIndex > 0) {
        const previousAnalysis = savedAnalyses[loadedIndex - 1];
        const explanation = explainScoreChange(
          {
            mineralData: previousAnalysis.mineralData,
            healthScore: previousAnalysis.healthScore,
          },
          { mineralData: analysis.mineralData, healthScore: score }
        );
        setScoreExplanation(explanation);
      } else {
        setScoreExplanation(null);
      }
    } else {
      setScoreExplanation(null);
    }

    setShowSavedAnalyses(false);
    toast.success("Analysis loaded!");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setMineralData(null);
      setInsights("");
      setHasAnalyzed(false);
      setHealthScore(null);
      setSavedAnalyses([]);
      setShowSavedAnalyses(false);
      setShowComparison(false);
      setComparisonAnalyses(null);
      setScoreExplanation(null);
      setScoreDelta(null);
      setFocusSummary(null);
      setTrendAnalysis(null);
      setCurrentAnalysisId(null);
      setShowPdfFeedback(false);
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const handleCompareTests = () => {
    if (savedAnalyses.length >= 2) {
      // Use the two most recent analyses by default
      setComparisonAnalyses([savedAnalyses[0], savedAnalyses[1]]);
      setShowComparison(true);
    }
  };

  return (
    <div className="dashboard">
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🧬</span>
            <h1>HTMA Genius</h1>
          </div>
          <p className="tagline">AI-Powered Hair Tissue Mineral Analysis</p>
        </div>

        <div className="auth-section">
          {user ? (
            <>
              <span className="user-email">{user.email}</span>
              <button
                className="btn-secondary"
                onClick={() => setShowSavedAnalyses(!showSavedAnalyses)}
              >
                {showSavedAnalyses ? "Hide" : "View"} Saved Analyses
              </button>
              {savedAnalyses.length >= 2 && (
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setShowTimeline(!showTimeline);
                    setShowSavedAnalyses(false);
                  }}
                  style={{
                    background: showTimeline ? "#3b82f6" : "",
                    color: showTimeline ? "white" : "",
                  }}
                >
                  {showTimeline ? "Hide" : "📊"} Progress Timeline
                </button>
              )}
              <button className="btn-secondary" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <button
              className="btn-primary"
              onClick={() => setShowAuthModal(true)}
            >
              Sign In / Sign Up
            </button>
          )}
        </div>
      </header>

      <main className="main">
        <div className="container">
          {/* Practitioner Mode Badge */}
          {isPractitionerMode && (
            <div className="practitioner-badge">
              <span className="badge-icon">🔬</span>
              <span className="badge-text">Practitioner Mode ON</span>
              <a
                href="/practitioner/feedback-dashboard"
                className="badge-link"
                title="View Feedback Dashboard"
              >
                📊 Dashboard
              </a>
              <a
                href="/practitioner/oxidation-validation"
                className="badge-link"
                title="Oxidation Validation & Calibration"
              >
                🧪 Validation
              </a>
              <button
                className="badge-close"
                onClick={disablePractitionerMode}
                title="Turn off Practitioner Mode"
              >
                Turn off
              </button>
            </div>
          )}

          {showSavedAnalyses && user && (
            <SavedAnalyses
              userId={user.uid}
              onLoadAnalysis={handleLoadAnalysis}
              onAnalysesLoaded={setSavedAnalyses}
            />
          )}

          {/* Timeline View */}
          {showTimeline && user && savedAnalyses.length >= 2 && (
            <div className="timeline-section">
              <div className="timeline-header-controls">
                <button
                  className="btn-close-timeline"
                  onClick={() => setShowTimeline(false)}
                >
                  ← Back to Analysis
                </button>
              </div>

              <ProgressHighlights
                analyses={savedAnalyses}
                isPractitioner={isPractitionerMode}
              />

              <AnalysisTimeline
                analyses={savedAnalyses}
                isPractitioner={isPractitionerMode}
                onAnalysisClick={handleLoadAnalysis}
                onCompareClick={(a1, a2) => {
                  setComparisonAnalyses([a1, a2]);
                  setShowComparison(true);
                  setShowTimeline(false);
                }}
              />

              {/* Mineral Evolution Charts */}
              {isPractitionerMode && savedAnalyses.length >= 2 && (
                <div className="mineral-evolution-section">
                  <h3>Mineral Evolution</h3>
                  <div className="mineral-evolution-grid">
                    {["Ca", "Mg", "Na", "K", "Fe", "Cu", "Zn", "P"].map(
                      (mineral) => {
                        const dataPoints = savedAnalyses
                          .filter((a) => a.mineralData?.[mineral] !== undefined)
                          .map((a) => ({
                            date: a.createdAt,
                            value: a.mineralData[mineral],
                          }))
                          .sort(
                            (a, b) =>
                              new Date(a.date).getTime() -
                              new Date(b.date).getTime()
                          );

                        if (dataPoints.length === 0) return null;

                        const mineralNames: Record<string, string> = {
                          Ca: "Calcium",
                          Mg: "Magnesium",
                          Na: "Sodium",
                          K: "Potassium",
                          Fe: "Iron",
                          Cu: "Copper",
                          Zn: "Zinc",
                          P: "Phosphorus",
                        };

                        return (
                          <MineralEvolutionChart
                            key={mineral}
                            mineralSymbol={mineral}
                            mineralName={mineralNames[mineral]}
                            dataPoints={dataPoints}
                            isPractitioner={true}
                          />
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comparison View */}
          {showComparison && comparisonAnalyses && (
            <div className="comparison-section">
              <div className="comparison-header">
                <h2>Test Comparison</h2>
                <button
                  className="btn-close-comparison"
                  onClick={() => setShowComparison(false)}
                >
                  Close Comparison
                </button>
              </div>
              <ComparisonView
                oldAnalysis={comparisonAnalyses[1]}
                newAnalysis={comparisonAnalyses[0]}
              />
            </div>
          )}

          {/* Chrome AI Status & Preference Toggle */}
          <ChromeAIStatus onPreferenceChange={setPreferChromeAI} />

          <HTMAInputForm onSubmit={handleAnalyze} isLoading={isAnalyzing} />

          {(mineralData || isAnalyzing) && (
            <div className="results-section">
              {/* AI Source Badge */}
              {hasAnalyzed && aiAnalysis.metadata && (
                <AISourceBadge
                  usingChromeAI={aiAnalysis.usingChromeAI}
                  model={aiAnalysis.metadata.model}
                />
              )}

              {/* HTMA Pattern Graph - Visual representation */}
              {hasAnalyzed && mineralData && (
                <HTMAPatternGraph
                  minerals={MINERAL_REFERENCE_RANGES.map((ref) => ({
                    key: ref.symbol.toLowerCase(),
                    name: ref.name,
                    value:
                      parseFloat(
                        mineralData[
                          ref.symbol.toLowerCase() as keyof MineralData
                        ] || "0"
                      ) || 0,
                    minOptimal: ref.minIdeal,
                    maxOptimal: ref.maxIdeal,
                  }))}
                />
              )}

              {hasAnalyzed && mineralData && (
                <MineralChart data={mineralData} />
              )}

              {(isAnalyzing || hasAnalyzed) && (
                <AIInsights
                  insights={aiAnalysis.insights || insights}
                  isLoading={aiAnalysis.isLoading || isAnalyzing}
                  confidenceScore={aiConfidence || undefined}
                  isPractitionerMode={isPractitionerMode}
                  annotations={practitionerAnnotations}
                />
              )}

              {/* Health Score Card */}
              {healthScore && hasAnalyzed && (
                <>
                  <div className="health-score-container">
                    <HealthScoreCard scoreData={healthScore} />
                  </div>
                  {isPractitionerMode && currentAnalysisId && (
                    <PractitionerFeedbackInline
                      context="health_score"
                      analysisId={currentAnalysisId}
                    />
                  )}
                </>
              )}

              {/* Oxidation Type Classification */}
              {oxidationClassification && hasAnalyzed && (
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
              )}

              {/* Why This Changed Panel - New deterministic delta explainer */}
              {scoreDelta && hasAnalyzed && (
                <>
                  <WhyThisChangedPanel
                    delta={scoreDelta}
                    isPractitionerMode={isPractitionerMode}
                  />
                  {isPractitionerMode && currentAnalysisId && (
                    <PractitionerFeedbackInline
                      context="score_delta"
                      analysisId={currentAnalysisId}
                    />
                  )}
                </>
              )}

              {/* Focus Summary Panel - Guardrail-safe coaching */}
              {focusSummary && hasAnalyzed && (
                <>
                  <FocusSummaryPanel
                    focusSummary={focusSummary}
                    isPractitionerMode={isPractitionerMode}
                  />
                  {isPractitionerMode && currentAnalysisId && (
                    <PractitionerFeedbackInline
                      context="focus_summary"
                      analysisId={currentAnalysisId}
                    />
                  )}
                </>
              )}

              {/* Trend Analysis Panel - Shows patterns across 3+ analyses */}
              {trendAnalysis && hasAnalyzed && (
                <TrendPanel
                  trendAnalysis={trendAnalysis}
                  isPractitionerMode={isPractitionerMode}
                />
              )}

              {/* Why This Changed - Legacy explanation (fallback) */}
              {scoreExplanation && hasAnalyzed && !scoreDelta && (
                <div className="why-changed-wrapper">
                  <WhyThisChanged explanation={scoreExplanation} />
                </div>
              )}

              {/* Practitioner Validation Panel */}
              {isPractitionerMode && mineralData && hasAnalyzed && (
                <>
                  <PractitionerPanel
                    mineralData={mineralData}
                    insights={insights}
                  />

                  {/* Practitioner Annotation Panel */}
                  {user && (
                    <PractitionerAnnotationPanel
                      annotations={practitionerAnnotations}
                      onAnnotationsChange={setPractitionerAnnotations}
                      practitionerId={user.uid}
                      practitionerName={
                        user.displayName || user.email || "Practitioner"
                      }
                    />
                  )}
                </>
              )}

              {/* PDF Report Download */}
              {mineralData && hasAnalyzed && (
                <>
                  <PDFReportButton
                    mineralData={mineralData}
                    insights={insights}
                    isPractitionerMode={isPractitionerMode}
                    healthScore={healthScore}
                    scoreDelta={scoreDelta}
                    focusSummary={focusSummary}
                    trendAnalysis={trendAnalysis}
                    oxidationClassification={oxidationClassification}
                    currentAnalysisId={currentAnalysisId}
                    practitionerAnnotations={practitionerAnnotations}
                    onPdfGenerated={() => setShowPdfFeedback(true)}
                  />
                  {isPractitionerMode &&
                    currentAnalysisId &&
                    showPdfFeedback && (
                      <PractitionerFeedbackInline
                        context="pdf_report"
                        analysisId={currentAnalysisId}
                      />
                    )}
                </>
              )}
            </div>
          )}

          {/* Trend Dashboard - Show if user has saved analyses */}
          {user && savedAnalyses.length > 0 && !showComparison && (
            <div className="trend-section">
              <div className="trend-header">
                <h2>📈 Your Health Trends</h2>
                {savedAnalyses.length >= 2 && (
                  <button className="btn-compare" onClick={handleCompareTests}>
                    Compare Tests
                  </button>
                )}
              </div>

              {savedAnalyses.length > 1 && (
                <TrendChart analyses={savedAnalyses} />
              )}

              {savedAnalyses.length === 1 && (
                <div className="single-test-message">
                  <p>
                    Complete another test to see your health trends over time!
                  </p>
                </div>
              )}
            </div>
          )}

          {!mineralData && !isAnalyzing && (
            <div className="welcome-section">
              <div className="welcome-card">
                <h2>Welcome to HTMA Genius</h2>
                <p>
                  Get AI-powered insights into your hair tissue mineral analysis
                  results. Simply enter your test values above to receive:
                </p>
                <ul>
                  <li>📊 Visual representation of your mineral levels</li>
                  <li>🤖 AI-powered health insights from Gemini</li>
                  <li>⚖️ Key mineral ratios and their significance</li>
                  <li>💡 Personalized dietary recommendations</li>
                  <li>🎯 Actionable health optimization strategies</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: linear-gradient(to bottom, #f9fafb, #ffffff);
        }

        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 3rem 2rem;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
          position: relative;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .auth-section {
          max-width: 1200px;
          margin: 1.5rem auto 0;
          display: flex;
          gap: 1rem;
          align-items: center;
          justify-content: flex-end;
        }

        .user-email {
          font-size: 0.9rem;
          opacity: 0.95;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .btn-primary,
        .btn-secondary {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .btn-primary {
          background: white;
          color: #667eea;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          backdrop-filter: blur(10px);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .logo-icon {
          font-size: 3rem;
        }

        h1 {
          margin: 0;
          font-size: 2.5rem;
          font-weight: 700;
        }

        .tagline {
          margin: 0;
          font-size: 1.1rem;
          opacity: 0.95;
          margin-left: 4.5rem;
        }

        .main {
          padding: 2rem;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .practitioner-badge {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .badge-icon {
          font-size: 1.25rem;
        }

        .badge-text {
          flex: 1;
        }

        .badge-link {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s;
          backdrop-filter: blur(10px);
        }

        .badge-link:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .badge-close {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s;
          backdrop-filter: blur(10px);
        }

        .badge-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .results-section {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        .health-score-container {
          grid-column: 1 / -1;
        }

        .why-changed-wrapper {
          grid-column: 1 / -1;
        }

        .trend-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-top: 1rem;
        }

        .trend-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .trend-header h2 {
          margin: 0;
          color: #1a1a1a;
          font-size: 1.5rem;
        }

        .btn-compare {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .btn-compare:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .single-test-message {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        .single-test-message p {
          margin: 0;
          font-size: 1rem;
        }

        .comparison-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-top: 1rem;
        }

        .comparison-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .comparison-header h2 {
          margin: 0;
          color: #1a1a1a;
          font-size: 1.5rem;
        }

        .btn-close-comparison {
          background: #e5e7eb;
          color: #1a1a1a;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .btn-close-comparison:hover {
          background: #d1d5db;
        }

        .timeline-section {
          margin-top: 1rem;
        }

        .timeline-header-controls {
          margin-bottom: 1rem;
        }

        .btn-close-timeline {
          background: #e5e7eb;
          color: #1a1a1a;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .btn-close-timeline:hover {
          background: #d1d5db;
        }

        .mineral-evolution-section {
          background: white;
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin-top: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .mineral-evolution-section h3 {
          font-size: 1.25rem;
          color: #111827;
          margin: 0 0 1.5rem 0;
        }

        .mineral-evolution-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .welcome-section {
          margin-top: 2rem;
        }

        .welcome-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .welcome-card h2 {
          margin: 0 0 1rem 0;
          color: #1a1a1a;
          font-size: 1.5rem;
        }

        .welcome-card p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .welcome-card ul {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .welcome-card li {
          color: #333;
          font-size: 0.95rem;
          padding-left: 0.5rem;
        }

        @media (min-width: 1024px) {
          .results-section {
            grid-template-columns: 1fr 1fr;
          }

          .results-section > :last-child {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 768px) {
          .header {
            padding: 2rem 1rem;
          }

          h1 {
            font-size: 2rem;
          }

          .logo-icon {
            font-size: 2.5rem;
          }

          .tagline {
            font-size: 0.95rem;
            margin-left: 3.5rem;
          }

          .main {
            padding: 1rem;
          }
        }

        @media (prefers-color-scheme: dark) {
          .dashboard {
            background: linear-gradient(to bottom, #0a0a0a, #1a1a1a);
          }

          .practitioner-badge {
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
          }

          .welcome-card,
          .trend-section,
          .comparison-section {
            background: #1a1a1a;
          }

          .welcome-card h2,
          .trend-header h2,
          .comparison-header h2 {
            color: #ffffff;
          }

          .welcome-card p {
            color: #999;
          }

          .welcome-card li {
            color: #e0e0e0;
          }

          .single-test-message {
            color: #999;
          }

          .btn-close-comparison {
            background: #2a2a2a;
            color: #ffffff;
          }

          .btn-close-comparison:hover {
            background: #3a3a3a;
          }
        }
      `}</style>

      {/* Practitioner Education Features */}
      {showOnboarding && (
        <PractitionerOnboarding
          onComplete={() => {
            setShowOnboarding(false);
            setShowTipOfTheDay(true);
          }}
          onSkip={() => {
            setShowOnboarding(false);
            setShowTipOfTheDay(true);
          }}
        />
      )}

      {showTipOfTheDay && isPractitionerMode && (
        <ECKTipOfTheDay onDismiss={() => setShowTipOfTheDay(false)} />
      )}

      {/* Annotation Feature Feedback */}
      {isPractitionerMode && user && practitionerAnnotations.length > 0 && (
        <AnnotationFeedback
          practitionerId={user.uid}
          practitionerName={user.displayName || user.email || "Practitioner"}
          currentAnnotationCount={practitionerAnnotations.length}
        />
      )}
    </div>
  );
}
