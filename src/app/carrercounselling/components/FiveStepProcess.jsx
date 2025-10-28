// components/FiveStepProcess.jsx
import React from 'react';
import { Search, Brain, Users, CheckCircle, Rocket } from 'lucide-react'; 

const steps = [
  { icon: Search, title: "Initial Consultation", description: "Free 30-minute session to understand your background, goals, and challenges" },
  { icon: Brain, title: "Comprehensive Assessment", description: "In-depth analysis using psychometric tools, skills evaluation, and market research" },
  { icon: Users, title: "Strategy Development", description: "Create personalized career roadmap with specific actions and timelines" },
  { icon: CheckCircle, title: "Implementation Support", description: "Ongoing guidance, mentorship, and support during execution phase" },
  { icon: Rocket, title: "Follow-up & Monitoring", description: "Periodic check-ins and strategy adjustments." },
];

const FiveStepProcess = () => {
  return (
    <section className="py-16 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-4xl  text-[43px] font-bold text-[#09407F] mb-2">Our Proven 5-Step Process</p>
        <p className="text-[#09407F] mb-12 max-w-2xl mx-auto">
          Systematic approach to cover everything from self-assessment to long-term success.
        </p>

        {/* Steps Container (Horizontal Timeline) */}
        <div className="relative flex justify-between items-start text-left pt-10 pb-4">
          
          {/* Timeline Line */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-1" style={{ backgroundColor: '#09407F' }}></div>

          {steps.map((step, index) => (
            <div key={index} className="w-1/5 flex flex-col items-center px-2 z-10">
              
              {/* Icon Circle */}
            
<div 
  className="w-12 h-12 flex items-center justify-center rounded-full text-white border-4 border-white shadow-lg mb-4" 
  style={{ 
    background: 'linear-gradient(to right, #09407F, #1073E5)' 
  }}>
    <step.icon size={20} />
</div>
              {/* Step Content */}
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900 mb-1">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default FiveStepProcess;