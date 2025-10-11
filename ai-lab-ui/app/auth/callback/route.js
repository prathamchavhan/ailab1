import { NextResponse } from "next/server";
import { createClientForSC } from "@/lib/utils/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClientForSC();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // ✅ Redirect user after successful authentication
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("❌ Supabase auth error:", error);
  }

  // 🚨 If anything goes wrong, redirect to error page
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
