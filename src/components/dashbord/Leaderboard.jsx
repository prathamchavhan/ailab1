// File: components/Leaderboard.js

"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { CardContent } from "@/components/ui/card";

export default function LeaderboardPage() {
  const supabase = createClientComponentClient();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase.rpc('get_user_aptitude_summary');

      if (error) {
        console.error("Error fetching leaderboard:", error);
        
        return;
      }

      setLeaderboard(data);
    };

    fetchLeaderboard();
  }, [supabase]);

  return (

    <main className="p-0"> 
      <p className="text-2xl font-bold mb-3 text-[#09407F]">Leaderboard 🏆</p>
      
       
        <CardContent className="p-0 overflow-x-auto">
        
           <table 
            className="shadow-md w-full table-fixed"
            style={{ 
              background: 'linear-gradient(to bottom, #EAFFFD, #F3FFFE, #FDFFFF)'
            }}
          > 
            <thead>
              <tr className="text-left text-[#152935] font-semibold text-sm">
            
                 <th className="px-3 py-2 w-[80px] text-center"> 
                    <div className="bg-teal-600 text-white px-2 py-1 rounded-lg text-sm font-bold w-fit mx-auto">
                        Rank
                    </div>
                </th>
        
                <th className="px-4 py-2 w-1/4 text-left">
                    <div className="bg-teal-600 text-white px-2 py-1 rounded-lg text-sm font-bold w-fit mr-4">
                        Name
                    </div>
                </th>
                
               
                <th className="px-3 py-2 w-1/4 text-center">
                    <div className="bg-teal-600 text-white text-right px-2 py-1 rounded-lg text-sm font-bold w-fit ml-left">
    College
</div>
                </th>             
                
                {/* Score - Small fixed width */}
                <th className="px-2 py-2 w-[80px] text-center">
                    <div className="bg-teal-600 text-white px-2 py-1 rounded-lg text-sm font-bold w-fit mx-auto">
                        Score
                    </div>
                </th>
                
                {/* Avg. Score - Small fixed width */}
                <th className="px-3 py-2 w-[100px] text-center">
                    <div className="bg-teal-600 text-white px-2 py-1 rounded-lg text-sm font-bold w-fit mx-auto">
                        Avg.Score
                    </div>
                </th>
              </tr>
            </thead>
          <tbody>
              {leaderboard.map((user, index) => (
                <tr key={index} className="border-b text-[#09407F]">
                  <td className="px-3 py-2 font-bold w-[80px] text-center"># {index + 1}</td>
                  
                  {/* FIX: Changed from user.name */}
                  <td className="px-4 py-2 w-1/4 font-medium truncate">{user.user_name}</td> 
                  
                  {/* FIX: Changed from user.clg_name */}
                  <td className="px-4 py-2 w-1/4 text-[15px] font-medium truncate">{user.college_name}</td>                
                  
                  <td className="px-2 py-2 w-[80px] text-center font-medium">{user.total_score}</td>
                  <td className="px-3 py-2 w-[100px] text-center font-medium">{user.avg_score.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      
    </main>
  );
}