// import { cookies } from 'next/headers'
// import { NextResponse } from 'next/server'
// import { createClient } from '@/lib/utils/supabase/server'

// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url)
//   const code = searchParams.get('code')
//   // if "next" is in param, use it as the redirect URL
//   const next = searchParams.get('next') ?? '/'

//   if (code) {
//     const cookieStore = cookies()
//     const supabase = createClient(cookieStore)
//     const { error } = await supabase.auth.exchangeCodeForSession(code)
//     if (!error) {
//       return NextResponse.redirect(`${origin}${next}`)
//     }
//   }

//   // return the user to an error page with instructions
//   return NextResponse.redirect(`${origin}/auth/auth-code-error`)
// }
import { NextResponse } from "next/server";
import { createClientForSC } from "@/lib/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClientForSC(); // 👈 use new helper
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // ✅ redirect user after successful auth
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("❌ Supabase auth error:", error);
  }

  // 🚨 if anything goes wrong → redirect to error page
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
