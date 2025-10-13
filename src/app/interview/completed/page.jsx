"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Header from "../../../components/Header";

function CompletedPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const sessionId = searchParams.get("sessionId");
  const [userName, setUserName] = useState("User");
  const [score, setScore] = useState(null);

  // ✅ Fetch logged-in user name
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        console.error("Error fetching user:", error);
        return;
      }

      const user = data.user;

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
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

      {/* ✅ Main content area */}
      <div className="flex flex-col">
        {/* ✅ Center content */}
        <div className="flex flex-col items-center justify-center flex-1 text-center px-6 space-y-8">
          {/* Thank You */}
          <h2
            className="font-[Poppins] font-semibold text-[36px] leading-[100%] text-[#0029A3]"
            style={{ letterSpacing: "0px" }}
          >
            Thank you {userName}!
          </h2>

          {/* Completed */}
          <p
            className="font-[Poppins] font-bold text-[36px] leading-[100%] text-[#0029A3]"
            style={{ letterSpacing: "0px" }}
          >
            Completed an interview
          </p>

          {/* Status Lines */}
          <ul className="space-y-4 font-[Poppins] text-[24px] font-medium leading-[100%] text-[#0029A3] tracking-[0px]">
            <li>✔ Responses are being uploaded...</li>
            <li>✔ The interview is being analyzed...</li>
            <li>✔ Actionable feedback is being created...</li>
          </ul>

          {/* ✅ View Analytics Button */}
          <button
            onClick={() =>
              router.push(`/interview/analytics?sessionId=${sessionId}`)
            }
            disabled={!sessionId}
            className="w-[325px] h-[75px] rounded-[12px] bg-gradient-to-r from-[#2DC6DB] to-[#2B83D0] text-white font-[Poppins] font-semibold text-[20px] shadow hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            VIEW ANALYTICS
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompletedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompletedPageContent />
    </Suspense>
  );
}
