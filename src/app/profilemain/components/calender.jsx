"use client";
import Link from 'next/link';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";

const ActivityItem = ({ icon, title, content, subContent, color = "#09407F" }) => (
<div
    // Outer card wrapper with inline styles for solid blue border, sizing, and spacing
    className="w-full rounded-lg mb-2 mt-8 shadow-sm hover:shadow-md transition-shadow duration-200"
    style={{
        width: '100%',
        border: '1px solid #2B81CF', /* Solid Darker Blue Border */
        borderRadius: '8px',
        padding: '8px 12px', /* Decreased height (8px vertical padding) and sufficient horizontal padding */
        backgroundColor: 'white',
    }}
>
    <div className="flex items-center">
        <div
            className="flex-shrink-0 w-5 h-5 text-sm flex items-center justify-center mr-2"
            style={{ color: color, fontSize: '13px' }}
        >
            {icon}
        </div>
      <div className="flex-grow min-w-0">
            <p className="text-sm font-semibold mb-0 text-gray-800 truncate">
                {content}
            </p>

            <p className="text-xs font-normal text-gray-500">
                {title}
            </p>
            {subContent && (
                <p className="text-[9px] italic text-gray-500">
                    {subContent}
                </p>
            )}
        </div>
    </div>
</div>
);


const embeddedCSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

.activity-list-container {
  font-family: 'Poppins', sans-serif;
}
`;

// --- Main Component for Recent Activity ---
export default function UserRecentActivityDashboard() {
  const [activityData, setActivityData] = useState(null);
  const [userName, setUserName] = useState("User");
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchActivity = async () => {
      setIsLoading(true);
      
      // Get the currently authenticated user's ID
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setActivityData({ error: "User not logged in. Activity cannot be loaded." });
        setIsLoading(false);
        return;
      }
      const userId = user.id;

      // 1. Fetch User Name
      const { data: profileData } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", userId)
        .single();
      
      setUserName(profileData?.name || "Authenticated User");


      // 2. Fetch Recent Interview Time
      const { data: interviewData } = await supabase
        .from("interview_sessions")
        .select("created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      const recentInterview = interviewData?.[0]?.created_at
        ? new Date(interviewData[0].created_at).toLocaleString("en-GB")
        : "N/A";


      // 3. Fetch Recent Aptitude Activity (Latest Attempt)
      const { data: aptitudeData } = await supabase
        .from("aptitude")
        .select("created_at, type, score")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      let recentAptitudeContent = "No attempts recorded.";
      let aptitudeSubText = null;

      if (aptitudeData?.[0]) {
        const attempt = aptitudeData[0];
        const attemptDate = new Date(attempt.created_at).toLocaleDateString("en-GB");
        recentAptitudeContent = `${attempt.type} - Score: ${attempt.score}%`;
        aptitudeSubText = `Attempt Date: ${attemptDate}`;
      }
      
      // 4. Determine Active Status (Uses last_sign_in_at from Auth)
      const lastSignIn = user.last_sign_in_at;
      let activeStatusContent = "Unknown";
      let activeStatusColor = "#5A67D8"; // Blue/Purple
      let activeStatusSubText = "N/A";

      if (lastSignIn) {
          const lastSignInDate = new Date(lastSignIn);
          const minutesAgo = (new Date() - lastSignInDate) / 60000;
          
          if (minutesAgo < 120) { // If signed in within the last 2 hours
              activeStatusContent = "Recently Active";
              activeStatusColor = "#38A169"; // Green
              activeStatusSubText = `Last seen: ${lastSignInDate.toLocaleTimeString("en-GB")}`;
          } else {
              activeStatusContent = "Inactive";
              activeStatusColor = "#E53E3E"; // Red
              activeStatusSubText = `Last sign-in: ${lastSignInDate.toLocaleDateString("en-GB")}`;
          }
      }
      
      setActivityData({
        recentInterview: { content: recentInterview, color: "#9F7AEA" }, // Purple
        recentAptitude: { content: recentAptitudeContent, subContent: aptitudeSubText, color: "#38A169" }, // Green
        activeStatus: { content: activeStatusContent, subContent: activeStatusSubText, color: activeStatusColor },
      });

      setIsLoading(false);
    };

    fetchActivity();
  }, [supabase]); 

  return (
    <div className="w-full activity-list-container">
      <style dangerouslySetInnerHTML={{ __html: embeddedCSS }} />
      <div 
          // *** FIX FOR WIDTH ***
          // Removed conflicting 'pr-8 px-7' to ensure max width from the parent.
          // Using px-4 for minimal internal padding.
          className="px-4 py-4 rounded-xl shadow-md w-full" 
          style={{ 
              background: 'linear-gradient(to right, #D9FAFF, #FFFFFF)',
           
        }}>
       
        {isLoading ? (
          <p className="text-center text-sm text-gray-500 p-4">Loading your activity list...</p>
        ) : activityData?.error ? (
           <p className="text-center text-sm text-red-500 p-4 font-medium">{activityData.error}</p>
        ) : (
          <div className="flex flex-col space-y-0">
            
            <ActivityItem
              icon="📝"
              title="LAST INTERVIEW ATTEMPT"
              content={activityData.recentInterview.content}
              subContent="Date and Time of the session"
              color={activityData.recentInterview.color}
            />

            <ActivityItem
              icon="🧠"
              title="RECENT APTITUDE SCORE"
              content={activityData.recentAptitude.content}
              subContent={activityData.recentAptitude.subContent}
              color={activityData.recentAptitude.color}
            />
            
            <ActivityItem
              icon="🟢"
              title="SESSION STATUS"
              content={activityData.activeStatus.content}
              subContent={activityData.activeStatus.subContent}
              color={activityData.activeStatus.color}
            />

          </div>
        )}
<div 
    className=" flex justify-around p-1 bg-gray-50" 
    style={{ 

        marginTop: '4px',
        display: 'flex',
        justifyContent: 'space-around', // Maintains equal spacing around all elements
        padding: '4px',
        backgroundColor: '#def7f9ff'
    }}
>
    <Link href="/aptitude">
    <button 
        style={{ 
            borderRadius: '6px', 
            background: 'linear-gradient(to right, #2DC2DB, #2B87D0)',
            padding: '4px 10px', 
            fontSize: '10px', 
            fontWeight: '600', 
            color: 'white',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
            border: 'none',
            cursor: 'pointer',
            minWidth: '60px',
            marginRight: '8px' // Increased gap on the right
        }}>
        Aptitude
    </button>
    </Link>
    <Link href="/ai-dashboard" >
    <button 
        style={{ 
            borderRadius: '6px', 
            background: 'linear-gradient(to right, #2DC2DB, #2B87D0)',
            padding: '4px 10px', 
            fontSize: '10px', 
            fontWeight: '600', 
            color: 'white',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
            border: 'none',
            cursor: 'pointer',
            minWidth: '70px',
            marginRight: '8px' // Increased gap on the right
        }}>
        Interview
    </button>
    </Link>
    <Link href="/event_challenge" >
    <button 
        style={{ 
            borderRadius: '6px', 
            background: 'linear-gradient(to right, #2DC2DB, #2B87D0)',
            padding: '4px 10px',
            fontSize: '10px', 
            fontWeight: '600', 
            color: 'white',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
            border: 'none',
            cursor: 'pointer',
            minWidth: '80px'
        }}>
        Challenges
    </button>
    </Link>
</div>
      </div>
    </div>
  );
}