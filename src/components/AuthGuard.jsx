// components/AuthGuard.js
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, Toaster } from 'sonner';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      // Allow unauthenticated access to /login and /auth/callback
      if (pathname === "/login" || pathname === "/auth/callback") {
        setLoading(false);
        return;
      }

      try {
        // 1. Get the authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          // Store the intended path and redirect to login
          if (pathname !== "/") {
            sessionStorage.setItem("loginRedirect", pathname);
          }
          router.push("/login");
          return;
        }

        // 2. Check Premium Access (if user exists)
        const { data: premiumAccess, error: premiumError } = await supabase
          .from("Premium_access")
          .select("access")
          .eq("email", user.email)
          .single();

        if (premiumError || !premiumAccess?.access) {
          // Deny access and sign out
          toast.error("Access denied. You don't have Premium access.");
          await supabase.auth.signOut();
          router.push("/login?error=access_denied");
          return;
        }

        // 3. Check if profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!profile) {
          // Redirect to profile creation if not found
          router.push("/profile/create");
          return;
        }
        
        // 4. Redirect if user is on a forbidden page after login (e.g., /login or /auth/callback)
        if (pathname === "/login" || pathname === "/auth/callback") {
            router.push("/dashboard"); // Redirect logged-in users away from auth pages
            return;
        }

      } catch (err) {
        console.error("AuthGuard error:", err);
        // Handle unexpected errors by redirecting to login
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndProfile();
  }, [router, supabase, pathname]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column", color: 'white' }}>
        <Toaster position="top-center" reverseOrder={false} />
        <p>Verifying session and permissions...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {children}
    </>
  );
}