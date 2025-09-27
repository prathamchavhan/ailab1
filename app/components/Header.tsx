"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Bell } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [latestResult, setLatestResult] = useState<any>(null);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("Guest");

  useEffect(() => {
    const fetchUserAndScores = async () => {
      // ✅ Get logged-in user
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        console.log("No logged-in user found:", error);
        return;
      }

      const currentUser = data.user;
      setUser(currentUser);

      // ✅ Get profile name if exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", currentUser.id)
        .single();

      if (profile?.name) {
        setUserName(profile.name);
      } else if (currentUser.user_metadata?.full_name) {
        setUserName(currentUser.user_metadata.full_name);
      } else {
        setUserName(currentUser.email?.split("@")[0] || "User");
      }

      // ✅ Fetch latest result (join with interview_sessions for filtering)
      const { data: latest, error: latestError } = await supabase
        .from("interview_results")
        .select(
          `
          final_score,
          created_at,
          interview_sessions!inner(user_id)
        `
        )
        .eq("interview_sessions.user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!latestError && latest) {
        setLatestResult(latest);
      }

      // ✅ Fetch all results for average
      const { data: allResults, error: allError } = await supabase
        .from("interview_results")
        .select(
          `
          final_score,
          interview_sessions!inner(user_id)
        `
        )
        .eq("interview_sessions.user_id", currentUser.id);

      if (!allError && allResults?.length > 0) {
        const avg =
          allResults.reduce((sum, r) => sum + r.final_score, 0) /
          allResults.length;
        setAverageScore(Math.round(avg));
      }
    };

    fetchUserAndScores();
  }, []);

  return (
    <div className="px-6 pt-4">
      <div className="flex justify-between items-center bg-[#103E50] text-white px-6 py-3 rounded-xl shadow">
        
        {/* Left - Avatar + Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>

          <p className="text-lg font-medium">Welcome, {userName} 👋</p>
        </div>

        {/* Right - Notifications + Scores */}
        <div className="flex items-center gap-6">
          <Bell className="w-6 h-6 cursor-pointer" />

          {/* Latest Interview Score */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#2DC7DB] text-sm font-bold">
              {latestResult?.final_score ?? "--"}
            </div>
            <span className="text-xs mt-1">Interview Score</span>
          </div>

          {/* Average Score */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#2B7ECF] text-sm font-bold">
              {averageScore ?? "--"}
            </div>
            <span className="text-xs mt-1">Avg Score</span>
          </div>
        </div>
      </div>
    </div>
  );
}
