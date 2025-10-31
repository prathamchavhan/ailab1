import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request) {
  console.log("API route '/api/get-recommendations' was hit.");

  // --- FIX 1: Use secure, server-side environment variable ---
  const apiKeys = (process.env.GEMINI_API_KEY || "").split(',');
  if (!apiKeys.length || !apiKeys[0]) {
    // Updated error log
    console.error("GEMINI_API_KEY environment variable is not set or empty.");
    return NextResponse.json(
      { error: "API keys are not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const { quantitativeScore, logicalScore, verbalScore } = await request.json();
    if (quantitativeScore === undefined || logicalScore === undefined || verbalScore === undefined) {
      return NextResponse.json({ error: "Scores are required." }, { status: 400 });
    }

    const scores = {
      'Quantitative Aptitude': quantitativeScore,
      'Logical Reasoning': logicalScore,
      'Verbal Ability': verbalScore
    };

    const sortedSections = Object.entries(scores).sort(([, a], [, b]) => b - a);
    const topSection = sortedSections[0][0];
    const bottomSection = sortedSections[sortedSections.length - 1][0];

    for (const key of apiKeys) {
      try {
        console.log(`Attempting to use API key ending with "...${key.slice(-4)}"`);

        const genAI = new GoogleGenerativeAI(key.trim());
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash", // Using your specified model
          generationConfig: {
            response_mime_type: "application/json",
          }
        });

        const promptTemplate = `
          Based on the following aptitude test scores:
          Quantitative Aptitude: ${quantitativeScore}%
          Logical Reasoning: ${logicalScore}%
          Verbal Ability: ${verbalScore}%
          
          Provide a detailed analysis and actionable recommendations. The response must be a single JSON object and nothing else, with the following keys:
          
          1.  "strength_highlight": A single sentence highlighting the strongest area. The strongest area is "${topSection}".
          2.  "time_management": A single sentence about time management. Assume that the user spent significantly longer on "${bottomSection}" questions, which impacted their overall score.
          3.  "recommendations": An array of 2-3 concise, actionable tips. Each tip should be a string focused on improving the weaker areas.
          
          Example JSON structure:
          {
            "strength_highlight": "Your Logical Reasoning was excellent, indicating strong problem-solving ability.",
            "time_management": "You spent significantly longer on Quantitative Aptitude questions, affecting your overall test time.",
            "recommendations": [
              "Quantitative: Practice speed-solving techniques for complex calculations.",
              "Verbal: Focus on improving vocabulary and reading comprehension with daily exercises."
            ]
          }
        `;

        const result = await model.generateContent(promptTemplate);
        const response = await result.response;

        console.log(`API key "...${key.slice(-4)}" succeeded!`);

        // --- FIX 2: Simplified JSON parsing ---
        // Because we set response_mime_type: "application/json",
        // we can parse the text directly without manual cleanup.
        try {
          const responseText = response.text();
          const jsonData = JSON.parse(responseText);
          return NextResponse.json({ recommendations: jsonData });

        } catch (parseError) {
          console.error("JSON Parsing failed for LLM output:", parseError);
          const originalRawText = response.text(); // Get raw text for debugging

          return NextResponse.json(
            {
              error: "Failed to parse generated recommendations (invalid JSON format from LLM).",
              details: parseError.message,
              raw_response_snippet: originalRawText.substring(0, 500) + (originalRawText.length > 500 ? '...' : ''),
            },
            { status: 500 }
          );
        }
      } catch (error) {
        if (error.message && error.message.includes('[429 Too Many Requests]')) {
          console.warn(`API key "...${key.slice(-4)}" is exhausted. Trying next key...`);
          continue;
        } else {
          console.error("A non-quota error occurred:", error);
          throw error; // Let the outer catch handle this
        }
      }
    }

    // This code runs only if all keys fail the 429 check
    console.error("All API keys are exhausted or failed.");
    return NextResponse.json(
      { error: "All available API keys have exceeded their quota." },
      { status: 429 }
    );
  } catch (error) {
    console.error("A critical error occurred in the API route:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations due to a server error.", details: error.message },
      { status: 500 }
    );
  }
}