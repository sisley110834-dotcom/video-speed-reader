import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SignOutButton } from "@/components/SignOutButton";
import { getMyCredits } from "@/lib/credits";

const navLink = "text-sm font-semibold text-primary underline-offset-4 hover:underline";

// Shared header for signed-in pages. Server component: the balance is re-read
// on every server navigation.
export async function AppHeader({ current }: { current?: "app" | "upload" | "credits" }) {
  const credits = await getMyCredits();
  return (
    <header className="bg-meadow border-b">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
        <Logo to="/app" />
        <div className="flex flex-wrap items-center gap-3">
          {current !== "app" && (
            <Link href="/app" className={navLink}>
              Dashboard
            </Link>
          )}
          {current !== "upload" && (
            <Link href="/upload" className={navLink}>
              Upload / 上傳
            </Link>
          )}
          <Link
            href="/credits"
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-card/80 px-3 py-1.5 text-sm backdrop-blur-sm"
          >
            <span>
              Credits: <span className="font-bold">{credits ?? "—"}</span>
            </span>
            <span className="font-semibold text-primary">Buy more</span>
          </Link>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
