import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isSignup = mode === "signup";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { data, error } = isSignup
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(error.message);
    if (!data.session) return setError("Check your email to confirm your account.");
    navigate({ to: "/app" });
  }

  const input = "w-full rounded-md border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring";
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-card p-7 shadow-card">
          <h1 className="text-2xl font-bold">{isSignup ? "Create account / 註冊" : "Sign in / 登入"}</h1>
          <label className="block text-sm font-medium">Email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-1 ${input}`} />
          </label>
          <label className="block text-sm font-medium">Password
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={`mt-1 ${input}`} />
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button disabled={busy} className="w-full rounded-md bg-primary py-2.5 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
            {busy ? "Please wait…" : isSignup ? "Sign up" : "Sign in"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account? " : "New here? "}
            <Link to={isSignup ? "/signin" : "/signup"} className="font-semibold text-primary underline-offset-4 hover:underline">
              {isSignup ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
