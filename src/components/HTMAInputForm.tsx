import { useState } from "react";

/**
 * Complete TEI (Trace Elements Inc.) Nutritional Elements
 * All 15 minerals tested in standard HTMA panels
 *
 * Major Minerals: Ca, Mg, Na, K, P, S
 * Trace Minerals: Cu, Zn, Fe, Mn, Cr, Se, B, Co, Mo
 */
export interface MineralData {
  calcium: string;
  magnesium: string;
  sodium: string;
  potassium: string;
  copper: string;
  zinc: string;
  phosphorus: string;
  iron: string;
  manganese: string;
  chromium: string;
  selenium: string;
  boron: string;
  cobalt: string;
  molybdenum: string;
  sulfur: string;
}

interface HTMAInputFormProps {
  onSubmit: (data: MineralData) => void;
  isLoading?: boolean;
}

export default function HTMAInputForm({
  onSubmit,
  isLoading = false,
}: HTMAInputFormProps) {
  const [formData, setFormData] = useState<MineralData>({
    calcium: "",
    magnesium: "",
    sodium: "",
    potassium: "",
    copper: "",
    zinc: "",
    phosphorus: "",
    iron: "",
    manganese: "",
    chromium: "",
    selenium: "",
    boron: "",
    cobalt: "",
    molybdenum: "",
    sulfur: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required minerals
    if (!canAnalyze) {
      return; // Button should be disabled, but extra safety
    }

    onSubmit(formData);
  };

  const minerals = [
    { name: "calcium", label: "Calcium (Ca)", unit: "mg%", required: true },
    { name: "magnesium", label: "Magnesium (Mg)", unit: "mg%", required: true },
    { name: "sodium", label: "Sodium (Na)", unit: "mg%", required: true },
    { name: "potassium", label: "Potassium (K)", unit: "mg%", required: true },
    { name: "copper", label: "Copper (Cu)", unit: "mg%", required: false },
    { name: "zinc", label: "Zinc (Zn)", unit: "mg%", required: false },
    {
      name: "phosphorus",
      label: "Phosphorus (P)",
      unit: "mg%",
      required: false,
    },
    { name: "iron", label: "Iron (Fe)", unit: "mg%", required: false },
    {
      name: "manganese",
      label: "Manganese (Mn)",
      unit: "mg%",
      required: false,
    },
    { name: "chromium", label: "Chromium (Cr)", unit: "mg%", required: false },
    { name: "selenium", label: "Selenium (Se)", unit: "mg%", required: false },
    { name: "boron", label: "Boron (B)", unit: "mg%", required: false },
    { name: "cobalt", label: "Cobalt (Co)", unit: "mg%", required: false },
    {
      name: "molybdenum",
      label: "Molybdenum (Mo)",
      unit: "mg%",
      required: false,
    },
    { name: "sulfur", label: "Sulfur (S)", unit: "mg%", required: false },
  ];

  // Required minerals for oxidation classification
  const requiredMinerals = ["calcium", "magnesium", "sodium", "potassium"];

  // Check if required minerals have valid positive values
  const canAnalyze = requiredMinerals.every((mineralName) => {
    const value = formData[mineralName as keyof MineralData];
    const numValue = parseFloat(value);
    return !isNaN(numValue) && numValue > 0;
  });

  // Get missing required minerals for error message
  const missingMinerals = requiredMinerals.filter((mineralName) => {
    const value = formData[mineralName as keyof MineralData];
    const numValue = parseFloat(value);
    return isNaN(numValue) || numValue <= 0;
  });

  return (
    <form onSubmit={handleSubmit} className="htma-form">
      <h2>Enter HTMA Test Results</h2>
      <p className="form-description">
        Enter your hair tissue mineral analysis results below. Values are
        typically in mg% (milligrams percent).
        <br />
        <strong>Required:</strong> Calcium, Magnesium, Sodium, Potassium
      </p>

      {!canAnalyze && missingMinerals.length > 0 && (
        <div className="validation-error">
          ⚠️ Required minerals missing:{" "}
          {missingMinerals
            .map((m) => m.charAt(0).toUpperCase() + m.slice(1))
            .join(", ")}
        </div>
      )}

      <div className="mineral-grid">
        {minerals.map((mineral) => (
          <div key={mineral.name} className="form-group">
            <label htmlFor={mineral.name}>
              {mineral.label}
              {mineral.required && (
                <span className="required-indicator"> *</span>
              )}
              <span className="unit">{mineral.unit}</span>
            </label>
            <input
              type="number"
              id={mineral.name}
              name={mineral.name}
              value={formData[mineral.name as keyof MineralData]}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0.001"
              required={mineral.required}
              disabled={isLoading}
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="submit-btn"
        disabled={isLoading || !canAnalyze}
        title={
          !canAnalyze
            ? "Please fill in all required minerals (Ca, Mg, Na, K)"
            : ""
        }
      >
        {isLoading ? "Analyzing..." : "Analyze Results"}
      </button>

      <style jsx>{`
        .htma-form {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        h2 {
          margin: 0 0 0.5rem 0;
          color: #1a1a1a;
          font-size: 1.5rem;
        }

        .form-description {
          color: #666;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .form-description strong {
          color: #d32f2f;
        }

        .validation-error {
          background: #ffebee;
          border: 1px solid #ef5350;
          color: #c62828;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .mineral-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        label {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #333;
          font-size: 0.9rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .required-indicator {
          color: #d32f2f;
          font-weight: bold;
          margin-left: 0.25rem;
        }

        .unit {
          font-weight: 400;
          color: #999;
          font-size: 0.8rem;
        }

        input {
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        input:focus {
          outline: none;
          border-color: #4f46e5;
        }

        input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (prefers-color-scheme: dark) {
          .htma-form {
            background: #1a1a1a;
          }

          h2 {
            color: #ffffff;
          }

          .form-description {
            color: #999;
          }

          label {
            color: #e0e0e0;
          }

          input {
            background: #2a2a2a;
            border-color: #404040;
            color: #ffffff;
          }

          input:disabled {
            background-color: #1a1a1a;
          }
        }
      `}</style>
    </form>
  );
}
