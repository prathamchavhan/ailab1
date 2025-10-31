"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import dynamic from 'next/dynamic'; 

import Announcement from "../../components/Announcement";
import Leaderboard from "@/app/dashboard/components/Leaderboard";
import Kpicard from "@/app/dashboard/components/Kpicard"; 
import Overall_header from '@/components/Header/Overall_header';

import MonthlyStreakTracker from "@/app/dashboard/components/MonthlyStreakTracker";
const ClientScoreAnalytics = dynamic(
  () => import("@/app/dashboard/components/ScoreAnalytics"),
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
    // 1. Fetch data
    const { data } = await supabase
      .from('interview_results')
      .select(`
        score: final_score, 
        interview_sessions ( domain )
      `)
      .eq('user_id', userId);

    if (data) {
      // 2. Flatten data
      const flattenedData = data
        .map(item => ({
          score: item.score,
          domain: item.interview_sessions?.domain 
        }))
        .filter(item => item.score != null && item.domain != null);

      // 3. Helper function to normalize domain names
      const normalizeDomainName = (domainStr) => {
        if (!domainStr) return 'Other';
        const lower = domainStr.toLowerCase();

        // ⭐ MODIFICATION: Renamed "Information Technology" to "Interview"
        if (lower.includes('information technology') || lower.includes('it') || lower.includes('formation tech')) {
          return 'Interview';
        }
        if (lower.includes('artificial intelligence') || lower.includes('machine learning')) {
          return 'AI & Machine Learning';
        }
        if (lower.includes('data science') || lower.includes('analytics')) {
          return 'Data Science & Analytics';
        }
        if (lower.includes('hr')) {
          return 'HR';
        }
        
        return domainStr; 
      };

      // 4. Apply the cleaner to the data
      const cleanData = flattenedData.map(item => ({
        ...item,
        domain: normalizeDomainName(item.domain) // Overwrite domain with the clean version
      }));
      
      // 5. ⭐ MODIFICATION: Updated exclude list
      //    We still filter AI and Data Science, but "Interview" (formerly IT) is now allowed.
      const excludedDomains = new Set([
        'AI & Machine Learning',
        'Data Science & Analytics'
      ]);

      // 6. Filter the clean data
      const filteredData = cleanData.filter(item => !excludedDomains.has(item.domain));

      // 7. Use the 'filteredData' for everything else
      setInterviewData(filteredData); // Use filtered data
      
      const { chartData, types } = processData(filteredData, 'domain'); // Use filtered data
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
    const validAttempts = data.filter(item => item.score > 0);
    if (validAttempts.length === 0) return 0;
    const total = validAttempts.reduce((sum, item) => sum + item.score, 0);
    return Math.round(total / validAttempts.length);
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
      <div className="mt-4 mb-1" > 
      <MonthlyStreakTracker />
     </div>
      <main className="p-4 sm:p-6 lg:p-8">

  {/* ADJUSTED CLASSES HERE: Removed inline style and min/max width on announcement for better stacking on small screens */}
  <div
    className="flex flex-col md:flex-row mb-6 mt-4 gap-6" 
  >
   
    {/* Leaderboard takes all available space on all screens, but allows the announcement to stack */}
    <div className="flex-grow w-full"> 
      <Leaderboard />
    </div>
    
    
    {/* Announcement is full width on small screens, and only appears on medium+ screens */}
    {/* Added 'w-full' for small screens and 'md:w-auto' to let it shrink to content/min-w on larger screens */}
    <div className="w-full md:w-auto md:min-w-[250px] md:max-w-[300px]"> 
      <Announcement />
    </div>
  </div>

  <div className="mb-6">
    <Kpicard />
  </div>

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