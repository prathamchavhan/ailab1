"use client";
import { useEffect, useState, useCallback } from "react"; 
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cross } from 'recharts';
import Announcement from "../../components/Announcement";
import Leaderboard from "../../components/Leaderboard";
import Header from "../../components/Header";
import dynamic from 'next/dynamic';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// --- Dynamic component to disable SSR for Recharts (Error Fix) ---
const ChartWrapper = ({ children, width = "100%", height = 300 }) => (
  // Use w-full instead of style={{ width }} as the grid column manages the 1/3 width
  <div className="w-full"> 
    <ResponsiveContainer width="100%" height={height}>
      {children}
    </ResponsiveContainer>
  </div>
);

const ClientOnlyChart = dynamic(() => Promise.resolve(ChartWrapper), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-[300px] w-full">Loading chart...</div>,
});
// --- End Dynamic component ---


export default function DashboardPage() {
  const router = useRouter();
   const [supabase] = useState(() => createClientComponentClient());

  const [aptitudeData, setAptitudeData] = useState([]);
  const [interviewData, setInterviewData] = useState([]);
  const [overallData, setOverallData] = useState([]);
  const [expandedChart, setExpandedChart] = useState(null);

  const [interviewChartData, setInterviewChartData] = useState([]);
  const [aptitudeChartData, setAptitudeChartData] = useState([]);

  const [interviewDomains, setInterviewDomains] = useState([]);
  const [aptitudeTypes, setAptitudeTypes] = useState([]);

  const [interviewFilters, setInterviewFilters] = useState({});
  const [aptitudeFilters, setAptitudeFilters] = useState({});

// --- Data Processing Function (stable via useCallback) ---
  const processData = useCallback((data, typeKey) => {
    const filteredData = data.filter(item => item[typeKey]);
    const types = [...new Set(filteredData.map(item => item[typeKey]))];
    const groupedData = filteredData.reduce((acc, item) => {
      const type = item[typeKey];
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(item.score);
      return acc;
    }, {});

    const chartData = [];
    const maxAttempts = Math.max(...Object.values(groupedData).map(arr => arr.length));

    for (let i = 0; i < maxAttempts; i++) {
      const dataPoint = { attempt: i + 1 };
      types.forEach(type => {
        if (groupedData[type] && groupedData[type][i] !== undefined) {
          dataPoint[type] = groupedData[type][i];
        }
      });
      chartData.push(dataPoint);
    }

    return { chartData, types };
  }, []);
// --- End Data Processing Function ---

// --- Fetch functions (stable via useCallback) ---
  const fetchAptitudeData = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('aptitude')
      .select('type, score')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching aptitude data:', error);
    } else {
      const filteredAptitudeData = data.filter(item => item.type && item.type.toLowerCase() !== 'quantitative');
      
      setAptitudeData(filteredAptitudeData);
      const { chartData, types } = processData(filteredAptitudeData, 'type');
      setAptitudeChartData(chartData);
      setAptitudeTypes(types);
      setAptitudeFilters(types.reduce((acc, type) => ({ ...acc, [type]: true }), {}));
    }
  }, [supabase, processData]);

  const fetchInterviewData = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('avee_interview')
      .select('domain, score')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching interview data:', error);
    } else {
      setInterviewData(data);
      const { chartData, types } = processData(data, 'domain');
      setInterviewChartData(chartData);
      setInterviewDomains(types);
      setInterviewFilters(types.reduce((acc, type) => ({ ...acc, [type]: true }), {}));
    }
  }, [supabase, processData]);
// --- End fetch functions ---


// In DashboardPage.js
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      fetchAptitudeData(session.user.id);
      fetchInterviewData(session.user.id);
    } else {
      router.push("/login");
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}, [router, supabase, fetchAptitudeData, fetchInterviewData]);

  useEffect(() => {
    const newOverallData = [
      { name: 'Interview', score: calculateAverage(interviewData) },
      { name: 'Aptitude', score: calculateAverage(aptitudeData) },
    ];
    setOverallData(newOverallData);
  }, [aptitudeData, interviewData]);

  const calculateAverage = (data) => {
    if (data.length === 0) return 0;
    const total = data.reduce((sum, item) => sum + item.score, 0);
    return total / data.length;
  };

  const handleChartClick = (chartName) => {
    setExpandedChart(expandedChart === chartName ? null : chartName);
  };

  const handleFilterChange = (chart, type) => {
    if (chart === 'interview') {
      setInterviewFilters(prev => ({ ...prev, [type]: !prev[type] }));
    }
    if (chart === 'aptitude') {
      setAptitudeFilters(prev => ({ ...prev, [type]: !prev[type] }));
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/login");
    }
  };

  return (
    <main className="bg-gray-50 p-2 mt-3">
      <Header/>
        <div className="">
          {/* TOP BAR: Leaderboard & Announcement */}
          <div className="flex gap-1 mb-6"> 
            <Leaderboard />
            <div className="w-1/4 min-w-[200px] max-w-[300px]">
                <Announcement />
            </div>
          </div>
        </div>
        
        {/* FIX: This is the three-column layout section to match the Figma image */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> 
        
            {/* 1. Interview Scores (Left Column) */}
            {/* The expansion logic (col-span-3) is complex but necessary if you want single-card expansion */}
            <div className={`transition-all duration-300 ${expandedChart === 'interview' ? 'col-span-3' : expandedChart === 'aptitude' || expandedChart === 'overall' ? 'hidden' : 'col-span-1'}`}>
                <Card className="hover:shadow-lg cursor-pointer h-full">
                    <CardHeader onClick={() => handleChartClick('interview')}>
                        <CardTitle>AI Interview Score</CardTitle> 
                    </CardHeader>
                    <CardContent>
                        {interviewChartData.length > 0 ? (
                            <>
                                <div className="flex flex-wrap gap-4 mb-4">
                                    {interviewDomains.map(domain => (
                                        <div key={domain} className="flex items-center">
                                            <input type="checkbox" checked={interviewFilters[domain]} onChange={() => handleFilterChange('interview', domain)} className="mr-2" />
                                            <span>{domain}</span>
                                        </div>
                                    ))}
                                </div>
                                <ClientOnlyChart height={300}> 
                                    <LineChart data={interviewChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="attempt" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        {interviewDomains.map((domain, i) => (
                                            interviewFilters[domain] && <Line key={domain} type="monotone" dataKey={domain} stroke={COLORS[i % COLORS.length]} activeDot={{ r: 8 }} />
                                        ))}
                                    </LineChart>
                                </ClientOnlyChart>
                            </>
                        ) : (
                            <p>No interview data with domains available to display.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* 2. Aptitude Score (Middle Column) */}
            <div className={`transition-all duration-300 ${expandedChart === 'aptitude' ? 'col-span-3' : expandedChart === 'interview' || expandedChart === 'overall' ? 'hidden' : 'col-span-1'}`}>
                <Card className="hover:shadow-lg cursor-pointer h-full">
                    <CardHeader onClick={() => handleChartClick('aptitude')}>
                        <CardTitle>Aptitude Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {aptitudeChartData.length > 0 ? (
                            <>
                                <div className="flex flex-wrap gap-4 mb-4">
                                    {aptitudeTypes.map(type => (
                                        <div key={type} className="flex items-center">
                                            <input type="checkbox" checked={aptitudeFilters[type]} onChange={() => handleFilterChange('aptitude', type)} className="mr-2" />
                                            <span>{type}</span>
                                        </div>
                                    ))}
                                </div>
                                <ClientOnlyChart height={300}>
                                    <LineChart data={aptitudeChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="attempt" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        {aptitudeTypes.map((type, i) => (
                                            aptitudeFilters[type] && <Line key={type} type="monotone" dataKey={type} stroke={COLORS[i % COLORS.length]} activeDot={{ r: 8 }} />
                                        ))}
                                    </LineChart>
                                </ClientOnlyChart>
                            </>
                        ) : (
                            <p>No aptitude data available to display.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            {/* 3. Overall Score (Right Column) */}
            <div className={`transition-all duration-300 ${expandedChart === 'overall' ? 'col-span-3' : expandedChart ? 'hidden' : 'col-span-1'}`}>
                <Card className="h-full">
                    <CardHeader onClick={() => handleChartClick('overall')}>
                        <CardTitle>Overall Score</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center h-[90%]"> 
                        {/* The original Overall Performance Line Chart goes here, filling the third column */}
                        <ClientOnlyChart height={300}>
                            <LineChart data={overallData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="score" stroke="#ff7300" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ClientOnlyChart>
                    </CardContent>
                </Card>
            </div>
            
        </div>
        
        {/* --- You can optionally add a second row here if needed, but it seems unnecessary based on the Figma image --- */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"> 
          ... (other charts or content)
        </div> */}

    </main>
  );
}