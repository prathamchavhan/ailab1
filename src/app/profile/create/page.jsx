

"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from 'sonner';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function CreateProfilePage() {

  const router = useRouter();

  const supabase = createClientComponentClient(); 
  
 
  const [form, setForm] = useState({
    name: "",
    surname: "", 
    sem: "",
    department_id: "",
    stream_id: "",
    clg_id: "", 
  });
  const [colleges, setColleges] = useState([]);
  const [streams, setStreams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [collegeCode, setCollegeCode] = useState(""); 
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const [scrollableHeight, setScrollableHeight] = useState('100vh'); 
  const [isMobile, setIsMobile] = useState(false); 


  const fetchColleges = useCallback(async () => {
    const { data, error: dbError } = await supabase.from('College').select('id, clg_name, clg_uuid');
    if (dbError) {
      toast.error("Could not fetch college list. Please refresh.");
      console.error("Error fetching colleges:", dbError);
    } else if (data) {
      setColleges(data);
    }
  }, [supabase]);

  const fetchStreams = useCallback(async () => {
    const { data } = await supabase.from('stream').select('id, stream');
    if (data) setStreams(data);
  }, [supabase]);

  const fetchDepartments = useCallback(async (streamId) => {
    if (!streamId) {
      setDepartments([]);
      return;
    }
    const { data } = await supabase.from('department').select('id, name').eq('stream_id', streamId);
    if (data) setDepartments(data);
  }, [supabase]);

 
  useEffect(() => {
    fetchColleges();
    fetchStreams();
  }, [fetchColleges, fetchStreams]);


  useEffect(() => {
    if (form.stream_id) {
      fetchDepartments(form.stream_id);
      setForm(prevForm => ({ ...prevForm, department_id: "" }));
    } else {
      setDepartments([]);
    }
  }, [form.stream_id, fetchDepartments]);

 
  useEffect(() => {
    const setViewportHeight = () => {
        const isCurrentlyMobile = window.innerWidth < 1024;
        setIsMobile(isCurrentlyMobile);
      
        setScrollableHeight(isCurrentlyMobile ? '100svh' : '100vh'); 
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);

    return () => window.removeEventListener('resize', setViewportHeight); 
  }, []);


  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'clg_id') {
      const selectedCollege = colleges.find(c => c.id.toString() === value);
      if (selectedCollege) {
        setCollegeCode(selectedCollege.clg_uuid);
        setError("");
      } else {
        setCollegeCode("");
      }
    }
    
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clg_id || !form.name || !form.surname || !form.sem || !form.stream_id || !form.department_id) {
    toast.error("Please fill out all required fields.");
        return;
    }

    setIsSubmitting(true);
    setError("");

    try {
     
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        throw new Error("Could not get user session. Please log in again.");
      }
      if (!user) {
        throw new Error("User not found. Please log in again.");
      }

      
      const profileData = {
        user_id: user.id, 
        email: user.email,
        name: form.name,
        surname: form.surname,
        sem: parseInt(form.sem, 10),
        department_id: parseInt(form.department_id, 10),
        stream_id: parseInt(form.stream_id, 10),
        clg_id: parseInt(form.clg_id, 10),
       
      };

    
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (insertError) {
  
        console.error("Supabase insert error:", insertError);
        if (insertError.code === '23505') { 
     
          throw new Error("A profile already exists for this user or email.");
        }
        throw new Error(`Error saving profile: ${insertError.message}`);
      }
toast.success("Profile created successfully! Redirecting...");
      // 4. Success: Redirect to the dashboard
      router.push('/dashboard');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  // --- STYLES ---
  const inputStyle = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition h-11";

  
  const rightPanelMobileStyle = isMobile ? {
      height: scrollableHeight, 
      overflowY: 'auto',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      paddingTop: '32px', 
  } : {};


  return (
   
    <div className="w-full bg-gray-50 flex justify-center items-start min-h-screen"> 
      <div className="w-full bg-white flex flex-col lg:flex-row shadow-none lg:shadow-2xl">
        
       
        <div 
            className="w-full lg:w-1/2 min-h-fit lg:min-h-screen py-8 text-white bg-gradient-to-br from-[#2B7ECF] to-[#2DC7DB] lg:rounded-tr-[100px] lg:rounded-br-[100px] flex flex-col items-center justify-center text-center p-6 mb-0 lg:mb-0" 
        >
            <img 
                src="/images/profile.gif"
                alt="Profile animation" 
                className="w-32 md:w-48 lg:w-80 h-auto mb-6 mx-auto" 
            />
            <h3 className="text-xl md:text-3xl font-bold mb-3 px-4">
                Be One of The 1 Million+ Minds Shaping AI's Future
            </h3>
            <p className="text-white/80 mb-8 max-w-sm text-sm md:text-base">
                Just a few clicks to connect, learn, and grow with AILab.
            </p>
            <div className="grid grid-cols-3 gap-x-4 gap-y-2 w-full max-w-md px-4">
                <div>
                    <p className="text-2xl md:text-3xl text-[#283C63] shadow-sd-white font-bold">1000+</p>
                    <p className="text-xs text-white">New jobs posted weekly</p>
                </div>
                <div>
                    <p className="text-2xl md:text-3xl text-[#283C63] shadow-sd-white font-bold">4.8/5</p>
                    <p className="text-xs text-white">User satisfaction score</p>
                </div>
                <div>
                    <p className="text-2xl md:text-3xl text-[#283C63] shadow-sd-white font-bold">150%</p>
                    <p className="text-xs text-white">Skill improvement rate</p>
                </div>
            </div>
        </div>
        
       
        <div 
           
            style={rightPanelMobileStyle}
            className="w-full lg:w-1/2 flex flex-col items-center lg:justify-center lg:min-h-screen" 
        >
          
         
          <div className="w-full max-w-md px-8 pb-96 lg:px-12 lg:py-0 lg:pb-0"> 
              <p className="text-2xl md:text-3xl font-bold text-[#00046C] mb-8 underline text-center lg:text-left">
                  Create Your Profile
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                      <div className="text-center p-3 mb-4 bg-red-100 text-red-800 border border-red-300 rounded-lg">
                          {error}
                      </div>
                  )}
                  
                  <div className="space-y-4"> 
                      {/* Name */}
                      <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                          <input id="name" type="text" name="name" value={form.name} onChange={handleChange} required className={inputStyle} />
                      </div>

                      {/* Surname */}
                      <div>
                          <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">Surname *</label>
                          <input id="surname" type="text" name="surname" value={form.surname} onChange={handleChange} required className={inputStyle} />
                      </div>
                  </div>

                  {/* Remaining fields that can benefit from a grid layout on small screens */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Semester */}
                      <div>
                          <label htmlFor="sem" className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                          <input id="sem" type="number" name="sem" value={form.sem} onChange={handleChange} required className={inputStyle} />
                      </div>

                      {/* Stream */}
                      <div>
                          <label htmlFor="stream_id" className="block text-sm font-medium text-gray-700 mb-1">Stream *</label>
                          <select id="stream_id" name="stream_id" value={form.stream_id} onChange={handleChange} required className={inputStyle}>
                              <option value="">Select Stream</option>
                              {streams.map((stream) => (
                                  <option key={stream.id} value={stream.id}>{stream.stream}</option>
                              ))}
                          </select>
                      </div>
                      
                      {/* College Name Dropdown - Spans 2 columns */}
                      <div className="sm:col-span-2">
                          <label htmlFor="clg_id" className="block text-sm font-medium text-gray-700 mb-1">College Name *</label>
                          <select id="clg_id" name="clg_id" value={form.clg_id} onChange={handleChange} required className={inputStyle}>
                              <option value="">Select Your College</option>
                              {colleges.map((college) => (
                                  <option key={college.id} value={college.id}>{college.clg_name}</option>
                              ))}
                          </select>
                      </div>

                      {/* College Code (Read-only) - Spans 2 columns */}
                      <div className="sm:col-span-2">
                          <label htmlFor="clg_code" className="block text-sm font-medium text-gray-700 mb-1">College Code</label>
                          <input id="clg_code" type="text" name="clg_code" value={collegeCode} readOnly placeholder="Code appears here" className={`${inputStyle} bg-gray-50 cursor-not-allowed`} />
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

                  {/* --- Submit Button --- */}
                  <div className="pt-6 flex flex-col items-center">
                      <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full sm:w-80 px-6 py-3 bg-gradient-to-br from-[#2B7ECF] to-[#2DC7DB] text-white font-semibold shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ borderRadius: '8px' }}
                      >
                          {isSubmitting ? "SAVING..." : "SAVE PROFILE"}
                      </button>
                  </div>
              </form>
           
          </div>
           
             <div className="w-full flex justify-center lg:justify-end mt-12 md:mt-20">
              
                <img src="/images/palloti.png" alt="AI Lab Logo" className="h-10" /> 
             </div>
        </div>
        
      </div>
    </div>
  );
}