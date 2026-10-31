import { useEffect, useState } from "react";
import { Navigate, Outlet, useOutletContext } from "react-router";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthState =
  { status: "loading" } | { status: "signed-out" } | { status: "signed-in"; user: User };

export function RequireAuth() {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      setState(data.user ? { status: "signed-in", user: data.user } : { status: "signed-out" });
    };
    check();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") check();
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (state.status === "loading") return null;
  if (state.status === "signed-out") return <Navigate to="/signin" replace />;
  return <Outlet context={{ user: state.user } satisfies AuthContext} />;
}

export type AuthContext = { user: User };

export function useAuthUser(): User {
  return useOutletContext<AuthContext>().user;
}
