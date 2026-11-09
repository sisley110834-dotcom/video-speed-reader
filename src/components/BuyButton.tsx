"use client";

import { useState } from "react";

// Module-level flag: one checkout at a time across every Buy button on the page.
let inFlight = false;

export function BuyButton({ productId }: { productId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    if (inFlight) return;
    inFlight = true;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.url) throw new Error(body.error ?? "Checkout failed");
      window.location.href = body.url; // keep the button disabled while Stripe loads
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      inFlight = false;
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        onClick={buy}
        disabled={busy}
        className="w-full rounded-md bg-primary py-2.5 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
      >
        {busy ? "Opening checkout…" : "Buy"}
      </button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
