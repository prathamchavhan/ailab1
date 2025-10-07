// File: src/lib/supabaseServer.js
import { createClient } from '@supabase/supabase-js'

// Note: This client is for SERVER-SIDE use only, as it uses the service_role key.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    }
  }
)