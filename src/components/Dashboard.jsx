"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";

// -------------------------------------------------------------------
// Table Component — with Inter/Intra toggle and top 10 limit
// -------------------------------------------------------------------
function InterviewDashboardTable({ results, currentUserCollegeId }) {
  const [view, setView] = useState("Inter"); // Default mode

  // ✅ Filter results for intra vs inter
  const filteredResults =
    view === "Intra" && currentUserCollegeId
      ? results.filter((r) => r.profile?.clg_id === currentUserCollegeId)
      : results;

  // ✅ Limit to top 10 always
  const displayResults = filteredResults.slice(0, 10);

  // === Styles (unchanged) ===
  const tealHeaderBgStyle = {
    background: "#0CA396",
    color: "white",
    fontWeight: "bold",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    padding: "8px 15px",
    height: "60px",
    fontSize: "15px",
    lineHeight: "1.2",
  };

  const rowTextStyleMedium = {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 500,
    fontSize: "12px",
    color: "#09407F",
    lineHeight: "1",
  };

  const scoreTextStyleSemiBold = {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    fontSize: "12px",
    color: "#09407F",
    lineHeight: "1",
  };

  const activeGradientStyle = {
    background: "linear-gradient(to right, #0CA396, #04A2CF)",
    color: "white",
  };

  const inactiveBgColor = "#D4F6FA";

  return (
    
    <div className="w-full">
      {/* 🟢 Toggle Section */}
      <div
        className="rounded-lg mb-4 p-1"
        style={{
          background: "#D4F6FA",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div className="flex justify-between rounded-md overflow-hidden">
          {["Inter", "Intra"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 text-center py-2 text-lg font-semibold transition duration-200 rounded-md ${
                v !== view ? "text-gray-500 hover:text-gray-900" : ""
              }`}
              style={
                v === view
                  ? activeGradientStyle
                  : { backgroundColor: inactiveBgColor }
              }
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* 🧾 Table Section */}
      <div className="bg-[#D4F6FA] rounded-2xl p-4 shadow-xl">
        {/* Table Header */}
        <div className="grid grid-cols-[3fr_1fr_1fr] gap-3 mb-4">
          <span style={{ ...tealHeaderBgStyle, justifyContent: "flex-start" }}>
            Candidate Profile
          </span>
          <span style={tealHeaderBgStyle}>Rank</span>
          <span style={tealHeaderBgStyle}>Score</span>
        </div>

        {/* Data Rows */}
        {displayResults.map((result, idx) => (
          <div
            key={result.id}
            className="grid grid-cols-[3fr_1fr_1fr] gap-2 items-center py-3 border-b border-gray-300/50 last:border-0"
          >
            {/* Profile */}
            <div className="flex items-center gap-3" style={rowTextStyleMedium}>
              <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                {result.profile?.name ? result.profile.name.charAt(0) : "U"}
              </div>
              <span>{result.profile?.name || "Unknown User"}</span>
            </div>

            {/* Rank */}
            <span
              className="text-center font-medium"
              style={rowTextStyleMedium}
            >
              #{idx + 1}
            </span>

            {/* Score */}
            <span className="text-center" style={scoreTextStyleSemiBold}>
              {result.final_score ?? "--"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------
// Main Dashboard (Fetches data, college ID, and passes to table)
// -------------------------------------------------------------------
export default function Dashboard() {
  const [results, setResults] = useState([]);
  const [currentUserCollegeId, setCurrentUserCollegeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // ✅ Get current user's clg_id
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("clg_id")
          .eq("user_id", user.id)
          .single();

        if (profileError) console.error("Profile fetch error:", profileError);
        console.log("🎓 Current user college ID:", profile?.clg_id);
        setCurrentUserCollegeId(profile?.clg_id ?? null);

        // ✅ Fetch all interview results (global)
        const { data: results, error: resultsError } = await supabase
          .from("interview_results")
          .select(
            `
            id,
            final_score,
            user_id,
            interview_sessions ( company )
          `
          )
          .order("final_score", { ascending: false });

        if (resultsError) throw resultsError;

        // ✅ Fetch all profiles for name + clg_id mapping
        const userIds = (results || []).map((r) => r.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, name, clg_id")
          .in("user_id", userIds);

        if (profilesError) throw profilesError;

        const profilesMap = (profiles || []).reduce((acc, p) => {
          acc[p.user_id] = p;
          return acc;
        }, {});

        // ✅ Merge user profile info into results
        const merged = (results || []).map((r) => ({
          ...r,
          profile: profilesMap[r.user_id] || null,
        }));

        console.log("✅ Total results fetched:", merged.length);
        setResults(merged);
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading dashboard...
      </div>
    );

  if (results.length === 0)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        No interview results yet 🚀
      </div>
    );

  return (
    <div style={{ fontFamily: "Poppins, sans-serif" }} className="p-6">
      <div className="max-w-4xl mx-auto">
        <h2
          className="mb-4"
          style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: 600,
            fontSize: "20px",
            color: "#09407F",
            lineHeight: "1",
            letterSpacing: "0",
          }}
        >
          Interview Dashboard
        </h2>
        <InterviewDashboardTable
          results={results}
          currentUserCollegeId={currentUserCollegeId}
        />
      </div>
    </div>
  );
}
