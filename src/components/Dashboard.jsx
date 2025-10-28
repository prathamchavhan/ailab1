"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function InterviewLeaderboard() {
  const supabase = createClientComponentClient();
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('Inter');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const fetchInterviewLeaderboard = async () => {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error("User not found.");
        setIsLoading(false);
        return;
      }


      const { data, error } = await supabase.rpc('get_interview_leaderboard2', {
        filter_mode: activeTab.toLowerCase(), 
        user_id_param: user.id              
      });

      if (error) {
        console.error("Error fetching interview leaderboard:", error);
        setLeaderboard([]);
      } else {
       
        
        setLeaderboard(data);
      }
      setIsLoading(false);
    };

    fetchInterviewLeaderboard();
  }, [supabase, activeTab]); 

  return (
    <div className="bg-transparent p-6 rounded-lg w-full max-w-md">

      <p className="font-bold text-[#09407F] text-[20px] mb-4">Interview Leaderboard</p>
      

      <div className="flex bg-[#D4F6FA] rounded-lg p-1 mb-4 w-88">
        <button 
          onClick={() => setActiveTab('Inter')}
          className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${
            activeTab === 'Inter' ? 'bg-[#0CA396] text-white shadow' : 'text-[#09407F]'
          }`}  style={{ borderRadius: '8px' }}
        >
          Inter-College
        </button>
        <button
          onClick={() => setActiveTab('Intra')}
          className={`w-1/2 py-2 text-sm font-semibold transition-colors ${
            activeTab === 'Intra' ? 'bg-[#0CA396] text-white shadow' : 'text-[#09407F]'
          }`}
          style={{ borderRadius: '8px' }}
        >
          Intra-College
        </button>
      </div>


      <div 
        className="w-88 rounded-lg p-19 pr-6 pb-4 pt-2 pl-1 shadow-md"
        style={{ background: 'linear-gradient(to bottom, #d0fcf8ff, #eafdfbff, #eefcfcff)' }}
      >
        <table className="w-full border-separate border-spacing-y-2">
    
          <thead>
            <tr>
              <th className="p-2 text-left">
                <div className="bg-[#0CA396] text-white text-[10px] font-bold py-2 px-4 rounded-md inline-block whitespace-nowrap">
                  CANDIDATE PROFILE
                </div>
              </th>
              <th className="p-2 text-center">
                <div className="bg-[#0CA396] text-white text-[11px] font-bold py-2 px-3 rounded-md inline-block">
                  RANK
                </div>
              </th>
              <th className="p-2 text-center">
                <div className="bg-[#0CA396] text-white text-[11px] font-bold py-2 px-3 rounded-md inline-block">
                  SCORE
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="3" className="text-center p-4 text-gray-500">Loading...</td>
              </tr>
            ) : leaderboard.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center p-4 text-gray-500">No data available.</td>
              </tr>
            ) : (
              leaderboard.map((user, index) => (
                <tr key={`${user.display_name}-${index}`} className="border-t border-gray-200">
              
                  {/* --- MODIFIED SECTION --- */}
                  <td className="p-2">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.display_name || 'User'}&background=random`} 
                        alt={user.display_name || 'User'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      {/* Stacks name and college */}
                      <div>
                        <span className="font-medium text-sm text-gray-700">
                          {user.display_name}
                        </span>
                        {/* Shows college name if it exists */}
                        {user.clg_name && (
                          <span className="block text-xs text-gray-500">
                            {user.clg_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* --- END OF MODIFICATION --- */}
            
                  <td className="p-2 text-center font-bold text-sm text-gray-600">
                    # {index + 1}
                  </td>
              
                  <td className="p-2 text-center font-semibold text-sm text-gray-800">
                 
                    {user.average_score ? Number(user.average_score).toFixed(1) : '--'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}