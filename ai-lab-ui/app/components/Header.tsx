// Header.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/utils/supabase/client";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";

// --- START: Embedded CSS for Circular Progress ---
const embeddedCSS = `
.progress-circle {
    /* Dimensions and positioning of the entire circle component */
    --circle-diameter: 58px; /* Total size including the gradient border */
    --inner-circle-diameter: 50px; /* Size of the actual progress bar */
    --border-width: 3px; /* Thickness of the white/gradient outer border */
    --progress-ring-width: 4px; /* Thickness of the colored progress ring */
    --offset-x: -18px; /* How far the circle sticks out left from the card */

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
    
    /* GRADIENT BORDER TRICK: Uses two backgrounds with 'border-box' and 'content-box' clip */
    background: 
        /* 1. White Background: Acts as the inner content fill, leaving space for the border */
        radial-gradient(circle closest-side, white calc(100% - var(--border-width) - 1px), transparent calc(100% - var(--border-width))),
        /* 2. Gradient Layer: The actual color of the outer border */
        var(--outer-border-gradient); 
    background-origin: border-box;
    background-clip: content-box, border-box;
}

/* The ::before element holds the progress bar and the score number */
.progress-circle::before {
    content: attr(data-content); 
    
    position: absolute;
    width: var(--inner-circle-diameter); 
    height: var(--inner-circle-diameter);
    border-radius: 50%;
    
    /* Calculation for the conic-gradient angle */
    --progress-deg: calc(3.6deg * var(--score-percentage));
    
    /* CIRCULAR PROGRESS BAR: Uses a radial mask over a conic gradient */
    background: 
        /* 1. Inner White Circle: Creates the hole for the score number */
        radial-gradient(
            circle closest-side, 
            white calc(100% - var(--progress-ring-width)), 
            transparent calc(100% - var(--progress-ring-width) + 1px)
        ),
        /* 2. Progress Arc: The colored fill and the light background fill */
        conic-gradient(
            var(--progress-fill-gradient) 0deg var(--progress-deg), /* The active colored segment */
            rgba(255, 255, 255, 0.4) var(--progress-deg) 360deg /* The unfilled, light segment */
        );
    
    /* Styling for the score text inside */
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.9em; 
    font-weight: 700;
    color: black; /* The score number is black */
    z-index: 20; 
}
`;
// --- END: Embedded CSS for Circular Progress ---


export default function Header() {
    const [user, setUser] = useState<any>(null);
    const [latestResult, setLatestResult] = useState<any>(null);
    const [averageScore, setAverageScore] = useState<number | null>(null);
    const [userName, setUserName] = useState<string>("Guest");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchUserAndScores = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error || !data?.user) {
                router.push("/login");
                return;
            }

            const currentUser = data.user;
            setUser(currentUser);

            // Name Fetching Logic
            const { data: profile } = await supabase
                .from("profiles")
                .select("name")
                .eq("user_id", currentUser.id)
                .single();

            if (profile?.name) setUserName(profile.name);
            else if (currentUser.user_metadata?.full_name)
                setUserName(currentUser.user_metadata.full_name);
            else setUserName(currentUser.email?.split("@")[0] || "User");

            // Score Fetching Logic
            const { data: latestResults } = await supabase
                .from("interview_results")
                .select(`final_score, created_at, interview_sessions!inner(user_id)`)
                .eq("interview_sessions.user_id", currentUser.id)
                .order("created_at", { ascending: false })
                .limit(1);

            if (latestResults && latestResults.length > 0) {
                setLatestResult(latestResults[0]);
            }

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

        fetchUserAndScores();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    // --- Dynamic Score Values (Using fallbacks from your provided images) ---
    const interviewScore = latestResult?.final_score ?? 76; 
    const profileScore = averageScore ?? 55;
    
    // Determine the content string based on score format preference
    const interviewContent = Number.isInteger(interviewScore) ? interviewScore.toString() : interviewScore.toFixed(2);
    const profileContent = `${Number.isInteger(profileScore) ? profileScore : profileScore.toFixed(0)}%`;
    // ----------------------------------------------------------------------

    return (
        <header className="px-6 pt-4">
            
            {/* Inject the necessary CSS block into the document head */}
            <style dangerouslySetInnerHTML={{ __html: embeddedCSS }} />
            
            {/* Main Header Container (Dark background of the entire bar) */}
            <div className="flex justify-between items-center bg-[#1D3540] text-white px-8 py-4 rounded-[20px] shadow-lg">
                
                {/* Left Section - Greeting */}
                {/* Removed the avatar div, kept only the greeting h2 */}
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold whitespace-nowrap">
                        Hi, <span className="font-bold">{userName}</span> 👋
                    </h2>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-10">
                    {/* Notification Icon */}
                    <div className="relative">
                        <Bell className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform" />
                    </div>

                    {/* Score Badges Container - GAP-8 provides separation */}
                    <div className="flex items-center gap-8">
                        
                        {/* ---------------- INTERVIEW SCORE CARD ---------------- */}
                        <div 
                            className="relative flex items-center h-[50px] w-[169px] rounded-xl pr-3 pl-14 shadow-md"
                            style={{ 
                                // Figma Card Gradient: #404478 to #9041AA
                                background: "linear-gradient(90deg, #404478, #9041AA)"
                            }}
                        >
                            <div 
                                className={`progress-circle`}
                                // Define the CSS variables used by the embedded CSS
                                style={{ 
                                    // Outer Border Gradient (Light blue/cyan for the total ring)
                                    '--outer-border-gradient': 'linear-gradient(45deg, #a4e6ff, #6dd5ed)', 
                                    // Inner Progress Arc Gradient (Purple/Pink for the fill)
                                    '--progress-fill-gradient': 'linear-gradient(45deg, #51e6dd, #c02ffc)', 
                                    '--score-percentage': interviewScore,
                                }}
                                // Data attribute used by CSS for the number inside the circle
                                data-content={interviewContent}
                            >
                            </div>
                            <span className="ml-auto text-sm font-medium text-white whitespace-nowrap">
                                Interview Score
                            </span>
                        </div>

                        {/* ---------------- PROFILE SCORE CARD ---------------- */}
                        <div 
                            className="relative flex items-center h-[50px] w-[169px] rounded-xl pr-3 pl-14 shadow-md"
                            style={{
                                // Figma Card Gradient: #33386C to #07C8A1
                                background: "linear-gradient(90deg, #33386C, #07C8A1)"
                            }}
                        >
                            <div 
                                className={`progress-circle`}
                                // Define the CSS variables used by the embedded CSS
                                style={{
                                    // Outer Border Gradient (Teal/Dark Blue for the total ring)
                                    '--outer-border-gradient': 'linear-gradient(45deg, #07C8A1, #33386C)',
                                    // Inner Progress Arc Gradient (Teal/Dark Blue for the fill)
                                    '--progress-fill-gradient': 'linear-gradient(45deg, #07C8A1, #33386C)',
                                    '--score-percentage': profileScore,
                                }}
                                // Data attribute used by CSS for the number inside the circle
                                data-content={profileContent}
                            >
                            </div>
                            <span className="ml-auto text-sm font-medium text-white whitespace-nowrap">
                                Profile Score
                            </span>
                        </div>
                    </div>

                    {/* User Avatar + Dropdown (Your existing logic) */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2DC7DB] text-white font-bold shadow-md hover:brightness-110 transition"
                        >
                            {userName.charAt(0).toUpperCase()}
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-40 bg-white rounded-lg shadow-lg py-2 z-50">
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}