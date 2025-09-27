import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request) {
  console.log("API route '/api/generate-questions' was hit.");

  // Get API keys from environment variables and split them
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

        // NOTE: Temporarily set to 3 questions for stability/speed testing. 
        // You can change '3' back to '10' once this code is confirmed working.
        const promptTemplate = `
          Generate a JSON object with 3 keys: "quantitative", "logical", "verbal".
          For each key, provide an array of 10 unique multiple-choice questions of ${level} difficulty.
          Each question object must have "question", "options" (an array of 4 strings), and "answer" keys.
        `;

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
            return NextResponse.json(jsonData);
            
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