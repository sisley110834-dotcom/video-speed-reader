import { createClient } from "@/lib/supabase/server";

// Current user's balance, read through RLS ("Users can view own profile").
// Returns null when signed out or the profile row is missing.
export async function getMyCredits(): Promise<number | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("credits_balance").eq("id", user.id).maybeSingle();
  return data ? Number(data.credits_balance) : null;
}
