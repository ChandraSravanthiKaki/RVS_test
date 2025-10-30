import { createClient } from "@supabase/supabase-js";

// Use anon key so you don't need the service role key locally.
// Make sure RLS is disabled on the used tables or add permissive policies.
export const supabaseServer = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );



