"use client";
import { useState } from "react";
import { createClient } from "@/lib/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: "select_account", // Always show account chooser
        },
      },
    });
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email for the login link!');
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen w-full bg-blue-50">
      {/* Left Side: Full-height image */}
      <div 
        className="hidden lg:flex w-1/2 bg-cover bg-center" 
        style={{ backgroundImage: 'url("/images/login-background.jpg")' }}
      >
        <div 
          className="flex items-center justify-center w-full h-full bg-opacity-40 p-12" 
          style={{ backgroundColor: '#21292E' }}
        >
          <div className="text-white text-center">
            <h1 
              className="text-4xl font-bold mb-4 font-sans" 
              style={{ textShadow: '0 0 5px rgba(30, 227, 255, 0.4), 0 0 10px rgba(30, 227, 255, 0.2)' }}
            >
               Welcome to the AI Lab.
            </h1>
            <p 
              className="text-xl font-sans"
              style={{ textShadow: '0 0 5px rgba(30, 227, 255, 0.4), 0 0 10px rgba(30, 227, 255, 0.2)' }}
            >
             Log in to explore the future of AI and shape what's next.
            </p>
            <div className="mt-8">
              <img
                src="/images/palloti.png"
                alt="Jobsline App Mockup"
                className="mx-auto w-200 h-70 transform transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Authentication Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-sm">
          <h2 className="text-3xl font-bold text-center mb-2 text-black">Welcome to the </h2>
          <p className="text-gray-500 text-center mb-8">Ai Lab</p>
          <button
            onClick={handleGoogleLogin}
            className="group flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white py-3 text-gray-700 transition-colors duration-200 hover:bg-gray-50"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google icon"
              className="mr-3 h-5 w-5"
            />
            <span className="font-semibold">Continue with Google</span>
          </button>
          <div className="my-6 flex items-center">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-4 text-gray-500">OR</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>
          <form onSubmit={handleEmailLogin} className="w-full">
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email address"
              required
            />
            <button type="submit" disabled={loading} className="mt-4 w-full rounded-lg bg-black py-3 font-semibold text-white transition-colors duration-200 hover:bg-gray-800 disabled:opacity-50">
              {loading ? 'Sending...' : 'Continue with Email'}
            </button>
            {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
          </form>
          <p className="mt-6 text-center text-xs text-gray-500">
            By continuing, you agree to Jobsline's{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}