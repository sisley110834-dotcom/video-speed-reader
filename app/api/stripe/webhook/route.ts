import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

// The ONLY place that grants purchased credits. Excluded from middleware.ts.
export async function POST(req: Request) {
  const body = await req.text(); // raw bytes: the signature is computed over them
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig) return new NextResponse("no signature", { status: 400 });
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return new NextResponse("webhook not configured", { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("webhook signature verification failed", err);
    return new NextResponse("invalid signature", { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session = event.data.object;
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true, unpaid: true });
  }

  const userId = session.metadata?.user_id;
  const productId = session.metadata?.product_id;
  const credits = Number.parseInt(session.metadata?.credits ?? "", 10);
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (!userId || !productId || !credits || !paymentIntentId) {
    console.error("missing required fields", { session: session.id, userId, productId, credits, paymentIntentId });
    return new NextResponse("missing metadata", { status: 400 });
  }

  const admin = createAdminClient();

  // 1. Ledger row first. The partial UNIQUE index on stripe_payment_intent_id makes
  //    retries and resends no-ops (23505 = unique_violation).
  const { error: insertErr } = await admin.from("credit_transactions").insert({
    user_id: userId,
    amount: credits,
    type: "purchase",
    description: `Purchased ${credits} credits`,
    stripe_payment_intent_id: paymentIntentId,
  });
  if (insertErr) {
    if (insertErr.code === "23505") return NextResponse.json({ received: true, duplicate: true });
    console.error("credit insert failed", insertErr);
    return new NextResponse("db insert failed", { status: 500 });
  }

  // 2. Derived balance. If this fails, the ledger still has the purchase and the
  //    balance can be rebuilt with SUM(amount).
  const { data: profile, error: readErr } = await admin
    .from("profiles")
    .select("credits_balance")
    .eq("id", userId)
    .single();
  if (readErr) {
    console.error("profile read failed", readErr);
    return new NextResponse("profile read failed", { status: 500 });
  }
  const { error: updateErr } = await admin
    .from("profiles")
    .update({ credits_balance: Number(profile.credits_balance) + credits })
    .eq("id", userId);
  if (updateErr) {
    console.error("balance update failed", updateErr);
    return new NextResponse("balance update failed", { status: 500 });
  }

  console.log("credited", { userId, credits, paymentIntentId });
  return NextResponse.json({ received: true, credited: credits });
}
