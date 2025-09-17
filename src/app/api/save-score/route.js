// File: app/api/save-score/route.js
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { aptitudeType, level, score } = await request.json();
    
    // Create a Supabase client that can get the current user's session
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the current logged-in user's data
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
    }

    // Map difficulty string to an integer
    const levelMap = { easy: 1, medium: 2, hard: 3 };
    const levelInt = levelMap[level.toLowerCase()] || 0;

    // Insert the score into the database
    const { data, error } = await supabase
      .from('apptitude')
      .insert({
        apptitude_type: aptitudeType,
        levels: levelInt,
        scores: score,
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