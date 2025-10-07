"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cross } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [aptitudeData, setAptitudeData] = useState([]);
  const [interviewData, setInterviewData] = useState([]);
  const [assessmentData, setAssessmentData] = useState([]);
  const [overallData, setOverallData] = useState([]);
  const [expandedChart, setExpandedChart] = useState(null);

  const [interviewChartData, setInterviewChartData] = useState([]);
  const [assessmentChartData, setAssessmentChartData] = useState([]);
  const [aptitudeChartData, setAptitudeChartData] = useState([]);

  const [interviewDomains, setInterviewDomains] = useState([]);
  const [assessmentTypes, setAssessmentTypes] = useState([]);
  const [aptitudeTypes, setAptitudeTypes] = useState([]);

  const [interviewFilters, setInterviewFilters] = useState({});
  const [assessmentFilters, setAssessmentFilters] = useState({});
  const [aptitudeFilters, setAptitudeFilters] = useState({});

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        fetchAptitudeData(user.id);
        fetchInterviewData(user.id);
        fetchAssessmentsData(user.id);
      }
    };
    checkUser();
  }, [router, supabase]);

  useEffect(() => {
    const newOverallData = [
      { name: 'Interview', score: calculateAverage(interviewData) },
      { name: 'Assessments', score: calculateAverage(assessmentData) },
      { name: 'Aptitude', score: calculateAverage(aptitudeData) },
    ];
    setOverallData(newOverallData);
  }, [aptitudeData, interviewData, assessmentData]);

  const processData = (data, typeKey) => {
    console.log(`[processData for ${typeKey}] Raw data:`, data);
    const filteredData = data.filter(item => item[typeKey]);
    console.log(`[processData for ${typeKey}] Filtered data:`, filteredData);
    const types = [...new Set(filteredData.map(item => item[typeKey]))];
    console.log(`[processData for ${typeKey}] Types:`, types);
    const groupedData = filteredData.reduce((acc, item) => {
      const type = item[typeKey];
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(item.score);
      return acc;
    }, {});
    console.log(`[processData for ${typeKey}] Grouped data:`, groupedData);

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
    console.log(`[processData for ${typeKey}] Chart data:`, chartData);

    return { chartData, types };
  };

  const fetchAptitudeData = async (userId) => {
    const { data, error } = await supabase
      .from('aptitude')
      .select('type, score')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching aptitude data:', error);
    } else {
      setAptitudeData(data);
      const { chartData, types } = processData(data, 'type');
      setAptitudeChartData(chartData);
      setAptitudeTypes(types);
      setAptitudeFilters(types.reduce((acc, type) => ({ ...acc, [type]: true }), {}));
    }
  };

  const fetchInterviewData = async (userId) => {
    const { data, error } = await supabase
      .from('avee_interview')
      .select('domain, score')
      .eq('user_id', userId);
    console.log('[fetchInterviewData] Raw data from Supabase:', data);

    if (error) {
      console.error('Error fetching interview data:', error);
    } else {
      setInterviewData(data);
      const { chartData, types } = processData(data, 'domain');
      setInterviewChartData(chartData);
      setInterviewDomains(types);
      setInterviewFilters(types.reduce((acc, type) => ({ ...acc, [type]: true }), {}));
    }
  };

  const fetchAssessmentsData = async (userId) => {
    const { data, error } = await supabase
      .from('assignment')
      .select('*, subject:subject_id(name)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching assessments data:', error);
    } else {
      const formattedData = data.map(item => ({ ...item, type: item.subject.name }));
      setAssessmentData(formattedData);
      const { chartData, types } = processData(formattedData, 'type');
      setAssessmentChartData(chartData);
      setAssessmentTypes(types);
      setAssessmentFilters(types.reduce((acc, type) => ({ ...acc, [type]: true }), {}));
    }
  };

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
    if (chart === 'assessment') {
      setAssessmentFilters(prev => ({ ...prev, [type]: !prev[type] }));
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
    <main className="bg-[#F4F5F9] p-4">
        <div className="flex justify-between items-center mb-4">
  <h1 className="text-2xl font-bold">Student Performance</h1>
  <div className="flex gap-4">
    <button
      onClick={() => router.push("/leaderboard")}
      className="bg-blue-600 text-white px-6 py-3 rounded"
    >
      View Leaderboard
    </button>
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-6 py-3 rounded"
    >
      Sign Out
    </button>
  </div>
</div>
      <div className="grid grid-cols-1 gap-6 mb-6">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={overallData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#ff7300" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          className={`transition-all duration-300 ${expandedChart === 'interview' ? 'col-span-full' : expandedChart ? 'hidden' : 'col-span-1'}`}
        >
          <Card className="hover:shadow-lg cursor-pointer">
            <CardHeader onClick={() => handleChartClick('interview')}>
              <CardTitle>Interview Scores</CardTitle>
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
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={interviewChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="attempt" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {interviewDomains.map((domain, i) => (
                        interviewFilters[domain] && <Line key={domain} type="monotone" dataKey={domain} stroke={COLORS[i % COLORS.length]} activeDot={{ r: 8 }} />
                      ))}
                      <Cross stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <p>No interview data with domains available to display.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div
          className={`transition-all duration-300 ${expandedChart === 'assessment' ? 'col-span-full' : expandedChart ? 'hidden' : 'col-span-1'}`}
        >
          <Card className="hover:shadow-lg cursor-pointer">
            <CardHeader onClick={() => handleChartClick('assessment')}>
              <CardTitle>Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              {assessmentChartData.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-4 mb-4">
                    {assessmentTypes.map(type => (
                      <div key={type} className="flex items-center">
                        <input type="checkbox" checked={assessmentFilters[type]} onChange={() => handleFilterChange('assessment', type)} className="mr-2" />
                        <span>{type}</span>
                      </div>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={assessmentChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="attempt" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {assessmentTypes.map((type, i) => (
                        assessmentFilters[type] && <Line key={type} type="monotone" dataKey={type} stroke={COLORS[i % COLORS.length]} activeDot={{ r: 8 }} />
                      ))}
                      <Cross stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <p>No assessment data available to display.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div
          className={`transition-all duration-300 ${expandedChart === 'aptitude' ? 'col-span-full' : expandedChart ? 'hidden' : 'col-span-1'}`}
        >
          <Card className="hover:shadow-lg cursor-pointer">
            <CardHeader onClick={() => handleChartClick('aptitude')}>
              <CardTitle>Aptitude</CardTitle>
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
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={aptitudeChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="attempt" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {aptitudeTypes.map((type, i) => (
                        aptitudeFilters[type] && <Line key={type} type="monotone" dataKey={type} stroke={COLORS[i % COLORS.length]} activeDot={{ r: 8 }} />
                      ))}
                      <Cross stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <p>No aptitude data available to display.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}