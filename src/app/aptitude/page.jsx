"use client";

import { useState, useEffect, useMemo } from "react";
import AptitudeScoreDashboard from "@/app/aptitude/components/AptitudeScoreDashboard";
import Apptitude_header from '@/components/Header/Apptitude_header';
import AptitudeLandingPage from "@/app/aptitude/components/AptitudeLandingPage"; 
import { toast} from 'sonner';
const FALLBACK_QUESTIONS = [
  
  { question: "If a car travels at 60 km/h, how long does it take to cover 180 km?", options: ["2 hours", "3 hours", "4 hours", "5 hours"], answer: "3 hours", category: 'quantitative' },
  { question: "What is 15% of 200?", options: ["20", "30", "40", "50"], answer: "30", category: 'quantitative' },
  { question: "A sum of money doubles in 5 years at simple interest. What is the rate of interest per annum?", options: ["10%", "15%", "20%", "25%"], answer: "20%", category: 'quantitative' },
  { question: "The average age of 5 boys is 12 years. If a new boy joins, the average age becomes 13 years. What is the age of the new boy?", options: ["15 years", "18 years", "20 years", "16 years"], answer: "18 years", category: 'quantitative' },
  { question: "What is the next number in the series: 2, 4, 8, 16, ...", options: ["24", "30", "32", "36"], answer: "32", category: 'quantitative' },
  { question: "If the length and width of a rectangle are doubled, how does its area change?", options: ["Doubles", "Triples", "Quadruples", "Remains the same"], answer: "Quadruples", category: 'quantitative' },
  { question: "Solve for x: 3x - 5 = 10", options: ["x=5", "x=3", "x=15", "x=7"], answer: "x=5", category: 'quantitative' },
  { question: "The ratio of two numbers is 3:4. If their sum is 21, what is the larger number?", options: ["9", "12", "15", "18"], answer: "12", category: 'quantitative' },
  { question: "How many liters of pure acid are in 10 liters of 30% acid solution?", options: ["2 Liters", "3 Liters", "5 Liters", "7 Liters"], answer: "3 Liters", category: 'quantitative' },
  { question: "A man buys an item for $50 and sells it for $60. What is his profit percentage?", options: ["10%", "20%", "15%", "25%"], answer: "20%", category: 'quantitative' },

  
  { question: "Find the odd one out: Apple, Banana, Carrot, Grape.", options: ["Apple", "Banana", "Carrot", "Grape"], answer: "Carrot", category: 'logical' },
  { question: "If 'A' is coded as 1, 'B' as 2, and so on, how is 'CAT' coded?", options: ["3120", "31T", "24", "312"], answer: "3120", category: 'logical' },
  { question: "Syllogism: All dogs are animals. All animals are mammals. Therefore, all dogs are mammals.", options: ["True", "False", "Cannot be determined", "Only partially true"], answer: "True", category: 'logical' },
  { question: "Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?", options: ["Sister", "Mother", "Aunt", "Daughter"], answer: "Mother", category: 'logical' },
  { question: "What comes next in the sequence: A, C, E, G, ...", options: ["H", "I", "J", "K"], answer: "I", category: 'logical' },
  { question: "In a certain code, 'COME' is coded as 'EMOC'. How is 'DARK' coded?", options: ["KRDA", "RADK", "RAKD", "KRAD"], answer: "KRAD", category: 'logical' },
  { question: "If yesterday was Sunday, what is the day after tomorrow?", options: ["Tuesday", "Wednesday", "Thursday", "Monday"], answer: "Wednesday", category: 'logical' },
  { question: "Two statements are followed by two conclusions. Statement 1: Some pens are pencils. Statement 2: All pencils are erasers. Conclusion I: Some pens are erasers. Conclusion II: Some erasers are pens.", options: ["Only I follows", "Only II follows", "Both I and II follow", "Neither I nor II follows"], answer: "Both I and II follow", category: 'logical' },
  { question: "Which diagram best represents the relationship between: 'Continent, Country, State'?", options: ["Three separate circles", "One circle inside another, inside a third", "Two overlapping circles inside a third", "Three overlapping circles"], answer: "One circle inside another, inside a third", category: 'logical' },
  { question: "If P means 'add', Q means 'subtract', R means 'multiply', and S means 'divide', then 18 R 12 S 4 Q 5 P 6 = ?", options: ["50", "55", "53", "60"], answer: "55", category: 'logical' },


  { question: "Choose the synonym for 'EAGER':", options: ["Indifferent", "Reluctant", "Keen", "Lazy"], answer: "Keen", category: 'verbal' },
  { question: "Choose the antonym for 'PLIABLE':", options: ["Flexible", "Rigid", "Soft", "Bending"], answer: "Rigid", category: 'verbal' },
  { question: "Complete the sentence: She is __ than her brother.", options: ["tall", "taller", "tallest", "more tall"], answer: "taller", category: 'verbal' },
  { question: "Identify the error: He has been working (A) / in this office (B) / since three years (C) / No Error (D).", options: ["A", "B", "C", "D"], answer: "C", category: 'verbal' },
  { question: "Choose the word with the correct spelling:", options: ["Seperate", "Separate", "Seprate", "Seperate"], answer: "Separate", category: 'verbal' },
  { question: "Meaning of the idiom 'To bite the bullet':", options: ["To complain loudly", "To face a difficult situation with courage", "To run away from danger", "To make a quick decision"], answer: "To face a difficult situation with courage", category: 'verbal' },
  { question: "Which sentence is grammatically correct?", options: ["The committee are discussing the matter.", "The committee is discussing the matter.", "The committee discussing the matter.", "The committee was discussing the matter."], answer: "The committee is discussing the matter.", category: 'verbal' },
  { question: "Fill in the blank: I look forward __ you soon.", options: ["to seeing", "to see", "seeing", "for seeing"], answer: "to seeing", category: 'verbal' },
  { question: "What is the noun form of 'decide'?", options: ["decisive", "decision", "decided", "deciding"], answer: "decision", category: 'verbal' },
  { question: "Passive voice of: 'She wrote a letter.'", options: ["A letter was written by her.", "A letter is written by her.", "A letter is being written by her.", "She is written a letter."], answer: "A letter was written by her.", category: 'verbal' },
];



async function saveScore(level, score, total) {
  console.log("Saving score:", { level, score, total });
  try {
    const response = await fetch('/api/save-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'Mixed', level, score }),
    });
    if (!response.ok) throw new Error('Failed to save score.');
  } catch (error)
  {
    console.error("Save score error:", error);
    toast.error("Failed to save your score");
    throw error;
  }
}


async function generateQuestions(level) {
  console.log("Generating all questions for level:", level);
  toast.success("wait for few minutes question are generating 🙏");
  try {
   
    const response = await fetch("/api/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch questions. Server status: ${response.status}`);
    }

    const data = await response.json(); 

   
    const quantitativeQs = data.quantitative.map(q => ({ ...q, category: 'quantitative' }));
    const logicalQs = data.logical.map(q => ({ ...q, category: 'logical' }));
    const verbalQs = data.verbal.map(q => ({ ...q, category: 'verbal' }));

    return [...quantitativeQs, ...logicalQs, ...verbalQs];

  } catch (error) {
    console.error("Generate questions error:", error);
   toast.error("Failed to generate question set");
    throw error;
  }
}



const APTITUDE_TYPE_MAP = {
    quantitative: 'Quantitative Aptitude',
    logical: 'Logical Reasoning',
    verbal: 'Verbal Ability'
};



export default function AptitudeTestPage() {
  const [level, setLevel] = useState("hard");
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [testState, setTestState] = useState("setup"); 
  const [timer, setTimer] = useState(900);
  const [isLoading, setIsLoading] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(0); 
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState({});


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
        toast.error("Failed to save your score");
      });
    }
  }, [testState, questions, userAnswers, level]);
 

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



  const handleStartTest = async () => {
    setIsLoading(true);
    setError(null);
    let fetchedQuestions = [];

    try {
  
      fetchedQuestions = await generateQuestions(level);
    } catch (err) {
    
      console.warn("API question generation failed. Using fallback questions.");
      setError("Failed to fetch custom questions from the server");
     toast.error("Failed to fetch");
      fetchedQuestions = FALLBACK_QUESTIONS;
    } finally {
     
      if (fetchedQuestions && fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
        setUserAnswers(Array(fetchedQuestions.length).fill(null));
        setScore(0);
        setTimer(900);
        setTestState("active");
        setActiveQuestion(0);
      } else {
   
         setError("Could not load any questions for the test. Please check your connection.");
         toast.error("could not load questions");
      }
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (originalIndex, option) => {
    const newAnswers = [...userAnswers];
    newAnswers[originalIndex] = option;
    setUserAnswers(newAnswers);

    setActiveQuestion(originalIndex); 
  };
  
  const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const resetTest = () => { setTestState("setup"); setLevel("hard"); setError(null); };

  

  const renderSetup = () => (
  <>
      <Apptitude_header />
      <AptitudeLandingPage
        level={level}
        setLevel={setLevel}
        onStartTest={handleStartTest}
        isLoading={isLoading}
        error={error}
      />
    </>
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
    const progressPercentage = (userAnswers.filter(ans => ans !== null).length / questions.length) * 100;

    return (
      <>
       <div className="mb-9 mt-4">
          <Apptitude_header/>
          </div>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans"> 
       
        <div className="max-w-5xl mx-auto">
    
          <div className="bg-white p-4 rounded-xl shadow-md flex items-center flex-wrap gap-x-6 gap-y-4">
           <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-start">
    <span className="font-bold text-[22px] text-gray-700">Aptitude</span> 


    <div className="flex items-center flex-wrap gap-8 bg-white rounded-full p-1 sm:gap-10"> 
      
      {["easy", "medium", "hard"].map((l) => (
        <button
          key={l}
          disabled
          className={`px-4 py-0.9 font-medium rounded-full ${
            level === l ? "bg-[#BDF6FD] text-black shadow"  : "text-black"
          }`}
          style={{ 
            borderRadius: '5px'
          }}
        >
          <span style={{ fontSize: "13px" }}>
            {l.charAt(0).toUpperCase() + l.slice(1)} Level
          </span>
        </button>
      ))}
    </div>


            </div>
            <div className="flex-grow min-w-[200px]">
                <div className="w-70 bg-gray-200 border border-black rounded-full h-3">
                    <div className="bg-cyan-400 h-2.5  border-black rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>
          </div>

         
          <div className="my-8 flex flex-col md:flex-row gap-8 sticky top-4 z-10 bg-gray-50 py-4 rounded-lg shadow-sm">
            <div className="flex-grow space-y-4">
              {Object.keys(APTITUDE_TYPE_MAP).map(category => (
                <div key={category} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-48 shrink-0">
                     <span className="w-1 h-6 bg-graident-200 rounded-full"></span>
                     <p className="font-medium text-xs text-black whitespace-nowrap">{APTITUDE_TYPE_MAP[category]}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 ">
                    {questionsByCategory[category]?.map((q, index) => (
                       <a
                          key={q.originalIndex}
                          href={`#q-${q.originalIndex}`}
                          onClick={() => setActiveQuestion(q.originalIndex)}
                          style={{ textDecoration: 'none' }}
                          className={`
                            h-6 w-6 inline-flex items-center justify-center rounded-full font-bold text-xs
                            transition-all duration-200 text-black 
                            ${activeQuestion === q.originalIndex
                              ? 'bg-teal-100 !text-black ring-2 ring-teal-500' 
                              : userAnswers[q.originalIndex] !== null
                                ? 'bg-green-200 text-green-800' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-300'} // Unanswered question
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


          <div className="space-y-8">
            {Object.keys(questionsByCategory).map(category => (
              <div key={category}>
                <h5 className="text-xs font-bold text-gray-800 mb-4 border-b-2 pb-2">{APTITUDE_TYPE_MAP[category]}</h5>
                <div className="space-y-8">
                {questionsByCategory[category].map(question => (
                  <div key={question.originalIndex} id={`q-${question.originalIndex}`} className="bg-white p-6 rounded-xl shadow-lg scroll-mt-24">
                      <div className="bg-[#05445E] text-white p-4 rounded-t-lg -m-6 mb-6">
                         <h6 className="text-xs font-bold">Q {question.originalIndex + 1}. {question.question}</h6>
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
                                borderRadius: '8px' 
                            }}
                        >
                            <span className={`font-bold mr-3 ${userAnswers[question.originalIndex] === option ? 'text-black' : 'text-gray-700'}`}>
                                {String.fromCharCode(97 + optIndex)})
                            </span>
                            <span className={`${userAnswers[question.originalIndex] === option ? 'text-black' : 'text-gray-700'}`}>
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
          

          <div className="mt-8 flex justify-center">
             <button onClick={() => setTestState('finished')} className="w-full max-w-xs bg-green-600 text-white font-bold py-2 px-4 mb-5 mt-3 hover:bg-green-700 transition duration-300 text-xs"  style={{
        borderRadius: '8px' 
    }}>
                  Finish Test
              </button>
          </div>
        </div>
      </div>
      </>
    );
  }
  
  if (testState === "setup") return renderSetup();
  if (testState === "finished") return renderFinished();
  return renderActiveTest();
}