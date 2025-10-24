import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request) {
  console.log("API route '/api/generate-questions' was hit.");

  // Get API keys from environment variables and split them
  const apiKeys = (process.env.NEXT_PUBLIC_GEMINI_API_KEY || "").split(',');
  if (!apiKeys.length || !apiKeys[0]) {
    console.error("NEXT_PUBLIC_GEMINI_API_KEY environment variable is not set or empty.");
    return NextResponse.json(
      { error: "API keys are not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    // Handle different formats
    const {
      level,
      round,
      domain,
      company,
      jobRole,
      experienceLevel,
      industry,
      numberOfQuestions = 5,
      interviewType = "technical"
    } = body;

    // Check for required fields based on format
    if (!level && !jobRole && !domain) {
      return NextResponse.json({ error: "Level, job role, or domain is required." }, { status: 400 });
    }

    // Loop through API keys for fallback/quota management
    for (const key of apiKeys) {
      try {
        console.log(`Attempting to use API key ending with "...${key.slice(-4)}"`);

        const genAI = new GoogleGenerativeAI(key.trim());

        // Use gemini-2.5-flash for speed, and enforce JSON output
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: {
            response_mime_type: "application/json",
          }
        });

        let promptTemplate;
        let isInterviewFormat = false;

        if ((jobRole && experienceLevel && industry) || (domain && company)) {
          // Interview format (either new or AIInterviewForm format)
          isInterviewFormat = true;
          const role = jobRole || "Software Engineer";
          const industryType = industry || domain || "Technology";
          const exp = experienceLevel || level || "Entry";
          const numQuestions = numberOfQuestions || 5;

          promptTemplate = `
            Generate ${numQuestions} interview questions for a ${role} position in the ${industryType} industry for ${exp} level candidates.
            
            Interview type: ${interviewType || "mixed"}
            
            Return a JSON array of objects where each object has:
            - "id": unique identifier (e.g., "q1", "q2", etc.)
            - "question": the interview question text
            - "type": question type ("technical", "behavioral", or "situational")
            - "category": relevant skill category (e.g., "problem-solving", "leadership", "technical-skills")
            
            Make questions appropriate for the experience level and industry. For technical interviews, include coding concepts, system design, or technical problem-solving. For behavioral interviews, focus on past experiences, teamwork, and soft skills.
          `;
        } else {
          // Legacy aptitude test format
          promptTemplate = `
            Generate a JSON object with 3 keys: "quantitative", "logical", "verbal".
            For each key, provide an array of 10 unique multiple-choice questions of ${level || "medium"} difficulty.
            Each question object must have "question", "options" (an array of 4 strings), and "answer" keys.
          `;
        }

        const result = await model.generateContent(promptTemplate);
        const response = await result.response;

        console.log(`API key "...${key.slice(-4)}" succeeded!`);

        // --- ROBUST JSON PARSING BLOCK to prevent 500 errors ---
        try {
          let responseText = response.text().trim();

          // Clean markdown fences (```json...```)
          if (responseText.startsWith('```json')) {
            const startIndex = responseText.indexOf('```json') + 7;
            const endIndex = responseText.lastIndexOf('```');

            if (endIndex > startIndex) {
              responseText = responseText.substring(startIndex, endIndex).trim();
            } else {
              // Fallback for missing closing fence
              responseText = responseText.replace(/^```json\s*/, '').trim();
            }
          }

          // Check for a leading single backtick
          if (responseText.startsWith('`')) {
            responseText = responseText.substring(1).trim();
          }

          const jsonData = JSON.parse(responseText);

          // Handle different response formats
          if (isInterviewFormat && (domain || jobRole)) {
            // For AIInterviewForm format, create a sessionId and return it
            const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Store questions and config for the interview page
            // For now, we'll return the sessionId and let the client handle storage
            return NextResponse.json({
              sessionId,
              questions: jsonData,
              config: { level, round, domain, company, jobRole, experienceLevel, industry }
            });
          } else {
            // For legacy format, return questions directly
            return NextResponse.json(jsonData);
          }

        } catch (parseError) {
          console.error("JSON Parsing failed for LLM output:", parseError);
          // Return a specific error with the raw text snippet for debugging
          const originalRawText = response.text();

          return NextResponse.json(
            {
              error: "Failed to parse generated questions (invalid JSON format from LLM).",
              details: parseError.message,
              raw_response_snippet: originalRawText.substring(0, 500) + (originalRawText.length > 500 ? '...' : ''),
            },
            { status: 500 }
          );
        }
        // --- END OF ROBUST JSON PARSING BLOCK ---

      } catch (error) {
        // Handle API specific errors (e.g., Quota exceeded)
        if (error.message && error.message.includes('[429 Too Many Requests]')) {
          console.warn(`API key "...${key.slice(-4)}" is exhausted. Trying next key...`);
          continue; // Try the next key
        } else {
          // Re-throw any other unexpected API error to be caught by the outer block
          console.error("A non-quota error occurred:", error);
          throw error;
        }
      }
    }

    // If the loop finishes without success
    console.error("All API keys are exhausted or failed.");
    return NextResponse.json(
      { error: "All available API keys have exceeded their quota." },
      { status: 429 }
    );

  } catch (error) {
    // Handle errors outside the loop (e.g., request.json() failure, or re-thrown API error)
    console.error("A critical error occurred in the API route:", error);
    return NextResponse.json(
      { error: "Failed to generate questions due to a server error.", details: error.message },
      { status: 500 }
    );
  }
}