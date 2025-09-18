// File: app/api/generate-questions/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Ensure your GEMINI_API_KEY is correctly set in your .env.local file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request) {
  try {
    const { type, level } = await request.json();

    if (!type || !level) {
      return NextResponse.json(
        { error: "Aptitude type and level are required." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const promptTemplate = `
      You are an expert test creator. Generate exactly 10 unique multiple-choice questions for an aptitude test.
      The topic is "${type}".
      The difficulty level is "${level}".

      Guidelines:
      - Vary numbers, wording, and scenarios each time.
      - Return ONLY a valid JSON array of objects with this structure:
      [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "answer": "string"
        }
      ]
      `;

    const result = await model.generateContent(promptTemplate);
    const response = await result.response;
    const text = response.text();

    try {
      const jsonData = JSON.parse(text);
      return NextResponse.json(jsonData);
    } catch (parseError) {
      console.error('JSON Parsing Error:', parseError);
      console.error('Raw text received from Gemini:', text);
      return NextResponse.json(
        { error: "The AI model returned a response that was not valid JSON." },
        { status: 500 }
      );
    }

  } catch (error) {
    // This console log is key to debugging. Look at your server terminal for this message.
    console.error('Gemini API Error:', error.message || error);

    // Return a more descriptive error message to the frontend
    return NextResponse.json(
      { error: `Failed to generate questions. Details: ${error.message || 'Unknown error occurred.'}` },
      { status: 500 }
    );
  }
}