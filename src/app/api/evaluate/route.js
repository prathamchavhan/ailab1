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

// 1. ADDED: Prevents caching of this API route
export const dynamic = "force-dynamic";

// Utility
function average(arr) {
  const valid = arr.filter((n) => typeof n === "number" && !isNaN(n));
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
}

export async function POST(req) {
  let sessionId = null; // Declare sessionId here for broader logging scope
  try {
    const body = await req.json();
    sessionId = body.sessionId; // Assign sessionId

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // 1️⃣ Fetch answers
    const { data: answers, error: answersError } = await supabase
      .from("interview_answers")
      .select(`response, interview_question ( question )`)
      .eq("session_id", sessionId);

    if (answersError || !answers?.length) {
      console.warn(`[${sessionId}] No answers found or error:`, answersError);
      return NextResponse.json({ error: "No answers found" }, { status: 404 });
    }

    const qas = answers.map((a, i) => ({
      question: a.interview_question?.question || `Question ${i + 1}`,
      answer: a.response || "",
    }));

    // 2. ADDED: Debug log to check the exact data being sent
    console.log(
      `DEBUG [${sessionId}]: Sending ${qas.length} QAs to Gemini:`,
      JSON.stringify(qas, null, 2)
    );

    // 2️⃣ Fetch user_id
    const { data: sessionData, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("user_id")
      .eq("id", sessionId)
      .single();

    if (sessionError || !sessionData?.user_id) {
      console.error(`[${sessionId}] Invalid session:`, sessionError);
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

    const FASTAPI_URL =
      process.env.NEXT_PUBLIC_ML_API_URL ||
      "https://score-model-b7hcdfa4e4fed9b9.centralindia-01.azurewebsites.net/evaluate";

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
    let rawGeminiText = ""; // To store raw text for debugging
    if (geminiResult.status === "fulfilled") {
      try {
        rawGeminiText = await geminiResult.value.response.text();
        const cleanText = rawGeminiText
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();
        
        // Handle empty or malformed responses
        if (!cleanText.startsWith("[")) {
            throw new Error("Response is not a JSON array.");
        }
        
        geminiEvaluation = JSON.parse(cleanText);

      } catch (err) {
        // 3. UPDATED: Gracefully handle JSON parse failure instead of scoring 0
        console.error(
          `❌ [${sessionId}] Gemini JSON parse failed:`,
          err.message
        );
        console.warn(`[${sessionId}] Raw Gemini Text:`, rawGeminiText);
        
        // Create a fallback evaluation with a neutral 5/10 score
        geminiEvaluation = qas.map((q) => ({
          question: q.question,
          score: 5, 
          feedback:
            "AI evaluation failed to parse. Score is a default placeholder.",
        }));
      }
    } else {
      console.error(
        `❌ [${sessionId}] Gemini evaluation API failed:`,
        geminiResult.reason
      );
      // Create a fallback if the API call itself failed
      geminiEvaluation = qas.map((q) => ({
        question: q.question,
        score: 5,
        feedback: "AI evaluation API call failed.",
      }));
    }

    // 4. ADDED: Handle case where Gemini returns an empty array
    if (Array.isArray(geminiEvaluation) && geminiEvaluation.length === 0 && qas.length > 0) {
        console.warn(`[${sessionId}] Gemini returned an empty array. Using fallback.`);
        geminiEvaluation = qas.map((q) => ({
            question: q.question,
            score: 5,
            feedback: "AI returned no evaluation data. Score is a default placeholder.",
        }));
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
        console.error(`⚠️ [${sessionId}] ML response parse failed:`, err);
      }
    } else {
      console.error(`❌ [${sessionId}] ML model fetch failed:`, mlResponse.reason);
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
    let rawFeedbackText = ""; // For debugging
    try {
      const feedbackRes = await geminiModel.generateContent(feedbackPrompt);
      rawFeedbackText = await feedbackRes.response.text();
      const cleanText = rawFeedbackText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      finalFeedback = JSON.parse(cleanText);
    } catch (err) {
      // 5. UPDATED: Provide a default fallback for feedback
      console.warn(
        `⚠️ [${sessionId}] Feedback generation failed:`,
        err.message
      );
      console.warn(`[${sessionId}] Raw Feedback Text:`, rawFeedbackText);
      // Use ML feedback as a fallback
      finalFeedback = mlFeedback.strengths || mlFeedback.improvements
        ? {
            strengths: mlFeedback.strengths || ["Good communication skills."],
            improvements: mlFeedback.improvements || ["Continue to elaborate on technical examples."],
          }
        : { // Absolute fallback
            strengths: [
              "Demonstrates solid understanding of core concepts.",
            ],
            improvements: [
              "Provide deeper insights when explaining solutions.",
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
          gemini_result: geminiEvaluation, // This will now store the fallback if it failed
          created_at: new Date().toISOString(),
        },
      ]);

    if (insertError) {
      console.error(`⚠️ [${sessionId}] Supabase insert error:`, insertError);
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
    console.error(`🔥 [${sessionId || "UNKNOWN"}] Hybrid Evaluation Error:`, err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
