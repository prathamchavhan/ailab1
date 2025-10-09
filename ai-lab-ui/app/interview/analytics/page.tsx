"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/client";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import Announcement from "@/app/components/Announcement";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<number | null>(null);
  const [domain, setDomain] = useState<string>("Not available");
  const [radarData, setRadarData] = useState<any[]>([]);
  const [feedbackStrengths, setFeedbackStrengths] = useState<string[]>([]);
  const [feedbackImprovements, setFeedbackImprovements] = useState<string[]>([]);

  // ✅ Fetch Interview Results
  useEffect(() => {
    if (!sessionId) return;

    const fetchResult = async () => {
      try {
        const { data: result, error } = await supabase
          .from("interview_results")
          .select(
            `
            final_score,
            radar_scores,
            feedback,
            interview_sessions ( domain )
          `
          )
          .eq("session_id", sessionId)
          .single();

        if (error || !result) {
          console.error("Error fetching analytics:", error || {});
          setLoading(false);
          return;
        }

        setScore(result.final_score ?? 0);
        setDomain(result.interview_sessions?.domain || "Not available");

        let scores = result.radar_scores || [];
        if (typeof scores === "string") {
          try {
            scores = JSON.parse(scores);
          } catch {
            scores = [];
          }
        }

        const formattedRadar = scores.map((s: any) => ({
          subject: s.subject,
          A: Number(s.A) || 0,
        }));

        if (
          !formattedRadar.find((r) => r.subject === "Overall") &&
          result.final_score
        ) {
          formattedRadar.push({ subject: "Overall", A: result.final_score });
        }

        setRadarData(formattedRadar);

        const fb = result.feedback || {};
        const strengths = Array.isArray(fb.strengths)
          ? fb.strengths
          : fb.strengths
          ? [fb.strengths]
          : [];
        const improvements = Array.isArray(fb.improvements)
          ? fb.improvements
          : fb.improvements
          ? [fb.improvements]
          : [];

        setFeedbackStrengths(strengths);
        setFeedbackImprovements(improvements);
      } catch (err) {
        console.error("Unexpected error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg font-medium">Loading analytics...</p>
      </div>
    );
  }

  // ✅ Mock Summary Data
  const summaryData = [
    { label: "Current Rank", score: 55, color: "#3CB371" },
    { label: "Confidence", score: 44, color: "#808080" },
    { label: "Communication", score: 35, color: "#DC143C" },
    { label: "Interview", score: 26, color: "#4682B4" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      {/* ✅ Sidebar */}
      <Sidebar />

      {/* ✅ Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />

        <div className="p-8 grid grid-cols-12 gap-8">
          {/* 🎯 Left Section: Score + Radar + Practice */}
          <div className="col-span-8 space-y-8">
            {/* ✅ Score Card */}
            <div className="bg-[#103E50] text-white p-6 rounded-[12px] shadow-md w-[800px] h-[203px] flex flex-col justify-center">
              <h2 className="text-xl font-bold">Your Final AI Interview Score</h2>
              <p className="text-3xl font-bold mt-2">{score?.toFixed(2)} /100</p>
              <p
                className={`mt-2 font-semibold ${
                  score && score >= 70 ? "text-green-400" : "text-red-400"
                }`}
              >
                {score && score >= 70
                  ? "EXCELLENT PERFORMANCE 🎉"
                  : "Keep Practicing!"}
              </p>
              <p className="mt-1 text-sm text-gray-300">Domain: {domain}</p>
            </div>

            {/* ✅ Radar Chart + Summary Side by Side */}
            <div className="flex flex-row items-start gap-10 mt-4">
              {/* Left: AI Video Score Chart */}
              <div className="flex flex-col">
              <h3
  className="font-[Poppins] font-semibold mb-2 ml-1"
  style={{
    fontSize: "20px",
    lineHeight: "100%",
    letterSpacing: "0%",
    color: "#0029A3",
  }}
>
  AI Video Score
</h3>


                <div className="bg-white rounded-[12px] shadow-md flex flex-col items-center justify-center w-[430px] h-[340px] p-4">
                  {radarData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height="85%">
                        <RadarChart
                          cx="50%"
                          cy="50%"
                          outerRadius="80%"
                          data={radarData}
                        >
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar
                            name="Score"
                            dataKey="A"
                            stroke="#2B7ECF"
                            fill="#2DC7DB"
                            fillOpacity={0.6}
                          />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No radar data available.
                    </p>
                  )}
                </div>

                {/* ✅ Practice Again Button */}
                <div className="flex justify-start ml-6 mt-4">
                  <button
                    onClick={() => (window.location.href = "/")}
                    className="w-[282px] h-[47px] rounded-[12px] bg-gradient-to-r from-[#2DC5DA] to-[#2B84D0] 
                               text-white font-[Inter] font-semibold text-[20px] leading-[100%] tracking-[0px] 
                               shadow hover:opacity-90 transition-all"
                  >
                    Practice Again
                  </button>
                </div>
              </div>

            {/* ✅ Right: Inline Overall Summary */}
<div className="flex flex-col items-start">
  <h3 className="text-[#09407F] font-bold text-2xl mb-4 font-[Poppins]">
    Over all Summary
  </h3>

  {summaryData.map((item, index) => (
    <div
      key={index}
      className="flex justify-between items-center px-4 mb-4 w-[171px] h-[52px] rounded-[12px] shadow-md bg-gradient-to-r from-[#F8F8F8] to-[#BAF2FF]"
    >
      <div
        className="flex items-center justify-center w-[38px] h-[38px] rounded-full font-semibold text-[15px] bg-white"
        style={{ border: `3px solid ${item.color}` }}
      >
        {item.score}
      </div>

      {/* ✅ Updated label styling per Figma spec */}
      <span
        className="font-[Poppins] font-semibold leading-[100%]"
        style={{
          fontSize: "12px",
          color: "#09407F",
          letterSpacing: "0%",
        }}
      >
        {item.label}
      </span>
    </div>
  ))}
</div>

            </div>
          </div>

          {/* 🎯 Right Section: Announcement + Feedback */}
          <div className="col-span-4 flex flex-col space-y-6">
            {/* ✅ Announcement Section */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#09407F]">
                
              </h3>
              <Announcement />
            </div>

            {/* ✅ Feedback Section */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h3
  className="font-[Poppins] font-semibold mb-4"
  style={{
    fontSize: "20px",
    lineHeight: "100%",
    letterSpacing: "0%",
    color: "#09407F",
  }}
>
  Key Feedback & Next Steps
</h3>

              {feedbackStrengths.length > 0 && (
                <div>
                  <span className="text-green-600 font-semibold">
                    ✔ Strengths
                  </span>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                    {feedbackStrengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {feedbackImprovements.length > 0 && (
                <div className="mt-4">
                  <span className="text-red-600 font-semibold">
                    ⚠ Improvement Areas
                  </span>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                    {feedbackImprovements.map((i, idx) => (
                      <li key={idx}>{i}</li>
                    ))}
                  </ul>
                </div>
              )}

              {feedbackStrengths.length === 0 &&
                feedbackImprovements.length === 0 && (
                  <p className="text-gray-500 text-sm">No feedback available.</p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
