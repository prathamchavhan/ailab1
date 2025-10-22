"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Announcement from '@/components/Announcement';
import { useRouter } from 'next/navigation';
import Overall_header from '@/components/Header/Overall_header';
import { BarChart2, Calendar, Clock, Timer } from 'lucide-react';

// --- Helper Functions (No changes needed here) ---
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};


// --- ✅ UPDATED Challenge Card Component ---
// This component has been updated to make the icon smaller and font sizes smaller.
function Event_Challenge({ challenge }) {
  const router = useRouter();

  if (!challenge) {
    return null;
  }

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

  // --- Placeholder Images ---
  const defaultBgUrl = '/cbg.png';
  const defaultIconUrl = 'https://cdn-icons-png.flaticon.com/512/2164/2164426.png'; // A simple brain/AI icon

  return (
    <div className="bg-[#F4FAFF] rounded-2xl shadow-lg overflow-hidden flex flex-col relative">
      {/* 1. Top section with Background Image and Circular Icon */}
      <div className="relative">
        <img
          src={defaultBgUrl}
          alt="Challenge Background"
          className="w-full h-24 object-cover" // Decreased height from h-32 to h-24
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-blue-900 p-2 rounded-full border-4 border-white"> {/* Decreased padding from p-3 to p-2 */}
          <img
            src={defaultIconUrl}
            alt="Challenge Icon"
            className="w-8 h-8" // Decreased icon size from w-10 h-10 to w-8 h-8
          />
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-grow flex flex-col text-center px-6 py-4 pt-12"> 
        <p className="text-lg font-bold text-gray-800">{challenge.title}</p> 
        <p className="text-xs text-gray-500 mt-1 border border-t-black">Level: {challenge.level}</p>

        {/* Details Section */}
        <div className="mt-4 text-xs text-gray-700 space-y-2"> {/* Decreased text size from text-sm to text-xs, decreased mt-6 to mt-4, space-y-3 to space-y-2 */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1"> {/* Decreased gap from gap-2 to gap-1 */}
              <Calendar className="w-3 h-3 text-blue-500" /> {/* Decreased icon size from w-4 h-4 to w-3 h-3 */}
              <span>{challengeDate}</span>
            </div>
            <div className="flex items-center gap-1"> {/* Decreased gap from gap-2 to gap-1 */}
              <Timer className="w-3 h-3 text-blue-500" /> {/* Decreased icon size from w-4 h-4 to w-3 h-3 */}
              <span>{challenge.duration_minutes} min</span>
            </div>
          </div>
          <div className="flex justify-center items-center gap-1"> {/* Decreased gap from gap-2 to gap-1 */}
            <Clock className="w-3 h-3 text-blue-500" /> {/* Decreased icon size from w-4 h-4 to w-3 h-3 */}
            <span>{`${startTime} - ${endTime}`}</span>
          </div>
        </div>

        {/* Spacer to push button to the bottom */}
        <div className="flex-grow"></div>

        {/* 3. Button (Centered) */}
        <div className="mt-4 flex justify-center"> {/* Decreased mt-6 to mt-4 */}
          <button
    onClick={handleStartChallenge}
    disabled={!challenge.is_active}
    // Added style attribute for border radius
    style={{ borderRadius: '8px' }}
    className={`w-full text-sm font-semibold px-4 py-1.5 transition-colors 
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
          className="absolute bottom-3 right-3 w-10 h-10" // Decreased size from w-14 h-14 to w-10 h-10, adjusted bottom/right
        />
      )}
    </div>
  );
}


// --- Main Page Component (No changes needed here) ---
export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const event_challenge = createClientComponentClient();

  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      const { data, error } = await event_challenge
        .from('events_challenge')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching challenges:', error);
        setError(error.message);
      } else {
        setChallenges(data || []);
      }
      setLoading(false);
    };

    fetchChallenges();
  }, [event_challenge]);

  return (
    <>
      <div className='mt-4'>
        <Overall_header />
      </div>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-3xl font-bold text-[#09407F]">Challenges</p>
        </div>

        {loading && <p>Loading challenges...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {challenges.map((challenge) => (
              <Event_Challenge key={challenge.id} challenge={challenge} />
            ))}
            <Announcement />
          </div>
        )}
      </div>
    </>
  );
}