"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AXIS = { fontSize: 11, fill: "var(--muted)" };
const GRID = "var(--line)";

interface TipProps {
  active?: boolean;
  payload?: { value?: number; payload?: { tip?: string } }[];
  unit: string;
  digits?: number;
}

function Tip({ active, payload, unit, digits = 0 }: TipProps) {
  const item = payload?.[0];
  if (!active || !item || item.value == null) return null;
  return (
    <div className="rounded-lg border border-line bg-card px-3 py-2 shadow-md">
      <div className="text-xs text-muted">{item.payload?.tip}</div>
      <div className="text-sm font-semibold tabular-nums text-fg">
        {item.value.toFixed(digits)} {unit}
      </div>
    </div>
  );
}

export interface BarPoint {
  label: string;
  tip: string;
  value: number | null;
}

/** Calories per period as bars, with the daily goal as a reference line. */
export function CalorieBars({ data, goal, height = 220 }: { data: BarPoint[]; goal: number; height?: number }) {
  const max = Math.max(goal, ...data.map((d) => d.value ?? 0));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: -12 }} barCategoryGap="28%">
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} domain={[0, Math.ceil((max * 1.12) / 500) * 500]} width={52} />
        <Tooltip cursor={{ fill: "var(--subtle)" }} content={<Tip unit="kcal" />} />
        <Bar dataKey="value" fill="var(--s1)" radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false} />
        {goal > 0 && (
          <ReferenceLine
            y={goal}
            stroke="var(--muted)"
            strokeDasharray="4 4"
            label={{ value: `Goal ${goal}`, position: "insideTopRight", fontSize: 11, fill: "var(--muted)" }}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}

export interface WeightPoint {
  label: string;
  tip: string;
  value: number;
}

/** Weight over time, with the target weight as a reference line. */
export function WeightLine({ data, target, height = 240 }: { data: WeightPoint[]; target: number; height?: number }) {
  const values = [...data.map((d) => d.value), ...(target > 0 ? [target] : [])];
  const lo = Math.floor(Math.min(...values) - 1);
  const hi = Math.ceil(Math.max(...values) + 1);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 16, right: 12, bottom: 0, left: -16 }}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} minTickGap={24} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} domain={[lo, hi]} width={52} allowDecimals={false} />
        <Tooltip cursor={{ stroke: GRID }} content={<Tip unit="kg" digits={1} />} />
        {target > 0 && (
          <ReferenceLine
            y={target}
            stroke="var(--muted)"
            strokeDasharray="4 4"
            label={{ value: `Target ${target} kg`, position: "insideBottomRight", fontSize: 11, fill: "var(--muted)" }}
          />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--s3)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--s3)", stroke: "var(--card)", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "var(--s3)", stroke: "var(--card)", strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
