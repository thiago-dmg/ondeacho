import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { UserProfile } from "./types";
import { apiRequest } from "./api";
import { setWebToken, WEB_TOKEN_KEY } from "./token";

type AuthState = {
  token: string | null;
  profile: UserProfile | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const saved = localStorage.getItem(WEB_TOKEN_KEY);
    if (saved) {
      setToken(saved);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token || loading) {
      return;
    }
    void (async () => {
      try {
        const me = await apiRequest<UserProfile>("/auth/me");
        setProfile(me);
      } catch {
        setProfile(null);
        setToken(null);
        setWebToken(null);
      }
    })();
  }, [token, loading]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiRequest<{ accessToken: string; user: UserProfile }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), password }),
      skipAuth: true
    });
    setWebToken(res.accessToken);
    setToken(res.accessToken);
    setProfile(res.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await apiRequest<{ accessToken: string; user: UserProfile }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        password
      }),
      skipAuth: true
    });
    setWebToken(res.accessToken);
    setToken(res.accessToken);
    setProfile(res.user);
  }, []);

  const logout = useCallback(() => {
    setWebToken(null);
    setToken(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) {
      return;
    }
    const me = await apiRequest<UserProfile>("/auth/me");
    setProfile(me);
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      profile,
      loading,
      login,
      register,
      logout,
      refreshProfile
    }),
    [token, profile, loading, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
