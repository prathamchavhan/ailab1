"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function CreateProfilePage() {
  // --- SETUP (No changes) ---
  const router = useRouter();
  const supabase = createClientComponentClient();

  // --- STATE MANAGEMENT (No changes) ---
  const [form, setForm] = useState({
     name: "", branch: "", sem: "",
    department_id: "", stream_id: "", clg_id: "", clg_code: "",
  });
  const [streams, setStreams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [collegeName, setCollegeName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FORM HANDLERS & DATA FETCHING (No changes) ---
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

  useEffect(() => { fetchStreams(); }, [fetchStreams]);

  useEffect(() => {
    if (form.stream_id) {
      fetchDepartments(form.stream_id);
      setForm(prevForm => ({ ...prevForm, department_id: "" }));
    } else {
      setDepartments([]);
    }
  }, [form.stream_id, fetchDepartments]);

  // --- FORM SUBMISSION (No changes) ---
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
      if (!response.ok) throw new Error(result.message || "An unexpected error occurred.");
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- STYLES ---
  const inputStyle = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition h-11";

  return (
    <div className="h-screen bg-gray-50">
      <div className="w-full h-full bg-white flex flex-col lg:flex-row">
        
        {/* === Left Decorative Panel === */}
<div className="w-210 h-206 lg:py-8 text-white bg-gradient-to-br from-[#2B7ECF] to-[#2DC7DB] lg:rounded-tr-[100px] lg:rounded-br-[100px] flex flex-col items-center justify-center text-center">
    {/* ... your content here ... */}

            {/* GIF is now an image element */}
            <img 
                src="/images/profile.gif" // Make sure this path is correct
                alt="Profile animation" 
                className="w-164 h-124 mb-6" 
            />
            <h3 className="text-3xl font-bold mb-3">
                Be One of The 1 Million+ Minds Shaping AI's Future
            </h3>
            <p className="text-white/80 mb-10 max-w-md">
                Just a few clicks to connect, learn, and grow with AILab.
            </p>
            <div className="grid grid-cols-3 gap-x-4 gap-y-2 w-full max-w-md">
                <div>
                    <p className="text-3xl text-[#283C63] shadow-sd-white font-bold">1000+</p>
                    <p className="text-sm text-white">New jobs posted weekly</p>
                </div>
                <div>
                    <p className="text-3xl text-[#283C63] shadow-sd-white font-bold">4.8/5</p>
                    <p className="text-sm text-white">User satisfaction score</p>
                </div>
                <div>
                    <p className="text-3xl text-[#283C63] shadow-sd-white font-bold">150%</p>
                    <p className="text-sm text-white">Skill improvement rate</p>
                </div>
            </div>
        </div>
        
        {/* === Right Form Panel === */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center items-center">
          <div className="w-full max-w-md">
              <p className="text-3xl font-bold text-[#00046C] mb-8 underline ">
                
                  Create Your Profile
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                      <div className="text-center p-3 mb-4 bg-red-100 text-red-800 border border-red-300 rounded-lg">
                          {error}
                      </div>
                  )}
                  
                  {/* Form fields now in a 2-column grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                          <input id="name" type="text" name="name" value={form.name} onChange={handleChange} required className={inputStyle} />
                      </div>

                     <div>
                          <label htmlFor="sem" className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                          <input id="sem" type="number" name="sem" value={form.sem} onChange={handleChange} required className={inputStyle} />
                      </div>
                      
                      <div>
                          <label htmlFor="clg_code" className="block text-sm font-medium text-gray-700 mb-1">College Code *</label>
                          <input id="clg_code" type="text" name="clg_code" value={form.clg_code} onChange={handleChange} onBlur={handleCollegeCodeBlur} required className={inputStyle} />
                      </div>

                      <div>
                          <label htmlFor="clg_name" className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
                          <input id="clg_name" type="text" name="clg_name" value={collegeName} readOnly placeholder="Name appears here" className={`${inputStyle} bg-gray-50 cursor-not-allowed`} />
                      </div>

                      <div>
                          <label htmlFor="stream_id" className="block text-sm font-medium text-gray-700 mb-1">Stream *</label>
                          <select id="stream_id" name="stream_id" value={form.stream_id} onChange={handleChange} required className={inputStyle}>
                              <option value="">Select Stream</option>
                              {streams.map((stream) => (
                                  <option key={stream.id} value={stream.id}>{stream.stream}</option>
                              ))}
                          </select>
                      </div>

                      <div>
                          <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
                          <input id="branch" type="text" name="branch" value={form.branch} onChange={handleChange} required className={inputStyle} />
                      </div>
                      
                      <div className="sm:col-span-2">
                          <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                          <select id="department_id" name="department_id" value={form.department_id} onChange={handleChange} required disabled={!form.stream_id} className={`${inputStyle} disabled:bg-gray-100`}>
                              <option value="">Select Department</option>
                              {departments.map((dept) => (
                                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                              ))}
                          </select>
                      </div>

                     
                  </div>

                  {/* --- Submit Button & Logo --- */}
                  <div className="pt-6 flex flex-col items-center">
    <button
        type="submit"
        disabled={isSubmitting}
        className="w-80 px-6 py-3 bg-gradient-to-br from-[#2B7ECF] to-[#2DC7DB] text-white font-semibold shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ borderRadius: '8px' }}
    >
        {isSubmitting ? "SAVING..." : "SAVE PROFILE"}
    </button>
</div>
                  
              </form>
           
          </div>
             <div className="w-full flex justify-end mt-20">
                        <img src="/images/logo.png" alt="AI Lab Logo" className="h-17" />
                      </div>
        </div>
        
      </div>
    </div>
  );
}