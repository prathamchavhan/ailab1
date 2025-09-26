"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Bell } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [averageScore, setAverageScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      // Fetch logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUser({ name: "Guest", avatar_url: null });
        return;
      }

      // Fetch profile
      const { data: profile } = await supabase
        .from("users")
        .select("name, avatar_url")
        .eq("id", user.id)
        .single();

      setUser(profile || { name: "Guest", avatar_url: null });

      // Fetch interview scores
      const { data: results } = await supabase
        .from("interview_results")
        .select("final_score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (results && results.length > 0) {
        setLatestScore(results[0].final_score);
        const avg =
          results.reduce((acc, r) => acc + (r.final_score || 0), 0) /
          results.length;
        setAverageScore(Math.round(avg));
      } else {
        setLatestScore(null);
        setAverageScore(null);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="px-6 pt-4">
      <div className="flex justify-between items-center bg-[#103E50] text-white px-6 py-3 rounded-xl shadow">
        {/* Left - Avatar + Name */}
        <div className="flex items-center gap-3">
          {user?.avatar_url ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#2DC7DB]">
              <img
                src={user.avatar_url}
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}
          <p className="text-lg font-medium">
            Hi {user?.name || "Guest"}! 👋
          </p>
        </div>

        {/* Right - Bell + Scores */}
        <div className="flex items-center gap-6">
          <Bell className="w-6 h-6 cursor-pointer" />

          {/* Interview Score */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#2DC7DB] text-sm font-bold">
              {latestScore !== null ? latestScore : "--"}
            </div>
            <span className="text-xs mt-1">Interview Score</span>
          </div>

          {/* Average Score */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#2B7ECF] text-sm font-bold">
              {averageScore !== null ? averageScore : "--"}
            </div>
            <span className="text-xs mt-1">Score</span>
          </div>
        </div>
      </div>
    </div>
  );
}
