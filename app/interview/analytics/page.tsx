"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/app/components/Header";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("sessionId");

  // States
  const [finalScore, setFinalScore] = useState<number>(0);
  const [domain, setDomain] = useState<string>("Not available");
  const [radarScores, setRadarScores] = useState<any[]>([]);
  const [feedbackStrengths, setFeedbackStrengths] = useState<string[]>([]);
  const [feedbackImprovements, setFeedbackImprovements] = useState<string[]>([]);

  // ✅ Fetch analytics
  useEffect(() => {
    if (!sessionId) return;

    const fetchResult = async () => {
      const { data, error } = await supabase
        .from("interview_results")
        .select("*")
        .eq("session_id", sessionId)
        .single();

      if (error) {
        console.error("Error fetching analytics:", error);
        return;
      }

      setFinalScore(data?.final_score ?? 0);
      setDomain(data?.domain ?? "Not available");
      setRadarScores(data?.radar_scores ?? []);
      setFeedbackStrengths(
        Array.isArray(data?.feedback_strengths)
          ? data.feedback_strengths
          : []
      );
      setFeedbackImprovements(
        Array.isArray(data?.feedback_improvements)
          ? data.feedback_improvements
          : []
      );
    };

    fetchResult();
  }, [sessionId]);

  // ✅ Download as PDF
  const handleDownloadReport = async () => {
    const element = document.getElementById("analytics-report");
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Scale image to fit A4
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`interview_report_${sessionId}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Header />

      <div
        id="analytics-report"
        className="p-6 grid grid-cols-3 gap-6"
      >
        {/* Left side */}
        <div className="col-span-2 space-y-6">
          {/* Final Score Card */}
          <div className="bg-[#103E50] text-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold">Your Final AI Interview Score</h2>
            <p className="text-3xl font-bold mt-2">{finalScore}/100</p>
            <p className="mt-1">Domain: {domain}</p>
          </div>

          {/* Radar Chart */}
          <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarScores}>
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

          {/* Practice Again */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleDownloadReport}
              className="px-6 py-2 rounded-lg bg-green-500 text-white font-semibold shadow"
            >
              Download Report (PDF)
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#2DC7DB] to-[#2B7ECF] text-white font-semibold shadow"
            >
              Practice Again
            </button>
          </div>
        </div>

        {/* Right side */}
        <div className="space-y-6">
          {/* Feedback */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-bold mb-4">Key Feedback</h3>
            <ul className="space-y-3">
              {feedbackStrengths.length > 0 && (
                <li>
                  <span className="text-green-600 font-semibold">
                    ✔ Strengths
                  </span>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {feedbackStrengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </li>
              )}
              {feedbackImprovements.length > 0 && (
                <li>
                  <span className="text-red-600 font-semibold">
                    ⚠ Improvements
                  </span>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {feedbackImprovements.map((i, idx) => (
                      <li key={idx}>{i}</li>
                    ))}
                  </ul>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
