"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ensureUserSetup, subscribeFoods, subscribeProfile, subscribeWeights } from "@/lib/db";
import { auth } from "@/lib/firebase";
import type { Food, Profile, WeightRecord } from "@/lib/types";

// ── Auth ────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });
  useEffect(() => onAuthStateChanged(auth, (user) => setState({ user, loading: false })), []);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

// ── Shared user data (profile, foods, weights) ──────────────────────

interface DataState {
  uid: string;
  profile: Profile | null;
  foods: Food[];
  weights: WeightRecord[];
  /** Latest recorded weight, falling back to the starting weight. */
  currentWeightKg: number | null;
  ready: boolean;
  error: string | null;
}

const DataContext = createContext<DataState | null>(null);

export function DataProvider({ user, children }: { user: User; children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [foods, setFoods] = useState<Food[] | null>(null);
  const [weights, setWeights] = useState<WeightRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onError = (e: Error) => setError(e.message);
    let unsubs: (() => void)[] = [];
    let cancelled = false;
    ensureUserSetup(user.uid, user.email)
      .then(() => {
        if (cancelled) return;
        unsubs = [
          subscribeProfile(user.uid, setProfile, onError),
          subscribeFoods(user.uid, setFoods, onError),
          subscribeWeights(user.uid, setWeights, onError),
        ];
      })
      .catch(onError);
    return () => {
      cancelled = true;
      unsubs.forEach((u) => u());
    };
  }, [user.uid, user.email]);

  const value = useMemo<DataState>(() => {
    const latest = weights?.length ? weights[weights.length - 1].weightKg : null;
    return {
      uid: user.uid,
      profile,
      foods: foods ?? [],
      weights: weights ?? [],
      currentWeightKg: latest ?? profile?.startWeightKg ?? null,
      ready: profile !== null && foods !== null && weights !== null,
      error,
    };
  }, [user.uid, profile, foods, weights, error]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataState {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}

// ── Theme ───────────────────────────────────────────────────────────

export function useTheme(): { dark: boolean; toggle: () => void } {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const sync = () => setDark(document.documentElement.classList.contains("dark"));
    sync();
    window.addEventListener("themechange", sync);
    return () => window.removeEventListener("themechange", sync);
  }, []);
  const toggle = useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Private mode: the choice just won't persist.
    }
    window.dispatchEvent(new Event("themechange"));
  }, []);
  return { dark, toggle };
}
