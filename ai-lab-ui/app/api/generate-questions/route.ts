import { NextResponse } from "next/server";
import { createClientForRoute } from "@/lib/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { model } from "@/lib/geminiClient";
import { openai } from "@/lib/openaiClient";

export async function POST(req: Request) {
  try {
    const { level, round, domain, company } = await req.json();

    // 🔍 Validate inputs
    if (!domain || !company) {
      return NextResponse.json(
        { error: "Both domain and company are required" },
        { status: 400 }
      );
    }

    // 🔐 Get the authenticated Supabase user
    const supabaseUserClient = await createClientForRoute();
    const {
      data: { user },
      error: userError,
    } = await supabaseUserClient.auth.getUser();

    if (userError || !user) {
      console.error("❌ Error fetching user:", userError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ⚙️ Supabase admin client (service role)
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 🔗 Get user profile using user_id (not id)
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !userProfile) {
      console.error("❌ No user profile found in 'profiles' for user_id:", user.id);
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // 🟢 Create interview session linked to the user's profile
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("interview_sessions")
      .insert([
        {
          user_id: userProfile.user_id, // ✅ correct FK reference
          type: level,
          domain,
          round,
          company,
        },
      ])
      .select()
      .single();

    if (sessionError) {
      console.error("❌ Error creating session:", sessionError);
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }

    // 🔢 Determine number of questions for the selected round
    const roundQuestions = { R1: 5, R2: 7, R3: 10 };
    const numQuestions = roundQuestions[round as keyof typeof roundQuestions] ?? 5;

    // 🧠 Step 1: Company + Domain Interview Context
    const contextPrompt = `
You are an assistant summarizing how ${company} conducts interviews
for ${domain} roles.

In 3 lines, describe the likely focus, tone, and evaluation style
this company uses when interviewing candidates in ${domain}.
Keep it professional and factual. Avoid generic statements.
`;

    let companyContext = "";
    try {
      const contextResult = await model.generateContent(contextPrompt);
      companyContext = contextResult.response.text() || "";
    } catch (err) {
      console.warn("⚠️ Context generation failed:", err);
      companyContext = `Focus on ${domain}-related conceptual and scenario-based interview questions relevant to ${company}.`;
    }

    // 💬 Step 2: Generate Non-Coding, Realistic Questions
    const prompt = `
You are an expert interviewer generating realistic, non-coding interview questions.

Context:
Company: ${company}
Domain: ${domain}
Difficulty: ${level}
Round: ${round}

Interview Style Insight:
${companyContext}

Guidelines:
1. Do NOT include coding, algorithmic, or math questions.
2. Focus on real-world decision-making, reasoning, and conceptual understanding.
3. Use open-ended, situational, or "how would you handle..." type questions.
4. Reflect ${company}'s professional tone.
5. Avoid yes/no or factual recall questions.

Generate ${numQuestions} questions.
Output each question on a new line with no numbering or extra commentary.
`;

    let text: string | null = null;

    // ⚙️ Try Gemini → fallback to OpenAI
    try {
      const result = await model.generateContent(prompt);
      text = result.response.text();
    } catch (err) {
      console.warn("⚠️ Gemini failed, using OpenAI fallback:", err);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You generate realistic, professional, non-coding interview questions tailored to company and domain.",
          },
          { role: "user", content: prompt },
        ],
      });

      text =
        completion.choices[0]?.message?.content ||
        "Describe how you approach client requirements that keep changing mid-project.\nHow do you communicate complex technical issues to non-technical stakeholders?";
    }

    // 🧹 Step 3: Clean and structure questions
    const questions = text
      .split("\n")
      .map((q) => q.replace(/^(\d+[\).\s-]*|[-•]\s*)/, "").trim())
      .filter(Boolean);

    // 💾 Step 4: Store generated questions
    const formatted = questions.map((q) => ({
      session_id: session.id,
      question: q,
      round,
    }));

    const { error: qError } = await supabaseAdmin
      .from("interview_question")
      .insert(formatted);

    if (qError) {
      console.error("❌ Error inserting questions:", qError);
      return NextResponse.json(
        { error: "Failed to save questions" },
        { status: 500 }
      );
    }

    console.log(`✅ ${formatted.length} questions generated for ${company} (${domain})`);

    // 🎯 Step 5: Return session ID to frontend
    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error("🔥 Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to generate interview questions" },
      { status: 500 }
    );
  }
}
