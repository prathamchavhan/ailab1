"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useUserProfile } from "@/app/hooks/useUserProfile";


const embeddedCSS = `
.progress-circle {
    --circle-diameter: 44px;
    --inner-circle-diameter: 50px;
    --border-width: 3px;
    --progress-ring-width: 4px;
    --offset-x: -18px;
    width: var(--circle-diameter);
    height: var(--circle-diameter);
    left: var(--offset-x);
    top: 50%;
    transform: translateY(-50%);
    position: absolute;
    border-radius: 50%;
    display: flex; 
    justify-content: center;
    align-items: center;
    z-index: 10; 
    background: 
        radial-gradient(circle closest-side, white calc(100% - var(--border-width) - 1px), transparent calc(100% - var(--border-width))),
        var(--outer-border-gradient); 
    background-origin: border-box;
    background-clip: content-box, border-box;
}
.progress-circle::before {
    content: attr(data-content); 
    position: absolute;
    width: var(--inner-circle-diameter); 
    height: var(--inner-circle-diameter);
    border-radius: 50%;
    --progress-deg: calc(3.6deg * var(--score-percentage));
    background: 
        radial-gradient(circle closest-side, white calc(100% - var(--progress-ring-width)), transparent calc(100% - var(--progress-ring-width) + 1px)),
        conic-gradient(var(--progress-fill-gradient) 0deg var(--progress-deg), rgba(255, 255, 255, 0.4) var(--progress-deg) 360deg);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.9em; 
    font-weight: 700;
    color: black;
    z-index: 20; 
}
`;


const calculateAverageScore = (results) => {
  if (!results || results.length === 0) return 0;
  const total = results.reduce((sum, r) => sum + r.score, 0);
  return Math.round(total / results.length);
};

export default function Header() {

  const { user, userName, avatarUrl, collegeName, loading: userLoading } = useUserProfile();


  const [interviewAvgScore, setInterviewAvgScore] = useState(null);
  const [overallAvgScore, setOverallAvgScore] = useState(null);
  const [totalJobs, setTotalJobs] = useState(null);


  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();


  useEffect(() => {
    const fetchScoresAndStats = async (currentUser) => {
   
      if (!currentUser) {
        setInterviewAvgScore(null);
        setOverallAvgScore(null);
        setTotalJobs(null);
        return;
      }

 
      const { data: interviewResults } = await supabase
        .from("interview_results")
        .select(`final_score, interview_sessions!inner(user_id)`)
        .eq("interview_sessions.user_id", currentUser.id);
      
      const interviewScores =
        interviewResults?.map((r) => ({ score: r.final_score })) || [];
      const avgInterview = calculateAverageScore(interviewScores);
      setInterviewAvgScore(avgInterview);

      const { data: aptitudeResults } = await supabase
        .from("aptitude")
        .select(`score`)
        .eq("user_id", currentUser.id);
      
      const aptitudeScores =
        aptitudeResults?.map((r) => ({ score: r.score })) || [];
      const allScores = [...interviewScores, ...aptitudeScores];
      const avgOverall = calculateAverageScore(allScores);
      setOverallAvgScore(avgOverall);


      const { count, error: jobsError } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true });

      if (jobsError) {
        console.error("Error fetching job count:", jobsError);
        setTotalJobs(0);
      } else {
        setTotalJobs(count);
      }
    };
    
 
    fetchScoresAndStats(user);

  }, [user, supabase]);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };


  const overallContent =
    overallAvgScore !== null
      ? `${
          Number.isInteger(overallAvgScore)
            ? overallAvgScore
            : overallAvgScore.toFixed(0)
        }%`
      : "0%";

  return (
    <header className="px-2 pt-2">
      <style dangerouslySetInnerHTML={{ __html: embeddedCSS }} />
      <div className="mt-1 flex justify-between items-center bg-[#1D3540] text-white px-4 py-4 rounded-[20px] ">
  
        <div className="flex items-center gap-4 relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-center bg-[#2DC7DB] text-white font-bold shadow-md text-lg hover:brightness-110 transition"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              overflow: 'hidden',
            }}
            disabled={userLoading} 
          >
         
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover', 
                }}
              />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute top-12 left-0 w-40 bg-white rounded-lg shadow-lg py-2 z-50">
          
              {user ? (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Login
                </button>
              )}
            </div>
          )}

      <div className="leading-tight">
          <div style={{ lineHeight: '1' }}> 
            <p 
              className="text-xl font-semibold whitespace-nowrap" 
              style={{ margin: 0 }} 
            >
              Hi, <span className="font-bold ">{userName}</span> 👋
            </p>
            
            {collegeName && (
        <p className="text-xs text-gray-300 font-medium whitespace-nowrap m-0 ml-3">
                {collegeName}
              </p>
            )}
          </div>
        </div>
        {/* ✅ MODIFIED: Added 'text-right' to align the text, removed 'ml-1' */}
          {/* <div className="leading-tight"> 
            <p className="text-xl font-semibold whitespace-nowrap m-0"> 
              Hi, <span className="font-bold ">{userName}</span> 👋
            </p>
            
            {collegeName && (
              <p className="text-xs text-gray-300 font-medium whitespace-nowrap m-0 text-right"> 
                {collegeName}
              </p>
            )}
          </div> */}
</div>
       
        <div className="flex items-center gap-10">
          <div className="relative">
            <Bell className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform" />
          </div>
          
          <div className="flex items-center gap-8">
            
          
            {totalJobs !== null && (
              <div
                className="relative flex items-center h-[40px] w-[119px] rounded-lg pr-4 pl-10 shadow-md"
                style={{ background: "linear-gradient(90deg, #ed7c31ff, #ed994aff)" }}
              >
                <div
                  className="progress-circle"
                  style={{
                    "--score-percentage": 100, 
                    "--outer-border-gradient": "linear-gradient(45deg, #e47d1dff, #E0E0E0)",
                    "--progress-fill-gradient": "linear-gradient(45deg, #07C8A1, #33386C)",
                  }}
                  data-content={totalJobs}
                ></div>
                <span className="ml-auto text-[11px] font-medium text-white whitespace-nowrap">
                  Total Jobs
                </span>
              </div>
            )}
            
           
            {overallAvgScore !== null && (
              <div
                className="relative flex items-center h-[40px] w-[119px] rounded-lg pr-4 pl-10 shadow-md"
                style={{ background: "linear-gradient(90deg, #1B9E8C, #4B62E5)" }}
              >
                <div
                  className="progress-circle"
                  style={{
                    "--score-percentage": overallAvgScore,
                    "--outer-border-gradient":
                      "linear-gradient(45deg, #FFFFFF, #E0E0E0)",
                    "--progress-fill-gradient":
                      "linear-gradient(45deg, #07C8A1, #33386C)",
                  }}
                  data-content={overallContent}
                ></div>
                <span className="ml-auto text-[11px] font-medium text-white whitespace-nowrap">
                  Student Score
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}