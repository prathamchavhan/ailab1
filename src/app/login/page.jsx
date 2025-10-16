"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function LoginPageContent() {
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Store redirect parameter in sessionStorage if present
    const redirectTo = searchParams.get("redirect");
    if (redirectTo) {
      sessionStorage.setItem("loginRedirect", redirectTo);
    }
  }, [searchParams]);

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

  return (
     <div className="flex h-screen w-full font-sans">
   
<div className="hidden lg:flex flex-col w-1/2 bg-white p-12 ">

  {/* Top Text */}
  <div className="mt-10">
   <p className="text-5xl font-bold mb-2 leading-tight bg-gradient-to-r from-[#2B7ECF] to-[#2DC7DB] bg-clip-text text-transparent [text-shadow:2px_2px_4px_rgba(0,0,0,0.2)]">
  Welcome to the AI Lab
</p>
    <p className="text-lg text-gray-700">
      Log in to explore the future of AI and shape what's next.
    </p>
  
  </div>
  
  
  {/* Bottom Logo */}
  <div className="mt-8"> {/* You can add a small margin-top like mt-8 for controlled spacing */}
    <img 
      src="/images/Ai LAB.gif" 
      alt="AI Lab Animated Logo" 
      className="w-full h-auto max-h-[300px] rounded-lg object-cover "
    />
  </div>
 
</div>

      {/* Right Side: Dark background with login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-[#1B1C1E] overflow-y-auto">
        <div className="w-full max-w-sm text-center">
          <p className="text-xl text-gray-300 mb-8">
            Step into the <span className="font-bold text-[#2DC7DB] underline ">Future</span> with AI Lab
          </p>
          <p className="text-gray-400 mb-6">Sign in to continue</p>
   <button
  onClick={handleGoogleLogin}
  className="group mb-4 flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white py-3 px-4 transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
  style={{ borderRadius: '8px' }} // <-- This line adds the curve
>
  {/* Corrected Colorful Google Logo SVG */}
  <svg
    className="mr-3 h-5 w-5"
    aria-hidden="true"
    focusable="false"
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
  <span className="font-semibold text-black">Login with Google</span>
</button>
          {/* Removed "OR" separator and email login form as they are not in Image 1 */}
          
         <p className="mt-12 text-center text-xs text-white">
  By continuing, you agree to our{" "}
  <a href="#" className="font-medium text-[#2DC7DB] hover:underline">
    Terms of Service
  </a>{" "}
  and{" "}
  <a href="#" className="font-medium text-[#2DC7DB] hover:underline">
    Privacy Policy
  </a>.
</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
