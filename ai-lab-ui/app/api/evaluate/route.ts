// import { NextResponse } from "next/server";
// import { createClientForRoute } from "@/lib/utils/supabase/server";

// export async function POST(req: Request) {
//   try {
//     const { sessionId } = await req.json();

//     if (!sessionId) {
//       return NextResponse.json(
//         { error: "Missing sessionId" },
//         { status: 400 }
//       );
//     }

//     const supabase = await createClientForRoute();

//     // 1️⃣ Fetch answers with joined question text
//     const { data: answers, error: answersError } = await supabase
//       .from("interview_answers")
//       .select(`
//         response,
//         interview_question ( question )
//       `)
//       .eq("session_id", sessionId);

//     if (answersError) {
//       console.error("❌ Error fetching answers:", answersError);
//       return NextResponse.json(
//         { error: "Failed to fetch answers" },
//         { status: 500 }
//       );
//     }

//     if (!answers || answers.length === 0) {
//       return NextResponse.json(
//         { error: "No answers found for this session" },
//         { status: 404 }
//       );
//     }

//     // ✅ Format Q&A for FastAPI model
//     const qas = answers.map((a: any) => ({
//       question: a.interview_question?.question || "Unknown question",
//       answer: a.response || "",
//     }));

//     console.log("📦 Prepared QAs:", qas.length);

//     // 2️⃣ Fetch session → user_id
//     const { data: sessionData, error: sessionError } = await supabase
//       .from("interview_sessions")
//       .select("user_id")
//       .eq("id", sessionId)
//       .limit(1)
//       .single();

//     if (sessionError || !sessionData?.user_id) {
//       console.error("❌ Error fetching session:", sessionError);
//       return NextResponse.json(
//         { error: "Failed to fetch session or user" },
//         { status: 500 }
//       );
//     }

//     // 3️⃣ Send data to FastAPI ML model
//     const FASTAPI_URL =
//       process.env.NEXT_PUBLIC_ML_API_URL || "http://127.0.0.1:8000/evaluate";

//     console.log("🚀 Sending data to FastAPI:", FASTAPI_URL);

//     const response = await fetch(FASTAPI_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         session_id: sessionId,
//         qas,
//       }),
//     });

//     if (!response.ok) {
//       const text = await response.text();
//       console.error("❌ FastAPI error response:", text);
//       return NextResponse.json(
//         { error: "FastAPI evaluation failed", details: text },
//         { status: 500 }
//       );
//     }

//     const evaluation = await response.json();
//     console.log("✅ ML Model Evaluation:", evaluation);

//     // 4️⃣ Save results into Supabase
//     const { error: insertError } = await supabase
//       .from("interview_results")
//       .upsert([
//         {
//           session_id: sessionId,
//           user_id: sessionData.user_id,
//           final_score: evaluation.final_score,
//           radar_scores: evaluation.radar_scores,
//           feedback: evaluation.feedback,
//         },
//       ]);

//     if (insertError) {
//       console.error("⚠️ Supabase insert error:", insertError);
//       return NextResponse.json(
//         { error: "Failed to save evaluation results" },
//         { status: 500 }
//       );
//     }

//     console.log("📊 Evaluation results saved successfully!");

//     // 5️⃣ Return success response
//     return NextResponse.json({
//       success: true,
//       message: "Evaluation completed successfully",
//       evaluation,
//     });
//   } catch (error: any) {
//     console.error("🔥 Evaluation API error:", JSON.stringify(error, null, 2));
//     return NextResponse.json(
//       { error: error?.message || "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

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
