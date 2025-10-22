import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

 
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: 'Unauthorized: Please log in.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('Premium_access')
    .select('start_date, end_date')
    .eq('email', user.email)
    .single();

  if (error) {

    if (error.code === 'PGRST116') {
      return NextResponse.json(null, { status: 200 });
    }
  
    return NextResponse.json({ error: error.message }, { status: 500 });
  }


  return NextResponse.json(data, { status: 200 });
}