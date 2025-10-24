import React from 'react';
import { Briefcase, ArrowRight, TrendingUp, Search as SearchIcon, CheckCircle ,PhoneCall } from 'lucide-react'; 


const services = [
  {
    title: "Career Discovery & Assessment",
    duration: "2 Hours",
    description: "Comprehensive personality and aptitude assessment to discover your ideal career path in data analytics.",
    itemsHeading: "What's Included:",
    items: [
      "Psychometric Testing & Analysis",
      "Skills & Interest Assessment",
      "Personality Profiling",
      "Industry Fit Analysis",
      "Detailed Career Report",
    ],
    outcome: "Clear understanding of your strengths and best-fit career options",
    icon: SearchIcon, 
  },
  {
    title: "Career Transition Planning",
    duration: "3 Sessions",
    description: "Strategic guidance for professionals looking to transition into data analytics from other fields.",
    itemsHeading: "What's Included:",
    items: [
      "Current Skills Gap Analysis",
      "Learning Roadmap Creation",
      "Timeline & Milestone Planning",
      "Industry Networking Guidance",
      "Certification Strategy",
    ],
    outcome: "Step-by-step action plan for successful career transition",
    icon: TrendingUp, 
  },
  {
    title: "Job Search & Placement Support",
    duration: "4 Sessions",
    description: "Dedicated support to enhance your job search and secure your desired role.",
    itemsHeading: "What's Included:",
    items: [
      "Resume & Cover Letter Optimization",
      "Interview Preparation (Mock Interviews)",
      "LinkedIn Profile Enhancement",
      "Networking Strategies",
      "Access to Job Boards & Referrals",
    ],
    outcome: "Successfully land your dream job with confidence and a strong personal brand",
    icon: Briefcase,
  },
];


const ServiceCards = () => {
  
  return (
    <section className="py-16 "> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="text-center mb-12">
          <p className="text-3xl font-bold text-gray-900 mb-2">Choose Your Counselling Service</p>
          <p className="text-gray-600">Tailored sessions for every stage of your career journey.</p>
        </header>

        {/* Updated grid layout for 3 columns on medium screens and above */}
        <div className="grid md:grid-cols-3 gap-8 justify-items-center"> 
          {services.map((service, index) => (
            // 1. Outer Div: Acts as the gradient border. 
            <div 
              key={index} 
              className="rounded-xl shadow-md hover:shadow-xl transition duration-300 w-full max-w-sm flex flex-col"
              style={{ 
                // Border Gradient: Uses the button blue colors for a cohesive look
                background: `linear-gradient(to bottom, #2DC1DB, #3E82D4)`,
                padding: '1px', 
              }}
            >
                {/* 2. Inner Div: Holds the white content background */}
                <div className="bg-white p-6 rounded-xl flex flex-col h-full"> 
                    
                    {/* Title & Duration/Sessions */}
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-extrabold text-gray-900 mb-1">{service.title}</h3>
                      <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full text-white"
                        style={{ 
                          // Duration Tag Gradient
                          background: `#e74f1cff`
                        }}>
                        {service.duration}
                      </span>
                    </div>
                    
                    {/* Description */}
                    <p className="text-center text-gray-600 text-sm mb-6 border-b pb-4">{service.description}</p>
                    
                    {/* What's Included Section */}
                    <div className="mb-6 flex-grow">
                      <p className="font-bold text-base text-gray-800 mb-3">{service.itemsHeading}</p>
                      <ul className="space-y-2 text-gray-700">
                        {service.items.map((item, i) => (
                          <li key={i} className="flex items-start">
                            <CheckCircle size={14} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Expected Outcome Section - Updated with background color, padding, and rounded corners */}
                    <div className="mt-auto px-4 py-3 rounded-lg mb-4"   
                      style={{ 
                          background:"#F0F8FF" // Using a slightly softer light blue
                      }}>
                      <p className="font-bold text-base text-gray-800 mb-2">Expected Outcome:</p>
                      <p className="text-sm text-gray-600 font-medium">{service.outcome}</p>
                    </div>
                    <a href="https://dvlearningz.com/" target="_blank" rel="noopener noreferrer">
                    {/* Book Button */}
                    <button
                      className="mt-6 w-full text-white font-bold py-2.5  hover:opacity-90 transition duration-300 shadow-md text-sm"
                      style={{
                           borderRadius: '8px' ,
                        background: `linear-gradient(to right, #2DC1DB, #3E82D4)`
                      }}
                    >
                      Book This Service
                    </button>
                    </a>
                </div>
            </div>
          ))}
        </div>

    
               <div className="rounded-xl p-8 lg:p-12 text-center text-white shadow-2xl"
             style={{ 
            
                 marginTop: '6rem', 
          
                 background: `linear-gradient(to right, #2DC4DB, #2B82CF)`, 
             }}>
              
   <h2
  style={{
    fontWeight: 800,
    fontSize: "2rem",
    marginBottom: "0.75rem",
    color: "white",
    textShadow: "0px 2px 3px rgba(0, 0, 0, 0.4)",
  }}
>
  Ready to Transform Your Career?
</h2>



           <p
  style={{
    fontSize: "1.125rem",
    marginBottom: "2rem",
    maxWidth: "48rem",
    marginLeft: "auto",
    marginRight: "auto",
    opacity: 0.9,
    color: "white",
    textShadow: "0px 2px 3px rgba(0, 0, 0, 0.4)",
  }}
>
  Book your free consultation today and take the first step towards your dream career in data analytics.
</p>


       <div className="flex flex-col sm:flex-row justify-center items-center gap-11 mb-8">

    <a href="https://dvlearningz.com/career-counselling" target="_blank" rel="noopener noreferrer">
    <button
  className="w-full sm:w-auto px-4 py-2 bg-white text-[#09407F] font-bold transition duration-300 shadow-xl hover:shadow-2xl text-md"
  style={{ borderRadius: '8px' }}
 
>
  Book Free Consultation
</button>
</a>
    {/* Phone Number (Plain White Text) */}
  <a 
  href="tel:+919325545392"
  className="w-full sm:w-auto text-white !no-underline text-left font-bold text-md flex items-center gap-x-2"
>
    <PhoneCall className='w-4 h-4'/> 
    <span>+91-9470482746</span>
</a>
  </div>
            {/* Reassurance/Benefit Text */}
            <p className="text-sm font-medium opacity-90 mt-4 flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
                <span className="flex items-center">
                    <CheckCircle size={14} className="mr-1 text-green-300" /> Free 30-minute session
                </span>
                <span className="flex items-center">
                    <CheckCircle size={14} className="mr-1 text-green-300" /> Personalized guidance
                </span>
                <span className="flex items-center">
                    <CheckCircle size={14} className="mr-1 text-green-300" /> No obligation
                </span>
            </p>
        </div>
      </div>
    </section>
  );
};

export default ServiceCards;