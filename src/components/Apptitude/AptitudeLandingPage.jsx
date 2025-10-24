"use client";

import React from 'react';
import Announcement from '@/components/Announcement'; 
import Aptitude_leaderboard from '@/components/Apptitude/Aptitude_leaderboard';
import AptitudePerformanceChart from '@/components/Apptitude/AptitudePerformanceChart'; 

export default function AptitudeLandingPage({ level, setLevel, onStartTest, isLoading, error }) {
  return (
    <div className="min-h-screen bg-[#f9f9fb] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          

          <div className="lg:col-span-2 space-y-6">
            
        
            <div className=" p-6 rounded-lg ">
          <p className="text-xl font-bold mb-4 bg-[#09407F] bg-clip-text text-transparent">
  Aptitude
</p>

              <div className="flex items-center space-x-11 mb-6">
                <span className="text-[18px] font-bold text-gray-700 bg-white shadow-md px-3 py-2 rounded-md">
                  Level:
                </span>
                
               
                <div
                  className="p-0.5 rounded-md"
                  style={{
                    background: 'linear-gradient(to right, #79E5EF, #61AEE8)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <div className="flex items-center bg-white rounded-[5px] p-1">
                    {['easy', 'medium', 'hard'].map((l) => (
                      <button
                        key={l}
                        onClick={() => setLevel(l)}
                        className={`px-6 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ease-in-out ${
                          level === l
                            ? 'text-white shadow-sm'
                            : 'bg-transparent text-gray-700 hover:bg-blue-500 '
                        }`}
                        style={{
                          marginRight: l !== 'hard' ? '60px' : '0',
                          ...(level === l && {
                            background: 'linear-gradient(to right, #2DC6DB, #2B81D0)',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            borderRadius: '8px',
                          })
                        }}
                      >
                        {l.charAt(0).toUpperCase() + l.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <div className="flex justify-center">
                <button 
                  onClick={onStartTest} 
                  disabled={isLoading} 
                  className="w-full sm:w-auto text-white font-bold py-2 px-8 transition duration-300 disabled:bg-gray-400"
                  style={{
                    background: 'linear-gradient(to right, #2DC5DB, #2B83D0)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                  }}
                >
                  {isLoading ? "Loading..." : "Start Aptitude"}
                </button>
              </div>
            </div>

            {/* Test Instructions Container */}
            <div className=" p-6 rounded-lg ">
              <p className="font-bold text-[#09407F] text-[18px] mb-2">Test Instructions:</p>
              <ul className="list-disc list-inside text-[17px] text-[#09407F] space-y-2">
                <li>The test has 30 questions, 30 sec per question (total 15 minutes).</li>
                <li>Includes Verbal, Logical, and Quantitative sections.</li>
                <li>1 mark per question, no negative marking.</li>
                <li>No back option; questions auto-submit after 30 sec.</li>
                <li>Ensure stable internet — don’t refresh or close during the test.</li>
              </ul>
            </div>
            
            {/* Performance Chart Container */}
            <div className="p-6 rounded-lg ">
              <AptitudePerformanceChart />
            </div>
          </div>

          {/* --- RIGHT COLUMN --- */}
          <div className="lg:col-span-1 space-y-6">
            <Announcement />
            <Aptitude_leaderboard/>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p dangerouslySetInnerHTML={{ __html: error }}></p>
          </div>
        )}
      </div>
    </div>
  );
}