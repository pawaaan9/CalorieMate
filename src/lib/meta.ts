import {
  Apple,
  CakeSlice,
  Carrot,
  Cookie,
  CupSoda,
  Drumstick,
  Moon,
  Salad,
  Sandwich,
  Soup,
  Sun,
  Sunrise,
  Utensils,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import type { Meal } from "./types";

export const MEAL_META: Record<Meal, { icon: LucideIcon; hint: string }> = {
  breakfast: { icon: Sunrise, hint: "Hoppers, kiribath, string hoppers…" },
  lunch: { icon: Sun, hint: "Rice and curry, kottu, biryani…" },
  dinner: { icon: Moon, hint: "Roti, pittu, thosai…" },
  snacks: { icon: Cookie, hint: "Short eats, fruit, tea…" },
};

export const CATEGORY_ICON: Record<string, LucideIcon> = {
  "Rice & staples": Wheat,
  Curries: Soup,
  "Meat, fish & eggs": Drumstick,
  "Sambols & sides": Salad,
  "Vegetables & pulses": Carrot,
  "Short eats": Sandwich,
  Fruits: Apple,
  Sweets: CakeSlice,
  "Drinks & dairy": CupSoda,
  Other: Utensils,
};

export const categoryIcon = (c: string): LucideIcon => CATEGORY_ICON[c] ?? Utensils;

/** The meal you're most likely logging right now. */
export function mealForNow(d = new Date()): Meal {
  const h = d.getHours() + d.getMinutes() / 60;
  if (h < 10.5) return "breakfast";
  if (h < 15) return "lunch";
  if (h < 18.5) return "snacks";
  return "dinner";
}

export function greeting(d = new Date()): string {
  const h = d.getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
