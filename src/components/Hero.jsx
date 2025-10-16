import React from 'react';

const HeroSection = () => {
  return (
    <section className=" text-[#09407F] py-16 md:py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <a 
            href="#book" 
            // UPDATED: Replaced Tailwind gradient classes with inline CSS style object
            style={{ 
                background: 'linear-gradient(to right, #2DC3DA, #109CFF)',
                color: 'white' // Set text color to ensure contrast on the dark gradient
            }}
            className="inline-block font-bold mb-4 py-3 px-8 rounded-full shadow-xl transition  !no-underline duration-300 transform hover:scale-[1.03] hover:opacity-90"
        >
            Expert career Guidence
        </a>
        
        
        <h1 className="text-4xl md:text-5xl   text-[#09407F] font-extrabold mb-4 leading-tight">
            Transform Your Career With <br className="hidden sm:inline font-bold " /> <span className="text-3xl font-bold">Expert Counselling</span>
        </h1>
        
        <p className="max-w-3xl mx-auto  text-lg text-[#09407F] opacity-90 mb-8">
            Get personalized guidance, review your goals, and unlock your potential. Our certified experts provide comprehensive, one-on-one sessions tailored to your needs.
        </p>
        
      
        {/* Stats Bar */}
        <div className="mt-12 flex flex-wrap justify-center gap-10 md:gap-24 lg:gap-32 max-w-7xl mx-auto">

    {/* Stat Item 1: 5000+ Careers Transformed */}
    <div className="flex flex-col items-center p-4 rounded-xl w-46 sm:w-44 h-24 justify-center shadow-md"
        style={{
            background: 'linear-gradient(to bottom right, #E7F9FF, #8DE4FF)'
        }}>
        <span className="text-2xl md:text-3xl font-bold text-[#09407F]">5000+</span>
        <span className="text-xs md:text-sm font-medium text-[#09407F] opacity-80 mt-1">Careers Transformed</span>
    </div>

    {/* Stat Item 2: 95% Success Rate */}
    <div className="flex flex-col items-center p-4 rounded-xl w-46 sm:w-44 h-24 justify-center shadow-md"
        style={{
            background: 'linear-gradient(to bottom right, #E7F9FF, #8DE4FF)'
        }}>
        <span className="text-2xl md:text-3xl font-bold text-[#09407F]">95%</span>
        <span className="text-xs md:text-sm font-medium text-[#09407F] opacity-80 mt-1">Success Rate</span>
    </div>

    {/* Stat Item 3: 50+ Expert Counsellors */}
    <div className="flex flex-col items-center p-4 rounded-xl w-46 sm:w-44 h-24 justify-center shadow-md"
        style={{
            background: 'linear-gradient(to bottom right, #E7F9FF, #8DE4FF)'
        }}>
        <span className="text-2xl md:text-3xl font-bold text-[#09407F]">50+</span>
        <span className="text-xs md:text-sm font-medium text-[#09407F] opacity-80 mt-1">Expert Counsellors</span>
    </div>

    {/* Stat Item 4: 4.9/5 Client Satisfaction */}
    <div className="flex flex-col items-center p-4 rounded-xl w-46 sm:w-44 h-24 justify-center shadow-md"
        style={{
            background: 'linear-gradient(to bottom right, #E7F9FF, #8DE4FF)'
        }}>
        <span className="text-2xl md:text-3xl font-bold text-[#09407F]">4.9/5</span>
        <span className="text-xs md:text-sm font-medium text-[#09407F] opacity-80 mt-1">Client Satisfaction</span>
    </div>
</div>
    </div>
</section>
  );
};

export default HeroSection;