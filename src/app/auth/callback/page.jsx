"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CallbackPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleAuth = async () => {
      // Step 1: Get the current authenticated user.
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      // If there's no user or an error occurred, redirect to login.
      if (userError || !user) {
        router.push("/login");
        return;
      }

      // --- PREMIUM ACCESS VERIFICATION ---
      // Step 2: Check if the user has permission from the 'Premium_access' table.
      const { data: premiumAccess, error: premiumError } = await supabase
        .from('Premium_access')
        .select('access')
        .eq('email', user.email)
        .single(); // Expecting only one row for the user's email.

      // Deny entry if:
      // - There was an error fetching the data.
      // - The user's email is not in the table.
      // - The 'access' column is false.
      if (premiumError || !premiumAccess?.access) {
        console.error("Access denied for user:", user.email);
        // CRITICAL: Immediately sign the user out to clear their session.
        await supabase.auth.signOut();
        // Redirect to the login page with a specific error to display a message.
        router.push("/login?error=access_denied");
        return; // Stop any further execution.
      }

      // --- PROFILE CHECK (Only runs if access is granted) ---
      // Step 3: Check if the authorized user has already created a profile.
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      // Step 4: Redirect the user based on whether a profile exists.
      if (!profile) {
        // User has access but needs to create a profile.
        router.push("/profile/create");
      } else {
        // User has access and a profile, proceed into the app.
        // Check for a redirect URL that might have been stored before login.
        const redirectTo = sessionStorage.getItem("loginRedirect");
        if (redirectTo) {
          sessionStorage.removeItem("loginRedirect");
          router.push(redirectTo);
        } else {
          // Default to the main dashboard if no specific redirect is set.
          router.push("/dashboard");
        }
      }
    };

    handleAuth();
  }, [router, supabase]);

  // Render a loading message to the user while the async checks are in progress.
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <p>Verifying session and permissions...</p>
    </div>
  );
}