// lib/geminiClient.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error("Missing NEXT_PUBLIC_GEMINI_API_KEY in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// ✅ Export model directly
export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
