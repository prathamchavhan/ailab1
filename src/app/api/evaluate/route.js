// import { NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";
// import { model as geminiModel } from "@/lib/geminiClient";
// import { cookies } from "next/headers";

// export const dynamic = "force-dynamic";

// // ✅ Create Supabase server client safely
// function getSupabase() {
//   const cookieStore = cookies();
//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
//   const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
//   return createClient(supabaseUrl, supabaseKey, {
//     global: {
//       headers: {
//         Authorization: `Bearer ${cookieStore.get("sb-access-token")?.value || ""}`,
//       },
//     },
//   });
// }

// // ✅ Helper to calculate average safely
// function average(arr) {
//   const valid = arr.filter((n) => typeof n === "number" && !isNaN(n));
//   return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
// }

// export async function POST(req) {
//   const supabase = getSupabase();
//   let sessionId = null;

//   try {
//     const body = await req.json();
//     sessionId = body.sessionId?.trim();

//     if (!sessionId) {
//       return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
//     }

//     console.log(`📥 Evaluating session: ${sessionId}`);

//     // 1️⃣ Fetch answers with related questions
//     const { data: answers, error: answersError } = await supabase
//       .from("interview_answers")
//       .select(`
//         response,
//         interview_question ( question )
//       `)
//       .eq("session_id", sessionId);

//     if (answersError || !answers?.length) {
//       console.error("❌ No answers found:", answersError);
//       return NextResponse.json({ error: "No answers found" }, { status: 404 });
//     }

//     const qas = answers.map((a, i) => ({
//       id: i + 1,
//       question: a.interview_question?.question || `Question ${i + 1}`,
//       answer: a.response || "",
//     }));

//     // 2️⃣ Fetch user_id for the session
//     const { data: sessionData, error: sessionError } = await supabase
//       .from("interview_sessions")
//       .select("user_id")
//       .eq("id", sessionId)
//       .single();

//     if (sessionError || !sessionData?.user_id) {
//       console.error("❌ Invalid session:", sessionError);
//       return NextResponse.json({ error: "Invalid session" }, { status: 400 });
//     }

//     // 3️⃣ Prompt for Gemini
//     const prompt = `
// You are a professional technical interviewer.
// Evaluate each candidate answer for accuracy, depth, and clarity.

// For each Q&A pair:
// - Give a score between 1–10
// - Provide short feedback (under 15 words)

// Return JSON only in this format:
// {
//   "evaluations": [
//     {"id": 1, "score": 9, "feedback": "Strong fundamentals"},
//     {"id": 2, "score": 6, "feedback": "Needs more detail"}
//   ],
//   "average_score": 80,
//   "overall_feedback": {
//     "strengths": ["Good communication"],
//     "improvements": ["Explain logic better"]
//   }
// }

// Input:
// ${JSON.stringify(qas, null, 2)}
// `;

//     // 4️⃣ Call Gemini model
//     const geminiResponse = await geminiModel.generateContent(prompt);
//     const rawText = await geminiResponse.response.text();

//     // Clean code block wrappers and parse JSON safely
//     const cleanText = rawText
//       .replace(/```json/gi, "")
//       .replace(/```/g, "")
//       .trim();

//     let parsedResult = {};
//     try {
//       parsedResult = JSON.parse(cleanText);
//     } catch (err) {
//       console.error("⚠️ Gemini JSON parse error:", err);
//       console.log("🧾 Raw Gemini Output:\n", cleanText);
//       parsedResult = {
//         evaluations: qas.map((q) => ({
//           id: q.id,
//           score: 5,
//           feedback: "Could not evaluate",
//         })),
//         average_score: 50,
//         overall_feedback: {
//           strengths: ["Consistent effort"],
//           improvements: ["Improve clarity"],
//         },
//       };
//     }

//     const evaluations = parsedResult.evaluations || [];
//     const avgScore =
//       parsedResult.average_score ||
//       Math.round(average(evaluations.map((e) => e.score)) * 10);
//     const overallFeedback =
//       parsedResult.overall_feedback || {
//         strengths: ["Good attempt"],
//         improvements: ["Add more examples"],
//       };

//     const radarScores = [
//       { subject: "Technical Knowledge", A: Math.round(avgScore) },
//       { subject: "Communication", A: Math.round(avgScore * 0.95) },
//       { subject: "Problem Solving", A: Math.round(avgScore * 0.9) },
//       { subject: "Clarity", A: Math.round(avgScore * 0.85) },
//     ];

//     // 5️⃣ Save to Supabase
//     const { error: insertError } = await supabase.from("interview_results").upsert([
//       {
//         session_id: sessionId,
//         user_id: sessionData.user_id,
//         final_score: avgScore,
//         technical_score: avgScore,
//         behavioral_score: null,
//         radar_scores: radarScores,
//         feedback: overallFeedback,
//         gemini_result: evaluations,
//         created_at: new Date().toISOString(),
//       },
//     ]);

//     if (insertError) {
//       console.error("❌ Database insert error:", insertError);
//       return NextResponse.json(
//         { error: "Database insert failed" },
//         { status: 500 }
//       );
//     }

//     console.log(`✅ Evaluation done for ${sessionId}: ${avgScore}`);

//     return NextResponse.json({
//       success: true,
//       session_id: sessionId,
//       final_score: avgScore,
//       feedback: overallFeedback,
//       details: evaluations,
//     });
//   } catch (err) {
//     console.error("🔥 Unexpected evaluation error:", err);
//     return NextResponse.json(
//       { error: err.message || "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }









// {original code}




// import { NextResponse } from "next/server";
// import { supabase } from "@/lib/supabaseServer";
// import { model as geminiModel } from "@/lib/geminiClient";

// // Prevent caching
// export const dynamic = "force-dynamic";

// // Utility to calculate average
// function average(arr) {
//   const valid = arr.filter((n) => typeof n === "number" && !isNaN(n));
//   return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
// }

// // ✅ Enhanced random scoring based on user answers and question relevance
// function randomScore(question, answer) {
//   if (!answer || !question) return Math.floor(Math.random() * 4) + 3; // 3–6 fallback

//   const q = question.toLowerCase();
//   const a = answer.toLowerCase();

//   // Split into keywords (ignore small/common words)
//   const stopwords = ["what", "is", "the", "and", "to", "of", "in", "a", "an", "for", "on"];
//   const questionWords = q
//     .split(/\s+/)
//     .filter((w) => w.length > 3 && !stopwords.includes(w));

//   // Count how many keywords from the question appear in the answer
//   const matched = questionWords.filter((w) => a.includes(w)).length;
//   const matchRatio = matched / Math.max(questionWords.length, 1);

//   // Calculate length bonus or penalty
//   const wordCount = answer.split(/\s+/).length;
//   const lengthBonus = wordCount > 15 ? 1 : 0;
//   const lengthPenalty = wordCount < 5 ? -2 : 0;

//   // Base random range (5–8 looks realistic)
//   let base = Math.floor(Math.random() * 4) + 5;

//   // Adjust by relevance and length
//   let finalScore = base + Math.round(matchRatio * 3) + lengthBonus + lengthPenalty;

//   // Clamp score between 1 and 10
//   return Math.min(10, Math.max(1, finalScore));
// }

// export async function POST(req) {
//   let sessionId = null;
//   try {
//     const body = await req.json();
//     sessionId = body.sessionId;

//     if (!sessionId) {
//       return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
//     }

//     // 1️⃣ Fetch answers
//     const { data: answers, error: answersError } = await supabase
//       .from("interview_answers")
//       .select(`response, interview_question ( question )`)
//       .eq("session_id", sessionId);

//     if (answersError || !answers?.length) {
//       console.warn(`[${sessionId}] No answers found or error:`, answersError);
//       return NextResponse.json({ error: "No answers found" }, { status: 404 });
//     }

//     const qas = answers.map((a, i) => ({
//       question: a.interview_question?.question || `Question ${i + 1}`,
//       answer: a.response || "",
//     }));

//     console.log(
//       `DEBUG [${sessionId}]: Sending ${qas.length} QAs to Gemini:`,
//       JSON.stringify(qas, null, 2)
//     );

//     // 2️⃣ Fetch user_id
//     const { data: sessionData, error: sessionError } = await supabase
//       .from("interview_sessions")
//       .select("user_id")
//       .eq("id", sessionId)
//       .single();

//     if (sessionError || !sessionData?.user_id) {
//       console.error(`[${sessionId}] Invalid session:`, sessionError);
//       return NextResponse.json({ error: "Invalid session" }, { status: 500 });
//     }

//     // 3️⃣ Gemini evaluation prompt
//     const geminiPrompt = `
// You are a senior technical interviewer.
// Evaluate each spoken answer for:
// - Technical correctness
// - Conceptual understanding
// - Relevance to the question
// - Clarity of communication

// Rate each answer from 1–10 and give one short feedback line.

// Input:
// ${qas.map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}\n`).join("\n")}

// Return valid JSON:
// [
//   {"question":"string","score":number,"feedback":"string"}
// ]
// `;

//     const FASTAPI_URL =
//       process.env.NEXT_PUBLIC_ML_API_URL ||
//       "https://score-model-b7hcdfa4e4fed9b9.centralindia-01.azurewebsites.net/evaluate";

//     // 4️⃣ Run Gemini + ML in parallel
//     const [geminiResult, mlResponse] = await Promise.allSettled([
//       geminiModel.generateContent(geminiPrompt),
//       fetch(FASTAPI_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ session_id: sessionId, qas }),
//       }),
//     ]);

//     // 5️⃣ Parse Gemini output safely
//     let geminiEvaluation = [];
//     let rawGeminiText = "";
//     if (geminiResult.status === "fulfilled") {
//       try {
//         rawGeminiText = await geminiResult.value.response.text();
//         const cleanText = rawGeminiText
//           .replace(/```json/gi, "")
//           .replace(/```/g, "")
//           .trim();

//         if (!cleanText.startsWith("[")) {
//           throw new Error("Response is not a JSON array.");
//         }

//         geminiEvaluation = JSON.parse(cleanText);
//       } catch (err) {
//         console.error(`❌ [${sessionId}] Gemini JSON parse failed:`, err.message);
//         console.warn(`[${sessionId}] Raw Gemini Text:`, rawGeminiText);

//         // 🔥 Random fallback score based on answer relevance
//         geminiEvaluation = qas.map((q) => ({
//           question: q.question,
//           score: randomScore(q.question, q.answer),
//           feedback: "Randomly generated score (AI parsing failed).",
//         }));
//       }
//     } else {
//       console.error(`❌ [${sessionId}] Gemini evaluation API failed:`, geminiResult.reason);
//       geminiEvaluation = qas.map((q) => ({
//         question: q.question,
//         score: randomScore(q.question, q.answer),
//         feedback: "Randomly generated score (AI API failure).",
//       }));
//     }

//     // Handle empty array
//     if (Array.isArray(geminiEvaluation) && geminiEvaluation.length === 0 && qas.length > 0) {
//       console.warn(`[${sessionId}] Gemini returned empty array. Using fallback.`);
//       geminiEvaluation = qas.map((q) => ({
//         question: q.question,
//         score: randomScore(q.question, q.answer),
//         feedback: "Randomly generated score (AI empty result).",
//       }));
//     }

//     // 6️⃣ Parse ML model result safely
//     let mlEvaluation = {
//       radar_scores: [],
//       final_score: 0,
//       feedback: { strengths: [], improvements: [] },
//     };

//     if (mlResponse.status === "fulfilled") {
//       try {
//         const data = await mlResponse.value.json().catch(() => ({}));
//         mlEvaluation = data || mlEvaluation;
//       } catch (err) {
//         console.error(`⚠️ [${sessionId}] ML response parse failed:`, err);
//       }
//     } else {
//       console.error(`❌ [${sessionId}] ML model fetch failed:`, mlResponse.reason);
//     }

//     // 7️⃣ Compute hybrid score
//     const technicalScore10 = average(geminiEvaluation.map((x) => x.score));
//     const technicalScore100 = Math.min(100, (technicalScore10 / 10) * 100);
//     const behavioralScore100 = Math.min(100, mlEvaluation.final_score || 0);
//     const finalScore = Math.round(0.6 * technicalScore100 + 0.4 * behavioralScore100);

//     // 8️⃣ Merge radar chart data
//     const radarScores = [
//       ...(mlEvaluation.radar_scores || []),
//       { subject: "Technical Accuracy", A: Math.round(technicalScore100) },
//       { subject: "Problem Solving", A: Math.round(technicalScore100 * 0.95) },
//       { subject: "Creativity", A: Math.round(technicalScore100 * 0.9) },
//     ];

//     // 9️⃣ Combine feedbacks
//     const geminiFeedback = geminiEvaluation.map((x) => x.feedback).filter(Boolean).join(" | ");
//     const mlFeedback = mlEvaluation.feedback || {};

//     const feedbackPrompt = `
// Combine this technical and behavioral feedback into a short motivational summary.
// Be concise and professional.

// Technical Feedback: ${geminiFeedback}
// Behavioral Feedback: ${JSON.stringify(mlFeedback)}

// Return valid JSON:
// {
//   "strengths": [string],
//   "improvements": [string]
// }
// `;

//     // 🔟 Generate unified feedback safely
//     let finalFeedback = {};
//     let rawFeedbackText = "";
//     try {
//       const feedbackRes = await geminiModel.generateContent(feedbackPrompt);
//       rawFeedbackText = await feedbackRes.response.text();
//       const cleanText = rawFeedbackText.replace(/```json/gi, "").replace(/```/g, "").trim();
//       finalFeedback = JSON.parse(cleanText);
//     } catch (err) {
//       console.warn(`⚠️ [${sessionId}] Feedback generation failed:`, err.message);
//       console.warn(`[${sessionId}] Raw Feedback Text:`, rawFeedbackText);
//       finalFeedback = mlFeedback.strengths || mlFeedback.improvements
//         ? {
//             strengths: mlFeedback.strengths || ["Good communication skills."],
//             improvements: mlFeedback.improvements || ["Elaborate more on technical details."],
//           }
//         : {
//             strengths: ["Shows clear understanding of key concepts."],
//             improvements: ["Explain solutions with more detail."],
//           };
//     }

//     // 11️⃣ Store final result
//     const { error: insertError } = await supabase.from("interview_results").upsert([
//       {
//         session_id: sessionId,
//         user_id: sessionData.user_id,
//         final_score: finalScore,
//         technical_score: Math.round(technicalScore100),
//         behavioral_score: Math.round(behavioralScore100),
//         radar_scores: radarScores,
//         feedback: finalFeedback,
//         ml_result: mlEvaluation,
//         gemini_result: geminiEvaluation,
//         created_at: new Date().toISOString(),
//       },
//     ]);

//     if (insertError) {
//       console.error(`⚠️ [${sessionId}] Supabase insert error:`, insertError);
//       return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
//     }

//     // ✅ Done
//     return NextResponse.json({
//       success: true,
//       message: "Hybrid evaluation completed successfully",
//       final_score: finalScore,
//       technical_score: Math.round(technicalScore100),
//       behavioral_score: Math.round(behavioralScore100),
//       radar_scores: radarScores,
//       feedback: finalFeedback,
//     });
//   } catch (err) {
//     console.error(`🔥 [${sessionId || "UNKNOWN"}] Hybrid Evaluation Error:`, err);
//     return NextResponse.json(
//       { error: err?.message || "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }








import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";
import { model as geminiModel } from "@/lib/geminiClient";

export const dynamic = "force-dynamic";

// Average helper
function average(arr) {
  const valid = arr.filter((n) => typeof n === "number" && !isNaN(n));
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
}

// Local smart fallback for Gemini
function smartScore(question, answer) {
  if (!answer?.trim()) return 0;
  const q = question.toLowerCase();
  const a = answer.toLowerCase();
  const qWords = q.split(/\W+/).filter((w) => w.length > 3);
  const overlap = qWords.filter((w) => a.includes(w)).length / Math.max(1, qWords.length);
  const lenBonus = Math.min(answer.split(" ").length / 20, 1);
  const base = 3 + 5 * overlap * lenBonus; // 3–8 range
  return Math.round(Math.min(10, base + Math.random() * 2));
}

export async function POST(req) {
  let sessionId = null;
  try {
    const { sessionId: id } = await req.json();
    sessionId = id;

    if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });

    // 1️⃣ Fetch answers
    const { data: answers, error: ansErr } = await supabase
      .from("interview_answers")
      .select(`response, interview_question ( question )`)
      .eq("session_id", sessionId);

    if (ansErr || !answers?.length)
      return NextResponse.json({ error: "No answers found" }, { status: 404 });

    const qas = answers.map((a, i) => ({
      question: a.interview_question?.question || `Q${i + 1}`,
      answer: a.response || "",
    }));

    // 2️⃣ Fetch user_id
    const { data: sessionData } = await supabase
      .from("interview_sessions")
      .select("user_id")
      .eq("id", sessionId)
      .single();

    const userId = sessionData?.user_id;
    if (!userId)
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });

    // 3️⃣ Gemini Prompt for Technical Evaluation
    const geminiPrompt = `
You are an interviewer evaluating technical answers.
Score each answer between 0–10:
- 0 for blank/irrelevant
- 1–4 for partial/poor
- 5–7 for fair
- 8–10 for strong, complete

Return strict JSON:
[
  {"question":"string","score":number,"feedback":"string"}
]

Input:
${qas
  .map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer || "No answer"}\n`)
  .join("\n")}
`;

    // 4️⃣ Run Gemini & ML model in parallel
    const FASTAPI_URL =
      process.env.NEXT_PUBLIC_ML_API_URL ||
      "https://score-model-b7hcdfa4e4fed9b9.centralindia-01.azurewebsites.net/evaluate";

    const [geminiResult, mlResponse] = await Promise.allSettled([
      geminiModel.generateContent(geminiPrompt),
      fetch(FASTAPI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, qas }),
      }),
    ]);

    // 5️⃣ Handle Gemini output
    let geminiEvaluation = [];
    try {
      if (geminiResult.status === "fulfilled") {
        let raw = await geminiResult.value.response.text();
        raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
        geminiEvaluation = JSON.parse(raw);
      } else {
        throw new Error("Gemini API failed");
      }
    } catch (err) {
      console.warn("⚠️ Gemini parse failed:", err.message);
      geminiEvaluation = qas.map((q) => ({
        question: q.question,
        score: smartScore(q.question, q.answer),
        feedback: q.answer
          ? "Fallback: estimated based on answer content."
          : "No answer given.",
      }));
    }

    // Ensure clean numeric scores
    geminiEvaluation = geminiEvaluation.map((x, i) => ({
      question: x.question || qas[i].question,
      score:
        qas[i].answer.trim() === ""
          ? 0
          : Math.min(10, Math.max(0, Number(x.score) || smartScore(qas[i].question, qas[i].answer))),
      feedback: x.feedback || "No feedback.",
    }));

    // 6️⃣ Handle ML Model output
    let mlEvaluation = {
      radar_scores: [],
      final_score: 0,
      feedback: { strengths: [], improvements: [] },
    };

    if (mlResponse.status === "fulfilled") {
      try {
        const json = await mlResponse.value.json();
        mlEvaluation = json;
      } catch (err) {
        console.error("⚠️ ML response parse failed:", err);
      }
    } else {
      console.error("⚠️ ML fetch failed:", mlResponse.reason);
    }

    // 7️⃣ Calculate final combined score
    const technicalScore10 = average(geminiEvaluation.map((x) => x.score));
    const technicalScore100 = Math.round((technicalScore10 / 10) * 100);
    const behavioralScore100 = Math.min(100, mlEvaluation.final_score || 0);

    // Weight: 60% technical + 40% behavioral
    const finalScore = Math.round(0.6 * technicalScore100 + 0.4 * behavioralScore100);

    // 8️⃣ Merge radar chart data
    const radarScores = [
      ...(mlEvaluation.radar_scores || []),
      { subject: "Technical Knowledge", A: technicalScore100 },
      { subject: "Problem Solving", A: Math.round(technicalScore100 * 0.9) },
      { subject: "Behavioral", A: behavioralScore100 },
    ];

    // 9️⃣ Generate final feedback (short)
    const geminiFeedback = geminiEvaluation.map((x) => x.feedback).join(" | ");
    const mlFeedback = mlEvaluation.feedback || {};

    const feedback = {
      strengths:
        mlFeedback.strengths?.length
          ? mlFeedback.strengths
          : ["Shows improving understanding of technical topics."],
      improvements:
        mlFeedback.improvements?.length
          ? mlFeedback.improvements
          : ["Provide more detailed answers with examples."],
    };

    // 🔟 Store result in Supabase
    const { error: insertErr } = await supabase.from("interview_results").upsert([
      {
        session_id: sessionId,
        user_id: userId,
        final_score: finalScore,
        technical_score: technicalScore100,
        behavioral_score: behavioralScore100,
        radar_scores: radarScores,
        feedback,
        gemini_result: geminiEvaluation,
        ml_result: mlEvaluation,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertErr) {
      console.error("⚠️ Supabase insert error:", insertErr);
      return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
    }

    // ✅ Success
    return NextResponse.json({
      success: true,
      message: "Gemini + ML Hybrid Evaluation completed successfully",
      final_score: finalScore,
      technical_score: technicalScore100,
      behavioral_score: behavioralScore100,
      radar_scores: radarScores,
      feedback,
    });
  } catch (err) {
    console.error("🔥 Evaluation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
