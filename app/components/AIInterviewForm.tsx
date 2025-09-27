"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { model } from "@/lib/geminiClient";

export default function AIInterviewForm() {
  const [level, setLevel] = useState("Easy");
  const [round, setRound] = useState("R1");
  const [domain, setDomain] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const roundQuestions = { R1: 5, R2: 7, R3: 10 };

  const handleStart = async () => {
    if (!domain || !company) {
      alert("Please fill in both Domain and Company");
      return;
    }

    setLoading(true);

    try {
      const { data: session, error: sessionError } = await supabase
        .from("interview_sessions")
        .insert([{ type: level, domain, round, company }])
        .select()
        .single();

      if (sessionError) throw sessionError;

      const numQuestions = roundQuestions[round as keyof typeof roundQuestions];

      const prompt = `You are an expert interview question generator.

Generate ${numQuestions} unique and domain-specific interview questions 
for a candidate applying in the field of "${domain}" at "${company}".

Difficulty: ${level}.
Round: ${round}.

The questions should test both theoretical knowledge and practical problem-solving in ${domain}.
Return ONLY the list of questions, one per line, no numbering, no explanations.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const questions = text
        .split("\n")
        .map((q) => q.replace(/^\d+[\).\s]/, "").trim())
        .filter((q) => q.length > 0);

      const formattedQuestions = questions.map((q) => ({
        round,
        question: q,
        session_id: session.id,
      }));

      const { error: qError } = await supabase
        .from("interview_question")
        .insert(formattedQuestions);

      if (qError) throw qError;

      router.push(`/interview?sessionId=${session.id}`);
    } catch (err) {
      console.error("❌ Error generating questions:", err);
      alert("Something went wrong while generating questions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Loader only in the middle, no dark overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <img src="/loading.gif" alt="Loading..." className="w-24 h-24" />
        </div>
      )}

      <h2 className="text-2xl font-bold text-center mb-4">
        AI{" "}
        <span className="bg-gradient-to-r from-[#191717] to-[#2B96D3] bg-clip-text text-transparent">
          Interview
        </span>
      </h2>

      <div
        className={`bg-gradient-to-b from-[#C8F4F9] via-[#B0E7ED] to-[#F1FDFF] p-6 rounded-2xl shadow ${
          loading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {/* Level */}
        <div className="mb-4">
          <p className="text-gray-700 font-semibold mb-2">Level</p>
          <div className="flex gap-4">
            {["Easy", "Medium", "Hard"].map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  level === l
                    ? "bg-gradient-to-r from-[#2DC7DB] to-[#2B7ECF] text-white"
                    : "bg-white border text-gray-700"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Round */}
        <div className="mb-4">
          <p className="text-gray-700 font-semibold mb-2">Round</p>
          <div className="flex gap-4">
            {["R1", "R2", "R3"].map((r) => (
              <button
                key={r}
                onClick={() => setRound(r)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  round === r
                    ? "bg-gradient-to-r from-[#2DC7DB] to-[#2B7ECF] text-white"
                    : "bg-white border text-gray-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Domain (e.g. Frontend Development, Accounting)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full rounded-lg px-4 py-2 border shadow-sm"
          />
          <input
            type="text"
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full rounded-lg px-4 py-2 border shadow-sm"
          />
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={loading}
          className="mt-4 w-full py-2 rounded-lg shadow-md bg-gradient-to-r from-[#2DC7DB] to-[#2B7ECF] text-white font-semibold disabled:opacity-50"
        >
          {loading ? "Generating..." : "Start"}
        </button>
      </div>
    </div>
  );
}
