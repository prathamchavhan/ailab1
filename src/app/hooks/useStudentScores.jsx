"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';


const calculateAverageScore = (results) => {
  if (!results || results.length === 0) return 0;
  const total = results.reduce((sum, r) => sum + r.score, 0);
  return Math.round(total / results.length);
};


export function useStudentScores(user) {
  const supabase = createClientComponentClient();
  const [overallAvgScore, setOverallAvgScore] = useState(null);
  const [interviewAvgScore, setInterviewAvgScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async (currentUser) => {
      setLoading(true);
      
      if (!currentUser) {
        setInterviewAvgScore(null);
        setOverallAvgScore(null);
        setLoading(false);
        return;
      }

      try {
       
        const { data: interviewResults } = await supabase
          .from("interview_results")
          .select(`final_score, interview_sessions!inner(user_id)`)
          .eq("interview_sessions.user_id", currentUser.id);
        
        const interviewScores =
          interviewResults?.map((r) => ({ score: r.final_score })) || [];
        const avgInterview = calculateAverageScore(interviewScores);
        setInterviewAvgScore(avgInterview);

        const { data: aptitudeResults } = await supabase
          .from("aptitude")
          .select(`score`)
          .eq("user_id", currentUser.id);
        
        const aptitudeScores =
          aptitudeResults?.map((r) => ({ score: r.score })) || [];
        const allScores = [...interviewScores, ...aptitudeScores];
        const avgOverall = calculateAverageScore(allScores);
        setOverallAvgScore(avgOverall);

      } catch (error) {
        console.error("Error fetching scores:", error.message);
        setInterviewAvgScore(null);
        setOverallAvgScore(null);
      } finally {
        setLoading(false);
      }
    };
    
 
    fetchScores(user);

  }, [user, supabase]); 

  return { overallAvgScore, interviewAvgScore, loading: loading };
}