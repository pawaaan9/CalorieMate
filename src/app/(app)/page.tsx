"use client";

import { ArrowDown, ArrowRight, ArrowUp, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { CalorieBars, WeightLine, type BarPoint } from "@/components/charts";
import { useData } from "@/components/Providers";
import { Card, CardTitle, PageHeader, ProgressBar, Ring } from "@/components/ui";
import { addDays, daysBetween, formatFull, formatLong, formatShort, todayKey, weekStart, weekdayShort } from "@/lib/dates";
import { useSummaries } from "@/lib/hooks";
import type { DailySummary } from "@/lib/types";

const WEEKS = 8;
const kg = (n: number) => `${n.toFixed(1)} kg`;
const signed = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(1)} kg`;

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
      {sub && <div className="text-xs text-muted">{sub}</div>}
    </div>
  );
}

function MacroBar({ label, grams, calories, total, color }: { label: string; grams: number; calories: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((calories / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: color }} />
          {label}
        </span>
        <span className="tabular-nums text-muted">
          <span className="font-medium text-fg">{Math.round(grams)} g</span> · {pct}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-subtle">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function average(days: DailySummary[]): number | null {
  const logged = days.filter((d) => d.entryCount > 0);
  return logged.length ? Math.round(logged.reduce((a, d) => a + d.calories, 0) / logged.length) : null;
}

export default function DashboardPage() {
  const { uid, profile, weights, currentWeightKg } = useData();
  const today = todayKey();
  const from = useMemo(() => weekStart(addDays(today, -7 * (WEEKS - 1))), [today]);
  const summaries = useSummaries(uid, from);

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

  const macroCals = {
    protein: (todaySummary?.protein ?? 0) * 4,
    carbs: (todaySummary?.carbs ?? 0) * 4,
    fat: (todaySummary?.fat ?? 0) * 9,
  };
  const macroTotal = macroCals.protein + macroCals.carbs + macroCals.fat;

  return (
    <>
      <PageHeader
        title={profile?.displayName ? `Hello, ${profile.displayName}` : "Dashboard"}
        subtitle={formatLong(today)}
        action={
          <Link
            href="/log"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg hover:opacity-90"
          >
            <Plus size={16} /> Log food
          </Link>
        }
      />

      {profile && !profile.onboarded && (
        <Link
          href="/settings"
          className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-accent-soft px-4 py-3 text-sm text-accent"
        >
          <span>
            <strong className="font-semibold">Set up your goals.</strong> Add your weight, height and target to get a personal
            calorie goal.
          </span>
          <ArrowRight size={18} className="shrink-0" />
        </Link>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Today */}
        <Card>
          <CardTitle>Today</CardTitle>
          <div className="flex flex-wrap items-center gap-5">
            <Ring value={eaten} max={goal}>
              <span className="text-2xl font-semibold tabular-nums">{Math.abs(remaining)}</span>
              <span className="text-xs text-muted">{remaining >= 0 ? "kcal left" : "kcal over"}</span>
            </Ring>
            <div className="min-w-40 flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Eaten" value={`${eaten}`} sub="kcal" />
                <Stat label="Goal" value={`${goal}`} sub="kcal" />
              </div>
              <MacroBar label="Protein" grams={todaySummary?.protein ?? 0} calories={macroCals.protein} total={macroTotal} color="var(--s1)" />
              <MacroBar label="Carbs" grams={todaySummary?.carbs ?? 0} calories={macroCals.carbs} total={macroTotal} color="var(--s2)" />
              <MacroBar label="Fat" grams={todaySummary?.fat ?? 0} calories={macroCals.fat} total={macroTotal} color="var(--s3)" />
            </div>
          </div>
        </Card>

        {/* Weight goal */}
        <Card>
          <CardTitle>Weight goal</CardTitle>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Start" value={kg(start)} />
            <Stat label="Current" value={kg(current)} sub={latest ? formatShort(latest.date) : "no weigh-ins yet"} />
            <Stat label="Target" value={kg(target)} />
          </div>
          <div className="mt-4">
            <ProgressBar value={progress} max={1} />
            <div className="mt-1.5 flex justify-between text-xs text-muted">
              <span>{Math.round(progress * 100)}% of the way</span>
              <span>{Math.abs(toGo) < 0.05 ? "Target reached" : `${Math.abs(toGo).toFixed(1)} kg to go`}</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
            <Stat
              label={change <= 0 ? "Total lost" : "Total gained"}
              value={kg(Math.abs(change))}
              sub="since starting weight"
            />
            <div>
              <div className="text-xs text-muted">Since last weigh-in</div>
              {weekDelta === null ? (
                <div className="text-sm text-muted">Needs two weigh-ins</div>
              ) : (
                <div className="flex items-center gap-1 text-xl font-semibold tabular-nums">
                  {weekDelta !== 0 &&
                    (weekDelta < 0 ? <ArrowDown size={18} className={losing ? "text-accent" : "text-warn"} /> : <ArrowUp size={18} className={losing ? "text-warn" : "text-accent"} />)}
                  {signed(weekDelta)}
                </div>
              )}
              {previous && <div className="text-xs text-muted">vs {formatShort(previous.date)}</div>}
            </div>
          </div>
          {dueForWeighIn && (
            <Link href="/weight" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
              Time for this week&apos;s weigh-in <ArrowRight size={15} />
            </Link>
          )}
        </Card>

        {/* Last 7 days */}
        <Card>
          <CardTitle hint={avg7 !== null ? `Average ${avg7} kcal a day on logged days` : "Nothing logged in the last 7 days"}>
            Calories, last 7 days
          </CardTitle>
          <CalorieBars data={last7} goal={goal} />
        </Card>

        {/* Weekly averages */}
        <Card>
          <CardTitle hint="Average daily calories per week, logged days only">Weekly calorie averages</CardTitle>
          {hasWeekly ? (
            <CalorieBars data={weekly} goal={goal} />
          ) : (
            <p className="py-16 text-center text-sm text-muted">Log a few days of food to see weekly averages.</p>
          )}
        </Card>

        {/* Weight chart */}
        <Card className="lg:col-span-2">
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
              <Link href="/weight" className="font-medium text-accent hover:underline">
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
