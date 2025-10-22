"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserProfile } from "@/app/hooks/useUserProfile";
import { useStudentScores } from "@/app/hooks/useStudentScores"; 


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


export default function Header() {
  
  const { user, userName, avatarUrl, collegeName, loading: userLoading } = useUserProfile();


  const { overallAvgScore, loading: scoreLoading } = useStudentScores(user);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();


  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

 
  const overallAvg = overallAvgScore ?? 0; 
  const overallContent = `${
    Number.isInteger(overallAvg) ? overallAvg : overallAvg.toFixed(0)
  }%`;

  return (
    <header className="px-4 pt-2">
      <style dangerouslySetInnerHTML={{ __html: embeddedCSS }} />
      <div className="mt-2 flex justify-between items-center bg-[#1D3540] text-white px-4 py-7 rounded-[20px] ">
        
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
{/* 
          <div className="leading-tight"> 
            <p className="text-xl font-semibold whitespace-nowrap m-0">
              Hi, <span className="font-bold ">{userName}</span> 👋
            </p>
            
            {collegeName && (
              <p className="text-xs text-gray-300 font-medium whitespace-nowrap m-0 text-right">
                {collegeName}
              </p>
            )}
          </div> */}
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
        </div>

      
        <div className="flex items-center gap-10">
          <div className="relative">
            <Bell className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform" />
          </div>
          
        
          {!scoreLoading && overallAvgScore !== null && (
            <div className="flex items-center">
              <div
                className="relative flex items-center h-[40px] w-[119px] rounded-lg pr-4 pl-10 shadow-md"
                style={{ background: "linear-gradient(90deg, #1B9E8C, #4B62E5)" }}
              >
                <div
                  className="progress-circle"
                  style={{
                    "--score-percentage": overallAvg,
                    "--outer-border-gradient":
                      "linear-gradient(45deg, #FFFFFF, #E0E8E0)",
                    "--progress-fill-gradient":
                      "linear-gradient(45deg, #07C8A1, #33386C)",
                  }}
                  data-content={overallContent}
                ></div>
                <span className="ml-auto text-[11px] font-medium text-white whitespace-nowrap">
                  Student Score
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}