import type { ActivityLevel, Macros, Sex } from "./types";

export const ZERO: Macros = { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 };

const r1 = (n: number) => Math.round(n * 10) / 10;

export function macrosFor(per100g: Macros, grams: number): Macros {
  const k = grams / 100;
  return {
    calories: Math.round(per100g.calories * k),
    protein: r1(per100g.protein * k),
    carbs: r1(per100g.carbs * k),
    fat: r1(per100g.fat * k),
    sugar: r1((per100g.sugar ?? 0) * k),
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
    }),
    ZERO,
  );
  return { calories: Math.round(t.calories), protein: r1(t.protein), carbs: r1(t.carbs), fat: r1(t.fat), sugar: r1(t.sugar ?? 0) };
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
