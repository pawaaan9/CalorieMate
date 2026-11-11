import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Food, Portion } from "@/lib/types";

/**
 * Server-side proxy for external nutrition APIs (USDA FoodData Central and
 * Open Food Facts). Keeps the USDA key off the client, and only answers
 * requests that carry a valid Firebase ID token for this project.
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);
const TIMEOUT_MS = 8000;
const DAY = 60 * 60 * 24;

async function isAuthorised(request: Request): Promise<boolean> {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token || !PROJECT_ID) return false;
  try {
    await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
    });
    return true;
  } catch {
    return false;
  }
}

const num = (v: unknown): number => {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0;
};

const titleCase = (s: string) =>
  s.toLowerCase().replace(/(^|[\s(/-])([a-z])/g, (_, a: string, b: string) => a + b.toUpperCase());

// ── USDA FoodData Central ───────────────────────────────────────────

interface UsdaNutrient {
  nutrientId: number;
  value: number;
}
interface UsdaFood {
  fdcId: number;
  description: string;
  dataType?: string;
  foodNutrients?: UsdaNutrient[];
  foodMeasures?: { disseminationText?: string; gramWeight?: number }[];
}

async function searchUsda(q: string): Promise<Food[]> {
  const key = process.env.USDA_API_KEY || "DEMO_KEY";
  // Built by hand: USDA answers 400 when the parentheses in "Survey (FNDDS)"
  // are percent-encoded, which URLSearchParams would do.
  const url =
    "https://api.nal.usda.gov/fdc/v1/foods/search" +
    `?api_key=${encodeURIComponent(key)}&query=${encodeURIComponent(q)}&pageSize=10` +
    `&dataType=${encodeURIComponent("Foundation,SR Legacy,Survey (FNDDS)")}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), next: { revalidate: DAY } });
  if (!res.ok) throw new Error(`USDA responded ${res.status}`);
  const data = (await res.json()) as { foods?: UsdaFood[] };

  return (data.foods ?? []).flatMap((f): Food[] => {
    const get = (...ids: number[]) => {
      for (const id of ids) {
        const n = f.foodNutrients?.find((x) => x.nutrientId === id);
        if (n && Number.isFinite(n.value)) return n.value;
      }
      return undefined;
    };
    const protein = num(get(1003));
    const carbs = num(get(1005));
    const fat = num(get(1004));
    // 1008 = energy (kcal); 2047/2048 = Atwater energy on Foundation foods.
    const kcal = get(1008, 2047, 2048);
    const calories = Math.round(kcal ?? protein * 4 + carbs * 4 + fat * 9);
    if (!calories && !protein && !carbs && !fat) return [];

    const portions: Portion[] = (f.foodMeasures ?? [])
      .filter((m) => m.disseminationText && m.gramWeight && !/not specified/i.test(m.disseminationText))
      .slice(0, 5)
      .map((m) => ({ label: m.disseminationText!.replace(/^1\s+/, ""), grams: num(m.gramWeight) }));
    portions.push({ label: "serving", grams: 100 });

    return [
      {
        id: `usda-${f.fdcId}`,
        name: titleCase(f.description),
        category: "Other",
        per100g: { calories, protein, carbs, fat },
        portions,
        estimated: kcal === undefined,
        source: "usda",
      },
    ];
  });
}

// ── Open Food Facts ─────────────────────────────────────────────────

interface OffProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  serving_quantity?: number | string;
  serving_size?: string;
  countries_tags?: string[];
  nutriments?: Record<string, number | string | undefined>;
}

async function searchOff(q: string): Promise<Food[]> {
  const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
  url.searchParams.set("search_terms", q);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "15");
  url.searchParams.set("fields", "code,product_name,brands,serving_quantity,serving_size,countries_tags,nutriments");
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "User-Agent": "PersonalCalorieTracker/1.0" },
    next: { revalidate: DAY },
  });
  if (!res.ok) throw new Error(`Open Food Facts responded ${res.status}`);
  const data = (await res.json()) as { products?: OffProduct[] };

  const products = (data.products ?? []).filter(
    (p) => p.code && p.product_name && p.nutriments?.["energy-kcal_100g"] !== undefined,
  );
  // Products sold in Sri Lanka first.
  const local = (p: OffProduct) => (p.countries_tags?.includes("en:sri-lanka") ? 0 : 1);
  products.sort((a, b) => local(a) - local(b));

  return products.slice(0, 10).map((p): Food => {
    const n = p.nutriments ?? {};
    const serving = num(p.serving_quantity);
    const portions: Portion[] = [];
    if (serving > 0) portions.push({ label: p.serving_size ? `serving (${p.serving_size})` : "serving", grams: serving });
    portions.push({ label: "100 g", grams: 100 });
    return {
      id: `off-${p.code}`,
      name: p.product_name!.trim(),
      brand: p.brands?.split(",")[0]?.trim() || undefined,
      category: "Other",
      per100g: {
        calories: Math.round(num(n["energy-kcal_100g"])),
        protein: num(n["proteins_100g"]),
        carbs: num(n["carbohydrates_100g"]),
        fat: num(n["fat_100g"]),
      },
      portions,
      estimated: false,
      source: "off",
    };
  });
}

// ── Handler ─────────────────────────────────────────────────────────

export async function GET(request: Request) {
  if (!(await isAuthorised(request))) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2 || q.length > 80) {
    return Response.json({ error: "Query must be 2–80 characters" }, { status: 400 });
  }

  const [usda, off] = await Promise.allSettled([searchUsda(q), searchOff(q)]);
  const foods: Food[] = [];
  const failed: string[] = [];
  if (usda.status === "fulfilled") foods.push(...usda.value);
  else failed.push("USDA");
  if (off.status === "fulfilled") foods.push(...off.value);
  else failed.push("Open Food Facts");

  return Response.json({ foods, failed });
}
