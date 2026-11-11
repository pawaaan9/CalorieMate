"use client";

import { LayoutDashboard, NotebookPen, Plus, Scale, Settings, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useData } from "./Providers";

const NAV = [
  { href: "/", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { href: "/log", label: "Food log", short: "Log", icon: NotebookPen },
  { href: "/foods", label: "Foods", short: "Foods", icon: UtensilsCrossed },
  { href: "/weight", label: "Weight", short: "Weight", icon: Scale },
  { href: "/settings", label: "Goals & settings", short: "Goals", icon: Settings },
];

export function Logo({ size = 36, showName = true }: { size?: number; showName?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <Image src="/brand/mark.png" alt="CalorieMate" width={size} height={size} priority className="shrink-0 mix-blend-lighten" />
      {showName && (
        <span className="font-display text-lg font-bold uppercase leading-none tracking-wide">
          Calorie<span className="text-accent">Mate</span>
        </span>
      )}
    </span>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { profile } = useData();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const mobileNav = [NAV[0], NAV[1], null, NAV[3], NAV[4]];

  return (
    <div className="min-h-dvh md:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-card/60 p-5 md:flex">
        <Link href="/" className="px-1">
          <Logo />
        </Link>
        <Link
          href="/log?add=1"
          className="mt-8 flex h-11 items-center justify-center gap-2 rounded-full bg-accent text-sm font-bold text-accent-fg transition hover:brightness-110"
        >
          <Plus size={18} strokeWidth={2.5} /> Log food
        </Link>
        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition ${
                isActive(href) ? "bg-accent-soft text-accent" : "text-muted hover:bg-subtle hover:text-fg"
              }`}
            >
              <Icon size={19} />
              {label}
            </Link>
          ))}
        </nav>
        {profile?.displayName && (
          <div className="flex items-center gap-3 rounded-2xl bg-raised p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-display text-sm font-bold uppercase text-accent-fg">
              {profile.displayName.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{profile.displayName}</div>
              <div className="text-xs text-muted">{profile.dailyCalorieTarget} kcal goal</div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/85 px-4 py-2.5 backdrop-blur md:hidden">
        <Link href="/">
          <Logo size={32} />
        </Link>
      </div>

      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-12 md:pt-10">
        <div className="w-full">{children}</div>
      </main>

      {/* Mobile bottom navigation with a centre "add" button */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="grid grid-cols-5 items-end">
          {mobileNav.map((item) =>
            item ? (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold ${
                  isActive(item.href) ? "text-accent" : "text-muted"
                }`}
              >
                <item.icon size={21} />
                {item.short}
              </Link>
            ) : (
              <div key="add" className="flex justify-center">
                <Link
                  href="/log?add=1"
                  aria-label="Log food"
                  className="-mt-6 mb-2 flex h-14 w-14 items-center justify-center rounded-full border-4 border-bg bg-accent text-accent-fg"
                >
                  <Plus size={26} strokeWidth={2.75} />
                </Link>
              </div>
            ),
          )}
        </div>
      </nav>
    </div>
  );
}
