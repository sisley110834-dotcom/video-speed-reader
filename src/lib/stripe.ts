import Stripe from "stripe";

// Server-only. Created lazily so `next build` doesn't fail when STRIPE_SECRET_KEY
// isn't set at build time; the route that calls it fails loudly instead.
let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  // Pin the API version so SDK upgrades never change behavior silently.
  client = new Stripe(key, { apiVersion: "2026-08-26.dahlia" });
  return client;
}
