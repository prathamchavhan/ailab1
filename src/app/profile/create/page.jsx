"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function CreateProfilePage() {
  // --- SETUP ---
  const router = useRouter();
  const supabase = createClientComponentClient();

  // --- STATE MANAGEMENT ---
  const [form, setForm] = useState({
    roll_no: "", name: "", branch: "", sem: "",
    department_id: "", stream_id: "", clg_id: "", clg_code: "",
  });

  const [streams, setStreams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [collegeName, setCollegeName] = useState("");
  const [error, setError] = useState(""); // Unified error state for all feedback
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FORM HANDLERS & DATA FETCHING ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'clg_code') {
      setCollegeName(""); 
      setError(""); 
      setForm(prev => ({ ...prev, clg_id: "" }));
    }
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };
  
  const handleCollegeCodeBlur = useCallback(async (e) => {
    const code = e.target.value.trim();
    if (!code) {
        setCollegeName(""); 
        setError(""); 
        setForm(prev => ({...prev, clg_id: ""}));
        return;
    }
    const { data, error: dbError } = await supabase.from('College').select('id, clg_name').eq('clg_uuid', code).single();
    if (dbError || !data) {
        setCollegeName(""); 
        setError("Invalid College Code."); 
        setForm(prev => ({...prev, clg_id: ""}));
    } else {
        setCollegeName(data.clg_name); 
        setError(""); 
        setForm(prev => ({...prev, clg_id: data.id}));
    }
  }, [supabase]);

  const fetchStreams = useCallback(async () => {
    const { data } = await supabase.from('stream').select('id, stream');
    if (data) setStreams(data);
  }, [supabase]);

  const fetchDepartments = useCallback(async (streamId) => {
    if (!streamId) { setDepartments([]); return; }
    const { data } = await supabase.from('department').select('id, name').eq('stream_id', streamId);
    if (data) setDepartments(data);
  }, [supabase]);

  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  useEffect(() => {
    if (form.stream_id) {
      fetchDepartments(form.stream_id);
      setForm(prevForm => ({ ...prevForm, department_id: "" }));
    } else {
      setDepartments([]);
    }
  }, [form.stream_id, fetchDepartments]);

  // --- FORM SUBMISSION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clg_id || error) {
      setError("Please provide a valid college code.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    const profileData = {
      roll_no: form.roll_no, name: form.name, branch: form.branch,
      sem: parseInt(form.sem, 10),
      department_id: parseInt(form.department_id, 10),
      stream_id: parseInt(form.stream_id, 10),
      clg_id: parseInt(form.clg_id, 10),
    };

    try {
      const response = await fetch('/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "An unexpected error occurred.");
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- STYLES ---
  const gradientOuterStyle = {
    background: 'linear-gradient(to right, #1ee3ff, #6f5af8)',
    borderRadius: '1.5rem',
    padding: '2px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  };

  const innerBoxStyle = {
    background: 'white',
    borderRadius: '1.3rem',
  };

  return (
    // The main container allows for scrolling by default when content overflows.
    // Adjusted padding for better responsiveness on small screens.
    <div className="min-h-screen bg-white text-black flex flex-col items-center p-4 md:p-8">
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <img src="/images/palloti.png" alt="AI Lab Logo" className="h-20 w-60 md:h-30 md:w-80" />
      </div>
      
      {/* Adjusted top padding to give more space for the logo on mobile */}
      <div className="flex flex-col items-center pt-28 md:pt-20 w-full max-w-5xl">
        <div className="mb-8 cursor-pointer transition-all duration-300 scale-80" style={gradientOuterStyle}>
          <div className="px-8 py-3" style={innerBoxStyle}>
            <h1 className="text-lg font-bold text-center" style={{ background: 'linear-gradient(to right, #1ee3ff, #6f5af8)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              Create Your Profile
            </h1>
          </div>
        </div>
        
   
        {/* Adjusted vertical gap for a more compact form on mobile */}
        <form onSubmit={handleSubmit} className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
          {/* Error Display Area */}
          {error && (
            <div className="md:col-span-2 text-center p-3 mb-4 bg-red-100 text-red-800 border border-red-300 rounded-lg">
              {error}
            </div>
          )}

          {[
            { label: "FULL NAME -", name: "name", type: "text", value: form.name },
            { label: "ROLL NO -", name: "roll_no", type: "text", value: form.roll_no },
            { label: "BRANCH -", name: "branch", type: "text", value: form.branch },
            { label: "SEMESTER -", name: "sem", type: "number", value: form.sem },
          ].map((field) => (
            <div key={field.name} className="h-16 flex items-center" style={gradientOuterStyle}>
              <div className="relative w-full h-full flex items-center" style={innerBoxStyle}>
                <label htmlFor={field.name} className="absolute left-4 text-gray-700 text-base font-bold">
                  {field.label}
                </label>
                <input id={field.name} type={field.type} name={field.name} value={field.value} onChange={handleChange} required className="w-full h-full bg-transparent pl-40 pr-4 text-gray-800 text-lg focus:outline-none text-right" />
              </div>
            </div>
          ))}

          {/* College Code Input */}
          <div className="h-16 flex items-center" style={gradientOuterStyle}>
            <div className="relative w-full h-full flex items-center" style={innerBoxStyle}>
              <label htmlFor="clg_code" className="absolute left-4 text-gray-700 text-base font-bold">
                COLLEGE CODE -
              </label>
              <input id="clg_code" type="text" name="clg_code" value={form.clg_code} onChange={handleChange} onBlur={handleCollegeCodeBlur} required className="w-full h-full bg-transparent pl-48 pr-4 text-gray-800 text-lg focus:outline-none text-right" />
            </div>
          </div>

          {/* College Name Display */}
          <div className="h-16 flex items-center" style={gradientOuterStyle}>
            <div className="relative w-full h-full flex items-center" style={innerBoxStyle}>
              <label htmlFor="clg_name" className="absolute left-4 text-gray-700 text-base font-bold">
                COLLEGE NAME -
              </label>
              <input id="clg_name" type="text" name="clg_name" value={collegeName} readOnly placeholder="Name appears here" className="w-full h-full bg-transparent pl-48 pr-4 text-gray-500 text-lg focus:outline-none text-right cursor-not-allowed" />
            </div>
          </div>

          {/* Stream Select */}
          <div className="h-16 flex items-center" style={gradientOuterStyle}>
            <div className="relative w-full h-full flex items-center" style={innerBoxStyle}>
              <label htmlFor="stream_id" className="absolute left-4 text-gray-700 text-base font-bold">
                STREAM -
              </label>
              <select id="stream_id" name="stream_id" value={form.stream_id} onChange={handleChange} required className="w-full h-full bg-transparent pl-40 pr-4 text-gray-800 text-lg focus:outline-none text-right appearance-none">
                <option value="">Select Stream</option>
                {streams.map((stream) => (
                  <option key={stream.id} value={stream.id}>{stream.stream}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Department Select */}
          <div className="h-16 flex items-center" style={gradientOuterStyle}>
            <div className="relative w-full h-full flex items-center" style={innerBoxStyle}>
              <label htmlFor="department_id" className="absolute left-4 text-gray-700 text-base font-bold">
                DEPARTMENT -
              </label>
              <select id="department_id" name="department_id" value={form.department_id} onChange={handleChange} required disabled={!form.stream_id} className="w-full h-full bg-transparent pl-40 pr-4 text-gray-800 text-lg focus:outline-none text-right appearance-none">
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-center mt-8">
            <button type="submit" disabled={isSubmitting} className="group w-full max-w-xs p-0.5 font-semibold transition-all duration-300 ease-out cursor-pointer disabled:cursor-not-allowed disabled:opacity-70" style={gradientOuterStyle}>
             <div className="w-full h-full p-3 flex justify-center items-center bg-white rounded-[1.3rem] group-hover:bg-gradient-to-r group-hover:from-[#1ee3ff] group-hover:to-[#6f5af8] transition-all duration-300">
              <span className="text-xl font-bold bg-gradient-to-r from-[#1ee3ff] to-[#6f5af8] bg-clip-text text-transparent group-hover:bg-none group-hover:text-white transition-colors duration-300">
                {isSubmitting ? "SAVING..." : "SAVE PROFILE"}
              </span>
            </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}