"use client";

import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { EntryEditor, FoodPicker } from "@/components/FoodPicker";
import { useData } from "@/components/Providers";
import { Button, Card, ErrorNote, EstimatedBadge, IconButton, PageHeader, ProgressBar, Spinner } from "@/components/ui";
import { addDays, formatLong, todayKey } from "@/lib/dates";
import { deleteEntry } from "@/lib/db";
import { useEntries } from "@/lib/hooks";
import { sumMacros } from "@/lib/nutrition";
import { MEALS, type Entry, type Meal } from "@/lib/types";

const qty = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""));

function amountText(e: Entry): string {
  return e.portionLabel === "g" ? `${qty(e.quantity)} g` : `${qty(e.quantity)} × ${e.portionLabel} · ${Math.round(e.grams)} g`;
}

export default function LogPage() {
  const { uid, profile } = useData();
  const today = todayKey();
  const [date, setDate] = useState(today);
  const [addTo, setAddTo] = useState<Meal | null>(null);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const entries = useEntries(uid, date);

  const goal = profile?.dailyCalorieTarget ?? 0;
  const totals = sumMacros(entries ?? []);
  const remaining = goal - totals.calories;

  async function remove(entry: Entry) {
    setError(null);
    try {
      await deleteEntry(uid, entry, goal);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete the entry.");
    }
  }

  return (
    <>
      <PageHeader title="Food log" subtitle={date === today ? `Today · ${formatLong(date)}` : formatLong(date)} />

      <div className="mb-4 flex items-center gap-2">
        <IconButton label="Previous day" className="border border-line bg-card" onClick={() => setDate(addDays(date, -1))}>
          <ChevronLeft size={18} />
        </IconButton>
        <input
          type="date"
          aria-label="Date"
          value={date}
          max={today}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          className="h-8 min-w-0 rounded-lg border border-line bg-card px-2 text-sm text-fg"
        />
        <IconButton label="Next day" className="border border-line bg-card" disabled={date >= today} onClick={() => setDate(addDays(date, 1))}>
          <ChevronRight size={18} />
        </IconButton>
        {date !== today && (
          <Button variant="ghost" size="sm" onClick={() => setDate(today)}>
            Today
          </Button>
        )}
      </div>

      <Card className="mb-4">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <div className="text-xs text-muted">{remaining >= 0 ? "Remaining" : "Over goal"}</div>
            <div className={`text-3xl font-semibold tabular-nums ${remaining < 0 ? "text-danger" : ""}`}>
              {Math.abs(remaining)} <span className="text-sm font-normal text-muted">kcal</span>
            </div>
          </div>
          <div className="text-sm tabular-nums text-muted">
            <span className="font-medium text-fg">{totals.calories}</span> eaten of{" "}
            <span className="font-medium text-fg">{goal}</span> kcal
          </div>
        </div>
        <div className="mt-3">
          <ProgressBar value={totals.calories} max={goal} over={remaining < 0} />
        </div>
        <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
          {[
            ["Protein", totals.protein],
            ["Carbs", totals.carbs],
            ["Fat", totals.fat],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="font-medium tabular-nums">{Math.round(value as number)} g</dd>
            </div>
          ))}
        </dl>
      </Card>

      {error && (
        <div className="mb-4">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}

      {entries === null ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {MEALS.map((meal) => {
            const items = entries.filter((e) => e.meal === meal.id);
            const kcal = items.reduce((a, e) => a + e.calories, 0);
            return (
              <Card key={meal.id}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold">{meal.label}</h2>
                    <p className="text-xs tabular-nums text-muted">{items.length ? `${kcal} kcal` : "Nothing logged"}</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => setAddTo(meal.id)}>
                    <Plus size={14} /> Add food
                  </Button>
                </div>
                {items.length > 0 && (
                  <ul className="mt-3 divide-y divide-line border-t border-line">
                    {items.map((e) => (
                      <li key={e.id} className="flex items-center gap-2 py-2.5">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-medium">{e.foodName}</span>
                            {e.estimated && <EstimatedBadge />}
                          </div>
                          <div className="truncate text-xs text-muted">
                            {amountText(e)} · P {e.protein} · C {e.carbs} · F {e.fat}
                          </div>
                        </div>
                        <div className="shrink-0 text-right text-sm font-semibold tabular-nums">{e.calories}</div>
                        <IconButton label={`Edit ${e.foodName}`} onClick={() => setEditing(e)}>
                          <Pencil size={15} />
                        </IconButton>
                        <IconButton label={`Delete ${e.foodName}`} className="hover:text-danger" onClick={() => remove(e)}>
                          <Trash2 size={15} />
                        </IconButton>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-xs text-muted">
        Foods marked <EstimatedBadge /> use estimated nutritional values. Home-cooked Sri Lankan dishes vary with the amount of
        coconut milk, oil and sugar used.
      </p>

      <FoodPicker open={addTo !== null} onClose={() => setAddTo(null)} date={date} meal={addTo ?? "breakfast"} />
      <EntryEditor entry={editing} onClose={() => setEditing(null)} />
    </>
  );
}
