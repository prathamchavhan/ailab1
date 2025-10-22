// src/components/Event_challenge.jsx
"use client";

import { useRouter } from 'next/navigation';
import { BarChart2, Calendar, Clock, Timer } from 'lucide-react';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};
// --- ✅ UPDATED Challenge Card Component ---
// Width is decreased and margins are adjusted.
function Event_Challenge({ challenge }) {
  const router = useRouter();

  if (!challenge) {
    return null;
  }

  // ... (handleStartChallenge function remains the same)
  const handleStartChallenge = () => {
    if (!challenge.is_active) {
      console.warn('Challenge is not active.');
      return;
    }
    const type = challenge.challenge_type;
    if (type === 'aptitude') {
      router.push('/challenges');
    } else if (type === 'interview') {
      router.push('/interview');
    } else {
      console.error('Unknown challenge type:', type);
    }
  };


  const startTime = formatTime(challenge.start_time);
  const endTime = formatTime(challenge.end_time);
  const challengeDate = formatDate(challenge.start_time);

  const defaultBgUrl = '/images/challenge-bg.jpg';
  const defaultIconUrl = '/images/ai-icon.png';

  return (
    // ✅ CHANGE 1: Added max-w-xs and mx-auto to decrease the card's width and center it in the grid column.
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col relative max-w-xs mx-auto w-full">
      {/* 1. Top section with Background Image and Circular Icon */}
      <div className="relative">
        <img
          src={defaultBgUrl}
          alt="Challenge Background"
          className="w-full h-24 object-cover"
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-blue-900 p-2 rounded-full border-4 border-white">
          <img
            src={defaultIconUrl}
            alt="Challenge Icon"
            className="w-8 h-8"
          />
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-grow flex flex-col text-center px-6 py-4 pt-12">
        <h3 className="text-lg font-bold text-gray-800">{challenge.title}</h3>
       
        <p className="text-xs text-gray-500">Level: {challenge.level}</p>

        
        <div className="mt-2 text-xs text-gray-700 space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-blue-500" />
              <span>{challengeDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Timer className="w-3 h-3 text-blue-500" />
              <span>{challenge.duration_minutes} min</span>
            </div>
          </div>
          <div className="flex justify-center items-center gap-1">
            <Clock className="w-3 h-3 text-blue-500" />
            <span>{`${startTime} - ${endTime}`}</span>
          </div>
        </div>

        {/* Spacer to push button to the bottom */}
        <div className="flex-grow"></div>

        {/* 3. Button (Centered) */}
        <div className="mt-4 flex justify-center">
           <button
            onClick={handleStartChallenge}
            disabled={!challenge.is_active}
            className={`w-full text-sm font-semibold px-4 py-1.5 transition-colors rounded-lg
              ${
                challenge.is_active
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {challenge.is_active ? 'Start Challenge' : 'Not Active'}
          </button>
        </div>
      </div>

      {/* 4. Badge (Positioned at bottom right) */}
      {challenge.badge_url && (
        <img
          src={challenge.badge_url}
          alt="Challenge Badge"
          className="absolute bottom-3 right-3 w-10 h-10"
        />
      )}
    </div>
  );
}