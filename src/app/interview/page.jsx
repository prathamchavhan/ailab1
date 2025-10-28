// "use client";

// import { useRouter, useSearchParams } from "next/navigation";
// import { Suspense, useEffect, useRef, useState } from "react";

// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// import { FiLogOut, FiMic } from "react-icons/fi";
// import {
//   PolarAngleAxis,
//   PolarGrid,
//   PolarRadiusAxis,
//   Radar,
//   RadarChart,
//   ResponsiveContainer,
// } from "recharts";
// import Header from "../../components/Header";

// function InterviewPageContent() {
//   const videoRef = useRef(null);
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const supabase = createClientComponentClient();

//   const sessionId = searchParams.get("sessionId");

//   const [questions, setQuestions] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [timeLeft, setTimeLeft] = useState(60);
//   const [listening, setListening] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [domain, setDomain] = useState("");
//   const [level, setLevel] = useState("");
//   const [round, setRound] = useState("");
//   const [answers, setAnswers] = useState({});
//   const [showExitPopup, setShowExitPopup] = useState(false);
//   const [isExiting, setIsExiting] = useState(false);

//   const mediaRecorderRef = useRef(null);
//   const audioChunks = useRef([]);

//   // ✅ Check for user authentication
//   useEffect(() => {
//     const checkUser = async () => {
//       const { data } = await supabase.auth.getUser();
//       if (!data?.user) router.push("/login");
//     };
//     checkUser();
//   }, [router]);

//   // ✅ Load interview configuration and questions from sessionStorage
//   useEffect(() => {
//     const loadInterviewData = () => {
//       try {
//         const storedQuestions = sessionStorage.getItem("interviewQuestions");
//         const storedConfig = sessionStorage.getItem("interviewConfig");
//         const storedSessionId = sessionStorage.getItem("sessionId");

//         if (storedQuestions && storedConfig && storedSessionId) {
//           const questions = JSON.parse(storedQuestions);
//           const config = JSON.parse(storedConfig);

//           setQuestions(questions);
//           setDomain(config.jobRole || "Interview");
//           setLevel(config.experienceLevel || "");
//           setRound("1");

//           // Initialize answers object
//           const initialAnswers = {};
//           questions.forEach((q, index) => {
//             initialAnswers[index] = "";
//           });
//           setAnswers(initialAnswers);
//         } else {
//           // If no data in sessionStorage, redirect to dashboard
//           console.error("No interview data found. Redirecting to dashboard...");
//           router.push("/ai-dashboard");
//         }
//       } catch (error) {
//         console.error("Error loading interview data:", error);
//         router.push("/ai-dashboard");
//       }
//     };

//     loadInterviewData();
//   }, [router]);

//   // ✅ Legacy support for database-based interviews (if sessionStorage is empty)
//   useEffect(() => {
//     if (!sessionId || questions.length > 0) return; // Skip if we already have questions from sessionStorage

//     const fetchData = async () => {
//       try {
//         const { data: sessions } = await supabase
//           .from("interview_sessions")
//           .select("domain, type, round")
//           .eq("id", sessionId);

//         if (sessions && sessions.length > 0) {
//           setDomain(sessions[0].domain);
//           setLevel(sessions[0].type);
//           setRound(sessions[0].round);
//         }

//         const { data: qData } = await supabase
//           .from("interview_question")
//           .select("id, question")
//           .eq("session_id", sessionId);

//         if (qData && qData.length > 0) {
//           setQuestions(qData);
//           const initialAnswers = {};
//           qData.forEach((q, index) => {
//             initialAnswers[index] = "";
//           });
//           setAnswers(initialAnswers);
//         }
//       } catch (error) {
//         console.error("Error fetching legacy interview data:", error);
//         // If legacy data also fails and no sessionStorage data, redirect to dashboard
//         if (questions.length === 0) {
//           router.push("/ai-dashboard");
//         }
//       }
//     };
//     fetchData();
//   }, [sessionId, questions.length, router]);

//   // ✅ Timer logic
//   useEffect(() => {
//     if (timeLeft <= 0) {
//       handleNext();
//       return;
//     }
//     const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
//     return () => clearInterval(timer);
//   }, [timeLeft]);

//   useEffect(() => setTimeLeft(60), [currentIndex]);

//   // ✅ Enable webcam
//   useEffect(() => {
//     async function enableCamera() {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: true,
//         });
//         if (videoRef.current) videoRef.current.srcObject = stream;
//       } catch (err) {
//         console.error("Error accessing webcam:", err);
//       }
//     }
//     enableCamera();
//   }, []);
//    useEffect(() => {
//     if (questions.length > 0 && questions[currentIndex]?.question) {
//       const utterance = new window.SpeechSynthesisUtterance(questions[currentIndex].question);
//       window.speechSynthesis.cancel(); // Stop any previous speech
//       window.speechSynthesis.speak(utterance);
//     }
//   }, [questions, currentIndex]);

//   // 🎤 Start recording + send to Whisper for transcription
//   const startListening = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const mediaRecorder = new MediaRecorder(stream);
//       mediaRecorderRef.current = mediaRecorder;
//       audioChunks.current = [];

//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data.size > 0) audioChunks.current.push(event.data);
//       };

//       mediaRecorder.onstop = async () => {
//         const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
//         const formData = new FormData();
//         formData.append("file", audioBlob, "recording.webm");

//         try {
//           const res = await fetch("/api/transcribe", {
//             method: "POST",
//             body: formData,
//           });

//           const data = await res.json();
//           if (data.text) {
//             setTranscript(data.text);

//             if (questions[currentIndex]) {
//               const qId = questions[currentIndex].id;
//               await supabase.from("interview_answers").upsert([
//                 {
//                   session_id: sessionId,
//                   question_id: qId,
//                   response: data.text,
//                   created_at: new Date().toISOString(),
//                 },
//               ]);
//             }
//           } else {
//             console.error("No transcription text found:", data);
//           }
//         } catch (err) {
//           console.error("Transcription error:", err);
//         }
//       };

//       mediaRecorder.start();
//       setListening(true);
//     } catch (err) {
//       console.error("Microphone access error:", err);
//       alert("Could not access microphone. Please allow permissions.");
//     }
//   };

//   const stopListening = () => {
//     if (
//       mediaRecorderRef.current &&
//       mediaRecorderRef.current.state !== "inactive"
//     ) {
//       mediaRecorderRef.current.stop();
//     }
//     setListening(false);
//   };

//   // ✅ Next Question Handler
//   const handleNext = async () => {
//     if (!sessionId || !questions[currentIndex]) return;

//     const qId = questions[currentIndex].id;
//     const answerText = transcript.trim() || "(No response)";

//     try {
//       await supabase.from("interview_answers").upsert(
//         [
//           {
//             session_id: sessionId,
//             question_id: qId,
//             response: answerText,
//             created_at: new Date().toISOString(),
//           },
//         ],
//         { onConflict: "session_id,question_id" }
//       );

//       setAnswers((prev) => ({
//         ...prev,
//         [qId]: answerText,
//       }));

//       if (currentIndex < questions.length - 1) {
//         setCurrentIndex((i) => i + 1);
//         setTranscript("");
//       } else {
//         const res = await fetch("/api/evaluate", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ sessionId }),
//         });

//         if (!res.ok) {
//           console.error("Evaluation failed:", await res.json());
//           return;
//         }

//         router.push(`/interview/completed?sessionId=${sessionId}`);
//       }
//     } catch (error) {
//       console.error("Error saving answer:", error);
//     }
//   };

//   const handleConfirmExit = async () => {
//     setIsExiting(true);
//     stopListening();
//     router.push("/");
//   };

//   const radarData = [
//     { subject: "Communication", A: 56 },
//     { subject: "Fluency", A: 30 },
//     { subject: "Professionalism", A: 28 },
//     { subject: "Creativity", A: 12 },
//     { subject: "Problem Solving", A: 54 },
//     { subject: "Attitude", A: 34 },
//     { subject: "Confidence", A: 33 },
//   ];

//   return (
//     <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A]">
//       <Header />

//       {/* Navigation Buttons */}
//       <div className="flex justify-between items-center px-8 mt-4">
//         <button
//           onClick={() => router.push("/ai-dashboard")}
//           className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold text-[16px] rounded-[12px] px-6 h-[54px] shadow transition-colors"
//         >
//           ← Back to Dashboard
//         </button>
//         <button
//           onClick={() => setShowExitPopup(true)}
//           className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#2DC5DB] to-[#2B81D0] text-white font-semibold text-[16px] rounded-[12px] w-[162px] h-[54px] shadow"
//         >
//           Exit <FiLogOut />
//         </button>
//       </div>

//       {/* Interview Section */}
//       <div className="font-[Poppins] p-8 grid grid-cols-3 gap-8">
//         {/* LEFT SECTION */}
//         <div className="col-span-2 flex flex-col items-center mt-4">
//           <div className="w-full flex justify-between items-center mb-3 px-2">
//             <div className="flex gap-10 font-semibold text-[15px] text-[#09407F]">
//               <p>Round: {round || "1"}</p>
//               <p>Level: {level || "Easy"}</p>
//             </div>
//             <p className="text-[#2B7ECF] font-semibold mr-6">{timeLeft}s</p>
//           </div>

//           {questions.length > 0 && (
//             <div className="flex justify-center gap-4 mb-3">
//               {questions.map((_, idx) => {
//                 let bgColor = "#D9D9D9";
//                 if (idx < currentIndex) bgColor = "#F7D8FF";
//                 if (idx === currentIndex) bgColor = "#8BFFEC";
//                 return (
//                   <div
//                     key={idx}
//                     className="w-[34px] h-[35px] rounded-full flex items-center justify-center font-[Poppins] font-semibold text-[15px] text-[#000000]"
//                     style={{
//                       backgroundColor: bgColor,
//                       boxShadow:
//                         idx === currentIndex
//                           ? "0 0 4px 2px rgba(43, 129, 208, 0.5)"
//                           : "none",
//                     }}
//                   >
//                     {idx + 1}
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//           <p className="font-semibold text-[18px] text-[#09407F] mb-2 text-center">
//             Interviewer Aavi
//           </p>

//           <div className="relative w-[730px] h-[490px] rounded-[12px] overflow-hidden shadow bg-black border-[2px] border-[#2B81D0] mb-5">
//             <video
//               src="/avee.mp4"
//               autoPlay
//               loop
//               muted
//               playsInline
//               className="w-full h-full object-cover"
//             />
//             <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2">
//               <button
//                 onClick={listening ? stopListening : startListening}
//                 className="flex items-center gap-2 bg-[#7CE5FF] text-[#000000] 
//                     font-semibold text-[15px] w-[210px] h-[49px] rounded-[5px] 
//                     justify-center shadow-sm hover:opacity-90 transition-all"
//               >
//                 <FiMic />
//                 {listening ? "Recording..." : "Start Answer"}
//               </button>
//             </div>
//           </div>

//           {/* Question Display */}
//           <div className="bg-white rounded-[10px] shadow-md px-6 py-4 text-center text-[#000000] font-medium mb-4 w-[780px]">
//             Q{currentIndex + 1}.{" "}
//             {questions[currentIndex]?.question || "Loading..."}
//           </div>

//           {/* Transcript Display */}
//           <div className="bg-[#F0FAFF] border border-[#2DC5DB] rounded-[10px] shadow-sm px-6 py-4 text-[#000000] text-[15px] font-normal mb-5 w-[780px] text-left">
//             <p className="font-semibold text-[#09407F] mb-2">Your Answer:</p>
//             <p>{transcript || "Start speaking to record your answer..."}</p>
//           </div>

//           {/* Next Button */}
//           <div className="flex justify-center">
//             <button
//               onClick={handleNext}
//               className="w-[162px] h-[54px] rounded-[12px] bg-gradient-to-r 
//                   from-[#2DC5DB] to-[#2B81D0] text-[#000000] font-semibold shadow"
//             >
//               {currentIndex < questions.length - 1 ? "Next →" : "Finish"}
//             </button>
//           </div>
//         </div>

//         {/* RIGHT SIDE */}
//         <div className="flex flex-col items-center gap-6">
//           <p className="font-semibold text-[20px] text-[#09407F]">
//             Student video
//           </p>
//           <div className="rounded-[12px] overflow-hidden shadow bg-black w-[359px] h-[231px]">
//             <video
//               ref={videoRef}
//               autoPlay
//               muted
//               playsInline
//               className="w-full h-full object-cover"
//             />
//           </div>

//           <p className="text-[#09407F] font-semibold text-[15px]">
//             Domain:{" "}
//             <span className="text-[#09407F] font-semibold">
//               {domain || "Artificial Intelligence & Machine Learning"}
//             </span>
//           </p>

//           <div className="bg-white rounded-xl shadow p-4 w-full max-w-[359px]">
//             <h3 className="text-[#09407F] font-semibold text-[20px] mb-3">
//               AI Video Score
//             </h3>
//             <ResponsiveContainer width="100%" height={250}>
//               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
//                 <PolarGrid />
//                 <PolarAngleAxis dataKey="subject" />
//                 <PolarRadiusAxis angle={30} domain={[0, 100]} />
//                 <Radar
//                   name="Score"
//                   dataKey="A"
//                   stroke="#2B81D0"
//                   fill="#2DC5DB"
//                   fillOpacity={0.6}
//                 />
//               </RadarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>

//       {/* Exit Confirmation Popup */}
//       {showExitPopup && (
//         <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
//           <div className="bg-white rounded-[20px] shadow-lg w-[450px] p-8 text-center border-2 border-[#2B81D0]">
//             <div className="flex flex-col items-center">
//               <div className="text-[40px] mb-4">😢</div>
//               <h2 className="text-[#000000] font-[Poppins] font-semibold text-[24px] mb-2">
//                 Exiting now
//               </h2>
//               <p className="text-[#000000] font-[Poppins] text-[16px] mb-6">
//                 may affect your interview score
//               </p>
//               <div className="flex justify-center gap-4">
//                 <button
//                   onClick={() => setShowExitPopup(false)}
//                   className="w-[130px] h-[47px] rounded-[12px] font-[Poppins] font-semibold text-[16px] 
//                       text-white bg-gradient-to-r from-[#2DC5DA] to-[#2B84D0] shadow hover:opacity-90 transition-all"
//                 >
//                   Return
//                 </button>
//                 <button
//                   onClick={handleConfirmExit}
//                   disabled={isExiting}
//                   className="w-[130px] h-[47px] rounded-[12px] font-[Poppins] font-semibold text-[16px] 
//                       text-[#000000] border border-[#2B84D0] hover:bg-[#E9F6FF] transition-all"
//                 >
//                   {isExiting ? "Exiting..." : "Exit"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default function InterviewPage() {
//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <InterviewPageContent />
//     </Suspense>
//   );
// }

// ...existing code...


"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FiLogOut, FiMic } from "react-icons/fi";
import { Mic } from "lucide-react"; // <-- 1. IMPORT ADDED
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import Header from "../../components/Header";

function InterviewPageContent() {
  const videoRef = useRef(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const sessionId = searchParams.get("sessionId");

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [domain, setDomain] = useState("");
  const [level, setLevel] = useState("");
  const [round, setRound] = useState("");
  const [answers, setAnswers] = useState({});
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);

  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  // Helper: upload audio blob to /api/transcribe and return JSON
  const uploadRecording = async (fileBlob, sessionIdValue, questionId) => {
    const formData = new FormData();
    formData.append("file", fileBlob, "recording.webm");
    if (sessionIdValue) formData.append("session_id", sessionIdValue);
    if (questionId != null) formData.append("question_id", String(questionId));

    const res = await fetch("/api/transcribe", {
      method: "POST",
      body: formData, // DO NOT set Content-Type
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Transcribe failed: ${res.status} ${body}`);
    }
    return res.json();
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) router.push("/login");
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    const loadInterviewData = () => {
      try {
        const storedQuestions = sessionStorage.getItem("interviewQuestions");
        const storedConfig = sessionStorage.getItem("interviewConfig");
        const storedSessionId = sessionStorage.getItem("sessionId");

        if (storedQuestions && storedConfig && storedSessionId) {
          const questions = JSON.parse(storedQuestions);
          const config = JSON.parse(storedConfig);

          const formattedQuestions = questions.map((q) => ({
            ...q,
            id: `${storedSessionId}::${q.id}`,
          }));

          setQuestions(formattedQuestions);
          setDomain(config.jobRole || "Interview");
          setLevel(config.experienceLevel || "");
          setRound("1");

          const initialAnswers = {};
          formattedQuestions.forEach((q, index) => {
            initialAnswers[index] = "";
          });
          setAnswers(initialAnswers);
        } else {
          console.error("No interview data found. Redirecting to dashboard...");
          router.push("/ai-dashboard");
        }
      } catch (error) {
        console.error("Error loading interview data:", error);
        router.push("/ai-dashboard");
      }
    };

    loadInterviewData();
  }, [router]);

  useEffect(() => {
    const synth = window.speechSynthesis;

    const populateVoices = () => {
      setAvailableVoices(synth.getVoices());
    };

    if ("onvoiceschanged" in synth) {
      synth.onvoiceschanged = populateVoices;
    }

    populateVoices();

    return () => {
      if ("onvoiceschanged" in synth) {
        synth.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!sessionId || questions.length > 0) return;

    const fetchData = async () => {
      try {
        const { data: sessions } = await supabase
          .from("interview_sessions")
          .select("domain, type, round")
          .eq("id", sessionId);

        if (sessions && sessions.length > 0) {
          setDomain(sessions[0].domain);
          setLevel(sessions[0].type);
          setRound(sessions[0].round);
        }

        const { data: qData } = await supabase
          .from("interview_question")
          .select("question_code, question")
          .eq("session_id", sessionId);

        if (qData && qData.length > 0) {
          const formattedQuestions = qData.map((q) => ({
            id: q.question_code,
            question: q.question,
          }));

          setQuestions(formattedQuestions);
          const initialAnswers = {};
          formattedQuestions.forEach((q, index) => {
            initialAnswers[index] = "";
          });
          setAnswers(initialAnswers);
        }
      } catch (error) {
        console.error("Error fetching legacy interview data:", error);

        if (questions.length === 0) {
          router.push("/ai-dashboard");
        }
      }
    };
    fetchData();
  }, [sessionId, questions.length, router]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleNext(); // Automatically call handleNext when timer runs out
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => setTimeLeft(60), [currentIndex]);

  useEffect(() => {
    async function enableCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    }
    enableCamera();
  }, []);

  useEffect(() => {
    if (availableVoices.length === 0) {
      return;
    }

    if (questions.length > 0 && questions[currentIndex]?.question) {
      const utterance = new window.SpeechSynthesisUtterance(
        questions[currentIndex].question
      );

      let preferredVoice = null;

      preferredVoice = availableVoices.find(
        (voice) =>
          voice.lang.toLowerCase().includes("en-in") &&
          (voice.name.toLowerCase().includes("female") ||
            voice.name.toLowerCase().includes("sangeeta") ||
            voice.name.toLowerCase().includes("heena"))
      );

      if (!preferredVoice) {
        preferredVoice = availableVoices.find(
          (voice) =>
            voice.lang.startsWith("en") &&
            (voice.name.toLowerCase().includes("female") ||
              voice.name.toLowerCase().includes("sandra") ||
              voice.name.toLowerCase().includes("kate") ||
              voice.name.toLowerCase().includes("ava"))
        );
      }

      if (!preferredVoice) {
        preferredVoice = availableVoices.find(
          (voice) =>
            voice.lang.startsWith("en") &&
            !voice.name.toLowerCase().includes("male")
        );
      }

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      } else if (availableVoices.length > 0) {
        console.error(
          "Preferred (IN/Female) voice not found. Using default available voice:",
          availableVoices[0]?.name || "N/A"
        );
        utterance.voice = availableVoices[0];
      } else {
        console.error("No voices available for speech synthesis.");
      }

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }, [questions, currentIndex, availableVoices]);

  // --- 1. MODIFIED `startListening` ---
  // Simplified: Just starts the recorder.
  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunks.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.current.push(event.data);
      };

      // The 'onstop' logic is now in the `stopListening` function
      // to allow it to return a promise.

      mediaRecorder.start();
      setListening(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Could not access microphone. Please allow permissions.");
    }
  };

  // --- 2. MODIFIED `stopListening` ---
  // Now returns a Promise that resolves with the final transcript text.
  const stopListening = () => {
    return new Promise((resolve) => {
      // If recorder is already stopped, just set listening to false
      // and resolve with the transcript currently in state.
      if (
        !mediaRecorderRef.current ||
        mediaRecorderRef.current.state === "inactive"
      ) {
        setListening(false);
        resolve(transcript);
        return;
      }

      // Define 'onstop' here to get access to the 'resolve' function
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        let newTranscript = "(No response)";

        // Only upload if there's actually audio
        if (audioBlob.size > 0) {
          try {
            const qId = questions[currentIndex]?.id ?? null;
            const data = await uploadRecording(audioBlob, sessionId, qId);

            if (data?.text) {
              newTranscript = data.text;
            } else {
              console.error("No transcription text found:", data);
            }
          } catch (err) {
            console.error("Transcription error:", err);
          }
        }

        audioChunks.current = [];
        setTranscript(newTranscript); // Update UI
        setListening(false);
        resolve(newTranscript); // Resolve the promise with the final text
      };

      // Stop the recorder, which triggers the 'onstop' handler above
      mediaRecorderRef.current.stop();
    });
  };


  const handleNext = async () => {
   
    const answerText = await stopListening();

    if (!sessionId || !questions[currentIndex]) return;

    const qId = questions[currentIndex].id;
    const cleanAnswer = answerText.trim() || "(No response)";

    try {
      // Save the final, correct answer
      await supabase.from("interview_answers").upsert(
        [
          {
            session_id: sessionId,
            question_id: qId,
            response: cleanAnswer,
            created_at: new Date().toISOString(),
          },
        ],
        { onConflict: "session_id,question_id" }
      );

      setAnswers((prev) => ({
        ...prev,
        [qId]: cleanAnswer,
      }));

      // Move to the next question or finish
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
        setTranscript(""); // Clear transcript for the new question
      } else {
        // Finished interview
        const res = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (!res.ok) {
          console.error("Evaluation failed:", await res.json());
          return;
        }

        router.push(`/interview/completed?sessionId=${sessionId}`);
      }
    } catch (error) {
      console.error("Error saving answer:", error);
    }
  };

  // This simple handler is for the "Start/Submit" button
  const handleToggleListening = () => {
    if (listening) {
      stopListening(); // Just call it, don't await. It will update state.
    } else {
      startListening();
    }
  };

  const handleConfirmExit = async () => {
    setIsExiting(true);
    await stopListening(); // Ensure recording stops before exiting
    router.push("/ai-dashboard");
  };

  const radarData = [
    { subject: "Communication", A: 56 },
    { subject: "Fluency", A: 30 },
    { subject: "Professionalism", A: 28 },
    { subject: "Creativity", A: 12 },
    { subject: "Problem Solving", A: 54 },
    { subject: "Attitude", A: 34 },
    { subject: "Confidence", A: 33 },
  ];

  return (
    <>
      <div className="w-full">
        <Header />
      </div>
      <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A]">
        <div className="flex justify-between items-center px-8 mt-1 mb-0">
          <div className="grid grid-cols-[auto_1fr] gap-x-2 font-semibold text-[16px] text-[#09407F]">
            {/* Row 1 */}
            <p className="mb-0">Round:</p>
            <p className="mb-0">{round || "1"}</p>

            {/* Row 2 */}
            <p>Level:</p>
            <p>{level || "Easy"}</p>
          </div>

          {questions.length > 0 && (
            /* CHANGED: Added 'w-full' to ensure perfect centering */
            <div className="flex w-full justify-center gap-1 my-4 px-8">
              {questions.map((_, idx) => {
                let bgColor = "#D9D9D9";
                if (idx < currentIndex) bgColor = "#F7D8FF";
                if (idx === currentIndex) bgColor = "#8BFFEC";
                return (
                  <div
                    key={idx}
                    className="w-[34px] h-[35px] rounded-full flex items-center justify-center font-[Poppins] font-semibold text-[15px] text-[#000000]"
                    style={{
                      backgroundColor: bgColor,
                      boxShadow:
                        idx === currentIndex
                          ? "0 0 4px 2px rgba(43, 129, 208, 0.5)"
                          : "none",
                    }}
                  >
                    {idx + 1}
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setShowExitPopup(true)}
            className="flex items-center justify-center gap-1 bg-gradient-to-r from-[#2DC5DB] to-[#2B81D0] text-white font-semibold text-[8px] rounded-[12px] w-[162px] h-[44px] shadow"
            style={{ borderRadius: "8px" }}
          >
            Exit <FiLogOut />
          </button>
        </div>

        <div className="font-[Poppins] px-8 pb-8 grid grid-cols-3 gap-8">
          {/* LEFT SECTION */}
          <div className="col-span-2 flex flex-col items-center">
            {/* START OF CHANGES */}
            <div className="w-full flex justify-between  px-2">
              <p className="font-semibold items-center text-[18px] text-[#09407F] w-full text-center">
                Interviewer Aavi
              </p>
            </div>

            {/* This <p> tag was removed from here */}
            <div className="bg-white rounded-[10px] shadow-md px-4 py-3 text-left text-[#000000] font-medium mb-2 w-[680px]">
              Q{currentIndex + 1}.{" "}
              {questions[currentIndex]?.question || "Loading..."}
            </div>

            {/* --- 3. VIDEO CONTAINER MODIFIED --- */}
            <div className="relative w-[700px] h-[470px] rounded-[12px] overflow-hidden shadow  border-[2px]  mb-3">
              {/* --- NEW RECORDING INDICATOR (TOP-LEFT) --- */}
              {listening && (
                <div className="absolute top-5 left-5 z-10">
                  <div className="flex items-center gap-2 text-red-600/90  font-medium px-4 py-2 font-bold ">
                    <Mic className="animate-pulse" size={18} />
                    <span>Recording</span>
                  </div>
                </div>
              )}

              {/* --- NEW TIMER (TOP-RIGHT) --- */}
              <div className="absolute top-5 right-5 z-10">
               <p className="bg-red-50 text-red-500 font-semibold flex items-center justify-center w-12 h-12 rounded-full border !border-red-500">
  <span className="animate-pulse">
    {timeLeft}s
  </span>
</p>
              </div>

              {/* --- Existing Video Elements --- */}
              <video
                src="/AVEE2.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <video
                src="/RC.mp4" // <-- !! REPLACE WITH YOUR SPEAKING VIDEO FILE !!
                autoPlay
                loop
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  listening ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* CHANGED: Aligned to bottom-left */}
              <div className="absolute bottom-5 left-5 z-10">
                <button
                  // --- CLICK HANDLER CHANGED ---
                  onClick={handleToggleListening}
                  className="flex items-center gap-2 bg-[#7CE5FF] text-[#000000] 
                    font-semibold text-[15px] w-[150px] h-[45px] rounded-[5px] 
                    justify-center shadow-sm hover:opacity-90 transition-all"
                  style={{
                    borderRadius: "8px",
                    background:
                      "linear-gradient(to right, #2DC2DB , #2B87D0)",
                  }}
                >
                  <FiMic />
                  {listening ? "Submit..." : "Start Answer"}
                </button>
              </div>

              
              <div className="absolute bottom-5 right-5 z-10">
                <button
                  onClick={handleNext}
                  className="w-[120px] h-[44px] rounded-[12px] bg-gradient-to-r 
                    from-[#2DC5DB] to-[#2B81D0] text-[#000000] font-semibold shadow"
                  style={{
                    borderRadius: "8px",
                    background:
                      "linear-gradient(to right, #2DC2DB , #2B87D0)",
                  }}
                >
                  {currentIndex < questions.length - 1 ? "Next →" : "Finish"}
                </button>
              </div>
            </div>

            <div className="bg-[#F0FAFF] border border-[#2DC5DB] rounded-[10px] shadow-sm px-2 py-1 text-[#000000] text-[15px] font-normal mb-5 w-[720px] text-left">
              <p className="font-semibold text-[#09407F] mb-2">Your Answer:</p>
              <p>{transcript || "Start speaking to record your answer..."}</p>
            </div>

            {/* Next Button was here, but has been MOVED into the video div */}
          </div>

          <div className="flex flex-col items-center gap-3 pt-5">
            <p className="font-semibold text-[20px] text-[#09407F]">
              Student video
            </p>
            <div className="rounded-[12px] overflow-hidden shadow bg-black w-[329px] h-[201px]">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-[#09407F] font-semibold text-[15px]">
              Domain:{" "}
              <span className="text-[#09407F] font-semibold">
                {domain || "Artificial Intelligence & Machine Learning"}
              </span>
            </p>

            <div className="bg-white rounded-xl shadow p-4 w-full max-w-[299px]">
              <p className="text-[#09407F] font-semibold text-[14px] ">
                AI Video Score
              </p>
              <ResponsiveContainer width="100%" height={200} className="-mt-8">
                <RadarChart cx="50%" cy="50%" outerRadius="40%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Score"
                    dataKey="A"
                    stroke="#2B81D0"
                    fill="#2DC5DB"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Exit Confirmation Popup */}
        {showExitPopup && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-[20px] shadow-lg w-[450px] p-8 text-center border-2 border-[#2B81D0]">
              <div className="flex flex-col items-center">
                <div className="text-[40px] mb-4">😢</div>
                <h2
                  className="text-[#000000] font-[Poppins] font-semibold text-[24px] mb-2"
                  style={{ borderRadius: "8px" }}
                >
                  Exiting now
                </h2>
                <p className="text-[#000000] font-[Poppins] text-[16px] mb-6">
                  may affect your interview score
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowExitPopup(false)}
                    className="w-[130px] h-[47px] rounded-[12px] font-[Poppins] font-semibold text-[16px] 
                      text-white bg-gradient-to-r from-[#2DC5DA] to-[#2B84D0] shadow hover:opacity-90 transition-all"
                    style={{
                      borderRadius: "8px",
                      background:
                        "linear-gradient(to right, #2DC2DB , #2B87D0)",
                    }}
                  >
                    Return
                  </button>
                  <button
                    onClick={handleConfirmExit}
                    disabled={isExiting}
                    className="w-[130px] h-[47px] rounded-[12px] font-[Poppins] font-semibold text-[16px] 
                      text-[#000000] border border-[#2B84D0] hover:bg-[#E9F6FF] transition-all"
                    style={{ borderRadius: "8px" }}
                  >
                    {isExiting ? "Exiting..." : "Exit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}


export default function InterviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InterviewPageContent />
    </Suspense>
  );
}