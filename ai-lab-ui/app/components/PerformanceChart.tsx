"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/utils/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface OverallSummaryData {
  current_rank: number;
  confidence: number;
  communication: number;
  interview: number;
  [key: string]: number;
}

const embeddedCSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

.performance-card {
  font-family: 'Poppins', sans-serif;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  margin-bottom: 15px;
  width: 171px;
  height: 52px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
}

.score-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font-weight: 600;
  font-size: 13px;
  color: #1A202C;
  background: white;
  border: 3px solid;
  overflow: hidden;
}

.summary-label {
  font-weight: 600;
  font-size: 12px;
  color: #1A202C;
}

.custom-hover-tooltip {
  background: white;
  border: 1px solid #cfe8f9;
  border-radius: 8px;
  padding: 6px 10px;
  box-shadow: 0px 4px 10px rgba(0,0,0,0.08);
  text-align: center;
  font-family: 'Poppins', sans-serif;
  animation: fadeIn 0.15s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.view-report-link {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 12px;
  color: #09407F;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.view-report-link:hover {
  opacity: 0.8;
}

.attempt-details {
  font-family: 'Poppins', sans-serif;
  background: #f9fbfd;
  border: 1px solid #cfe8f9;
  border-radius: 12px;
  padding: 10px 16px;
  margin-top: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  color: #09407F;
}
`;

const CustomHoverTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length > 0) {
    const p = payload[0];
    const dataKey = p.dataKey;
    const idx = dataKey.slice(-1);
    const round = p.payload.name;
    const date = p.payload[`date${idx}`];
    const score = p.payload[`score${idx}`];

    return (
      <div className="custom-hover-tooltip">
        <div style={{ fontSize: "12px", color: "#0B4B7A", fontWeight: 500 }}>
          {date}
        </div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#1A202C" }}>
          {score}% ({round})
        </div>
      </div>
    );
  }
  return null;
};

const SummaryCard = ({
  score,
  label,
  border,
}: {
  score: number;
  label: string;
  border: string;
}) => (
  <div
    className="performance-card"
    style={{ background: `linear-gradient(to right, #F8F8F8, #BAF2FF)` }}
  >
    <div className="score-circle" style={{ borderColor: border }}>
      {Math.round(score)}
    </div>
    <span className="summary-label">{label}</span>
  </div>
);

export default function PerformanceChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<OverallSummaryData | null>(
    null
  );
  const [selectedAttempt, setSelectedAttempt] = useState<any | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchAndFormatResults = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: results } = await supabase
        .from("interview_results")
        .select("final_score, radar_scores, created_at, session_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!results || results.length === 0) return;

      // ✅ Group into 3 rounds, each with 3 attempts
      const rounds = ["Round 1", "Round 2", "Round 3"];
      const groupedRounds = rounds.map((round, i) => {
        const attempts = results.slice(i * 3, i * 3 + 3);
        return {
          name: round,
          score1: attempts[0]?.final_score ?? 0,
          date1: attempts[0]
            ? new Date(attempts[0].created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "",
          score2: attempts[1]?.final_score ?? 0,
          date2: attempts[1]
            ? new Date(attempts[1].created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "",
          score3: attempts[2]?.final_score ?? 0,
          date3: attempts[2]
            ? new Date(attempts[2].created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "",
        };
      });

      setChartData(groupedRounds);

      // ✅ Summary from latest interview
      const latest = results[0];
      let radar: any[] = [];
      try {
        radar =
          typeof latest.radar_scores === "string"
            ? JSON.parse(latest.radar_scores)
            : latest.radar_scores || [];
      } catch {
        radar = [];
      }

      const getMetric = (name: string) =>
        radar.find((r: any) => r.subject?.toLowerCase() === name.toLowerCase())
          ?.A || 0;

      setSummaryData({
        current_rank: 1,
        confidence: getMetric("confidence"),
        communication: getMetric("communication"),
        interview: latest.final_score ?? 0,
      });
    };

    fetchAndFormatResults();
  }, []);

  // ✅ Handle click on bar
  const handleBarClick = (data: any, dataKey: string) => {
    const idx = dataKey.slice(-1);
    const score = data[`score${idx}`];
    const date = data[`date${idx}`];
    const round = data.name;

    if (score && date) {
      setSelectedAttempt({ round, score, date });
    }
  };

  const summaryCardMapping = [
    { key: "current_rank", label: "Current Rank", border: "#3CB371" },
    { key: "confidence", label: "Confidence", border: "#808080" },
    { key: "communication", label: "Communication", border: "#DC143C" },
    { key: "interview", label: "Interview", border: "#4682B4" },
  ];

  return (
    <div className="w-full">
      <style dangerouslySetInnerHTML={{ __html: embeddedCSS }} />
      <div
        className="flex bg-white p-8 rounded-2xl shadow-xl space-x-8"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        {/* Left Chart Section */}
        <div className="flex-grow max-w-[70%]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-[#09407F]">
              Performance Over Time
            </h3>
            <span className="view-report-link">View Full Report</span>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              barCategoryGap="30%"
              barGap={4}
              margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
            >
              <CartesianGrid stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={{ stroke: "#999" }}
                height={50}
                tick={{ fill: "#1A202C", fontSize: 13, fontWeight: 600 }}
                label={{
                  value: "Interview Rounds",
                  position: "bottom",
                  dy: 25,
                  style: {
                    fill: "#1A202C",
                    fontWeight: 600,
                    fontSize: 14,
                    fontFamily: "Poppins, sans-serif",
                  },
                }}
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(tick) => `${tick}%`}
                tickLine={false}
                axisLine={{ stroke: "#999" }}
                width={45}
                tick={{ fill: "#1A202C", fontSize: 12 }}
                label={{
                  value: "Score",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    textAnchor: "middle",
                    fill: "#1A202C",
                    fontWeight: 600,
                    fontSize: 14,
                  },
                }}
              />
              <Tooltip
                content={<CustomHoverTooltip />}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <defs>
                <linearGradient id="uniformBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2DC6DB" stopOpacity={1} />
                  <stop offset="95%" stopColor="#2B81CF" stopOpacity={1} />
                </linearGradient>
              </defs>
              <Bar
                dataKey="score1"
                fill="url(#uniformBarGradient)"
                barSize={32}
                radius={[4, 4, 0, 0]}
                onClick={(data) => handleBarClick(data, "score1")}
              />
              <Bar
                dataKey="score2"
                fill="url(#uniformBarGradient)"
                barSize={32}
                radius={[4, 4, 0, 0]}
                onClick={(data) => handleBarClick(data, "score2")}
              />
              <Bar
                dataKey="score3"
                fill="url(#uniformBarGradient)"
                barSize={32}
                radius={[4, 4, 0, 0]}
                onClick={(data) => handleBarClick(data, "score3")}
              />
            </BarChart>
          </ResponsiveContainer>

          {/* ✅ Clicked attempt details */}
          {selectedAttempt && (
            <div className="attempt-details">
              <p>
                <strong>Round:</strong> {selectedAttempt.round}
              </p>
              <p>
                <strong>Date:</strong> {selectedAttempt.date}
              </p>
              <p>
                <strong>Score:</strong> {selectedAttempt.score}%
              </p>
            </div>
          )}
        </div>

        {/* Right Summary Section */}
        <div className="w-[30%] pt-14 flex flex-col items-center">
          <h3 className="text-2xl font-bold text-[#09407F] mb-4 w-full">
            Over all Summary
          </h3>
          {summaryData ? (
            summaryCardMapping.map(({ key, label, border }) => (
              <SummaryCard
                key={key}
                score={summaryData[key as keyof OverallSummaryData]}
                label={label}
                border={border}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500">Loading summary...</p>
          )}
        </div>
      </div>
    </div>
  );
}
