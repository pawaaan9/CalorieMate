"use client";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { FoodFormModal } from "@/components/FoodForm";
import { searchFoods } from "@/components/FoodPicker";
import { useData } from "@/components/Providers";
import { Button, Card, CategoryIcon, Chip, ErrorNote, EstimatedBadge, FoodAvatar, IconButton, Input, PageHeader } from "@/components/ui";
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
        photo={{ src: "/photos/food-bowl.jpg", alt: "A bowl of fresh vegetables and chickpeas" }}
        title="Foods"
        subtitle={`${foods.length} foods in your database`}
        action={
          <Button onClick={() => setForm({ food: null })}>
            <Plus size={16} /> New food
          </Button>
        }
      />

      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-3.5 text-muted" />
          <Input placeholder="Search by name, e.g. parippu" className="pl-10" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip active={category === "all"} onClick={() => setCategory("all")}>
            All
          </Chip>
          {FOOD_CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? "all" : c)}>
              <CategoryIcon category={c} size={15} /> {c}
            </Chip>
          ))}
        </div>
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
              <li key={f.id} className="flex items-center gap-3 px-4 py-3 transition hover:bg-raised/60">
                <FoodAvatar category={f.category} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold">{f.name}</span>
                    {f.estimated && <EstimatedBadge />}
                  </div>
                  <div className="truncate text-xs text-muted">
                    {f.brand ? `${f.brand} · ` : ""}
                    {f.category} · {SOURCE_LABEL[f.source]}
                  </div>
                  <div className="mt-0.5 truncate text-xs tabular-nums text-muted">
                    per 100 g · <span className="font-semibold text-accent">{f.per100g.calories} kcal</span> · P {f.per100g.protein} · C{" "}
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
