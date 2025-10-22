"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';


export function useUserProfile() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("Guest");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [collegeName, setCollegeName] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async (currentUser) => {
      setUser(currentUser); 

      if (currentUser) {
       
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("name, avatar_url, College(clg_name)") 
          .eq("user_id", currentUser.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error.message);
        }

       
        if (profile?.name) {
          setUserName(profile.name);
        } else if (currentUser.user_metadata?.full_name) {
          setUserName(currentUser.user_metadata.full_name);
        } else {
          setUserName(currentUser.email?.split("@")[0] || "User");
        }

     
        setAvatarUrl(profile?.avatar_url || null);
        
        
        setCollegeName(profile?.College?.clg_name || null);

      } else {
       
        setUserName("Guest");
        setAvatarUrl(null);
        setCollegeName(null); 
      }
      setLoading(false); 
    };

  
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setLoading(true); 
        fetchProfile(session?.user);
      }
    );

    
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);


  return { user, userName, avatarUrl, collegeName, loading };
}