'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Overall_header from '@/components/Header/Overall_header';
const JSpdfScript = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
const AutoTableScript = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js';


import { Download, Trash2, MoveRight, ChevronDown, ChevronUp } from 'lucide-react';
import { toast} from 'sonner';

// --- Reusable UI Components (cn, Input, Label, Select, Separator, Loader) ---

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

const Input = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      className={cn("flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500", className)}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

const Label = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <label
      className={cn("text-sm font-medium text-[#09407F] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
      ref={ref}
      {...props}
    />
  );
});
Label.displayName = "Label";

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <select
      className={cn("flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500", className)}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";

const Separator = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("shrink-0 bg-gray-200 h-[1px] w-full", className)} {...props} />
));
Separator.displayName = "Separator";

const Loader = ({ className }) => (
  <svg
    className={cn("animate-spin", className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);
Loader.displayName = "Loader";

// --- End of Reusable UI Components ---


// --- getInitialBanks REMOVED ---

// --- 1. TIMESTAMP HELPER FUNCTION ---
const formatTimestamp = (bankId) => {
  const timestamp = parseInt(bankId.split('-')[1]);
  if (isNaN(timestamp)) return "Just now";

  const now = Date.now();
  const diff = now - timestamp; // difference in ms

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
};


export default function QuestionBankPage() {
  const [domain, setDomain] = useState("");
  const [company, setCompany] = useState("");
  const [round, setRound] = useState("1");
  const [isRoundOpen, setIsRoundOpen] = useState(false);
  const roundOptions = ["Round 1", "Round 2", "Round 3", "HR Round"]; // Added this line

  // --- STATE INITIALIZATION FIXED ---
  const [questionBanks, setQuestionBanks] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false); // New state to track hydration
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPdfLibLoaded, setIsPdfLibLoaded] = useState(false);

  // PDF Library loading useEffect (unchanged)
  useEffect(() => {
    if (window.jspdf) {
      setIsPdfLibLoaded(true);
      return;
    }

    let script1 = document.createElement('script');
    script1.src = JSpdfScript;
    script1.async = true;

    script1.onload = () => {
      let script2 = document.createElement('script');
      script2.src = AutoTableScript;
      script2.async = true;
      
      script2.onload = () => {
        setIsPdfLibLoaded(true);
      };
      
      script2.onerror = () => {
        setError("Failed to load PDF AutoTable library.");
        toast.error("Failed to load PDF AutoTable library.");
      }
      document.body.appendChild(script2);
    };
    
    script1.onerror = () => {
      setError("Failed to load PDF library.");
      toast.error("Failed to load PDF library.");
    }
    document.body.appendChild(script1);
    
    return () => {
      if (script1.parentNode) {
        script1.parentNode.removeChild(script1);
      }
    };
  }, []); 

  // --- NEW LOCALSTORAGE 'LOAD' EFFECT ---
  // This runs ONCE on the client after mount to load data
  useEffect(() => {
    const savedBanksJSON = localStorage.getItem('questionBanks');
    if (savedBanksJSON) {
      try {
        setQuestionBanks(JSON.parse(savedBanksJSON));
      } catch (e) {
        console.error("Failed to parse saved banks:", e);
        toast.error("Failed to parse saved banks:");
      }
    }
    // Signal that loading is complete
    setIsLoaded(true);
  }, []); // Empty array ensures this runs only once on mount

  // --- MODIFIED LOCALSTORAGE 'SAVE' EFFECT ---
  // This now only runs *after* the initial load is complete
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('questionBanks', JSON.stringify(questionBanks));
    }
  }, [questionBanks, isLoaded]); // Depends on isLoaded


  // handleCreateBank (unchanged)
  const handleCreateBank = async () => {
    if (!domain.trim()) {
      setError("Please enter a domain or topic.");
      toast.error("Please enter a domain or topic.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-questions', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: domain,
          company: company,
          round: round,
          numberOfQuestions: 15,
          experienceLevel: 'medium'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An unknown error occurred.");
      }

      if (!data.questions || !Array.isArray(data.questions)) {
         throw new Error("API returned an unexpected data format.");
      }

      const newBank = {
        id: `bank-${Date.now()}`,
        domain: domain,
        company: company,
        round: round,
        questions: data.questions,
      };

      setQuestionBanks(prevBanks => [newBank, ...prevBanks]);
      setDomain("");
      setCompany("");
      toast.success('Question bank created successfully!');

    } catch (err) {
      console.error("Failed to create question bank:", err);
      toast.error("Failed to create question bank.");
      if (err.message.includes("not valid JSON")) {
         setError("Server error. Check API route logs. (Is it at '/api/generate'?)");
         toast.error("Server error. Check API route logs. (Is it at '/api/generate'?)");
      } else {
         setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBank = (id) => {
    setQuestionBanks(prevBanks => prevBanks.filter(bank => bank.id !== id));
  };

  // handleDownloadPdf (unchanged)
  const handleDownloadPdf = (bank) => {
    if (!isPdfLibLoaded) {
      setError("PDF libraries are still loading. Please try again in a moment.");
      toast.error("PDF libraries are still loading. Please try again in a moment.");
      return;
    }
    
    setError(null);
    
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF(); 

      doc.setFontSize(18);
      doc.text(`Question Bank: ${bank.domain}`, 14, 22);
      doc.setFontSize(12);
      doc.text(`Company: ${bank.company || 'N/A'} | Round: ${bank.round} | Questions: ${bank.questions.length}`, 14, 30);

      const tableHead = [['#', 'Type', 'Category', 'Question', 'Answer']];
      const tableBody = bank.questions.map((q, index) => [
        index + 1,
        q.type || 'N/A',
        q.category || 'N/A',
        q.question,
        q.answer
      ]);

      doc.autoTable({
        startY: 40,
        head: tableHead,
        body: tableBody,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [41, 128, 185], 
          textColor: 255,
          fontStyle: 'bold',
        },
        columnStyles: {
          3: { cellWidth: 70 }, 
          4: { cellWidth: 70 }, 
        },
        didParseCell: (data) => {
          if (data.column.index === 3 || data.column.index === 4) {
            if (data.cell.raw && data.cell.raw.length > 50) { 
                data.cell.styles.overflow = 'linebreak';
            }
          }
        }
      });

      doc.save(`QuestionBank_${bank.domain}_Round${bank.round}.pdf`);

    } catch (err) {
      console.error("PDF Generation Error:", err);
      setError("Failed to generate PDF. See console for details.");
      toast.error("Failed to generate PDF. See console for details.");
    }
  };

  // filteredBanks (unchanged)
  const filteredBanks = useMemo(() => {
    if (!searchTerm.trim()) {
      return questionBanks; 
    }
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    
    return questionBanks.filter(bank => 
      bank.domain.toLowerCase().includes(lowerCaseSearch) ||
      bank.round.toLowerCase().includes(lowerCaseSearch) ||
      (bank.company && bank.company.toLowerCase().includes(lowerCaseSearch))
    );
  }, [questionBanks, searchTerm]);


  return (
    <>
    <div className='mt-4'><Overall_header /></div>
    <div className="flex justify-center min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <main className="w-full max-w-4xl">
       
        {/* Form Section */}
        <div className="mb-8 text-gray-900 ">
         <div className="flex flex-col items-center space-y-1.5 p-6">
           <p className="text-[25px] text-[#09407F] font-bold leading-none tracking-wide">
             Interview  Question bank
            </p>
            <p className="text-sm text-[#09407F] text-center">
             Offers a wide range of real interview questions and top-rated answers to help you prepare thoroughly.
            </p>
            <p className="text-sm text-[#09407F] text-center">
              Welcome back! Access your personalized interview questions.
            </p>
          </div>
         <div className="p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Domain Input with Gradient Border */}
              <div className="space-y-2">
                <div 
                  className="rounded-md p-[1px]" // Gradient wrapper
                  style={{ background: 'linear-gradient(to right, #2DC2DB , #2B87D0)' }}
                >
                  <Input
                    id="domain"
                    placeholder="Domains"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    disabled={isLoading}
                    className="border-none" // Remove default border
                  />
                </div>
              </div>
              
              {/* Company Input with Gradient Border */}
              <div className="space-y-2">
                <div 
                  className="rounded-md p-[1px]" // Gradient wrapper
                  style={{ background: 'linear-gradient(to right, #2DC2DB , #2B87D0)' }}
                >
                  <Input
                    id="company"
                    placeholder="Company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={isLoading}
                    className="border-none" // Remove default border
                  />
                </div>
              </div>
              
            {/* --- Custom Dropdown --- */}
              <div className="space-y-2">
                {/* Use a relative container for the dropdown */}
                <div className="relative">
                  {/* Gradient wrapper for the button */}
                  <div 
                    className="rounded-md p-[1px]"
                    style={{ background: 'linear-gradient(to right, #2DC2DB , #2B87D0)' }}
                  >
                    <button
                      type="button"
                      onClick={() => setIsRoundOpen(!isRoundOpen)}
                      disabled={isLoading}
                      className="flex items-center justify-between w-full h-10 px-3 py-2 bg-white rounded-md text-sm text-[#09407F]"
                    >
                      <span>
                        {/* Show selected round, or "Rounds" if default */}
                        {round === "1" ? "Rounds" : round} 
                      </span>
                      {isRoundOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* Dropdown List */}
                  {isRoundOpen && (
                    <div className="absolute top-full mt-1 w-full z-10 rounded-md shadow-lg overflow-hidden flex flex-col">
                      {roundOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setRound(option); // Set the state
                            setIsRoundOpen(false); // Close the dropdown
                          }}
                          className="w-full text-center px-4 py-3 bg-[#2B87D0] text-white font-semibold text-lg hover:bg-blue-700"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* --- End Custom Dropdown --- */}
            </div>
            
            {error && (
              <p className="text-red-600 text-sm mt-4">{error}</p>
            )}

          </div>
     <div className="flex items-center justify-center p-6 pt-0">
            <button
              onClick={handleCreateBank}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-md text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background  text-white hover:bg-blue-700 h-10 py-2 px-4 w-full sm:w-auto"
              style={{ borderRadius: '8px' ,background: 'linear-gradient(to right, #2DC2DB , #2B87D0)'}} >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4" />
                  Generating...
                </>
              ) : (
               <>
                  Generate Question Bank
                  <MoveRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
       

       {/* --- Generated Banks Section --- */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-2xl text-[18px] font-semibold text-[#09407F]">Generated Banks</p>
            <span className="text-sm text-[#09407F]">
              Showing {filteredBanks.length} of {questionBanks.length}
            </span>
          </div>

          <div className="mt-4 mb-7">
            {/* Wrapper div for the gradient border */}
            <div 
              className="rounded-md p-[1px]" // p-[1px] creates the border thickness
              style={{ background: 'linear-gradient(to right, #2DC2DB , #2B87D0)' }} // Your gradient
            >
              <Input
                type="text"
                placeholder="Search by domain, company, or round..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-none" // This removes the input's original border
              />
            </div>
          </div>
          
          {/* Separator is removed */}
          
          {questionBanks.length === 0 && !isLoading ? (
            <p className="text-gray-500 text-center py-4">
              No question banks created yet.
            </p>
          ) : filteredBanks.length === 0 ? (
             <p className="text-gray-500 text-center py-4">
              No question banks match your search.
            </p>
          ) : (
            filteredBanks.map((bank) => (
            <div 
              key={bank.id} 
              className="relative rounded-lg overflow-hidden p-[1px]" 
              style={{ background: 'linear-gradient(to right, #2DC2DB , #2B87D0)' }} // Your gradient
            >
              {/* This inner div is your actual card content with a white background */}
              <div 
                className="w-full shadow-md p-6 rounded-lg bg-white text-[#09407F] h-full"
              >
                
                {/* --- Top Section: Title, Timestamp, and Tags --- */}
                <div className="flex justify-between items-start mb-4">
                  {/* Left Side: Title and Tags */}
                  <div className="flex-1 overflow-hidden pr-4">
                    <p className="text-xl font-semibold text-black truncate"> 
                      {bank.domain}
                    </p>
                    
                    {/* Tags are now here, under the title */}
                    <div className="flex items-center text-sm text-gray-500 space-x-2 mt-2 flex-wrap">
                      {bank.questions[0]?.category && (
                        <span className="whitespace-nowrap">{bank.questions[0].category}</span>
                      )}
                      
                      {bank.company && (
                        <>
                          <span className="text-gray-300">|</span> 
                          <span className="whitespace-nowrap">{bank.company}</span>
                        </>
                      )}

                      {bank.round && (
                        <>
                          <span className="text-gray-300">|</span> 
                          <span className="whitespace-nowrap">Round {bank.round}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Right Side: Timestamp */}
                  <span className="text-sm text-gray-500 flex-shrink-0 ml-4"> 
                    {formatTimestamp(bank.id)}
                  </span>
                </div>

                {/* --- Bottom Blue Strip: Buttons Only --- */}
                <div className="flex justify-between items-center mt-4 bg-[#CBF5FA] rounded-md px-4 py-3">
                  
                  {/* Left Button: Delete */}
                  <button
                    onClick={() => handleDeleteBank(bank.id)}
                    className="flex items-center gap-2 text-[#09407F] font-medium text-sm hover:opacity-80 disabled:opacity-50"
                  >
                    Delete
                    <div className="bg-white rounded-full p-1">
                      <Trash2 className="h-4 w-4 text-[#09407F]" />
                    </div>
                  </button>
                  
                  {/* Right Button: Download */}
                  <button
                    onClick={() => handleDownloadPdf(bank)}
                    disabled={!isPdfLibLoaded}
                    className="flex items-center gap-2 text-[#09407F] font-medium text-sm hover:opacity-80 disabled:opacity-50"
                  >
                    Download
                    {isPdfLibLoaded ? (
                      <div className="bg-white rounded-full p-1">
                        <Download className="h-4 w-4 text-[#09407F]" />
                      </div>
                    ) : (
                      <div className="bg-white rounded-full p-1">
                        <Loader className="h-4 w-4 text-[#09407F]" /> 
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </main>
    </div>
    </>
  );
}