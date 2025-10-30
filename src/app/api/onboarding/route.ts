import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  const supabase = supabaseServer();
  const body = await request.json();
  // Expected body: { userId?, email, password?, step, about?, address?, birthdate? }

  if (body.userId) {
    const { data, error } = await supabase
      .from("users")
      .update({
        email: body.email,
        password: body.password ?? undefined,
        current_step: body.step,
        about_me: body.about ?? null,
        street_address: body.address?.street ?? null,
        city: body.address?.city ?? null,
        state: body.address?.state ?? null,
        zip: body.address?.zip ?? null,
        birthdate: body.birthdate ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.userId)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from("users")
    .insert({
      email: body.email,
      password: body.password ?? null,
      current_step: body.step,
      about_me: body.about ?? null,
      street_address: body.address?.street ?? null,
      city: body.address?.city ?? null,
      state: body.address?.state ?? null,
      zip: body.address?.zip ?? null,
      birthdate: body.birthdate ?? null,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", Number(userId))
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}



