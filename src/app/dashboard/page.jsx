"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Interview Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Total Attempted: {interviewData.length}</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={interviewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#8884d8" />
              </BarChart>
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
              <BarChart data={testData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#82ca9d" />
              </BarChart>
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
              <BarChart data={aptitudeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}