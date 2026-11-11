"use client";

import { ArrowDownRight, ArrowRight, ArrowUpRight, Flame, Plus, Scale } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { CalorieBars, WeightLine, type BarPoint } from "@/components/charts";
import { useData } from "@/components/Providers";
import { Card, CardTitle, MealIcon, PageHeader, ProgressBar, Ring, SugarMeter } from "@/components/ui";
import { addDays, daysBetween, formatFull, formatLong, formatShort, todayKey, weekStart, weekdayShort } from "@/lib/dates";
import { useEntries, useSummaries } from "@/lib/hooks";
import { greeting } from "@/lib/meta";
import { MEALS, type DailySummary } from "@/lib/types";

const WEEKS = 8;
const kg = (n: number) => n.toFixed(1);
const signed = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(1)}`;

function average(days: DailySummary[]): number | null {
  const logged = days.filter((d) => d.entryCount > 0);
  return logged.length ? Math.round(logged.reduce((a, d) => a + d.calories, 0) / logged.length) : null;
}

function MacroStat({ label, grams, pct, dot }: { label: string; grams: number; pct: number; dot: string }) {
  return (
    <div className="rounded-2xl bg-raised/70 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        {label}
      </div>
      <div className="mt-0.5 font-display text-xl font-bold tabular-nums">
        {Math.round(grams)}
        <span className="ml-0.5 text-xs font-medium text-muted">g</span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-subtle">
        <div className={`h-full rounded-full ${dot}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { uid, profile, weights, currentWeightKg } = useData();
  const today = todayKey();
  const from = useMemo(() => weekStart(addDays(today, -7 * (WEEKS - 1))), [today]);
  const summaries = useSummaries(uid, from);
  const todayEntries = useEntries(uid, today);

  const goal = profile?.dailyCalorieTarget ?? 0;
  const todaySummary = summaries?.get(today);
  const eaten = todaySummary?.calories ?? 0;
  const remaining = goal - eaten;

  const last7: BarPoint[] = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const date = addDays(today, i - 6);
        const s = summaries?.get(date);
        return { label: weekdayShort(date), tip: formatLong(date), value: s?.entryCount ? s.calories : null };
      }),
    [summaries, today],
  );
  const avg7 = useMemo(
    () => average(Array.from({ length: 7 }, (_, i) => summaries?.get(addDays(today, i - 6))).filter((s): s is DailySummary => !!s)),
    [summaries, today],
  );

  const weekly: BarPoint[] = useMemo(
    () =>
      Array.from({ length: WEEKS }, (_, i) => {
        const start = addDays(from, i * 7);
        const days = Array.from({ length: 7 }, (_, d) => summaries?.get(addDays(start, d))).filter((s): s is DailySummary => !!s);
        return { label: formatShort(start), tip: `Week of ${formatFull(start)} · daily average`, value: average(days) };
      }),
    [summaries, from],
  );
  const hasWeekly = weekly.some((w) => w.value !== null);

  // Consecutive days with at least one entry, counting back from today (or yesterday).
  const streak = useMemo(() => {
    if (!summaries) return 0;
    let day = summaries.get(today)?.entryCount ? today : addDays(today, -1);
    let n = 0;
    while (summaries.get(day)?.entryCount) {
      n++;
      day = addDays(day, -1);
    }
    return n;
  }, [summaries, today]);

  const start = profile?.startWeightKg ?? 0;
  const target = profile?.targetWeightKg ?? 0;
  const current = currentWeightKg ?? start;
  const change = current - start;
  const span = start - target;
  const progress = span !== 0 ? Math.min(1, Math.max(0, (start - current) / span)) : 0;
  const toGo = current - target;
  const latest = weights[weights.length - 1];
  const previous = weights[weights.length - 2];
  const weekDelta = latest && previous ? latest.weightKg - previous.weightKg : null;
  const losing = target <= start;
  const dueForWeighIn = !latest || daysBetween(latest.date, today) >= 7;
  const goodDelta = weekDelta !== null && (losing ? weekDelta < 0 : weekDelta > 0);

  const macroCals = {
    protein: (todaySummary?.protein ?? 0) * 4,
    carbs: (todaySummary?.carbs ?? 0) * 4,
    fat: (todaySummary?.fat ?? 0) * 9,
  };
  const macroTotal = macroCals.protein + macroCals.carbs + macroCals.fat || 1;
  const pct = (n: number) => Math.round((n / macroTotal) * 100);

  return (
    <>
      <PageHeader
        photo={{ src: "/photos/dumbbells.jpg", alt: "Picking up a dumbbell at the gym" }}
        title={
          <>
            {greeting()}
            {profile?.displayName ? `, ${profile.displayName}` : ""}
          </>
        }
        subtitle={formatLong(today)}
      />

      {profile && !profile.onboarded && (
        <Link
          href="/settings"
          className="mb-5 flex items-center justify-between gap-3 rounded-3xl border border-accent/40 bg-accent-soft px-5 py-4 text-sm text-fg"
        >
          <span>
            <strong className="font-bold text-accent">Let&apos;s set your goals.</strong> Add your weight, height and target to get a
            personal calorie goal.
          </span>
          <ArrowRight size={18} className="shrink-0 text-accent" />
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {/* Hero: today */}
        <Card className="lg:col-span-2 xl:col-span-3">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <Ring value={eaten} max={goal} size={184} stroke={16}>
              <span className="font-display text-4xl font-bold tabular-nums">{Math.abs(remaining).toLocaleString()}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                {remaining >= 0 ? "kcal left" : "kcal over"}
              </span>
            </Ring>
            <div className="w-full min-w-0 flex-1 space-y-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted">Eaten today</div>
                  <div className="font-display text-3xl font-bold tabular-nums">
                    {eaten.toLocaleString()}
                    <span className="ml-1 text-sm font-medium text-muted">/ {goal.toLocaleString()} kcal</span>
                  </div>
                </div>
                <Link
                  href="/log?add=1"
                  className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-accent px-5 text-sm font-bold text-accent-fg transition hover:brightness-110"
                >
                  <Plus size={17} strokeWidth={2.75} /> Log food
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <MacroStat label="Protein" grams={todaySummary?.protein ?? 0} pct={pct(macroCals.protein)} dot="bg-s1" />
                <MacroStat label="Carbs" grams={todaySummary?.carbs ?? 0} pct={pct(macroCals.carbs)} dot="bg-s2" />
                <MacroStat label="Fat" grams={todaySummary?.fat ?? 0} pct={pct(macroCals.fat)} dot="bg-s3" />
                <SugarMeter grams={todaySummary?.sugar ?? 0} limit={profile?.sugarLimitG ?? 50} />
              </div>
            </div>
          </div>
        </Card>

        {/* Streak + weigh-in */}
        <div className="grid min-w-0 grid-cols-1 gap-4">
          <Card className="flex items-center gap-4">
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${streak > 0 ? "bg-accent text-accent-fg" : "bg-raised text-muted"}`}
            >
              <Flame size={28} />
            </span>
            <div>
              <div className="font-display text-3xl font-bold tabular-nums leading-none">
                {streak}
                <span className="ml-1 text-sm font-medium text-muted">day{streak === 1 ? "" : "s"}</span>
              </div>
              <div className="mt-1 text-xs text-muted">
                {streak === 0 ? "Log something today to start a streak" : streak >= 7 ? "Logging streak. Brilliant!" : "Logging streak. Keep it going!"}
              </div>
            </div>
          </Card>
          <Link
            href="/weight"
            className={`flex items-center gap-4 rounded-3xl border p-4 transition sm:p-5 ${
              dueForWeighIn ? "border-accent/40 bg-accent-soft hover:border-accent" : "border-line bg-card hover:border-accent/40"
            }`}
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-raised text-accent">
              <Scale size={26} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-3xl font-bold tabular-nums leading-none">
                {kg(current)}
                <span className="ml-1 text-sm font-medium text-muted">kg</span>
              </div>
              <div className="mt-1 text-xs text-muted">
                {dueForWeighIn ? "Time for this week's weigh-in" : `Weighed ${formatShort(latest!.date)}`}
              </div>
            </div>
            <ArrowRight size={18} className="shrink-0 text-muted" />
          </Link>
        </div>

        {/* Today's meals */}
        <Card className="lg:col-span-3 xl:col-span-4">
          <CardTitle
            action={
              <Link href="/log" className="text-sm font-semibold text-accent hover:underline">
                Open log
              </Link>
            }
          >
            Today&apos;s meals
          </CardTitle>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {MEALS.map((m) => {
              const items = (todayEntries ?? []).filter((e) => e.meal === m.id);
              const kcal = items.reduce((a, e) => a + e.calories, 0);
              return (
                <Link
                  key={m.id}
                  href={`/log?meal=${m.id}`}
                  className="group flex flex-col rounded-2xl border border-line bg-raised/60 p-3.5 transition hover:border-accent/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                      <MealIcon meal={m.id} />
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent transition group-hover:bg-accent group-hover:text-accent-fg">
                      <Plus size={15} strokeWidth={2.75} />
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-bold">{m.label}</div>
                  <div className="truncate text-xs text-muted">
                    {items.length ? `${kcal} kcal · ${items.length} item${items.length === 1 ? "" : "s"}` : "Not logged yet"}
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        {/* Weight goal */}
        <Card>
          <CardTitle>Weight goal</CardTitle>
          <div className="grid grid-cols-3 gap-2 text-center">
            {(
              [
                ["Start", start, ""],
                ["Now", current, "text-accent"],
                ["Target", target, ""],
              ] as const
            ).map(([label, v, cls]) => (
              <div key={label} className="rounded-2xl bg-raised/70 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</div>
                <div className={`font-display text-xl font-bold tabular-nums ${cls}`}>{kg(v)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <ProgressBar value={progress} max={1} />
            <div className="mt-2 flex justify-between text-xs text-muted">
              <span className="font-semibold text-fg">{Math.round(progress * 100)}%</span>
              <span>{Math.abs(toGo) < 0.05 ? "Target reached" : `${Math.abs(toGo).toFixed(1)} kg to go`}</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
            <div>
              <div className="text-xs text-muted">{change <= 0 ? "Total lost" : "Total gained"}</div>
              <div className="font-display text-xl font-bold tabular-nums">{Math.abs(change).toFixed(1)} kg</div>
            </div>
            <div>
              <div className="text-xs text-muted">Since last weigh-in</div>
              {weekDelta === null ? (
                <div className="text-sm text-muted">Needs 2 weigh-ins</div>
              ) : (
                <div className={`flex items-center gap-0.5 font-display text-xl font-bold tabular-nums ${goodDelta ? "text-accent" : weekDelta === 0 ? "" : "text-warn"}`}>
                  {weekDelta < 0 ? <ArrowDownRight size={18} /> : weekDelta > 0 ? <ArrowUpRight size={18} /> : null}
                  {signed(weekDelta)} kg
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Last 7 days */}
        <Card className="lg:col-span-2 xl:col-span-3">
          <CardTitle hint={avg7 !== null ? `Average ${avg7.toLocaleString()} kcal a day on logged days` : "Nothing logged in the last 7 days"}>
            Calories, last 7 days
          </CardTitle>
          <CalorieBars data={last7} goal={goal} />
        </Card>

        {/* Weekly averages */}
        <Card className="lg:col-span-3 xl:col-span-2">
          <CardTitle hint="Average daily calories per week, logged days only">Weekly calorie averages</CardTitle>
          {hasWeekly ? (
            <CalorieBars data={weekly} goal={goal} />
          ) : (
            <p className="py-16 text-center text-sm text-muted">Log a few days of food to see weekly averages.</p>
          )}
        </Card>

        {/* Weight chart */}
        <Card className="lg:col-span-3 xl:col-span-2">
          <CardTitle hint={weights.length ? `${weights.length} weigh-in${weights.length === 1 ? "" : "s"} recorded` : undefined}>
            Weight progress
          </CardTitle>
          {weights.length >= 2 ? (
            <WeightLine
              data={weights.map((w) => ({ label: formatShort(w.date), tip: formatFull(w.date), value: w.weightKg }))}
              target={target}
            />
          ) : (
            <p className="py-16 text-center text-sm text-muted">
              Record at least two weigh-ins on the{" "}
              <Link href="/weight" className="font-semibold text-accent hover:underline">
                Weight page
              </Link>{" "}
              to see your progress chart.
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
