"use client";

import { Apple, LayoutDashboard, Moon, NotebookPen, Scale, Settings, Sun, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useTheme } from "./Providers";

const NAV = [
  { href: "/", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { href: "/log", label: "Food log", short: "Log", icon: NotebookPen },
  { href: "/foods", label: "Foods", short: "Foods", icon: UtensilsCrossed },
  { href: "/weight", label: "Weight", short: "Weight", icon: Scale },
  { href: "/settings", label: "Goals & settings", short: "Settings", icon: Settings },
];

export function Logo() {
  return (
    <span className="flex items-center gap-2 text-lg font-semibold tracking-tight">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-fg">
        <Apple size={18} />
      </span>
      CalorieMate
    </span>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { dark, toggle } = useTheme();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const themeButton = (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm text-muted transition hover:bg-subtle hover:text-fg"
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
      <span className="hidden md:inline">{dark ? "Light mode" : "Dark mode"}</span>
    </button>
  );

  return (
    <div className="min-h-dvh md:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-card p-4 md:flex">
        <div className="px-2 py-2">
          <Logo />
        </div>
        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive(href) ? "bg-accent-soft text-accent" : "text-muted hover:bg-subtle hover:text-fg"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        {themeButton}
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-card/95 px-4 py-2.5 backdrop-blur md:hidden">
        <Logo />
        {themeButton}
      </div>

      <main className="min-w-0 flex-1 px-4 pb-24 pt-5 sm:px-6 md:pb-10 md:pt-8">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV.map(({ href, short, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
              isActive(href) ? "text-accent" : "text-muted"
            }`}
          >
            <Icon size={20} />
            {short}
          </Link>
        ))}
      </nav>
    </div>
  );
}
