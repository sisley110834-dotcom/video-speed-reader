import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { PurchaseStatus } from "@/components/PurchaseStatus";
import { getMyCredits } from "@/lib/credits";

export const metadata: Metadata = { title: "Payment received — Video Speed Reader" };

// UX only. This page never grants credits: the Stripe webhook is the only writer.
export default async function CreditsSuccessPage() {
  const credits = await getMyCredits();
  if (credits === null) redirect("/signin");
  return (
    <div className="min-h-screen">
      <AppHeader current="credits" />
      <main className="mx-auto max-w-2xl px-5 py-20">
        <div className="rounded-xl border bg-card/85 p-8 shadow-card backdrop-blur-sm">
          <h1 className="text-3xl font-bold">Thanks for your purchase!</h1>
          <PurchaseStatus startBalance={credits} />
        </div>
      </main>
    </div>
  );
}
