// // File: components/Leaderboard.js

// "use client";
// import { useEffect, useState } from "react";
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// import { CardContent } from "@/components/ui/card";

// export default function LeaderboardPage() {
//   const supabase = createClientComponentClient();
//   const [leaderboard, setLeaderboard] = useState([]);

//   useEffect(() => {
//     const fetchLeaderboard = async () => {
//       const { data, error } = await supabase.rpc('get_user_aptitude_summary');

//       if (error) {
//         console.error("Error fetching leaderboard:", error);
        
//         return;
//       }

//       setLeaderboard(data);
//     };

//     fetchLeaderboard();
//   }, [supabase]);

//   return (

//     <main className="p-0"> 
//       <p className="text-2xl font-bold mb-3 text-[#09407F]">Leaderboard 🏆</p>
      
       
//         <CardContent className="p-0 overflow-x-auto">
        
//            <table 
//             className="shadow-md w-full table-fixed"
//             style={{ 
//               background: 'linear-gradient(to bottom, #EAFFFD, #F3FFFE, #FDFFFF)'
//             }}
//           > 
//             <thead>
//               <tr className="text-left text-[#152935] font-semibold text-sm">
            
//                  <th className="px-3 py-2 w-[80px] text-center"> 
//                     <div className="bg-teal-600 text-white px-2 py-1 rounded-lg text-sm font-bold w-fit mx-auto">
//                         Rank
//                     </div>
//                 </th>
        
//                 <th className="px-4 py-2 w-1/4 text-left">
//                     <div className="bg-teal-600 text-white px-2 py-1 rounded-lg text-sm font-bold w-fit mr-4">
//                         Name
//                     </div>
//                 </th>
                
               
//                 <th className="px-3 py-2 w-1/4 text-center">
//                     <div className="bg-teal-600 text-white text-right px-2 py-1 rounded-lg text-sm font-bold w-fit ml-left">
//     College
// </div>
//                 </th>             
                
//                 {/* Score - Small fixed width */}
//                 <th className="px-2 py-2 w-[80px] text-center">
//                     <div className="bg-teal-600 text-white px-2 py-1 rounded-lg text-sm font-bold w-fit mx-auto">
//                         Score
//                     </div>
//                 </th>
                
//                 {/* Avg. Score - Small fixed width */}
//                 <th className="px-3 py-2 w-[100px] text-center">
//                     <div className="bg-teal-600 text-white px-2 py-1 rounded-lg text-sm font-bold w-fit mx-auto">
//                         Avg.Score
//                     </div>
//                 </th>
//               </tr>
//             </thead>
//           <tbody>
//               {leaderboard.map((user, index) => (
//                 <tr key={index} className="border-b text-[#09407F]">
//                   <td className="px-3 py-2 font-bold w-[80px] text-center"># {index + 1}</td>
                  
//                   {/* FIX: Changed from user.name */}
//                   <td className="px-4 py-2 w-1/4 font-medium truncate">{user.user_name}</td> 
                  
//                   {/* FIX: Changed from user.clg_name */}
//                   <td className="px-4 py-2 w-1/4 text-[15px] font-medium truncate">{user.college_name}</td>                
                  
//                   <td className="px-2 py-2 w-[80px] text-center font-medium">{user.total_score}</td>
//                   <td className="px-3 py-2 w-[100px] text-center font-medium">{user.avg_score.toFixed(2)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </CardContent>
      
//     </main>
//   );
// }
// File: components/Leaderboard.js

"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Stub for CardContent
const CardContent = ({ children, className, ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

// Helper function to generate initials
const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
};

export default function LeaderboardPage() {
  const [supabase] = useState(() => createClientComponentClient());
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!supabase) return; 

      const { data, error } = await supabase.rpc('profileleaderboard2');

      if (error) {
        console.error("Error fetching leaderboard:", error);
      } else {
        setLeaderboard(data || []); 
      }
    };

    fetchLeaderboard();
  }, [supabase]); 

  return (
    <main className="p-0">
      <p className="text-2xl font-bold mb-3 text-[#09407F]">Leaderboard 🏆</p>
      
      {/* Width decrease & left shift:
        - Used max-w-3xl for a noticeable width decrease.
        - Used ml-0 mr-auto to pin the table to the left (instead of mx-auto for centering).
      */}
      <div className="max-w-3xl ml-0 mr-auto"> 
        <CardContent className="p-0 overflow-x-auto">
          <table
            className="w-full border-collapse"
style={{
              background: 'linear-gradient(to bottom, #EAFFFD, #F3FFFE, #FDFFFF)',
              borderSpacing: 0,
              tableLayout: 'auto',
              // DARKEST SHADOW: Increased vertical offset (18px) and opacity (0.8) for a heavy, dark bottom shadow.
              boxShadow: '0 18px 25px -12px rgba(0, 0, 0, 0.8)' 
            }}
          >
            <thead>
              <tr className="text-left text-[#152935] font-semibold text-sm">
                
                {/* Rank */}
                <th className="py-2 px-2 whitespace-nowrap">
                  <div className="bg-teal-600 text-white px-2 py-1 rounded-lg text-sm font-bold w-fit">
                    Rank
                  </div>
                </th>

                {/* Candidate Profile */}
                <th className="py-2 text-left" style={{ paddingLeft: '1rem', paddingRight: '0.5rem' }}>
                  <div className="bg-teal-600 text-white px-2 py-1 rounded-lg text-sm font-bold w-fit whitespace-nowrap">
                    Candidate Profile
                  </div>
                </th>

                {/* College */}
                <th className="py-1" style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
                  <div className="bg-teal-600 text-white py-1 px-3 rounded-lg text-sm font-bold w-fit whitespace-nowrap">
                    College
                  </div>
                </th>

                {/* Score */}
                <th className="py-2 px-2 whitespace-nowrap">
                  <div className="bg-teal-600 text-white px-2 py-1 rounded-lg text-sm font-bold w-fit">
                    Score
                  </div>
                </th>

                {/* Avg. Score */}
                <th className="py-2 px-2 whitespace-nowrap">
                  <div className="bg-teal-600 text-white px-2 py-1 rounded-lg text-sm font-bold w-fit">
                    Avg. Score
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              
              {leaderboard && leaderboard.map((user, index) => (
                <tr key={index} className="text-[#09407F]">
                  
                  {/* Rank */}
                  <td className="py-2 font-bold text-center px-2"># {index + 1}</td>
                  
                  {/* Candidate Profile: Ensure truncation on name */}
                  <td className="py-2 font-medium" style={{ paddingLeft: '1rem', paddingRight: '0.5rem' }}>
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={user.avatar_url || `https://placehold.co/40x40/E0E0E0/999999?text=${getInitials(user.name)}`}
                        alt={user.name || 'Avatar'}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        onError={(e) => {
                          e.target.src = `https://placehold.co/40x40/E0E0E0/999999?text=${getInitials(user.name)}`;
                        }}
                      />
                      {/* Flex-1 and min-w-0 on a child is often needed with truncate in a flex container */}
                      <span className="truncate flex-1 min-w-0">{user.name}</span>
                    </div>
                  </td>
                  
                  {/* College: Ensure truncation */}
                  <td className="py-1 text-[15px] font-medium" style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
                    <span className="truncate block">{user.clg_name}</span>
                  </td>
                  
                  {/* Score */}
                  <td className="py-2 text-center font-medium px-2">{user.combined_total_score}</td>
                  
                  {/* Avg. Score */}
                  <td className="py-2 text-center font-medium px-2">
                    {user.combined_avg_score ? user.combined_avg_score.toFixed(2) : '0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </div>
    </main>
  );
}