import OpenAI from "openai";

// ✅ Check for API key
if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error("❌ Missing NEXT_PUBLIC_OPENAI_API_KEY in environment variables");
}

// ✅ Create OpenAI client instance
export const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // ⚠️ only if calling from client components
});

export default openai;
