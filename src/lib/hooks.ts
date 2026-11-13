"use client";

import { useEffect, useState } from "react";
import { subscribeEntries, subscribeSummaries } from "./db";
import type { DailySummary, Entry } from "./types";

/** Live diary entries for one day. `null` while loading. */
export function useEntries(uid: string, date: string): Entry[] | null {
  const [state, setState] = useState<{ date: string; entries: Entry[] } | null>(null);
  useEffect(() => subscribeEntries(uid, date, (entries) => setState({ date, entries })), [uid, date]);
  return state?.date === date ? state.entries : null;
}

/**
 * Live daily summaries from `fromDate` (up to `toDate` when given), keyed by date.
 * `null` while loading or after the range changes until new data arrives.
 */
export function useSummaries(uid: string, fromDate: string, toDate?: string): Map<string, DailySummary> | null {
  const [state, setState] = useState<{ range: string; map: Map<string, DailySummary> } | null>(null);
  const range = `${fromDate}|${toDate ?? ""}`;
  useEffect(
    () =>
      subscribeSummaries(
        uid,
        fromDate,
        (list) => setState({ range: `${fromDate}|${toDate ?? ""}`, map: new Map(list.map((s) => [s.date, s])) }),
        undefined,
        toDate,
      ),
    [uid, fromDate, toDate],
  );
  return state?.range === range ? state.map : null;
}
