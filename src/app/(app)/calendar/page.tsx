"use client";

import { ArrowDownRight, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Flame, NotebookPen, Plus, Scale } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { NutrientPanel } from "@/components/NutrientPanel";
import { useData } from "@/components/Providers";
import { Button, Card, CardTitle, MealIcon, PageHeader, ProgressBar, Spinner } from "@/components/ui";
import { addDays, formatLong, formatShort, fromKey, toKey, todayKey, weekStart } from "@/lib/dates";
import { useEntries, useSummaries } from "@/lib/hooks";
import { targetsFor } from "@/lib/nutrition";
import { MEALS, type DailySummary } from "@/lib/types";

// ── Metrics the month can be coloured by ─────────────────────────────

type MetricKey = "calories" | "protein" | "fiber" | "addedSugar";
type Tone = "good" | "partial" | "warn" | "bad";

const METRICS: { key: MetricKey; label: string; unit: string; hint: string }[] = [
  { key: "calories", label: "Calories", unit: "kcal", hint: "Lime: at or under target. Amber: up to 10 % over. Red: more." },
  { key: "protein", label: "Protein", unit: "g", hint: "Lime: goal reached. Dim lime: part of the way." },
  { key: "fiber", label: "Fibre", unit: "g", hint: "Lime: goal reached. Dim lime: part of the way." },
  { key: "addedSugar", label: "Added sugar", unit: "g", hint: "Lime: under the limit. Amber: up to 25 % over. Red: more." },
];

const TONE_COLOR: Record<Tone, string> = {
  good: "var(--accent)",
  partial: "rgb(191 238 87 / 0.45)",
  warn: "var(--warn)",
  bad: "var(--danger)",
};

function judge(metric: MetricKey, value: number, target: number): { pct: number; tone: Tone } {
  const pct = target > 0 ? value / target : 0;
  if (metric === "calories") return { pct, tone: pct <= 1 ? "good" : pct <= 1.1 ? "warn" : "bad" };
  if (metric === "addedSugar") return { pct, tone: pct <= 1 ? "good" : pct <= 1.25 ? "warn" : "bad" };
  return { pct, tone: pct >= 1 ? "good" : "partial" };
}

const fmt = (n: number) => Math.round(n).toLocaleString();

// ── Small pieces ─────────────────────────────────────────────────────

function DayRing({ pct, tone, size }: { pct: number; tone: Tone; size: number }) {
  const stroke = size >= 34 ? 4 : 3.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const fill = Math.min(1, Math.max(0, pct));
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--subtle)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={TONE_COLOR[tone]}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - fill)}
      />
    </svg>
  );
}

function Stat({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon?: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-card p-3.5 sm:p-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-1 truncate font-display text-2xl font-bold tabular-nums">{value}</div>
      {sub && <div className="truncate text-xs text-muted">{sub}</div>}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { uid, profile, weights } = useData();
  const today = todayKey();
  const [cursor, setCursor] = useState(() => {
    const d = fromKey(today);
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [selected, setSelected] = useState(today);
  const [metric, setMetric] = useState<MetricKey>("calories");

  const first = toKey(new Date(cursor.y, cursor.m, 1));
  const last = toKey(new Date(cursor.y, cursor.m + 1, 0));
  const isCurrentMonth = first <= today && today <= last;
  const summaries = useSummaries(uid, first, last);
  const targets = targetsFor(profile);
  const calorieTarget = profile?.dailyCalorieTarget ?? 2000;

  const weightByDate = useMemo(() => new Map(weights.map((w) => [w.date, w.weightKg])), [weights]);

  // 5 or 6 Monday-first weeks covering the month.
  const weeks = useMemo(() => {
    const end = addDays(weekStart(last), 6);
    const rows: string[][] = [];
    for (let d = weekStart(first); d <= end; d = addDays(d, 1)) {
      if (!rows.length || rows[rows.length - 1].length === 7) rows.push([]);
      rows[rows.length - 1].push(d);
    }
    return rows;
  }, [first, last]);

  const targetFor = (s: DailySummary | undefined, key: MetricKey) =>
    key === "calories" ? s?.goal || calorieTarget : targets[key];
  const valueFor = (s: DailySummary, key: MetricKey) => (key === "calories" ? s.calories : (s[key] ?? 0));

  // Month numbers
  const stats = useMemo(() => {
    const days = summaries
      ? [...summaries.values()].filter((s) => s.entryCount > 0 && s.date >= first && s.date <= last)
      : [];
    const avg = (f: (s: DailySummary) => number) =>
      days.length ? days.reduce((a, s) => a + f(s), 0) / days.length : null;
    const elapsed = isCurrentMonth ? fromKey(today).getDate() : fromKey(last).getDate();
    const onTarget = days.filter((s) => s.calories <= (s.goal || calorieTarget)).length;
    let best = 0;
    let run = 0;
    for (let d = first; d <= last; d = addDays(d, 1)) {
      run = summaries?.get(d)?.entryCount ? run + 1 : 0;
      best = Math.max(best, run);
    }
    const monthWeights = weights.filter((w) => w.date >= first && w.date <= last);
    const weightChange =
      monthWeights.length >= 2 ? monthWeights[monthWeights.length - 1].weightKg - monthWeights[0].weightKg : null;
    return {
      logged: days.length,
      elapsed: Math.max(0, elapsed),
      onTarget,
      kcal: avg((s) => s.calories),
      protein: avg((s) => s.protein),
      fiber: avg((s) => s.fiber ?? 0),
      added: avg((s) => s.addedSugar ?? 0),
      best,
      weightChange,
      weighIns: monthWeights.length,
    };
  }, [summaries, first, last, today, isCurrentMonth, calorieTarget, weights]);

  const goMonth = (dir: 1 | -1) => {
    const d = new Date(cursor.y, cursor.m + dir, 1);
    const next = { y: d.getFullYear(), m: d.getMonth() };
    setCursor(next);
    const nf = toKey(new Date(next.y, next.m, 1));
    const nl = toKey(new Date(next.y, next.m + 1, 0));
    setSelected(nf <= today && today <= nl ? today : nf);
  };
  const goToday = () => {
    const d = fromKey(today);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
    setSelected(today);
  };

  const monthTitle = new Date(cursor.y, cursor.m, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const canGoNext = !isCurrentMonth && first < today;
  const m = METRICS.find((x) => x.key === metric)!;
  const losing = (profile?.targetWeightKg ?? 0) <= (profile?.startWeightKg ?? 0);

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle="Your month at a glance. Tap a day for the full picture."
        photo={{ src: "/photos/meal-plates.jpg", alt: "Plates of healthy food on a table", position: "center 40%" }}
      />

      {/* Month summary */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <Stat label="Days logged" value={`${stats.logged}`} sub={`of ${stats.elapsed} day${stats.elapsed === 1 ? "" : "s"}`} icon={<NotebookPen size={13} />} />
        <Stat
          label="Avg calories"
          value={stats.kcal === null ? "–" : fmt(stats.kcal)}
          sub={`target ${fmt(calorieTarget)} kcal`}
          icon={<span className="h-2 w-2 rounded-full bg-accent" />}
        />
        <Stat label="On calorie target" value={`${stats.onTarget}`} sub={`of ${stats.logged} logged`} icon={<span className="h-2 w-2 rounded-full bg-accent" />} />
        <Stat label="Best streak" value={`${stats.best}`} sub={stats.best === 1 ? "day" : "days in a row"} icon={<Flame size={13} />} />
        <Stat
          label="Avg protein"
          value={stats.protein === null ? "–" : `${fmt(stats.protein)} g`}
          sub={`goal ${targets.protein} g`}
          icon={<span className="h-2 w-2 rounded-full bg-s1" />}
        />
        <Stat
          label="Avg fibre"
          value={stats.fiber === null ? "–" : `${fmt(stats.fiber)} g`}
          sub={`goal ${targets.fiber} g`}
          icon={<span className="h-2 w-2 rounded-full bg-s7" />}
        />
        <Stat
          label="Avg added sugar"
          value={stats.added === null ? "–" : `${fmt(stats.added)} g`}
          sub={`limit ${targets.addedSugar} g`}
          icon={<span className="h-2 w-2 rounded-full bg-s4" />}
        />
        <Stat
          label="Weight change"
          value={stats.weightChange === null ? "–" : `${stats.weightChange > 0 ? "+" : stats.weightChange < 0 ? "−" : ""}${Math.abs(stats.weightChange).toFixed(1)} kg`}
          sub={stats.weighIns ? `${stats.weighIns} weigh-in${stats.weighIns === 1 ? "" : "s"}` : "no weigh-ins"}
          icon={<Scale size={13} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* Calendar */}
        <Card className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => goMonth(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-subtle hover:text-fg"
              >
                <ChevronLeft size={19} />
              </button>
              <h2 className="min-w-36 text-center text-lg font-bold">{monthTitle}</h2>
              <button
                type="button"
                aria-label="Next month"
                disabled={!canGoNext}
                onClick={() => goMonth(1)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-subtle hover:text-fg disabled:opacity-25 disabled:hover:bg-transparent"
              >
                <ChevronRight size={19} />
              </button>
              {!isCurrentMonth && (
                <Button variant="ghost" size="sm" onClick={goToday} className="ml-1">
                  Today
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Colour days by">
              {METRICS.map((x) => (
                <button
                  key={x.key}
                  type="button"
                  role="radio"
                  aria-checked={metric === x.key}
                  onClick={() => setMetric(x.key)}
                  className={`h-8 rounded-full border px-3 text-xs font-semibold transition ${
                    metric === x.key ? "border-accent bg-accent text-accent-fg" : "border-line bg-raised text-muted hover:text-fg"
                  }`}
                >
                  {x.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wider text-muted lg:grid-cols-[repeat(7,minmax(0,1fr))_4.5rem]">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="py-1.5">
                <span className="sm:hidden">{d.slice(0, 1)}</span>
                <span className="hidden sm:inline">{d}</span>
              </div>
            ))}
            <div className="hidden py-1.5 lg:block">Week</div>
          </div>

          {summaries === null ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-1">
              {weeks.map((week) => {
                const logged = week.map((d) => summaries.get(d)).filter((s): s is DailySummary => !!s?.entryCount && s.date >= first && s.date <= last);
                const weekAvg = logged.length ? logged.reduce((a, s) => a + valueFor(s, metric), 0) / logged.length : null;
                return (
                  <div key={week[0]} className="grid grid-cols-7 gap-1 lg:grid-cols-[repeat(7,minmax(0,1fr))_4.5rem]">
                    {week.map((d) => {
                      const inMonth = d >= first && d <= last;
                      const future = d > today;
                      const s = inMonth ? summaries.get(d) : undefined;
                      const hasLog = !!s?.entryCount;
                      const v = hasLog ? judge(metric, valueFor(s!, metric), targetFor(s, metric)) : null;
                      const weighed = inMonth && weightByDate.has(d);
                      const isSel = d === selected;
                      const isToday = d === today;
                      return (
                        <button
                          key={d}
                          type="button"
                          disabled={!inMonth || future}
                          onClick={() => setSelected(d)}
                          aria-pressed={isSel}
                          aria-label={`${formatLong(d)}${hasLog ? `, ${fmt(valueFor(s!, metric))} ${m.unit}` : ", nothing logged"}${weighed ? ", weigh-in" : ""}`}
                          className={`relative flex aspect-square min-w-0 flex-col items-center justify-between rounded-2xl border p-1 transition sm:aspect-auto sm:h-24 sm:p-2 ${
                            !inMonth
                              ? "border-transparent opacity-0"
                              : isSel
                                ? "border-accent bg-accent-soft"
                                : future
                                  ? "border-transparent bg-raised/30 opacity-40"
                                  : "border-line bg-raised/60 hover:border-accent/50"
                          }`}
                        >
                          <span className="flex w-full items-start justify-between">
                            <span
                              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold tabular-nums sm:text-xs ${
                                isToday ? "bg-accent text-accent-fg" : "text-fg"
                              }`}
                            >
                              {fromKey(d).getDate()}
                            </span>
                            {weighed && <Scale size={12} className="mt-0.5 shrink-0 text-accent" aria-hidden />}
                          </span>
                          {inMonth && !future && (
                            <>
                              <span className="sm:hidden">
                                {v ? <DayRing pct={v.pct} tone={v.tone} size={24} /> : <span className="block h-6 w-6" />}
                              </span>
                              <span className="hidden sm:block">
                                {v ? <DayRing pct={v.pct} tone={v.tone} size={34} /> : <span className="block h-[34px] w-[34px] rounded-full border-2 border-dashed border-line" />}
                              </span>
                              <span className="hidden h-4 truncate text-[11px] font-semibold tabular-nums text-muted sm:block">
                                {hasLog ? fmt(valueFor(s!, metric)) : ""}
                              </span>
                            </>
                          )}
                        </button>
                      );
                    })}
                    <div className="hidden flex-col items-center justify-center rounded-2xl bg-raised/30 text-center lg:flex">
                      {weekAvg === null ? (
                        <span className="text-xs text-muted/60">–</span>
                      ) : (
                        <>
                          <span className="font-display text-sm font-bold tabular-nums">{fmt(weekAvg)}</span>
                          <span className="text-[10px] text-muted">avg {m.unit}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-xs text-muted">
            {(metric === "calories" || metric === "addedSugar"
              ? (["good", "warn", "bad"] as const)
              : (["good", "partial"] as const)
            ).map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: TONE_COLOR[t] }} />
                {t === "good"
                  ? metric === "calories" || metric === "addedSugar"
                    ? "Within target"
                    : "Goal reached"
                  : t === "partial"
                    ? "Part of the way"
                    : t === "warn"
                      ? "Slightly over"
                      : "Over"}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full border border-dashed border-muted" />
              Nothing logged
            </span>
            <span className="flex items-center gap-1.5">
              <Scale size={12} className="text-accent" />
              Weigh-in
            </span>
          </div>
          <p className="mt-2 text-[11px] text-muted/80">{m.hint}</p>
        </Card>

        {/* Selected day */}
        <DayDetails
          date={selected}
          summary={summaries?.get(selected)}
          calorieTarget={summaries?.get(selected)?.goal || calorieTarget}
          weight={weightByDate.get(selected)}
          previousWeight={[...weights].reverse().find((w) => w.date < selected)?.weightKg}
          losing={losing}
        />
      </div>
    </>
  );
}

// ── Selected day panel ───────────────────────────────────────────────

function DayDetails({
  date,
  summary,
  calorieTarget,
  weight,
  previousWeight,
  losing,
}: {
  date: string;
  summary: DailySummary | undefined;
  calorieTarget: number;
  weight: number | undefined;
  previousWeight: number | undefined;
  losing: boolean;
}) {
  const { uid, profile } = useData();
  const entries = useEntries(uid, date);
  const today = todayKey();
  const kcal = summary?.calories ?? 0;
  const left = calorieTarget - kcal;
  const delta = weight !== undefined && previousWeight !== undefined ? weight - previousWeight : null;
  const good = delta !== null && (losing ? delta < 0 : delta > 0);

  return (
    <Card className="min-w-0 xl:sticky xl:top-6 xl:self-start">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {date === today ? "Today" : date === addDays(today, -1) ? "Yesterday" : formatShort(date)}
          </p>
          <h2 className="truncate text-xl font-bold">{formatLong(date)}</h2>
        </div>
        <Link
          href={`/log?date=${date}`}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-line bg-raised px-3.5 text-xs font-semibold text-fg transition hover:border-accent/50"
        >
          Open in log <ArrowRight size={14} />
        </Link>
      </div>

      {/* Calories */}
      <div className="rounded-2xl bg-raised/70 p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">Calories</div>
            <div className="font-display text-3xl font-bold tabular-nums">
              {fmt(kcal)}
              <span className="ml-1 text-sm font-medium text-muted">/ {fmt(calorieTarget)} kcal</span>
            </div>
          </div>
          <div className={`text-right text-sm font-semibold ${left < 0 ? "text-danger" : "text-accent"}`}>
            {summary?.entryCount ? (left >= 0 ? `${fmt(left)} left` : `${fmt(-left)} over`) : ""}
          </div>
        </div>
        <div className="mt-3">
          <ProgressBar value={kcal} max={calorieTarget} over={left < 0} />
        </div>
      </div>

      {/* Weigh-in */}
      {weight !== undefined && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3">
          <Scale size={20} className="shrink-0 text-accent" />
          <div className="min-w-0 flex-1 text-sm">
            Weighed in at <span className="font-display font-bold">{weight.toFixed(1)} kg</span>
          </div>
          {delta !== null && (
            <span
              className={`flex shrink-0 items-center gap-0.5 font-display text-sm font-bold tabular-nums ${
                delta === 0 ? "text-muted" : good ? "text-accent" : "text-warn"
              }`}
            >
              {delta < 0 ? <ArrowDownRight size={15} /> : delta > 0 ? <ArrowUpRight size={15} /> : null}
              {delta > 0 ? "+" : delta < 0 ? "−" : ""}
              {Math.abs(delta).toFixed(1)} kg
            </span>
          )}
        </div>
      )}

      {/* Nutrients */}
      {summary?.entryCount ? (
        <div className="mt-5">
          <NutrientPanel totals={summary} targets={targetsFor(profile)} narrow />
        </div>
      ) : null}

      {/* Meals */}
      <div className="mt-5">
        <CardTitle>Meals</CardTitle>
        {entries === null ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line px-4 py-6 text-center">
            <p className="text-sm text-muted">Nothing logged on this day.</p>
            <Link
              href={`/log?date=${date}`}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
            >
              <Plus size={15} /> Log food for this day
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {MEALS.map((meal) => {
              const items = entries.filter((e) => e.meal === meal.id);
              if (!items.length) return null;
              const mealKcal = items.reduce((a, e) => a + e.calories, 0);
              return (
                <li key={meal.id} className="rounded-2xl bg-raised/60 p-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <MealIcon meal={meal.id} size={16} />
                    </span>
                    <span className="flex-1 text-sm font-bold">{meal.label}</span>
                    <span className="font-display text-sm font-bold tabular-nums">{fmt(mealKcal)} kcal</span>
                  </div>
                  <ul className="mt-2 space-y-1 pl-[42px]">
                    {items.map((e) => (
                      <li key={e.id} className="flex items-baseline justify-between gap-2 text-xs">
                        <span className="min-w-0 truncate text-muted">{e.foodName}</span>
                        <span className="shrink-0 tabular-nums text-muted">{e.calories}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
