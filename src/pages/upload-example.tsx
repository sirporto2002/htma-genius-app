/**
 * Example: How to integrate HTMAUploader into your existing pages
 *
 * This shows how to use the PDF uploader with your existing analysis logic
 */

import { useState } from "react";
import HTMAUploader from "../components/HTMAUploader";

// Import your existing functions (adjust paths as needed)
// import { calculateHTMARatios } from "../lib/ratioEngine";
// import { interpretHTMA } from "../lib/htmaRuleEngine";

export default function ExampleHTMAUpload() {
  const [minerals, setMinerals] = useState<Record<string, number> | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleExtractedData = (extractedMinerals: Record<string, number>) => {
    console.log("📊 Extracted minerals:", extractedMinerals);

    setMinerals(extractedMinerals);

    // Example: Feed into your existing analysis engine
    // Uncomment and adjust based on your actual function signatures

    /*
    const { ratios } = calculateHTMARatios(extractedMinerals);
    const matched = interpretHTMA(ratios, extractedMinerals);
    
    setAnalysis({
      minerals: extractedMinerals,
      ratios,
      patterns: matched,
    });
    */

    // For now, just show the extracted data
    setAnalysis({
      minerals: extractedMinerals,
      count: Object.keys(extractedMinerals).length,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            HTMA PDF Upload Example
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload your ARL or TEI lab report to automatically extract mineral
            values
          </p>
        </div>

        {/* PDF Uploader Component */}
        <HTMAUploader onExtractedData={handleExtractedData} />

        {/* Display Extracted Minerals */}
        {minerals && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              ✅ Extracted Mineral Values ({Object.keys(minerals).length})
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(minerals).map(([mineral, value]) => (
                <div
                  key={mineral}
                  className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md"
                >
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">
                    {mineral}
                  </div>
                  <div className="text-base font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {value.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis Results (if you hook up your engine) */}
        {analysis && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
              🧠 Ready for Analysis
            </h3>
            <p className="text-blue-700 dark:text-blue-300">
              The extracted data is ready to be processed by your existing
              logic:
            </p>
            <ul className="list-disc list-inside mt-2 text-blue-700 dark:text-blue-300 space-y-1">
              <li>Ratio calculations (Ca/Mg, Na/K, etc.)</li>
              <li>Pattern detection via JSON rules engine</li>
              <li>GPT-powered personalized explanations</li>
              <li>Progress tracking across multiple tests</li>
            </ul>
          </div>
        )}

        {/* Instructions */}
        {!minerals && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              📖 How It Works
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                Upload your ARL or TEI HTMA PDF report using the uploader above
              </li>
              <li>The app extracts all mineral values automatically</li>
              <li>Values are validated and displayed below</li>
              <li>
                You can then feed this data into your existing analysis pipeline
              </li>
            </ol>

            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>💡 Tip:</strong> To integrate with your existing pages,
                copy the
                <code className="mx-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-800 rounded">
                  HTMAUploader
                </code>
                component and pass
                <code className="mx-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-800 rounded">
                  onExtractedData
                </code>
                callback to your analysis functions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
