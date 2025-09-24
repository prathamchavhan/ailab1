'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- Supabase Configuration ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase;
let initializationError = null;

if (!supabaseUrl || !supabaseAnonKey) {
    initializationError = "Supabase configuration is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.";
} else {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
        initializationError = `Error initializing Supabase: ${e.message}`;
    }
}

// --- Helper Components ---
const Spinner = () => <div className="border-4 border-gray-300 border-t-cyan-500 rounded-full w-12 h-12 animate-spin"></div>;

// --- Main AILab Component ---
export default function AILabPage() {
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  
  // ✅ ADDED: New state to track if the user has already submitted for this challenge
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCheckingSubmission, setIsCheckingSubmission] = useState(true);


  if (initializationError) {
     return (
        <div className="bg-gray-900 min-h-screen flex justify-center items-center text-white p-8">
            <div className="bg-red-900 border border-red-500 p-8 rounded-lg max-w-2xl text-center shadow-2xl">
                <h1 className="text-2xl font-bold mb-4">Configuration Required</h1>
                <p className="text-lg">{initializationError}</p>
            </div>
        </div>
     );
  }

  const handleSubmit = useCallback(async () => {
    if (!activeChallenge || !user || showScore) return; 
    setShowScore(true);
    try {
        let calculatedScore = 0;
        const detailedAnswers = activeChallenge.question.map((q, index) => {
            const userAnswer = userAnswers[index] || null;
            if (userAnswer === q.correctAnswer) calculatedScore++;
            return { question: q.question, userAnswer, correctAnswer: q.correctAnswer };
        });
        setScore(calculatedScore);
        const { error } = await supabase.from('challenges_score').insert({
            challenges_id: activeChallenge.id,
            user_id: user.id,
            scores: { score: calculatedScore, total: activeChallenge.question.length, answers: detailedAnswers }
        });
        if (error) console.error("Error saving score to database:", error);
        localStorage.removeItem(`challengeStartTime_${activeChallenge.id}`);
    } catch (e) {
        console.error("Failed to process and submit answers:", e);
    }
  }, [activeChallenge, user, showScore, userAnswers]);

  useEffect(() => {
    const setup = async () => {
        setIsLoading(true);
        setIsCheckingSubmission(true);

        // Step 1: Authenticate user
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        let currentUser = session?.user;

        if (!currentUser) {
            const { data: anonSession, error: signInError } = await supabase.auth.signInAnonymously();
            if (signInError) console.error("Error signing in anonymously:", signInError);
            else currentUser = anonSession?.user ?? null;
        }
        setUser(currentUser);
        
        // Step 2: Find active challenge
        const { data: challengeData, error: challengeError } = await supabase
            .from('challenges')
            .select('*')
            .eq('permission', true)
            .order('created_at', { ascending: false })
            .limit(1);

        if (challengeError) {
            console.error("Error fetching active challenge:", challengeError);
            setIsLoading(false);
            setIsCheckingSubmission(false);
            return;
        }

        const challenge = challengeData && challengeData.length > 0 ? challengeData[0] : null;
        setActiveChallenge(challenge);
        setIsLoading(false);

        // ✅ CHANGED: Perform submission check and timer logic
        if (currentUser && challenge) {
            const { data: submissionData, error: submissionError } = await supabase
                .from('challenges_score')
                .select('id')
                .eq('user_id', currentUser.id)
                .eq('challenges_id', challenge.id)
                .limit(1);

            if (submissionError) {
                console.error("Error checking for previous submissions:", submissionError);
            } else if (submissionData && submissionData.length > 0) {
                // User has already submitted
                setHasSubmitted(true);
            } else {
                // User has NOT submitted, set up the timer
                setHasSubmitted(false);
                const startTimeKey = `challengeStartTime_${challenge.id}`;
                const savedStartTime = localStorage.getItem(startTimeKey);
                const totalDurationSeconds = challenge.duration_minutes * 60;
                if (savedStartTime) {
                    const elapsedMilliseconds = Date.now() - parseInt(savedStartTime, 10);
                    const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
                    const remainingTime = totalDurationSeconds - elapsedSeconds;
                    setTimeLeft(Math.max(0, remainingTime));
                } else {
                    localStorage.setItem(startTimeKey, Date.now().toString());
                    setTimeLeft(totalDurationSeconds);
                }
            }
        }
        setIsCheckingSubmission(false);
    };

    setup();
    
    // Real-time listener remains the same
    const channel = supabase.channel('public:challenges')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, () => setup())
        .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    if (!activeChallenge || showScore || hasSubmitted || timeLeft === null || timeLeft <= 0) {
        if (timeLeft !== null && timeLeft <= 0 && !showScore && !hasSubmitted) {
           handleSubmit();
        }
        return;
    }
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [activeChallenge, showScore, timeLeft, hasSubmitted, handleSubmit]);

  const handleAnswerSelect = (questionIndex, option) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: option }));
  };

  const formatTime = (seconds) => {
    if (seconds === null) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- JSX Rendering ---
  if (isLoading || isCheckingSubmission) {
    return <div className="bg-gray-900 min-h-screen flex justify-center items-center"><Spinner /></div>;
  }

  if (!activeChallenge) {
    return (
      <div className="bg-gray-900 min-h-screen flex flex-col justify-center items-center text-center text-white p-4">
        <h1 className="text-4xl font-bold text-cyan-400">Welcome to the Aptitude Test</h1>
        <p className="mt-4 text-xl text-gray-300">There are no active challenges at the moment.</p>
        <p className="text-gray-400">Please wait for an administrator to start an event.</p>
      </div>
    );
  }
  
  // ✅ ADDED: New screen for users who have already submitted
  if (hasSubmitted) {
      return (
         <div className="bg-gray-900 min-h-screen flex flex-col justify-center items-center text-white p-4 text-center">
            <h1 className="text-5xl font-bold text-cyan-400">Test Already Completed</h1>
            <p className="mt-4 text-xl text-gray-300">You have already submitted your score for this event.</p>
            <p className="text-gray-400">Please wait for the next challenge to begin.</p>
        </div>
      );
  }

  if (showScore) {
      return (
         <div className="bg-gray-900 min-h-screen flex flex-col justify-center items-center text-white p-4 text-center">
            <h1 className="text-5xl font-bold text-cyan-400">Test Complete!</h1>
            <div className="mt-8 bg-gray-800 p-8 rounded-2xl shadow-xl">
                <p className="text-xl text-gray-400">Your Score:</p>
                <p className="text-7xl font-bold my-2">
                    <span className="text-green-400">{score}</span>
                    <span className="text-3xl text-white"> / {activeChallenge.question.length}</span>
                </p>
            </div>
             <p className="mt-8 text-gray-500">You may now close this window.</p>
        </div>
      );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="bg-gray-800 p-4 rounded-xl shadow-lg mb-8 sticky top-4 z-10 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-cyan-400">{activeChallenge.event_name}</h1>
            <div className={`text-2xl font-mono font-bold px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-700 text-cyan-400'}`}>{formatTime(timeLeft)}</div>
        </header>
        <main className="space-y-6">
          {activeChallenge.question.map((q, index) => (
            <div key={index} className="bg-gray-800 p-6 rounded-xl shadow-lg">
                <p className="font-semibold text-lg mb-4"><span className="text-cyan-400 mr-2">Q{index + 1}.</span>{q.question}</p>
                <div className="grid grid-cols-1 md-grid-cols-2 gap-3">
                    {q.options.map((option, i) => (
                        <button key={i} onClick={() => handleAnswerSelect(index, option)} className={`p-3 text-left rounded-lg border-2 transition-all w-full ${userAnswers[index] === option ? 'bg-cyan-500 border-cyan-400 font-bold' : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-cyan-500'}`}>{option}</button>
                    ))}
                </div>
            </div>
          ))}
        </main>
        <footer className="mt-8 text-center">
            <button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-12 rounded-lg text-xl transition-transform transform hover:scale-105">Submit Test</button>
        </footer>
      </div>
    </div>
  );
}