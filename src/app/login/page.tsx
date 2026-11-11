"use client";

import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Logo } from "@/components/AppShell";
import { useAuth } from "@/components/Providers";
import { Button, ErrorNote, Field, Input, Spinner } from "@/components/ui";
import { auth } from "@/lib/firebase";

const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Wrong email or password.",
  "auth/invalid-email": "That email address is not valid.",
  "auth/user-not-found": "No account found for that email.",
  "auth/wrong-password": "Wrong email or password.",
  "auth/email-already-in-use": "An account already exists for that email. Sign in instead.",
  "auth/weak-password": "Use a password with at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
  "auth/operation-not-allowed": "Email/password sign-in is not enabled in the Firebase console yet.",
  "auth/admin-restricted-operation": "Creating new accounts is turned off for this project.",
  "auth/network-request-failed": "Network problem. Check your connection and try again.",
};

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  const fail = (e: unknown) =>
    setError(e instanceof FirebaseError ? (MESSAGES[e.code] ?? e.message) : "Something went wrong. Try again.");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signin") await signInWithEmailAndPassword(auth, email.trim(), password);
      else await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError("Enter your email first, then choose reset.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNotice("Password reset email sent.");
    } catch (err) {
      fail(err);
    }
  }

  if (loading || user) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-card p-6">
          <div>
            <h1 className="text-lg font-semibold">{mode === "signin" ? "Sign in" : "Create your account"}</h1>
            <p className="mt-0.5 text-sm text-muted">Your calorie and weight tracker.</p>
          </div>
          <Field label="Email">
            <Input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {error && <ErrorNote>{error}</ErrorNote>}
          {notice && <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">{notice}</p>}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-accent hover:underline"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
              }}
            >
              {mode === "signin" ? "Create an account" : "I already have an account"}
            </button>
            {mode === "signin" && (
              <button type="button" className="text-muted hover:underline" onClick={resetPassword}>
                Forgot password?
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
