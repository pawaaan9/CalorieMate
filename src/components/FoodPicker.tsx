"use client";

import { ArrowLeft, Check, Globe, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { addEntry, updateEntry } from "@/lib/db";
import { macrosFor } from "@/lib/nutrition";
import { searchOnline } from "@/lib/onlineSearch";
import { MEALS, SOURCE_LABEL, type Entry, type Food, type Macros, type Meal, type Portion } from "@/lib/types";
import { useData } from "./Providers";
import { Button, ErrorNote, EstimatedBadge, Field, Input, Modal, Select, Spinner } from "./ui";

const GRAMS: Portion = { label: "g", grams: 1 };

export function portionText(p: Portion): string {
  return p.label === "g" ? "grams (g)" : `${p.label} (${p.grams} g)`;
}

export function searchFoods(foods: Food[], q: string): Food[] {
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    // Recently used first, then alphabetical.
    return [...foods].sort((a, b) => (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0) || a.name.localeCompare(b.name));
  }
  const first = tokens[0];
  return foods
    .filter((f) => {
      const hay = `${f.name} ${(f.aliases ?? []).join(" ")} ${f.brand ?? ""}`.toLowerCase();
      return tokens.every((t) => hay.includes(t));
    })
    .sort((a, b) => {
      const rank = (f: Food) => (f.name.toLowerCase().startsWith(first) ? 0 : f.name.toLowerCase().includes(first) ? 1 : 2);
      return rank(a) - rank(b) || a.name.localeCompare(b.name);
    });
}

function MacroPreview({ m }: { m: Macros }) {
  return (
    <div className="grid grid-cols-4 gap-2 rounded-xl bg-subtle p-3 text-center">
      {[
        ["Calories", `${m.calories}`, "kcal"],
        ["Protein", `${m.protein}`, "g"],
        ["Carbs", `${m.carbs}`, "g"],
        ["Fat", `${m.fat}`, "g"],
      ].map(([label, value, unit]) => (
        <div key={label}>
          <div className="text-base font-semibold tabular-nums">
            {value}
            <span className="ml-0.5 text-xs font-normal text-muted">{unit}</span>
          </div>
          <div className="text-[11px] text-muted">{label}</div>
        </div>
      ))}
    </div>
  );
}

/** Portion + quantity + meal form shared by "add" and "edit". */
function AmountForm({
  title,
  subtitle,
  estimated,
  per100g,
  portions,
  initial,
  submitLabel,
  onSubmit,
}: {
  title: string;
  subtitle: string;
  estimated: boolean;
  per100g: Macros;
  portions: Portion[];
  initial: { portionIndex: number; quantity: number; meal: Meal };
  submitLabel: string;
  onSubmit: (v: { portion: Portion; quantity: number; meal: Meal }) => Promise<void>;
}) {
  const [portionIndex, setPortionIndex] = useState(initial.portionIndex);
  const [quantity, setQuantity] = useState(String(initial.quantity));
  const [meal, setMeal] = useState<Meal>(initial.meal);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const portion = portions[portionIndex] ?? portions[0];
  const qty = parseFloat(quantity);
  const valid = Number.isFinite(qty) && qty > 0 && qty <= 5000;
  const grams = valid ? portion.grams * qty : 0;

  async function submit() {
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit({ portion, quantity: qty, meal });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save. Try again.");
      setBusy(false);
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <div>
        <div className="flex items-center gap-2">
          <h3 className="min-w-0 text-base font-semibold">{title}</h3>
          {estimated && <EstimatedBadge />}
        </div>
        <p className="text-xs text-muted">{subtitle}</p>
      </div>
      <div className="grid grid-cols-[1fr_2fr] gap-3">
        <Field label="Quantity">
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            autoFocus
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </Field>
        <Field label="Portion">
          <Select
            value={portionIndex}
            onChange={(e) => {
              const i = Number(e.target.value);
              // Switching to or from raw grams resets the quantity to something sensible.
              if (portions[i].label === "g" && portion.label !== "g") setQuantity("100");
              if (portions[i].label !== "g" && portion.label === "g") setQuantity("1");
              setPortionIndex(i);
            }}
          >
            {portions.map((p, i) => (
              <option key={`${p.label}-${i}`} value={i}>
                {portionText(p)}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Meal">
        <Select value={meal} onChange={(e) => setMeal(e.target.value as Meal)}>
          {MEALS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </Select>
      </Field>
      <MacroPreview m={macrosFor(per100g, grams)} />
      <p className="text-xs text-muted">
        {valid ? `${Math.round(grams)} g in total.` : "Enter a quantity above zero."}
        {estimated && " Values for this food are estimates."}
      </p>
      {error && <ErrorNote>{error}</ErrorNote>}
      <Button type="submit" disabled={!valid || busy} className="w-full">
        {busy ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

function FoodRow({ food, onPick }: { food: Food; onPick: (f: Food) => void }) {
  const p = food.portions[0] ?? { label: "100 g", grams: 100 };
  const kcal = Math.round((food.per100g.calories * p.grams) / 100);
  return (
    <li>
      <button
        type="button"
        onClick={() => onPick(food)}
        className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-subtle"
      >
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium">{food.name}</span>
            {food.estimated && <EstimatedBadge />}
          </span>
          <span className="block truncate text-xs text-muted">
            {food.brand ? `${food.brand} · ` : ""}
            {food.source === "seed" || food.source === "custom" ? food.category : SOURCE_LABEL[food.source]}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-sm font-semibold tabular-nums">{kcal} kcal</span>
          <span className="block text-xs text-muted">per {p.label}</span>
        </span>
      </button>
    </li>
  );
}

export function FoodPicker({
  open,
  onClose,
  date,
  meal,
}: {
  open: boolean;
  onClose: () => void;
  date: string;
  meal: Meal;
}) {
  const { uid, foods, profile } = useData();
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<Food | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const [online, setOnline] = useState<{ q: string; foods: Food[]; failed: string[] } | null>(null);
  const [searching, setSearching] = useState(false);

  const local = useMemo(() => searchFoods(foods, q).slice(0, 40), [foods, q]);
  const query = q.trim();
  const onlineFoods = useMemo(() => {
    if (!online || online.q !== query) return [];
    const known = new Set(foods.map((f) => f.id));
    return online.foods.filter((f) => !known.has(f.id));
  }, [online, query, foods]);
  const onlineDone = online?.q === query;

  async function runOnline() {
    if (query.length < 2 || searching) return;
    setSearching(true);
    const result = await searchOnline(uid, query);
    setOnline({ q: query, foods: result.foods, failed: result.failed });
    setSearching(false);
  }

  function close() {
    setPicked(null);
    setAdded(null);
    setQ("");
    setOnline(null);
    onClose();
  }

  const mealLabel = MEALS.find((m) => m.id === meal)?.label ?? "meal";

  return (
    <Modal open={open} onClose={close} title={`Add to ${mealLabel.toLowerCase()}`}>
      {picked ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setPicked(null)}
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
          >
            <ArrowLeft size={15} /> Back to search
          </button>
          <AmountForm
            key={picked.id}
            title={picked.name}
            subtitle={`${picked.brand ? `${picked.brand} · ` : ""}${SOURCE_LABEL[picked.source]} · ${picked.per100g.calories} kcal per 100 g`}
            estimated={picked.estimated}
            per100g={picked.per100g}
            portions={[...picked.portions, GRAMS]}
            initial={{ portionIndex: 0, quantity: 1, meal }}
            submitLabel="Add to log"
            onSubmit={async ({ portion, quantity, meal: m }) => {
              await addEntry(uid, { date, meal: m, food: picked, portion, quantity }, profile?.dailyCalorieTarget ?? 0);
              setAdded(picked.name);
              setPicked(null);
              setQ("");
            }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-3 text-muted" />
            <Input
              autoFocus
              placeholder="Search foods, e.g. dhal, pol roti, kottu"
              className="pl-9"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setAdded(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && local.length === 0) void runOnline();
              }}
            />
          </div>

          {added && (
            <p className="flex items-center gap-1.5 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
              <Check size={15} /> Added {added}. Add another or close.
            </p>
          )}

          {local.length > 0 ? (
            <div>
              <p className="mb-1 px-2 text-xs font-medium text-muted">{query ? "My foods" : "Recent and saved foods"}</p>
              <ul className="-mx-2 px-0">
                {local.map((f) => (
                  <FoodRow key={f.id} food={f} onPick={setPicked} />
                ))}
              </ul>
            </div>
          ) : (
            <p className="px-2 py-3 text-sm text-muted">Nothing in your food database matches “{query}”.</p>
          )}

          {query.length >= 2 && (
            <div className="border-t border-line pt-3">
              {!onlineDone && (
                <Button variant="secondary" className="w-full" onClick={runOnline} disabled={searching}>
                  {searching ? <Spinner className="h-4 w-4" /> : <Globe size={15} />}
                  {searching ? "Searching…" : "Search USDA and Open Food Facts"}
                </Button>
              )}
              {onlineDone && online && (
                <div className="space-y-2">
                  {online.failed.length > 0 && (
                    <p className="rounded-lg bg-subtle px-3 py-2 text-xs text-muted">
                      {online.failed.join(" and ")} did not respond just now
                      {online.foods.length > 0 ? ", so these results are partial." : ". Your saved foods still work."}{" "}
                      <button type="button" className="font-medium text-accent hover:underline" onClick={runOnline}>
                        Try again
                      </button>
                    </p>
                  )}
                  {onlineFoods.length > 0 && (
                    <div>
                      <p className="mb-1 px-2 text-xs font-medium text-muted">Online results</p>
                      <ul className="-mx-2">
                        {onlineFoods.map((f) => (
                          <FoodRow key={f.id} food={f} onPick={setPicked} />
                        ))}
                      </ul>
                    </div>
                  )}
                  {onlineFoods.length === 0 && online.failed.length === 0 && (
                    <p className="px-2 text-sm text-muted">
                      No online results. You can add it yourself on the Foods page.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export function EntryEditor({ entry, onClose }: { entry: Entry | null; onClose: () => void }) {
  const { uid, foods, profile } = useData();
  if (!entry) return null;

  // Offer the food's current portions, plus the one this entry was logged with.
  const food = foods.find((f) => f.id === entry.foodId);
  const portions: Portion[] = [...(food?.portions ?? [])];
  let index = portions.findIndex((p) => p.label === entry.portionLabel && p.grams === entry.portionGrams);
  if (entry.portionLabel === "g") index = portions.length;
  else if (index === -1) {
    portions.unshift({ label: entry.portionLabel, grams: entry.portionGrams });
    index = 0;
  }
  portions.push(GRAMS);

  return (
    <Modal open onClose={onClose} title="Edit entry">
      <AmountForm
        key={entry.id}
        title={entry.foodName}
        subtitle={`${SOURCE_LABEL[entry.source]} · ${entry.per100g.calories} kcal per 100 g`}
        estimated={entry.estimated}
        per100g={entry.per100g}
        portions={portions}
        initial={{ portionIndex: index, quantity: entry.quantity, meal: entry.meal }}
        submitLabel="Save changes"
        onSubmit={async (changes) => {
          await updateEntry(uid, entry, changes, profile?.dailyCalorieTarget ?? 0);
          onClose();
        }}
      />
    </Modal>
  );
}
