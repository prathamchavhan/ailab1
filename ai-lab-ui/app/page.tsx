import { createClientForSC } from '@/lib/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  // 👇 use the new helper name
  const supabase = createClientForSC()

  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }

  return null
}
