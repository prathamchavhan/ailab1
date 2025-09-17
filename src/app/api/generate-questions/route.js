// File: app/api/generate-questions/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request) {
  try {
    const { aptitudeType, level } = await request.json();

    if (!aptitudeType || !level) {
      return NextResponse.json(
        { error: "Aptitude type and level are required." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const promptTemplate = `
      Generate exactly 10 unique and different ${aptitudeType} multiple-choice questions 
      of ${level} difficulty.
      
      Guidelines:
      - Vary numbers, wording, and scenarios each time.
      - Return strictly in this JSON format:
      [
        {
          "question": "string",
          "options": ["opt1", "opt2", "opt3", "opt4"],
          "answer": "correct_option"
        }
      ]
      `;
      
    const result = await model.generateContent(promptTemplate);
    const response = await result.response;
    const text = response.text();
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return NextResponse.json(JSON.parse(jsonString));
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: "Failed to generate questions from the AI model." },
      { status: 500 }
    );
  }
}