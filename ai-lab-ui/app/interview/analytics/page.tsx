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
  const [rank, setRank] = useState<number | null>(null);

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
            interview_sessions ( domain, user_id )
          `
          )
          .eq("session_id", sessionId)
          .single();

        if (error || !result) {
          console.error("Error fetching analytics:", error || {});
          setLoading(false);
          return;
        }

        const currentScore = result.final_score ?? 0;
        setScore(currentScore);
        setDomain(result.interview_sessions?.domain || "Not available");

        // 🧮 Calculate Rank
        const { data: allResults } = await supabase
          .from("interview_results")
          .select("final_score, user_id")
          .order("final_score", { ascending: false });

        if (allResults?.length) {
          const sorted = allResults.map((r) => r.final_score);
          const currentIndex = sorted.findIndex((s) => s === currentScore);
          setRank(currentIndex + 1);
        }

        // 🎯 Radar Data
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

        // 💬 Feedback
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

  // 🧩 Helper for metric extraction
  const getMetric = (name: string): number => {
    const metric = radarData.find(
      (r) => r.subject?.toLowerCase() === name.toLowerCase()
    );
    return metric ? metric.A : 0;
  };

  const summaryData = [
    { label: "Current Rank", score: rank || 0, color: "#3CB371" },
    { label: "Confidence", score: getMetric("confidence"), color: "#808080" },
    { label: "Communication", score: getMetric("communication"), color: "#DC143C" },
    { label: "Interview", score: score || 0, color: "#4682B4" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />

        <div className="p-8 grid grid-cols-12 gap-8">
          {/* 🎯 Left Section */}
          <div className="col-span-8 space-y-8">
            {/* Score Card */}
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

            {/* ✅ Radar Chart + Overall Summary (Aligned & Balanced Layout) */}
            <div className="flex flex-row items-start justify-center mt-4 gap-28">
              {/* Left: Radar Chart Section */}
              <div className="flex flex-col w-[500px]">
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

                <div className="bg-white rounded-[12px] shadow-md flex flex-col items-center justify-center w-full h-[370px] p-6">
                  {radarData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="90%">
                      <RadarChart cx="50%" cy="50%" outerRadius="85%" data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fill: "#09407F", fontSize: 12, fontWeight: 500 }}
                        />
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
                  ) : (
                    <p className="text-gray-500 text-sm">No radar data available.</p>
                  )}
                </div>

                {/* Practice Again */}
                <div className="flex justify-start mt-5">
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

              {/* Right: Overall Summary Section */}
              <div className="flex flex-col items-center">
                <h3 className="text-[#09407F] font-bold text-2xl mb-4 font-[Poppins] text-center">
                  Overall Summary
                </h3>

                <div className="flex flex-col items-center space-y-4">
                  {summaryData.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center px-5 w-[190px] h-[55px] rounded-[14px] shadow-md bg-gradient-to-r from-[#F8F8F8] to-[#BAF2FF]"
                    >
                      <div
                        className="flex items-center justify-center w-[38px] h-[38px] rounded-full font-semibold text-[13px] bg-white"
                        style={{
                          border: `3px solid ${item.color}`,
                          lineHeight: "1",
                          textAlign: "center",
                        }}
                      >
                        {item.score}
                      </div>
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
          </div>

          {/* 🎯 Right Section: Feedback */}
          <div className="col-span-4 flex flex-col space-y-6">
            <Announcement />

            {/* ✅ Professional Feedback Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-[#1E88E5]/40">
              <h3
                className="font-[Poppins] font-semibold mb-6 text-[#09407F]"
                style={{
                  fontSize: "20px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                }}
              >
                Key Feedback & Next Steps
              </h3>

              <div className="space-y-6">
                {/* ✅ Creativity Section */}
                {radarData.some(
                  (r) => r.subject?.toLowerCase() === "creativity"
                ) && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-500 text-lg">⚠️</span>
                      <h4 className="text-[16px] font-semibold text-gray-800">
                        Creativity
                      </h4>
                    </div>
                    <ul className="list-disc list-inside text-[14px] text-gray-700 pl-6 leading-relaxed">
                      <li>
                        Creativity score:{" "}
                        <span className="font-medium">
                          {getMetric("creativity")}% — shows idea generation and
                          innovative thinking.
                        </span>
                      </li>
                    </ul>
                    <hr className="mt-4 border-t border-gray-300/60" />
                  </div>
                )}

                {/* ✅ Improvement Areas */}
                {feedbackImprovements.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-600 text-lg">⚠️</span>
                      <h4 className="text-[16px] font-semibold text-gray-800">
                        Improvement Areas
                      </h4>
                    </div>

                    <ul className="list-disc list-inside text-[14px] text-gray-700 pl-6 space-y-2 leading-relaxed">
                      {feedbackImprovements.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* ✅ Strengths */}
                {feedbackStrengths.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-600 text-lg">✅</span>
                      <h4 className="text-[16px] font-semibold text-gray-800">
                        Strengths
                      </h4>
                    </div>

                    <ul className="list-disc list-inside text-[14px] text-gray-700 pl-6 space-y-2 leading-relaxed">
                      {feedbackStrengths.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* No Feedback */}
                {feedbackStrengths.length === 0 &&
                  feedbackImprovements.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No feedback available.
                    </p>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
