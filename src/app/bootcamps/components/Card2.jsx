'use client';

import { Star, CheckCircle2,Dot } from 'lucide-react';

import { useState } from 'react';
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

export default function App() {
  // State to manage the modal's visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans shadow-md !rounded-lg text-gray-900">
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
     

        {/* --- Bootcamp Card --- */}
        {/* This card is already responsive with lg:flex-row */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col lg:flex-row">

          {/* --- Left Content Column --- */}
          <div className="w-full lg:w-2/3 p-6 md:p-10">
            
        
  {/* Tabs */}
{/* Tabs & Rating - single small line */}
<div className="flex items-center justify-between gap-3 mb-3 text-sm flex-wrap sm:flex-nowrap">
  {/* Tabs (left) */}
  <div className="flex items-center gap-2">
    <button
      className="px-3 py-1 !text-[8px] font-semibold bg-gradient-to-r from-[#79E0FF] to-[#00BAF2] text-black  !rounded-md"
     style={{ textShadow: '1px 1px 2px rgba(65, 65, 65, 0.5)' }}>
    Intermediate
    </button>

    <button
      className="px-3 py-1 !text-[8px] font-semibold bg-gradient-to-r from-[#E1AEFF] to-[#D895FF] text-black hover:bg-gray-200 transition-colors !rounded-md"
    style={{ textShadow: '1px 1px 2px rgba(65, 65, 65, 0.5)' }} >
    Online Live Classes
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
  <span className="font-semibold text-gray-800 text-[11px]">(4.9) 
</span>
  <span className="text-gray-600 text-[9px]">1,850+ enrolled</span>
</div>

  </div>
</div>


            {/* Title & Description */}
        <h2
  className="!text-[23px] !font-bold text-gray-900  mt-4 mb-3"
  style={{ letterSpacing: "0.10em" }}
>
Power BI Specialist Bootcamp
</h2>


            <p className="text-gray-500 text-[14px] mb-6 leading-relaxed">
Become a Power BI expert with intensive hands-on training. Master advanced DAX, custom visuals, and enterprise-level dashboard development.
            </p>

            {/* Program Highlights */}
            <p className="!text-[15px] font-bold text-gray-900 mb-4">
              Program Highlights
            </p>
       

<div className="grid grid-cols-1 md:grid-cols-2 text-[12px] gap-x-4 gap-y-2 mb-8">
  {[
    "Microsoft Certified Trainers",
    "Advanced DAX Mastery",
    "Enterprise Dashboard Projects",
    "Post-Training Support",
    "Custom Visual Development",
    "Real Business Case Studies",
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
              {/* ToolTag helper component is now fixed to accept className */}
              <ToolTag name="Power BI Desktop" className="!text-[10px] px-2 py-0.5" />
              <ToolTag name="Power BI Service" className="text-[10px] px-2 py-0.5" />
              <ToolTag name="DAX Studio" className="text-[10px] px-2 py-0.5" />
              <ToolTag name="Power Query" className="text-[10px] px-2 py-0.5" />
              <ToolTag name="Excel" className="text-[10px] px-2 py-0.5" />
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
                  <span className="text-white"        style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>EMI available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={18} className="text-white flex-shrink-0" />
                  <span className="text-white"        style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>Certification included</span>
                </div>
              </div>
              
              <h4 className="!text-sm font-semibold text-white mb-3"        style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
                What You'll Achieve
              </h4>
              <ul className="!space-y-3.5 !text-[10px] text-white "        style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
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
{/* MODIFIED: Changed gap to be responsive and match previous example */}
<div className="mt-10 flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-12 max-w-7xl mx-auto">

    {/* Card 1 */}
    {/* MODIFIED: Changed width to fixed w-72 for natural wrapping */}
    <div className="flex flex-col items-start p-6 rounded-xl w-72 shadow-md"
        style={{
            background: '#ffffffff'
        }}>
        <span className="!text-[10px] font-medium text-[#8C42A7] mb-2">Week 1</span>
        <span className="!text-[16px] font-bold text-[#09407F]">Power BI Fundamentals</span>
        <span className="!text-[10px] md:text-sm font-medium text-gray-700 opacity-80 mt-1">Interface, Data Sources, Basic Visualizations</span>
    </div>

    {/* Card 2 */}
    {/* MODIFIED: Changed width to fixed w-72 for natural wrapping */}
    <div className="flex flex-col items-start p-6 rounded-xl w-72 shadow-md"
        style={{
            background: '#ffffffff'
        }}>
        <span className="!text-[10px] font-medium text-[#8C42A7] mb-2">Week 2</span>
        <span className="!text-[16px] font-bold text-[#09407F]">Advanced Visualizations</span>
        <span className="!text-[10px] md:text-sm font-medium text-gray-700 opacity-80 mt-1">Custom Charts, Interactive Dashboards, Drill-through</span>
    </div>

    {/* Card 3 */}
    {/* MODIFIED: Changed width to fixed w-72 for natural wrapping */}
    <div className="flex flex-col items-start p-6 rounded-xl w-72 shadow-md"
        style={{
            background: '#ffffffff'
        }}>
        <span className="!text-[10px] font-medium text-[#8C42A7] mb-2">Week 3</span>
        <span className="!text-[16px] font-bold text-[#09407F]">DAX Functions</span>
        <span className="!text-[10px] md:text-sm font-medium text-gray-700 opacity-80 mt-1">Calculated Columns, Measures, Time Intelligence
</span>
    </div>

</div>

{/* MODIFIED: Changed gap and margin-top to match previous example */}
 <div className="mt-8 flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-12 max-w-7xl mx-auto">

    {/* Stat Item 1 */}
    {/* MODIFIED: Changed width to fixed w-72 for natural wrapping */}
 <div className="flex flex-col items-start p-6 rounded-xl w-72 shadow-md"
        style={{
            background: '#ffffffff'
        }}>
               <span className="!text-[10px] font-medium text-[#8C42A7] mb-2">Week 4</span>
        <span className="!text-[16px] font-bold text-[#09407F]">Data Modeling</span>
        <span className="!text-[10px] md:text-sm font-medium text-grey-200 opacity-80 mt-1">Relationships, Star Schema, Performance Optimization</span>
    </div>

    {/* Stat Item 2 */}
    {/* MODIFIED: Changed width to fixed w-72 for natural wrapping */}
    <div className="flex flex-col items-start p-6 rounded-xl w-72 shadow-md"
        style={{
            background: '#ffffffff'
        }}>
              <span className="!text-[10px] font-medium text-[#8C42A7] mb-2">Week 5</span>
        <span className="!text-[16px] font-bold text-[#09407F]">Advanced Analytics</span>
        <span className="!text-[10px] md:text-sm font-medium text-grey-200 opacity-80 mt-1">Row Level Security, Custom Visuals, Power BI Service</span>
    </div>

    {/* Stat Item 3 */}
    {/* MODIFIED: Changed width to fixed w-72 for natural wrapping */}
     <div className="flex flex-col items-start p-6 rounded-xl w-72 shadow-md"
        style={{
            background: '#ffffffff'
        }}>
              <span className="!text-[10px] font-medium text-[#8C42A7] mb-2">Week 6</span>
        <span className="!text-[16px] font-bold text-[#09407F]">Enterprise Projects</span>
        <span className="!text-[10px] md:text-sm font-medium text-grey-200 opacity-80 mt-1">Real-world Implementation, Best Practices, Certification Prep</span>
    </div>

</div>
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
  
  // MODIFIED: Set default course to this page's bootcamp
  const [course, setCourse] = useState('Power BI Specialist Bootcamp'); 
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
      // MODIFIED: Reset course to this page's bootcamp
      setCourse('Power BI Specialist Bootcamp'); 
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
            {/* MODIFIED: Title matches this page's bootcamp */}
            <h3 className="text-xl font-bold text-center text-[#09407F] mb-1">
              Enroll: Power BI Specialist Bootcamp
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
                     <option value="Power BI Specialist Bootcamp">Power BI Specialist Bootcamp</option>
                    <option value="Complete Data Analytics Bootcamp">Complete Data Analytics Bootcamp</option>
                    <option value="Career Discovery & Assessment">Career Discovery & Assessment</option>
                    <option value="Career Transition Planning">Career Transition Planning</option>
                    <option value="Job Search & Placement Support">Job Search & Placement Support</option>
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