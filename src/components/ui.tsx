"use client";

import { ChevronDown, X } from "lucide-react";
import Image from "next/image";
import { categoryIcon, MEAL_META } from "@/lib/meta";
import type { Meal } from "@/lib/types";
import { createElement, useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <section className={`rounded-3xl border border-line bg-card p-4 sm:p-5 ${className}`}>{children}</section>;
}

export function CardTitle({ children, hint, action }: { children: ReactNode; hint?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-fg">{children}</h2>
        {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

const VARIANTS = {
  primary: "bg-accent text-accent-fg font-semibold hover:brightness-110 active:scale-[0.98]",
  secondary: "border border-line bg-raised text-fg hover:border-accent/50 active:scale-[0.98]",
  ghost: "text-muted hover:bg-subtle hover:text-fg",
  danger: "border border-danger/40 bg-danger/10 text-danger hover:bg-danger/20",
};

const SIZES = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm", lg: "h-12 px-5 text-base" };

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
    />
  );
}

export function IconButton({
  label,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-subtle hover:text-fg disabled:opacity-30 ${className}`}
    />
  );
}

const FIELD =
  "h-11 w-full min-w-0 rounded-2xl border border-line bg-raised px-3.5 text-sm text-fg outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/20";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${FIELD} ${className}`} />;
}

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative min-w-0">
      <select {...props} className={`${FIELD} cursor-pointer appearance-none pr-11 ${className}`} />
      <ChevronDown size={17} aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
    </div>
  );
}

export function Field({
  label,
  hint,
  nowrap = false,
  children,
}: {
  label: string;
  hint?: string;
  /** Keep the label on one line so fields in a row line up. */
  nowrap?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className={`mb-1.5 block text-xs font-semibold text-muted ${nowrap ? "truncate" : ""}`}>{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[88dvh] w-full max-w-lg flex-col rounded-3xl border border-line bg-card shadow-2xl">
        <div className="flex items-center justify-between px-5 pb-2 pt-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        <div className="overflow-y-auto px-5 pb-5 pt-1">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="space-y-5">
        <p className="text-sm text-muted">{message}</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} disabled={busy}>
            {busy ? "Please wait…" : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/** Sugar eaten against the daily limit. Turns red with "over by" text past the limit. */
export function SugarMeter({ grams, limit, className = "" }: { grams: number; limit: number; className?: string }) {
  const over = limit > 0 && grams > limit;
  const pct = limit > 0 ? Math.min(100, (grams / limit) * 100) : 0;
  return (
    <div className={`rounded-2xl bg-raised/70 p-3 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs text-muted">
        <span className="h-2 w-2 rounded-full bg-s4" />
        Sugar
      </div>
      <div className={`mt-0.5 font-display text-xl font-bold tabular-nums ${over ? "text-danger" : ""}`}>
        {Math.round(grams)}
        <span className="ml-0.5 text-xs font-medium text-muted">/ {limit} g</span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-subtle">
        <div className={`h-full rounded-full ${over ? "bg-danger" : "bg-s4"}`} style={{ width: `${pct}%` }} />
      </div>
      {over && <div className="mt-1 text-[11px] font-semibold text-danger">Over by {Math.round(grams - limit)} g</div>}
    </div>
  );
}

export function ProgressBar({ value, max, over = false }: { value: number; max: number; over?: boolean }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-subtle">
      <div className={`h-full rounded-full transition-all duration-500 ${over ? "bg-danger" : "bg-accent"}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Ring({
  value,
  max,
  size = 168,
  stroke = 14,
  children,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  children: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const over = max > 0 && value > max;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--subtle)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={over ? "var(--danger)" : "var(--accent)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

export function EstimatedBadge() {
  return (
    <span
      title="Estimated nutritional values"
      className="inline-flex shrink-0 items-center rounded-full border border-line px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-muted"
    >
      Est.
    </span>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-line border-t-accent ${className}`}
    />
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
  photo,
}: {
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
  /** Optional background photo; renders the header as a banner. */
  photo?: { src: string; alt: string; /** CSS object-position, e.g. "center 65%". */ position?: string };
}) {
  if (photo) {
    return (
      <header className="relative mb-6 overflow-hidden rounded-3xl border border-line">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority
          sizes="(min-width: 768px) 80vw, 100vw"
          className="object-cover"
          style={photo.position ? { objectPosition: photo.position } : undefined}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative flex min-h-36 flex-col items-start justify-end gap-3 p-5 sm:min-h-44 sm:flex-row sm:items-end sm:justify-between sm:p-7">
          <div className="min-w-0">
            <h1 className="text-[28px] font-bold leading-tight tracking-tight text-white sm:text-[32px]">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-white/75">{subtitle}</p>}
          </div>
          {action}
        </div>
      </header>
    );
  }
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-2xl border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
      {children}
    </p>
  );
}

export function MealIcon({ meal, size = 20, className = "" }: { meal: Meal; size?: number; className?: string }) {
  return createElement(MEAL_META[meal].icon, { size, strokeWidth: 2, className, "aria-hidden": true });
}

export function CategoryIcon({ category, size = 18, className = "" }: { category: string; size?: number; className?: string }) {
  return createElement(categoryIcon(category), { size, strokeWidth: 2, className, "aria-hidden": true });
}

export function FoodAvatar({ category, size = "md" }: { category: string; size?: "sm" | "md" | "lg" }) {
  const box = size === "sm" ? "h-9 w-9" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const icon = size === "sm" ? 17 : size === "lg" ? 23 : 19;
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent ${box}`}>
      <CategoryIcon category={category} size={icon} />
    </span>
  );
}

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-[13px] font-medium transition sm:h-9 sm:px-3.5 sm:text-sm ${
        active ? "border-accent bg-accent text-accent-fg" : "border-line bg-raised text-muted hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}
