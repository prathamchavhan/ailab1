"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/utils/supabase/client";

// Define a type for the merged result object for better clarity
interface InterviewResult {
    id: string;
    final_score: number;
    user_id: string;
    interview_sessions: { company: string };
    profile: { user_id: string; name: string } | null;
}

// -------------------------------------------------------------
// Component for the Leaderboard Table with Inter/Intra Toggle
// -------------------------------------------------------------
function InterviewDashboardTable({ results }: { results: InterviewResult[] }) {
    const [view, setView] = useState("Inter"); // State for Inter / Intra toggle

    const displayResults = results.slice(0, 10); 

    // Custom styles for the unified teal header background (Rank, Score, AND Candidate Profile)
    const tealHeaderBgStyle = {
        background: '#0CA396', // Teal color
        color: 'white',
        fontWeight: 'bold',
        borderRadius: '8px', 
        display: 'flex', 
        alignItems: 'center',
        padding: '8px 15px', 
        height: '60px', 
        fontSize: '15px', 
        lineHeight: '1.2', 
    };

    // Style for the non-score data rows (Candidate Name, Rank) - Poppins 500
    const rowTextStyleMedium = {
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 500, // Medium
        fontSize: '12px', // 12px
        color: '#09407F', // Dark Blue
        lineHeight: '1',
    };
    
    // Style for the Score data - Poppins 600
    const scoreTextStyleSemiBold = {
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 600, // SemiBold
        fontSize: '12px', // 12px
        color: '#09407F', // Dark Blue
        lineHeight: '1',
    };

    // ACTIVE BUTTON GRADIENT STYLE
    const activeGradientStyle = {
        background: 'linear-gradient(to right, #0CA396, #04A2CF)', // Teal to Blue gradient
        color: 'white',
    };
    // INACTIVE BUTTON BACKGROUND COLOR
    const inactiveBgColor = '#D4F6FA';

    return (
        <div className="w-full">
            {/* 1. Toggle Button Group (Inter / Intra) */}
            <div className="rounded-lg mb-4 p-1" style={{background: '#D4F6FA', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                <div className="flex justify-between rounded-md overflow-hidden">
                    {["Inter", "Intra"].map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`flex-1 text-center py-2 text-lg font-semibold transition duration-200 rounded-md
                                ${v !== view
                                    ? 'text-gray-500 hover:text-gray-900'
                                    : ''
                                }
                            `}
                            style={v === view ? activeGradientStyle : {backgroundColor: inactiveBgColor}}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Leaderboard Table Card */}
            <div className="bg-[#D4F6FA] rounded-2xl p-4 shadow-xl">
                
                {/* Table Header Row */}
                <div className="grid grid-cols-[3fr_1fr_1fr] gap-3 mb-4">
                    
                    {/* Candidate Profile Header */}
                    <span style={{...tealHeaderBgStyle, justifyContent: 'flex-start'}}> 
                        Candidate Profile
                    </span>

                    {/* Rank Header */}
                    <span style={tealHeaderBgStyle}>
                        Rank
                    </span>

                    {/* Score Header */}
                    <span style={tealHeaderBgStyle}>
                        Score
                    </span>
                </div>

                {/* Dynamic Rows */}
                {displayResults.map((result, idx) => (
                    <div
                        key={result.id}
                        className="grid grid-cols-[3fr_1fr_1fr] gap-2 items-center py-3 border-b border-gray-300/50 last:border-0"
                    >
                        {/* Profile + Name (Uses rowTextStyleMedium) */}
                        <div className="flex items-center gap-3" style={rowTextStyleMedium}>
                            {/* Placeholder Avatar */}
                            <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                                {result.profile?.name
                                    ? result.profile.name.charAt(0)
                                    : "U"}
                            </div>
                            <span className="font-medium">
                                {result.profile?.name || "Unknown User"}
                            </span>
                        </div>

                        {/* Rank (Uses rowTextStyleMedium) */}
                        <span className="text-center font-medium" style={rowTextStyleMedium}>
                            #{idx + 1}
                        </span>

                        {/* Score (Uses scoreTextStyleSemiBold) */}
                        <span className="text-center" style={scoreTextStyleSemiBold}>
                            {result.final_score ?? "--"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// Main Dashboard Component (Data Fetching Logic)
// -------------------------------------------------------------
export default function Dashboard() {
    // --- Data Fetching Logic (UNCHANGED) ---
    const [results, setResults] = useState<InterviewResult[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const { data: results, error } = await supabase
                    .from("interview_results")
                    .select(`
                        id,
                        final_score,
                        created_at,
                        user_id,
                        interview_sessions ( company )
                    `)
                    .order("final_score", { ascending: false });

                if (error) {
                    console.error("Supabase error fetching results:", error.message);
                    throw error;
                }

                const userIds = (results || []).map((r) => r.user_id).filter(Boolean);
                let profilesMap: Record<string, any> = {};

                if (userIds.length > 0) {
                    const { data: profiles, error: profileError } = await supabase
                        .from("profiles")
                        .select("user_id, name")
                        .in("user_id", userIds);

                    if (profileError) throw profileError;

                    profilesMap = (profiles || []).reduce((acc, p) => {
                        acc[p.user_id] = p;
                        return acc;
                    }, {});
                }

                const merged = (results || []).map((r) => ({
                    ...r,
                    profile: profilesMap[r.user_id] || null,
                }));

                setResults(merged as InterviewResult[]);
            } catch (err) {
                console.error("Error fetching results:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

    // --- Loading and Empty State (UNCHANGED) ---
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-600">
                Loading dashboard...
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-600">
                No interview results yet 🚀
            </div>
        );
    }

    // --- Main Render (UPDATED UI) ---
    return (
        <div style={{fontFamily: 'Poppins, sans-serif'}} className="p-6"> 
            <div className="max-w-4xl mx-auto">
                {/* Interview dashboard Title - NEW STYLING */}
                <h2 
                    className="mb-4"
                    style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 600, // SemiBold
                        fontSize: '20px', 
                        color: '#09407F', // Dark Blue
                        lineHeight: '1',
                        letterSpacing: '0',
                    }}
                >
                    Interview dashboard
                </h2>
                <InterviewDashboardTable results={results} />
            </div>
        </div>
    );
}