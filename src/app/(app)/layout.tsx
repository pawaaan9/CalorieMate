"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { DataProvider, useAuth, useData } from "@/components/Providers";
import { ErrorNote, Spinner } from "@/components/ui";

function Gate({ children }: { children: ReactNode }) {
  const { ready, error } = useData();
  if (error) {
    return (
      <div className="mx-auto max-w-lg space-y-3 pt-10">
        <ErrorNote>Could not load your data: {error}</ErrorNote>
        <p className="text-sm text-muted">
          Check that Cloud Firestore is created in the Firebase console and that the rules in{" "}
          <code className="font-mono">firestore.rules</code> are published.
        </p>
      </div>
    );
  }
  if (!ready) {
    return (
      <div className="flex justify-center pt-24">
        <Spinner />
      </div>
    );
  }
  return <>{children}</>;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <DataProvider user={user}>
      <AppShell>
        <Gate>{children}</Gate>
      </AppShell>
    </DataProvider>
  );
}
