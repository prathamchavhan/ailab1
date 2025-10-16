"use client";

import { createClient } from '@supabase/supabase-js';
import React, { useState, useEffect } from 'react';
import Header from "../../components/Header";
// Access environment variables securely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Main component for the Assignment page.
 * This component fetches and displays assignments from Supabase.
 */
const AssignmentDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const { data, error } = await supabase
          .from('assignment')
          .select('*'); // Fetches all assignments

        if (error) throw error;
        setAssignments(data);
      } catch (error) {
        console.error('Error fetching assignments:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []); // The empty dependency array ensures this runs once on mount

  // Helper function to format the date (kept for consistency if needed elsewhere)
  const formatDate = (timestamp) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
  <img
    src="/images/lu.gif"
    alt="Loading..."
    className="w-76 h-96" // Adjust size as needed
  />
</div>

    );
  }

  return (
    <div className="p-8 bg-[#f9f9fb] min-h-screen ">
      <div className='mb-9'>
      <Header/>
      </div>
    <p className="text-xl font-bold mb-6 truncate text-[#001668]">Assignment</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-65">
        {assignments.map((assignment) => (
          
          /* START: Assignment Card container - Dark background, rounded corners */
          <div 
            key={assignment.id} 
            className="bg-[#05445E] text-white rounded-xl shadow-2xl  w-60  overflow-hidden 
                       flex flex-col transform transition-transform duration-300 hover:scale-[1.02]"
          >
            
            {/* Image/Visual Container - Rounded top corners */}
            {assignment.image_url && (
             <div className="relative h-30 w-full overflow-hidden bg-[#05445E] px-4 pt-4"> {/* Added px-4 pt-4 here */}
                {/* Image itself */}
                <img 
                    src={assignment.image_url} 
                    alt="Assignment Visual" 
                    className="w-full h-full object-cover rounded-lg" // Added rounded-lg here
                    style={{ transform: 'translateY(-10px)' }} // Slight upward nudge for the visual effect
                />
                
               
              </div>
            )}
            
            {/* Card Content - Text, Description, Button */}
            <div className="p-4 flex flex-col flex-grow">
                  {assignment.created_at && (
                        <p className="text-xs text-white">
                           {formatDate(assignment.created_at)}
                        </p>
                    )}
                <p className="text-sm font-bold mb-2 truncate">
                    Assignment {assignment.subject_id}: {assignment.subject_name || 'title'}
                </p>
                
                {/* Description - Clamped to 3 lines */}
                {assignment.description && (
                  <p className="text-xs text-white line-clamp-3 mb-4 flex-grow">
                     Description : {assignment.description}
                  </p>
                )}
                
                {/* Footer section (Date and Download Button) - Stays at the bottom */}
             {/* Footer section (Date and Download Button) - Stays at the bottom */}
            {/* Footer section (Date and Download Button) - Stays at the bottom */}
<div className="mt-auto pt-3 rounded-xl flex justify-end items-center">
    
    {/* Download Button */}
    {assignment.pdf_url && (
        <a href={assignment.pdf_url} className="download-link" target="_blank" rel="noopener noreferrer">
            <button 
                className="bg-[#99FFE0] text-black flex items-center justify-center transition duration-200"
                style={{
                    width: '32px',
                    height: '32px',
                    padding: '0',
                    borderRadius: '50%', // Guaranteed circle fix
                    border: 'none',
                }}
            >
                {/* Download Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
            </button>
        </a>
    )}
</div>
            </div>
          </div>
          /* END: Assignment Card container */
        ))}
      </div>
    </div>
  );
};


// The file upload functions remain unchanged as they have good logic.
async function createNewAssignment(assignmentData, imageFile, pdfFile) {
// ... (Your createNewAssignment function remains here)
}

export default AssignmentDashboard;