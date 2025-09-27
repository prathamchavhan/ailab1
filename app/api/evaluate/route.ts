// app/api/evaluate/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { model } from "@/lib/geminiClient";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    // 1️⃣ Fetch answers
    const { data: answers, error: answersError } = await supabase
      .from("interview_answers")
      .select("question_id, response")
      .eq("session_id", sessionId);

    if (answersError) {
      console.error("Supabase error fetching answers:", answersError);
      return NextResponse.json({ error: "Failed to fetch answers" }, { status: 500 });
    }

    if (!answers || answers.length === 0) {
      return NextResponse.json({ error: "No answers found for this session" }, { status: 404 });
    }

    // 2️⃣ Fetch session to get user_id
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("user_id")
      .eq("id", sessionId)
      .single();

    if (sessionError) {
      console.error("Error fetching session:", sessionError);
      return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
    }

    // 3️⃣ Prompt for Gemini
    const prompt = `
You are an AI interviewer. Analyze the following answers from a candidate.

Answers: ${JSON.stringify(answers, null, 2)}

Give ONLY a JSON response in this exact format:
{
  "final_score": number (0-100),
  "radar_scores": [
    {"subject": "Communication", "A": number},
    {"subject": "Leadership", "A": number},
    {"subject": "Teamwork", "A": number},
    {"subject": "Sociability", "A": number},
    {"subject": "Attitude", "A": number},
    {"subject": "Creativity", "A": number},
    {"subject": "Professionalism", "A": number}
  ],
  "feedback": {
    "strengths": [string],
    "improvements": [string]
  }
}
`;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();

    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Invalid Gemini output:", textResponse);
      return NextResponse.json({ error: "Invalid AI response", raw: textResponse }, { status: 500 });
    }

    let evaluation;
    try {
      evaluation = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("Failed to parse AI JSON:", textResponse);
      return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 500 });
    }

    // 4️⃣ Save with user_id included
    const { error: insertError } = await supabase
      .from("interview_results")
      .insert([
        {
          session_id: sessionId,
          user_id: session?.user_id, // ✅ now results are linked to user
          final_score: evaluation.final_score,
          radar_scores: evaluation.radar_scores,
          feedback: evaluation.feedback,
        },
      ]);

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json({ error: "Failed to save evaluation results" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Evaluation completed successfully",
      evaluation,
    });
  } catch (error) {
    console.error("Evaluation API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
