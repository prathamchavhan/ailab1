import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Check for API key before initializing
if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error("❌ Missing NEXT_PUBLIC_GEMINI_API_KEY in environment variables");
}

// ✅ Create Gemini client instance
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// ✅ Export both model and client
export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
export default genAI;
