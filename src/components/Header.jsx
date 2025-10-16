"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// --- Embedded CSS ---
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
  const [user, setUser] = useState(null);
  const [latestResult, setLatestResult] = useState(null);
  const [averageScore, setAverageScore] = useState(null);
  const [userName, setUserName] = useState("Guest");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUserAndScores = async (currentUser = null) => {
      if (!currentUser) {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          // Don't redirect automatically - let user stay on page but show login prompt
          setUser(null);
          setUserName("Guest");
          return;
        }
        currentUser = data.user;
      }

      setUser(currentUser);

      // 🧍‍♂️ Fetch profile name
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", currentUser.id)
        .single();

      if (profile?.name) setUserName(profile.name);
      else if (currentUser.user_metadata?.full_name)
        setUserName(currentUser.user_metadata.full_name);
      else setUserName(currentUser.email?.split("@")[0] || "User");

      // 🧠 Latest score
      const { data: latestResults } = await supabase
        .from("interview_results")
        .select(`final_score, created_at, interview_sessions!inner(user_id)`)
        .eq("interview_sessions.user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (latestResults && latestResults.length > 0) {
        setLatestResult(latestResults[0]);
      }

      // 📊 Average score
      const { data: allResults } = await supabase
        .from("interview_results")
        .select(`final_score, interview_sessions!inner(user_id)`)
        .eq("interview_sessions.user_id", currentUser.id);

      if (allResults?.length > 0) {
        const avg =
          allResults.reduce((sum, r) => sum + r.final_score, 0) /
          allResults.length;
        setAverageScore(Math.round(avg));
      }
    };

    // Initial fetch
    fetchUserAndScores();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchUserAndScores(session.user);
      } else {
        setUser(null);
        setUserName("Guest");
        setLatestResult(null);
        setAverageScore(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Default values if not fetched
  const interviewScore = latestResult?.final_score ?? 76;
  const profileScore = averageScore ?? 55;

  const interviewContent = Number.isInteger(interviewScore)
    ? interviewScore.toString()
    : interviewScore.toFixed(2);

  const profileContent = `${
    Number.isInteger(profileScore) ? profileScore : profileScore.toFixed(0)
  }%`;

  return (
    <header className="px-4 pt-2">
      <style dangerouslySetInnerHTML={{ __html: embeddedCSS }} />
      <div className="mt-2 flex justify-between items-center bg-[#1D3540] text-white px-4 py-7 rounded-[20px] ">
        {/* ✅ Left Section — Avatar + Name + Logout */}
        <div className="flex items-center gap-4 relative">
          {/* 🟢 Clickable avatar */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-[#2DC7DB] text-white font-bold shadow-md text-lg hover:brightness-110 transition"
          >
            {userName.charAt(0).toUpperCase()}
          </button>

          {/* Dropdown */}
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

          {/* Greeting */}
          <p className="text-xl font-semibold whitespace-nowrap">
            Hi, <span className="font-bold ">{userName}</span> 👋
          </p>
        </div>

        {/* ✅ Right Section */}
        <div className="flex items-center gap-10">
          {/* Notification Icon */}
          <div className="relative">
            <Bell className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform" />
          </div>

          {/* Score Cards */}
          <div className="flex items-center gap-8">
            {/* Interview Score */}
            <div
                className="relative flex items-center h-[40px] w-[119px] rounded-lg pr-2 pl-10 shadow-md"
                style={{ background: "linear-gradient(90deg, #404478, #9041AA)" }}
              >
                <div
                  className="progress-circle"
                  style={{
                    "--outer-border-gradient": "linear-gradient(45deg, #ffffffff, #ffffffff)", // Light blue outer ring
                    "--progress-fill-gradient": "linear-gradient(45deg, #51e6dd, #c02ffc)", // Pink-blue inner progress
                  }}
                  data-content={interviewContent}
                ></div>
                <span className="ml-auto text-[10px] font-medium text-white whitespace-nowrap">
                  Interview Score
                </span>
              </div>

            {/* Profile Score */}
            <div
                className="relative flex items-center h-[40px] w-[119px] rounded-lg pr-2 pl-10 shadow-md"
                style={{ background: "linear-gradient(90deg, #1B9E8C, #4B62E5)" }}
              >
                <div
                  className="progress-circle"
                  style={{
                    "--outer-border-gradient": "linear-gradient(45deg, #FFFFFF, #E0E0E0)",
                    "--progress-fill-gradient": "linear-gradient(45deg, #07C8A1, #33386C)",
                  }}
                  data-content={profileContent}
                ></div>
                <span className="ml-auto text-[10px] font-medium text-white whitespace-nowrap">
                  Profile Score
                </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
