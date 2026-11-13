"use client";

import { Check } from "lucide-react";
import { consumed, NUTRIENTS, type NutrientKey, type NutrientTargets, type TargetKind } from "@/lib/nutrition";
import type { Macros } from "@/lib/types";

const DOT: Record<NutrientKey, string> = {
  protein: "bg-s1",
  carbs: "bg-s2",
  fat: "bg-s3",
  fiber: "bg-s7",
  sugar: "bg-s4",
  naturalSugar: "bg-s4",
  addedSugar: "bg-s4",
};

const HINT: Record<TargetKind, string> = {
  goal: "Goal",
  aim: "Target",
  limit: "Limit",
};

/** Whole grams from 10 g up, one decimal below that. */
const g = (n: number) => (Math.abs(n) >= 10 ? String(Math.round(n)) : String(Math.round(n * 10) / 10));

function status(kind: TargetKind, eaten: number, target: number) {
  const left = target - eaten;
  if (kind === "goal") {
    return left > 0.05
      ? { text: `${g(left)} g to go`, tone: "muted" as const }
      : { text: "Goal reached", tone: "good" as const };
  }
  if (kind === "aim") {
    return left >= -0.05
      ? { text: `${g(Math.max(0, left))} g left`, tone: "muted" as const }
      : { text: `${g(-left)} g over`, tone: "warn" as const };
  }
  return left >= -0.05
    ? { text: `${g(Math.max(0, left))} g left`, tone: "muted" as const }
    : { text: `Over by ${g(-left)} g`, tone: "bad" as const };
}

function NutrientTile({
  label,
  kind,
  eaten,
  target,
  dot,
  showKind = true,
}: {
  label: React.ReactNode;
  kind: TargetKind;
  eaten: number;
  target: number;
  dot: string;
  showKind?: boolean;
}) {
  const s = status(kind, eaten, target);
  const pct = target > 0 ? Math.min(100, (eaten / target) * 100) : 0;
  const bar = s.tone === "bad" ? "bg-danger" : s.tone === "warn" ? "bg-warn" : s.tone === "good" ? "bg-accent" : dot;
  const textTone =
    s.tone === "bad" ? "text-danger" : s.tone === "warn" ? "text-warn" : s.tone === "good" ? "text-accent" : "text-muted";

  return (
    <div className="min-w-0 rounded-2xl bg-raised/70 p-3">
      <div className="flex items-center justify-between gap-2 text-xs text-muted">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
          <span className="truncate">{label}</span>
        </span>
        {showKind && (
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted/70">{HINT[kind]}</span>
        )}
      </div>
      <div className={`mt-1 whitespace-nowrap font-display text-xl font-bold tabular-nums ${s.tone === "bad" ? "text-danger" : ""}`}>
        {g(eaten)}
        <span className="ml-0.5 text-xs font-medium text-muted">/ {g(target)} g</span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-subtle">
        <div className={`h-full rounded-full transition-all duration-500 ${bar}`} style={{ width: `${pct}%` }} />
      </div>
      <div className={`mt-1.5 flex items-center gap-1 truncate text-[11px] font-semibold ${textTone}`}>
        {s.tone === "good" && <Check size={12} strokeWidth={3} className="shrink-0" />}
        {s.text}
      </div>
    </div>
  );
}

/**
 * Daily nutrients against their targets: macros and fibre, then total,
 * natural and added sugar. Calories are shown separately by each page.
 */
export function NutrientPanel({
  totals,
  targets,
  narrow = false,
}: {
  totals: Macros;
  targets: NutrientTargets;
  /** For side panels: macros always in a 2 × 2 grid. */
  narrow?: boolean;
}) {
  const tile = (key: NutrientKey) => {
    const n = NUTRIENTS.find((x) => x.key === key)!;
    return (
      <NutrientTile
        key={key}
        label={
          n.kind === "limit" ? (
            <>
              {/* Short names on phones; the "Sugar" heading gives the context. */}
              <span className="sm:hidden">{n.label.replace(/ sugar$/i, "")}</span>
              <span className="hidden sm:inline">{n.label}</span>
            </>
          ) : (
            n.label
          )
        }
        kind={n.kind}
        eaten={consumed(totals, key)}
        target={targets[key]}
        dot={DOT[key]}
        // All sugar tiles are limits; the group heading says so once.
        showKind={n.kind !== "limit"}
      />
    );
  };

  return (
    <div className="space-y-4">
      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Macros & fibre</h3>
        <div className={`grid grid-cols-2 gap-2 ${narrow ? "" : "sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"}`}>{(["protein", "carbs", "fat", "fiber"] as const).map(tile)}</div>
      </section>
      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
          Sugar <span className="font-semibold normal-case tracking-normal text-muted/70">· daily limits</span>
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {(["sugar", "naturalSugar", "addedSugar"] as const).map(tile)}
        </div>
      </section>
    </div>
  );
}
