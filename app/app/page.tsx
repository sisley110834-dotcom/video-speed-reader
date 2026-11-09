import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard — Video Speed Reader",
  description: "Your Video Speed Reader dashboard.",
};

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  return (
    <div className="min-h-screen">
      <AppHeader current="app" />
      <main className="mx-auto max-w-3xl px-5 py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold md:text-4xl break-words">Hi {user.email}</h1>
        <div className="mt-8 rounded-xl border bg-card/85 p-8 shadow-card backdrop-blur-sm">
          <p className="text-lg text-muted-foreground">
            Submit a video on the{" "}
            <Link href="/upload" className="font-semibold text-primary underline-offset-4 hover:underline">
              Upload
            </Link>{" "}
            page to get a transcript.
          </p>
        </div>
      </main>
    </div>
  );
}
