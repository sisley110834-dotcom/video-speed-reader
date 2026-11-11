"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Re-renders the current server page every `intervalMs` while `active` is true,
// so job statuses (and the credits badge) update without a manual reload.
// Pauses while the tab is hidden.
export function AutoRefresh({
  active,
  intervalMs = 5000,
}: {
  active: boolean;
  intervalMs?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    const tick = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const id = setInterval(tick, intervalMs);
    const onVisible = () => document.visibilityState === "visible" && router.refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [active, intervalMs, router]);

  return null;
}
