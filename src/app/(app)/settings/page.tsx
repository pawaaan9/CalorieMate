"use client";

import { signOut } from "firebase/auth";
import { Check, LogOut, RotateCcw } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth, useData } from "@/components/Providers";
import { Button, Card, CardTitle, ErrorNote, Field, Input, PageHeader, Select } from "@/components/ui";
import { todayKey } from "@/lib/dates";
import { saveProfile, saveWeight, seedDefaultFoods } from "@/lib/db";
import { auth } from "@/lib/firebase";
import { ACTIVITY, bmi, bmr, calorieOptions, tdee } from "@/lib/nutrition";
import type { ActivityLevel, Profile, Sex } from "@/lib/types";

function SettingsForm({ profile, currentWeightKg, hasWeighIns }: { profile: Profile; currentWeightKg: number; hasWeighIns: boolean }) {
  const { uid } = useData();
  const [name, setName] = useState(profile.displayName);
  const [sex, setSex] = useState<Sex>(profile.sex);
  const [age, setAge] = useState(String(profile.age));
  const [height, setHeight] = useState(String(profile.heightCm));
  const [startWeight, setStartWeight] = useState(String(profile.startWeightKg));
  const [currentWeight, setCurrentWeight] = useState(String(currentWeightKg));
  const [targetWeight, setTargetWeight] = useState(String(profile.targetWeightKg));
  const [activity, setActivity] = useState<ActivityLevel>(profile.activityLevel);
  const [calories, setCalories] = useState(String(profile.dailyCalorieTarget));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const n = {
    age: parseFloat(age),
    height: parseFloat(height),
    start: parseFloat(startWeight),
    current: parseFloat(currentWeight),
    target: parseFloat(targetWeight),
    calories: parseFloat(calories),
  };
  const canEstimate = n.age > 0 && n.height > 0 && n.current > 0;
  const base = canEstimate ? Math.round(bmr(sex, n.current, n.height, n.age)) : null;
  const maintenance = canEstimate ? Math.round(tdee(sex, n.current, n.height, n.age, activity)) : null;
  const options = maintenance !== null ? calorieOptions(maintenance, !(n.target > n.current)) : [];
  const bodyMass = canEstimate ? bmi(n.current, n.height) : null;

  const touch = () => setSaved(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!(n.age >= 10 && n.age <= 110)) return setError("Enter an age between 10 and 110.");
    if (!(n.height >= 100 && n.height <= 250)) return setError("Enter a height between 100 and 250 cm.");
    for (const [label, v] of [
      ["starting", n.start],
      ["current", n.current],
      ["target", n.target],
    ] as const) {
      if (!(v >= 20 && v <= 400)) return setError(`Enter a ${label} weight between 20 and 400 kg.`);
    }
    if (!(n.calories >= 800 && n.calories <= 6000)) return setError("Enter a daily calorie target between 800 and 6000 kcal.");

    setBusy(true);
    setError(null);
    try {
      await saveProfile(uid, {
        displayName: name.trim(),
        sex,
        age: Math.round(n.age),
        heightCm: n.height,
        startWeightKg: n.start,
        targetWeightKg: n.target,
        activityLevel: activity,
        dailyCalorieTarget: Math.round(n.calories),
        onboarded: true,
      });
      // A changed current weight is recorded as today's weigh-in.
      if (!hasWeighIns || Math.abs(n.current - currentWeightKg) > 0.049) {
        await saveWeight(uid, { date: todayKey(), weightKg: Math.round(n.current * 10) / 10 });
      }
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your settings.");
    } finally {
      setBusy(false);
    }
  }

  const number = { type: "number", inputMode: "decimal", step: "any", min: "0" } as const;

  return (
    <form onSubmit={submit} onChange={touch} className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardTitle>About you</CardTitle>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Field label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
            </Field>
          </div>
          <Field label="Sex" hint="Used for the calorie estimate">
            <Select value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Select>
          </Field>
          <Field label="Age">
            <Input {...number} value={age} onChange={(e) => setAge(e.target.value)} />
          </Field>
          <Field label="Height (cm)">
            <Input {...number} value={height} onChange={(e) => setHeight(e.target.value)} />
          </Field>
          <Field label="Activity level" hint={ACTIVITY[activity].hint}>
            <Select value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)}>
              {(Object.keys(ACTIVITY) as ActivityLevel[]).map((k) => (
                <option key={k} value={k}>
                  {ACTIVITY[k].label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <Card>
        <CardTitle hint="Changing your current weight records a weigh-in for today.">Weight goals</CardTitle>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Starting (kg)">
            <Input {...number} value={startWeight} onChange={(e) => setStartWeight(e.target.value)} />
          </Field>
          <Field label="Current (kg)">
            <Input {...number} value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} />
          </Field>
          <Field label="Target (kg)">
            <Input {...number} value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} />
          </Field>
        </div>
        {bodyMass !== null && (
          <p className="mt-3 text-xs text-muted">
            Current BMI {bodyMass.toFixed(1)}
            {n.target > 0 && n.height > 0 ? ` · at target ${bmi(n.target, n.height).toFixed(1)}` : ""}
          </p>
        )}
      </Card>

      <Card className="lg:col-span-2">
        <CardTitle hint="Estimated with the Mifflin-St Jeor equation from your sex, age, height, current weight and activity level.">
          Daily calorie target
        </CardTitle>
        <div className="grid gap-4 md:grid-cols-[minmax(0,14rem)_1fr]">
          <Field label="My daily target (kcal)">
            <Input {...number} step="10" value={calories} onChange={(e) => setCalories(e.target.value)} />
          </Field>
          <div>
            {maintenance === null ? (
              <p className="pt-6 text-sm text-muted">Fill in your age, height and current weight to see an estimate.</p>
            ) : (
              <>
                <p className="mb-2 text-xs text-muted">
                  Estimated needs: <span className="font-medium text-fg">{maintenance} kcal</span> a day to maintain (resting
                  rate {base} kcal). Pick one to use it:
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {options.map((o) => {
                    const active = Math.round(n.calories) === o.calories;
                    return (
                      <button
                        key={o.label}
                        type="button"
                        onClick={() => {
                          setCalories(String(o.calories));
                          touch();
                        }}
                        className={`rounded-xl border px-3 py-2 text-left transition ${
                          active ? "border-accent bg-accent-soft" : "border-line hover:bg-subtle"
                        }`}
                      >
                        <div className="text-base font-semibold tabular-nums">{o.calories} kcal</div>
                        <div className="text-xs text-muted">{o.label}</div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save goals and settings"}
        </Button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-accent">
            <Check size={15} /> Saved
          </span>
        )}
        {error && <ErrorNote>{error}</ErrorNote>}
      </div>
    </form>
  );
}

export default function SettingsPage() {
  const { uid, profile, weights, currentWeightKg } = useData();
  const { user } = useAuth();
  const [restoring, setRestoring] = useState(false);
  const [restoreNote, setRestoreNote] = useState<string | null>(null);

  async function restore() {
    setRestoring(true);
    setRestoreNote(null);
    try {
      const count = await seedDefaultFoods(uid);
      setRestoreNote(`Restored ${count} built-in foods.`);
    } catch (e) {
      setRestoreNote(e instanceof Error ? e.message : "Could not restore the foods.");
    } finally {
      setRestoring(false);
    }
  }

  if (!profile) return null;

  return (
    <>
      <PageHeader title="Goals & settings" subtitle="Update these whenever your goals change" />
      <SettingsForm profile={profile} currentWeightKg={currentWeightKg ?? profile.startWeightKg} hasWeighIns={weights.length > 0} />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle hint="Re-adds the built-in Sri Lankan foods and resets any you edited. Your own foods are kept.">
            Food database
          </CardTitle>
          <Button variant="secondary" onClick={restore} disabled={restoring}>
            <RotateCcw size={15} /> {restoring ? "Restoring…" : "Restore built-in foods"}
          </Button>
          {restoreNote && <p className="mt-2 text-sm text-muted">{restoreNote}</p>}
        </Card>
        <Card>
          <CardTitle hint={user?.email ?? undefined}>Account</CardTitle>
          <Button variant="secondary" onClick={() => signOut(auth)}>
            <LogOut size={15} /> Sign out
          </Button>
        </Card>
      </div>
    </>
  );
}
