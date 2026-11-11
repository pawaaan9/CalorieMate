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

/** Live daily summaries from `fromDate` onwards, keyed by date. `null` while loading. */
export function useSummaries(uid: string, fromDate: string): Map<string, DailySummary> | null {
  const [map, setMap] = useState<Map<string, DailySummary> | null>(null);
  useEffect(
    () => subscribeSummaries(uid, fromDate, (list) => setMap(new Map(list.map((s) => [s.date, s])))),
    [uid, fromDate],
  );
  return map;
}
