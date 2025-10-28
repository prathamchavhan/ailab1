'use client'; 

import { useState, useEffect } from 'react';
// FIX: Replaced aliased import "@/lib/supabaseClient" with a relative path
import { supabase } from "../lib/supabaseClient"; 

export default function Announcement() {
  const [ad, setAd] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      // Assuming 'supabase' is configured correctly elsewhere, we fetch the latest ad.
      const { data, error } = await supabase
        .from('ads')
        .select('content, image_url, url')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching ad:", error);
      } else {
        setAd(data);
      }
      setLoading(false);
    };
    fetchAd();
  }, []); 

  // Loading State
  if (loading) {
    return (
      <div className="bg-transparent rounded-2xl shadow-md  animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="w-full h-[180px] bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  // Empty State (No Ad)
  if (!ad) {
    return (
      <div className="bg-transparent rounded-2xl shadow-md p-5">
        <p className="font-[Poppins] font-semibold text-[20px] text-[#09407F] mb-4">
          Announcement
        </p>
        <p className="text-gray-500">No announcement at the moment.</p>
      </div>
    );
  }
  
  // This content block now only includes the image rendering logic.
  const AdContent = (
    <>
      {ad.image_url && (
        <div className="relative w-[280px] h-[270px]">
          <img
            src={ad.image_url}
            // Using a generic alt text since the ad.content is no longer displayed
            alt={"Latest Announcement"}
            className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-[1.01]"
            loading="lazy"
          />
        </div>
      )}
    </>
  );

  return (
    <div className="bg-transparent rounded-2xl   ">
      <p className="font-[Poppins] font-semibold text-[20px] leading-[100%] text-[#09407F] mb-2">
        Announcement
      </p>
      {/* If a URL exists, wrap the image in an anchor tag to make it clickable */}
      {ad.url ? (
        <a 
          href={ad.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="no-underline block"
        >
          {AdContent}
        </a>
      ) : (
        // If no URL, just display the image block without a link
        <div>{AdContent}</div>
      )}
    </div>
  );
}