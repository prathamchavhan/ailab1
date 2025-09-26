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
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: results } = await supabase
        .from("interview_results")
        .select("final_score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(5);

      if (results) {
        setData(
          results.map((r, idx) => ({
            name: `Interview ${idx + 1}`,
            score: r.final_score,
          }))
        );
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-bold">Performance Over Time</h3>
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
    </div>
  );
}
