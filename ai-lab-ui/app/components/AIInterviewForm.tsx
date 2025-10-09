"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AIInterviewForm() {
    // --- State and Logic (UNCHANGED) ---
    const [level, setLevel] = useState("Easy");
    const [round, setRound] = useState("R1");
    const [domain, setDomain] = useState("Select industry domain"); 
    const [company, setCompany] = useState("");
    const [loading, setLoading] = useState(false);
    const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false); 

    const router = useRouter();
    
    const domainOptions = [
        "Information Technology (IT)",
        "Software Development",
        "Artificial Intelligence & Machine Learning",
        "Data Science & Analytics",
        "Mobile App Development",
        "Cloud Computing",
    ];
    
    const handleSelectDomain = (selectedDomain: string) => {
        setDomain(selectedDomain);
        setIsDomainDropdownOpen(false);
    };

    const handleStart = async () => {
        if (domain === "Select industry domain" || !company) {
            alert("Please fill in both Domain and Company");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/generate-questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ level, round, domain, company }),
            });

            if (!res.ok) {
                console.error("❌ API error:", await res.text());
                alert("Failed to generate questions. Please try again.");
                return;
            }

            const { sessionId } = await res.json();

            if (!sessionId) {
                alert("Something went wrong. No session created.");
                return;
            }

            router.push(`/interview?sessionId=${sessionId}`);
        } catch (err) {
            console.error("❌ Unexpected error:", err);
            alert("Something went wrong while generating questions.");
        } finally {
            setLoading(false);
        }
    };
    // --- END State and Logic ---

    // --- Design Variables (UPDATED INACTIVE CLASS) ---
    const activeGradientButtonClass = "bg-gradient-to-r from-[#2DC7DB] to-[#2B7ECF] text-white shadow-md";
    // Modified inactive button class to include the placeholder-text class
    const inactiveSegmentButtonClass = "placeholder-text transition hover:text-gray-900"; 
    
    // Label Card Class/Style 
    const labelCardClass = "bg-white rounded-[6px] shadow-md flex items-center justify-center";
    const labelCardStyle = {
        width: '161px', 
        height: '47px',
        boxShadow: '0 4px 4px -2px rgba(0, 0, 0, 0.25)', 
    };
    
    // --- Embedded CSS for Gradient Border and Typography (UNCHANGED) ---
    const gradientBorderCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

    /* AI Interview Title Styles */
    .ai-interview-title {
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
        font-size: 20px;
        line-height: 100%;
        letter-spacing: 0;
        display: inline;
    }
    .ai-interview-title .ai-text {
        color: #19191B;
    }
    .ai-interview-title .interview-text-gradient {
        background: linear-gradient(to right, #19191B, #2B81D0);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        color: transparent;
    }

    /* Label Text Style */
    .label-text {
        font-family: 'Poppins', sans-serif;
        font-weight: 600; 
        font-size: 16px; 
        color: #09407F; 
        line-height: 1;
    }

    /* The outer container for the gradient border */
    .gradient-border-wrap {
        --border-gradient: linear-gradient(to right, #90E3F8, #0D6688);
        --border-width: 2px;
        
        position: relative;
        isolation: isolate; 
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08); 
        background: white; 
    }

    /* The pseudo-element creating the gradient border effect */
    .gradient-border-wrap::before {
        content: "";
        position: absolute;
        inset: 0;
        background: var(--border-gradient);
        border-radius: inherit; 
        padding: var(--border-width); 
        -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
        mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        z-index: -1; 
    }

    /* Style for the buttons inside the segmented controls */
    .segmented-control-inner {
        padding: 0.25rem;
    }
    .segmented-control-inner button {
        flex: 1; 
        text-align: center;
        padding-top: 0.5rem; 
        padding-bottom: 0.5rem; 
    }

    /* DROPDOWN TYPOGRAPHY */
    .domain-text {
        font-family: 'Poppins', sans-serif;
        font-weight: 600; 
        font-size: 15px; 
        line-height: 100%;
        letter-spacing: 0;
        color: #09407F; 
    }
    .dropdown-item {
        font-family: 'Poppins', sans-serif;
        padding: 0.65rem 1.25rem; 
        cursor: pointer;
        transition: background-color 0.1s;
        color: #09407F; 
    }
    .dropdown-item.highlighted, .dropdown-item:hover {
        background-color: #f0f0f0; 
        font-weight: 600; 
    }

    /* Placeholder Text Color & Font Family - Applied to ALL inactive placeholder elements */
    .placeholder-text {
        font-family: 'Poppins', sans-serif;
        color: #577597; /* Muted blue-gray */
        font-weight: 400; /* Regular weight */
        font-size: 15px;
    }
    `;
    // --- END Embedded CSS ---

    // --- Component JSX (APPLIED INACTIVE CLASS) ---
    return (
        <div className="p-4 w-full"> 
            
            <style dangerouslySetInnerHTML={{ __html: gradientBorderCSS }} />

            {/* Title: AI Interview */}
            <h1 className="mb-8">
                <span className="ai-interview-title ai-text">AI </span>
                <span className="ai-interview-title interview-text-gradient">Interview</span>
            </h1>

            {/* 🔥 Full-page loader overlay (UNCHANGED) */}
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
                    <div className="w-10 h-10 border-4 border-t-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
                </div>
            )}

            <div className="bg-white p-0">
                {/* Form Elements */}
                <div className="space-y-6">
                    
                    {/* 1. Level Row */}
                    <div className="flex items-center gap-6">
                        <div className={labelCardClass} style={labelCardStyle}>
                            <p className="label-text">Level</p>
                        </div>
                        
                        <div className="flex-grow gradient-border-wrap w-full"> 
                            <div className="segmented-control-inner flex justify-between w-full p-1 bg-white rounded-lg">
                                {["Easy", "Medium", "Hard"].map((l) => (
                                    <button
                                        key={l}
                                        onClick={() => setLevel(l)}
                                        className={`rounded-md text-sm font-medium transition duration-150 ${
                                            level === l
                                                ? activeGradientButtonClass
                                                : inactiveSegmentButtonClass /* Uses placeholder style */
                                        }`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 2. Round Row */}
                    <div className="flex items-center gap-6">
                        <div className={labelCardClass} style={labelCardStyle}>
                            <p className="label-text">Round</p>
                        </div>
                        
                        <div className="flex-grow gradient-border-wrap w-full">
                            <div className="segmented-control-inner flex justify-between w-full p-1 bg-white rounded-lg">
                                {["R1", "R2", "R3"].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setRound(r)}
                                        className={`rounded-md text-sm font-medium transition duration-150 ${
                                            round === r
                                                ? activeGradientButtonClass
                                                : inactiveSegmentButtonClass /* Uses placeholder style */
                                        }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 3. Domain Row (Custom Dropdown) */}
                    <div className="flex items-center gap-6 relative">
                        <div className={labelCardClass} style={labelCardStyle}>
                            <p className="label-text">Domain</p>
                        </div>
                        
                        <div className="flex-grow w-full relative">
                            <div className="gradient-border-wrap">
                                <button
                                    type="button"
                                    onClick={() => setIsDomainDropdownOpen(!isDomainDropdownOpen)}
                                    className="w-full relative bg-white rounded-lg text-gray-800"
                                >
                                    <div className="w-full rounded-lg px-5 py-2.5 flex justify-between items-center text-left">
                                        <span 
                                            className={`truncate domain-text ${
                                                domain === "Select industry domain" ? "placeholder-text" : "font-semibold"
                                            }`}
                                        >
                                            {domain}
                                        </span>
                                        <svg className="w-5 h-5 text-gray-500 ml-2" 
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </div>
                                </button>
                            </div>

                            {/* Dropdown Menu List */}
                            {isDomainDropdownOpen && (
                                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden">
                                    {domainOptions.map((option) => (
                                        <div
                                            key={option}
                                            onClick={() => handleSelectDomain(option)}
                                            className={`dropdown-item ${
                                                domain === option ? 'highlighted' : ''
                                            }`}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. Company Row (Input) */}
                    <div className="flex items-center gap-6">
                        <div className={labelCardClass} style={labelCardStyle}>
                            <p className="label-text">Company</p>
                        </div>
                        
                        <div className="flex-grow w-full relative">
                            <div className="gradient-border-wrap">
                                <div className="w-full relative bg-white rounded-lg">
                                    <input
                                        type="text"
                                        placeholder="" 
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        className="w-full rounded-lg px-5 py-2.5 outline-none text-gray-800 bg-transparent"
                                    />
                                    {/* Styled placeholder span */}
                                    <span 
                                        className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none placeholder-text"
                                        style={{ opacity: company ? 0 : 1, transition: 'opacity 0.2s' }}
                                    >
                                        Search by company name
                                    </span>
                                    <svg className="w-5 h-5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" 
                                         fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Start Interview Button - Fills the container's width */}
                <button
                    onClick={handleStart}
                    disabled={loading}
                    className="mt-8 w-full py-3 rounded-xl shadow-lg 
                               bg-gradient-to-r from-[#2DC7DB] to-[#2B7ECF] 
                               text-white text-lg font-semibold transition hover:opacity-90 disabled:opacity-50"
                >
                    {loading ? "Generating..." : "Start Interview"}
                </button>
            </div>
        </div>
    );
}