import { auth } from "./firebase";
import { getCachedSearch, setCachedSearch } from "./db";
import type { Food } from "./types";

export interface OnlineResult {
  foods: Food[];
  /** Names of the sources that did not respond. */
  failed: string[];
  fromCache: boolean;
}

/** Searches USDA + Open Food Facts through the server route, with a Firestore cache in front. */
export async function searchOnline(uid: string, q: string): Promise<OnlineResult> {
  const cached = await getCachedSearch(uid, q);
  if (cached) return { foods: cached, failed: [], fromCache: true };

  try {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(`/api/food-search?q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${token ?? ""}` },
    });
    if (!res.ok) throw new Error(`Search failed (${res.status})`);
    const data = (await res.json()) as { foods: Food[]; failed: string[] };
    // Only cache complete answers so a temporary outage is not remembered.
    if (data.failed.length === 0) await setCachedSearch(uid, q, data.foods);
    return { ...data, fromCache: false };
  } catch {
    return { foods: [], failed: ["USDA", "Open Food Facts"], fromCache: false };
  }
}
