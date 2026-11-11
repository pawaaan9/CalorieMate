import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { macrosFor, sumMacros } from "./nutrition";
import { SEED_FOODS } from "./seedFoods";
import {
  DEFAULT_PROFILE,
  type DailySummary,
  type Entry,
  type Food,
  type Meal,
  type Portion,
  type Profile,
  type WeightRecord,
} from "./types";

/*
 * Firestore layout (everything is owned by one user):
 *
 *   users/{uid}                          profile + goals
 *   users/{uid}/foods/{foodId}           food database (seed, custom, cached API foods)
 *   users/{uid}/entries/{entryId}        food diary entries
 *   users/{uid}/dailySummaries/{date}    per-day totals
 *   users/{uid}/weights/{date}           weight records
 *   users/{uid}/searchCache/{query}      cached external API search results
 */

const userRef = (uid: string) => doc(db, "users", uid);
const foodsCol = (uid: string) => collection(db, "users", uid, "foods");
const entriesCol = (uid: string) => collection(db, "users", uid, "entries");
const summariesCol = (uid: string) => collection(db, "users", uid, "dailySummaries");
const weightsCol = (uid: string) => collection(db, "users", uid, "weights");
const cacheCol = (uid: string) => collection(db, "users", uid, "searchCache");

type OnError = (e: Error) => void;

// ── Profile ─────────────────────────────────────────────────────────

/** Creates the profile and seeds the Sri Lankan food database on first sign-in. */
export async function ensureUserSetup(uid: string, email: string | null): Promise<void> {
  const snap = await getDoc(userRef(uid));
  if (snap.exists()) return;
  await seedDefaultFoods(uid);
  await setDoc(userRef(uid), {
    ...DEFAULT_PROFILE,
    displayName: email ? email.split("@")[0] : "",
    createdAt: Date.now(),
  });
}

export function subscribeProfile(uid: string, cb: (p: Profile | null) => void, onError?: OnError): Unsubscribe {
  return onSnapshot(
    userRef(uid),
    (snap) => cb(snap.exists() ? ({ ...DEFAULT_PROFILE, ...snap.data() } as Profile) : null),
    onError,
  );
}

export async function saveProfile(uid: string, profile: Partial<Profile>): Promise<void> {
  await setDoc(userRef(uid), { ...profile, updatedAt: Date.now() }, { merge: true });
}

// ── Foods ───────────────────────────────────────────────────────────

function foodData(food: Food) {
  const { id: _id, ...rest } = food;
  void _id;
  return { ...rest, nameLower: food.name.toLowerCase() };
}

/** Writes (or restores) the built-in Sri Lankan foods. Safe to run again. */
export async function seedDefaultFoods(uid: string): Promise<number> {
  const batch = writeBatch(db);
  for (const food of SEED_FOODS) batch.set(doc(foodsCol(uid), food.id), foodData(food));
  await batch.commit();
  return SEED_FOODS.length;
}

export function subscribeFoods(uid: string, cb: (foods: Food[]) => void, onError?: OnError): Unsubscribe {
  return onSnapshot(
    foodsCol(uid),
    (snap) => {
      const foods = snap.docs.map((d) => ({ ...(d.data() as Omit<Food, "id">), id: d.id }));
      foods.sort((a, b) => a.name.localeCompare(b.name));
      cb(foods);
    },
    onError,
  );
}

export async function saveFood(uid: string, food: Omit<Food, "id"> & { id?: string }): Promise<string> {
  const ref = food.id ? doc(foodsCol(uid), food.id) : doc(foodsCol(uid));
  await setDoc(ref, foodData({ ...food, id: ref.id }));
  return ref.id;
}

export async function deleteFood(uid: string, foodId: string): Promise<void> {
  await deleteDoc(doc(foodsCol(uid), foodId));
}

// ── Diary entries + daily summaries ─────────────────────────────────

export function subscribeEntries(
  uid: string,
  date: string,
  cb: (entries: Entry[]) => void,
  onError?: OnError,
): Unsubscribe {
  return onSnapshot(
    query(entriesCol(uid), where("date", "==", date)),
    (snap) => {
      const entries = snap.docs.map((d) => ({ ...(d.data() as Omit<Entry, "id">), id: d.id }));
      entries.sort((a, b) => a.createdAt - b.createdAt);
      cb(entries);
    },
    onError,
  );
}

/** Recomputes the stored totals for one day from that day's entries. */
async function refreshSummary(uid: string, date: string, goal: number): Promise<void> {
  const snap = await getDocs(query(entriesCol(uid), where("date", "==", date)));
  const ref = doc(summariesCol(uid), date);
  if (snap.empty) {
    await deleteDoc(ref);
    return;
  }
  const totals = sumMacros(snap.docs.map((d) => d.data() as Entry));
  const summary: DailySummary = { date, ...totals, entryCount: snap.size, goal };
  await setDoc(ref, { ...summary, updatedAt: Date.now() });
}

export interface EntryInput {
  date: string;
  meal: Meal;
  food: Food;
  portion: Portion;
  quantity: number;
}

export async function addEntry(uid: string, input: EntryInput, goal: number): Promise<void> {
  const { date, meal, food, portion, quantity } = input;
  const grams = portion.grams * quantity;
  const now = Date.now();
  const entry: Omit<Entry, "id"> = {
    date,
    meal,
    foodId: food.id,
    foodName: food.brand ? `${food.name} (${food.brand})` : food.name,
    portionLabel: portion.label,
    portionGrams: portion.grams,
    quantity,
    grams,
    per100g: food.per100g,
    estimated: food.estimated,
    source: food.source,
    createdAt: now,
    ...macrosFor(food.per100g, grams),
  };
  const batch = writeBatch(db);
  batch.set(doc(entriesCol(uid)), entry);
  // Saves API foods permanently on first use and tracks recency for quick picking.
  batch.set(doc(foodsCol(uid), food.id), { ...foodData(food), lastUsedAt: now }, { merge: true });
  await batch.commit();
  await refreshSummary(uid, date, goal);
}

export async function updateEntry(
  uid: string,
  entry: Entry,
  changes: { meal: Meal; portion: Portion; quantity: number },
  goal: number,
): Promise<void> {
  const grams = changes.portion.grams * changes.quantity;
  await setDoc(
    doc(entriesCol(uid), entry.id),
    {
      meal: changes.meal,
      portionLabel: changes.portion.label,
      portionGrams: changes.portion.grams,
      quantity: changes.quantity,
      grams,
      ...macrosFor(entry.per100g, grams),
    },
    { merge: true },
  );
  await refreshSummary(uid, entry.date, goal);
}

export async function deleteEntry(uid: string, entry: Entry, goal: number): Promise<void> {
  await deleteDoc(doc(entriesCol(uid), entry.id));
  await refreshSummary(uid, entry.date, goal);
}

export function subscribeSummaries(
  uid: string,
  fromDate: string,
  cb: (summaries: DailySummary[]) => void,
  onError?: OnError,
): Unsubscribe {
  return onSnapshot(
    query(summariesCol(uid), where("date", ">=", fromDate), orderBy("date")),
    (snap) => cb(snap.docs.map((d) => d.data() as DailySummary)),
    onError,
  );
}

// ── Weight ──────────────────────────────────────────────────────────

export function subscribeWeights(uid: string, cb: (w: WeightRecord[]) => void, onError?: OnError): Unsubscribe {
  return onSnapshot(
    query(weightsCol(uid), orderBy("date")),
    (snap) => cb(snap.docs.map((d) => d.data() as WeightRecord)),
    onError,
  );
}

export async function saveWeight(uid: string, record: WeightRecord): Promise<void> {
  await setDoc(doc(weightsCol(uid), record.date), {
    date: record.date,
    weightKg: record.weightKg,
    note: record.note ?? "",
    updatedAt: Date.now(),
  });
}

export async function deleteWeight(uid: string, date: string): Promise<void> {
  await deleteDoc(doc(weightsCol(uid), date));
}

// ── External search cache ───────────────────────────────────────────

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const cacheKey = (q: string) => encodeURIComponent(q.trim().toLowerCase()).slice(0, 300);

export async function getCachedSearch(uid: string, q: string): Promise<Food[] | null> {
  try {
    const snap = await getDoc(doc(cacheCol(uid), cacheKey(q)));
    if (!snap.exists()) return null;
    const data = snap.data() as { foods: Food[]; fetchedAt: number };
    return Date.now() - data.fetchedAt < CACHE_TTL_MS ? data.foods : null;
  } catch {
    return null;
  }
}

export async function setCachedSearch(uid: string, q: string, foods: Food[]): Promise<void> {
  try {
    await setDoc(doc(cacheCol(uid), cacheKey(q)), { query: q.trim().toLowerCase(), foods, fetchedAt: Date.now() });
  } catch {
    // Caching is best-effort.
  }
}
