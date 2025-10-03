"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/utils/supabase/client";

export default function Dashboard() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // 1️⃣ Fetch interview results + join interview_sessions
        const { data: results, error } = await supabase
          .from("interview_results")
          .select(`
            id,
            final_score,
            created_at,
            user_id,
            interview_sessions ( company )
          `)
          .order("final_score", { ascending: false });

        if (error) {
          console.error("Supabase error fetching results:", error.message);
          throw error;
        }

        if (!results || results.length === 0) {
          setResults([]);
          return;
        }

        // 2️⃣ Collect unique user_ids
        const userIds = results.map((r) => r.user_id).filter(Boolean);

        // 3️⃣ Fetch profiles for these users
        let profilesMap: Record<string, any> = {};
        if (userIds.length > 0) {
          const { data: profiles, error: profileError } = await supabase
            .from("profiles")
            .select("user_id, name")
            .in("user_id", userIds);

          if (profileError) {
            console.error("Supabase error fetching profiles:", profileError.message);
            throw profileError;
          }

          profilesMap = (profiles || []).reduce((acc, p) => {
            acc[p.user_id] = p;
            return acc;
          }, {});
        }

        // 4️⃣ Merge results with profiles
        const merged = results.map((r) => ({
          ...r,
          profile: profilesMap[r.user_id] || null,
        }));

        setResults(merged);
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        No interview results yet 🚀
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Leaderboard</h2>

        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 font-semibold text-gray-700 border-b pb-2">
          <span>Profile</span>
          <span>Company</span>
          <span>Rank</span>
          <span className="text-right">Score</span>
        </div>

        {/* Dynamic rows */}
        {results.map((result, idx) => (
          <div
            key={result.id}
            className="grid grid-cols-4 gap-4 items-center py-3 border-b last:border-0"
          >
            {/* Profile + Name */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                {result.profile?.name
                  ? result.profile.name.charAt(0)
                  : "?"}
              </div>
              <span className="text-gray-800 font-medium">
                {result.profile?.name || "Unknown User"}
              </span>
            </div>

            {/* Company */}
            <span className="text-gray-700">
              {result.interview_sessions?.company || "N/A"}
            </span>

            {/* Rank */}
            <span className="text-gray-700 font-semibold">#{idx + 1}</span>

            {/* Score */}
            <span className="text-right font-bold text-blue-600">
              {result.final_score ?? "--"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
