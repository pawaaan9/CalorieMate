export type Meal = "breakfast" | "lunch" | "dinner" | "snacks";

export const MEALS: { id: Meal; label: string }[] = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "snacks", label: "Snacks" },
];

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Portion {
  label: string;
  grams: number;
}

export type FoodSource = "seed" | "custom" | "usda" | "off";

export const SOURCE_LABEL: Record<FoodSource, string> = {
  seed: "Built-in foods",
  custom: "My food",
  usda: "USDA",
  off: "Open Food Facts",
};

export const FOOD_CATEGORIES = [
  "Rice & staples",
  "Curries",
  "Meat, fish & eggs",
  "Sambols & sides",
  "Vegetables & pulses",
  "Short eats",
  "Fruits",
  "Sweets",
  "Drinks & dairy",
  "Other",
] as const;

export interface Food {
  id: string;
  name: string;
  aliases?: string[];
  brand?: string;
  category: string;
  /** Nutrients per 100 g (or 100 ml for drinks). */
  per100g: Macros;
  portions: Portion[];
  /** True when the values are estimates rather than label / lab data. */
  estimated: boolean;
  source: FoodSource;
  lastUsedAt?: number;
}

export interface Entry extends Macros {
  id: string;
  date: string; // YYYY-MM-DD
  meal: Meal;
  foodId: string;
  foodName: string;
  portionLabel: string;
  portionGrams: number;
  quantity: number;
  grams: number;
  per100g: Macros;
  estimated: boolean;
  source: FoodSource;
  createdAt: number;
}

export interface DailySummary extends Macros {
  date: string;
  entryCount: number;
  goal: number;
}

export interface WeightRecord {
  date: string; // YYYY-MM-DD, also the document id
  weightKg: number;
  note?: string;
}

export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export interface Profile {
  displayName: string;
  sex: Sex;
  /** YYYY-MM-DD. Age is calculated from this when set. */
  birthDate?: string;
  age: number;
  heightCm: number;
  startWeightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  dailyCalorieTarget: number;
  /** Log food by weight (grams from a kitchen scale) by default. */
  weighFood: boolean;
  onboarded: boolean;
}

export const DEFAULT_PROFILE: Profile = {
  displayName: "",
  sex: "male",
  age: 30,
  heightCm: 170,
  startWeightKg: 75,
  targetWeightKg: 70,
  activityLevel: "light",
  dailyCalorieTarget: 2000,
  weighFood: false,
  onboarded: false,
};
