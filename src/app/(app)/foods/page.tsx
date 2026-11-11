"use client";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { FoodFormModal } from "@/components/FoodForm";
import { searchFoods } from "@/components/FoodPicker";
import { useData } from "@/components/Providers";
import { Button, Card, ErrorNote, EstimatedBadge, IconButton, Input, PageHeader, Select } from "@/components/ui";
import { deleteFood } from "@/lib/db";
import { FOOD_CATEGORIES, SOURCE_LABEL, type Food } from "@/lib/types";

export default function FoodsPage() {
  const { uid, foods } = useData();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [form, setForm] = useState<{ food: Food | null } | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = useMemo(() => {
    const matched = q.trim() ? searchFoods(foods, q) : foods;
    return category === "all" ? matched : matched.filter((f) => f.category === category);
  }, [foods, q, category]);

  async function remove(food: Food) {
    setError(null);
    try {
      await deleteFood(uid, food.id);
      setConfirming(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete the food.");
    }
  }

  return (
    <>
      <PageHeader
        title="Foods"
        subtitle={`${foods.length} foods in your database`}
        action={
          <Button onClick={() => setForm({ food: null })}>
            <Plus size={16} /> New food
          </Button>
        }
      />

      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-3 text-muted" />
          <Input placeholder="Search by name, e.g. parippu" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-52">
          <option value="all">All categories</option>
          {FOOD_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}

      <Card className="p-0! sm:p-0!">
        {visible.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted">
            No foods match. Add your own with <span className="font-medium text-fg">New food</span>.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((f) => (
              <li key={f.id} className="flex items-center gap-2 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium">{f.name}</span>
                    {f.estimated && <EstimatedBadge />}
                  </div>
                  <div className="truncate text-xs text-muted">
                    {f.brand ? `${f.brand} · ` : ""}
                    {f.category} · {SOURCE_LABEL[f.source]}
                  </div>
                  <div className="mt-0.5 truncate text-xs tabular-nums text-muted">
                    per 100 g: <span className="font-medium text-fg">{f.per100g.calories} kcal</span> · P {f.per100g.protein} · C{" "}
                    {f.per100g.carbs} · F {f.per100g.fat}
                  </div>
                </div>
                {confirming === f.id ? (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button variant="danger" size="sm" onClick={() => remove(f)}>
                      Delete
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirming(null)}>
                      Keep
                    </Button>
                  </div>
                ) : (
                  <>
                    <IconButton label={`Edit ${f.name}`} onClick={() => setForm({ food: f })}>
                      <Pencil size={15} />
                    </IconButton>
                    <IconButton label={`Delete ${f.name}`} className="hover:text-danger" onClick={() => setConfirming(f.id)}>
                      <Trash2 size={15} />
                    </IconButton>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p className="mt-4 text-xs text-muted">
        Deleting a food does not change entries you have already logged. Built-in Sri Lankan foods can be restored from Settings.
      </p>

      <FoodFormModal open={form !== null} food={form?.food ?? null} onClose={() => setForm(null)} />
    </>
  );
}
