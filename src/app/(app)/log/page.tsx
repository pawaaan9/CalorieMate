"use client";

import { Pencil, Plus, Repeat2, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { DatePicker } from "@/components/DatePicker";
import { EntryEditor, FoodPicker } from "@/components/FoodPicker";
import { useData } from "@/components/Providers";
import { useToast } from "@/components/Toast";
import { Button, Card, EstimatedBadge, IconButton, MealIcon, PageHeader, ProgressBar, Spinner } from "@/components/ui";
import { addDays, formatLong, fromKey, todayKey, weekdayShort } from "@/lib/dates";
import { copyEntries, deleteEntry, restoreEntry } from "@/lib/db";
import { useEntries } from "@/lib/hooks";
import { MEAL_META, mealForNow } from "@/lib/meta";
import { sumMacros } from "@/lib/nutrition";
import { MEALS, type Entry, type Meal } from "@/lib/types";

const qty = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""));

function amountText(e: Entry): string {
  return e.portionLabel === "g" ? `${qty(e.quantity)} g` : `${qty(e.quantity)} × ${e.portionLabel}`;
}

/** Opens the picker when arriving via /log?add=1 or /log?meal=lunch. */
function OpenFromQuery({ onOpen }: { onOpen: (meal: Meal) => void }) {
  const params = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    const meal = params.get("meal") as Meal | null;
    if (!params.get("add") && !meal) return;
    onOpen(meal && meal in MEAL_META ? meal : mealForNow());
    router.replace("/log", { scroll: false });
  }, [params, router, onOpen]);
  return null;
}

export default function LogPage() {
  const { uid, profile } = useData();
  const toast = useToast();
  const today = todayKey();
  const [date, setDate] = useState(today);
  const [addTo, setAddTo] = useState<Meal | null>(null);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [copying, setCopying] = useState<Meal | null>(null);
  const entries = useEntries(uid, date);
  const yesterday = useEntries(uid, addDays(date, -1));

  const goal = profile?.dailyCalorieTarget ?? 0;
  const totals = sumMacros(entries ?? []);
  const remaining = goal - totals.calories;
  const strip = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

  async function remove(entry: Entry) {
    try {
      await deleteEntry(uid, entry, goal);
      toast(`Removed ${entry.foodName}`, {
        action: { label: "Undo", run: () => void restoreEntry(uid, entry, goal) },
      });
    } catch {
      toast("Could not delete the entry.", { tone: "error" });
    }
  }

  async function repeat(meal: Meal, items: Entry[]) {
    setCopying(meal);
    try {
      await copyEntries(uid, items, date, goal);
      toast(`Copied ${items.length} item${items.length === 1 ? "" : "s"} from the day before`);
    } catch {
      toast("Could not copy those entries.", { tone: "error" });
    } finally {
      setCopying(null);
    }
  }

  return (
    <>
      <Suspense fallback={null}>
        <OpenFromQuery onOpen={setAddTo} />
      </Suspense>

      <PageHeader
        photo={{ src: "/photos/curry.jpg", alt: "Bowls of curry with rice" }}
        title="Food log"
        subtitle={date === today ? `Today · ${formatLong(date)}` : formatLong(date)}
        action={
          <Button onClick={() => setAddTo(mealForNow())} className="hidden md:inline-flex">
            <Plus size={16} strokeWidth={2.5} /> Add food
          </Button>
        }
      />

      {/* Date strip */}
      <div className="no-scrollbar -mx-4 mb-5 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {strip.map((d) => {
          const active = d === date;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setDate(d)}
              aria-pressed={active}
              className={`flex w-14 shrink-0 flex-col items-center rounded-2xl border py-2 transition ${
                active ? "border-accent bg-accent text-accent-fg" : "border-line bg-card text-muted hover:text-fg"
              }`}
            >
              <span className="text-[11px] font-semibold uppercase">{d === today ? "Today" : weekdayShort(d)}</span>
              <span className="font-display text-lg font-bold leading-tight">{fromKey(d).getDate()}</span>
            </button>
          );
        })}
        <DatePicker
          variant="icon"
          label="Pick a date"
          value={date}
          max={today}
          onChange={(v) => v && setDate(v)}
          className={`h-[62px] w-14 ${strip.includes(date) ? "" : "border-accent! bg-accent! text-accent-fg!"}`}
        />
      </div>

      {/* Day summary */}
      <Card className="mb-5">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">
              {remaining >= 0 ? "Remaining" : "Over goal"}
            </div>
            <div className={`font-display text-5xl font-bold tabular-nums ${remaining < 0 ? "text-danger" : "text-accent"}`}>
              {Math.abs(remaining).toLocaleString()}
              <span className="ml-1 text-base font-medium text-muted">kcal</span>
            </div>
          </div>
          <div className="text-sm tabular-nums text-muted">
            <span className="font-bold text-fg">{totals.calories.toLocaleString()}</span> of {goal.toLocaleString()} eaten
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar value={totals.calories} max={goal} over={remaining < 0} />
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-3">
          {(
            [
              ["Protein", totals.protein, "bg-s1"],
              ["Carbs", totals.carbs, "bg-s2"],
              ["Fat", totals.fat, "bg-s3"],
            ] as const
          ).map(([label, value, dot]) => (
            <div key={label} className="rounded-2xl bg-raised/70 px-3 py-2">
              <dt className="flex items-center gap-1.5 text-xs text-muted">
                <span className={`h-2 w-2 rounded-full ${dot}`} />
                {label}
              </dt>
              <dd className="font-display text-lg font-bold tabular-nums">{Math.round(value)} g</dd>
            </div>
          ))}
        </dl>
      </Card>

      {entries === null ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {MEALS.map((meal) => {
            const items = entries.filter((e) => e.meal === meal.id);
            const before = (yesterday ?? []).filter((e) => e.meal === meal.id);
            const kcal = items.reduce((a, e) => a + e.calories, 0);
            const share = totals.calories > 0 ? Math.round((kcal / totals.calories) * 100) : 0;
            return (
              <Card key={meal.id}>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                    <MealIcon meal={meal.id} size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-bold">{meal.label}</h2>
                    <p className="text-xs tabular-nums text-muted">
                      {items.length ? `${kcal} kcal · ${share}% of today` : MEAL_META[meal.id].hint}
                    </p>
                  </div>
                  <IconButton
                    label={`Add to ${meal.label}`}
                    onClick={() => setAddTo(meal.id)}
                    className="h-10! w-10! bg-accent-soft text-accent! hover:bg-accent! hover:text-accent-fg!"
                  >
                    <Plus size={20} strokeWidth={2.5} />
                  </IconButton>
                </div>

                {items.length > 0 ? (
                  <ul className="mt-3 space-y-1">
                    {items.map((e) => (
                      <li key={e.id} className="group flex items-center gap-2 rounded-2xl px-2 py-2 transition hover:bg-raised">
                        <button type="button" onClick={() => setEditing(e)} className="min-w-0 flex-1 text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-semibold">{e.foodName}</span>
                            {e.estimated && <EstimatedBadge />}
                          </div>
                          <div className="truncate text-xs text-muted">
                            {amountText(e)} · P {Math.round(e.protein)} · C {Math.round(e.carbs)} · F {Math.round(e.fat)}
                          </div>
                        </button>
                        <div className="shrink-0 text-right font-display text-sm font-bold tabular-nums">{e.calories}</div>
                        <IconButton label={`Edit ${e.foodName}`} onClick={() => setEditing(e)} className="hidden sm:inline-flex">
                          <Pencil size={15} />
                        </IconButton>
                        <IconButton label={`Delete ${e.foodName}`} className="hover:text-danger!" onClick={() => remove(e)}>
                          <Trash2 size={15} />
                        </IconButton>
                      </li>
                    ))}
                  </ul>
                ) : before.length > 0 ? (
                  <button
                    type="button"
                    disabled={copying === meal.id}
                    onClick={() => repeat(meal.id, before)}
                    className="mt-3 flex w-full items-center gap-2 rounded-2xl border border-dashed border-line px-3 py-2.5 text-left text-sm text-muted transition hover:border-accent/60 hover:text-fg disabled:opacity-50"
                  >
                    <Repeat2 size={16} className="shrink-0 text-accent" />
                    <span className="min-w-0 flex-1 truncate">
                      Repeat {date === today ? "yesterday" : "the day before"}: {before.map((e) => e.foodName).join(", ")}
                    </span>
                    <span className="shrink-0 font-display font-bold text-fg">
                      {before.reduce((a, e) => a + e.calories, 0)}
                    </span>
                  </button>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}

      <p className="mt-5 text-xs text-muted">
        Tap an item to edit it. Foods marked <EstimatedBadge /> use estimated values; home-cooked dishes vary with coconut milk,
        oil and sugar.
      </p>

      <FoodPicker open={addTo !== null} onClose={() => setAddTo(null)} date={date} meal={addTo ?? "breakfast"} />
      <EntryEditor entry={editing} onClose={() => setEditing(null)} />
    </>
  );
}
