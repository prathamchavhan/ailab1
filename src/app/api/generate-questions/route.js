import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request) {
  console.log("API route '/api/generate-questions' was hit.");

  const apiKeys = (process.env.GEMINI_API_KEYS || "").split(',');
  if (!apiKeys.length || !apiKeys[0]) {
    console.error("GEMINI_API_KEYS environment variable is not set or empty.");
    return NextResponse.json(
      { error: "API keys are not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const { level } = await request.json();
    if (!level) {
      return NextResponse.json({ error: "Level is required." }, { status: 400 });
    }

    for (const key of apiKeys) {
      try {
        console.log(`Attempting to use API key ending with "...${key.slice(-4)}"`);
        
        const genAI = new GoogleGenerativeAI(key.trim());
        // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        // Tell the model we want a JSON response
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          generationConfig: {
            response_mime_type: "application/json",
          }
        });

        const promptTemplate = `
          Generate a JSON object with 3 keys: "quantitative", "logical", "verbal".
          For each key, provide an array of 10 unique multiple-choice questions of ${level} difficulty.
          Each question object must have "question", "options" (an array of 4 strings), and "answer" keys.
        `;

        const result = await model.generateContent(promptTemplate);
        const response = await result.response;
        
        console.log(`API key "...${key.slice(-4)}" succeeded!`);
        
        // The response text is now guaranteed to be a JSON string, no need to replace '```json'
        const jsonData = JSON.parse(response.text());
        return NextResponse.json(jsonData);

      } catch (error) {
        if (error.message && error.message.includes('[429 Too Many Requests]')) {
          console.warn(`API key "...${key.slice(-4)}" is exhausted. Trying next key...`);
          continue;
        } else {
          console.error("A non-quota error occurred:", error);
          throw error;
        }
      }
    }

    console.error("All API keys are exhausted or failed.");
    return NextResponse.json(
      { error: "All available API keys have exceeded their quota." },
      { status: 429 }
    );

  } catch (error) {
    console.error("A critical error occurred in the API route:", error);
    // Include more error details for easier debugging
    return NextResponse.json(
      { error: "Failed to generate questions due to a server error.", details: error.message },
      { status: 500 }
    );
  }
}