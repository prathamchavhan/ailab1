"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      }
    };
    checkUser();
  }, [router, supabase]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/login");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center flex-col">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Dashboard!</h1>
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-6 py-3 rounded"
      >
        Sign Out
      </button>
    </div>
  );
}