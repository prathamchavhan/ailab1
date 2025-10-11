"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/client"; // ✅ Supabase client for browser (frontend)

export default function AIInterviewForm() {
  // --- State and Logic ---
  const [level, setLevel] = useState("Easy");
  const [round, setRound] = useState("R1");
  const [domain, setDomain] = useState("Select industry domain");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  // Available domains
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

  // --- Start Interview Button Logic ---
  const handleStart = async () => {
    if (domain === "Select industry domain" || !company) {
      alert("Please fill in both Domain and Company");
      return;
    }

    setLoading(true);

    try {
      // ✅ Check Supabase auth (user must be logged in)
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        alert("Please log in before starting an interview.");
        setLoading(false);
        return;
      }

      // ✅ Call backend route to generate questions
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

      // ✅ Redirect to interview page
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
    width: "161px",
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

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
          <div className="w-10 h-10 border-4 border-t-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white p-0">
        <div className="space-y-6">
          {/* Level */}
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
                        : inactiveSegmentButtonClass
                    }`}
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
                        : inactiveSegmentButtonClass
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Domain */}
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
                        domain === "Select industry domain"
                          ? "placeholder-text"
                          : "font-semibold"
                      }`}
                    >
                      {domain}
                    </span>
                    <svg
                      className="w-5 h-5 text-gray-500 ml-2"
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
                </button>
              </div>

              {isDomainDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden">
                  {domainOptions.map((option) => (
                    <div
                      key={option}
                      onClick={() => handleSelectDomain(option)}
                      className={`dropdown-item ${
                        domain === option ? "highlighted" : ""
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Company */}
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
                  <span
                    className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none placeholder-text"
                    style={{ opacity: company ? 0 : 1, transition: "opacity 0.2s" }}
                  >
                    Search by company name
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Start Interview Button */}
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

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation"; // ✅ Added for real navigation
// import { createClient } from "@/lib/utils/supabase/client"; // ✅ Optional — used to create a real interview session

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
