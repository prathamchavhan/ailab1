"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AIInterviewForm() {
  // --- State and Logic ---
  const [level, setLevel] = useState("Easy");
  const [round, setRound] = useState("R1");
  const [domain, setDomain] = useState("Select industry domain");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  // const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false); // Removed as Job Role is a simple input
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false); // For Company dropdown

  const router = useRouter();
  const supabase = createClientComponentClient();

  // --- Company Logic & Data (Moved from useEffect) ---
  const companyOptions = [
    "Google",
    "Microsoft",
    "Apple",
    "Amazon",
    "Tata Consultancy Services (TCS)",
    "Infosys",
    "Wipro",
    "HCL Technologies",
  ];
  const handleSelectCompany = (selectedCompany) => {
    setCompany(selectedCompany);
    setIsCompanyDropdownOpen(false);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      console.log(
        "Initial auth check in AIInterviewForm:",
        error,
        data?.user ? "User found" : "No user"
      );
      if (!error && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    };

    // Check initial auth state
    checkUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(
        "Auth state changed in AIInterviewForm:",
        event,
        session?.user ? "User logged in" : "No user"
      );
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // --- Domain Logic Removed (as it's a simple input now) ---
  // const domainOptions = [ ... ];
  // const handleSelectDomain = (selectedDomain) => { ... };

  // --- Start Interview Button Logic ---
  const handleStart = async () => {
    if (domain === "Select industry domain" || !company) {
      alert("Please fill in both Job Role/Domain and Company");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        const shouldLogin = confirm(
          "You need to be logged in to start an interview. Would you like to go to the login page?"
        );
        if (shouldLogin) {
          router.push("/login");
        }
        setLoading(false);
        return;
      }

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

      const responseData = await res.json();
      const { sessionId, questions, config } = responseData;

      if (!sessionId) {
        alert("Something went wrong. No session created.");
        return;
      }

      // Store the interview data in sessionStorage for the interview page
      if (questions && config) {
        sessionStorage.setItem("interviewQuestions", JSON.stringify(questions));
        sessionStorage.setItem("interviewConfig", JSON.stringify(config));
        sessionStorage.setItem("sessionId", sessionId);
      }

      router.push(`/interview?sessionId=${sessionId}`);
    } catch (err) {
      console.error("❌ Unexpected error:", err);
      alert("Something went wrong while generating questions.");
    } finally {
      setLoading(false);
    }
  };

  // --- Design Constants ---
  const activeGradientButtonClass =
    "bg-gradient-to-r from-[#2DC7DB] to-[#2B7ECF] text-white shadow-md";
  const inactiveSegmentButtonClass =
    "placeholder-text transition hover:text-gray-900";

  const labelCardClass =
    "bg-white rounded-[6px] shadow-md flex items-center justify-center";

  const labelCardStyle = {
    width: "120px",
    height: "47px",
    boxShadow: "0 4px 4px -2px rgba(0, 0, 0, 0.25)",
  };

  // --- Embedded CSS ---
  const gradientBorderCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

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

    .label-text {
        font-family: 'Poppins', sans-serif;
        font-weight: 600; 
        font-size: 16px; 
        color: #09407F; 
        line-height: 1;
    }

    .gradient-border-wrap {
        --border-gradient: linear-gradient(to right, #90E3F8, #0D6688);
        --border-width: 2px;
        position: relative;
        isolation: isolate; 
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08); 
        background: white; 
    }

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

    .segmented-control-inner {
        padding: 0.25rem;
    }
    .segmented-control-inner button {
        flex: 1; 
        text-align: center;
        padding-top: 0.5rem; 
        padding-bottom: 0.5rem; 
    }

    .domain-text {
        font-family: 'Poppins', sans-serif;
        font-weight: 600; 
        font-size: 15px; 
        line-height: 100%;
        letter-spacing: 0;
        color: #09407F; 
    }

    /* Style for the input's placeholder */
    .domain-text::placeholder {
        color: #577597; 
        font-weight: 400; 
        opacity: 1; /* Ensure placeholder is visible */
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

    .placeholder-text {
        font-family: 'Poppins', sans-serif;
        color: #577597; 
        font-weight: 400; 
        font-size: 15px;
    }
  `;

  // --- JSX Layout ---
  return (
    <div className="p-4 w-full">
      <style dangerouslySetInnerHTML={{ __html: gradientBorderCSS }} />

      {/* Title */}
      <h1 className="mb-8">
        <span className="ai-interview-title ai-text">AI </span>
        <span className="ai-interview-title interview-text-gradient">
          Interview
        </span>
      </h1>

      {/* Authentication Loading State */}
      {authLoading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                Checking authentication status...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt for Unauthenticated Users */}
      {!authLoading && !user && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                You need to be logged in to start an interview.
                <button
                  onClick={() => router.push("/login?redirect=/ai-dashboard")}
                  className="ml-2 underline text-blue-600 hover:text-blue-800"
                >
                  Click here to login
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
          <div className="w-7 h-7 border-4 border-t-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Form */}
      <div className="bg-transparent p-0">
        <div className="space-y-6">
          {/* Level */}
          <div className="flex items-center gap-6">
            <div className={labelCardClass} style={labelCardStyle}>
              <p className="label-text mt-3">Level</p>
            </div>
            <div
              className="flex-grow shadow-md"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #2DC2DB , #2B87D0)",
                padding: "2px",
                borderRadius: "8px",
              }}
            >
              <div
                className="segmented-control-inner flex justify-between w-full p-1 bg-white "
                style={{ borderRadius: "5px" }}
              >
                {["Easy", "Medium", "Hard"].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`text-sm font-medium transition duration-150 ${
                      level === l
                        ? activeGradientButtonClass
                        : inactiveSegmentButtonClass
                    }`}
                    style={{ borderRadius: "8px" }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Round */}
          <div className="flex items-center gap-6">
            <div className={labelCardClass} style={labelCardStyle}>
              <p className="label-text mt-3">Round</p>
            </div>
            <div
              className="flex-grow shadow-md"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #2DC2DB , #2B87D0)",
                padding: "2px",
                borderRadius: "8px",
              }}
            >
              <div
                className="segmented-control-inner flex justify-between w-full p-1 bg-white "
                style={{
                  borderRadius: "5px",
                }}
              >
                {["R1", "R2", "R3"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRound(r)}
                    className={`rounded-md text-sm font-medium transition duration-150 ${
                      round === r
                        ? activeGradientButtonClass
                        : inactiveSegmentButtonClass
                    }`}
                    style={{ borderRadius: "8px" }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Domain (Job Role) - Input */}
          <div className="flex items-center gap-6 relative">
            <div className={labelCardClass} style={labelCardStyle}>
              <p className="label-text mt-3">Job Role</p>
            </div>
            <div className="flex-grow relative">
              <div
                className="shadow-md"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #2DC2DB , #2B87D0)",
                  padding: "2px",
                  borderRadius: "8px",
                }}
              >
                <div
                  className="w-full relative bg-white text-black"
                  style={{ borderRadius: "5px" }}
                >
                  <input
                    type="text"
                    value={domain === "Select industry domain" ? "" : domain}
                    onChange={(e) => {
                      setDomain(e.target.value);
                    }}
                    onFocus={() => {
                      if (domain === "Select industry domain") setDomain("");
                    }}
                    onBlur={() => {
                      if (domain.trim() === "")
                        setDomain("Select industry domain");
                    }}
                    placeholder="Select or type Job Role"
                    className="w-full px-5 py-2.5 outline-none bg-transparent domain-text !font-semibold"
                    style={{ borderRadius: "8px", color: "#09407F" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* --- COMPANY COMBOBOX --- */}
          <div className="flex items-center gap-6 mb-12">
            <div className={labelCardClass} style={labelCardStyle}>
              <p className="label-text mt-3">Company</p>
            </div>

            <div className="flex-grow relative">
              <div
                className="shadow-md"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #2DC2DB , #2B87D0)",
                  padding: "2px", // This controls the thickness of the border
                  borderRadius: "8px", // This is the outer radius
                }}
              >
                <div
                  className="w-full relative bg-white "
                  style={{
                    borderRadius: "5px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Search or type company name"
                    value={company}
                    onChange={(e) => {
                      setCompany(e.target.value);
                      setIsCompanyDropdownOpen(true);
                    }}
                    onFocus={() => setIsCompanyDropdownOpen(true)}
                    onBlur={() => {
                      // Delay closing to allow click on dropdown items
                      setTimeout(() => setIsCompanyDropdownOpen(false), 200);
                    }}
                    // Added pr-10 for arrow, and domain-text for styling
                    className="w-full px-5 py-2.5 pr-10 outline-none bg-transparent domain-text !font-semibold"
                    style={{ borderRadius: "8px", color: "#09407F" }}
                  />
                  {/* --- Arrow Icon Added --- */}
                  <svg
                    onClick={() =>
                      setIsCompanyDropdownOpen(!isCompanyDropdownOpen)
                    }
                    className="w-5 h-5 text-gray-200 absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>

              {/* --- Dropdown List Added --- */}
              {(() => {
                const filteredOptions = companyOptions.filter((option) =>
                  option.toLowerCase().includes(company.toLowerCase())
                );

                return (
                  isCompanyDropdownOpen &&
                  filteredOptions.length > 0 && (
                    <div
                      className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 shadow-xl z-20 overflow-hidden"
                      style={{ borderRadius: "5px" }}
                    >
                      {filteredOptions.map((option) => (
                        <div
                          key={option}
                          onClick={() => handleSelectCompany(option)}
                          className={`dropdown-item ${
                            company === option ? "highlighted" : ""
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )
                );
              })()}
            </div>
          </div>
        </div>

        {/* Start Interview Button */}
        <button
          onClick={handleStart}
          disabled={loading}
          className="mt-8 w-full mt-8 py-3 shadow-lg 
                     bg-gradient-to-r from-[#2DC7DB] to-[#2B7ECF] 
                     text-white text-lg font-semibold transition hover:opacity-90 disabled:opacity-50 mt-9"
          style={{ borderRadius: "8px" }}
        >
          {loading ? "Generating..." : "Start Interview"}
        </button>
      </div>
    </div>
  );
}



// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation"; // ✅ Added for real navigation

// export default function AIInterviewForm() {
//   const [level, setLevel] = useState("Easy");
//   const [round, setRound] = useState("R1");
//   const [domain, setDomain] = useState("Select industry domain");
//   const [company, setCompany] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false);

//   const router = useRouter();
//   const supabase = createClient();

//   // Available domains
//   const domainOptions = [
//     "Information Technology (IT)",
//     "Software Development",
//     "Artificial Intelligence & Machine Learning",
//     "Data Science & Analytics",
//     "Mobile App Development",
//     "Cloud Computing",
//   ];

//   const handleSelectDomain = (selectedDomain: string) => {
//     setDomain(selectedDomain);
//     setIsDomainDropdownOpen(false);
//   };

//   // --- Start Interview ---
//   const handleStart = async () => {
//     if (domain === "Select industry domain" || !company) {
//       alert("Please fill in both Domain and Company");
//       return;
//     }

//     setLoading(true);

//     try {
//       // ✅ Create a new interview session in Supabase
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();

//       if (!user) {
//         alert("Please log in first.");
//         setLoading(false);
//         return;
//       }

//       const { data: session, error } = await supabase
//         .from("interview_sessions")
//         .insert([
//           {
//             user_id: user.id,
//             domain,
//             company,
//             type: level,
//             round,
//             created_at: new Date().toISOString(),
//           },
//         ])
//         .select("id")
//         .single();

//       if (error) throw error;

//       // ✅ Navigate to interview start page
//       router.push(`/interview?sessionId=${session.id}`);

//     } catch (err) {
//       console.error("Error starting interview:", err);
//       alert("Something went wrong while starting the interview.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Styles ---
//   const activeGradientButtonClass =
//     "bg-gradient-to-r from-[#2DC7DB] to-[#2B7ECF] text-white shadow";
//   const inactiveSegmentButtonClass =
//     "text-[#09407F] font-medium transition hover:text-[#2B7ECF] bg-transparent";

//   const labelCardClass =
//     "bg-white rounded-[6px] shadow-md flex items-center justify-center";
//   const labelCardStyle = {
//     width: "161px",
//     height: "47px",
//     boxShadow: "0 4px 4px -2px rgba(0, 0, 0, 0.25)",
//   };

//   // --- Embedded CSS ---
//   const gradientBorderCSS = `
//     @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

//     .ai-interview-title {
//         font-family: 'Poppins', sans-serif;
//         font-weight: 600;
//         font-size: 20px;
//         line-height: 100%;
//         letter-spacing: 0;
//         display: inline;
//     }
//     .ai-interview-title .ai-text {
//         color: #19191B;
//     }
//     .ai-interview-title .interview-text-gradient {
//         background: linear-gradient(to right, #19191B, #2B81D0);
//         -webkit-background-clip: text;
//         -webkit-text-fill-color: transparent;
//         background-clip: text;
//         color: transparent;
//     }

//     .label-text {
//         font-family: 'Poppins', sans-serif;
//         font-weight: 600;
//         font-size: 16px;
//         color: #09407F;
//         line-height: 1;
//     }

//     .gradient-border-wrap {
//         --border-gradient: linear-gradient(to right, #90E3F8, #0D6688);
//         --border-width: 2px;
//         position: relative;
//         isolation: isolate;
//         border-radius: 0.5rem;
//         box-shadow: 0 1px 3px rgba(0,0,0,0.08);
//         background: white;
//     }

//     .gradient-border-wrap::before {
//         content: "";
//         position: absolute;
//         inset: 0;
//         background: var(--border-gradient);
//         border-radius: inherit;
//         padding: var(--border-width);
//         -webkit-mask:
//             linear-gradient(#fff 0 0) content-box,
//             linear-gradient(#fff 0 0);
//         mask:
//             linear-gradient(#fff 0 0) content-box,
//             linear-gradient(#fff 0 0);
//         -webkit-mask-composite: xor;
//         mask-composite: exclude;
//         z-index: -1;
//     }

//     .domain-text {
//         font-family: 'Poppins', sans-serif;
//         font-weight: 600;
//         font-size: 15px;
//         line-height: 100%;
//         letter-spacing: 0;
//         color: #09407F;
//     }

//     .dropdown-item {
//         font-family: 'Poppins', sans-serif;
//         padding: 0.65rem 1.25rem;
//         cursor: pointer;
//         transition: background-color 0.1s;
//         color: #09407F;
//     }

//     .dropdown-item.highlighted, .dropdown-item:hover {
//         background-color: #f0f0f0;
//         font-weight: 600;
//     }

//     .placeholder-text {
//         font-family: 'Poppins', sans-serif;
//         color: #577597;
//         font-weight: 400;
//         font-size: 15px;
//     }
//   `;

//   return (
//     <div className="p-4 w-full">
//       <style dangerouslySetInnerHTML={{ __html: gradientBorderCSS }} />

//       {/* Title */}
//       <h1 className="mb-8">
//         <span className="ai-interview-title ai-text">AI </span>
//         <span className="ai-interview-title interview-text-gradient">
//           Interview
//         </span>
//       </h1>

//       {/* Loader */}
//       {loading && (
//         <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
//           <div className="w-10 h-10 border-4 border-t-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
//         </div>
//       )}

//       {/* Form */}
//       <div className="bg-white p-0">
//         <div className="space-y-6">
//           {/* Level */}
//           <div className="flex items-center gap-6">
//             <div className={labelCardClass} style={labelCardStyle}>
//               <p className="label-text">Level</p>
//             </div>
//             <div className="flex-grow gradient-border-wrap w-full">
//               <div className="flex justify-between w-full p-1 rounded-lg">
//                 {["Easy", "Medium", "Hard"].map((l) => (
//                   <button
//                     key={l}
//                     onClick={() => setLevel(l)}
//                     className={`flex-1 text-center py-1.5 rounded-md text-sm transition duration-150 ${
//                       level === l
//                         ? activeGradientButtonClass
//                         : inactiveSegmentButtonClass
//                     }`}
//                   >
//                     {l}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Round */}
//           <div className="flex items-center gap-6">
//             <div className={labelCardClass} style={labelCardStyle}>
//               <p className="label-text">Round</p>
//             </div>
//             <div className="flex-grow gradient-border-wrap w-full">
//               <div className="flex justify-between w-full p-1 rounded-lg">
//                 {["R1", "R2", "R3"].map((r) => (
//                   <button
//                     key={r}
//                     onClick={() => setRound(r)}
//                     className={`flex-1 text-center py-1.5 rounded-md text-sm transition duration-150 ${
//                       round === r
//                         ? activeGradientButtonClass
//                         : inactiveSegmentButtonClass
//                     }`}
//                   >
//                     {r}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Domain */}
//           <div className="flex items-center gap-6">
//             <div className={labelCardClass} style={labelCardStyle}>
//               <p className="label-text">Domain</p>
//             </div>
//             <div className="flex-grow w-full relative">
//               <div className="gradient-border-wrap">
//                 <button
//                   type="button"
//                   onClick={() =>
//                     setIsDomainDropdownOpen(!isDomainDropdownOpen)
//                   }
//                   className="w-full relative bg-transparent rounded-lg text-gray-800"
//                 >
//                   <div className="w-full rounded-lg px-4 py-2.5 flex justify-between items-center text-left">
//                     <span
//                       className={`truncate ${
//                         domain === "Select industry domain"
//                           ? "placeholder-text"
//                           : "domain-text font-semibold"
//                       }`}
//                     >
//                       {domain}
//                     </span>
//                     <svg
//                       className="w-5 h-5 text-gray-500 ml-2"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                       xmlns="http://www.w3.org/2000/svg"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M19 9l-7 7-7-7"
//                       ></path>
//                     </svg>
//                   </div>
//                 </button>
//               </div>
//               {isDomainDropdownOpen && (
//                 <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden">
//                   {domainOptions.map((option) => (
//                     <div
//                       key={option}
//                       onClick={() => handleSelectDomain(option)}
//                       className={`dropdown-item ${
//                         domain === option ? "highlighted" : ""
//                       }`}
//                     >
//                       {option}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Company */}
//           <div className="flex items-center gap-6">
//             <div className={labelCardClass} style={labelCardStyle}>
//               <p className="label-text">Company</p>
//             </div>
//             <div className="flex-grow w-full relative">
//               <div className="gradient-border-wrap">
//                 <input
//                   type="text"
//                   placeholder="Search by company name"
//                   value={company}
//                   onChange={(e) => setCompany(e.target.value)}
//                   className="w-full rounded-lg px-4 py-2.5 outline-none bg-transparent placeholder-text"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Start Button */}
//         <button
//           onClick={handleStart}
//           disabled={loading}
//           className="mt-8 w-full py-3 rounded-xl shadow-lg
//                        bg-gradient-to-r from-[#2DC7DB] to-[#2B7ECF]
//                        text-white text-lg font-semibold transition hover:opacity-90 disabled:opacity-50"
//         >
//           {loading ? "Generating..." : "Start Interview"}
//         </button>
//       </div>
//     </div>
//   );
// }
