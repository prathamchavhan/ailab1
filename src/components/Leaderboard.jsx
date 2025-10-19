"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LeaderboardPage() {
  const supabase = createClientComponentClient();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase.rpc('get_leaderboard4');

      if (error) {
        console.error("Error fetching leaderboard:", error);
        return;
      }

      setLeaderboard(data);
    };

    fetchLeaderboard();
  }, [supabase]);

  return (
    <main className=" p-4 min-h-screen">
      <p className="text-2xl font-bold mb-6 text-[#09407F]">Leaderboard 🏆</p>
      
       
        <CardContent className="">
          {/* Increased min-width here to expand the table */}
           <table 
            className="shadow-md"
            style={{ 
              background: 'linear-gradient(to bottom, #EAFFFD, #F3FFFE, #FDFFFF)'
            }}
          > 
            <thead>
              <tr className="text-left text-[#152935] font-semibold text-sm">
                 {/* Rank - Wide Gap */}
                 <th className="px-6 py-2 w-[100px] text-center">
                    <div className="bg-teal-600 text-white px-3 py-1 rounded-lg text-sm font-bold w-fit mr-6">
                        Rank
                    </div>
                </th>
                {/* Name - Wide Gap */}
                <th className="px-6 py-2 w-[150px] text-left">
                    <div className="bg-teal-600 text-white px-3 py-1 rounded-lg text-sm font-bold w-fit mr-6">
                        Name
                    </div>
                </th>
                
                {/* college - Narrow Gap (px-4 and mr-3) */}
                <th className="px-4 py-2 w-[200px] text-center">
                    <div className="bg-teal-600 text-white px-3 py-1 rounded-lg text-sm font-bold w-fit mr-3">
                        college
                    </div>
                </th>             
                
                {/* Total Score - Narrow Padding (px-4) but Wide Margin before Avg. Score */}
                <th className="px-4 py-2 w-[120px] text-center">
                    <div className="bg-teal-600 text-white px-3 py-1 rounded-lg text-sm font-bold w-fit mr-6">
                        Score
                    </div>
                </th>
                
                {/* Avg. Score - Wide Padding */}
                <th className="px-6 py-2 w-[130px] text-center">
                    <div className="bg-teal-600 text-white px-3 py-1 rounded-lg text-sm font-bold w-fit">
                        Avg.Score
                    </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user, index) => (
                <tr key={index} className="border-b text-[#09407F]">
                  {/* Data Cells match header padding */}
                  <td className="px-6 py-2 font-bold w-[100px] text-center"># {index + 1}</td> 
                  <td className="px-6 py-2 w-[150px] font-medium">{user.name}</td>
                  
                  {/* college Data - Narrow Padding */}
                  <td className="px-4 py-2 w-[200px] text-[15px] font-medium">{user.clg_name}</td>                
                  
                  {/* Total Score Data - Narrow Padding */}
                  <td className="px-1 py-2 w-[200px] text-center font-medium">{user.total_score}</td>
                  <td className="px-6 py-2 w-[130px] text-center font-medium">{user.avg_score.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      
    </main>
  );
}