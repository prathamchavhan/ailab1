"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, Toaster } from 'sonner';

export default function CallbackPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Step 1: Get the authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.push("/login");
          return;
        }

        // Step 2: Check Premium Access
        const { data: premiumAccess, error: premiumError } = await supabase
          .from("Premium_access")
          .select("access")
          .eq("email", user.email)
          .single();

        if (premiumError || !premiumAccess?.access) {
          toast.error("Access denied. You don't have Premium access.");
          await supabase.auth.signOut();
          router.push("/login?error=access_denied");
          return;
        }

        // Step 3: Check if profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!profile) {
          router.push("/profile/create");
        } else {
          const redirectTo = sessionStorage.getItem("loginRedirect");
          if (redirectTo) {
            sessionStorage.removeItem("loginRedirect");
            router.push(redirectTo);
          } else {
            router.push("/dashboard");
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        toast.error("Something went wrong. Please try again.");
        router.push("/login");
      } finally {
        setCheckingAccess(false);
      }
    };

    handleAuth();
  }, [router, supabase]);

  if (checkingAccess) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column" }}>
        <Toaster position="top-center" reverseOrder={false} />
        <p>Verifying session and permissions...</p>
      </div>
    );
  }

  return null;
}
