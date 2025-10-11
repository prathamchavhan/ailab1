import { createClientForSC } from "@/lib/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  // ✅ Create Supabase server client
  const supabase = createClientForSC();

  const { data } = await supabase.auth.getSession();
  const session = data?.session;

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }

  return null;
}
