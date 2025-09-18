// File: app/api/generate-questions/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request) {
  // 1. Log that the function has started
  console.log("API route '/api/generate-questions' was hit.");

  try {
    const { level } = await request.json();

    // 2. Log the received level
    console.log("Attempting to generate questions for level:", level);

    if (!level) {
      console.error("Validation Error: Level is required.");
      return NextResponse.json({ error: "Level is required." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    const promptTemplate = `
      Generate a JSON object containing aptitude questions for a test.
      The difficulty for all questions should be ${level}.
      The JSON object must have three keys: "quantitative", "logical", and "verbal".
      For each key, provide an array of exactly 10 unique multiple-choice questions.
      Return strictly in this JSON format and nothing else:
      {
        "quantitative": [
          { "question": "...", "options": [...], "answer": "..." }
        ],
        "logical": [
          { "question": "...", "options": [...], "answer": "..." }
        ]
      }
      `; // Note: Shortened for brevity in the prompt, but the model understands the pattern.
      
    const result = await model.generateContent(promptTemplate);
    const response = await result.response;
    const text = response.text();

    // 3. --- THIS IS THE MOST IMPORTANT LOG ---
    // It prints the raw text from the AI before we try to parse it.
    console.log("--- RAW RESPONSE FROM GEMINI ---");
    console.log(text);
    console.log("--------------------------------");

    // A more robust way to clean the response
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    const jsonString = text.substring(startIndex, endIndex + 1);

    console.log("Attempting to parse JSON...");
    const parsedJson = JSON.parse(jsonString);
    console.log("JSON parsed successfully!");

    return NextResponse.json(parsedJson);
    
  } catch (error) {
    // 4. Log the full error to see what went wrong
    console.error("\n!!!!!!!! ERROR in API route !!!!!!!!");
    console.error(error);
    console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n");
    return NextResponse.json(
      { error: "Failed to generate questions. Check server logs for details." },
      { status: 500 }
    );
  }
}