/** All dates are local-time day keys in YYYY-MM-DD form. */

export function toKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): string {
  return toKey(new Date());
}

export function addDays(key: string, n: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((fromKey(b).getTime() - fromKey(a).getTime()) / 86_400_000);
}

/** Monday of the week containing the given day. */
export function weekStart(key: string): string {
  const d = fromKey(key);
  const offset = (d.getDay() + 6) % 7;
  return addDays(key, -offset);
}

export function formatLong(key: string): string {
  return fromKey(key).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatShort(key: string): string {
  return fromKey(key).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function formatFull(key: string): string {
  return fromKey(key).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function weekdayShort(key: string): string {
  return fromKey(key).toLocaleDateString(undefined, { weekday: "short" });
}
