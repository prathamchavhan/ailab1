import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Handles the initial OAuth callback from Supabase after a user logs in.
 * This function is responsible for the core login flow.
 * - It exchanges the auth code for a user session.
 * - It verifies the user has premium access before allowing them to proceed.
 * - For new, approved users, it redirects to the profile creation page.
 * - For returning, approved users, it redirects to the main dashboard.
 */
export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const supabase = createRouteHandlerClient({ cookies });

  // If a verification code is present, exchange it for a session.
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Get the currently authenticated user from the session.
  const { data: { user } } = await supabase.auth.getUser();

  // If no user is authenticated, redirect back to the login page with an error.
  if (!user) {
    console.error("Auth callback error: User not found after code exchange.");
    return NextResponse.redirect(new URL('/login?error=authentication_failed', request.url), { status: 302 });
  }

  // --- ACCESS VERIFICATION AT LOGIN ---
  // Verify the user has premium access before allowing them further into the application.
  const { data: premiumAccess, error: premiumError } = await supabase
    .from('Premium_access')
    .select('access')
    .eq('email', user.email)
    .single();
  
  // Deny login if:
  // 1. There was an error fetching their access status.
  // 2. The user does not exist in the 'Premium_access' table.
  // 3. Their 'access' flag is explicitly set to false or is null.
  if (premiumError || !premiumAccess || !premiumAccess.access) {
    await supabase.auth.signOut(); // Ensure the user is fully logged out.
    return NextResponse.redirect(new URL('/login?error=access_denied', request.url), { status: 302 });
  }
  
  // --- PROFILE CHECK FOR APPROVED USERS ---
  // For users with verified access, check if they have already created a profile.
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  // Redirect the user based on whether a profile exists.
  if (profile) {
    // An approved, returning user is sent directly to the dashboard.
    return NextResponse.redirect(new URL('/dashboard', request.url), { status: 302 });
  } else {
    // An approved, new user is sent to the profile creation page.
    return NextResponse.redirect(new URL('/profile/create', request.url), { status: 302 });
  }
}


/**
 * Handles the POST request to create a new user profile.
 * This function performs authentication, permission checks, and database insertion.
 * It's called when a new user submits their profile form.
 */
export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies });

  // Step 1: Authenticate the user making the request.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Authentication required. Please log in.' },
      { status: 401 } // 401 Unauthorized
    );
  }

  // Step 2: Verify user permissions from the 'Premium_access' table again as a security measure.
  const { data: premiumUser, error: premiumCheckError } = await supabase
    .from('Premium_access')
    .select('access')
    .eq('email', user.email)
    .single();

  // Handle potential database errors during the permission check.
  // We ignore the 'PGRST116' error code because it means no user was found, which we handle next.
  if (premiumCheckError && premiumCheckError.code !== 'PGRST116') {
    console.error('API Error [POST /auth/callback]: Checking premium access failed.', premiumCheckError.message);
    return NextResponse.json({ success: false, message: 'Server error while verifying permissions.' }, { status: 500 });
  }

  // Deny access if the user isn't in the premium table or their access is disabled.
  if (!premiumUser || !premiumUser.access) {
    return NextResponse.json(
      { success: false, message: 'Your account does not have permission to create a profile.' },
      { status: 403 } // 403 Forbidden
    );
  }

  // Step 3: Get profile data from the request body and insert it into the 'profiles' table.
  const profileData = await request.json();

  const { error: insertError } = await supabase.from('profiles').insert({
    user_id: user.id,   // Link to the authenticated user
    email: user.email,  // Add the user's email for consistency
    ...profileData,     // Spread the rest of the form data (name, roll_no, etc.)
  });

  // Handle potential errors during the database insert operation.
  if (insertError) {
    console.error('API Error [POST /auth/callback]: Inserting profile failed.', insertError.message);
    // Handle the specific error for duplicate profiles (unique constraint violation).
    if (insertError.code === '23505') {
       return NextResponse.json({ success: false, message: 'A profile with these details already exists.' }, { status: 409 }); // 409 Conflict
    }
    // Handle all other insertion errors with a generic server error message.
    return NextResponse.json({ success: false, message: 'Failed to save profile to the database.' }, { status: 500 });
  }

  // Step 4: If everything is successful, return a success response.
  return NextResponse.json({ success: true, message: 'Profile created successfully!' });
}