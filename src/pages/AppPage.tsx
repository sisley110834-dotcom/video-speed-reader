import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { useAuthUser } from "@/components/RequireAuth";
import { usePageMeta } from "@/hooks/use-page-meta";


export default function AppPage() {
  usePageMeta({ title: "Dashboard — Video Speed Reader", description: "Your Video Speed Reader dashboard." });
  const user = useAuthUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate("/signin", { replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Logo to="/app" />
          <button onClick={signOut} className="rounded-md border border-navy-muted/40 px-4 py-2 text-sm font-semibold transition hover:bg-primary hover:text-primary-foreground">
            Sign out / 登出
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold md:text-4xl break-words">Hi {user.email}</h1>
        <div className="mt-8 rounded-xl border bg-card p-8 shadow-card">
          <p className="text-lg text-muted-foreground">
            Your dashboard is coming soon. Upload functionality will be added in the next milestone.
          </p>
        </div>
      </main>
    </div>
  );
}
