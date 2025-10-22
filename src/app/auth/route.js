import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await req.json();

    // Validate required fields
    const requiredFields = ["name", "surname", "sem", "department_id", "stream_id", "clg_id"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

   
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ message: "User not authenticated" }, { status: 401 });
    }

    // Insert profile data
    const { error: insertError } = await supabase.from("profiles").insert([
      {
        user_id: user.id,
        email: user.email,
        name: body.name,
        surname: body.surname,
        sem: parseInt(body.sem, 10),
        department_id: parseInt(body.department_id, 10),
        stream_id: parseInt(body.stream_id, 10),
        clg_id: parseInt(body.clg_id, 10),
        access: true, // default true
      },
    ]);

    if (insertError) {
      console.error("Error inserting profile:", insertError);
      return NextResponse.json(
        { message: "Failed to save profile", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Profile created successfully" }, { status: 200 });
  } catch (error) {
    console.error("Unexpected server error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
