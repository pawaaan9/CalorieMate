"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { saveFood } from "@/lib/db";
import { FOOD_CATEGORIES, type Food } from "@/lib/types";
import { useData } from "./Providers";
import { Button, ErrorNote, Field, IconButton, Input, Modal, Select } from "./ui";

interface PortionRow {
  label: string;
  grams: string;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

function Form({ food, onClose }: { food: Food | null; onClose: () => void }) {
  const { uid } = useData();
  const [name, setName] = useState(food?.name ?? "");
  const [category, setCategory] = useState(food?.category ?? "Other");
  const [basis, setBasis] = useState("100");
  const [calories, setCalories] = useState(food ? String(food.per100g.calories) : "");
  const [protein, setProtein] = useState(food ? String(food.per100g.protein) : "");
  const [carbs, setCarbs] = useState(food ? String(food.per100g.carbs) : "");
  const [fat, setFat] = useState(food ? String(food.per100g.fat) : "");
  const [estimated, setEstimated] = useState(food?.estimated ?? true);
  const [portions, setPortions] = useState<PortionRow[]>(
    food?.portions.map((p) => ({ label: p.label, grams: String(p.grams) })) ?? [{ label: "serving", grams: "100" }],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setPortion = (i: number, patch: Partial<PortionRow>) =>
    setPortions((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  async function submit() {
    const basisG = parseFloat(basis);
    const kcal = parseFloat(calories);
    const cleanPortions = portions
      .map((p) => ({ label: p.label.trim(), grams: parseFloat(p.grams) }))
      .filter((p) => p.label && Number.isFinite(p.grams) && p.grams > 0);

    if (!name.trim()) return setError("Give the food a name.");
    if (!Number.isFinite(basisG) || basisG <= 0) return setError("Enter the weight the nutrition values are for.");
    if (!Number.isFinite(kcal) || kcal < 0) return setError("Enter the calories.");
    if (cleanPortions.length === 0) return setError("Add at least one portion with a weight in grams.");

    const k = 100 / basisG;
    const macro = (v: string) => round1(Math.max(0, parseFloat(v) || 0) * k);
    setBusy(true);
    setError(null);
    try {
      await saveFood(uid, {
        id: food?.id,
        name: name.trim(),
        aliases: food?.aliases ?? [],
        brand: food?.brand,
        category,
        per100g: { calories: Math.round(kcal * k), protein: macro(protein), carbs: macro(carbs), fat: macro(fat) },
        portions: cleanPortions,
        estimated,
        // Edited built-in foods stay in the database under their original id.
        source: food?.source ?? "custom",
        lastUsedAt: food?.lastUsedAt,
      });
      onClose();
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
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <Field label="Name">
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Amma's chicken curry" />
        </Field>
        <Field label="Category">
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {FOOD_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
      </div>

      <fieldset className="space-y-3 rounded-3xl border border-line p-4">
        <legend className="px-1 text-xs font-medium text-muted">Nutrition</legend>
        <Field label="Values below are for this many grams" hint="Use 100 for per-100 g values, or the pack's serving weight.">
          <Input type="number" inputMode="decimal" min="0" step="any" value={basis} onChange={(e) => setBasis(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="Calories (kcal)">
            <Input type="number" inputMode="decimal" min="0" step="any" value={calories} onChange={(e) => setCalories(e.target.value)} />
          </Field>
          <Field label="Protein (g)">
            <Input type="number" inputMode="decimal" min="0" step="any" value={protein} onChange={(e) => setProtein(e.target.value)} />
          </Field>
          <Field label="Carbs (g)">
            <Input type="number" inputMode="decimal" min="0" step="any" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
          </Field>
          <Field label="Fat (g)">
            <Input type="number" inputMode="decimal" min="0" step="any" value={fat} onChange={(e) => setFat(e.target.value)} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-[#bfee57]" checked={estimated} onChange={(e) => setEstimated(e.target.checked)} />
          These values are estimates
        </label>
      </fieldset>

      <fieldset className="space-y-2 rounded-3xl border border-line p-4">
        <legend className="px-1 text-xs font-medium text-muted">Portions</legend>
        {portions.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              aria-label="Portion name"
              placeholder="cup, piece, tablespoon…"
              value={row.label}
              onChange={(e) => setPortion(i, { label: e.target.value })}
            />
            <Input
              aria-label="Weight in grams"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="grams"
              className="w-24!"
              value={row.grams}
              onChange={(e) => setPortion(i, { grams: e.target.value })}
            />
            <IconButton label="Remove portion" disabled={portions.length === 1} onClick={() => setPortions((r) => r.filter((_, j) => j !== i))}>
              <Trash2 size={15} />
            </IconButton>
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={() => setPortions((r) => [...r, { label: "", grams: "" }])}>
          <Plus size={14} /> Add portion
        </Button>
        <p className="text-xs text-muted">Plain grams are always available when logging.</p>
      </fieldset>

      {error && <ErrorNote>{error}</ErrorNote>}
      <Button type="submit" size="lg" disabled={busy} className="w-full">
        {busy ? "Saving…" : food ? "Save changes" : "Add food"}
      </Button>
    </form>
  );
}

export function FoodFormModal({ open, food, onClose }: { open: boolean; food: Food | null; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title={food ? "Edit food" : "New food"}>
      <Form key={food?.id ?? "new"} food={food} onClose={onClose} />
    </Modal>
  );
}
