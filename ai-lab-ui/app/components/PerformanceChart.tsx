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
  overall: number;
  speech: number;
  content: number;
  body_language: number;
  behavioral: number;
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
  font-size: 15px;
  color: #1A202C;
  background: white;
  border: 3px solid;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  position: relative;
}
.custom-hover-tooltip::after {
  content: "";
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid white;
  filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.05));
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Figma-accurate View Report link */
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
`;

const MOCK_CHART_DATA = [
  { name: 'Round 1', score1: 58, date1: '3 Oct 2025', score2: 66, date2: '4 Oct 2025', score3: 75, date3: '5 Oct 2025' },
  { name: 'Round 2', score1: 52, date1: '6 Oct 2025', score2: 68, date2: '7 Oct 2025', score3: 72, date3: '8 Oct 2025' },
  { name: 'Round 3', score1: 55, date1: '9 Oct 2025', score2: 70, date2: '10 Oct 2025', score3: 78, date3: '11 Oct 2025' },
];

const CustomHoverTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length > 0) {
    const p = payload[0];
    const idx = p.dataKey.slice(-1);
    const date = p.payload[`date${idx}`];
    const score = p.payload[`score${idx}`];
    return (
      <div className="custom-hover-tooltip">
        <div style={{ fontSize: "12px", color: "#0B4B7A", fontWeight: 500 }}>{date}</div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#1A202C" }}>{score}%</div>
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
      {score}
    </div>
    <span className="summary-label">{label}</span>
  </div>
);

export default function PerformanceChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<OverallSummaryData | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchAndFormatResults = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setChartData(MOCK_CHART_DATA);
        setSummaryData({ overall: 55, speech: 44, content: 35, body_language: 26, behavioral: 55 });
        return;
      }

      const { data: results } = await supabase
        .from("interview_results")
        .select("id, final_score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (results) {
        const rounds: any[] = [];
        for (let i = 0; i < results.length; i += 3) {
          const group = results.slice(i, i + 3);
          const roundData: any = { name: `Round ${rounds.length + 1}` };
          group.forEach((r, idx) => {
            roundData[`score${idx + 1}`] = r.final_score ?? 0;
            roundData[`date${idx + 1}`] = new Date(r.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
          });
          rounds.push(roundData);
        }
        setChartData(rounds);
      }

      setSummaryData({
        overall: 55,
        speech: 44,
        content: 35,
        body_language: 26,
        behavioral: 55,
      });
    };
    fetchAndFormatResults();
  }, []);

  const summaryCardMapping = [
    { key: "overall", label: "Current Rank", border: "#3CB371" },
    { key: "speech", label: "Confidence", border: "#808080" },
    { key: "content", label: "Communication", border: "#DC143C" },
    { key: "body_language", label: "Interview", border: "#4682B4" },
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
            <BarChart data={chartData} barCategoryGap="28%" barGap={6}>
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
                padding={{ left: 20, right: 20 }}
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
              <Bar dataKey="score1" fill="url(#uniformBarGradient)" barSize={20} radius={[4, 4, 0, 0]} />
              <Bar dataKey="score2" fill="url(#uniformBarGradient)" barSize={20} radius={[4, 4, 0, 0]} />
              <Bar dataKey="score3" fill="url(#uniformBarGradient)" barSize={20} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
