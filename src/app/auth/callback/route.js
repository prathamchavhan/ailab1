"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function CallbackPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        router.push("/login");
        return;
      }

      const user = data.session?.user;
      if (!user) {
        router.push("/login");
        return;
      }

      // Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) {
        router.push("/profile/create");
      } else {
        router.push("/dashboard");
      }
    };

    handleAuth();
  }, [router, supabase]);

  return <p>Redirecting...</p>;
}
