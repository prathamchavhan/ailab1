"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Your original, well-styled CSS is preserved
const embeddedCSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
.custom-hover-tooltip { background: white; border: 1px solid #cfe8f9; border-radius: 8px; padding: 6px 10px; box-shadow: 0px 4px 10px rgba(0,0,0,0.08); text-align: center; font-family: 'Poppins', sans-serif; animation: fadeIn 0.15s ease-in-out; position: relative; }
.custom-hover-tooltip::after { content: ""; position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid white; filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.05)); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
`;

// Tooltip for Aptitude Data (still shows full date on hover)
const CustomHoverTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-hover-tooltip">
        <div style={{ fontSize: "12px", color: "#0B4B7A", fontWeight: 500 }}>
          {data.fullDate}
        </div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#1A202C" }}>
          {data.score}/30 ({data.level})
        </div>
      </div>
    );
  }
  return null;
};


export default function AptitudePerformanceChart() {
  const [chartData, setChartData] = useState([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchAptitudeResults = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: results, error } = await supabase
        .from("aptitude")
        .select("score, level, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error || !results || results.length === 0) {
        console.error("Error fetching aptitude data:", error);
        return;
      }
      
      // Format data for the chart, using "Attempt #" for the X-axis label
      const formattedChartData = results.map((r, index) => ({
          score: r.score,
          level: r.level,
          name: `Attempt ${index + 1}`, // Changed from date to attempt number
          fullDate: new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      }));
      setChartData(formattedChartData);
    };

    fetchAptitudeResults();
  }, []);

  return (
    <div className="w-full">
      <style dangerouslySetInnerHTML={{ __html: embeddedCSS }} />
      <div
        className="bg-transparent p-3 sm:p-3 "
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <p className="text-xl font-semibold text-[#09407F] mb-6">
          Aptitude Performance
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={{ stroke: "#999" }}
              tick={{ fill: "#1A202C", fontSize: 13 }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 30]}
              tickLine={false}
              axisLine={{ stroke: "#999" }}
              width={45}
              tick={{ fill: "#1A202C", fontSize: 12 }}
            />
            <Tooltip
              content={<CustomHoverTooltip />}
              cursor={{ fill: "rgba(186, 242, 255, 0.4)" }}
            />
            <defs>
              <linearGradient id="aptitudeBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2DC6DB" stopOpacity={1} />
                <stop offset="95%" stopColor="#2B81CF" stopOpacity={1} />
              </linearGradient>
            </defs>
            <Bar dataKey="score" fill="url(#aptitudeBarGradient)" barSize={35} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}