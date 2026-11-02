import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { SignOutButton } from "@/components/SignOutButton";
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
      <header className="bg-meadow border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Logo to="/app" />
          <div className="flex items-center gap-3">
            <Link href="/upload" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card transition hover:opacity-90">
              Upload / 上傳
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
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
