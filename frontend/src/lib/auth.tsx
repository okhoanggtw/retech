"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "./api";
import type { User } from "./types";

interface AuthCtx {
  user: User | null; loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (d: { fullName: string; email: string; password: string; phone?: string }) => Promise<User>;
  logout: () => void; refresh: () => Promise<void>;
}
const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) { setUser(null); setLoading(false); return; }
    try { setUser(await api<User>("/api/auth/me")); } catch { setUser(null); }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email: string, password: string) => {
    const r = await api<{ token: string; user: User }>("/api/auth/login", { method: "POST", json: { email, password } });
    setToken(r.token); setUser(r.user); return r.user;
  };
  const register = async (d: { fullName: string; email: string; password: string; phone?: string }) => {
    const r = await api<{ token: string; user: User }>("/api/auth/register", { method: "POST", json: d });
    setToken(r.token); setUser(r.user); return r.user;
  };
  const logout = () => { setToken(null); setUser(null); };

  return <Ctx.Provider value={{ user, loading, login, register, logout, refresh }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
}
