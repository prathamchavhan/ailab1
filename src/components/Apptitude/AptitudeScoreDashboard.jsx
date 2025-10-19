"use client";

import { useEffect, useState } from "react";

import Announcement from '@/components/Announcement'; 
import Apptitude_header from '@/components/Header/Apptitude_header';

const APTITUDE_TYPE_MAP = {
  quantitative: "Quantitative Aptitude",
  logical: "Logical Reasoning",
  verbal: "Verbal Ability",
};



export default function AptitudeScoreDashboard({
  score,
  totalQuestions,
  performanceData,
  onPracticeAgain,
}) {

  const [recommendations, setRecommendations] = useState(null);
  const [isRecsLoading, setIsRecsLoading] = useState(true);


  if (!performanceData) {
    return <div className="p-8 text-center">Loading performance data...</div>;
  }

  const totalScorePercentage = (score / totalQuestions) * 100;
  const performanceStatus = totalScorePercentage >= 60 ? "GOOD PERFORMANCE!" : "NEEDS IMPROVEMENT";
  const statusColor = totalScorePercentage >= 60 ? "text-green-500" : "text-red-500";
  const performanceStatusContainer = totalScorePercentage >= 60 ? "bg-[#e5f5e5]" : "bg-[#f5e5e5]";

  const sectionPercentages = Object.keys(performanceData).reduce((acc, category) => {
    const total = performanceData[category].total;
    const correct = performanceData[category].correct;
    acc[category] = total > 0 ? (correct / total) * 100 : 0;
    return acc;
  }, {});

  useEffect(() => {
    async function fetchRecommendations() {
      setIsRecsLoading(true);
      try {
        const payload = {
          quantitativeScore: sectionPercentages.quantitative,
          logicalScore: sectionPercentages.logical,
          verbalScore: sectionPercentages.verbal,
        };
        const response = await fetch("/api/get-recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to fetch recommendations.");
        const data = await response.json();
        setRecommendations(data.recommendations);
      } catch (err) {
        console.error("Recommendations fetch error:", err);
      } finally {
        setIsRecsLoading(false);
      }
    }
    fetchRecommendations();
  }, [JSON.stringify(sectionPercentages)]);


  return (
    <>
    <div className="mb-6">
        <Apptitude_header/>
      </div>
    <div className="p-4 sm:p-8  min-h-screen font-sans">
      
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:items-start mt-1">

          {/* Aptitude Test Score */}
          <div className="bg-[#05445E] text-white p-3 pb-4 rounded-3xl flex flex-col justify-start md:col-span-3">
            <div>
              <p className="text-[15px] font-semibold mb-8">Your Aptitude Test Score</p>
              <div className="text-[18px] md:text-[18px] font-bold mb-1.2">
                {score}/{totalQuestions}
                <span className="text-[10px] md:text-[10px] text-gray-400 font-normal ml-4">
                  ({Math.round(totalScorePercentage)}%)
                </span>
              </div>
              <div className={`p-1 rounded-xl inline-block ${performanceStatusContainer}`} style={{ backgroundColor: 'transparent' }}>
                <p className={`text-[9px] font-bold ${statusColor}`}>
                  <span className="text-[12px]">Status:</span>{performanceStatus}
                </p>
              </div>
            </div>
            <div className=" text-[10px] text-gray-300 ">
              <p>You&apos;ve shown strong analytical skills. Focus on time management.</p>
              <p className="mt-1 mb-0">
                Test Level: Moderate Level | Total Questions: {totalQuestions} | Correct Answers:{" "}
                {score} | Incorrect Answers: {totalQuestions - score}
              </p>
            </div>
          </div>

          {/* MODIFIED: Announcement/Ad section now renders your component */}
          <div className="bg-transparent flex flex-col items-center justify-center md:col-span-2 ">
            <Announcement />
          </div>
        </div>

        {/* Bottom Section (No Changes Here) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-11">
          {/* Aptitude Section Performance */}
          <div className="bg-[#F8F8F8] p-8 rounded-2xl">
            <p className="text-[15px] font-bold mb-8 text-[#0A407F]">Aptitude Section Performance</p>
            <div className="space-y-10">
              {Object.keys(performanceData).map((category) => (
                <div key={category} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-medium text-gray-900">
                      {APTITUDE_TYPE_MAP[category]}
                    </span>
                    <span className="text-[12px] font-bold text-gray-900">
                      {Math.round(sectionPercentages[category])}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-[#3D94E4] h-2.5 rounded-full"
                      style={{ width: `${sectionPercentages[category]}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-12">
              <button
                onClick={onPracticeAgain}
                className="py-2 px-16 text-[0.65rem] bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold shadow-md transition-all hover:scale-105"
                style={{ borderRadius: 8, overflow: 'hidden' }}
              >
                Practice Again
              </button>
            </div>
          </div>
          {/* Key Insights and Recommendations */}
          <div className="bg-[#F8F8F8] p-8 rounded-2xl">
            <p className="text-[13px] text-[#09407F] font-bold mb-13 ">Key Insights and Recommendations</p>
            {isRecsLoading ? (
              <div className="text-gray-500">Generating personalized recommendations...</div>
            ) : recommendations ? (
              <div className="space-y-6">
                <div>
                  <p className="font-bold text-[13px] text-[#000988] mb-1">Strength Highlight:</p>
                  <p className="text-[10px] text-gray-600">{recommendations.strength_highlight}</p>
                </div>
                <div>
                  <p className="font-bold text-[13px] text-[#000988] mb-1">Time Management:</p>
                  <p className="text-[10px] text-gray-600">{recommendations.time_management}</p>
                </div>
                <div>
                  <p className="font-bold text-[13px] text-[#000988] mb-1">Recommendations (Actionable Tips):</p>
                  <ul className="list-disc list-inside space-y-2 text-[10px] text-gray-600 mt-2">
                    {recommendations.recommendations.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-xs">Failed to load recommendations.</div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}