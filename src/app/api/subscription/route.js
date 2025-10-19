import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  // Get the current user session
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: 'Unauthorized: Please log in.' }, { status: 401 });
  }

  // Securely fetch the subscription record matching the user's EMAIL
  const { data, error } = await supabase
    .from('Premium_access')
    .select('start_date, end_date')
    .eq('email', user.email) // Using email for the lookup
    .single();

  if (error) {
    // If no record is found, it's not an error. Just return null.
    if (error.code === 'PGRST116') {
      return NextResponse.json(null, { status: 200 });
    }
    // For actual database errors, return a server error
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the found subscription data
  return NextResponse.json(data, { status: 200 });
}