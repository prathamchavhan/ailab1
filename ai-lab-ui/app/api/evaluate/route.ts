import { NextResponse } from "next/server";
import { createClientForRoute } from "@/lib/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const supabase = await createClientForRoute();

    // 1️⃣ Fetch answers + questions
    const { data: answers, error: answersError } = await supabase
      .from("interview_answers")
      .select(`
        response,
        interview_question ( question )
      `)
      .eq("session_id", sessionId);

    if (answersError || !answers?.length) {
      console.error("❌ Error fetching answers:", answersError);
      return NextResponse.json({ error: "No answers found" }, { status: 404 });
    }

    // ✅ Format data
    const qas = answers.map((a: any) => ({
      question: a.interview_question?.question || "Unknown question",
      answer: a.response || "",
    }));

    // 2️⃣ Get user_id from session
    const { data: sessionData, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("user_id")
      .eq("id", sessionId)
      .single();

    if (sessionError || !sessionData?.user_id) {
      console.error("❌ Session fetch error:", sessionError);
      return NextResponse.json({ error: "Invalid session" }, { status: 500 });
    }

    // 3️⃣ Send to FastAPI
    const FASTAPI_URL =
      process.env.NEXT_PUBLIC_ML_API_URL || "http://127.0.0.1:8000/evaluate";

    const response = await fetch(FASTAPI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        qas,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ FastAPI error:", text);
      return NextResponse.json(
        { error: "Evaluation failed", details: text },
        { status: 500 }
      );
    }

    const evaluation = await response.json();

    // 4️⃣ Store results
    const { error: insertError } = await supabase
      .from("interview_results")
      .upsert([
        {
          session_id: sessionId,
          user_id: sessionData.user_id,
          final_score: evaluation.final_score,
          radar_scores: evaluation.radar_scores,
          feedback: evaluation.feedback,
        },
      ]);

    if (insertError) {
      console.error("⚠️ Supabase insert error:", insertError);
      return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
    }

    // 5️⃣ Return
    return NextResponse.json({
      success: true,
      message: "Evaluation completed successfully",
      evaluation,
    });
  } catch (error: any) {
    console.error("🔥 Evaluation API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
