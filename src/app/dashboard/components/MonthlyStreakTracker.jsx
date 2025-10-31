'use client';

// Switched back to standard package imports for Next.js
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { Info } from 'lucide-react'; // <-- Switched back to package import

// --- Reusable StreakItem Component (Unchanged) ---
function StreakItem({ label, currentCount, targetCount }) {
  const progress = Math.min((currentCount / targetCount) * 100, 100);
  const numberToDisplay = Math.max(currentCount, targetCount);

  return (
    // <-- CHANGED: Added flex-col and w-full wrapper for internal layout -->
    <div className="flex flex-col w-full"> 
      {/* Top row: Label, Bar, Number */}
      <div className="flex items-center gap-3">
        {/* 1. Label */}
        <span className="w-15 font-medium text-blue-900">{label}</span>
        
        {/* 2. Progress Bar */}
        <div className="relative flex-1 h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-500"
            style={{
              left: `calc(${progress}% - 8px)`,
            }}
          >
            <span className="!text-xl" style={{ filter: 'drop-shadow(0 0 2px orange)' }}>
              🔥
            </span>
          </div>
        </div>
        
        {/* 3. Target Number */}
        <span className="font-bold text-lg text-blue-900">{numberToDisplay}</span>
      </div>

      {/* <-- NEW: "Completed" text below the bar, left-aligned --> */}
      <div className="text-right text-sm font-medium text-gray-600 mt-1 pl-[88px]"> {/* pl-20 + gap-2 */}
        Completed: {currentCount} / {targetCount}
      </div>
    </div>
  );
}

// --- Main Tracker Component (Updated Targets) ---
export default function MonthlyStreakTracker() {
  const supabase = createClientComponentClient();
  
  const INTERVIEW_TARGET = 15;
  const APTITUDE_TARGET = 25;

  const [counts, setCounts] = useState({ interview_count: 0, aptitude_count: 0 });
  const [loading, setLoading] = 'production' ? useState(false) : useState(true);
  const [error, setError] = useState(null);
  
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  useEffect(() => {
    async function fetchStreakCounts() {
      try {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_monthly_streak_counts');

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setCounts(data[0]);
        }
      } catch (err) {
        console.error('Error fetching streak counts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStreakCounts();
  }, [supabase]);

  return (
    <div className="w-full max-w-5xl mx-auto font-sans">
      {/* Main Card */}
      <div className="relative bg-[#BDF6FD80] rounded-xl shadow-md p-2 border border-cyan-100">
    <p className="text-[15px] font-extrabold text-blue-900 mb-1">
  Monthly Streak
</p>



        {loading && <div className="text-center text-gray-500">Loading streaks...</div>}
        
        {error && <div className="text-center text-red-500">Could not load data.</div>}

        {!loading && !error && (
          <div className="flex flex-row gap-4"> {/* Still flex-row for the two items */}
            <StreakItem
              label="Interview"
              currentCount={counts.interview_count}
              targetCount={INTERVIEW_TARGET}
            />
            <StreakItem
              label="Aptitude"
              currentCount={counts.aptitude_count}
              targetCount={APTITUDE_TARGET}
            />
          </div>
        )}

        <button
          className="absolute top-1 right-4 text-blue-800 hover:text-blue-600"
          aria-label="More information"
          onClick={() => setIsInfoVisible(!isInfoVisible)}
          aria-expanded={isInfoVisible}
        >
          <Info size={24} />
        </button>
      </div>

      {/* Info Box Below (Unchanged) */}
      {isInfoVisible && (
        <div 
          className="flex items-center gap-2 mt-3 bg-[#103E5080] text-white text-sm p-4 rounded-xl shadow"
          style={{ 
            // Optional: If you want it to perfectly match the main card's width and margin
            // You might need to adjust 'mx-auto' on the parent div as well if this doesn't fit
            // perfectly within your broader layout.
          }}
        >
          <Info className="flex-shrink-0" size={20} />
          <span>
            Students must complete a minimum {INTERVIEW_TARGET} interviews & {APTITUDE_TARGET} aptitude
            tests monthly. Limit resets next month.
          </span>
        </div>
      )}
    </div>
  );
}

