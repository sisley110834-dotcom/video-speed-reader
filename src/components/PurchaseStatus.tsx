"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Polls /api/credits until the webhook has landed (balance changed) or ~20 s pass.
export function PurchaseStatus({ startBalance }: { startBalance: number }) {
  const router = useRouter();
  const [balance, setBalance] = useState(startBalance);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let tries = 0;
    const id = setInterval(async () => {
      tries += 1;
      try {
        const res = await fetch("/api/credits", { cache: "no-store" });
        if (res.ok) {
          const { credits_balance } = await res.json();
          if (typeof credits_balance === "number" && credits_balance !== startBalance) {
            setBalance(credits_balance);
            setDone(true);
            clearInterval(id);
            router.refresh(); // update the header badge
            return;
          }
        }
      } catch {
        // keep polling
      }
      if (tries >= 10) {
        setDone(true);
        clearInterval(id);
      }
    }, 2000);
    return () => clearInterval(id);
  }, [startBalance, router]);

  return (
    <div className="mt-4 space-y-4">
      <p className="text-lg">
        Balance: <span className="font-bold">{balance}</span> credits
        {!done && <span className="text-muted-foreground"> (updating…)</span>}
      </p>
      {done && balance === startBalance && (
        <p className="text-sm text-muted-foreground">
          Your payment went through. Credits can take a moment to appear; refresh the Credits page in a minute.
        </p>
      )}
      <div className="flex gap-4">
        <Link href="/upload" className="font-semibold text-primary underline-offset-4 hover:underline">
          Transcribe a video
        </Link>
        <Link href="/credits" className="font-semibold text-primary underline-offset-4 hover:underline">
          Back to Credits
        </Link>
      </div>
    </div>
  );
}
