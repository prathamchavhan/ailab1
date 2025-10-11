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

    // 🔐 Get authenticated Supabase user
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

    // 🔗 Get user profile using user_id
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !userProfile) {
      console.error("❌ No user profile found for user_id:", user.id);
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // 🟢 Create interview session linked to the user's profile
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("interview_sessions")
      .insert([
        {
          user_id: userProfile.user_id,
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
You are an expert summarizing how ${company} typically conducts technical interviews 
for candidates applying in the ${domain} domain.

Describe briefly (in 3 concise lines):
1. The main areas of focus or skill assessment (e.g., problem-solving, system design, domain expertise).
2. The overall tone and structure of the interview (e.g., analytical, practical, scenario-driven).
3. The evaluation style or qualities they prioritize (e.g., clarity of thought, technical depth, communication).

Keep the tone factual, professional, and specific to ${company}.
Avoid generic descriptions or HR commentary.
`;

    let companyContext = "";
    try {
      const contextResult = await model.generateContent(contextPrompt);
      companyContext = contextResult.response.text() || "";
    } catch (err) {
      console.warn("⚠️ Context generation failed:", err);
      companyContext = `Focus on ${domain}-related conceptual and scenario-based interview questions relevant to ${company}.`;
    }

    // 💬 Step 2: Generate Technical, Spoken Interview Questions
    const prompt = `
You are an expert technical interviewer generating realistic interview questions 
that are designed to be answered verbally (spoken).

Context:
Company: ${company}
Domain: ${domain}
Difficulty Level: ${level}
Interview Round: ${round}

Company Insight:
${companyContext}

Guidelines:
1. Focus on technical, conceptual, and problem-solving questions.
2. Do NOT ask the candidate to write or type code.
3. Instead, ask them to explain approaches, logic, or design decisions verbally.
4. Use "How would you explain...", "Describe how...", or "What is the difference between..." style questions.
5. Include scenario-based, architecture, debugging, or optimization questions that require reasoning.
6. Keep the tone and complexity aligned with ${company}'s real interview style.
7. Avoid HR, behavioral, or purely theoretical questions.
8. Each question should be concise and clear, easy to answer verbally.
9. Do not include numbering or any additional commentary.
10. Start directly with the questions — do NOT include phrases like "Here are your questions" or "Okay, let's begin."

Generate ${numQuestions} technical, spoken-response interview questions.
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
    let rawText = text || "";

    // 🧽 Clean AI intro and markdown junk
    rawText = rawText
      .replace(/^.*?(?=1[.)\s-]|[-•]\s|Q\d+)/is, "") // remove any pre-text before numbered/bulleted lines
      .replace(/(^|\n)\s*(Okay|Sure|Here|Alright|Let's|Below).*?:/gi, "") // remove phrases like "Okay, here are..."
      .replace(/(\*\*|\#|\*)/g, "") // remove markdown artifacts
      .trim();

    const questions = rawText
      .split(/\n+/)
      .map((q) =>
        q
          .replace(/^(\d+[\).\s-]*|Q\d+[:\s-]*|[-•]\s*)/, "") // remove numbers/bullets
          .trim()
      )
      .filter((q) => q.length > 10 && /[a-zA-Z?]/.test(q)); // only keep meaningful text

    if (questions.length === 0 && text) {
      questions.push(text.trim());
    }

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

    // 🎯 Step 5: Return session ID
    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error("🔥 Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to generate interview questions" },
      { status: 500 }
    );
  }
}
