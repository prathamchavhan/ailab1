'use client';


import React, { useState, useEffect, useMemo } from 'react';
import Overall_header from '@/components/Header/Overall_header';
const JSpdfScript = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
const AutoTableScript = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js';

import { Download } from 'lucide-react';
import { Trash2 } from "lucide-react";
import { toast} from 'sonner';

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

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}


const getInitialBanks = () => {

  if (typeof window === 'undefined') {
    return [];
  }
  
  const savedBanksJSON = localStorage.getItem('questionBanks');
  
  if (savedBanksJSON) {
    try {
    
      return JSON.parse(savedBanksJSON);
    } catch (e) {
      console.error("Failed to parse saved banks:", e);
       toast.error("Failed to parse saved banks:");
      return [];
    }
  }
  
  return []; 
}




export default function QuestionBankPage() {
  const [domain, setDomain] = useState("");
  const [round, setRound] = useState("1");
  

  const [questionBanks, setQuestionBanks] = useState(getInitialBanks);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPdfLibLoaded, setIsPdfLibLoaded] = useState(false);


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
  useEffect(() => {
    if (typeof window !== 'undefined') {
  
      localStorage.setItem('questionBanks', JSON.stringify(questionBanks));
    }
  }, [questionBanks]);


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
        round: round,
        questions: data.questions,
      };

      setQuestionBanks(prevBanks => [newBank, ...prevBanks]);
      setDomain("");
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
      doc.text(`Round: ${bank.round} | Questions: ${bank.questions.length}`, 14, 30);

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


  const filteredBanks = useMemo(() => {
    if (!searchTerm.trim()) {
      return questionBanks; 
    }
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    
    return questionBanks.filter(bank => 
      bank.domain.toLowerCase().includes(lowerCaseSearch) ||
      bank.round.toLowerCase().includes(lowerCaseSearch)
    );
  }, [questionBanks, searchTerm]);


  return (
    <>
    <div className='mt-4'><Overall_header /></div>
    <div className="flex justify-center min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <main className="w-full max-w-4xl">
       

        <div className="mb-8   text-gray-900 ">
          <div className="flex flex-col space-y-1.5 p-6">
            <p className="text-[25px] text-[#09407F] font-bold leading-none tracking-tight">
              Question bank
            </p>
            <p className="text-sm text-[#09407F]">
              Enter a domain and select a round to generate questions.
            </p>
          </div>
          <div className="p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-2 ">
                <Label htmlFor="domain">Domain / Topic</Label>
                <Input
                  id="domain"
                  placeholder="e.g., 'React Hooks', 'Python Data Structures'"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="round">Round</Label>
                <Select
                  id="round"
                  value={round}
                  onChange={(e) => setRound(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="1">Round 1</option>
                  <option value="2">Round 2</option>
                  <option value="3">Round 3</option>
                  <option value="HR">HR Round</option>
                </Select>
              </div>
            </div>
            
            {error && (
              <p className="text-red-600 text-sm mt-4">{error}</p>
            )}

          </div>
          <div className="flex items-center p-6 pt-0">
         
            <button
              onClick={handleCreateBank}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background  text-white hover:bg-blue-700 h-10 py-2 px-4 w-full sm:w-auto"
            style={{ borderRadius: '8px' ,background: 'linear-gradient(to right, #2DC2DB , #2B87D0)'}} >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4" />
                  Generating...
                </>
              ) : (
                'Create Question Bank'
        
              )}
            </button>
          
          </div>
        </div>
       


        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-2xl text-[18px] font-semibold text-[#09407F]">Generated Banks</p>
            <span className="text-sm text-[#09407F]">
              Showing {filteredBanks.length} of {questionBanks.length}
            </span>
          </div>

          <div className="mt-4 mb-2">
            <Input
              type="text"
              placeholder="Search by domain or round..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Separator />
          
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
            
              <div key={bank.id} className="w-full shadow-sm p-2 flex flex-row items-center justify-between rounded-lg border bg-white text-[#09407F]">
                <div className="flex-1 overflow-hidden">
               
                 <p className="text-[17px] p-1 font-semibold truncate mb-0">
                  {bank.domain}
                 </p>
                 <p className="text-[9px] text-[#09407F]">
                    Round: {bank.round}  |  Questions: {bank.questions.length}
                 </p>
               
                </div>
                <div className="flex-shrink-0 flex items-center gap-1 mt-0">
            
                  <button
                    onClick={() => handleDownloadPdf(bank)}
                    disabled={!isPdfLibLoaded}
                    className="inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background  text-[#09407F] h-12 px-3"
                  >
                    {isPdfLibLoaded ? (
                      <>
                        <Download className="mr-2 h-5 w-5" />
                       
                       
                      </>
                    ) : (
                      "Loading PDF..."
                    )}
                  </button>
                
                  <button
                    onClick={() => handleDeleteBank(bank.id)}
                    className="inline-flex items-center justify-center  focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background  text-red-500 h-11 px-1"
                  >
                    <Trash2 className="mr-2 h-5 w-5" />
              
                  </button>
                
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
