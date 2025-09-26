"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";

export default function CompletedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ✅ get sessionId from URL query
  const sessionId = searchParams.get("sessionId");

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Header />

      <div className="flex flex-col items-center justify-center h-[80vh] text-center">
        {/* Title */}
        <h2 className="text-2xl font-bold">
          Thank you <span className="text-blue-600">Devashish Dhumal</span>! 🎉
        </h2>
        <p className="mt-2 text-xl font-semibold text-blue-900">
          Completed an interview
        </p>

        {/* Progress messages */}
        <ul className="mt-6 space-y-2 text-blue-700 font-medium">
          <li>✔ Responses are being uploaded…</li>
          <li>✔ The interview is being analyzed…</li>
          <li>✔ Actionable feedback is being created…</li>
        </ul>

        {/* Navigate to Analytics with sessionId */}
        <button
          onClick={() =>
            router.push(`/interview/analytics?sessionId=${sessionId}`)
          }
          disabled={!sessionId} // 🔒 prevent navigation if sessionId missing
          className="mt-6 px-8 py-2 rounded-lg bg-gradient-to-r from-[#2DC7DB] to-[#2B7ECF] text-white font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          VIEW ANALYTICS
        </button>
      </div>
    </div>
  );
}
