"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AdComponent = () => {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    const fetchAd = async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching ad:', error);
      } else if (data && data.length > 0) {
        setAd(data[0]);
      }
    };

    fetchAd();
  }, []);

  if (!ad) {
    return null;
  }

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      {ad.image_url && <img src={ad.image_url} className="card-img-top" alt="Ad" />}
      <div className="card-body">
        <p className="card-text">{ad.content}</p>
        {ad.url && <a href={ad.url} className="btn btn-primary" target="_blank" rel="noopener noreferrer">Learn More</a>}
      </div>
    </div>
  );
};

export default AdComponent;
