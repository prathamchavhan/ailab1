"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const interviewData = [
  { name: 'Round 1', score: 80 },
  { name: 'Round 2', score: 65 },
  { name: 'HR Round', score: 90 },
];

const testData = [
  { name: 'Quiz 1', score: 75 },
  { name: 'Test 1', score: 85 },
  { name: 'Quiz 2', score: 90 },
];

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [aptitudeData, setAptitudeData] = useState([]);
  const [overallData, setOverallData] = useState([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        fetchAptitudeData(user.id);
      }
    };
    checkUser();
  }, [router, supabase]);

  useEffect(() => {
    const newOverallData = [
      { name: 'Interview', score: calculateAverage(interviewData) },
      { name: 'Tests & Quizzes', score: calculateAverage(testData) },
      { name: 'Aptitude', score: calculateAverage(aptitudeData) },
    ];
    setOverallData(newOverallData);
  }, [aptitudeData]);

  const fetchAptitudeData = async (userId) => {
    const { data, error } = await supabase
      .from('aptitude')
      .select('type, score')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching aptitude data:', error);
    } else {
      setAptitudeData(data);
    }
  };

  const calculateAverage = (data) => {
    if (data.length === 0) return 0;
    const total = data.reduce((sum, item) => sum + item.score, 0);
    return total / data.length;
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
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-3 rounded"
        >
          Sign Out
        </button>
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
        <Card>
          <CardHeader>
            <CardTitle>Interview Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Total Attempted: {interviewData.length}</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={interviewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tests & Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Total Attempted: {testData.length}</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={testData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#82ca9d" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aptitude</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Total Attempted: {aptitudeData.length}</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={aptitudeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#ffc658" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}