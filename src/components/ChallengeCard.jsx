// src/components/ChallengeCard.jsx
"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
const ChallengeCard = ({ challenge, onStartChallenge }) => {
    // Determine dynamic styling based on challenge type
    const isAiInterview = challenge.challenge_type === 'AI Interview';
    const cardBackgroundColor = isAiInterview ? '#30475E' : '#734d9a';
    const buttonColor = isAiInterview ? '#2a445d' : '#634283';

    return (
        <div style={{
            padding: '20px',
            margin: '15px',
            borderRadius: '10px',
            backgroundColor: cardBackgroundColor,
            color: 'white',
            width: '300px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
            {/* Dynamic Event Name */}
            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '10px', marginBottom: '15px' }}>
                {challenge.event_name}
            </h3>
            
            <p>🗓️ **Date:** {challenge.formatted_date}</p>
            {/* Dynamic Level */}
            <p>⭐ **Level:** {challenge.level}</p> 
            
            {/* Dynamic Duration */}
            <p>⏱️ **Duration:** {challenge.duration_minutes} minutes</p> 
            
            {/* Dynamic Time */}
            <p>⏰ **Time:** {challenge.formatted_time}</p> 

            <button
                onClick={() => onStartChallenge(challenge)}
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: 'white',
                    color: buttonColor, // Button text color based on card type
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background-color 0.2s'
                }}
            >
                Start Challenge
            </button>
        </div>
    );
};

export default ChallengeCard;