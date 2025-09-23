'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';


// --- Supabase Configuration ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase;
let initializationError = null;

if (!supabaseUrl || !supabaseAnonKey) {
    initializationError = "Supabase configuration is missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.";
} else {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
        initializationError = `There was an error initializing Supabase: ${e.message}`;
    }
}

// --- Helper Components ---
const Spinner = () => <div className="border-4 border-gray-300 border-t-cyan-500 rounded-full w-12 h-12 animate-spin"></div>;


// --- Main App Component ---
export default function App() {
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);

  // --- Display configuration error if Supabase isn't set up ---
  if (initializationError) {
      return (
          <div className="bg-gray-900 min-h-screen flex flex-col justify-center items-center text-white p-8 text-center">
              <div className="bg-red-900 border border-red-500 p-8 rounded-lg max-w-2xl shadow-2xl">
                  <h1 className="text-2xl font-bold mb-4">Configuration Required</h1>
                  <p className="text-lg">{initializationError}</p>
                  <p className="mt-4 text-sm text-red-300">Remember to restart your server after creating or updating the .env.local file.</p>
              </div>
          </div>
      );
  }

  // --- Supabase Auth and Data Fetching ---
  useEffect(() => {
    const setup = async () => {
        // Step 1: Handle User Authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            setUser(session.user);
        } else {
            const { data: newSessionData } = await supabase.auth.signInAnonymously();
            if (newSessionData) setUser(newSessionData.user);
        }

        // Step 2: Find the active challenge
        const findActiveChallenge = async () => {
            
            // ================= THIS IS THE CORRECTED QUERY =================
            // It now finds any challenge with permission=true, ignoring the time.
            // This is better for development and testing.
            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .eq('permission', true)
                .order('event_date', { ascending: false })
                .limit(1);
            // ===============================================================

            if (error) {
                console.error("Error fetching active challenge:", error);
                // ALSO, CHECK YOUR RLS POLICY. You need a public SELECT policy.
                // Example: CREATE POLICY "Public read access for live challenges"
                // ON public.challenges FOR SELECT USING (permission = true);
            } else {
                setActiveChallenge(data[0] || null);
            }
            setIsLoading(false);
        };
        
        findActiveChallenge();

        // Step 3: Listen for real-time changes
        const channel = supabase.channel('public:challenges')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, payload => {
            findActiveChallenge();
          })
          .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };
    setup();
  }, []);

  // --- Countdown Timer ---
  useEffect(() => {
    let timerId;
    if (activeChallenge && !showScore && timeLeft > 0) {
      timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && activeChallenge && !showScore) {
        handleSubmit(); // Auto-submit
    }
    return () => clearInterval(timerId);
  }, [activeChallenge, timeLeft, showScore]);

  const handleAnswerSelect = (questionIndex, option) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: option }));
  };

  // --- Submit Score to Supabase ---
  const handleSubmit = async () => {
    if (!activeChallenge || !user || showScore) return; 

    try {
        let calculatedScore = 0;
        const detailedAnswers = activeChallenge.question.map((qData, index) => {
            let q = typeof qData === 'string' ? JSON.parse(qData) : qData;
            const userAnswer = userAnswers[index] || null;
            if (userAnswer === q.correctAnswer) {
                calculatedScore++;
            }
            return {
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                userAnswer: userAnswer,
            };
        });

        setScore(calculatedScore);
        setShowScore(true);

        const submissionData = JSON.stringify(detailedAnswers);

        // Make sure you have a table 'challenges_score' and RLS policies for it
        const { error } = await supabase.from('challenges_score').insert({
            challenges_id: activeChallenge.id,
            user_id: user.id,
            scores: submissionData
        });
        if (error) console.error("Error saving score:", error);

    } catch (e) {
        console.error("Failed to process and submit answers:", e);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- All JSX Rendering remains the same ---
  if (isLoading) {
    return (
      <div className="bg-gray-900 min-h-screen flex flex-col justify-center items-center text-white p-4">
        <Spinner />
        <p className="mt-4 text-xl">Connecting to AILab...</p>
      </div>
    );
  }

  if (!activeChallenge) {
    return (
      <div className="bg-gray-900 min-h-screen flex flex-col justify-center items-center text-white p-4 text-center">
        <h1 className="text-4xl font-bold text-cyan-400">Welcome to the Aptitude Test</h1>
        <p className="mt-4 text-xl text-gray-300">There are no active challenges at the moment.</p>
        <p className="text-gray-400">Please wait for the administrator to start an event.</p>
      </div>
    );
  }
  
  if (showScore) {
      return (
         <div className="bg-gray-900 min-h-screen flex flex-col justify-center items-center text-white p-4 text-center">
            <h1 className="text-5xl font-bold text-cyan-400">Test Complete!</h1>
            <p className="mt-4 text-2xl text-gray-300">Thank you for participating.</p>
            <div className="mt-8 bg-gray-800 p-8 rounded-2xl shadow-xl">
                <p className="text-xl text-gray-400">Your Score:</p>
                <p className="text-7xl font-bold my-2">
                    <span className="text-green-400">{score}</span>
                    <span className="text-3xl text-white"> / {activeChallenge.question.length}</span>
                </p>
            </div>
             <p className="mt-8 text-gray-500">You may now close this window.</p>
        </div>
      )
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="bg-gray-800 p-4 rounded-xl shadow-lg mb-8 sticky top-4 z-10">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-cyan-400">{activeChallenge.event_name}</h1>
                <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-700 text-cyan-400'}`}>{formatTime(timeLeft)}</div>
            </div>
        </header>
        <main className="space-y-6">
          {activeChallenge.question.map((qData, index) => {
            let q;
            try {
                q = (typeof qData === 'string') ? JSON.parse(qData) : qData;
                if (typeof q !== 'object' || q === null) throw new Error("Invalid question data");

                return (
                    <div key={index} className="bg-gray-800 p-6 rounded-xl shadow-lg">
                        <p className="font-semibold text-white text-lg mb-4"><span className="text-cyan-400 mr-2">Q{index + 1}.</span>{q.question}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options && Array.isArray(q.options) && q.options.map((option, i) => (
                                <button key={i} onClick={() => handleAnswerSelect(index, option)} className={`p-3 text-left rounded-lg border-2 transition-all w-full ${userAnswers[index] === option ? 'bg-cyan-500 border-cyan-400 font-bold' : 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white hover:border-cyan-500'}`}>{option}</button>
                            ))}
                        </div>
                    </div>
                );
            } catch (e) {
                console.error("Failed to parse or render question data:", qData, e);
                return (
                    <div key={index} className="bg-red-800 p-4 rounded-lg text-white">
                        Could not display question {index + 1}. Data may be corrupted.
                    </div>
                );
            }
          })}
        </main>
        <footer className="mt-8 text-center">
            <button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-12 rounded-lg shadow-lg text-xl transition-transform transform hover:scale-105">Submit Test</button>
        </footer>
      </div>
    </div>
  );
}