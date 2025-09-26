"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Bell } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [latestResult, setLatestResult] = useState<any>(null);

  useEffect(() => {
    const fetchUserAndScores = async () => {
      // ✅ Fetch logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);

        // ✅ Fetch latest interview result for this user
        const { data: results, error } = await supabase
          .from("interview_results")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (!error && results.length > 0) {
          setLatestResult(results[0]);
        }
      }
    };

    fetchUserAndScores();
  }, []);

  return (
    <div className="px-6 pt-4">
      <div className="flex justify-between items-center bg-[#103E50] text-white px-6 py-3 rounded-xl shadow">
        
        {/* Left - Avatar + Name */}
        <div className="flex items-center gap-3">
          {user?.user_metadata?.avatar_url ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#2DC7DB]">
              <img
                src={user.user_metadata.avatar_url}
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}

          <p className="text-lg font-medium">
            {user ? `Hi ${user.user_metadata.full_name || "User"} 👋` : "Welcome!"}
          </p>
        </div>

        {/* Right - Bell + Scores */}
        <div className="flex items-center gap-6">
          <Bell className="w-6 h-6 cursor-pointer" />

          {/* Interview Score */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#2DC7DB] text-sm font-bold">
              {latestResult?.final_score ?? "--"}
            </div>
            <span className="text-xs mt-1">Interview Score</span>
          </div>

          {/* Generic Score (avg of all interviews for now) */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#2B7ECF] text-sm font-bold">
              {latestResult?.final_score ?? "--"}
            </div>
            <span className="text-xs mt-1">Score</span>
          </div>
        </div>
      </div>
    </div>
  );
}
