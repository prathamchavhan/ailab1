// File: app/dashboard/page.js (or your dashboard page file)

"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import Announcement from "../../components/Announcement";
import Leaderboard from "../../components/Leaderboard";
import Kpicard from "../../components/Kpicard"; 
import Header from "../../components/Header";
import dynamic from 'next/dynamic'; // <-- FIXED: Added missing import
import { useState as useReactState } from 'react';

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#8884d8', '#82ca9d', '  #ff7300'];

// Dynamic component to prevent SSR issues with Recharts
const ClientOnlyChart = dynamic(() => Promise.resolve(({ children }) => (
  <ResponsiveContainer width="100%" height={300}>{children}</ResponsiveContainer>
)), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-[300px] w-full">Loading chart...</div>,
});


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
    // Responsive offset applied here (pl-72 on desktop)
     <main className="py-3 pl-4 pr-6"> 
      <Header />
      
      {/* TOP SECTION: Leaderboard & Announcement */}
      <div className="flex flex-col md:flex-row gap-6 mb-6"> 
        <div className="flex-grow">
          <Leaderboard />
        </div>
      <div className="hidden lg:block w-full md:w-1/4 md:min-w-[250px] md:max-w-[300px]">
  <Announcement />
</div>
      </div>
      
      {/* KPI CARDS SECTION - FIX APPLIED: More EXTREME inline CSS margin-top */}
      <div style={{ marginTop: '-430px' }} className="mb-2"> 
          <Kpicard />
      </div>
      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Interview Scores Chart - Always Renders */}
        <div className={`transition-all duration-300 ${expandedChart === 'interview' ? 'md:col-span-3' : expandedChart ? 'hidden md:hidden' : 'md:col-span-1'}`}>
          <Card className="cursor-pointer h-full">
            <CardHeader onClick={() => handleChartClick('interview')}></CardHeader>
            <CardContent className="p-4 pt-0 pb-0">
              
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 text-sm">
                    {interviewDomains.map(domain => (
                      <label key={domain} className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={!!interviewFilters[domain]} onChange={() => handleFilterChange('interview', domain)} className="mr-2" />
                        {domain}
                      </label>
                    ))}
                  </div>
                  <ClientOnlyChart>
                    <LineChart data={interviewChartData.length > 0 ? interviewChartData : [{ attempt: 1, Placeholder: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="attempt" />
                      <YAxis domain={[0, 100]}/>
                      <Tooltip />
                      <Legend />
                      {interviewDomains.map((domain, i) => (
                        interviewFilters[domain] && <Line key={domain} type="monotone" dataKey={domain} stroke={COLORS[i % COLORS.length]} activeDot={{ r: 8 }} />
                      ))}
                      {/* Placeholder line for visual continuity when no domains exist */}
                      {interviewDomains.length === 0 && <Line type="monotone" dataKey="Placeholder" stroke="#e5e7eb" dot={false} />}
                    </LineChart>
                  </ClientOnlyChart>
            </CardContent>
          </Card>
        </div>

        {/* 2. Aptitude Score Chart - Always Renders */}
        <div className={`transition-all duration-300 ${expandedChart === 'aptitude' ? 'md:col-span-3' : expandedChart ? 'hidden md:hidden' : 'md:col-span-1'}`}>
          <Card className="cursor-pointer h-full">
            <CardHeader onClick={() => handleChartClick('aptitude')}></CardHeader>
            <CardContent>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 text-sm">
                    {aptitudeTypes.map(type => (
                      <label key={type} className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={!!aptitudeFilters[type]} onChange={() => handleFilterChange('aptitude', type)} className="mr-2" />
                        {type}
                      </label>
                    ))}
                  </div>
                  <ClientOnlyChart>
                    <LineChart data={aptitudeChartData.length > 0 ? aptitudeChartData : [{ attempt: 1, Placeholder: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="attempt" />
                      <YAxis domain={[0, 100]}/>
                      <Tooltip />
                      <Legend />
                      {aptitudeTypes.map((type, i) => (
                        aptitudeFilters[type] && <Line key={type} type="monotone" dataKey={type} stroke={COLORS[i % COLORS.length]} activeDot={{ r: 8 }} />
                      ))}
                      {/* Placeholder line for visual continuity */}
                      {aptitudeTypes.length === 0 && <Line type="monotone" dataKey="Placeholder" stroke="#e5e7eb" dot={false} />}
                    </LineChart>
                  </ClientOnlyChart>
            </CardContent>
          </Card>
        </div>

        {/* 3. Overall Score Chart - Always Renders */}
        <div className={`transition-all duration-300 ${expandedChart === 'overall' ? 'md:col-span-3' : expandedChart ? 'hidden md:hidden' : 'md:col-span-1'}`}>
          <Card className="h-full">
            <CardHeader onClick={() => handleChartClick('overall')}></CardHeader>
            <CardContent className="relative flex justify-center items-center h-[90%]">
                <>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <p className="text-sm text-gray-500">Average</p>
                    <p className="text-3xl font-bold">{totalAverage}%</p>
                  </div>
                  <ClientOnlyChart>
                    <PieChart>
                      <Pie 
                        data={overallPieData.length > 0 ? overallPieData : [{ name: 'Placeholder', value: 100 }]} 
                        cx="50%" 
                        cy="50%" 
                        labelLine={false} 
                        innerRadius={60} 
                        outerRadius={100} 
                        fill="#8884d8" 
                        paddingAngle={5} 
                        dataKey="value"
                      >
                        {overallPieData.length > 0 ? 
                         overallPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))
                         : <Cell key={`cell-placeholder`} fill="#e5e7eb" />
                        }
                      </Pie>
                      {overallPieData.length > 0 && <Tooltip />}
                      {overallPieData.length > 0 && <Legend />}
                    </PieChart>
                  </ClientOnlyChart>
                </>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}