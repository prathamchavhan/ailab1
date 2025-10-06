// "use client";

// import { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { createClient } from "@/lib/utils/supabase/client";
// import Header from "@/app/components/Header";
// import {
//   Radar,
//   RadarChart,
//   PolarGrid,
//   PolarAngleAxis,
//   PolarRadiusAxis,
//   ResponsiveContainer,
// } from "recharts";

// export default function AnalyticsPage() {
//   const searchParams = useSearchParams();
//   const sessionId = searchParams.get("sessionId");
//   const supabase = createClient();

//   const [loading, setLoading] = useState(true);
//   const [score, setScore] = useState<number | null>(null);
//   const [domain, setDomain] = useState<string>("Not available");
//   const [radarData, setRadarData] = useState<any[]>([]);
//   const [feedbackStrengths, setFeedbackStrengths] = useState<string[]>([]);
//   const [feedbackImprovements, setFeedbackImprovements] = useState<string[]>([]);

//   useEffect(() => {
//     if (!sessionId) return;

//     const fetchResult = async () => {
//       try {
//         const { data: result, error } = await supabase
//           .from("interview_results")
//           .select(
//             `
//             final_score,
//             radar_scores,
//             feedback,
//             interview_sessions ( domain )
//           `
//           )
//           .eq("session_id", sessionId)
//           .single();

//         if (error || !result) {
//           console.error("Error fetching analytics:", error || {});
//           setLoading(false);
//           return;
//         }

//         // ✅ Final Score
//         setScore(result.final_score ?? 0);

//         // ✅ Domain (from joined interview_sessions)
//         setDomain(result.interview_sessions?.domain || "Not available");

//         // ✅ Radar Data (convert ML model output to Recharts format)
//         if (result.radar_scores) {
//           const r = result.radar_scores;
//           setRadarData([
//             { subject: "Speech", A: r.speech ?? 0 },
//             { subject: "Content", A: r.content ?? 0 },
//             { subject: "Body Language", A: r.body_language ?? 0 },
//             { subject: "Behavioral", A: r.behavioral ?? 0 },
//             { subject: "Overall", A: r.overall ?? 0 },
//           ]);
//         } else {
//           setRadarData([]);
//         }

//         // ✅ Feedback Handling (safe for string or array)
//         const strengths = Array.isArray(result.feedback?.strengths)
//           ? result.feedback.strengths
//           : result.feedback?.strengths
//           ? [result.feedback.strengths]
//           : [];

//         const improvements = Array.isArray(result.feedback?.improvements)
//           ? result.feedback.improvements
//           : result.feedback?.improvements
//           ? [result.feedback.improvements]
//           : [];

//         setFeedbackStrengths(strengths);
//         setFeedbackImprovements(improvements);
//       } catch (err) {
//         console.error("Unexpected error fetching analytics:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchResult();
//   }, [sessionId]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-gray-600">Loading analytics...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#F5F7FA]">
//       <Header />

//       <div className="p-6 grid grid-cols-3 gap-6">
//         {/* Left side: Score + Radar */}
//         <div className="col-span-2 space-y-6">
//           {/* Final Score */}
//           <div className="bg-[#103E50] text-white p-6 rounded-xl shadow">
//             <h2 className="text-xl font-bold">Your Final AI Interview Score</h2>
//             <p className="text-3xl font-bold mt-2">{score ?? "--"} /100</p>
//             <p
//               className={`mt-2 font-semibold ${
//                 score && score >= 70 ? "text-green-400" : "text-red-400"
//               }`}
//             >
//               {score && score >= 70
//                 ? "EXCELLENT PERFORMANCE 🎉"
//                 : "Keep Practicing!"}
//             </p>
//             <p className="mt-1">Domain: {domain}</p>
//           </div>

//           {/* Radar Chart */}
//           <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
//             {radarData.length > 0 ? (
//               <>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
//                     <PolarGrid />
//                     <PolarAngleAxis dataKey="subject" />
//                     <PolarRadiusAxis angle={30} domain={[0, 100]} />
//                     <Radar
//                       name="Score"
//                       dataKey="A"
//                       stroke="#2B7ECF"
//                       fill="#2DC7DB"
//                       fillOpacity={0.6}
//                     />
//                   </RadarChart>
//                 </ResponsiveContainer>

//                 {/* Show exact metric values below chart */}
//                 <ul className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-4">
//                   {radarData.map((d, i) => (
//                     <li key={i} className="flex justify-between w-full">
//                       <span>{d.subject}</span>
//                       <span className="font-semibold">{d.A}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </>
//             ) : (
//               <p className="text-gray-500">No radar data available.</p>
//             )}
//             <a
//               href="#"
//               className="mt-4 text-blue-600 font-medium hover:underline"
//             >
//               Download Full Report
//             </a>
//           </div>

//           {/* Practice Again */}
//           <div className="flex justify-center">
//             <button
//               onClick={() => (window.location.href = "/")}
//               className="px-8 py-2 rounded-lg bg-gradient-to-r from-[#2DC7DB] to-[#2B7ECF] text-white font-semibold shadow"
//             >
//               Practice Again
//             </button>
//           </div>
//         </div>

//         {/* Right side: Feedback */}
//         <div className="space-y-6">
//           <div className="bg-white p-6 rounded-xl shadow">
//             <h3 className="text-lg font-bold mb-4">Key Feedback & Next Steps</h3>
//             {feedbackStrengths.length > 0 && (
//               <div>
//                 <span className="text-green-600 font-semibold">✔ Strengths</span>
//                 <ul className="list-disc list-inside text-sm text-gray-600">
//                   {feedbackStrengths.map((s, idx) => (
//                     <li key={idx}>{s}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//             {feedbackImprovements.length > 0 && (
//               <div className="mt-4">
//                 <span className="text-red-600 font-semibold">
//                   ⚠ Improvement Areas
//                 </span>
//                 <ul className="list-disc list-inside text-sm text-gray-600">
//                   {feedbackImprovements.map((i, idx) => (
//                     <li key={idx}>{i}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//             {feedbackStrengths.length === 0 &&
//               feedbackImprovements.length === 0 && (
//                 <p className="text-gray-500 text-sm">No feedback available.</p>
//               )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/client";
import Header from "@/app/components/Header";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function AnalyticsPage() {
  // ✅ React Component body (state + useEffect + return)
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<number | null>(null);
  const [domain, setDomain] = useState<string>("Not available");
  const [radarData, setRadarData] = useState<any[]>([]);
  const [feedbackStrengths, setFeedbackStrengths] = useState<string[]>([]);
  const [feedbackImprovements, setFeedbackImprovements] = useState<string[]>([]);

  useEffect(() => {
    if (!sessionId) return;

    const fetchResult = async () => {
      try {
        const { data: result, error } = await supabase
          .from("interview_results")
          .select(
            `
            final_score,
            radar_scores,
            feedback,
            interview_sessions ( domain )
          `
          )
          .eq("session_id", sessionId)
          .single();

        if (error || !result) {
          console.error("Error fetching analytics:", error || {});
          setLoading(false);
          return;
        }

        setScore(result.final_score ?? 0);
        setDomain(result.interview_sessions?.domain || "Not available");

        let scores = result.radar_scores || [];
        if (typeof scores === "string") {
          try {
            scores = JSON.parse(scores);
          } catch {
            scores = [];
          }
        }

        const formattedRadar = scores.map((s: any) => ({
          subject: s.subject,
          A: Number(s.A) || 0,
        }));

        if (
          !formattedRadar.find((r) => r.subject === "Overall") &&
          result.final_score
        ) {
          formattedRadar.push({ subject: "Overall", A: result.final_score });
        }

        setRadarData(formattedRadar);

        const fb = result.feedback || {};
        const strengths = Array.isArray(fb.strengths)
          ? fb.strengths
          : fb.strengths
          ? [fb.strengths]
          : [];
        const improvements = Array.isArray(fb.improvements)
          ? fb.improvements
          : fb.improvements
          ? [fb.improvements]
          : [];

        setFeedbackStrengths(strengths);
        setFeedbackImprovements(improvements);
      } catch (err) {
        console.error("Unexpected error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Header />

      <div className="p-6 grid grid-cols-3 gap-6">
        {/* Left side: Score + Radar */}
        <div className="col-span-2 space-y-6">
          <div className="bg-[#103E50] text-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold">Your Final AI Interview Score</h2>
            <p className="text-3xl font-bold mt-2">{score?.toFixed(2)} /100</p>
            <p
              className={`mt-2 font-semibold ${
                score && score >= 70 ? "text-green-400" : "text-red-400"
              }`}
            >
              {score && score >= 70
                ? "EXCELLENT PERFORMANCE 🎉"
                : "Keep Practicing!"}
            </p>
            <p className="mt-1">Domain: {domain}</p>
          </div>

          {/* Radar Chart */}
          <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
            {radarData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Score"
                      dataKey="A"
                      stroke="#2B7ECF"
                      fill="#2DC7DB"
                      fillOpacity={0.6}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>

                <div className="mt-4 grid grid-cols-3 gap-2 text-sm text-gray-700">
                  {radarData.map((item, idx) => (
                    <p key={idx}>
                      <b>{item.subject}:</b> {item.A}
                    </p>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-500">No radar data available.</p>
            )}
            <a
              href="#"
              className="mt-4 text-blue-600 font-medium hover:underline"
            >
              Download Full Report
            </a>
          </div>

          {/* Practice Again */}
          <div className="flex justify-center">
            <button
              onClick={() => (window.location.href = "/")}
              className="px-8 py-2 rounded-lg bg-gradient-to-r from-[#2DC7DB] to-[#2B7ECF] text-white font-semibold shadow"
            >
              Practice Again
            </button>
          </div>
        </div>

        {/* Right side: Feedback */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-bold mb-4">Key Feedback & Next Steps</h3>
            {feedbackStrengths.length > 0 && (
              <div>
                <span className="text-green-600 font-semibold">✔ Strengths</span>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {feedbackStrengths.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {feedbackImprovements.length > 0 && (
              <div className="mt-4">
                <span className="text-red-600 font-semibold">
                  ⚠ Improvement Areas
                </span>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {feedbackImprovements.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              </div>
            )}
            {feedbackStrengths.length === 0 &&
              feedbackImprovements.length === 0 && (
                <p className="text-gray-500 text-sm">No feedback available.</p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
