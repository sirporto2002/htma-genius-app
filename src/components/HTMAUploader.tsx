import { useState } from "react";

interface HTMAUploaderProps {
  onExtractedData: (minerals: Record<string, number>) => void;
}

/**
 * HTMAUploader Component
 *
 * Allows users to upload ARL or TEI HTMA PDF reports
 * Extracts mineral values automatically and feeds them into the analysis engine
 */
export default function HTMAUploader({ onExtractedData }: HTMAUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      setError("Only PDF files from ARL or TEI are supported.");
      setSuccess(false);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB.");
      setSuccess(false);
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Convert PDF to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          // Remove the data:application/pdf;base64, prefix
          const base64Data = base64.split(",")[1];
          console.log("📤 Base64 length:", base64Data.length);
          console.log("📤 First 50 chars:", base64Data.substring(0, 50));
          resolve(base64Data);
        };
        reader.onerror = reject;
      });

      reader.readAsDataURL(file);
      const pdfBase64 = await base64Promise;

      console.log("📤 Sending to API...");

      const res = await fetch("/api/parse-htma", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file: pdfBase64 }),
      });

      const data = await res.json();
      console.log("📥 API response:", data);

      if (data.minerals || data.calcium || !data.error) {
        setSuccess(true);
        setError(null);
        onExtractedData(data.minerals || data);

        // Show success message
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || "Failed to extract data from PDF.");
        setSuccess(false);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Upload error. Please try again.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFileName("");
    setError(null);
    setSuccess(false);
    setLoading(false);
  };

  return (
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 md:p-5 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
      <div className="space-y-3">
        {/* Header */}
        <div>
          <label className="block text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
            📄 Upload HTMA Lab Report (PDF)
          </label>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Supported labs: ARL (Analytical Research Labs) or TEI (Trace
            Elements Inc.)
          </p>
        </div>

        {/* File Input */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="pdf-upload"
            className="cursor-pointer inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
          >
            📄 Choose PDF File
          </label>

          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="hidden"
            disabled={loading}
          />

          {fileName && !loading && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">
                {fileName}
              </span>
              <button
                onClick={handleReset}
                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                title="Clear file"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <div>
              <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                ⏳ Processing PDF...
              </p>
              <p className="text-[10px] text-blue-700 dark:text-blue-300 mt-0.5">
                Extracting mineral values from your report
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {success && !loading && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <svg
              className="w-4 h-4 text-green-600 dark:text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-xs font-medium text-green-900 dark:text-green-100">
                ✅ Data extracted successfully!
              </p>
              <p className="text-[10px] text-green-700 dark:text-green-300 mt-0.5">
                Mineral values have been loaded into the analysis
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            {/* Hidden icon to save space */}
            <div className="hidden">
              <svg
                className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-red-900 dark:text-red-100">
                ❌ {error}
              </p>
              <p className="text-[10px] text-red-700 dark:text-red-300 mt-0.5">
                Please ensure you're uploading a valid ARL or TEI HTMA report in
                PDF format.
              </p>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!loading && !success && !error && (
          <div className="text-[10px] text-gray-500 dark:text-gray-400 space-y-1">
            <p>📋 Supported formats:</p>
            <ul className="list-disc list-inside ml-2 space-y-0.5">
              <li>ARL (Analytical Research Labs) - Standard HTMA Report</li>
              <li>TEI (Trace Elements Inc.) - Hair Analysis Report</li>
            </ul>
            <p className="mt-1">Maximum file size: 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
}
