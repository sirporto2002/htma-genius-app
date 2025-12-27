import { useState, useCallback, useEffect } from "react";
import { chromeAI, ChromeAIAnalysisResult } from "../lib/chromeAI";
import { MineralData } from "../components/HTMAInputForm";

interface UseAIAnalysisOptions {
  preferChromeAI?: boolean;
  streamingEnabled?: boolean;
  autoDetect?: boolean;
}

interface AIAnalysisState {
  isLoading: boolean;
  insights: string;
  error: string | null;
  usingChromeAI: boolean;
  chromeAIAvailable: boolean;
  metadata?: {
    source: string;
    model: string;
    timestamp: string;
  };
}

export function useAIAnalysis(options: UseAIAnalysisOptions = {}) {
  const {
    preferChromeAI = true,
    streamingEnabled = false,
    autoDetect = true,
  } = options;

  const [state, setState] = useState<AIAnalysisState>({
    isLoading: false,
    insights: "",
    error: null,
    usingChromeAI: false,
    chromeAIAvailable: false,
  });

  // Check Chrome AI availability on mount
  useEffect(() => {
    if (autoDetect) {
      chromeAI.isAvailable().then((available) => {
        setState((prev) => ({ ...prev, chromeAIAvailable: available }));
      });
    }
  }, [autoDetect]);

  const analyze = useCallback(
    async (mineralData: MineralData, userId?: string) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        insights: "",
      }));

      try {
        // Try Chrome AI first if preferred and available
        if (preferChromeAI && state.chromeAIAvailable) {
          console.log("🔒 Using Chrome AI for private, on-device analysis");

          if (streamingEnabled) {
            // Stream insights in real-time
            let fullInsights = "";
            for await (const chunk of chromeAI.analyzeHTMAStreaming(
              mineralData
            )) {
              fullInsights += chunk;
              setState((prev) => ({
                ...prev,
                insights: fullInsights,
                usingChromeAI: true,
              }));
            }
          } else {
            const result: ChromeAIAnalysisResult = await chromeAI.analyzeHTMA(
              mineralData
            );
            setState((prev) => ({
              ...prev,
              insights: result.insights,
              usingChromeAI: true,
              metadata: {
                source: result.source,
                model: result.metadata.model,
                timestamp: result.timestamp,
              },
            }));
          }

          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        // Fallback to Cloud Gemini
        console.log("☁️ Using Cloud Gemini for analysis");
        setState((prev) => ({ ...prev, usingChromeAI: false }));

        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mineralData, userId }),
        });

        if (!response.ok) {
          throw new Error(`Analysis failed: ${response.statusText}`);
        }

        const data = await response.json();
        setState((prev) => ({
          ...prev,
          insights: data.insights,
          isLoading: false,
          metadata: {
            source: "gemini-cloud",
            model: data.metadata?.aiModel || "Gemini 1.5 Pro",
            timestamp: data.timestamp,
          },
        }));
      } catch (err) {
        console.error("AI Analysis error:", err);
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Analysis failed",
          isLoading: false,
        }));
      }
    },
    [preferChromeAI, state.chromeAIAvailable, streamingEnabled]
  );

  return {
    analyze,
    ...state,
  };
}
