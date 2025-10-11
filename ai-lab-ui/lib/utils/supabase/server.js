import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** ✅ Use in Server Components or Pages (e.g. app/page.jsx) */
export function createClientForSC() {
  const cookieStore = cookies(); // synchronous in Server Components

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (err) {
            console.error("Cookie set error:", err);
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (err) {
            console.error("Cookie remove error:", err);
          }
        },
      },
    }
  );
}

/** ✅ Use in Route Handlers (e.g. app/api/*) */
export async function createClientForRoute() {
  const cookieStore = await cookies(); // async usage in routes

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (err) {
            console.error("Cookie set error:", err);
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (err) {
            console.error("Cookie remove error:", err);
          }
        },
      },
    }
  );
}
