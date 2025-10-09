"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/client";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { FiMic, FiLogOut } from "react-icons/fi";

export default function InterviewPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const sessionId = searchParams.get("sessionId");

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [domain, setDomain] = useState("");
  const [level, setLevel] = useState("");
  const [round, setRound] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) router.push("/login");
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    if (!sessionId) return;
    const fetchData = async () => {
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
        .select("id, question")
        .eq("session_id", sessionId);

      if (qData) setQuestions(qData);
    };
    fetchData();
  }, [sessionId]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleNext();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => setTimeLeft(60), [currentIndex]);

  useEffect(() => {
    async function enableCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    }
    enableCamera();
  }, []);

  const startListening = () => {
    if (listening) return;
    setListening(true);
    setTranscript("");
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        text += event.results[i][0].transcript + " ";
      }
      setTranscript(text.trim());
    };
    recognition.onerror = (e: any) => {
      console.error("Recognition error:", e.error);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const handleNext = async () => {
    if (questions[currentIndex]) {
      const qId = questions[currentIndex].id;
      setAnswers((prev) => ({
        ...prev,
        [qId]: transcript || "(No response)",
      }));

      await supabase.from("interview_answers").upsert([
        {
          session_id: sessionId,
          question_id: qId,
          response: transcript || "(No response)",
        },
      ]);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setTranscript("");
    } else {
      try {
        const finalPayload = Object.entries(answers).map(([qId, resp]) => ({
          session_id: sessionId,
          question_id: qId,
          response: resp,
        }));
        if (finalPayload.length > 0) {
          await supabase.from("interview_answers").upsert(finalPayload);
        }
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
      } catch (error) {
        console.error("Error running evaluation:", error);
      }
    }
  };

  const handleConfirmExit = async () => {
    setIsExiting(true);
    stopListening();
    router.push("/");
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
    <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A] flex">
      {/* ✅ Sidebar */}
      <Sidebar />

      {/* ✅ Main Section */}
      <div className="flex-1 relative">
        <Header />

        {/* Exit Button */}
        <div className="flex justify-end pr-8 mt-4">
          <button
            onClick={() => setShowExitPopup(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#2DC5DB] to-[#2B81D0] text-white font-semibold text-[16px] rounded-[12px] w-[162px] h-[54px] shadow"
          >
            Exit <FiLogOut />
          </button>
        </div>

        {/* Interview Section */}
        <div className="font-[Poppins] p-8 grid grid-cols-3 gap-8">
          {/* LEFT SECTION */}
          <div className="col-span-2 flex flex-col items-center mt-4">
            {/* Round + Level */}
            <div className="w-full flex justify-between items-center mb-3 px-2">
              <div className="flex gap-10 font-semibold text-[15px] text-[#09407F]">
                <p>Round: {round || "1"}</p>
                <p>Level: {level || "Easy"}</p>
              </div>
              <p className="text-[#2B7ECF] font-semibold mr-6">{timeLeft}s</p>
            </div>

            {/* Tracker */}
            {questions.length > 0 && (
              <div className="flex justify-center gap-4 mb-3">
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

            {/* Interviewer */}
            <p className="font-semibold text-[18px] text-[#09407F] mb-2 text-center">
              Interviewer Aavi
            </p>

            {/* Interviewer Video */}
            <div className="relative w-[830px] h-[490px] rounded-[12px] overflow-hidden shadow bg-black border-[2px] border-[#2B81D0] mb-5">
              <video
                src="/ai-interviewer.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={listening ? stopListening : startListening}
                  className="flex items-center gap-2 bg-[#7CE5FF] text-[#000000] 
                            font-semibold text-[15px] w-[210px] h-[49px] rounded-[5px] 
                            justify-center shadow-sm hover:opacity-90 transition-all"
                >
                  <FiMic />
                  {listening ? "Listening..." : "Start Answer"}
                </button>
              </div>
            </div>

            {/* Question Display */}
            <div className="bg-white rounded-[10px] shadow-md px-6 py-4 text-center text-[#000000] font-medium mb-4 w-[780px]">
              Q{currentIndex + 1}.{" "}
              {questions[currentIndex]?.question || "Loading..."}
            </div>

            {/* Next / Finish Button */}
            <div className="flex justify-center">
              <button
                onClick={handleNext}
                className="w-[162px] h-[54px] rounded-[12px] bg-gradient-to-r 
                            from-[#2DC5DB] to-[#2B81D0] text-[#000000] font-semibold shadow"
              >
                {currentIndex < questions.length - 1 ? "Next →" : "Finish"}
              </button>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col items-center gap-6">
            <p className="font-semibold text-[20px] text-[#09407F]">
              Student video
            </p>
            <div className="rounded-[12px] overflow-hidden shadow bg-black w-[359px] h-[231px]">
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

            <div className="bg-white rounded-xl shadow p-4 w-full max-w-[359px]">
              <h3 className="text-[#09407F] font-semibold text-[20px] mb-3">
                AI Video Score
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
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

        {/* 🔹 Exit Confirmation Popup */}
        {showExitPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-[20px] shadow-lg w-[450px] p-8 text-center border-2 border-[#2B81D0]">
              <div className="flex flex-col items-center">
                <div className="text-[40px] mb-4">😢</div>
                <h2 className="text-[#000000] font-[Poppins] font-semibold text-[24px] mb-2">
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
                  >
                    Return
                  </button>
                  <button
                    onClick={handleConfirmExit}
                    disabled={isExiting}
                    className="w-[130px] h-[47px] rounded-[12px] font-[Poppins] font-semibold text-[16px] 
                              text-[#000000] border border-[#2B84D0] hover:bg-[#E9F6FF] transition-all"
                  >
                    {isExiting ? "Exiting..." : "Exit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
