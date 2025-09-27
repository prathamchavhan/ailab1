import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request) {
  console.log("API route '/api/generate-questions' was hit.");

  // 1. Get all API keys from the environment variable and split them into an array
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
    console.log("Attempting to generate questions for level:", level);
    if (!level) {
      return NextResponse.json({ error: "Level is required." }, { status: 400 });
    }

    // 2. Loop through each API key
    for (const key of apiKeys) {
      try {
        console.log(`Attempting to use API key ending with "...${key.slice(-4)}"`);
        
        // Create a new client for each key
        const genAI = new GoogleGenerativeAI(key.trim());
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const promptTemplate = `
          Generate a JSON object with 3 keys: "quantitative", "logical", "verbal".
          For each key, provide an array of 10 unique multiple-choice questions of ${level} difficulty.
          Return strictly in the specified JSON format.
        `;

        // 3. Try to generate content with the current key
        const result = await model.generateContent(promptTemplate);
        const response = await result.response;
        const text = response.text();

        console.log(`API key "...${key.slice(-4)}" succeeded!`);
        
        // If successful, parse and return the response immediately, exiting the loop.
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return NextResponse.json(JSON.parse(jsonString));

      } catch (error) {
        // 4. Check if the error is a quota error (429)
        if (error.message && error.message.includes('[429 Too Many Requests]')) {
          console.warn(`API key "...${key.slice(-4)}" is exhausted. Trying next key...`);
          // This key is exhausted, the loop will continue to the next one.
          continue;
        } else {
          // If it's a different error (e.g., bad request), stop and throw the error.
          console.error("A non-quota error occurred:", error);
          throw error;
        }
      }
    }

    // 5. If the loop finishes, it means all keys failed.
    console.error("All API keys are exhausted or failed.");
    return NextResponse.json(
      { error: "All available API keys have exceeded their quota. Please try again later." },
      { status: 429 } // Return 429 to indicate quota issue
    );

  } catch (error) {
    console.error("A critical error occurred in the API route:", error);
    return NextResponse.json(
      { error: "Failed to generate questions due to a server error." },
      { status: 500 }
    );
  }
}