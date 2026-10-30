import { Link } from "@tanstack/react-router";

export function Logo({ to = "/" }: { to?: "/" | "/app" }) {
  return (
    <Link to={to} className="flex items-center gap-2 font-display text-lg font-bold">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">▶</span>
      Video Speed Reader
    </Link>
  );
}
