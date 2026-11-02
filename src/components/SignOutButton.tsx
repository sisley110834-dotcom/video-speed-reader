"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/signin");
    router.refresh();
  }

  return (
    <button onClick={signOut} className="rounded-md border border-primary/40 bg-card/70 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition hover:bg-primary hover:text-primary-foreground">
      Sign out / 登出
    </button>
  );
}
