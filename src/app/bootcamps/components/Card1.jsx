'use client';

// 1. Imports from React, Supabase, and lucide-react
import React, { useState } from 'react';
import { Star, CheckCircle2, Dot } from 'lucide-react';

import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// 3. Add a warning to the console if keys are missing
if (!supabase) {
  console.warn(
    'Supabase client not initialized. Check your .env.local file for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}


// --- Main App Component ---
export default function App() {
  // State to manage the modal's visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans shadow-md !rounded-lg text-gray-900">
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <header className="text-center mb-10">
          <h1 className="text-2xl sm:text-4xl !font-bold text-gray-900 mb-3" >
            Choose Your Bootcamp Program
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Intensive, job-focused training programs with hands-on projects and industry mentorship
          </p>
        </header>

        {/* --- Bootcamp Card --- */}
        {/* This card is already responsive with lg:flex-row */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col lg:flex-row">

          {/* --- Left Content Column --- */}
          <div className="w-full lg:w-2/3 p-6 md:p-10">
            
            {/* Tabs & Rating - single small line */}
            <div className="flex items-center justify-between gap-3 mb-3 text-sm flex-wrap sm:flex-nowrap">
              {/* Tabs (left) */}
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 !text-[8px] font-semibold bg-gradient-to-r from-[#79E0FF] to-[#00BAF2] text-black !rounded-md"
                  style={{ textShadow: '1px 1px 2px rgba(65, 65, 65, 0.5)' }} >
                  Beginner to Advanced
                </button>

                <button
                  className="px-3 py-1 !text-[8px] font-semibold bg-gradient-to-r from-[#E1AEFF] to-[#D895FF] text-black hover:bg-gray-200 transition-colors !rounded-md"
                  style={{ textShadow: '1px 1px 2px rgba(65, 65, 65, 0.5)' }}  >
                  Hybrid (Online + Offline)
                </button>
              </div>

              {/* Rating (right) */}
              <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap text-xs">
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-semibold text-gray-800 text-[11px]">4.8/5</span>
                  <span className="text-gray-600 text-[9px]">2,450+ reviews</span>
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <h2
              className="!text-[23px] !font-bold text-gray-900  mt-4 mb-3"
              style={{ letterSpacing: "0.10em" }}
            >
              Complete Data Analytics Bootcamp
            </h2>

            <p className="text-gray-500 text-[14px] mb-6 leading-relaxed">
              Master data analytics from scratch with hands-on projects, real-world case studies, and industry mentorship. Get job-ready in 12 weeks with 80% placement assistance.
            </p>

            {/* Program Highlights */}
            <p className="!text-[15px] font-bold text-gray-900 mb-4">
              Program Highlights
            </p>
       
            <div className="grid grid-cols-1 md:grid-cols-2 text-[12px] gap-x-4 gap-y-2 mb-8">
              {[
                "80% Job Placement Guarantee",
                "Live Projects with Real Companies",
                "51 Mentorship Sessions",
                "Industry Recognized Certification",
                "Flexible Weekend Batches",
                "Lifetime Course Access",
              ].map((text, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Dot size={29} className="text-[#09407F] fill-black" />
                  <span className="text-gray-700">{text}</span>
                </div>
              ))}
            </div>

            {/* Tools You'll Master */}
            <p className="text-[16px] font-semibold text-gray-900 mb-4">
              Tools You'll Master
            </p >
            <div className="flex flex-wrap gap-1.5">
              {/* The ToolTag component is now fixed to accept these classes */}
              <ToolTag name="Excel" className="!text-[10px] px-2 py-0.5" />
              <ToolTag name="SQL Server" className="text-[10px] px-2 py-0.5" />
              <ToolTag name="Power BI" className="text-[10px] px-2 py-0.5" />
              <ToolTag name="Python" className="text-[10px] px-2 py-0.5" />
              <ToolTag name="Tableau" className="text-[10px] px-2 py-0.5" />
              <ToolTag name="Google Analytics" className="text-[10px] px-2 py-0.5" />
            </div>

          </div>

          {/* --- Right Sidebar Column --- */}
          <div className="w-full lg:w-1/3 bg-gradient-to-b from-[#103E50] to-[#1B7192] text-white p-8">
            <div className="sticky top-8 ">
              <div className="mb-4 text-center">
                <span 
                  className="text-[10px] text-white uppercase"
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
                >
                  Program Duration
                </span>
                <p 
                  className="text-[19px] font-bold"
                  style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}
                >
                  12 Weeks
                </p>
              </div>

              {/* Added flex container to center the button */}
              <div className="flex justify-center">
                {/* --- THIS IS THE MODIFIED BUTTON --- */}
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="block w-45 bg-white !text-[#09407F] !no-underline font-bold py-2 px-2 !rounded-lg text-center hover:bg-gray-200 transition duration-300 mb-4 text-sm cursor-pointer"
                >
                  Enroll Now
                </button>
              </div>

              <div className="flex flex-wrap justify-center sm:justify-between text-sm mb-6 gap-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={18} className="text-white flex-shrink-0" />
                  <span className="text-white" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>EMI available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={18} className="text-white flex-shrink-0" />
                  <span className="text-white" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>Certification included</span>
                </div>
              </div>
              
              <h4 className="!text-sm font-semibold text-white mb-3"  style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
                What You'll Achieve
              </h4>
              <ul className="!space-y-3.5 !text-[10px] text-white" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
                <AchieveItem text="Build 10+ Industry Projects" />
                <AchieveItem text="Master 11+ Analytics Tools" />
                <AchieveItem text="Get certified by Microsoft" />
                <AchieveItem text="Land High-Paying Jobs (7-8 LPA)" />
                <AchieveItem text="Join 10,000+ Alumni Network" />
              </ul>
            </div>
          </div>
        </div>

        {/* --- Curriculum Breakdown (Placeholder) --- */}
        <div className="mt-16 text-center">
            <h2 className="text-3xl sm:text-4xl !font-bold text-gray-900">
              Complete Curriculum Breakdown
            </h2>
        </div>
        {/* MODIFIED: Added responsive gap */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-12 max-w-7xl mx-auto">
          {/* Card 1 */}
          {/* MODIFIED: Set fixed width w-72 */}
          <div className="flex flex-col items-start p-6 rounded-xl w-72 shadow-md" style={{ background: '#ffffffff' }}>
            <span className="!text-[10px] font-medium text-[#8C42A7] mb-2">Week 1-2</span>
            <span className="!text-[16px] font-bold text-[#09407F]">Foundations</span>
            <span className="!text-[10px] md:text-sm font-medium text-gray-700 opacity-80 mt-1">Excel Mastery, Statistics Fundamentals, Data Visualization Basics</span>
          </div>
          {/* Card 2 */}
          {/* MODIFIED: Set fixed width w-72 */}
          <div className="flex flex-col items-start p-6 rounded-xl w-72 shadow-md" style={{ background: '#ffffffff' }}>
            <span className="!text-[10px] font-medium text-[#8C42A7] mb-2">Week 3-4</span>
            <span className="!text-[16px] font-bold text-[#09407F]">SQL & Databases</span>
            <span className="!text-[10px] md:text-sm font-medium text-gray-700 opacity-80 mt-1">Advanced SQL Queries, Database Design, Performance Optimization</span>
          </div>
          {/* Card 3 */}
          {/* MODIFIED: Set fixed width w-72 */}
          <div className="flex flex-col items-start p-6 rounded-xl w-72 shadow-md" style={{ background: '#ffffffff' }}>
            <span className="!text-[10px] font-medium text-[#8C42A7] mb-2">Week 5-6</span>
            <span className="!text-[16px] font-bold text-[#09407F]">Power BI Mastery</span>
            <span className="!text-[10px] md:text-sm font-medium text-gray-700 opacity-80 mt-1">Dashboard Creation, DAX Functions, Advanced Analytic</span>
          </div>
        </div>

        {/* MODIFIED: Added responsive gap and mt-8 */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-12 max-w-7xl mx-auto">
          {/* Stat Item 1 */}
          {/* MODIFIED: Set fixed width w-72 */}
          <div className="flex flex-col items-start p-6 rounded-xl w-72 shadow-md" style={{ background: '#ffffffff' }}>
            <span className="!text-[10px] font-medium text-[#8C42A7] mb-2">Week 7-8</span>
            <span className="!text-[16px] font-bold text-[#09407F]">Python for Analytics</span>
            <span className="!text-[10px] md:text-sm font-medium text-grey-200 opacity-80 mt-1">Pandas, NumPy, Data Manipulation, Automation</span>
          </div>
          {/* Stat Item 2 */}
          {/* MODIFIED: Set fixed width w-72 */}
          <div className="flex flex-col items-start p-6 rounded-xl w-72 shadow-md" style={{ background: '#ffffffff' }}>
            <span className="!text-[10px] font-medium text-[#8C42A7] mb-2">Week 8-9</span>
            <span className="!text-[16px] font-bold text-[#09407F]">Advanced Analytics</span>
            <span className="!text-[10px] md:text-sm font-medium text-grey-200 opacity-80 mt-1">Machine Learning Basics, Predictive Modeling</span>
          </div>
          {/* Stat Item 3 */}
          {/* MODIFIED: Set fixed width w-72 */}
          <div className="flex flex-col items-start p-6  rounded-xl w-72 shadow-md" style={{ background: '#ffffffff' }}>
            <span className="!text-[10px] font-medium text-[#8C42A7] mb-2">Week 9-10</span>
            <span className="!text-[16px] font-bold text-[#09407F]">Capstone Project</span>
            <span className="!text-[10px] md:text-sm font-medium text-grey-200 opacity-80 mt-1">End-to-End Analytics Project, Portfolio Development</span>
          </div>
        </div>

        {/* --- MODAL RENDERING --- */}
        {/* This will render the BookingForm when isModalOpen is true */}
        {isModalOpen && (
          <BookingForm onClose={() => setIsModalOpen(false)} />
        )}

      </main>
    </div>
  );
}


// --- Booking Form Modal Component ---
// This is the modal component, adapted from your ServiceCards file.
function BookingForm({ onClose }) {
  // States for each form field
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  // Set default course to the Bootcamp
  const [course, setCourse] = useState('Complete Data Analytics Bootcamp'); 
  const [message, setMessage] = useState('');

  // States for loading and submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', or 'error'

  // --- Form Submission Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault(); 

    if (!supabase) {
      console.error('Supabase client not initialized. Check .env.local and lib/supabaseClient.js');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const { data, error } = await supabase
        .from('service_bookings') // Make sure your table name matches
        .insert([
          {
            full_name: fullName,
            email: email,
            phone: phone,
            course: course,
            message: message
          }
        ])
        .select();

      if (error) {
        console.error('Supabase insert error:', error.message);
        if (error.message.includes("policy")) {
            console.error("--- RLS ERROR ---: Row Level Security (RLS) is likely enabled. Create an INSERT policy or DISABLE RLS for this table in Supabase.");
        }
        throw error;
      }

      setSubmitStatus('success');
      setIsSubmitting(false);

      setFullName('');
      setEmail('');
      setPhone('');
      setCourse('Complete Data Analytics Bootcamp'); // Reset course to default
      setMessage('');

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose(); 
        setSubmitStatus(null);
      }, 2000);

    } catch (error) {
      setSubmitStatus('error');
      setIsSubmitting(false);
    }
  };
  
  // This is the modal JSX.
  return (
    // Overlay: covers the whole screen
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      {/* Modal Content: */}
      <div
        className="relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()} // Prevents overlay click
      >
        <div
          className="p-1 rounded-xl"
          style={{ background: 'linear-gradient(to right, #2DC1DB, #3E82D4)' }}
        >
          <div className="relative bg-white rounded-lg p-6 sm:p-8">

            {/* --- Close Button ('X') --- */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* --- Form Title --- */}
            <h3 className="text-xl font-bold text-center text-[#09407F] mb-1">
              Enroll: Complete Data Analytics Bootcamp
            </h3>
            <p className="text-center text-gray-500 text-sm mb-6">
              {submitStatus === 'success' ? 'We will get back to you within 24 hours!' : 'Fill in your details to get started.'}
            </p>

            {/* --- The Form --- */}
            <form onSubmit={handleSubmit}>
              {submitStatus === 'success' && (
                <div className="mb-4 p-3 text-center bg-green-100 text-green-700 rounded-md">
                  Success! We've received your request.
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="mb-4 p-3 text-center bg-red-100 text-red-700 rounded-md">
                  Oops! Something went wrong. Please try again.
                </div>
              )}

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3E82D4]"
                    placeholder="Enter your full name"
                  />
                </div>
                
                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3E82D4]"
                    placeholder="Enter your email"
                  />
                </div>
                
                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3E82D4]"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                {/* Course Interested in */}
                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                    Course Interested in <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="course"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3E82D4] bg-white"
                  >
                    {/* Added Bootcamp as the default selected option */}
                    <option value="Complete Data Analytics Bootcamp">Complete Data Analytics Bootcamp</option>
                    <option value="Career Discovery & Assessment">Career Discovery & Assessment</option>
                    <option value="Career Transition Planning">Career Transition Planning</option>
                    <option value="Job Search & Placement Support">Job Search & Placement Support</option>
                    <option value="Power BI Specialist Bootcamp">Power BI Specialist Bootcamp</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                {/* Message (Optional) */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3E82D4]"
                    placeholder="Tell us about your goals..."
                  ></textarea>
                </div>

                {/* --- Submit Button --- */}
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-white font-bold py-2.5 px-4 rounded-lg hover:opacity-90 transition duration-300 shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: `linear-gradient(to right, #2DC1DB, #3E82D4)`
                    }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Connect with us'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


// --- Helper Components ---

/**
 * A component for the tag-like items in "Tools You'll Master".
 */
// MODIFIED: This helper now correctly accepts and merges className
const ToolTag = ({ name, className = '' }) => (
  <span className={`bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium ${className}`}>
    {name}
  </span>
);

/**
 * A component for the list items in the sidebar's "What You'll Achieve" section.
 */
const AchieveItem = ({ text }) => (
  <li className="flex items-start gap-2.5">
    <CheckCircle2 size={18} className="flex-shrink-0 mt-1" />
    <span>{text}</span>
  </li>
);