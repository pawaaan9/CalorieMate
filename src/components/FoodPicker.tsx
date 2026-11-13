"use client";

import { ArrowLeft, Globe, Minus, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { addEntry, updateEntry } from "@/lib/db";
import { macrosFor, naturalSugar } from "@/lib/nutrition";
import { searchOnline } from "@/lib/onlineSearch";
import { FOOD_CATEGORIES, MEALS, SOURCE_LABEL, type Entry, type Food, type Macros, type Meal, type Portion } from "@/lib/types";
import { FoodForm } from "./FoodForm";
import { useData } from "./Providers";
import { useToast } from "./Toast";
import { Button, CategoryIcon, Chip, ErrorNote, EstimatedBadge, FoodAvatar, Input, MealIcon, Modal, Spinner } from "./ui";

const GRAMS: Portion = { label: "g", grams: 1 };

export function portionText(p: Portion): string {
  return p.label === "g" ? "grams" : `${p.label} · ${p.grams} g`;
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
  const cell = (label: string, value: string, cls = "") => (
    <div key={label} className="min-w-0">
      <div className={`font-display text-base font-bold tabular-nums sm:text-lg ${cls}`}>{value}</div>
      <div className="truncate text-[11px] font-medium text-muted">{label}</div>
    </div>
  );
  return (
    <div className="space-y-3 rounded-3xl border border-line bg-raised px-2 py-3 text-center">
      <div className="grid grid-cols-4 gap-1 sm:gap-2">
        {cell("kcal", String(m.calories), "text-accent")}
        {cell("Protein", `${m.protein}g`)}
        {cell("Carbs", `${m.carbs}g`)}
        {cell("Fat", `${m.fat}g`)}
      </div>
      <div className="grid grid-cols-4 gap-1 border-t border-line pt-3 sm:gap-2">
        {cell("Fibre", `${m.fiber ?? 0}g`)}
        {cell("Sugar", `${m.sugar ?? 0}g`)}
        {cell("Natural", `${naturalSugar(m)}g`)}
        {cell("Added", `${m.addedSugar ?? 0}g`)}
      </div>
    </div>
  );
}

/** Portion + quantity + meal form shared by "add" and "edit". */
function AmountForm({
  title,
  category,
  subtitle,
  estimated,
  per100g,
  portions,
  initial,
  submitLabel,
  onSubmit,
}: {
  title: string;
  category: string;
  subtitle: string;
  estimated: boolean;
  per100g: Macros;
  portions: Portion[];
  /** `null` quantity starts empty, ready to type a scale reading. */
  initial: { portionIndex: number; quantity: number | null; meal: Meal };
  submitLabel: string;
  onSubmit: (v: { portion: Portion; quantity: number; meal: Meal }) => Promise<void>;
}) {
  const [portionIndex, setPortionIndex] = useState(initial.portionIndex);
  const [quantity, setQuantity] = useState(initial.quantity === null ? "" : String(initial.quantity));
  const [meal, setMeal] = useState<Meal>(initial.meal);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const portion = portions[portionIndex] ?? portions[0];
  const isGrams = portion.label === "g";
  const qty = parseFloat(quantity);
  const valid = Number.isFinite(qty) && qty > 0 && qty <= 5000;
  const grams = valid ? portion.grams * qty : 0;
  const step = isGrams ? 10 : 0.5;

  const nudge = (dir: 1 | -1) => {
    const base = Number.isFinite(qty) ? qty : 0;
    const next = Math.max(step, Math.round((base + dir * step) * 100) / 100);
    setQuantity(String(next));
  };

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
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <div className="flex items-center gap-3">
        <FoodAvatar category={category} size="lg" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-bold">{title}</h3>
            {estimated && <EstimatedBadge />}
          </div>
          <p className="truncate text-xs text-muted">{subtitle}</p>
        </div>
      </div>

      {/* Quantity stepper */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label="Less"
          onClick={() => nudge(-1)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-raised text-fg transition hover:border-accent/60 active:scale-95"
        >
          <Minus size={20} />
        </button>
        <div className="flex items-baseline justify-center">
          <input
            aria-label={isGrams ? "Weight in grams" : "Quantity"}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder={isGrams ? "0" : "1"}
            autoFocus={initial.quantity === null}
            onFocus={(e) => e.currentTarget.select()}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={`${isGrams ? "w-24" : "w-28"} bg-transparent text-center font-display text-4xl font-bold tabular-nums text-fg outline-none placeholder:text-muted/40`}
          />
          {isGrams && <span className="font-display text-xl font-bold text-muted">g</span>}
        </div>
        <button
          type="button"
          aria-label="More"
          onClick={() => nudge(1)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-raised text-fg transition hover:border-accent/60 active:scale-95"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Portion chips */}
      <div>
        <p className="mb-2 text-xs font-semibold text-muted">Portion</p>
        <div className="flex flex-wrap gap-2">
          {portions.map((p, i) => (
            <Chip
              key={`${p.label}-${i}`}
              active={i === portionIndex}
              onClick={() => {
                // Switching to or from raw grams resets the quantity to something sensible.
                if (p.label === "g" && !isGrams) setQuantity("100");
                if (p.label !== "g" && isGrams) setQuantity("1");
                setPortionIndex(i);
              }}
            >
              {portionText(p)}
            </Chip>
          ))}
        </div>
      </div>

      {/* Meal chips */}
      <div>
        <p className="mb-2 text-xs font-semibold text-muted">Meal</p>
        <div className="grid grid-cols-4 gap-2">
          {MEALS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMeal(m.id)}
              aria-pressed={meal === m.id}
              className={`flex flex-col items-center gap-0.5 rounded-2xl border py-2 text-xs font-semibold transition ${
                meal === m.id ? "border-accent bg-accent-soft text-accent" : "border-line bg-raised text-muted hover:text-fg"
              }`}
            >
              <MealIcon meal={m.id} size={20} />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <MacroPreview m={macrosFor(per100g, grams)} />
      <p className="text-center text-xs text-muted">
        {valid
          ? `${Math.round(grams)} g in total`
          : isGrams
            ? "Weigh it on your scale and type the grams"
            : "Enter a quantity above zero"}
        {estimated && " · estimated values"}
      </p>
      {error && <ErrorNote>{error}</ErrorNote>}
      <Button type="submit" size="lg" disabled={!valid || busy} className="w-full">
        {busy ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

function FoodRow({
  food,
  onPick,
  onQuickAdd,
  weigh = false,
}: {
  food: Food;
  onPick: (f: Food) => void;
  onQuickAdd: (f: Food) => void;
  weigh?: boolean;
}) {
  const p = food.portions[0] ?? { label: "100 g", grams: 100 };
  const kcal = Math.round((food.per100g.calories * p.grams) / 100);
  return (
    <li className="flex items-center gap-1 rounded-2xl transition hover:bg-raised">
      <button type="button" onClick={() => onPick(food)} className="flex min-w-0 flex-1 items-center gap-3 px-2 py-2 text-left">
        <FoodAvatar category={food.category} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold">{food.name}</span>
            {food.estimated && <EstimatedBadge />}
          </span>
          <span className="block truncate text-xs text-muted">
            {food.brand ? `${food.brand} · ` : food.source === "usda" || food.source === "off" ? `${SOURCE_LABEL[food.source]} · ` : ""}
            {weigh ? (
              <>
                <span className="font-semibold text-fg">{food.per100g.calories} kcal</span> / 100 g
              </>
            ) : (
              <>
                1 {p.label} · <span className="font-semibold text-fg">{kcal} kcal</span>
              </>
            )}
          </span>
        </span>
      </button>
      <button
        type="button"
        aria-label={weigh ? `Weigh and add ${food.name}` : `Quick add 1 ${p.label} of ${food.name}`}
        title={weigh ? "Weigh and add" : `Add 1 ${p.label}`}
        onClick={() => (weigh ? onPick(food) : onQuickAdd(food))}
        className="mr-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent transition hover:bg-accent hover:text-accent-fg active:scale-90"
      >
        <Plus size={18} strokeWidth={2.5} />
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
  const toast = useToast();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [picked, setPicked] = useState<Food | null>(null);
  const [creating, setCreating] = useState<string | null>(null);
  const weigh = profile?.weighFood ?? false;
  const [online, setOnline] = useState<{ q: string; foods: Food[]; failed: string[] } | null>(null);
  const [searching, setSearching] = useState(false);

  const query = q.trim();
  const recent = useMemo(
    () => (query || category ? [] : foods.filter((f) => f.lastUsedAt).sort((a, b) => (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0)).slice(0, 8)),
    [foods, query, category],
  );
  const local = useMemo(() => {
    const matched = searchFoods(foods, q);
    const filtered = category ? matched.filter((f) => f.category === category) : matched;
    // With no search, "Recent" already lists those foods, so don't repeat them.
    const shown = new Set(recent.map((f) => f.id));
    return filtered.filter((f) => !shown.has(f.id)).slice(0, 60);
  }, [foods, q, category, recent]);
  const onlineFoods = useMemo(() => {
    if (!online || online.q !== query) return [];
    const known = new Set(foods.map((f) => f.id));
    return online.foods.filter((f) => !known.has(f.id));
  }, [online, query, foods]);
  const onlineDone = online?.q === query;
  const goal = profile?.dailyCalorieTarget ?? 0;

  async function runOnline() {
    if (query.length < 2 || searching) return;
    setSearching(true);
    const result = await searchOnline(uid, query);
    setOnline({ q: query, foods: result.foods, failed: result.failed });
    setSearching(false);
  }

  async function quickAdd(food: Food) {
    const portion = food.portions[0] ?? { label: "serving", grams: 100 };
    try {
      await addEntry(uid, { date, meal, food, portion, quantity: 1 }, goal);
      toast(`Added 1 ${portion.label} of ${food.name}`);
    } catch {
      toast("Could not add that. Try again.", { tone: "error" });
    }
  }

  function close() {
    setCreating(null);
    setPicked(null);
    setQ("");
    setCategory(null);
    setOnline(null);
    onClose();
  }

  const mealLabel = MEALS.find((m) => m.id === meal)?.label ?? "Meal";

  return (
    <Modal
      open={open}
      onClose={close}
      title={
        <span className="flex items-center gap-2">
          <MealIcon meal={meal} size={20} className="text-accent" /> Add to {mealLabel.toLowerCase()}
        </span>
      }
    >
      {creating !== null ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setCreating(null)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-fg"
          >
            <ArrowLeft size={15} /> Back to search
          </button>
          <FoodForm
            food={null}
            initialName={creating}
            onCancel={() => setCreating(null)}
            onSaved={(food) => {
              toast(`${food.name} saved to your foods`);
              setCreating(null);
              setPicked(food);
            }}
          />
        </div>
      ) : picked ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setPicked(null)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-fg"
          >
            <ArrowLeft size={15} /> Back
          </button>
          <AmountForm
            key={picked.id}
            title={picked.name}
            category={picked.category}
            subtitle={`${picked.brand ? `${picked.brand} · ` : ""}${SOURCE_LABEL[picked.source]} · ${picked.per100g.calories} kcal / 100 g`}
            estimated={picked.estimated}
            per100g={picked.per100g}
            portions={weigh ? [GRAMS, ...picked.portions] : [...picked.portions, GRAMS]}
            initial={{ portionIndex: 0, quantity: weigh ? null : 1, meal }}
            submitLabel="Add to log"
            onSubmit={async ({ portion, quantity, meal: m }) => {
              await addEntry(uid, { date, meal: m, food: picked, portion, quantity }, goal);
              toast(`${picked.name} added to ${MEALS.find((x) => x.id === m)?.label.toLowerCase()}`);
              setPicked(null);
              setQ("");
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <Search size={17} className="pointer-events-none absolute left-3.5 top-3.5 text-muted" />
            <Input
              autoFocus
              placeholder="Search kottu, parippu, pol roti…"
              className="pl-10"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && local.length === 0) void runOnline();
              }}
            />
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <Chip active={category === null} onClick={() => setCategory(null)}>
              All
            </Chip>
            {FOOD_CATEGORIES.filter((c) => c !== "Other").map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? null : c)}>
                <CategoryIcon category={c} size={15} /> {c}
              </Chip>
            ))}
          </div>

          {recent.length > 0 && (
            <div>
              <p className="mb-1 px-1 text-xs font-bold uppercase tracking-wider text-muted">Recent</p>
              <ul className="-mx-2">
                {recent.map((f) => (
                  <FoodRow key={f.id} food={f} onPick={setPicked} onQuickAdd={quickAdd} weigh={weigh} />
                ))}
              </ul>
            </div>
          )}

          {local.length > 0 ? (
            <div>
              <p className="mb-1 px-1 text-xs font-bold uppercase tracking-wider text-muted">
                {query ? "My foods" : category ?? "All foods"}
              </p>
              <ul className="-mx-2">
                {local.map((f) => (
                  <FoodRow key={f.id} food={f} onPick={setPicked} onQuickAdd={quickAdd} weigh={weigh} />
                ))}
              </ul>
            </div>
          ) : (
            <p className="px-1 py-3 text-sm text-muted">
              Nothing saved matches “{query}”{category ? ` in ${category}` : ""}.
            </p>
          )}

          <button
            type="button"
            onClick={() => setCreating(query)}
            className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-line px-3 py-3 text-left text-sm transition hover:border-accent/60"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <Plus size={18} strokeWidth={2.5} />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold">
                {query ? `Create “${query}”` : "Create a new food"}
              </span>
              <span className="block text-xs text-muted">Add your own food from its nutrition label</span>
            </span>
          </button>

          {query.length >= 2 && (
            <div className="border-t border-line pt-4">
              {!onlineDone && (
                <Button variant="secondary" className="w-full" onClick={runOnline} disabled={searching}>
                  {searching ? <Spinner className="h-4 w-4" /> : <Globe size={15} />}
                  {searching ? "Searching…" : `Search “${query}” online`}
                </Button>
              )}
              {onlineDone && online && (
                <div className="space-y-2">
                  {online.failed.length > 0 && (
                    <p className="rounded-2xl bg-raised px-3.5 py-2.5 text-xs text-muted">
                      {online.failed.join(", ").replace(/, ([^,]*)$/, " and $1")} did not respond just now
                      {online.foods.length > 0 ? ", so these results are partial." : ". Your saved foods still work."}{" "}
                      <button type="button" className="font-semibold text-accent hover:underline" onClick={runOnline}>
                        Try again
                      </button>
                    </p>
                  )}
                  {onlineFoods.length > 0 && (
                    <div>
                      <p className="mb-1 px-1 text-xs font-bold uppercase tracking-wider text-muted">Online results</p>
                      <ul className="-mx-2">
                        {onlineFoods.map((f) => (
                          <FoodRow key={f.id} food={f} onPick={setPicked} onQuickAdd={quickAdd} weigh={weigh} />
                        ))}
                      </ul>
                    </div>
                  )}
                  {onlineFoods.length === 0 && online.failed.length === 0 && (
                    <p className="px-1 text-sm text-muted">No online results. Create it yourself with the button above.</p>
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
  const toast = useToast();
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
        category={food?.category ?? "Other"}
        subtitle={`${SOURCE_LABEL[entry.source]} · ${entry.per100g.calories} kcal / 100 g`}
        estimated={entry.estimated}
        per100g={entry.per100g}
        portions={portions}
        initial={{ portionIndex: index, quantity: entry.quantity, meal: entry.meal }}
        submitLabel="Save changes"
        onSubmit={async (changes) => {
          await updateEntry(uid, entry, changes, profile?.dailyCalorieTarget ?? 0);
          toast("Entry updated");
          onClose();
        }}
      />
    </Modal>
  );
}
