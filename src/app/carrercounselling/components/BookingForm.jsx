// 1. Add 'use client' at the very top
'use client';

// 2. Import React, useState, icons, and Supabase
import React, { useState } from 'react';
import { Briefcase, ArrowRight, TrendingUp, Search as SearchIcon, CheckCircle, PhoneCall } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- Supabase Setup ---
// Read the variables from process.env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

// Initialize the Supabase client
let supabase;
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("Supabase initialization error:", error);
  }
} else {
  console.warn("Supabase credentials not found. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY are set in .env.local.");
}
// --- End Supabase Setup ---


// --- Service Data ---
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


// --- Booking Form Modal Component ---
// This component is now used by ServiceCards and is not exported.
// It receives 'service' and 'onClose' as props.
function BookingForm({ service, onClose }) {

  // States for each form field
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  // **MODIFICATION**: The course state is pre-filled from the 'service' prop
  const [course, setCourse] = useState(service.title); 
  const [message, setMessage] = useState('');

  // States for loading and submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', or 'error'

  // --- Form Submission Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    if (!supabase) {
      console.error("Supabase client not initialized.");
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
            course: course, // The 'course' state variable
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
      setCourse(service.title); // Reset course to default
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
  
  // This is the modal JSX. It's rendered by the parent.
  return (
    // Overlay: covers the whole screen
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose} // **MODIFICATION**: Use 'onClose' prop
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
              onClick={onClose} // **MODIFICATION**: Use 'onClose' prop
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* --- Form Title --- */}
            <h3 className="text-xl font-bold text-center text-[#09407F] mb-1">
              {/* **MODIFICATION**: Title is now dynamic */}
              Book {service.title} 
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
                    value={course} // **MODIFICATION**: Value is controlled by state
                    onChange={(e) => setCourse(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3E82D4] bg-white"
                  >
                    <option value="" disabled>Select a course</option>
                    {/* **MODIFICATION**: Options match the service titles */}
                    <option value="Career Discovery & Assessment">Career Discovery & Assessment</option>
                    <option value="Career Transition Planning">Career Transition Planning</option>
                    <option value="Job Search & Placement Support">Job Search & Placement Support</option>
                    <option value="Data Analytics Bootcamp">Data Analytics Bootcamp</option>
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


// --- Main Service Cards Component (Default Export) ---

const ServiceCards = () => {
  // State to track which modal is open (using the service title as the ID)
  const [openModalId, setOpenModalId] = useState(null);

  return (
    <section className="py-16 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <header className="text-center mb-12">
          <p className="text-3xl font-bold text-gray-900 mb-2">Choose Your Counselling Service</p>
          <p className="text-gray-600">Tailored sessions for every stage of your career journey.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 justify-items-center">
          {services.map((service, index) => (
            <div
              key={index}
              className="rounded-xl shadow-md hover:shadow-xl transition duration-300 w-full max-w-sm flex flex-col"
              style={{
                background: `linear-gradient(to bottom, #2DC1DB, #3E82D4)`,
                padding: '1px',
              }}
            >
              <div className="bg-white p-6 rounded-xl flex flex-col h-full">

                {/* Title & Duration */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-extrabold text-gray-900 mb-1">{service.title}</h3>
                  <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full text-white"
                    style={{ background: `#e74f1cff` }}>
                    {service.duration}
                  </span>
                </div>

                {/* Description */}
                <p className="text-center text-gray-600 text-sm mb-6 border-b pb-4">{service.description}</p>

                {/* What's Included */}
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

                {/* Expected Outcome */}
                <div className="mt-auto px-4 py-3 rounded-lg mb-4"
                  style={{ background: "#F0F8FF" }}>
                  <p className="font-bold text-base text-gray-800 mb-2">Expected Outcome:</p>
                  <p className="text-sm text-gray-600 font-medium">{service.outcome}</p>
                </div>

                {/* This div contains the button and the modal logic */}
                <div>
                  {/* Button now sets the openModalId to this service's title */}
                  <button
                    onClick={() => setOpenModalId(service.title)} 
                    className="mt-6 w-full text-white font-bold py-2.5 hover:opacity-90 transition duration-300 shadow-md text-sm"
                    style={{
                      borderRadius: '8px',
                      background: `linear-gradient(to right, #2DC1DB, #3E82D4)`,
                    }}
                  >
                    Book This Service
                  </button>

                  {/* **MODIFICATION**: 
                      This now renders the BookingForm component when its ID matches.
                      It passes the 'service' object and the 'onClose' function.
                  */}
                  {openModalId === service.title && (
                    <BookingForm
                      service={service} 
                      onClose={() => setOpenModalId(null)} 
                    />
                  )}

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* "Ready to Transform" Banner */}
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
            <a
              href="tel:+919325545392"
              className="w-full sm:w-auto text-white !no-underline text-left font-bold text-md flex items-center gap-x-2"
            >
              <PhoneCall className='w-4 h-4' />
              <span>+91-9470482746</span>
            </a>
          </div>

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