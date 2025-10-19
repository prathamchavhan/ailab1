

"use client";
import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import ChallengeCard from '../../components/ChallengeCard';

const DashboardPage = () => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    

    const router = useRouter(); 

    useEffect(() => {

        const fetchChallenges = async () => {
            try {
              
                const response = await fetch('/api/challenges'); 
                
                if (!response.ok) {
                    throw new Error('Failed to fetch challenge data');
                }
                
                const data = await response.json();
                setChallenges(data);
            } catch (error) {
                console.error("Error fetching challenges:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChallenges();
    }, []);

    const handleStartChallenge = (challenge) => {
        // Redirect based on the dynamic challenge_type value
        if (challenge.challenge_type === 'AI Interview') {
            // 💡 FIXED: Use router.push() for Next.js navigation
            router.push(`/interview-page/${challenge.id}`);
        } else if (challenge.challenge_type === 'Aptitude') {
            // 💡 FIXED: Use router.push() for Next.js navigation
            router.push(`/challenges-page/${challenge.id}`);
        }
    };
    
    if (loading) {
        return <div style={{padding: '50px'}}>Loading Challenges...</div>;
    }

    return (
        <div style={{ padding: '20px', backgroundColor: '#a57f7fff', minHeight: '100vh', color: 'white' }}>
            {/* ... (Rest of your component structure) ... */}
            <h2>Challenges</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {challenges.map(challenge => (
                    <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        onStartChallenge={handleStartChallenge}
                    />
                ))}
            </div>
            {/* ... (Announcement section) ... */}
        </div>
    );
};

export default DashboardPage;