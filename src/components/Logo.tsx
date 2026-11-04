import Link from "next/link";

export function Logo({ to = "/" }: { to?: "/" | "/app" }) {
  return (
    <Link href={to} className="flex items-center gap-2 font-display text-xl font-bold text-title">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">▶</span>
      Video Speed Reader
    </Link>
  );
}
