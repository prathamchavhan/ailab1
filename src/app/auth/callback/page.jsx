"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CallbackPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/login");
        return;
      }

      // Check if this user has a profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) {
        router.push("/profile/create");
      } else {
        // Check for redirect parameter in sessionStorage (set during login)
        const redirectTo = sessionStorage.getItem("loginRedirect");
        if (redirectTo) {
          sessionStorage.removeItem("loginRedirect");
          router.push(redirectTo);
        } else {
          router.push("/dashboard");
        }
      }
    };

    handleAuth();
  }, [router, supabase]);

  return <p>Redirecting...</p>;
}
