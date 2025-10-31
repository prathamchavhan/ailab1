"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import Announcement from "../../../components/Announcement";
import Header from "../../../components/Header";
import { CircleCheckBig , TriangleAlert } from 'lucide-react';

function AnalyticsPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(null);
  const [domain, setDomain] = useState("Not available");
  const [radarData, setRadarData] = useState([]);
  const [feedbackStrengths, setFeedbackStrengths] = useState([]);
  const [feedbackImprovements, setFeedbackImprovements] = useState([]);
  const [rank, setRank] = useState(null);

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
          .order("created_at", { ascending: false }) // Get newest first
          .limit(1) // Only take the newest one
          .single(); // Now this is safe to use

        // ✅ --- END OF FIX ---

        if (error || !result) {
          console.error("Error fetching analytics:", error || {});
          setLoading(false);
          return;
        }

        const currentScore = result.final_score ?? 0;
        setScore(currentScore);
        setDomain(result.interview_sessions?.domain || "Not available");

        
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

        const formattedRadar = scores.map((s) => ({
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
        <p className="text-gray-600 text-lg font-medium">
          Loading analytics...
        </p>
      </div>
    );
  }

  // 🧩 Helper for radar metric extraction
  const getMetric = (name) => {
    const metric = radarData.find(
      (r) => r.subject?.toLowerCase() === name.toLowerCase()
    );
    return metric ? metric.A : 0;
  };

  const summaryData = [
    { label: "Current Rank", score: rank || 0, color: "#3CB371" },
    { label: "Confidence", score: getMetric("confidence"), color: "#808080" },
    {
      label: "Communication",
      score: getMetric("communication"),
      color: "#DC143C",
    },
    { label: "Interview", score: score || 0, color: "#4682B4" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Header />

      <div className="flex flex-col">
        {/* Main Content Grid: Stacks on mobile/mid, switches to 8/4 grid on large screens */}
        <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* 🎯 Left Section (Score Card, Radar, Summary) - Full width on mobile/mid, 8 cols on large */}
          <div className="lg:col-span-8 w-full space-y-6 lg:space-y-8">
            
            {/* Score Card - Now uses w-full and responsive height */}
            <div className="bg-[#103E50] text-white p-6 rounded-[12px] shadow-md w-full min-h-[180px] flex flex-col justify-center">
              <p className="text-xl font-bold !mt-4">
                Your Final AI Interview Score
              </p>
              <p className="text-3xl font-bold mt-2">
                {score?.toFixed(2)} /100
              </p>
              <p
                className={`mt-2 text-lg font-semibold ${
                  score && score >= 70 ? "text-green-400" : "text-red-400"
                }`}
              >
                {score && score >= 70
                  ? "EXCELLENT PERFORMANCE 🎉"
                  : "Keep Practicing!"}
              </p>
              <p className="mt-1 text-sm text-gray-300">Domain: {domain}</p>
            </div>

           
            {/* Radar Chart & Overall Summary Container: Stacks on medium screens, row on large screens */}
            <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6 xl:gap-10">
             
              {/* Radar Chart Block */}
              <div className="flex flex-col w-full md:w-1/2 xl:w-[500px] max-w-lg">
                <h3
                  className="font-[Poppins] !text-[#09407F] !font-bold mb-2 ml-1"
                  style={{
                    fontSize: "20px",
                    lineHeight: "100%",   
                  }}
                >
                  AI Video Score
                </h3>

                {/* Radar Chart Card */}
                <div className="bg-white rounded-[12px] shadow-md flex flex-col items-center justify-center w-full min-h-[370px] p-2">
                  {radarData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        data={radarData}
                      >
                        <PolarGrid />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{
                            fill: "#09407F",
                            fontSize: 12,
                            fontWeight: 500,
                          }}
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
                    <p className="text-gray-500 text-sm">
                      No radar data available.
                    </p>
                  )}
                </div>

                {/* Practice Again Button */}
                <div className="flex justify-center md:justify-end mt-5">
                  <button
                    onClick={() => (window.location.href = "/ai-dashboard")}
                    className="w-full max-w-xs md:max-w-[282px] h-[47px] rounded-[12px] bg-gradient-to-r from-[#2DC5DA] to-[#2B84D0] 
                               text-white font-[Inter] text-center font-semibold text-[18px] shadow hover:opacity-90 transition-all"
                    style={{ borderRadius: '8px' }}
                  >
                    Practice Again
                  </button>
                </div>
              </div>

              {/* Overall Summary */}
              <div className="flex flex-col items-center w-full md:w-1/2 xl:w-auto max-w-md md:max-w-xs pt-4 md:pt-0">
                <p className="text-[#09407F] font-bold text-[20px] mb-4 font-[Poppins] text-center">
                  Overall Summary
                </p>

                {/* Summary Cards: Ensure they don't overflow */}
                <div className="flex flex-wrap justify-center gap-4">
                  {summaryData.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center px-4 py-2 w-full max-w-[190px] rounded-[14px] shadow-md bg-gradient-to-r from-[#F8F8F8] to-[#BAF2FF] sm:w-auto"
                    >
                      <div
                        className="flex items-center justify-center min-w-[40px] h-[40px] rounded-full font-semibold text-[10px] bg-white px-1"
                        style={{
                          border: `3px solid ${item.color}`,
                          lineHeight: "1",
                        }}
                      >
                        {item.score}
                      </div>
                      <span
                        className="font-[Poppins] font-semibold ml-3"
                        style={{
                          fontSize: "12px",
                          color: "#09407F",
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

          {/* 🎯 Right Section: Feedback - Full width on mobile/mid, 4 cols on large */}
          <div className="lg:col-span-4 w-full flex flex-col space-y-6">
            <div className="w-full">
              <Announcement />
            </div>
            
            <p
              className="font-[Poppins] font-semibold mb-2 text-[#09407F] text-xl"
            >
              Key Feedback & Next Steps
            </p>
            
            {/* Professional Feedback Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-[#1E88E5]/40 w-full">
              <div className="space-y-6">
                
                {/* ✅ Creativity Section */}
                {radarData.some(
                  (r) => r.subject?.toLowerCase() === "creativity"
                ) && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-500 text-lg"> <TriangleAlert /></span>
                      <p className="text-[16px] font-semibold text-gray-800 mb-0">
                        Creativity
                      </p>
                    </div>
                    <ul className="list-disc list-inside text-sm text-gray-700 pl-6 leading-relaxed">
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
                      <span className="text-yellow-500 text-lg"> <TriangleAlert /></span>
                      <p className="text-[16px] font-semibold text-gray-800 mb-0">
                        Improvement Areas
                      </p>
                    </div>

                    <ul className="list-disc list-inside text-sm text-gray-700 pl-6 space-y-2 leading-relaxed">
                      {feedbackImprovements.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <hr className="mt-4 border-t border-gray-300/60" />
                
                {/* ✅ Strengths */}
                {feedbackStrengths.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-600 text-lg">  <CircleCheckBig /></span>
                      <p className="text-[16px] font-semibold text-gray-800 mb-0">
                        Strengths
                      </p>
                    </div>

                    <ul className="list-disc list-inside text-sm text-gray-700 pl-6 space-y-2 leading-relaxed">
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

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnalyticsPageContent />
    </Suspense>
  );
}