"use client";

import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
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
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="flex min-h-dvh flex-col lg:grid lg:grid-cols-2">
      {/* Photo panel */}
      <div className="relative h-56 overflow-hidden sm:h-72 lg:h-auto">
        <Image src="/photos/deadlift.jpg" alt="Lifting a barbell in the gym" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-x-0 bottom-0 hidden p-10 lg:block">
          <p className="font-display text-4xl font-bold leading-tight">
            Eat well. Train hard.
            <br />
            <span className="text-accent">Track it all.</span>
          </p>
          <p className="mt-3 max-w-md text-sm text-white/75">
            Your calories, Sri Lankan meals and weekly weigh-ins in one place.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-start justify-center px-4 pb-10 lg:items-center lg:py-10">
        <div className="relative z-10 -mt-20 w-full max-w-sm lg:mt-0">
          <div className="mb-4 flex justify-center">
            <Image
              src="/brand/logo-full.png"
              alt="CalorieMate"
              width={180}
              height={180}
              priority
              className="rounded-3xl border border-line bg-black"
            />
          </div>
          <form onSubmit={submit} className="space-y-4 rounded-3xl border border-line bg-card p-6">
            <div>
              <h1 className="text-xl font-bold">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
              <p className="mt-0.5 text-sm text-muted">Track every rice and curry. Hit your goal.</p>
            </div>
            <Field label="Email">
              <Input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Password">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-2xl text-muted transition hover:text-fg"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>
            {error && <ErrorNote>{error}</ErrorNote>}
            {notice && <p className="rounded-2xl bg-accent-soft px-3.5 py-2.5 text-sm text-accent">{notice}</p>}
            <Button type="submit" size="lg" disabled={busy} className="w-full">
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                className="font-semibold text-accent hover:underline"
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
      </div>
    </main>
  );
}
