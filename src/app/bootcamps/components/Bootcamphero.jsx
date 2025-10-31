'use client';
import React from 'react';

const HeroSection = () => {
  return (
    <section className=" text-[#09407F] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center ">
        <a
          href="#book"
          // UPDATED: Replaced Tailwind gradient classes with inline CSS style object
          style={{
            background: 'linear-gradient(to right, #2DC3DA, #109CFF)',
            color: 'white', // Set text color to ensure contrast on the dark gradient
          }}
          className="inline-block font-bold mb-4 py-3 px-8 rounded-full shadow-xl transition  !no-underline duration-300 transform hover:scale-[1.03] hover:opacity-90"
        >
          Intensive Training Programs
        </a>

        <p className="text-xl md:text-5xl text-black font-extrabold mb-7  leading-tight ">
          Data Analytics <br className="hidden sm:inline" />{' '}
          <span className="text-2xl md:text-4xl text-[#0097D3] font-bold mt-5">
            Bootcamps
          </span>
        </p>

        <p className="max-w-3xl mx-auto  text-sm text-black opacity-90 mb-8">
          Transform your career in weeks, not years. Join our intensive,
          job-focused bootcamps designed by industry experts with 100% placement
          guarantee.
        </p>

        {/* Stats Bar */}
        {/* UPDATED: Added 'flex-wrap' back to allow cards to wrap on smaller screens (fixing visibility issue). */}
        {/* Reduced gaps to 'gap-8 md:gap-16' to fit better on laptop screens before wrapping. */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16">
          {/* Stat Item 1: 12-16 Weeks Duration */}
          <div
            className="flex flex-col items-center p-4 rounded-xl w-44 h-24 justify-center shadow-md"
            style={{
              background: 'linear-gradient(to bottom right, #E7F9FF, #8DE4FF)',
            }}
          >
            <span className="text-2xl md:text-2xl font-bold text-[#e74f1cff]">
              12-16
            </span>
            <span className="text-xs md:text-sm font-medium text-[#09407F] opacity-80 mt-1">
              Weeks Duration
            </span>
          </div>

          {/* Stat Item 2: 100% Job Guarantee */}
          <div
            className="flex flex-col items-center p-4 rounded-xl w-44 h-24 justify-center shadow-md"
            style={{
              background: 'linear-gradient(to bottom right, #E7F9FF, #8DE4FF)',
            }}
          >
            <span className="text-2xl md:text-2xl font-bold text-[#22C55E]">
              100%
            </span>
            <span className="text-xs md:text-sm font-medium text-[#09407F] opacity-80 mt-1">
              Job Guarantee
            </span>
          </div>

          {/* Stat Item 3: 7500+ Success Stories */}
          <div
            className="flex flex-col items-center p-4 rounded-xl w-44 h-24 justify-center shadow-md"
            style={{
              background: 'linear-gradient(to bottom right, #E7F9FF, #8DE4FF)',
            }}
          >
            <span className="text-2xl md:text-2xl font-bold text-[#3B82F6]">
              7500+
            </span>
            <span className="text-xs md:text-sm font-medium text-[#09407F] opacity-80 mt-1">
              Success Stories
            </span>
          </div>

          {/* Stat Item 4: 4.9/5 Student Rating */}
          <div
            className="flex flex-col items-center p-4 rounded-xl w-44 h-24 justify-center shadow-md"
            style={{
              background: 'linear-gradient(to bottom right, #E7F9FF, #8DE4FF)',
            }}
          >
            <span className="text-2xl md:text-2xl font-bold text-[#A868F9]">
              4.9/5
            </span>
            <span className="text-xs md:text-sm font-medium text-[#09407F] opacity-80 mt-1">
              Student Rating
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
