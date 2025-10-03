"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function CreateProfile() {
  const [profile, setProfile] = useState({
    roll_no: '',
    email: '',
    name: '',
    sem: '',
    section: '',
    department_id: '',
    assignment_id: '',
    aptitude_id: '',
    stream_id: '',
    branch: '',
    clg_id: '',
  });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfile(p => ({
          ...p,
          email: user.email || '',
          name: user.user_metadata?.full_name || '',
        }));
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { error } = await supabase.from('profiles').insert({
      user_id: user.id,
      ...profile,
      sem: parseInt(profile.sem, 10),
      department_id: parseInt(profile.department_id, 10),
      assignment_id: profile.assignment_id ? parseInt(profile.assignment_id, 10) : null,
      aptitude_id: profile.aptitude_id ? parseInt(profile.aptitude_id, 10) : null,
      stream_id: profile.stream_id ? parseInt(profile.stream_id, 10) : null,
      clg_id: profile.clg_id ? parseInt(profile.clg_id, 10) : null,
    });

    if (error) {
      alert('Error creating profile: ' + error.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4">Create Your Profile</h1>
        <div className="grid grid-cols-2 gap-4">
          <InputField name="name" label="Full Name" value={profile.name} onChange={handleChange} required />
          <InputField name="email" label="Email" value={profile.email} onChange={handleChange} required disabled />
          <InputField name="roll_no" label="Roll No" value={profile.roll_no} onChange={handleChange} required />
          <InputField name="sem" label="Semester" value={profile.sem} onChange={handleChange} required type="number" />
          <InputField name="section" label="Section" value={profile.section} onChange={handleChange} />
          <InputField name="branch" label="Branch" value={profile.branch} onChange={handleChange} />
          <InputField name="department_id" label="Department ID" value={profile.department_id} onChange={handleChange} required type="number" />
          <InputField name="clg_id" label="College ID" value={profile.clg_id} onChange={handleChange} type="number" />
          <InputField name="assignment_id" label="Assignment ID" value={profile.assignment_id} onChange={handleChange} type="number" />
          <InputField name="aptitude_id" label="Aptitude ID" value={profile.aptitude_id} onChange={handleChange} type="number" />
          <InputField name="stream_id" label="Stream ID" value={profile.stream_id} onChange={handleChange} type="number" />
        </div>
        <button
          onClick={handleCreateProfile}
          className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
}

const InputField = ({ name, label, value, onChange, required, disabled, type = 'text' }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
    />
  </div>
);