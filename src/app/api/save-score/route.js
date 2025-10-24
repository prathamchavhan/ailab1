// File: app/api/save-score/route.js
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    // CHANGED: Destructure `type` instead of `aptitudeType` to match the frontend
    const { type, level, score } = await request.json(); 
    
    if (!type || !level || score === undefined) {
       return NextResponse.json({ error: 'Missing required fields: type, level, score.' }, { status: 400 });
    }
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
    }
    

    // CHANGED: Use the correct column names: `type`, `level`, and `score`
    const { data, error } = await supabase
      .from('aptitude') // Note: your table is 'aptitude', not 'apptitude'
      .insert({
        type: type,         
        level: level,       // Matches SQL column `level`
        score: score,       // Matches SQL column `score`
        user_id: user.id,
      });

    if (error) {
      console.error('Supabase save error:', error);
      throw new Error(error.message);
    }

    return NextResponse.json({ message: 'Score saved successfully!', data });

  } catch (error) {
    console.error('Save Score API Error:', error);
    return NextResponse.json(
      { error: 'Failed to save the score.' },
      { status: 500 }
    );
  }
}