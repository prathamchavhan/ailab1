'use client';

import { useState, useEffect } from 'react';
// FIX: Replaced aliased import "@/lib/supabaseClient" with a relative path
import { supabase } from "../lib/supabaseClient";

export default function Announcement() {
  // NEW: Changed state to hold an array of ads, not just one
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: State to track the current slide index
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchAds = async () => {
      // NEW: Select 'id' for key prop. Removed .limit(1) to get ALL ads.
      const { data, error } = await supabase
        .from('ads')
        .select('id, content, image_url, url') // Added 'id'
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching ads:", error);
      } else {
        setAds(data);
      }
      setLoading(false);
    };
    fetchAds();
  }, []);

  // NEW: A separate useEffect to handle the 3-second interval
  useEffect(() => {
    // Don't start the timer unless there's more than one ad
    if (ads.length <= 1) {
      return;
    }

    // Set up an interval to change the slide every 3 seconds
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        (prevIndex + 1) % ads.length // Loop back to 0
      );
    }, 5000); // 3000ms = 3 seconds

    // Clean up the interval when the component unmounts
    return () => clearInterval(timer);
  }, [ads.length]); // Re-run if the number of ads changes

  // Loading State
  if (loading) {
    return (
      <div className="bg-transparent rounded-2xl shadow-md animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="w-full h-[180px] bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  // Empty State (No Ads)
  // NEW: Check if the ads array is empty
  if (!ads || ads.length === 0) {
    return (
      <div className="bg-transparent rounded-2xl shadow-md p-5">
        <p className="font-[Poppins] font-semibold text-[20px] text-[#09407F] mb-4">
          Announcement
        </p>
        <p className="text-gray-500">No announcement at the moment.</p>
      </div>
    );
  }

  // This content block is now removed, as the logic is inside the return.

  return (
    <div className="bg-transparent rounded-2xl">
      <p className="font-[Poppins] font-semibold text-[20px] leading-[100%] text-[#09407F] mb-2">
        Announcement
      </p>

      {/* NEW: This container holds all ads. 
        CSS transitions are used to fade them in and out.
      */}
      <div className="relative w-[280px] h-[270px] overflow-hidden rounded-lg">
        {ads.map((ad, index) => {
          // This is the content for *each* ad
          const adImage = (
            <img
              src={ad.image_url}
              alt={"Latest Announcement"}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]"
              loading="lazy"
            />
          );

          // This content is wrapped in a link *if* ad.url exists
          const adContentWithLink = ad.url ? (
            <a
              href={ad.url}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline block"
              // Only make the link clickable if it's the active slide
              style={{ pointerEvents: index === currentIndex ? 'auto' : 'none' }}
            >
              {adImage}
            </a>
          ) : (
            // If no URL, just display the image
            <div>{adImage}</div>
          );

          return (
            <div
              key={ad.id} // Use the 'id' from Supabase for a stable key
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {adContentWithLink}
            </div>
          );
        })}
      </div>
    </div>
  );
}