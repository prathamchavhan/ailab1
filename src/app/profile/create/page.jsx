"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function CreateProfilePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [form, setForm] = useState({
    roll_no: "",
    name: "",
    branch: "",
    sem: "",
    department_id: "",
    stream_id: "",
  });

  const [streams, setStreams] = useState([]);
  const [departments, setDepartments] = useState([]);

  // ... (Your existing functions: handleChange, fetchStreams, fetchDepartments, useEffects, handleSubmit)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const fetchStreams = useCallback(async () => {
    const { data, error } = await supabase.from('stream').select('id, stream');
    if (error) {
      console.error('Error fetching streams:', error.message);
    } else {
      setStreams(data);
    }
  }, [supabase]);

  const fetchDepartments = useCallback(async (streamId) => {
    if (!streamId) {
      setDepartments([]);
      return;
    }
    const { data, error } = await supabase.from('department').select('id, name').eq('stream_id', streamId);
    if (error) {
      console.error('Error fetching departments:', error.message);
    } else {
      setDepartments(data);
    }
  }, [supabase]);

  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  useEffect(() => {
    if (form.stream_id) {
      fetchDepartments(form.stream_id);
    }
    // Reset department when stream changes
    setForm(prevForm => ({ ...prevForm, department_id: "" }));
  }, [form.stream_id, fetchDepartments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("profiles").insert([
      {
        user_id: user.id,
        roll_no: form.roll_no,
        email: user.email,
        name: form.name,
        branch: form.branch,
        sem: parseInt(form.sem, 10),
        department_id: parseInt(form.department_id, 10),
        stream_id: parseInt(form.stream_id, 10),
      },
    ]);

    if (error) {
      console.error("Error creating profile:", error.message);
      alert("Profile creation failed: " + error.message);
    } else {
      router.push("/dashboard");
    }
  };


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
    <div className="min-h-screen bg-white text-black flex flex-col items-center p-8">
      {/* Top Left Logo */}
      <div className="absolute top-8 left-8">
        <img src="/images/palloti.png" alt="AI Lab Logo" className="h-30 w-80" />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col items-center pt-20 w-full max-w-5xl">
        
        {/* "Create Your Profile" Box */}
        <div className="mb-16 cursor-pointer transition-all duration-300 scale-80" style={gradientOuterStyle}>
          {/* ✅ CHANGE 1: Further reduced padding and font size */}
          <div className="px-8 py-3" style={innerBoxStyle}>
            <h1 
              className="text-lg font-bold text-center"
              style={{
                background: 'linear-gradient(to right, #1ee3ff, #6f5af8)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Create Your Profile
            </h1>
          </div>
        </div>

        {/* The form */}
        <form onSubmit={handleSubmit} className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
          {/* Input Fields */}
          {[
            { label: "FULL NAME -", name: "name", type: "text", value: form.name },
            { label: "ROLL NO -", name: "roll_no", type: "text", value: form.roll_no },
            { label: "BRANCH -", name: "branch", type: "text", value: form.branch },
            { label: "SEMESTER -", name: "sem", type: "number", value: form.sem },
          ].map((field) => (
            <div key={field.name} className="h-16 flex items-center" style={gradientOuterStyle}>
              <div className="relative w-full h-full" style={innerBoxStyle}>
                <label htmlFor={field.name} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 text-base font-bold">
                  {field.label}
                </label>
                <input
                  id={field.name}
                  type={field.type}
                  name={field.name}
                  value={field.value}
                  onChange={handleChange}
                  required
                  className="w-full h-full bg-transparent pl-40 pr-4 text-gray-800 text-lg focus:outline-none text-right"
                />
              </div>
            </div>
          ))}

          {/* Stream Dropdown */}
          <div className="h-16 flex items-center" style={gradientOuterStyle}>
            <div className="relative w-full h-full" style={innerBoxStyle}>
              <label htmlFor="stream_id" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 text-base font-bold">
                STREAM -
              </label>
              <select
                id="stream_id"
                name="stream_id"
                value={form.stream_id}
                onChange={handleChange}
                required
                className="w-full h-full bg-transparent pl-40 pr-4 text-gray-800 text-lg focus:outline-none text-right"
              >
                <option value="">Select Stream</option>
                {streams.map((stream) => (
                  <option key={stream.id} value={stream.id}>
                    {stream.stream}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Department Dropdown */}
          <div className="h-16 flex items-center" style={gradientOuterStyle}>
            <div className="relative w-full h-full" style={innerBoxStyle}>
              <label htmlFor="department_id" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 text-base font-bold">
                DEPARTMENT -
              </label>
              <select
                id="department_id"
                name="department_id"
                value={form.department_id}
                onChange={handleChange}
                required
                disabled={!form.stream_id} 
                className="w-full h-full bg-transparent pl-40 pr-4 text-gray-800 text-lg focus:outline-none text-right"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Save Profile Button */}
          <div className="md:col-span-2 flex justify-center mt-12">
            {/* ✅ CHANGE 2: Added glowing shadow effect on hover */}
            <button
              type="submit"
              className="group w-1/3 p-0.5 font-semibold transition-all duration-300 ease-out   cursor-pointer"
              style={gradientOuterStyle}
            >
             <div 
  // ✅ UPDATED: The background now becomes a gradient on hover
  className="w-full h-full p-3 flex justify-center items-center bg-white rounded-[1.3rem] group-hover:bg-gradient-to-r group-hover:from-[#1ee3ff] group-hover:to-[#6f5af8] transition-all duration-300"
>
  <span 
    // ✅ UPDATED: The text now properly becomes solid white on hover
    className="text-xl font-bold bg-gradient-to-r from-[#1ee3ff] to-[#6f5af8] bg-clip-text text-transparent group-hover:bg-none group-hover:text-white transition-colors duration-300"
  >
    SAVE PROFILE
  </span>
</div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}