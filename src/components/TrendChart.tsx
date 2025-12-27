import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { SHORT_DISCLAIMER } from "../lib/healthScoreSemantics";

interface Analysis {
  id: string;
  createdAt: string;
  healthScore?: {
    totalScore: number;
  };
  mineralData: {
    calcium: string;
    magnesium: string;
    sodium: string;
    potassium: string;
    [key: string]: string;
  };
}

interface TrendChartProps {
  analyses: Analysis[];
  selectedMineral?: string;
}

export default function TrendChart({
  analyses,
  selectedMineral,
}: TrendChartProps) {
  if (analyses.length === 0) {
    return (
      <div className="trend-chart-empty">
        <p>📊 No historical data yet. Complete more analyses to see trends!</p>
        <style jsx>{`
          .trend-chart-empty {
            background: #f9fafb;
            border: 2px dashed #d1d5db;
            border-radius: 12px;
            padding: 3rem 2rem;
            text-align: center;
          }

          .trend-chart-empty p {
            margin: 0;
            color: #6b7280;
            font-size: 1.1rem;
          }

          @media (prefers-color-scheme: dark) {
            .trend-chart-empty {
              background: #1f2937;
              border-color: #374151;
            }

            .trend-chart-empty p {
              color: #9ca3af;
            }
          }
        `}</style>
      </div>
    );
  }

  // Sort analyses by date (oldest first for trend)
  const sortedAnalyses = [...analyses].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Prepare data for chart
  const chartData = sortedAnalyses.map((analysis) => {
    const date = new Date(analysis.createdAt);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const dataPoint: any = {
      date: formattedDate,
      fullDate: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      score: analysis.healthScore?.totalScore || 0,
    };

    // Add selected mineral if specified
    if (selectedMineral && analysis.mineralData[selectedMineral]) {
      dataPoint[selectedMineral] =
        parseFloat(analysis.mineralData[selectedMineral]) || 0;
    }

    return dataPoint;
  });

  return (
    <div className="trend-chart-container">
      <div className="chart-header">
        <h4>
          📈{" "}
          {selectedMineral ? `${selectedMineral} Trend` : "Health Score Trend"}
        </h4>
        <p className="chart-subtitle">
          {analyses.length} {analyses.length === 1 ? "test" : "tests"} recorded
        </p>
        {!selectedMineral && (
          <p className="chart-disclaimer">{SHORT_DISCLAIMER}</p>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            style={{ fontSize: "0.875rem" }}
          />
          <YAxis stroke="#6b7280" style={{ fontSize: "0.875rem" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
            labelFormatter={(value) => {
              const dataPoint = chartData.find((d) => d.date === value);
              return dataPoint?.fullDate || value;
            }}
          />
          <Legend wrapperStyle={{ fontSize: "0.875rem" }} />

          {!selectedMineral && (
            <Line
              type="monotone"
              dataKey="score"
              name="Health Score"
              stroke="#667eea"
              strokeWidth={3}
              dot={{ fill: "#667eea", r: 5 }}
              activeDot={{ r: 7 }}
            />
          )}

          {selectedMineral && (
            <Line
              type="monotone"
              dataKey={selectedMineral}
              name={selectedMineral}
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", r: 5 }}
              activeDot={{ r: 7 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      <style jsx>{`
        .trend-chart-container {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .chart-header {
          margin-bottom: 1.5rem;
        }

        .chart-header h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }

        .chart-subtitle {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .chart-disclaimer {
          margin: 0.5rem 0 0 0;
          font-size: 0.75rem;
          color: #6b7280;
          font-style: italic;
          line-height: 1.4;
        }

        @media (prefers-color-scheme: dark) {
          .trend-chart-container {
            background: #1f2937;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          }

          .chart-header h4 {
            color: #f9fafb;
          }

          .chart-subtitle {
            color: #9ca3af;
          }

          .chart-disclaimer {
            color: #9ca3af;
          }
        }
      `}</style>
    </div>
  );
}
