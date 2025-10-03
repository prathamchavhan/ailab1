import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { model } from "@/lib/geminiClient";
import { openai } from "@/lib/openaiClient";
import { createClient } from "@/lib/utils/supabase/server";


export async function POST(req: Request) {
  try {
    const { level, round, domain, company } = await req.json();

    if (!domain || !company) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabaseUserClient = await createClient();
    const { data: { user } } = await supabaseUserClient.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1️⃣ Create session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("interview_sessions")
      .insert([{ user_id: user.id, type: level, domain, experience: round, job_desc: company }])
      .select()
      .single();

    if (sessionError) throw sessionError;

    const roundQuestions = { R1: 5, R2: 7, R3: 10 };
    const numQuestions = roundQuestions[round as keyof typeof roundQuestions];

    // 2️⃣ Prompt
    const prompt = `You are an expert interview question generator.\n\nGenerate ${numQuestions} unique and domain-specific interview questions \nfor a candidate applying in the field of \"${domain}\" at \"${company}\".\n\nDifficulty: ${level}.\nRound: ${round}.\n\nThe questions should test both theoretical knowledge and practical problem-solving in ${domain}.\nReturn ONLY the list of questions, one per line, no numbering, no explanations.`;

    let text: string | null = null;

    // 3️⃣ Try Gemini
    try {
      const result = await model.generateContent(prompt);
      text = result.response.text();
    } catch (err) {
      console.warn("⚠️ Gemini failed, fallback to OpenAI:", err);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You generate interview questions." },
          { role: "user", content: prompt },
        ],
      });

      text =
        completion.choices[0]?.message?.content ||
        "Fallback Q1\nFallback Q2\nFallback Q3";
    }

    // 4️⃣ Clean up
    const questions = text
      .split("\n")
      .map((q) => q.replace(/^\d+[\).\s]/, "").trim())
      .filter((q) => q.length > 0);

    // 5️⃣ Save
    const formatted = questions.map((q) => ({
      round,
      question: q,
      session_id: session.id,
    }));

    const { error: qError } = await supabaseAdmin
      .from("interview_question")
      .insert(formatted);

    if (qError) throw qError;

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error("❌ Error generating questions:", err);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}