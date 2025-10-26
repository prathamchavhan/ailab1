import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
// 1. Import Supabase helpers
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

async function generateAptitudeCategory(genAI, level, category) {
  console.log(`Starting generation for: ${category} (Level: ${level})`);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // Using latest flash model
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const promptTemplate = `
    Generate a JSON array of 10 unique multiple-choice questions for ${category} aptitude of ${level} difficulty.
    Each question object must have "question", "options" (an array of 4 strings), and "answer" keys.
    Return ONLY the JSON array.
  `;

  const result = await model.generateContent(promptTemplate);
  const response = await result.response;

  console.log(`Raw response received for ${category}`);
  return response.text();
}


export async function POST(request) {
  console.log("API route '/api/generate' was hit.");

  // 2. Create the Supabase client for Route Handlers
  const supabase = createRouteHandlerClient({ cookies });

  // 3. Get the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized user" }, { status: 401 });
  }

  // Get API keys from environment variables and split them (SECURE VERSION)
  const apiKeys = (process.env.GEMINI_API_KEYS || "").split(',');
  if (!apiKeys.length || !apiKeys[0]) {
    console.error("GEMINI_API_KEYS environment variable is not set or empty.");
    return NextResponse.json(
      { error: "API keys are not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    const {
      level,
      round,
      domain,
      company,
      jobRole,
      experienceLevel,
      industry,
      numberOfQuestions = 10, 
      interviewType = "technical"
    } = body;


    if (!level && !jobRole && !domain) {
      return NextResponse.json({ error: "Level, job role, or domain is required." }, { status: 400 });
    }

    for (const key of apiKeys) {
      try {
        console.log(`Attempting to use API key ending with "...${key.slice(-4)}"`);

        const genAI = new GoogleGenerativeAI(key.trim());
        let isInterviewFormat = false; // Flag to track format

        if ((jobRole && experienceLevel && industry) || (domain && company) || domain) {
          // *** THIS IS YOUR ORIGINAL INTERVIEW LOGIC ***
          isInterviewFormat = true;
          const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash", // ✅ FIXED: Using the correct, active model
            generationConfig: {
              responseMimeType: "application/json",
            }
          });
          
          const role = jobRole || "professional";
          const industryType = industry || domain || "General Knowledge";
          const exp = experienceLevel || level || "Entry";
          const numQuestions = numberOfQuestions || 10;
          const currentRound = round || "1"; // Use the round variable

          const promptTemplate = `
            Generate ${numQuestions} question bank questions for the domain "${domain}".
            
            This is for: Round ${currentRound}
            Difficulty Level: ${exp}
            Target Role: ${role}
            Industry: ${industryType}
            Question Types: ${interviewType || "mixed"}
            
            Return a JSON array of objects where each object has:
            - "id": unique identifier (e.g., "q1", "q2", etc.)
            - "question": The question text.
            - "answer": A detailed, expert-level answer to the question.
            - "type": A relevant question type (e.g., "technical", "behavioral", "conceptual", "problem-solving").
            - "category": A relevant skill category (e.g., "${domain}", "Data Structures", "Sales Strategy").
            
            Ensure the questions and answers are high-quality, accurate, and appropriate for the specified domain, role, and difficulty level.
          `;
          
          const result = await model.generateContent(promptTemplate);
          const response = await result.response;
          const rawText = response.text();

          console.log(`API key "...${key.slice(-4)}" succeeded for interview format!`);

          try {
            let responseText = rawText.trim();

            // ... (your existing JSON cleaning logic) ...
            if (responseText.startsWith('```json')) {
              const startIndex = responseText.indexOf('```json') + 7;
              const endIndex = responseText.lastIndexOf('```');

              if (endIndex > startIndex) {
                responseText = responseText.substring(startIndex, endIndex).trim();
              } else {
                responseText = responseText.replace(/^```json\s*/, '').trim();
              }
            }
            if (responseText.startsWith('`')) {
              responseText = responseText.substring(1).trim();
            }

            const jsonData = JSON.parse(responseText);
            const questionsArray = Array.isArray(jsonData) ? jsonData : (jsonData.questions || []);

            // --- 4. START: NEW DATABASE LOGIC ---

            // A. Create the session in 'interview_sessions'
            console.log("Creating interview session in database...");
            const { data: sessionData, error: sessionError } = await supabase
              .from("interview_sessions")
              .insert({
                user_id: user.id,
                type: exp,
                domain: domain || role,
                round: currentRound,
                company: company || null,
              })
              .select("id") // Get the new session's UUID back
              .single();

            if (sessionError) {
              console.error("Supabase session insert error:", sessionError);
              throw new Error(`Failed to create interview session: ${sessionError.message}`);
            }

            const newSessionId = sessionData.id;
            console.log(`Successfully created session with ID: ${newSessionId}`);

            // B. Format questions for 'interview_question' table
            const questionsToInsert = questionsArray.map(q => ({
              session_id: newSessionId,
              question: q.question,
              round: currentRound,
              // Create a unique code for the question, e.g., 'uuid::q1'
              question_code: `${newSessionId}::${q.id}` 
            }));

            // C. Insert all questions into 'interview_question'
            console.log(`Inserting ${questionsToInsert.length} questions into database...`);
            const { error: questionError } = await supabase
              .from("interview_question")
              .insert(questionsToInsert);

            if (questionError) {
              console.error("Supabase question insert error:", questionError);
              // Note: You might want to delete the session you just created for cleanup
              await supabase.from("interview_sessions").delete().eq("id", newSessionId);
              throw new Error(`Failed to save questions: ${questionError.message}`);
            }

            console.log("Successfully saved questions to database.");
            
            


            // 5. Return the REAL session ID from the database
            return NextResponse.json({
              sessionId: newSessionId, // Send the real UUID
              questions: questionsArray,
              config: { level, round, domain, company, jobRole, experienceLevel, industry }
            });
            
            
          } catch (parseError) {
            console.error("JSON Parsing or DB error (Interview):", parseError);
            const originalRawText = rawText; 

            return NextResponse.json(
              {
                error: "Failed to parse or save generated questions.",
                details: parseError.message,
                raw_response_snippet: originalRawText.substring(0, 500) + (originalRawText.length > 500 ? '...' : ''),
              },
              { status: 500 }
            );
          }
        

        } else {
     
          // --- THIS IS YOUR EXISTING APTITUDE LOGIC (UNCHANGED) ---
          console.log("Starting parallel generation for aptitude test...");
          const categories = ["quantitative", "logical", "verbal"];
          const currentLevel = level || "medium";

         
          const promises = categories.map(category => 
            generateAptitudeCategory(genAI, currentLevel, category)
          );

       
          const rawResults = await Promise.all(promises);

          console.log(`API key "...${key.slice(-4)}" succeeded for all 3 categories!`);

          
          try {
            const jsonData = {};
            
            for (let i = 0; i < categories.length; i++) {
              const category = categories[i];
              let responseText = rawResults[i].trim();
              
              // ... (your existing JSON cleaning logic) ...
              if (responseText.startsWith('```json')) {
                const startIndex = responseText.indexOf('```json') + 7;
                const endIndex = responseText.lastIndexOf('```');
                if (endIndex > startIndex) {
                  responseText = responseText.substring(startIndex, endIndex).trim();
                } else {
                  responseText = responseText.replace(/^```json\s*/, '').trim();
                }
              }
              if (responseText.startsWith('`')) {
                responseText = responseText.substring(1).trim();
              }
              if (!responseText.startsWith('[')) {
                 console.warn(`Response for ${category} did not start with '['. Attempting to fix...`);
                 const arrayStartIndex = responseText.indexOf('[');
                 if (arrayStartIndex > -1) {
                   responseText = responseText.substring(arrayStartIndex);
                 }
              }
              if (!responseText.endsWith(']')) {
                 console.warn(`Response for ${category} did not end with ']'. Attempting to fix...`);
                 const arrayEndIndex = responseText.lastIndexOf(']');
                 if (arrayEndIndex > -1) {
                   responseText = responseText.substring(0, arrayEndIndex + 1);
                 }
              }

              jsonData[category] = JSON.parse(responseText);
            }
            
          
            return NextResponse.json(jsonData);

          } catch (parseError) {
             console.error("JSON Parsing failed for one of the parallel aptitude results:", parseError);
             return NextResponse.json(
               {
                 error: "Failed to parse one of the generated question categories.",
                 details: parseError.message,
                 raw_responses: {
                   quantitative: rawResults[0].substring(0, 200),
                   logical: rawResults[1].substring(0, 200),
                   verbal: rawResults[2].substring(0, 200),
                 }
               },
               { status: 500 }
             );
          }
     
        }

      } catch (error) {
       
        const errorMessage = error.message || String(error);
        if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests') || errorMessage.includes('quota')) {
          console.warn(`API key "...${key.slice(-4)}" is exhausted or rate-limited. Trying next key...`);
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