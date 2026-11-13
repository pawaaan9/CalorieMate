import type { ActivityLevel, Macros, Profile, Sex } from "./types";

export const ZERO: Macros = { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, fiber: 0, addedSugar: 0 };

const r1 = (n: number) => Math.round(n * 10) / 10;

export function macrosFor(per100g: Macros, grams: number): Macros {
  const k = grams / 100;
  return {
    calories: Math.round(per100g.calories * k),
    protein: r1(per100g.protein * k),
    carbs: r1(per100g.carbs * k),
    fat: r1(per100g.fat * k),
    sugar: r1((per100g.sugar ?? 0) * k),
    fiber: r1((per100g.fiber ?? 0) * k),
    addedSugar: r1((per100g.addedSugar ?? 0) * k),
  };
}

export function sumMacros(items: Macros[]): Macros {
  const t = items.reduce(
    (a, b) => ({
      calories: a.calories + b.calories,
      protein: a.protein + b.protein,
      carbs: a.carbs + b.carbs,
      fat: a.fat + b.fat,
      sugar: (a.sugar ?? 0) + (b.sugar ?? 0),
      fiber: (a.fiber ?? 0) + (b.fiber ?? 0),
      addedSugar: (a.addedSugar ?? 0) + (b.addedSugar ?? 0),
    }),
    ZERO,
  );
  return {
    calories: Math.round(t.calories),
    protein: r1(t.protein),
    carbs: r1(t.carbs),
    fat: r1(t.fat),
    sugar: r1(t.sugar ?? 0),
    fiber: r1(t.fiber ?? 0),
    addedSugar: r1(t.addedSugar ?? 0),
  };
}

/** Natural sugar = total sugar − added sugar (never below zero). */
export function naturalSugar(m: Macros): number {
  return r1(Math.max(0, (m.sugar ?? 0) - (m.addedSugar ?? 0)));
}

export type NutrientKey = "protein" | "carbs" | "fat" | "fiber" | "sugar" | "naturalSugar" | "addedSugar";

/**
 * How a target is judged:
 * - goal: try to reach it (protein, fibre); going over is fine
 * - aim: try to land near it (carbs, fat); going over is flagged gently
 * - limit: stay under it (sugars); going over is flagged as a problem
 */
export type TargetKind = "goal" | "aim" | "limit";

export const NUTRIENTS: { key: NutrientKey; label: string; kind: TargetKind }[] = [
  { key: "protein", label: "Protein", kind: "goal" },
  { key: "carbs", label: "Carbs", kind: "aim" },
  { key: "fat", label: "Fat", kind: "aim" },
  { key: "fiber", label: "Fibre", kind: "goal" },
  { key: "sugar", label: "Total sugar", kind: "limit" },
  { key: "naturalSugar", label: "Natural sugar", kind: "limit" },
  { key: "addedSugar", label: "Added sugar", kind: "limit" },
];

export type NutrientTargets = Record<NutrientKey, number>;

/**
 * Recommended daily targets for a calorie target:
 * protein 25 %, carbs 45 %, fat 30 % of calories; fibre 14 g per 1,000 kcal;
 * total sugar 10 % and added sugar 5 % of calories (WHO free-sugar guidance).
 * Natural sugar is whatever the total-sugar limit leaves after added sugar.
 */
export function recommendedTargets(calories: number): Omit<NutrientTargets, "naturalSugar"> {
  const kcal = Math.max(1000, calories || 2000);
  return {
    protein: Math.round((kcal * 0.25) / 4),
    carbs: Math.round((kcal * 0.45) / 4),
    fat: Math.round((kcal * 0.3) / 9),
    fiber: Math.round((kcal / 1000) * 14),
    sugar: Math.round((kcal * 0.1) / 4),
    addedSugar: Math.round((kcal * 0.05) / 4),
  };
}

/** The targets in effect for a profile (automatic or set by hand). */
export function targetsFor(profile: Profile | null | undefined): NutrientTargets {
  const p = profile;
  const base =
    !p || p.autoTargets !== false
      ? recommendedTargets(p?.dailyCalorieTarget ?? 2000)
      : {
          protein: p.proteinTargetG,
          carbs: p.carbsTargetG,
          fat: p.fatTargetG,
          fiber: p.fiberTargetG,
          sugar: p.sugarLimitG,
          addedSugar: p.addedSugarLimitG,
        };
  return { ...base, naturalSugar: Math.max(0, base.sugar - base.addedSugar) };
}

/** Consumed amount of one nutrient from day totals. */
export function consumed(totals: Macros, key: NutrientKey): number {
  if (key === "naturalSugar") return naturalSugar(totals);
  return totals[key] ?? 0;
}

export const ACTIVITY: Record<ActivityLevel, { label: string; hint: string; factor: number }> = {
  sedentary: { label: "Sedentary", hint: "Desk job, little exercise", factor: 1.2 },
  light: { label: "Lightly active", hint: "Light exercise 1–3 days a week", factor: 1.375 },
  moderate: { label: "Moderately active", hint: "Exercise 3–5 days a week", factor: 1.55 },
  active: { label: "Very active", hint: "Hard exercise 6–7 days a week", factor: 1.725 },
  very_active: { label: "Extra active", hint: "Physical job or twice-daily training", factor: 1.9 },
};

/** Basal metabolic rate, Mifflin-St Jeor equation. */
export function bmr(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "male" ? 5 : -161);
}

export function tdee(sex: Sex, weightKg: number, heightCm: number, age: number, level: ActivityLevel): number {
  return bmr(sex, weightKg, heightCm, age) * ACTIVITY[level].factor;
}

export interface CalorieOption {
  label: string;
  calories: number;
}

/** Calorie targets for maintaining and for moving towards the target weight. */
export function calorieOptions(maintenance: number, losing: boolean): CalorieOption[] {
  const sign = losing ? -1 : 1;
  const verb = losing ? "Lose" : "Gain";
  const floor = (n: number) => Math.max(1200, Math.round(n / 10) * 10);
  return [
    { label: "Maintain weight", calories: floor(maintenance) },
    { label: `${verb} about 0.25 kg a week`, calories: floor(maintenance + sign * 275) },
    { label: `${verb} about 0.5 kg a week`, calories: floor(maintenance + sign * 550) },
  ];
}

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return m > 0 ? weightKg / (m * m) : 0;
}
