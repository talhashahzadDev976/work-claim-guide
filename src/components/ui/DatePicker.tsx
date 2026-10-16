"use client";

import { useEffect, useRef, useState } from "react";
import {
  addDays,
  addMonths,
  clampISO,
  daysInMonth,
  formatLong,
  formatTyped,
  fromISO,
  monthGrid,
  monthName,
  monthShort,
  parseTyped,
  rowsNeeded,
  todayLocalISO,
  toISO,
  typedPlaceholder,
  weekday,
  weekdayNames,
  weekStart,
  type DateLocale,
} from "@/lib/dates";

type View = "days" | "months" | "years";
/** An ISO date, or "today" (resolved in the browser, so static pages never bake in a build date). */
type Bound = string | "today";

type Props = {
  /** Put on the text box, so an outside <label htmlFor> names it. */
  id: string;
  /** YYYY-MM-DD, or "" when empty. */
  value: string;
  /**
   * Called when the date is committed: picked in the calendar, or typed and the box loses focus / Enter.
   * Gets "" when the box is empty or the text isn't a real date.
   */
  onChange: (iso: string) => void;
  min?: Bound;
  max?: Bound;
  locale?: DateLocale;
  invalid?: boolean;
  /** aria-describedby for the text box (error or help text). */
  describedBy?: string;
  /** Name for the calendar dialog, e.g. "Date of injury". */
  label?: string;
  className?: string;
};

/**
 * Date field with a typed entry and a calendar popup (WAI-ARIA date picker dialog pattern).
 * Calendar keys: arrows move by day/week, PageUp/PageDown by month (+Shift: year),
 * Home/End to the start/end of the week, Enter picks, Esc closes.
 */
export function DatePicker({
  id,
  value,
  onChange,
  min,
  max,
  locale = "en-US",
  invalid = false,
  describedBy,
  label = "Choose a date",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("days");
  const [focus, setFocus] = useState(value);
  const [today, setToday] = useState("");
  const [text, setText] = useState(formatTyped(value, locale));
  const [synced, setSynced] = useState(value);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);

  // When the value changes from outside (a shared link, a reset), show it in the box.
  if (value !== synced) {
    setSynced(value);
    setText(formatTyped(value, locale));
  }

  const resolve = (b?: Bound) => (b === "today" ? today || undefined : b);
  const lo = resolve(min);
  const hi = resolve(max);
  const outOfRange = (iso: string) => Boolean((lo && iso < lo) || (hi && iso > hi));

  function commit(iso: string) {
    setSynced(iso);
    onChange(iso);
  }

  function commitText() {
    const parsed = parseTyped(text, locale);
    if (parsed) {
      setText(formatTyped(parsed, locale));
      if (parsed !== value) commit(parsed);
    } else {
      // Empty, or not a real date: keep what they typed so they can fix it, and report "".
      commit("");
    }
  }

  function openCalendar() {
    const t = todayLocalISO();
    const bounds = { lo: min === "today" ? t : min, hi: max === "today" ? t : max };
    setToday(t);
    setFocus(clampISO(parseTyped(text, locale) ?? (value || t), bounds.lo, bounds.hi));
    setView("days");
    setOpen(true);
    moveFocus.current = true;
  }

  function close(returnTo: "button" | "input" | null = "button") {
    setOpen(false);
    if (returnTo === "button") buttonRef.current?.focus();
    if (returnTo === "input") inputRef.current?.focus();
  }

  function pick(iso: string) {
    if (outOfRange(iso)) return;
    setText(formatTyped(iso, locale));
    commit(iso);
    close("input");
  }

  // Move keyboard focus to the active day after opening or arrowing (DOM only, no state).
  useEffect(() => {
    if (!open || view !== "days" || !moveFocus.current) return;
    moveFocus.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-iso="${focus}"]`)?.focus({ preventScroll: true });
  }, [open, view, focus]);

  // Close when tapping or clicking outside, or on Esc wherever focus happens to be.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function onGridKey(e: React.KeyboardEvent) {
    const s = weekStart(locale);
    const dow = (weekday(focus) - s + 7) % 7;
    const moves: Record<string, () => string> = {
      ArrowLeft: () => addDays(focus, -1),
      ArrowRight: () => addDays(focus, 1),
      ArrowUp: () => addDays(focus, -7),
      ArrowDown: () => addDays(focus, 7),
      PageUp: () => addMonths(focus, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focus, e.shiftKey ? 12 : 1),
      Home: () => addDays(focus, -dow),
      End: () => addDays(focus, 6 - dow),
    };
    if (moves[e.key]) {
      e.preventDefault();
      moveFocus.current = true;
      setFocus(clampISO(moves[e.key](), lo, hi));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(focus);
    }
  }

  // Only meaningful while open; the fallback just keeps the closed state renderable.
  const f = fromISO(focus) ?? { y: 2000, m: 1, d: 1 };
  const yearPage = f.y - (f.y % 12);
  const monthOut = (y: number, m: number) =>
    Boolean((lo && toISO({ y, m, d: daysInMonth(y, m) }) < lo) || (hi && toISO({ y, m, d: 1 }) > hi));
  const yearOut = (y: number) => Boolean((lo && `${y}-12-31` < lo) || (hi && `${y}-01-01` > hi));

  function step(dir: -1 | 1) {
    if (view === "days") setFocus(addMonths(focus, dir));
    if (view === "months") setFocus(addMonths(focus, dir * 12));
    if (view === "years") setFocus(addMonths(focus, dir * 144));
  }

  const title =
    view === "days" ? `${monthName(f.m)} ${f.y}` : view === "months" ? String(f.y) : `${yearPage} – ${yearPage + 11}`;
  const navLabel = view === "days" ? "month" : view === "months" ? "year" : "12 years";

  const iconButton =
    "flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-brand-soft disabled:opacity-40";
  const chip = (active: boolean, disabled: boolean) =>
    `h-10 rounded-lg text-sm font-semibold ${
      active ? "bg-brand text-on-brand" : disabled ? "cursor-not-allowed text-muted/60" : "hover:bg-brand-soft"
    }`;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={typedPlaceholder(locale)}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commitText}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitText();
            } else if (e.key === "ArrowDown" && e.altKey) {
              e.preventDefault();
              openCalendar();
            }
          }}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={`h-12 w-full min-w-0 rounded-card border bg-surface pr-14 pl-4 text-lg text-ink tabular-nums placeholder:text-muted/70 ${
            invalid ? "border-bad" : "border-line hover:border-muted"
          }`}
        />
        <button
          ref={buttonRef}
          type="button"
          aria-label={open ? "Close calendar" : `Open calendar${value ? `, ${formatLong(value, locale)}` : ""}`}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => (open ? close() : openCalendar())}
          className="absolute top-1/2 right-1 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-brand hover:bg-brand-soft"
        >
          <svg aria-hidden viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-current stroke-[1.7]">
            <rect x="3" y="4.5" width="14" height="12.5" rx="2" />
            <path d="M3 8.5h14M7 2.5v4M13 2.5v4" />
          </svg>
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={label}
          className="absolute top-[calc(100%+6px)] left-0 z-50 w-[280px] max-w-[calc(100vw-2rem)] rounded-card border border-line bg-surface p-2.5 text-ink shadow-[0_12px_32px_-8px_rgb(0_0_0/0.25)]"
        >
          <div className="flex items-center justify-between gap-1">
            <button type="button" aria-label={`Previous ${navLabel}`} onClick={() => step(-1)} className={iconButton}>
              <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current stroke-2">
                <path d="M10 3L5 8l5 5" />
              </svg>
            </button>
            <button
              type="button"
              aria-live="polite"
              onClick={() => setView(view === "days" ? "months" : view === "months" ? "years" : "days")}
              aria-label={view === "years" ? `${title}, back to days` : `${title}, change ${view === "days" ? "month" : "year"}`}
              className="flex h-9 items-center gap-1.5 rounded-full px-3 text-[15px] font-semibold hover:bg-brand-soft"
            >
              {title}
              <svg
                aria-hidden
                viewBox="0 0 12 8"
                className={`h-1.5 w-2.5 fill-none stroke-current stroke-2 transition-transform ${view === "days" ? "" : "rotate-180"}`}
              >
                <path d="M1 1l5 5 5-5" />
              </svg>
            </button>
            <button type="button" aria-label={`Next ${navLabel}`} onClick={() => step(1)} className={iconButton}>
              <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current stroke-2">
                <path d="M6 3l5 5-5 5" />
              </svg>
            </button>
          </div>

          {view === "days" && (
            <div ref={gridRef} role="grid" aria-label={`${monthName(f.m)} ${f.y}`} onKeyDown={onGridKey} className="mt-1">
              <div role="row" className="grid grid-cols-7">
                {weekdayNames(locale).map((d) => (
                  <span key={d} role="columnheader" className="py-1 text-center text-[11px] font-semibold text-muted">
                    {d}
                  </span>
                ))}
              </div>
              {Array.from({ length: rowsNeeded(f.y, f.m, locale) }, (_, row) => (
                <div role="row" key={row} className="grid grid-cols-7">
                  {monthGrid(f.y, f.m, locale)
                    .slice(row * 7, row * 7 + 7)
                    .map((iso) => {
                      const day = fromISO(iso)!;
                      const inMonth = day.m === f.m;
                      const selected = iso === value;
                      const isToday = iso === today;
                      const disabled = outOfRange(iso);
                      return (
                        <span role="gridcell" key={iso} aria-selected={selected} className="flex justify-center p-px">
                          <button
                            type="button"
                            data-iso={iso}
                            tabIndex={iso === focus ? 0 : -1}
                            aria-label={`${formatLong(iso, locale)}${isToday ? ", today" : ""}${disabled ? ", not available" : ""}`}
                            aria-disabled={disabled || undefined}
                            onClick={() => pick(iso)}
                            onFocus={() => iso !== focus && setFocus(iso)}
                            className={`relative flex h-9 w-9 items-center justify-center rounded-full text-sm tabular-nums transition-colors ${
                              selected
                                ? "bg-brand font-semibold text-on-brand"
                                : disabled
                                  ? "cursor-not-allowed text-muted/45"
                                  : `${inMonth ? "text-ink" : "text-muted/70"} hover:bg-brand-soft`
                            } ${isToday && !selected ? "font-semibold ring-1 ring-brand ring-inset" : ""}`}
                          >
                            {day.d}
                          </button>
                        </span>
                      );
                    })}
                </div>
              ))}
            </div>
          )}

          {view === "months" && (
            <div className="mt-1 grid grid-cols-3 gap-1">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                const disabled = monthOut(f.y, m);
                return (
                  <button
                    key={m}
                    type="button"
                    disabled={disabled}
                    aria-label={`${monthName(m)} ${f.y}`}
                    onClick={() => {
                      setFocus(clampISO(toISO({ y: f.y, m, d: Math.min(f.d, daysInMonth(f.y, m)) }), lo, hi));
                      setView("days");
                      moveFocus.current = true;
                    }}
                    className={chip(m === f.m, disabled)}
                  >
                    {monthShort(m)}
                  </button>
                );
              })}
            </div>
          )}

          {view === "years" && (
            <div className="mt-1 grid grid-cols-3 gap-1">
              {Array.from({ length: 12 }, (_, i) => yearPage + i).map((y) => {
                const disabled = yearOut(y);
                return (
                  <button
                    key={y}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setFocus(clampISO(toISO({ y, m: f.m, d: Math.min(f.d, daysInMonth(y, f.m)) }), lo, hi));
                      setView("months");
                    }}
                    className={chip(y === f.y, disabled)}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-1.5 flex items-center justify-between border-t border-line pt-1.5">
            <button
              type="button"
              disabled={!today || outOfRange(today)}
              onClick={() => pick(today)}
              className="h-9 rounded-full px-3 text-sm font-semibold text-brand hover:bg-brand-soft disabled:opacity-40"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => close()}
              className="h-9 rounded-full px-3 text-sm font-semibold text-muted hover:bg-brand-soft"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
