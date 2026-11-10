import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: the signed-in user's balance (used by /credits/success polling).
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase.from("profiles").select("credits_balance").eq("id", user.id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ credits_balance: data ? Number(data.credits_balance) : 0 });
}
