import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { AppHeader } from "@/components/AppHeader";
import { BuyButton } from "@/components/BuyButton";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Credits — Video Speed Reader",
  description: "Your credit balance, credit packs and history.",
};

const txStyles: Record<string, string> = {
  purchase: "bg-green-100 text-green-800",
  signup_bonus: "bg-yellow-100 text-yellow-800",
  admin_grant: "bg-yellow-100 text-yellow-800",
  deduction: "bg-gray-200 text-gray-700",
};

const usd = (n: number) => `$${n.toFixed(2)}`;

export default async function CreditsPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const { canceled } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const [{ data: profile }, { data: products }, { data: transactions }] = await Promise.all([
    supabase.from("profiles").select("credits_balance").eq("id", user.id).maybeSingle(),
    supabase
      .from("credit_products")
      .select("id, name, credits, price_usd")
      .eq("active", true)
      .order("price_usd"),
    supabase
      .from("credit_transactions")
      .select("id, amount, type, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const tiers = (products ?? []).map((p) => ({
    ...p,
    credits: Number(p.credits),
    price: Number(p.price_usd),
    perCredit: Number(p.price_usd) / Number(p.credits),
  }));
  // Baseline = the smallest pack; bonus % is measured against its $/credit.
  const baseline = tiers.reduce<(typeof tiers)[number] | null>(
    (min, t) => (!min || t.credits < min.credits ? t : min),
    null,
  );

  return (
    <div className="min-h-screen">
      <AppHeader current="credits" />
      <main className="mx-auto max-w-4xl space-y-10 px-5 py-14">
        {canceled && (
          <p className="rounded-md border bg-card/85 p-4 text-sm text-muted-foreground">
            Checkout was canceled. You weren&apos;t charged.
          </p>
        )}

        <section className="rounded-xl border bg-card/85 p-8 shadow-card backdrop-blur-sm">
          <p className="text-sm font-medium text-muted-foreground">Your balance</p>
          <p className="mt-1 text-5xl font-bold">
            {profile ? Number(profile.credits_balance) : "—"}{" "}
            <span className="text-2xl font-semibold text-muted-foreground">credits</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">1 credit = 1 minute of video (rounded up).</p>
        </section>

        <section>
          <h1 className="text-3xl font-bold md:text-4xl">Buy credits</h1>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {tiers.map((t) => {
              const bonusPct = baseline ? Math.round((1 - t.perCredit / baseline.perCredit) * 100) : 0;
              return (
                <div key={t.id} className="flex flex-col rounded-xl border bg-card/90 p-6 shadow-card backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-xl font-bold">{t.name}</h2>
                    {bonusPct > 0 && (
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-800">
                        +{bonusPct}%
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-3xl font-bold">{usd(t.price)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{usd(t.perCredit)} per credit</p>
                  <div className="mt-6 flex-1" />
                  <BuyButton productId={t.id} />
                </div>
              );
            })}
          </div>
          {tiers.length === 0 && <p className="mt-6 text-muted-foreground">No credit packs are available right now.</p>}
        </section>

        <section>
          <h2 className="text-2xl font-bold md:text-3xl">History</h2>
          <div className="mt-6 overflow-x-auto rounded-xl border bg-card/85 shadow-card backdrop-blur-sm">
            {!transactions || transactions.length === 0 ? (
              <p className="p-6 text-muted-foreground">No transactions yet.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 text-right font-medium">Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const amount = Number(tx.amount);
                    return (
                      <tr key={tx.id} className="border-b last:border-0">
                        <td className="whitespace-nowrap px-4 py-3">{format(new Date(tx.created_at), "yyyy-MM-dd HH:mm")}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${txStyles[tx.type] ?? txStyles.deduction}`}>
                            {tx.type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">{tx.description}</td>
                        <td className="px-4 py-3 text-right font-mono">{amount > 0 ? `+${amount}` : amount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
