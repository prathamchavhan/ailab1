'use client';
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
            color: 'white', // Set text color to ensure contrast on the dark gradient
          }}
          className="inline-block font-bold mb-4 py-3 px-8 rounded-full shadow-xl transition  !no-underline duration-300 transform hover:scale-[1.03] hover:opacity-90"
        >
          Expert career Guidence
        </a>

        <h3 className="text-xl md:text-3xl text-[#09407F] font-extrabold mb-7  leading-tight ">
          Transform Your Career With <br className="hidden sm:inline" />{' '}
          <span className="text-2xl md:text-5xl !mb-3  font-bold mt-5">
            Expert Counselling
          </span>
        </h3>

        <p className="max-w-3xl mx-auto  text-lg text-[#09407F] opacity-90 mb-8">
          Get personalized guidance, review your goals, and unlock your
          potential. Our certified experts provide comprehensive, one-on-one
          sessions tailored to your needs.
        </p>

        {/* Stats Bar */}
        {/*
          UPDATED: Replaced flex-wrap with a responsive grid.
          - On mobile (default): Stacks cards in 1 column (grid-cols-1)
          - On small screens (sm: 640px+): 2x2 grid (sm:grid-cols-2)
          - On large screens (lg: 1024px+): 1x4 row (lg:grid-cols-4)
          - Added max-w-6xl and mx-auto to center and constrain the grid on very large screens.
          - Adjusted gap for a balanced look.
          - ADDED: justify-items-center to center the fixed-width-cards within the grid columns.
        */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto justify-items-center">
          {/* Stat Item 1: 5000+ Careers Transformed */}
          {/* UPDATED: Reverted w-full back to w-44 */}
          <div
            className="flex flex-col items-center p-4 rounded-xl w-44 h-24 justify-center shadow-md"
            style={{
              background: 'linear-gradient(to bottom right, #E7F9FF, #8DE4FF)',
            }}
          >
            <span className="text-2xl md:text-3xl font-bold text-[#e74f1cff]">
              5000+
            </span>
            <span className="text-xs md:text-sm font-medium text-[#09407F] opacity-80 mt-1">
              Careers Transformed
            </span>
          </div>

          {/* Stat Item 2: 95% Success Rate */}
          {/* UPDATED: Reverted w-full back to w-44 */}
          <div
            className="flex flex-col items-center p-4 rounded-xl w-44 h-24 justify-center shadow-md"
            style={{
              background: 'linear-gradient(to bottom right, #E7F9FF, #8DE4FF)',
            }}
          >
            <span className="text-2xl md:text-3xl font-bold text-[#e74f1cff]">
              95%
            </span>
            <span className="text-xs md:text-sm font-medium text-[#09407F] opacity-80 mt-1">
              Success Rate
            </span>
          </div>

          {/* Stat Item 3: 50+ Expert Counsellors */}
          {/* UPDATED: Reverted w-full back to w-44 */}
          <div
            className="flex flex-col items-center p-4 rounded-xl w-44 h-24 justify-center shadow-md"
            style={{
              background: 'linear-gradient(to bottom right, #E7F9FF, #8DE4FF)',
            }}
          >
            <span className="text-2xl md:text-3xl font-bold text-[#e74f1cff]">
              50+
            </span>
            <span className="text-xs md:text-sm font-medium text-[#09407F] opacity-80 mt-1">
              Expert Counsellors
            </span>
          </div>

          {/* Stat Item 4: 4.9/5 Client Satisfaction */}
          {/* UPDATED: Reverted w-full back to w-44 */}
          <div
            className="flex flex-col items-center p-4 rounded-xl w-44 h-24 justify-center shadow-md"
            style={{
              background: 'linear-gradient(to bottom right, #E7F9FF, #8DE4FF)',
            }}
          >
            <span className="text-2xl md:text-3xl font-bold text-[#e74f1cff]">
              4.9/5
            </span>
            <span className="text-xs md:text-sm font-medium text-[#09407F] opacity-80 mt-1">
              Client Satisfaction
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

