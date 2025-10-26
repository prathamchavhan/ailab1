// import { NextResponse } from "next/server";
// import { createClientForRoute } from "@/lib/utils/supabase/server";
// import { model as geminiModel } from "@/lib/geminiClient";

// export async function POST(req: Request) {
//   try {
//     const { sessionId } = await req.json();
//     if (!sessionId)
//       return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });

//     const supabase = await createClientForRoute();

//     // 1️⃣ Fetch questions + answers
//     const { data: answers, error: answersError } = await supabase
//       .from("interview_answers")
//       .select(`response, interview_question ( question )`)
//       .eq("session_id", sessionId);

//     if (answersError || !answers?.length)
//       return NextResponse.json({ error: "No answers found" }, { status: 404 });

//     const qas = answers.map((a: any, i: number) => ({
//       question: a.interview_question?.question || `Question ${i + 1}`,
//       answer: a.response || "",
//     }));

//     // 2️⃣ Get user_id
//     const { data: sessionData, error: sessionError } = await supabase
//       .from("interview_sessions")
//       .select("user_id")
//       .eq("id", sessionId)
//       .single();

//     if (sessionError || !sessionData?.user_id)
//       return NextResponse.json({ error: "Invalid session" }, { status: 500 });

//     // 3️⃣ Gemini prompt for technical evaluation
//     const geminiPrompt = `
// You are a senior technical interviewer.
// Evaluate each spoken answer for:
// - Technical correctness
// - Conceptual understanding
// - Relevance to the question
// - Clarity of communication

// Rate each answer from 1–10 and give one short feedback line.

// Input:
// ${qas
//   .map(
//     (q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}\n`
//   )
//   .join("\n")}

// Return valid JSON:
// [
//   {"question":"string","score":number,"feedback":"string"}
// ]
// `;

//     // 4️⃣ Run Gemini + ML model together
//     const FASTAPI_URL =
//       process.env.NEXT_PUBLIC_ML_API_URL || "http://127.0.0.1:8000/evaluate";

//     const [geminiResult, mlResponse] = await Promise.allSettled([
//       geminiModel.generateContent(geminiPrompt),
//       fetch(FASTAPI_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ session_id: sessionId, qas }),
//       }),
//     ]);

//     // 5️⃣ Initialize responses
//     let geminiEvaluation: any[] = [];
//     let mlEvaluation: any = {};

//     // 6️⃣ Parse Gemini result safely
//     if (geminiResult.status === "fulfilled") {
//       const rawText = geminiResult.value.response.text();
//       const cleanText = rawText
//         .replace(/```json/g, "")
//         .replace(/```/g, "")
//         .trim();
//       try {
//         geminiEvaluation = JSON.parse(cleanText);
//       } catch {
//         console.warn("⚠️ Gemini JSON parse failed, raw:", rawText);
//         geminiEvaluation = [];
//       }
//     } else {
//       console.error("❌ Gemini evaluation failed:", geminiResult.reason);
//     }

//     // 7️⃣ Parse ML response
//     if (mlResponse.status === "fulfilled" && mlResponse.value.ok) {
//       mlEvaluation = await mlResponse.value.json();
//     } else {
//       console.error("❌ ML model evaluation failed:", mlResponse);
//       mlEvaluation = {
//         radar_scores: [],
//         final_score: 0,
//         feedback: { strengths: [], improvements: [] },
//       };
//     }

//     // 8️⃣ Compute technical + behavioral scores
//     const technicalScore10 = average(geminiEvaluation.map((x: any) => x.score));
//     const technicalScore100 = Math.min(100, (technicalScore10 / 10) * 100);
//     const behavioralScore100 = Math.min(100, mlEvaluation.final_score || 0);
//     const finalScore = Math.round(
//       0.6 * technicalScore100 + 0.4 * behavioralScore100
//     );

//     // 9️⃣ Build radar chart (Gemini + ML combined)
//     const radarScores = [
//       ...(mlEvaluation.radar_scores || []),
//       { subject: "Technical Accuracy", A: Math.round(technicalScore100) },
//       { subject: "Problem Solving", A: Math.round(technicalScore100 * 0.95) },
//       { subject: "Creativity", A: Math.round(technicalScore100 * 0.9) },
//     ];

//     // 🔟 Combine feedbacks
//     const geminiFeedback = geminiEvaluation.map((x) => x.feedback).join(" | ");
//     const mlFeedback = mlEvaluation.feedback || {};

//     const feedbackPrompt = `
// Combine this technical and behavioral feedback into a short JSON summary.
// Be motivational, specific, and concise.

// Technical Feedback: ${geminiFeedback}
// Behavioral Feedback: ${JSON.stringify(mlFeedback)}

// Return valid JSON:
// {
//   "strengths": [string],
//   "improvements": [string]
// }
// `;

//     let finalFeedback: any = {};
//     try {
//       const feedbackRes = await geminiModel.generateContent(feedbackPrompt);
//       const feedbackText = feedbackRes.response.text()
//         .replace(/```json/g, "")
//         .replace(/```/g, "")
//         .trim();

//       finalFeedback = JSON.parse(feedbackText);
//     } catch (err) {
//       console.error("⚠️ Feedback generation failed:", err);
//       finalFeedback = {
//         strengths: [
//           "Strong grasp of key technical concepts.",
//           "Good clarity and communication throughout.",
//         ],
//         improvements: [
//           "Could improve explanation structure.",
//           "Add more real-world examples for clarity.",
//         ],
//       };
//     }

//     // 11️⃣ Save final results to Supabase
//     const { error: insertError } = await supabase
//       .from("interview_results")
//       .upsert([
//         {
//           session_id: sessionId,
//           user_id: sessionData.user_id,
//           final_score: finalScore,
//           technical_score: Math.round(technicalScore100),
//           behavioral_score: Math.round(behavioralScore100),
//           radar_scores: radarScores,
//           feedback: finalFeedback,
//           ml_result: mlEvaluation,
//           gemini_result: geminiEvaluation,
//           created_at: new Date().toISOString(),
//         },
//       ]);

//     if (insertError) {
//       console.error("⚠️ Supabase insert error:", insertError);
//       return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
//     }

//     // ✅ Return final unified response
//     return NextResponse.json({
//       success: true,
//       message: "Hybrid evaluation completed successfully",
//       final_score: finalScore,
//       technical_score: Math.round(technicalScore100),
//       behavioral_score: Math.round(behavioralScore100),
//       radar_scores: radarScores,
//       feedback: finalFeedback,
//     });
//   } catch (err: any) {
//     console.error("🔥 Hybrid Evaluation Error:", err);
//     return NextResponse.json(
//       { error: err?.message || "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

// // Utility
// function average(arr: number[]) {
//   const valid = arr.filter((n) => typeof n === "number" && !isNaN(n));
//   return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
// }



import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";
import { model as geminiModel } from "@/lib/geminiClient";

// Utility
function average(arr) {
  const valid = arr.filter((n) => typeof n === "number" && !isNaN(n));
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
}

export async function POST(req) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // 1️⃣ Fetch answers
    const { data: answers, error: answersError } = await supabase
      .from("interview_answers")
      .select(`response, interview_question ( question )`)
      .eq("session_id", sessionId);

    if (answersError || !answers?.length) {
      return NextResponse.json({ error: "No answers found" }, { status: 404 });
    }

    const qas = answers.map((a, i) => ({
      question: a.interview_question?.question || `Question ${i + 1}`,
      answer: a.response || "",
    }));

    // 2️⃣ Fetch user_id
    const { data: sessionData, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("user_id")
      .eq("id", sessionId)
      .single();

    if (sessionError || !sessionData?.user_id) {
      return NextResponse.json({ error: "Invalid session" }, { status: 500 });
    }

    // 3️⃣ Gemini evaluation prompt
    const geminiPrompt = `
You are a senior technical interviewer.
Evaluate each spoken answer for:
- Technical correctness
- Conceptual understanding
- Relevance to the question
- Clarity of communication

Rate each answer from 1–10 and give one short feedback line.

Input:
${qas.map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}\n`).join("\n")}

Return valid JSON:
[
  {"question":"string","score":number,"feedback":"string"}
]
`;

  const FASTAPI_URL = process.env.NEXT_PUBLIC_ML_API_URL || "http://127.0.0.1:8000/evaluate";

    // 4️⃣ Run Gemini + ML in parallel
    const [geminiResult, mlResponse] = await Promise.allSettled([
      geminiModel.generateContent(geminiPrompt),
      fetch(FASTAPI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, qas }),
      }),
    ]);

    // 5️⃣ Parse Gemini output safely
    let geminiEvaluation = [];
    if (geminiResult.status === "fulfilled") {
      try {
        const rawText = await geminiResult.value.response.text();
        const cleanText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
        geminiEvaluation = JSON.parse(cleanText);
      } catch (err) {
        console.warn("⚠️ Gemini JSON parse failed:", err);
        geminiEvaluation = [];
      }
    } else {
      console.error("❌ Gemini evaluation failed:", geminiResult.reason);
    }

    // 6️⃣ Parse ML model result safely
    let mlEvaluation = {
      radar_scores: [],
      final_score: 0,
      feedback: { strengths: [], improvements: [] },
    };

    if (mlResponse.status === "fulfilled") {
      try {
        const data = await mlResponse.value.json().catch(() => ({}));
        mlEvaluation = data || mlEvaluation;
      } catch (err) {
        console.error("⚠️ ML response parse failed:", err);
      }
    } else {
      console.error("❌ ML model fetch failed:", mlResponse.reason);
    }

    // 7️⃣ Compute hybrid score
    const technicalScore10 = average(geminiEvaluation.map((x) => x.score));
    const technicalScore100 = Math.min(100, (technicalScore10 / 10) * 100);
    const behavioralScore100 = Math.min(100, mlEvaluation.final_score || 0);
    const finalScore = Math.round(0.6 * technicalScore100 + 0.4 * behavioralScore100);

    // 8️⃣ Merge radar chart data
    const radarScores = [
      ...(mlEvaluation.radar_scores || []),
      { subject: "Technical Accuracy", A: Math.round(technicalScore100) },
      { subject: "Problem Solving", A: Math.round(technicalScore100 * 0.95) },
      { subject: "Creativity", A: Math.round(technicalScore100 * 0.9) },
    ];

    // 9️⃣ Combine feedbacks
    const geminiFeedback = geminiEvaluation
      .map((x) => x.feedback)
      .filter(Boolean)
      .join(" | ");

    const mlFeedback = mlEvaluation.feedback || {};

    const feedbackPrompt = `
Combine this technical and behavioral feedback into a short motivational summary.
Be concise and professional.

Technical Feedback: ${geminiFeedback}
Behavioral Feedback: ${JSON.stringify(mlFeedback)}

Return valid JSON:
{
  "strengths": [string],
  "improvements": [string]
}
`;

    // 🔟 Generate unified feedback safely
    let finalFeedback = {};
    try {
      const feedbackRes = await geminiModel.generateContent(feedbackPrompt);
      const feedbackText = await feedbackRes.response.text();
      const cleanText = feedbackText.replace(/```json/gi, "").replace(/```/g, "").trim();
      finalFeedback = JSON.parse(cleanText);
    } catch (err) {
      console.warn("⚠️ Feedback generation failed:", err);
      finalFeedback = {
        strengths: [
          "Demonstrates solid understanding of core concepts.",
          "Communicates technical ideas effectively.",
        ],
        improvements: [
          "Provide deeper insights when explaining solutions.",
          "Use more structured examples when responding.",
        ],
      };
    }

    // 11️⃣ Store final result in Supabase
    const { error: insertError } = await supabase
      .from("interview_results")
      .upsert([
        {
          session_id: sessionId,
          user_id: sessionData.user_id,
          final_score: finalScore,
          technical_score: Math.round(technicalScore100),
          behavioral_score: Math.round(behavioralScore100),
          radar_scores: radarScores,
          feedback: finalFeedback,
          ml_result: mlEvaluation,
          gemini_result: geminiEvaluation,
          created_at: new Date().toISOString(),
        },
      ]);

    if (insertError) {
      console.error("⚠️ Supabase insert error:", insertError);
      return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
    }

    // ✅ Everything OK
    return NextResponse.json({
      success: true,
      message: "Hybrid evaluation completed successfully",
      final_score: finalScore,
      technical_score: Math.round(technicalScore100),
      behavioral_score: Math.round(behavioralScore100),
      radar_scores: radarScores,
      feedback: finalFeedback,
    });
  } catch (err) {
    console.error("🔥 Hybrid Evaluation Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
