"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// --- Embedded CSS (unchanged) ---
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

// ✅ ADDED: Helper function to calculate scores
const calculateAverageScore = (results) => {
  if (!results || results.length === 0) return 0;
  const total = results.reduce((sum, r) => sum + r.score, 0);
  return Math.round(total / results.length);
};

export default function Header() {
  const [user, setUser] = useState(null);
  const [totalNews, setTotalNews] = useState(null);
  const [userName, setUserName] = useState("Guest");
  const [avatarUrl, setAvatarUrl] = useState(null);
  // ✅ ADDED: State for score and college
  const [overallAvgScore, setOverallAvgScore] = useState(null);
  const [collegeName, setCollegeName] = useState(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUserDataAndStats = async (currentUser = null) => {
      if (!currentUser) {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          setUser(null);
          setUserName("Guest");
          setAvatarUrl(null);
          // ✅ ADDED: Reset new state
          setTotalNews(null);
          setCollegeName(null);
          setOverallAvgScore(null);
          return;
        }
        currentUser = data.user;
      }
      setUser(currentUser);

      // ✅ CHANGED: Fetch profile, avatar, AND college name
      // Using .limit(1) and [0] to prevent "coerce" error from duplicates
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("name, avatar_url, College(clg_name)") // Added college
        .eq("user_id", currentUser.id)
        .limit(1); // Safer than .single()

      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
      }
      
      const profile = profiles?.[0]; // Safely get the first profile

      // Set Profile Info
      if (profile?.name) setUserName(profile.name);
      else if (currentUser.user_metadata?.full_name)
        setUserName(currentUser.user_metadata.full_name);
      else setUserName(currentUser.email?.split("@")[0] || "User");
      
      setAvatarUrl(profile?.avatar_url || null);
      setCollegeName(profile?.College?.clg_name || null); // Set college name

      // --- News count logic (unchanged) ---
      const { count, error: newsError } = await supabase
        .from("news")
        .select("*", { count: "exact", head: true });

      if (newsError) {
        console.error("Error fetching news count:", newsError);
        setTotalNews(0);
      } else {
        setTotalNews(count);
      }

      // ✅ ADDED: Score fetching logic
      const { data: interviewResults } = await supabase
        .from("interview_results")
        .select(`final_score, interview_sessions!inner(user_id)`)
        .eq("interview_sessions.user_id", currentUser.id);

      const interviewScores =
        interviewResults?.map((r) => ({ score: r.final_score })) || [];

      const { data: aptitudeResults } = await supabase
        .from("aptitude")
        .select(`score`)
        .eq("user_id", currentUser.id);

      const aptitudeScores =
        aptitudeResults?.map((r) => ({ score: r.score })) || [];
      
      const allScores = [...interviewScores, ...aptitudeScores];
      const avgOverall = calculateAverageScore(allScores);
      setOverallAvgScore(avgOverall);
    };

    fetchUserDataAndStats();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        fetchUserDataAndStats(session.user);
      } else {
        // ✅ ADDED: Reset all state on logout
        setUser(null);
        setUserName("Guest");
        setTotalNews(null);
        setAvatarUrl(null);
        setCollegeName(null);
        setOverallAvgScore(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // --- Format News ---
  const newsCount = totalNews ?? 0;
  const newsContent = newsCount;
  
  // ✅ ADDED: Format Score
  const overallAvg = overallAvgScore ?? 0;
  const overallContent = `${
    Number.isInteger(overallAvg) ? overallAvg : overallAvg.toFixed(0)
  }%`;

  return (
    <header className="px-4 pt-2">
      <style dangerouslySetInnerHTML={{ __html: embeddedCSS }} />
      <div className="mt-2 flex justify-between items-center bg-[#1D3540] text-white px-4 py-7 rounded-[20px] ">
        {/* Left Section */}
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
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute top-12 left-0 w-40 bg-white rounded-lg shadow-lg py-2 z-50">
              {user ? (
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Logout
                </button>
              ) : (
                <button onClick={() => router.push("/login")} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Login
                </button>
              )}
            </div>
          )}
          
          {/* ✅ CHANGED: Added div for name + college name with alignment */}
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

        {/* --- Right Section --- */}
        <div className="flex items-center gap-10">
          <div className="relative">
            <Bell className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform" />
          </div>

          {/* ✅ CHANGED: Wrapper for BOTH cards */}
          <div className="flex items-center gap-8">
            
            {/* News Card */}
            {totalNews !== null && (
              <div
                className="relative flex items-center h-[40px] w-[119px] rounded-lg pr-4 pl-10 shadow-md"
                style={{ background: "linear-gradient(90deg, #81e3d6ff, #264741ff)" }}
              >
                <div
                  className="progress-circle"
                  style={{
                    "--score-percentage": 100, 
                    "--outer-border-gradient":
                      "linear-gradient(45deg, #2d3f3bff, #E0E0E0)",
                    "--progress-fill-gradient":
                      "linear-gradient(45deg, #07C8A1, #33386C)",
                  }}
                  data-content={newsContent} 
                ></div>
                <span className="ml-auto text-[11px] font-medium text-white whitespace-nowrap">
                News
                </span>
              </div>
            )}

            {/* Student Score Card */}
            {overallAvgScore !== null && (
              <div
                className="relative flex items-center h-[40px] w-[119px] rounded-lg pr-4 pl-10 shadow-md"
                style={{ background: "linear-gradient(90deg, #1B9E8C, #4B62E5)" }}
              >
                <div
                  className="progress-circle"
                  style={{
                    "--score-percentage": overallAvg, // Use score variable
                    "--outer-border-gradient":
                      "linear-gradient(45deg, #FFFFFF, #E0E0E0)",
                    "--progress-fill-gradient":
                      "linear-gradient(45deg, #07C8A1, #33386C)",
                  }}
                  data-content={overallContent} // Use score content
                ></div>
                <span className="ml-auto text-[11px] font-medium text-white whitespace-nowrap">
                  Student Score {/* Changed label */}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}