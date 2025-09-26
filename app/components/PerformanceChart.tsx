"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Round 1", score1: 38, score2: 45 },
  { name: "Round 2", score1: 40, score2: 48 },
  { name: "Round 3", score1: 42, score2: 50 },
  { name: "Round 4", score1: 41, score2: 47 },
];

const summary = [
  { label: "Current Rank", value: 55, color: "#22C55E" },
  { label: "Top Score", value: 44, color: "#A855F7" },
  { label: "Attempts", value: 35, color: "#E11D48" },
  { label: "Consistency", value: 26, color: "#0EA5E9" },
];

export default function PerformanceSection() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow grid grid-cols-3 gap-6">
      {/* Chart Section */}
      <div className="col-span-2">
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-bold text-[#103E50]">
            Performance Over Time
          </h3>
          <a href="#" className="text-blue-600 text-sm font-medium">
            View Full Report
          </a>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barSize={30}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `${val}%`}
            />
            <Bar
              dataKey="score1"
              radius={[6, 6, 0, 0]}
              fill="url(#gradient1)"
            />
            <Bar
              dataKey="score2"
              radius={[6, 6, 0, 0]}
              fill="url(#gradient2)"
            />
            <defs>
              <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2DC7DB" stopOpacity={1} />
                <stop offset="95%" stopColor="#2B7ECF" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="gradient2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60A5FA" stopOpacity={1} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={1} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Section */}
      <div>
        <h3 className="text-lg font-bold mb-4 text-[#103E50]">Summary</h3>
        <div className="space-y-4">
          {summary.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-xl shadow-sm"
            >
              {/* Circular Progress */}
              <div className="relative w-10 h-10">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    stroke="#E5E7EB"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    stroke={item.color}
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 18}
                    strokeDashoffset={
                      2 * Math.PI * 18 * (1 - item.value / 100)
                    }
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                  {item.value}
                </span>
              </div>
              <p className="font-medium text-gray-700">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
