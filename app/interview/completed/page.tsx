"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { createClient } from "@/lib/utils/supabase/client";

export default function CompletedPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("sessionId");

  const [userName, setUserName] = useState<string>("User");
  const [score, setScore] = useState<number | null>(null);

  // ✅ Fetch logged-in user name
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Error fetching user:", error);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("name") // 👈 in your schema, the field is "name", not "full_name"
        .eq("user_id", user.id)
        .single();

      if (profile?.name) {
        setUserName(profile.name);
      } else if (user.user_metadata?.name) {
        setUserName(user.user_metadata.name);
      } else {
        setUserName(user.email || "User");
      }
    };

    fetchUser();
  }, []);

  // ✅ Fetch latest score for this session
  useEffect(() => {
    const fetchScore = async () => {
      if (!sessionId) return;

      const { data, error } = await supabase
        .from("interview_results")
        .select("final_score")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setScore(data.final_score);
      }
    };

    fetchScore();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Header />

      <div className="flex flex-col items-center justify-center h-[80vh] text-center">
        <h2 className="text-2xl font-bold">
          Thank you <span className="text-blue-600">{userName}</span>! 🎉
        </h2>
        <p className="mt-2 text-xl font-semibold text-blue-900">
          Completed an interview
        </p>

        {score !== null && (
          <p className="mt-4 text-lg font-bold text-green-700">
            Your Score: {score}
          </p>
        )}

        <ul className="mt-6 space-y-2 text-blue-700 font-medium">
          <li>✔ Responses are being uploaded…</li>
          <li>✔ The interview is being analyzed…</li>
          <li>✔ Actionable feedback is being created…</li>
        </ul>

        <button
          onClick={() =>
            router.push(`/interview/analytics?sessionId=${sessionId}`)
          }
          disabled={!sessionId}
          className="mt-6 px-8 py-2 rounded-lg bg-gradient-to-r from-[#2DC7DB] to-[#2B7ECF] text-white font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          VIEW ANALYTICS
        </button>
      </div>
    </div>
  );
}
