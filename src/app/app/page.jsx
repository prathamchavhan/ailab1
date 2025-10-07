// File: app/page.js
"use client";

import { useState, useEffect } from "react";

// Function to save the score by calling our new API
async function saveScore(aptitudeType, level, score) {
  try {
    const response = await fetch('/api/save-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aptitudeType, level, score }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save score.');
    }
    console.log('Score saved successfully!');
  } catch (error) {
    console.error('Error saving score:', error);
    // Optionally, you could set an error state here to show the user
  }
}


export default function AptitudeTestPage() {
  // State for user selections
  const [aptitudeType, setAptitudeType] = useState("quantitative");
  const [level, setLevel] = useState("easy");

  // State for the test flow
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for tracking test progress
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [testState, setTestState] = useState("setup"); // "setup", "active", "finished"

  // This effect runs when the test is finished to save the score
  useEffect(() => {
    if (testState === 'finished') {
      saveScore(aptitudeType, level, score);
    }
  }, [testState, aptitudeType, level, score]);

  const handleStartTest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aptitudeType, level }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch questions.");
      }

      const data = await response.json();
      setQuestions(data);
      setTestState("active");
      setCurrentQuestionIndex(0);
      setScore(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (selectedOption) => {
    if (questions[currentQuestionIndex].answer === selectedOption) {
      setScore(prevScore => prevScore + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setTestState("finished");
    }
  };

  const resetTest = () => {
    setTestState("setup");
    setQuestions([]);
    setError(null);
  };

  return (
    <main className="container">
      <h1>🧠 Aptitude Test Generator</h1>

      {testState === "setup" && (
        <div className="setup-form">
          <div className="form-group">
            <label htmlFor="aptitudeType">Aptitude Type:</label>
            <select
              id="aptitudeType"
              value={aptitudeType}
              onChange={(e) => setAptitudeType(e.target.value)}
            >
              <option value="quantitative">Quantitative</option>
              <option value="logical">Logical</option>
              <option value="verbal">Verbal</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="level">Difficulty Level:</label>
            <select
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <button onClick={handleStartTest} disabled={isLoading}>
            {isLoading ? "Generating Questions..." : "Start Test"}
          </button>
          {error && <p className="error">{error}</p>}
        </div>
      )}

      {testState === "active" && questions.length > 0 && (
        <div className="question-card">
          <h2>Question {currentQuestionIndex + 1} / {questions.length}</h2>
          <p className="question-text">{questions[currentQuestionIndex].question}</p>
          <div className="options-grid">
            {questions[currentQuestionIndex].options.map((option, index) => (
              <button key={index} className="option-btn" onClick={() => handleAnswer(option)}>
                {option}
              </button>
            ))}
          </div>
          <p className="score">Current Score: {score}</p>
        </div>
      )}

      {testState === "finished" && (
        <div className="results-card">
          <h2>Test Complete!</h2>
          <p className="final-score">
            Your Final Score: {score} out of {questions.length}
          </p>
          <p>Your results have been saved.</p>
          <button onClick={resetTest}>Take Another Test</button>
        </div>
      )}
    </main>
  );
}