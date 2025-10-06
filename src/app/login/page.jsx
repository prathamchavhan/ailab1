"use client";
import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import toast from 'react-hot-toast'; // Ensure you have installed react-hot-toast

export default function LoginPage() {
  const supabase = createClientComponentClient();

  // --- ERROR HANDLING ---
  // This effect runs once when the component loads to check for URL errors.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');

    if (error === 'access_denied') {
      toast.error(
        "Access Denied. Your account does not have permission to log in.",
        {
          duration: 6000,
          position: "top-center",
        }
      );
    } else if (error === 'authentication_failed') {
       toast.error(
        "Authentication failed. Please try logging in again.",
        {
          duration: 6000,
          position: "top-center",
        }
      );
    }
  }, []); // The empty array ensures this effect runs only once on mount.


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
  
  const handleEmailContinue = () => {
      toast.info("Email login is not yet implemented.");
  };

  return (
    <div className="flex h-screen w-full bg-blue-50 font-sans">
      {/* Left Side: Full-height image */}
      <div 
        className="hidden lg:flex w-1/2 bg-cover bg-center" 
        style={{ backgroundImage: 'url("https://placehold.co/1200x1200/21292E/FFFFFF?text=AI+Lab")' }}
      >
        <div 
          className="flex items-center justify-center w-full h-full bg-black bg-opacity-50 p-12"
        >
          <div className="text-white text-center">
            <h1 
              className="text-4xl font-bold mb-4" 
              style={{ textShadow: '0 0 8px rgba(30, 227, 255, 0.6)' }}
            >
               Welcome to the AI Lab.
            </h1>
            <p 
              className="text-xl"
              style={{ textShadow: '0 0 8px rgba(30, 227, 255, 0.6)' }}
            >
             Log in to explore the future of AI and shape what's next.
            </p>
            <div className="mt-10">
              <img
                src="/images/palloti.png"
                alt="Company Logo"
                className="mx-auto w-48 h-auto transform transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Authentication Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Welcome to the </h2>
            <p className="text-gray-500">AI Lab</p>
          </div>
          
          <button
            onClick={handleGoogleLogin}
            className="group flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white py-3 text-gray-700 transition-all duration-300 hover:bg-gray-100 hover:shadow-md"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google icon"
              className="mr-3 h-5 w-5 transition-transform duration-300 group-hover:rotate-12"
            />
            <span className="font-semibold">Continue with Google</span>
          </button>

          <div className="my-6 flex items-center">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-4 text-xs uppercase font-semibold text-gray-400">OR</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          <div className="w-full space-y-4">
             <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email address
                </label>
                <input
                id="email"
                type="email"
                className="w-full rounded-lg border border-gray-300 p-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="u/your-email@domain.com"
                />
            </div>
            <button 
                onClick={handleEmailContinue}
                className="w-full rounded-lg bg-gray-800 py-3 font-semibold text-white transition-all duration-300 hover:bg-gray-900 hover:shadow-lg active:scale-95"
            >
              Continue
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-gray-500">
            By continuing, you agree to our{" "}
            <a href="#" className="font-medium text-blue-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="font-medium text-blue-600 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}