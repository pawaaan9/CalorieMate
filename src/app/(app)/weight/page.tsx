"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { WeightLine } from "@/components/charts";
import { DatePicker } from "@/components/DatePicker";
import { useData } from "@/components/Providers";
import { Button, Card, CardTitle, ErrorNote, Field, IconButton, Input, PageHeader, ProgressBar } from "@/components/ui";
import { daysBetween, formatFull, formatShort, todayKey } from "@/lib/dates";
import { deleteWeight, saveWeight } from "@/lib/db";

const signed = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(1)}`;

export default function WeightPage() {
  const { uid, profile, weights, currentWeightKg } = useData();
  const today = todayKey();
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const start = profile?.startWeightKg ?? 0;
  const target = profile?.targetWeightKg ?? 0;
  const current = currentWeightKg ?? start;
  const span = start - target;
  const progress = span !== 0 ? Math.min(1, Math.max(0, (start - current) / span)) : 0;
  const latest = weights[weights.length - 1];
  const sinceLast = latest ? daysBetween(latest.date, today) : null;
  const existing = weights.find((w) => w.date === date);
  const history = [...weights].reverse();

  async function submit(e: FormEvent) {
    e.preventDefault();
    const value = parseFloat(weight);
    if (!Number.isFinite(value) || value < 20 || value > 400) {
      setError("Enter a weight between 20 and 400 kg.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await saveWeight(uid, { date, weightKg: Math.round(value * 10) / 10, note: note.trim() });
      setWeight("");
      setNote("");
      setDate(today);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the weight.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(d: string) {
    setError(null);
    try {
      await deleteWeight(uid, d);
      setConfirming(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the record.");
    }
  }

  return (
    <>
      <PageHeader
        photo={{ src: "/photos/barbell.jpg", alt: "Lifting a barbell overhead" }}
        title="Weight"
        subtitle={
          sinceLast === null
            ? "Record your first weigh-in"
            : sinceLast === 0
              ? "Weighed in today"
              : `Last weigh-in ${sinceLast} day${sinceLast === 1 ? "" : "s"} ago${sinceLast >= 7 ? " · time for a new one" : ""}`
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <Card>
            <CardTitle hint="Once a week is enough. Same day and time gives the clearest trend.">
              {existing ? "Update weigh-in" : "Add weigh-in"}
            </CardTitle>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Weight (kg)">
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="20"
                    max="400"
                    required
                    placeholder={current ? current.toFixed(1) : "0.0"}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </Field>
                <Field label="Date">
                  <DatePicker value={date} max={today} label="Weigh-in date" onChange={(v) => setDate(v || today)} />
                </Field>
              </div>
              <Field label="Note (optional)">
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. after morning walk" maxLength={120} />
              </Field>
              {existing && (
                <p className="text-xs text-muted">
                  {formatFull(date)} already has {existing.weightKg.toFixed(1)} kg recorded. Saving replaces it.
                </p>
              )}
              {error && <ErrorNote>{error}</ErrorNote>}
              <Button type="submit" size="lg" disabled={busy} className="w-full">
                {busy ? "Saving…" : existing ? "Update weight" : "Save weight"}
              </Button>
            </form>
          </Card>

          <Card>
            <CardTitle>Progress to target</CardTitle>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                ["Start", start],
                ["Current", current],
                ["Target", target],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-xs text-muted">{label}</div>
                  <div className="font-display text-xl font-bold tabular-nums">{(value as number).toFixed(1)}</div>
                  <div className="text-xs text-muted">kg</div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <ProgressBar value={progress} max={1} />
              <div className="mt-1.5 flex justify-between text-xs text-muted">
                <span>
                  {current - start <= 0 ? "Lost" : "Gained"} {Math.abs(current - start).toFixed(1)} kg in total
                </span>
                <span>{Math.abs(current - target).toFixed(1)} kg to go</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardTitle>Weight over time</CardTitle>
            {weights.length >= 2 ? (
              <WeightLine
                data={weights.map((w) => ({ label: formatShort(w.date), tip: formatFull(w.date), value: w.weightKg }))}
                target={target}
              />
            ) : (
              <p className="py-14 text-center text-sm text-muted">The chart appears after two weigh-ins.</p>
            )}
          </Card>

          <Card className="p-0! sm:p-0!">
            <div className="px-4 pt-4 sm:px-5 sm:pt-5">
              <CardTitle>History</CardTitle>
            </div>
            {history.length === 0 ? (
              <p className="px-4 pb-8 pt-2 text-center text-sm text-muted">No weigh-ins yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-line text-left text-xs text-muted">
                      <th className="px-4 py-2 font-medium sm:px-5">Date</th>
                      <th className="px-2 py-2 text-right font-medium">Weight</th>
                      <th className="px-2 py-2 text-right font-medium">Change</th>
                      <th className="px-2 py-2 text-right font-medium">From start</th>
                      <th className="px-2 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {history.map((w, i) => {
                      const prev = history[i + 1];
                      const delta = prev ? w.weightKg - prev.weightKg : null;
                      return (
                        <tr key={w.date}>
                          <td className="px-4 py-2.5 sm:px-5">
                            <div className="whitespace-nowrap">{formatFull(w.date)}</div>
                            {w.note && <div className="max-w-48 truncate text-xs text-muted">{w.note}</div>}
                          </td>
                          <td className="px-2 py-2.5 text-right font-medium tabular-nums">{w.weightKg.toFixed(1)} kg</td>
                          <td className="px-2 py-2.5 text-right tabular-nums text-muted">{delta === null ? "–" : signed(delta)}</td>
                          <td className="px-2 py-2.5 text-right tabular-nums text-muted">{signed(w.weightKg - start)}</td>
                          <td className="px-2 py-2.5">
                            {confirming === w.date ? (
                              <div className="flex justify-end gap-1">
                                <Button variant="danger" size="sm" onClick={() => remove(w.date)}>
                                  Delete
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setConfirming(null)}>
                                  Keep
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-end">
                                <IconButton
                                  label={`Edit ${formatFull(w.date)}`}
                                  onClick={() => {
                                    setDate(w.date);
                                    setWeight(String(w.weightKg));
                                    setNote(w.note ?? "");
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                >
                                  <Pencil size={15} />
                                </IconButton>
                                <IconButton label={`Delete ${formatFull(w.date)}`} className="hover:text-danger" onClick={() => setConfirming(w.date)}>
                                  <Trash2 size={15} />
                                </IconButton>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
