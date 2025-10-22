"use client";

import React, { useState, useEffect } from 'react';
import { Check, Star } from 'lucide-react';
import Overall_header from '@/components/Header/Overall_header';
const SubscriptionStatus = ({ subscription }) => {
    if (!subscription) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-md mb-8 text-center text-gray-500 w-full max-w-sm">
                No active subscription found.
            </div>
        );
    }
    const { start_date, end_date } = subscription;
    const start = new Date(start_date);
    const end = new Date(end_date);
    const today = new Date();
    const startUTC = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
    const endUTC = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
    const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    const totalDuration = Math.max(1, Math.round((endUTC - startUTC) / (1000 * 60 * 60 * 24)));
    const remainingDays = Math.max(0, Math.round((endUTC - todayUTC) / (1000 * 60 * 60 * 24)));
    const elapsedDays = totalDuration - remainingDays;
    const progressPercentage = (elapsedDays / totalDuration) * 100;
    const formatDate = (dateObj) => new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(dateObj);

    return (
        <div className="  mb-1 w-full max-w-sm">
             <div className="flex justify-between items-center mb-0">
              
                 <span className={`text-xs font-bold px-3 py-1 rounded-full ${remainingDays > 0 ? 'text-black' : 'text-red-700 bg-red-100'}`}>
                     {remainingDays > 0 ? `${remainingDays} Days Remaninig` : 'Expired'}
                   <br /><span>Activated: {formatDate(start)}</span>
                 </span>
             </div>
             <div className="w-full bg-gray-200 rounded-full h-2 my-3">
               <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progressPercentage}%`,  background: 'linear-gradient(to right, #2DC2DB, #2B87D0)' }}> </div>
             </div>
             <div className="flex justify-between text-xs text-gray-600 font-medium">
             <span>Expires: {formatDate(end)}</span> 
             </div>
        </div>
    );
};


const PricingCard = ({ plan, isPopular }) => {
    

    const CardInnerContent = () => (
        <>
            {isPopular && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full z-10">
                    Most Popular
                </div>
            )}
            <div className="flex-grow">
   
                <h3 className={`text-xl font-bold text-center text-gray-800 ${isPopular ? 'pt-4' : ''}`}>{plan.name}</h3>
                <div className="text-center my-4">
                    <span className="text-4xl font-extrabold text-gray-900">₹{plan.priceMonthly}</span>
                    <span className="text-gray-500"> / monthly</span>
                </div>
                <p className="text-center text-gray-600 mb-6 font-semibold">₹{plan.priceYearly} / yearly</p>
                <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                            {feature.icon}
                            <span className="ml-3 text-gray-700">{feature.text}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <button className="w-full py-1.5 px-4 text-sm text-center font-semibold rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-300">
                Buy {plan.name}
            </button>
        </>
    );

  
    return (

        <div className="relative rounded-lg shadow-2xl p-0.5 bg-gradient-to-b from-cyan-400 to-blue-500">
 
            <div className="relative bg-white p-8 rounded-[7px] flex flex-col min-h-[460px]" style={{ background: "linear-gradient(90deg, #f7fcfcff, #ddeefcff)" }}>
                <CardInnerContent />
            </div>
        </div>
    );
};


export default function BillingPage() {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubscriptionData = async () => {
            try {
                const response = await fetch('/api/subscription');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Please log in to see your subscription.');
                }
                const data = await response.json();
                setSubscription(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptionData();
    }, []);

    const quarterlyPlan = {
        name: 'Quarterly Plan', priceMonthly: 200, priceYearly: 2400,
        features: [
             { icon: <Check className="h-5 w-5 text-blue-500" />, text: 'Best for short-term users' },
            { icon: <Check className="h-5 w-5 text-blue-500" />, text: 'Flexible billing every 3 months' },
            { icon: <Check className="h-5 w-5 text-blue-500" />, text: 'Access all premium features' },
        ],
    };
    const yearlyPlan = {
        name: 'Yearly Plan', priceMonthly: 150, priceYearly: 1800,
        features: [
             { icon: <Check className="h-5 w-5 text-blue-500" />, text: ' Save ₹600 yearly' },
            { icon: <Check className="h-5 w-5 text-blue-500" />, text: 'One-time annual payment' },
            { icon: <Star className="h-5 w-5 text-blue-500 fill-blue-100" />, text: 'Most Popular & Best Value' },
        ],
    };

    return (
        <>  
        <div className='mt-4'>
        <Overall_header/>
        </div>
        <div className="bg-gray-50 mb-3 min-h-screen">
          
            <main className="flex-1 p-6 md:p-10">
                <div className="max-w-5xl mx-auto">
                    
                    {/* Header with "Billing" title */}
                    <header className="flex flex-col md:flex-row justify-between items-start mb-10">
                        <p className="text-4xl font-bold text-[#09407F] mb-4 md:mb-0">
                            Billing
                        </p>
                        
                        {/* Subscription Status Card (and its logic) */}
                        <div className="w-full md:w-auto">
                            {loading && <p className="text-center py-4 w-full max-w-sm">Loading...</p>}
                            {error && <p className="text-center text-red-500 bg-red-100 p-4 rounded-lg my-4 w-full max-w-sm">{error}</p>}
                            {!loading && !error && <SubscriptionStatus subscription={subscription} />}
                        </div>
                    </header>

                    <p className="text-3xl text-center text-[#09407F] mb-22">Unbeatable Pricing</p>
                  
                    
                    <div className="max-w-3xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8 mt-4">
                            <PricingCard plan={quarterlyPlan} isPopular={false} />
                            <PricingCard plan={yearlyPlan} isPopular={true} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
        </>
    );
}