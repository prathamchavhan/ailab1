"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LeaderboardPage() {
  const supabase = createClientComponentClient();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from("aptitude")
        .select(`
          score,
          user_id,
          profiles!inner (
            id,
            name,
            roll_no,
            department_id
          )
        `);

      if (error) {
        console.error("Error fetching leaderboard:", error);
        return;
      }

      // 🔹 Aggregate scores by user
      const userScores = {};
      data.forEach((row) => {
        const uid = row.user_id;
        if (!userScores[uid]) {
          userScores[uid] = {
            name: row.profiles?.name || "Unknown",
            roll_no: row.profiles?.roll_no || "-",
            dept: row.profiles?.department_id || "-", // dept_id for now
            totalScore: 0,
            attempts: 0,
          };
        }
        userScores[uid].totalScore += row.score;
        userScores[uid].attempts += 1;
      });

      // 🔹 Convert to array + calculate avg
      const leaderboardArray = Object.values(userScores).map((u) => ({
        ...u,
        avgScore: u.attempts > 0 ? u.totalScore / u.attempts : 0,
      }));

      // 🔹 Sort by total score (highest first)
      leaderboardArray.sort((a, b) => b.totalScore - a.totalScore);

      setLeaderboard(leaderboardArray);
    };

    fetchLeaderboard();
  }, [supabase]);

  return (
    <main className="bg-[#F4F5F9] p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Leaderboard 🏆</h1>
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3">Rank</th>
                <th className="p-3">Name</th>
                <th className="p-3">Roll No</th>
                <th className="p-3">Dept</th>
                <th className="p-3">Total Score</th>
                <th className="p-3">Attempts</th>
                <th className="p-3">Avg. Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user, index) => (
                <tr key={index} className="border-b hover:bg-gray-100">
                  <td className="p-3 font-bold">{index + 1}</td>
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.roll_no}</td>
                  <td className="p-3">{user.dept}</td>
                  <td className="p-3">{user.totalScore}</td>
                  <td className="p-3">{user.attempts}</td>
                  <td className="p-3">{user.avgScore.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </main>
  );
}
