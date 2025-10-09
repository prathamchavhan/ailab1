"use client";

import { useState, useEffect, useMemo } from "react";
import AptitudeScoreDashboard from "../../components/AptitudeScoreDashboard"; // Import the new component

// --- API FUNCTIONS ---
async function saveScore(level, score, total) {
  console.log("Saving score:", { level, score, total });
  try {
    const response = await fetch("/api/save-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "Mixed", level, score }),
    });
    if (!response.ok) throw new Error("Failed to save score.");
  } catch (error) {
    console.error("Save score error:", error);
    throw error;
  }
}

async function generateQuestions(level) {
  console.log("Generating all questions for level:", level);
  try {
    const response = await fetch("/api/generate-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level }),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch questions. Server status: ${response.status}`);
    }
    const data = await response.json();
    const quantitativeQs = data.quantitative.map((q) => ({ ...q, category: "quantitative" }));
    const logicalQs = data.logical.map((q) => ({ ...q, category: "logical" }));
    const verbalQs = data.verbal.map((q) => ({ ...q, category: "verbal" }));
    return [...quantitativeQs, ...logicalQs, ...verbalQs];
  } catch (error) {
    console.error("Generate questions error:", error);
    throw error;
  }
}

// --- CONSTANTS ---
const APTITUDE_TYPE_MAP = {
  quantitative: "Quantitative Aptitude",
  logical: "Logical Reasoning",
  verbal: "Verbal Ability",
};

// --- COMPONENT ---
export default function AptitudeTestPage() {
  const [level, setLevel] = useState("hard");
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [testState, setTestState] = useState("setup"); // "setup", "active", "finished"
  const [timer, setTimer] = useState(900); // 15 minutes
  const [isLoading, setIsLoading] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState({}); // New state for performance breakdown

  // --- EFFECTS ---
  useEffect(() => {
    if (testState !== "active" || timer === 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [testState, timer]);

  useEffect(() => {
    if (timer === 0 && testState === "active") {
      setTestState("finished");
    }
  }, [timer, testState]);

  useEffect(() => {
    if (testState === "finished") {
      const finalScore = questions.reduce(
        (acc, q, index) => (q.answer === userAnswers[index] ? acc + 1 : acc),
        0
      );
      setScore(finalScore);

      // New Logic to calculate performance breakdown
      const performance = {
        quantitative: { total: 0, correct: 0 },
        logical: { total: 0, correct: 0 },
        verbal: { total: 0, correct: 0 },
      };

      questions.forEach((q, index) => {
        performance[q.category].total += 1;
        if (q.answer === userAnswers[index]) {
          performance[q.category].correct += 1;
        }
      });

      setPerformanceData(performance);

      saveScore(level, finalScore, questions.length).catch((err) => {
        setError("Could not save your score. Please try again.");
      });
    }
  }, [testState, questions, userAnswers, level]);

  // --- DATA Memos ---
  const questionsByCategory = useMemo(() => {
    return questions.reduce((acc, question, index) => {
      const { category } = question;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({ ...question, originalIndex: index });
      return acc;
    }, {});
  }, [questions]);

  // --- HANDLERS ---
  const handleStartTest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedQuestions = await generateQuestions(level);
      setQuestions(fetchedQuestions);
      setUserAnswers(Array(fetchedQuestions.length).fill(null));
      setScore(0);
      setTimer(900);
      setTestState("active");
      setActiveQuestion(0);
    } catch (err) {
      setError(err.message || "Failed to start the test. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (originalIndex, option) => {
    const newAnswers = [...userAnswers];
    newAnswers[originalIndex] = option;
    setUserAnswers(newAnswers);
    setActiveQuestion(originalIndex);
  };

  const formatTime = (seconds) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const resetTest = () => {
    setTestState("setup");
    setLevel("hard");
    setError(null);
  };

  // --- RENDER FUNCTIONS ---
  const renderSetup = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-xl text-center max-w-md w-full">
        <h1 className="text-xl font-bold mb-6 text-gray-800">Aptitude Test Setup</h1>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select your desired difficulty level to begin.
          </p>
          <select
            className="w-full p-2 border rounded-lg text-[14px]"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="easy">Easy Level</option>
            <option value="medium">Moderate Level</option>
            <option value="hard">Hard Level</option>
          </select>
        </div>
        <button
          onClick={handleStartTest}
          disabled={isLoading}
          className="w-full mt-6 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400 text-xs"
        >
          {isLoading ? "Generating Questions..." : "Start Test"}
        </button>
        {error && <p className="text-red-500 mt-4 text-xs">{error}</p>}
      </div>
    </div>
  );

  const renderFinished = () => (
    <AptitudeScoreDashboard
      score={score}
      totalQuestions={questions.length}
      performanceData={performanceData}
      onPracticeAgain={resetTest}
    />
  );

  const renderActiveTest = () => {
    if (questions.length === 0) return null;
    const progressPercentage = (userAnswers.filter((ans) => ans !== null).length / questions.length) * 100;

    return (
      <div className="min-h-screen bg-transparent p-4 sm:p-8 font-sans">
        <div className="max-w-5xl mx-auto">
          {/* Top Header */}
          <div className="sticky top-0 z-20 bg-gray-50 pt-4 pb-1">
          <div className="bg-white p-4 rounded-xl shadow-md flex items-center flex-wrap gap-x-6 gap-y-4">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-start">
              <span className="font-bold text-[22px] text-black">Aptitude</span>

              {/* The Level Selector Container: Apply flex-wrap here */}
              <div className="flex items-center flex-wrap gap-8 bg-white rounded-full p-1 sm:gap-10">
                {/* 👆 ADDED: flex-wrap, changed default gap to 'gap-2', and kept 'sm:gap-10' for large screens */}
                {["easy", "medium", "hard"].map((l) => (
                  <button
                    key={l}
                    disabled
                    className={`px-4 py-0.9 font-medium rounded-full ${
                      level === l ? "bg-[#BDF6FD] text-black shadow" : "text-black"
                    }`}
                    style={{
                      borderRadius: "5px",
                    }}
                  >
                    <span style={{ fontSize: "12px" }}>
                      {l.charAt(0).toUpperCase() + l.slice(1)} Level
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-grow min-w-[200px]">
              <div className="w-70 bg-gray-200 border border-black rounded-full h-3">
                <div
                  className="bg-cyan-400 h-2.5  border-black rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Sub-header with Category Navigators and Timer */}
        <div className="bg-gray-50 my-8 flex flex-col md:flex-row gap-8 rounded-lg">
            <div className="flex-grow space-y-4">
              {Object.keys(APTITUDE_TYPE_MAP).map((category) => (
                <div key={category} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-48 shrink-0">
                    <span className="w-1 h-6 bg-graident-200 rounded-full"></span>
                    <p className="font-medium text-[14px] text-black whitespace-nowrap">
                      {APTITUDE_TYPE_MAP[category]}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {questionsByCategory[category]?.map((q, index) => (
                     <a
  key={q.originalIndex}
  href={`#q-${q.originalIndex}`}
  onClick={() => setActiveQuestion(q.originalIndex)}
  style={{ textDecoration: "none" }}
  className={`
    h-6 w-6 inline-flex items-center justify-center rounded-full font-bold text-[13px]
    transition-colors duration-200
    ${
      userAnswers[q.originalIndex] !== null
        ? "bg-green-500 text-white" // 1. Check if answered FIRST. If so, make it green.
        : activeQuestion === q.originalIndex
        ? "bg-teal-400 text-black"   // 2. ELSE, check if it's active. If so, make it teal.
        : "bg-gray-200 text-black hover:bg-gray-300" // 3. ELSE, it's the default gray.
    }
  `}
>
  {index + 1}
</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center shrink-0">
              <div className="text-2xl font-mono font-bold text-gray-800 bg-white px-4 py-2 rounded-lg shadow-inner">
                {formatTime(timer)}
              </div>
            </div>
          </div>
</div>
          {/* Questions List - NOW SHOWS ALL QUESTIONS */}
          <div className="space-y-8">
            {Object.keys(questionsByCategory).map((category) => (
              <div key={category}>
                <p className="text-[16px] font-bold text-gray-800 mb-4 border-b-2 pb-2">
                  {APTITUDE_TYPE_MAP[category]}
                </p>
                <div className="space-y-8">
                  {questionsByCategory[category].map((question) => (
                    <div
                      key={question.originalIndex}
                      id={`q-${question.originalIndex}`}
                      className="bg-white p-6 rounded-xl shadow-lg scroll-mt-24"
                    >
                      <div className="bg-[#05445E] text-white p-4 rounded-t-lg -m-6 mb-6">
                        <p className="text-[14px] font-bold">
                          Q {question.originalIndex + 1}. {question.question}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                        {question.options.map((option, optIndex) => (
                          <button
                            key={optIndex}
                            onClick={() => handleAnswerSelect(question.originalIndex, option)}
                            className={`p-2 text-xs border-2 text-left transition-all duration-200 group ${
                              userAnswers[question.originalIndex] === option
                                ? "bg-[#BDF5FD] border-[#BDF5FD] ring-2 ring-[#BDF5FD]"
                                : "bg-gray-100 border-gray-200 hover:border-[#BDF5FD] hover:bg-[#BDF5FD]"
                            }`}
                            style={{
                              borderRadius: "8px", // <-- INLINE CSS FIX: Applies moderate rounding (equivalent to rounded-lg)
                            }}
                          >
                            <span
                              className={`font-bold mr-3 ${
                                userAnswers[question.originalIndex] === option
                                  ? "text-black"
                                  : "text-gray-700"
                              }`}
                            >
                              {String.fromCharCode(97 + optIndex)})
                            </span>
                            <span
                              className={`${
                                userAnswers[question.originalIndex] === option
                                  ? "text-black"
                                  : "text-gray-700"
                              }`}
                            >
                              {option}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Central Finish Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setTestState("finished")}
              className="w-full max-w-xs bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 text-xs"
            >
              Finish Test
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (testState === "setup") return renderSetup();
  if (testState === "finished") return renderFinished();
  return renderActiveTest();
}