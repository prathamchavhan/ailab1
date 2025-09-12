"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();



export default function CreateProfile() {
     const supabase = createClientComponentClient(); // ✅ inside component
  

  const [form, setForm] = useState({
    roll_no: "",
    email: "",
    name: "",
    stream: "",
    branch: "",
    sem: "",
    section: "",
    department_id: "",
  });

  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Not logged in → redirect to login
        router.push("/login");
        return;
      }

      // Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        // Profile exists → redirect to dashboard
        router.push("/dashboard");
      } else {
        setForm((prev) => ({ ...prev, email: user.email || "" }));
        setLoading(false);
      }
    };

    checkProfile();
  }, [router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("profiles").insert([
      {
        user_id: user.id,
        roll_no: form.roll_no,
        email: form.email,
        name: form.name,
        stream: form.stream,
        branch: form.branch,
        sem: parseInt(form.sem, 10),
        section: form.section,
        department_id: parseInt(form.department_id, 10),
      },
    ]);

    if (error) {
      console.error("Error creating profile:", error.message);
      alert("Profile creation failed: " + error.message);
    } else {
      // Redirect to dashboard after successful profile creation
      router.push("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-96"
      >
        <h2 className="text-xl font-bold mb-4">Create Your Profile</h2>

        {[
          "roll_no",
          "name",
          "stream",
          "branch",
          "sem",
          "section",
          "department_id",
        ].map((field) => (
          <input
            key={field}
            name={field}
            type={field === "sem" || field === "department_id" ? "number" : "text"}
            placeholder={field.replace("_", " ").toUpperCase()}
            value={form[field]}
            onChange={handleChange}
            className="w-full p-2 mb-3 border rounded"
            required
          />
        ))}

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}