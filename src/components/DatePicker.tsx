"use client";

import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { formatFull, fromKey, toKey, todayKey } from "@/lib/dates";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleDateString(undefined, { month: "short" }));
const PANEL_W = 312;
const PANEL_H = 380;

type View = "days" | "months" | "years";

interface Props {
  value: string; // YYYY-MM-DD or ""
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  /** Opens on the year grid when empty (handy for birthdays). */
  startView?: View;
  /** Defaults to a full-width form field. "icon" renders a compact calendar button. */
  variant?: "field" | "icon";
  allowClear?: boolean;
  label?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "Select a date",
  startView = "days",
  variant = "field",
  allowClear = false,
  label = "Choose date",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<CSSProperties>({});
  const [centered, setCentered] = useState(false);

  const place = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Phones: show the calendar centred over a dimmed background.
    if (vw < 640) {
      setCentered(true);
      setPos({
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: Math.min(340, vw - 32),
      });
      return;
    }
    setCentered(false);
    const width = Math.min(PANEL_W, vw - 16);
    const left = Math.min(Math.max(8, r.left), vw - width - 8);
    const below = vh - r.bottom >= PANEL_H + 8 || r.top < PANEL_H + 8;
    setPos({ position: "fixed", left, width, ...(below ? { top: r.bottom + 8 } : { bottom: vh - r.top + 8 }) });
  }, []);

  const toggle = () => {
    if (!open) place();
    setOpen(!open);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !triggerRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  const pick = (key: string) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <>
      {variant === "icon" ? (
        <button
          ref={triggerRef}
          type="button"
          aria-label={label}
          aria-expanded={open}
          onClick={toggle}
          className={`flex shrink-0 items-center justify-center rounded-2xl border transition ${
            open ? "border-accent text-accent" : "border-line bg-card text-muted hover:text-fg"
          } ${className}`}
        >
          <CalendarDays size={20} />
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          aria-label={label}
          aria-expanded={open}
          onClick={toggle}
          className={`flex h-11 w-full min-w-0 items-center gap-2.5 rounded-2xl border bg-raised px-3.5 text-left text-sm transition ${
            open ? "border-accent ring-2 ring-accent/20" : "border-line hover:border-accent/50"
          } ${className}`}
        >
          <CalendarDays size={17} className="shrink-0 text-muted" />
          <span className={`min-w-0 flex-1 truncate ${value ? "text-fg" : "text-muted/70"}`}>
            {value ? formatFull(value) : placeholder}
          </span>
          <ChevronDown size={17} className={`shrink-0 text-muted transition ${open ? "rotate-180" : ""}`} />
        </button>
      )}

      {open &&
        createPortal(
          <>
            {centered && <div aria-hidden className="fixed inset-0 z-[69] bg-black/70 backdrop-blur-sm" />}
          <div ref={panelRef} style={pos} className="z-[70]" role="dialog" aria-modal={centered} aria-label={label}>
            <Calendar
              value={value}
              min={min}
              max={max}
              startView={value ? "days" : startView}
              onPick={pick}
              footer={
                <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
                  {allowClear && value ? (
                    <FooterButton onClick={() => pick("")}>Clear</FooterButton>
                  ) : (
                    <span />
                  )}
                  {(!max || todayKey() <= max) && (!min || todayKey() >= min) && (
                    <FooterButton onClick={() => pick(todayKey())}>Today</FooterButton>
                  )}
                </div>
              }
            />
          </div>
          </>,
          document.body,
        )}
    </>
  );
}

function FooterButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full px-3 py-1.5 text-sm font-semibold text-accent hover:bg-accent-soft">
      {children}
    </button>
  );
}

function Calendar({
  value,
  min,
  max,
  startView,
  onPick,
  footer,
}: {
  value: string;
  min?: string;
  max?: string;
  startView: View;
  onPick: (key: string) => void;
  footer: ReactNode;
}) {
  const today = todayKey();
  const initial = fromKey(value || (max && max < today ? max : today));
  const [view, setView] = useState<View>(startView);
  // With no value, a year-first picker (birthdays) opens about 25 years back.
  const [year, setYear] = useState(initial.getFullYear() - (!value && startView === "years" ? 25 : 0));
  const [month, setMonth] = useState(initial.getMonth());
  const yearsRef = useRef<HTMLDivElement>(null);

  const minYear = min ? fromKey(min).getFullYear() : 1920;
  const maxYear = max ? fromKey(max).getFullYear() : new Date().getFullYear() + 10;
  const monthKey = (y: number, m: number) => `${y}-${String(m + 1).padStart(2, "0")}`;
  const monthAllowed = (y: number, m: number) =>
    (!min || monthKey(y, m) >= min.slice(0, 7)) && (!max || monthKey(y, m) <= max.slice(0, 7));
  const dayAllowed = (key: string) => (!min || key >= min) && (!max || key <= max);

  // Keep the selected year in view when the year grid opens.
  useEffect(() => {
    if (view === "years") yearsRef.current?.querySelector("[data-active]")?.scrollIntoView({ block: "center" });
  }, [view]);

  const shift = (dir: 1 | -1) => {
    if (view === "days") {
      const d = new Date(year, month + dir, 1);
      setYear(d.getFullYear());
      setMonth(d.getMonth());
    } else if (view === "months") {
      setYear((y) => y + dir);
    }
  };
  const canPrev = view === "days" ? monthAllowed(...prevMonth(year, month)) : view === "months" ? year > minYear : false;
  const canNext = view === "days" ? monthAllowed(...nextMonth(year, month)) : view === "months" ? year < maxYear : false;

  // Monday-first grid of 6 weeks.
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const cells = Array.from({ length: 42 }, (_, i) => new Date(year, month, i - offset + 1));

  const title =
    view === "days"
      ? first.toLocaleDateString(undefined, { month: "long", year: "numeric" })
      : view === "months"
        ? String(year)
        : "Select year";

  return (
    <div className="rounded-3xl border border-line bg-raised p-3 shadow-2xl shadow-black/60">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setView(view === "days" ? "years" : view === "months" ? "years" : "days")}
          className="flex items-center gap-1 rounded-full px-2.5 py-1.5 font-display text-[15px] font-bold transition hover:bg-subtle"
        >
          {title}
          <ChevronDown size={16} className={`text-accent transition ${view !== "days" ? "rotate-180" : ""}`} />
        </button>
        {view !== "years" && (
          <div className="flex gap-1">
            <NavButton label="Previous" disabled={!canPrev} onClick={() => shift(-1)}>
              <ChevronLeft size={18} />
            </NavButton>
            <NavButton label="Next" disabled={!canNext} onClick={() => shift(1)}>
              <ChevronRight size={18} />
            </NavButton>
          </div>
        )}
      </div>

      {view === "days" && (
        <>
          <div className="grid grid-cols-7 text-center text-[11px] font-bold uppercase tracking-wide text-muted">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1.5">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((d) => {
              const key = toKey(d);
              const inMonth = d.getMonth() === month;
              const selected = key === value;
              const isToday = key === today;
              const allowed = dayAllowed(key);
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!allowed}
                  onClick={() => onPick(key)}
                  aria-label={formatFull(key)}
                  aria-pressed={selected}
                  className={`flex h-9 items-center justify-center rounded-full text-sm tabular-nums transition ${
                    selected
                      ? "bg-accent font-bold text-accent-fg"
                      : isToday
                        ? "font-bold text-accent ring-1 ring-inset ring-accent/60 hover:bg-subtle"
                        : inMonth
                          ? "text-fg hover:bg-subtle"
                          : "text-muted/40 hover:bg-subtle"
                  } disabled:cursor-not-allowed disabled:text-muted/20 disabled:ring-0 disabled:hover:bg-transparent`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </>
      )}

      {view === "months" && (
        <div className="grid grid-cols-3 gap-2 py-1">
          {MONTHS.map((name, m) => {
            const active = m === month && (!value || fromKey(value).getFullYear() === year);
            return (
              <button
                key={name}
                type="button"
                disabled={!monthAllowed(year, m)}
                onClick={() => {
                  setMonth(m);
                  setView("days");
                }}
                className={`h-12 rounded-2xl text-sm font-semibold transition disabled:opacity-25 ${
                  active ? "bg-accent text-accent-fg" : "bg-card text-fg hover:bg-subtle"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}

      {view === "years" && (
        <div ref={yearsRef} className="grid max-h-[17.5rem] grid-cols-4 gap-2 overflow-y-auto py-1 pr-1">
          {Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i).map((y) => (
            <button
              key={y}
              type="button"
              data-active={y === year ? "" : undefined}
              onClick={() => {
                setYear(y);
                setView("months");
              }}
              className={`h-10 rounded-2xl text-sm font-semibold tabular-nums transition ${
                y === year && value ? "bg-accent text-accent-fg" : y === year ? "bg-subtle text-fg ring-1 ring-inset ring-accent/50" : "bg-card text-fg hover:bg-subtle"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {footer}
    </div>
  );
}

function NavButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-subtle hover:text-fg disabled:opacity-25 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

function prevMonth(y: number, m: number): [number, number] {
  return m === 0 ? [y - 1, 11] : [y, m - 1];
}

function nextMonth(y: number, m: number): [number, number] {
  return m === 11 ? [y + 1, 0] : [y, m + 1];
}
