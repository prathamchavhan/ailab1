"use client";

import { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";


function MetricItem({ score, label, color = "#3b82f6", showProgressBar = true }) {
  const roundedScore = Math.round(score);
  return (
    <div className="flex items-center justify-between gap-2 text-xs w-full">
      <div className="flex items-center gap-1 whitespace-nowrap">
       <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: "#2E2E2E" }}
        ></span>
        <span className="text-[#2E2E2E]">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-black">{roundedScore}</span>
       
      </div>
    </div>
  );
}


function SinglePerformanceBar({ score, label, barColorStart, barColorEnd }) {
  const roundedScore = Math.round(score);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2">
        <div className="w-full bg-white rounded-full h-2" 
          style={{ boxShadow: "inset 0px 1px 3px rgba(0, 0, 0, 0.2)" }}>
          <div
            className="h-full rounded-full"
           
            style={{
              width: `${roundedScore}%`,
              background: `linear-gradient(to right, ${barColorStart}, ${barColorEnd})`,
            }}
          ></div>
        </div>
        <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">
          {roundedScore}%
        </span>
      </div>
    </div>
  );
}
function DetailedScoreCard({
  type,
  themeColor,
  themeColorEnd,
  barColorStart,
  barColorEnd,
}) {
  const supabase = createClientComponentClient();
  const [scores, setScores] = useState({
    overallAvg: 0,
    topScore: 0,
    lowestScore: 0,
    metrics: {},
    benchmark: 70,
  });
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Fetching Logic (Omitted for brevity, unchanged) ---
  const calculateAverage = useCallback((data) => {
    if (!data || data.length === 0) return 0;
    const total = data.reduce((sum, num) => sum + num, 0);
    return Math.round(total / data.length);
  }, []);

  const calculateMaxScore = useCallback((data) => {
    if (!data || data.length === 0) return 0;
    return Math.max(...data.filter((n) => typeof n === "number"));
  }, []);

  const fetchData = useCallback(
    async (userId) => {
      setIsLoading(true);
      let allScores = [];
      let metricsToProcess = {};

      if (type === "interview" || type === "overall") {
        const { data: interviewResults } = await supabase
          .from("interview_results")
          .select("final_score, radar_scores")
          .eq("user_id", userId);
        if (interviewResults) {
          allScores = allScores.concat(
            interviewResults.map((item) => item.final_score).filter(Boolean)
          );
          interviewResults.forEach((item) => {
            if (item.radar_scores && Array.isArray(item.radar_scores)) {
              item.radar_scores.forEach((metric) => {
                const metricName = metric.subject;
                const metricScore = metric.A;
                if (metricName && typeof metricScore === "number") {
                  if (!metricsToProcess[metricName])
                    metricsToProcess[metricName] = [];
                  metricsToProcess[metricName].push(metricScore);
                }
              });
            }
          });
        }
      }

      if (type === "aptitude" || type === "overall") {
        const { data: aptitudeData } = await supabase
          .from("aptitude")
          .select("score, type, level")
          .eq("user_id", userId);
        if (aptitudeData) {
          allScores = allScores.concat(aptitudeData.map((item) => item.score));
          aptitudeData.forEach((item) => {
            const key = item.type ? `${item.type}_${item.level}` : item.level;
            if (key) {
              if (!metricsToProcess[key]) metricsToProcess[key] = [];
              metricsToProcess[key].push(item.score);
            }
          });
        }
      }

      const metricMaxScores = {};
      for (const key in metricsToProcess) {
        metricMaxScores[key] = calculateMaxScore(metricsToProcess[key]);
      }

      setScores({
        overallAvg: allScores.length > 0 ? calculateAverage(allScores) : 0,
        topScore: allScores.length > 0 ? Math.max(...allScores) : 0,
        lowestScore: allScores.length > 0 ? Math.min(...allScores) : 0,
        metrics: metricMaxScores,
        benchmark: 70,
      });
      setIsLoading(false);
    },
    [supabase, type, calculateAverage, calculateMaxScore]
  );

  useEffect(() => {
    const getUserAndFetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) fetchData(user.id);
      else setIsLoading(false);
    };
    getUserAndFetchData();
  }, [supabase, fetchData]);

 
  const mainProgressRingInnerStyle = {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    backgroundColor: "#EAFFFD",
    display: "grid",
    placeItems: "center",
    fontSize: "18px",
    fontWeight: "700",
    color: "#1A202C",
 
    border: "3px inset #b1aeaeff",
      border: "3px solid #ede7e7ff",
    boxShadow: "0px 2px 3px rgba(0, 0, 0, 0.1)"
  };
  const mainProgressRingStyle = {
    width: "95px",
    height: "95px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
     border: "3px inset #c7c4c4ff",
       border: "4px solid #d1ceceff",
    background: `conic-gradient(${themeColor} ${scores.overallAvg}%, #1D14C6 ${scores.overallAvg}%)`,
boxShadow: "0px 2px 9px rgba(0, 0, 0, 0.1)"
  };

  if (isLoading) {
    return (
      <Card className="h-[200px] flex items-center justify-center">
        <p className="text-sm">Loading...</p>
      </Card>
    );
  }

  const renderMetrics = () => {
    if (type === "overall") {
      return (
        <>
          <MetricItem
            score={scores.overallAvg}
            label="Total Score"
            color={themeColor}
            showProgressBar={false}
          />
          <MetricItem
            score={scores.benchmark}
            label="Benchmarking Comparison"
            color={themeColor}
            showProgressBar={false}
          />
          <MetricItem
            score={scores.overallAvg > scores.benchmark ? 75 : 30}
            label="Status"
            color={themeColor}
            showProgressBar={true}
          />
        </>
      );
    }
    if (type === "aptitude") {
      const difficultyLevels = [
        { key: "easy", label: "Easy Score" },
        { key: "medium", label: " Medium Score" },
        { key: "hard", label: "Hard Score" },
      ];
      return difficultyLevels.map((level) => {
        let maxScore = 0;
        for (const key in scores.metrics) {
          if (key.endsWith(`_${level.key}`)) {
            maxScore = Math.max(maxScore, scores.metrics[key]);
          }
        }
        return (
          <MetricItem
            key={level.key}
            score={maxScore}
            label={level.label}
            color={themeColor}
            showProgressBar={true}
          />
        );
      });
    }
    const aptitudeTypes = [
      "Quantitative",
      "Logical",
      "Verbal",
      "Mixed",
      "Data Interpretation",
      "Logical Reasoning",
    ];
    const interviewMetrics = Object.entries(scores.metrics).filter(
      ([label]) => !aptitudeTypes.includes(label)
    );
    return interviewMetrics
      .sort(([labelA], [labelB]) => labelA.localeCompare(labelB))
      .map(([label, score]) => (
        <MetricItem
          key={label}
          score={score}
          label={label}
          color={themeColor}
        />
      ));
  };

  const topScoreLabel = type === "overall" ? "Total Score" : "Top Score";
  const topScoreValue = type === "overall" ? scores.overallAvg : scores.topScore;

  let performanceBarLabel;
  if (type === "interview") {
    performanceBarLabel = "Interview Performance";
  } else if (type === "aptitude") {
    performanceBarLabel = "Aptitude Performance";
  } else {
    performanceBarLabel = "Holistic Performance";
  }


  return (
   <Card
      className="h-auto w-full flex flex-col mb-2 shadow-md mt-0 duration-300 rounded-lg"
      style={{
        background: `linear-gradient(to right, ${themeColor}1A, ${
          themeColorEnd ? themeColorEnd + "1A" : "#FFFFFF"
        })`,
      }}
    >
      <CardContent className="flex-grow p-2 flex flex-col md:flex-row mt-0 items-center justify-center gap-4">
     
        <div className="relative flex h-[145px] w-[110px] items-center justify-center">

          <span className="absolute top-3 text-xs font-semibold text-black leading-none">
            {topScoreLabel}: {topScoreValue}
          </span>

    
          <div style={mainProgressRingStyle}>
            <div style={mainProgressRingInnerStyle}>{scores.overallAvg}</div>
          </div>

        
          <span className="absolute bottom-1 text-xs font-semibold text-black leading-none">
            Lowest Score: {scores.lowestScore}
          </span>
        </div>


        <div className="flex flex-col gap-2 w-full md:w-[65%]">
          <div className="flex flex-col gap-1 w-full">{renderMetrics()}</div>
          <div className="mt-auto pt-1">
            <SinglePerformanceBar
              score={scores.overallAvg}
              barColorStart={barColorStart}
              barColorEnd={barColorEnd}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


export default function Kpicard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-0 mb-0">
      <div key="interview-card-container">
        <p className="text-base font-bold text-[#09407F] px-1 mb-0">
          AI Interview Score
        </p>
        <p className="text-xs text-gray-500 px-1">
          Candidates Performance Summary
        </p>
        <DetailedScoreCard
          type="interview"
          themeColor="#00EAFF"
          barColorStart="#1D14C6"
          barColorEnd="#15B6CF"
        />
      </div>

      <div key="aptitude-card-container">
        <p className="text-base font-bold text-[#09407F] px-1 mb-0">
          Aptitude Score
        </p>
        <p className="text-xs text-gray-500  px-1">Mixed assessment results</p>
        <DetailedScoreCard
          type="aptitude"
          themeColor="#00EAFF" 
          
          barColorStart="#1D14C6"
          barColorEnd="#15B6CF"
        />
      </div>

      <div key="overall-card-container">
        <p className="text-base font-bold text-[#09407F] px-1 mb-0">
          Overall Score
        </p>
        <p className="text-xs text-gray-500 px-1">
          Comprehensive and holistic evaluation
        </p>
        <DetailedScoreCard
          type="overall"
          themeColor="#00EAFF"
          barColorStart="#1D14C6"
          barColorEnd="#15B6CF"
        />
      </div>
    </div>
  );
}