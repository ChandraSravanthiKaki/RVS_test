import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const DEFAULT_CONFIG = {
  id: 1,
  page_2_components: JSON.stringify(["about_me", "birthdate"]),
  page_3_components: JSON.stringify(["address"]),
};

const mapDbToUi = (arr: string[]) =>
  (arr || []).map((t) => (t === "about_me" ? "about" : t));

export async function GET() {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("admin_config")
    .select("page_2_components, page_3_components")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    const { data: inserted, error: upsertError } = await supabase
      .from("admin_config")
      .insert(DEFAULT_CONFIG)
      .select("page_2_components, page_3_components")
      .single();
    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }
    const parsed = {
      step2_components: mapDbToUi(JSON.parse(inserted.page_2_components)),
      step3_components: mapDbToUi(JSON.parse(inserted.page_3_components)),
    };
    return NextResponse.json(parsed);
  }

  const parsed = {
    step2_components: mapDbToUi(JSON.parse(data.page_2_components)),
    step3_components: mapDbToUi(JSON.parse(data.page_3_components)),
  };
  return NextResponse.json(parsed);
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = supabaseServer();
  const payload = {
    id: 1,
    page_2_components: JSON.stringify(body.step2_components ?? []),
    page_3_components: JSON.stringify(body.step3_components ?? []),
  };
  const { data, error } = await supabase
    .from("admin_config")
    .upsert(payload, { onConflict: "id" })
    .select("page_2_components, page_3_components")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const parsed = {
    step2_components: mapDbToUi(JSON.parse(data!.page_2_components)),
    step3_components: mapDbToUi(JSON.parse(data!.page_3_components)),
  };
  return NextResponse.json(parsed);
}



