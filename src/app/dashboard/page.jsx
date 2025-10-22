// File: app/dashboard/page.js

"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import dynamic from 'next/dynamic'; 

import Announcement from "../../components/Announcement";
import Leaderboard from "../../components/dashbord/Leaderboard";
import Kpicard from "../../components/dashbord/Kpicard"; 
import Overall_header from '@/components/Header/Overall_header';

// FIX: Dynamically import the entire ScoreAnalytics component with ssr: false
const ClientScoreAnalytics = dynamic(
  () => import("@/components/dashbord/ScoreAnalytics"),
  { 
    ssr: false,
    loading: () => <div className="h-[400px] grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-100 animate-pulse rounded-lg h-full"></div>
        <div className="bg-gray-100 animate-pulse rounded-lg h-full"></div>
        <div className="bg-gray-100 animate-pulse rounded-lg h-full"></div>
    </div>
  }
);


export default function DashboardPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClientComponentClient());

  const [aptitudeData, setAptitudeData] = useState([]);
  const [interviewData, setInterviewData] = useState([]);
  const [overallPieData, setOverallPieData] = useState([]);
  const [totalAverage, setTotalAverage] = useState(0);

  const [expandedChart, setExpandedChart] = useState(null);

  const [interviewChartData, setInterviewChartData] = useState([]);
  const [aptitudeChartData, setAptitudeChartData] = useState([]);

  const [interviewDomains, setInterviewDomains] = useState([]);
  const [aptitudeTypes, setAptitudeTypes] = useState([]);

  const [interviewFilters, setInterviewFilters] = useState({});
  const [aptitudeFilters, setAptitudeFilters] = useState({}); 

  const processData = useCallback((data, typeKey) => {
    const filteredData = data.filter(item => item[typeKey]);
    const types = [...new Set(filteredData.map(item => item[typeKey]))];
    const groupedData = filteredData.reduce((acc, item) => {
      const type = item[typeKey];
      if (!acc[type]) acc[type] = [];
      acc[type].push(item.score);
      return acc;
    }, {});

    const chartData = [];
    const maxAttempts = Math.max(0, ...Object.values(groupedData).map(arr => arr.length));

    for (let i = 0; i < maxAttempts; i++) {
      const dataPoint = { attempt: i + 1 };
      types.forEach(type => {
        if (groupedData[type]?.[i] !== undefined) {
          dataPoint[type] = groupedData[type][i];
        }
      });
      chartData.push(dataPoint);
    }
    return { chartData, types };
  }, []);

  const fetchAptitudeData = useCallback(async (userId) => {
    const { data } = await supabase.from('aptitude').select('type, score').eq('user_id', userId);
    if (data) {
      setAptitudeData(data);
      const { chartData, types } = processData(data, 'type');
      setAptitudeChartData(chartData);
      setAptitudeTypes(types);
      setAptitudeFilters(types.reduce((acc, type) => ({ ...acc, [type]: true }), {}));
    }
  }, [supabase, processData]);

  const fetchInterviewData = useCallback(async (userId) => {
    const { data } = await supabase.from('avee_interview').select('domain, score').eq('user_id', userId);
    if (data) {
      setInterviewData(data);
      const { chartData, types } = processData(data, 'domain');
      setInterviewChartData(chartData);
      setInterviewDomains(types);
      setInterviewFilters(types.reduce((acc, type) => ({ ...acc, [type]: true }), {}));
    }
  }, [supabase, processData]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        fetchAptitudeData(session.user.id);
        fetchInterviewData(session.user.id);
      } else {
        router.push("/login");
      }
    });
    return () => subscription.unsubscribe();
  }, [router, supabase, fetchAptitudeData, fetchInterviewData]);

  const calculateAverage = (data) => {
    if (data.length === 0) return 0;
    const total = data.reduce((sum, item) => sum + item.score, 0);
    return Math.round(total / data.length);
  };
  
  useEffect(() => {
    const interviewAvg = calculateAverage(interviewData);
    const aptitudeAvg = calculateAverage(aptitudeData);
    
    const newPieData = [];
    if (interviewAvg > 0) newPieData.push({ name: 'Interview', value: interviewAvg });
    if (aptitudeAvg > 0) newPieData.push({ name: 'Aptitude', value: aptitudeAvg });
    setOverallPieData(newPieData);

    const allScores = [...interviewData, ...aptitudeData];
    if(allScores.length > 0) {
        setTotalAverage(calculateAverage(allScores));
    }
  }, [aptitudeData, interviewData]);

  const handleChartClick = (chartName) => setExpandedChart(expandedChart === chartName ? null : chartName);
  const handleFilterChange = (chart, type) => {
    const setFilters = chart === 'interview' ? setInterviewFilters : setAptitudeFilters;
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };


  return (
    <>
    <div className="mt-4">
      <Overall_header />
      </div>
     <main className="p-4 sm:p-6 lg:p-8"> 
    
    
     
      {/* 1. Top Section: Leaderboard and Announcement - Spacing is minimized */}
      <div className="flex flex-col md:flex-row gap-6 mb-6"> 
        <div className="flex-grow mt-5">
          <Leaderboard />
        </div>
        <div className="hidden lg:block w-full md:w-1/4 md:min-w-[250px] md:max-w-[300px]">
          <Announcement />
        </div>
      </div>
      

      {/* 2. KPI Section - Spacing is minimized */}
      <div className="mb-4"> 
          <Kpicard />
      </div>
      
      {/* 3. Score Analytics Section - Using the dynamic import component */}
      <div className="mt-0">
          <ClientScoreAnalytics
            interviewDomains={interviewDomains}
            interviewFilters={interviewFilters}
            interviewChartData={interviewChartData}
            aptitudeTypes={aptitudeTypes}
            aptitudeFilters={aptitudeFilters}
            aptitudeChartData={aptitudeChartData}
            overallPieData={overallPieData}
            totalAverage={totalAverage}
            expandedChart={expandedChart}
            handleChartClick={handleChartClick}
            handleFilterChange={handleFilterChange}
          />
      </div>
    </main>
    </>
  );
}