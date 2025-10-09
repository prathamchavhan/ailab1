// File: app/api/generate-feedback/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request) {
  const apiKeys = (process.env.GEMINI_API_KEYS || "").split(',');
  if (!apiKeys.length || !apiKeys[0]) {
    return NextResponse.json({ error: "API keys are not configured." }, { status: 500 });
  }
  
  const { totalScore, totalQuestions, sectionPerformance, timeManagementFeedback } = await request.json();

  const promptTemplate = `
    Based on the following aptitude test results, provide a concise and actionable feedback summary. The response must be a JSON object with the following keys: 'strengthHighlight', 'timeManagement', and 'recommendations'.

    - **Total Score**: ${totalScore} out of ${totalQuestions}
    - **Section Scores (as percentage of correct answers in each section)**:
      - Quantitative Aptitude: ${sectionPerformance.Quantitative}%
      - Logical Reasoning: ${sectionPerformance.Logical}%
      - Verbal Ability: ${sectionPerformance.Verbal}%
    - **Time Management**: ${timeManagementFeedback}

    For 'strengthHighlight', identify the highest-scoring section and provide a positive, encouraging statement.
    For 'timeManagement', rephrase the provided feedback into a clear, actionable insight.
    For 'recommendations', provide two specific, actionable tips to improve performance, one for the weakest section and one for another area of improvement. The tips should be formatted as a JSON object with keys 'Quantitative' and 'Verbal'.

    Example JSON response structure:
    {
      "strengthHighlight": "Your Logical Reasoning was excellent, indicating strong problem-solving ability.",
      "timeManagement": "You spent significantly longer on Quantitative Aptitude questions, affecting your overall test time.",
      "recommendations": {
        "Quantitative": "Practice speed-solving techniques for complex calculations.",
        "Verbal": "Focus on improving vocabulary and reading comprehension with daily exercises."
      }
    }

    Do not include any other text, explanations, or code fences outside the JSON object.
  `;

  for (const key of apiKeys) {
    try {
      const genAI = new GoogleGenerativeAI(key.trim());
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash-latest",
        generationConfig: {
          response_mime_type: "application/json",
        }
      });
      const result = await model.generateContent(promptTemplate);
      const feedbackData = JSON.parse(result.response.text());
      return NextResponse.json(feedbackData);
    } catch (error) {
      if (error.message && error.message.includes('[429 Too Many Requests]')) {
        continue;
      }
      console.error("Gemini API Error:", error);
      return NextResponse.json({ error: "Failed to generate feedback." }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "All API keys exhausted." }, { status: 429 });
}