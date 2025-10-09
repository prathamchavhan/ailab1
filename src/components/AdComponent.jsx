"use client"
import { useEffect, useState } from 'react'

const AdComponent = () => {
  const [ad, setAd] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await fetch('/api/ads');
        if (!res.ok) {
          throw new Error(`API responded with status ${res.status}`);
        }
        const json = await res.json();
        
        // --- THIS IS THE FIX --- 👇
        // We need to check for the 'ad' property in the object from your API
        if (json && json.ad) {
          setAd(json.ad);
        }

      } catch (err) {
        console.error('Error fetching ad from /api/ads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse bg-white border border-gray-200 rounded-lg shadow p-3">
        <div className="w-full h-40 bg-gray-200 rounded-md mb-3" />
        <div className="h-3 bg-gray-200 rounded mb-2 w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        AnnouncementBox
      </div>
    )
  }

  if (!ad) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow p-3 text-sm text-gray-600">
        No ads available right now.
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow p-3">
      {ad.image_url && (
        <img
          src={ad.image_url}
          alt={ad.content || 'Ad'}
          className="w-full h-40 object-cover rounded-md mb-3"
        />
      )}

      <div className="text-sm text-gray-800 mb-2">
        {ad.content}
      </div>

      {ad.url && (
        <a
          href={ad.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
        >
          Learn more
        </a>
      )}
    </div>
  )
}

export default AdComponent