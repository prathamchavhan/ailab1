// --- Start of Corrected Code ---
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
        
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash",
          generationConfig: {
            response_mime_type: "application/json",
          }
        });
        
        // **REFINED PROMPT to ensure consistent JSON output**
        const promptTemplate = `
          Generate a JSON object for multiple-choice questions. The JSON should strictly follow this structure and nothing else:
          
          {
            "quantitative": [
              { "question": "...", "options": ["...", "...", "...", "..."], "answer": "..." },
              // ... 9 more questions
            ],
            "logical": [
              { "question": "...", "options": ["...", "...", "...", "..."], "answer": "..." },
              // ... 9 more questions
            ],
            "verbal": [
              { "question": "...", "options": ["...", "...", "...", "..."], "answer": "..." },
              // ... 9 more questions
            ]
          }
          
          The questions should be of "${level}" difficulty. Ensure each array contains exactly 10 unique questions. Do not include any text, code fences, or explanations outside the JSON object itself.
        `;

        const result = await model.generateContent(promptTemplate);
        const response = await result.response;
        
        console.log(`API key "...${key.slice(-4)}" succeeded!`);
        
        try {
            let responseText = response.text().trim();
            
            // Clean markdown fences. The `response_mime_type` should prevent this, but this is a good fallback.
            if (responseText.startsWith('```json')) {
                const startIndex = responseText.indexOf('```json') + 7;
                const endIndex = responseText.lastIndexOf('```');
                if (endIndex > startIndex) {
                    responseText = responseText.substring(startIndex, endIndex).trim();
                } else {
                    responseText = responseText.replace(/^```json\s*/, '').trim();
                }
            }
            
            // **New, more aggressive cleanup for leading/trailing junk**
            // This is the most important change. It removes any non-JSON characters from the start and end.
            responseText = responseText.replace(/^[^\{]*/, '').replace(/[^\}]*$/, '');

            const jsonData = JSON.parse(responseText);
            return NextResponse.json(jsonData);
            
        } catch (parseError) {
            console.error("JSON Parsing failed for LLM output:", parseError);
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
    return NextResponse.json(
      { error: "Failed to generate questions due to a server error.", details: error.message },
      { status: 500 }
    );
  }
}
// --- End of Corrected Code ---