"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AuthState = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({ user: null, loading: true });

/**
 * ブラウザ側でSupabaseのログイン状態を追跡する。
 * proxy.ts がセッションcookieを更新し、ここではその状態を購読する。
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setUser(data.user ?? null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
