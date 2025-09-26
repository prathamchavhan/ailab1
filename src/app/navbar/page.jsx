// Header.jsx
"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
// Using the recommended Supabase client for Next.js Client Components
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; 

export default function Header() {
    // Initializes the Supabase client for Client Components
    const supabase = createClientComponentClient(); 
    const [userName, setUserName] = useState("Loading...");
    const [interviewScore, setInterviewScore] = useState("—"); 
    const [overallScore, setOverallScore] = useState("—"); 

    useEffect(() => {
        const fetchData = async () => {
            // 1. Get the authenticated user
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                console.error("User not authenticated:", userError);
                setUserName("Guest");
                setOverallScore("—");
                return;
            }

            const userId = user.id;

            // 2. Fetch the user's name from the 'profiles' table
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("name")
                .eq("user_id", userId) 
                .single();

            if (profileError) {
                console.error("Error fetching profile:", profileError.message);
                setUserName("User"); 
            } else if (profileData?.name) {
                // Display only the first name
                const firstName = profileData.name.split(" ")[0];
                setUserName(firstName);
            } else {
                setUserName("User");
            }

            // 3. Fetch the AVERAGE APTITUDE SCORE from the 'aptitude' table
            const { data: avgData, error: avgError } = await supabase
                .from("aptitude")
                // Calculate the average score, cast to numeric, and alias the result
                .select("avg(score)") 
                .eq("user_id", userId);
                
            if (avgError) {
                console.error("Error fetching avg score:", avgError.message); 
                setOverallScore("—");
            } 
            // Check for the aliased result 'average_score'
            else if (avgData?.average_score !== null) {
                // Round the average to the nearest whole number for display
                setOverallScore(Math.round(avgData.average_score).toString());
            } else {
                // Set to '0' if no aptitude entries are found
                setOverallScore("0"); 
            }

            // 4. Interview Score stays placeholder
            setInterviewScore("—"); 
        };

        fetchData();
    }, [supabase]); // Depend on supabase client

    return (
        <div className="px-4 pt-3">
            <div className="flex justify-between items-center bg-[#103E50] text-white px-4 py-2 rounded-lg shadow">
                {/* Left - Avatar + Name */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#2DC7DB]">
                        <img
                            src="/avatar.png"
                            alt="User"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Display fetched name */}
                    <p className="text-base font-medium">Hi {userName}! 👋</p>
                </div>

                {/* Right - Bell + Scores */}
                <div className="flex items-center gap-4">
                    <Bell className="w-5 h-5 cursor-pointer" />

                    {/* Interview Score (Placeholder) */}
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-[#2DC7DB] text-xs font-bold">
                            {interviewScore}
                        </div>
                        <span className="text-[10px] mt-1">Interview Score</span>
                    </div>

                    {/* Avg Aptitude Score (Fetched and displayed here) */}
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-[#2B7ECF] text-xs font-bold">
                            {overallScore}
                        </div>
                        <span className="text-[10px] mt-1">Score</span>
                    </div>
                </div>
            </div>
        </div>
    );
}