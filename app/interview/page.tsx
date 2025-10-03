"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/client";
import Header from "../components/Header";
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

  // States
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [domain, setDomain] = useState("");

  // ✅ Keep all answers in memory
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      }
    };
    checkUser();
  }, [router]);

  // ✅ Fetch questions + session domain
  useEffect(() => {
    if (!sessionId) return;

    const fetchData = async () => {
      const { data: sessions } = await supabase
        .from("interview_sessions")
        .select("domain")
        .eq("id", sessionId);

      if (sessions && sessions.length > 0) {
        setDomain(sessions[0].domain);
      }

      const { data: qData } = await supabase
        .from("interview_question")
        .select("id, question")
        .eq("session_id", sessionId);

      if (qData) setQuestions(qData);
    };

    fetchData();
  }, [sessionId]);

  // ✅ Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleNext();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => setTimeLeft(60), [currentIndex]);

  // ✅ Webcam
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

  // 🎤 Start Speech Recognition
  const startListening = () => {
    if (listening) return;
    setListening(true);
    setTranscript("");

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

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

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  // 🎤 Stop Speech Recognition
  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  // ✅ Save & Go Next
  const handleNext = async () => {
    if (questions[currentIndex]) {
      const qId = questions[currentIndex].id;

      // Save in memory
      setAnswers((prev) => ({
        ...prev,
        [qId]: transcript || "(No response)",
      }));

      // Auto-save to Supabase (so progress is never lost)
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
      // ✅ On last question → Final save + Evaluation
      try {
        // Bulk final save (just in case)
        const finalPayload = Object.entries(answers).map(([qId, resp]) => ({
          session_id: sessionId,
          question_id: qId,
          response: resp,
        }));

        if (finalPayload.length > 0) {
          await supabase.from("interview_answers").upsert(finalPayload);
        }

        // Trigger evaluation
        const res = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (!res.ok) {
          console.error("Evaluation failed:", await res.json());
          return;
        }

        const { evaluation } = await res.json();
        console.log("Evaluation complete:", evaluation);

        router.push(`/interview/completed?sessionId=${sessionId}`);
      } catch (error) {
        console.error("Error running evaluation:", error);
      }
    }
  };

  // ✅ Exit interview safely
  const handleExit = () => {
    stopListening();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Header />

      <div className="p-6 grid grid-cols-3 gap-6">
        {/* Left */}
        <div className="col-span-2">
          {/* Top bar */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {questions.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold ${
                    idx === currentIndex
                      ? "bg-gradient-to-r from-[#2DC7DB] to-[#2B7ECF] text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {idx + 1}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <p className="text-blue-600 font-semibold">{timeLeft}s</p>
              <button
                onClick={handleExit}
                className="flex items-center gap-1 border px-4 py-1 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Exit <FiLogOut />
              </button>
            </div>
          </div>

          {/* AI Video */}
          <div className="relative w-full h-[450px] rounded-xl overflow-hidden shadow bg-black">
            <video
              src="/ai-interviewer.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-white p-1 rounded-full shadow">
              👑
            </div>

            <button
              onClick={listening ? stopListening : startListening}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#7CE5FF] text-black px-6 py-2 rounded-lg shadow font-semibold"
            >
              <FiMic /> {listening ? "Listening..." : "Start Answer"}
            </button>
          </div>

          {/* Question */}
          <div className="mt-4 bg-white rounded-lg shadow p-3 text-center font-medium">
            {questions[currentIndex]?.question || "Loading..."}
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="mt-2 bg-gray-100 rounded-lg p-3 text-center text-gray-700">
              {transcript}
            </div>
          )}

          {/* Next */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleNext}
              className="px-8 py-2 rounded-lg bg-gradient-to-r from-[#2DC7DB] to-[#2B7ECF] text-white font-semibold shadow"
            >
              {currentIndex < questions.length - 1 ? "Next →" : "Finish"}
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6 flex flex-col items-center">
          <div className="w-[260px] aspect-[3/4] rounded-xl overflow-hidden shadow bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          {/* ✅ Dynamic Domain */}
          <p className="font-bold text-center text-[#2B7ECF]">
            Domain: {domain || "Loading..."}
          </p>

          {/* Radar Chart (dummy sidebar) */}
          <div className="bg-white rounded-xl shadow p-4 w-full">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-700">
                AI Video Score
              </h3>
              <span className="text-gray-400 cursor-pointer">ℹ️</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[]}>
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
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
