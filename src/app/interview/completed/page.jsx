"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Header from "../../../components/Header";
import { CheckCheck } from 'lucide-react';
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
        <div className="flex flex-col items-center justify-center flex-1 text-center px-6 mt-22" >
          {/* Thank You */}
          <p
            className=" font-semibold text-[36px] leading-[100%] text-[#0029A3]  !mb-9"
            style={{ letterSpacing: "3px", font: 'Poppins' }}
          >
            Thank you {userName}!
          </p>

          {/* Completed */}
          <p
            className="font-bold text-[27px] leading-[100%]  text-[#0029A3] !mb-12"
            style={{ letterSpacing: "0px",font:'Poppins' }}
          >
            Completed an interview
          </p>

          {/* Status Lines */}
         <ul className="space-y-9  text-[20px] font-medium leading-[100%] text-[#0029A3] tracking-[0px] !mb-18"    style={{  font: 'Poppins' }}>
    <li className="flex items-center gap-4">
      <CheckCheck className="text-green-500" size={24} />
      Responses are being uploaded...
    </li>
    <li className="flex items-center gap-4">
      <CheckCheck className="text-green-500" size={24} />
      The interview is being analyzed...
    </li>
    <li className="flex items-center gap-4">
      <CheckCheck className="text-green-500" size={24} />
      Actionable feedback is being created...
    </li>
  </ul>

          {/* ✅ View Analytics Button */}
          <button
            onClick={() =>
              router.push(`/interview/analytics?sessionId=${sessionId}`)
            }
            disabled={!sessionId}
            className="w-[265px] h-[55px] rounded-[12px] bg-gradient-to-r from-[#2DC6DB] to-[#2B83D0] text-white font-[Poppins] font-bold text-[25px] shadow hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ borderRadius: "8px" }}    >
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
