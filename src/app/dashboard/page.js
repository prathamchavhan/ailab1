import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in</div>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Welcome, {profile?.name}</h1>
      <p>Email: {profile?.email}</p>
      <p>Roll No: {profile?.roll_no}</p>
      <p>Stream: {profile?.stream}</p>
      <p>Branch: {profile?.branch}</p>
      <p>Semester: {profile?.sem}</p>
      <p>Section: {profile?.section}</p>
    </div>
  );
}
