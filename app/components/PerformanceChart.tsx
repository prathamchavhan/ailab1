"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";

export default function PerformanceChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // ✅ Fetch all results for logged-in user
      const { data: results, error } = await supabase
        .from("interview_results")
        .select("id, final_score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (!error && results) {
        // Transform data for chart
        const formatted = results.map((r, idx) => ({
          name: `Interview ${idx + 1}`,
          score: r.final_score,
        }));
        setData(formatted);
      }
    };

    fetchResults();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-bold">Performance Over Time</h3>
        <a href="#" className="text-blue-600 text-sm font-medium">
          View Full Report
        </a>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="score" fill="url(#gradientMain)">
            <LabelList dataKey="score" position="top" />
          </Bar>
          <defs>
            <linearGradient id="gradientMain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2DC7DB" stopOpacity={1} />
              <stop offset="95%" stopColor="#2B7ECF" stopOpacity={1} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>

      {data.length === 0 && (
        <p className="text-center text-gray-500 mt-4">
          No interviews attempted yet.
        </p>
      )}
    </div>
  );
}
