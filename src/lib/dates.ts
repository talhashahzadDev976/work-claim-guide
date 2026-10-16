// Calendar-date helpers on plain YYYY-MM-DD strings. All arithmetic is in UTC, so a date never
// shifts with the visitor's time zone or daylight saving. ISO strings compare correctly as text.

export type DateLocale = "en-US" | "en-GB";

export type YMD = { y: number; m: number; d: number }; // m is 1–12

export const pad = (n: number) => String(n).padStart(2, "0");

export function toISO({ y, m, d }: YMD) {
  return `${y}-${pad(m)}-${pad(d)}`;
}

export function fromISO(iso: string): YMD | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [y, m, d] = match.slice(1).map(Number);
  return isRealDate(y, m, d) ? { y, m, d } : null;
}

export function daysInMonth(y: number, m: number) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function isRealDate(y: number, m: number, d: number) {
  return y >= 1900 && y <= 2200 && m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m);
}

export function addDays(iso: string, days: number) {
  const { y, m, d } = fromISO(iso)!;
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return toISO({ y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() });
}

/** Move by whole months, keeping the day where possible (Jan 31 + 1 month = Feb 28/29). */
export function addMonths(iso: string, months: number) {
  const { y, m, d } = fromISO(iso)!;
  const total = y * 12 + (m - 1) + months;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return toISO({ y: ny, m: nm, d: Math.min(d, daysInMonth(ny, nm)) });
}

/** 0 = Sunday … 6 = Saturday. */
export function weekday(iso: string) {
  const { y, m, d } = fromISO(iso)!;
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** US weeks start on Sunday, UK weeks on Monday. */
export const weekStart = (locale: DateLocale) => (locale === "en-GB" ? 1 : 0);

export function clampISO(iso: string, min?: string, max?: string) {
  if (min && iso < min) return min;
  if (max && iso > max) return max;
  return iso;
}

/** Today in the visitor's time zone. Only call from effects or event handlers, never during render. */
export function todayLocalISO() {
  const t = new Date();
  return toISO({ y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() });
}

/** The 6×7 grid of dates shown for a month, padded with days from the months either side. */
export function monthGrid(y: number, m: number, locale: DateLocale) {
  const first = toISO({ y, m, d: 1 });
  const lead = (weekday(first) - weekStart(locale) + 7) % 7;
  const start = addDays(first, -lead);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

/** Short weekday names in display order ("Su", "Mo", … or "Mo" … "Su"). */
export function weekdayNames(locale: DateLocale) {
  const names = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const s = weekStart(locale);
  return [...names.slice(s), ...names.slice(0, s)];
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const monthName = (m: number) => MONTHS[m - 1];
export const monthShort = (m: number) => MONTHS[m - 1].slice(0, 3);

/** What goes in the text box: 08/12/2026 (US) or 12/08/2026 (UK). */
export function formatTyped(iso: string, locale: DateLocale) {
  const p = fromISO(iso);
  if (!p) return "";
  return locale === "en-GB" ? `${pad(p.d)}/${pad(p.m)}/${p.y}` : `${pad(p.m)}/${pad(p.d)}/${p.y}`;
}

/** Long form for screen readers and tooltips: "Wednesday, August 12, 2026". */
export function formatLong(iso: string, locale: DateLocale) {
  const p = fromISO(iso);
  if (!p) return "";
  return new Date(Date.UTC(p.y, p.m - 1, p.d)).toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export const typedPlaceholder = (locale: DateLocale) => (locale === "en-GB" ? "DD/MM/YYYY" : "MM/DD/YYYY");

/**
 * Read what someone typed: 8/12/2026, 08-12-2026, 08.12.2026 or 2026-08-12.
 * Two-digit years mean 20xx. Returns null when it isn't a real date.
 */
export function parseTyped(text: string, locale: DateLocale): string | null {
  const s = text.trim();
  if (!s) return null;
  const iso = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(s);
  if (iso) {
    const [y, m, d] = iso.slice(1).map(Number);
    return isRealDate(y, m, d) ? toISO({ y, m, d }) : null;
  }
  const parts = /^(\d{1,2})[-/. ](\d{1,2})[-/. ](\d{2}|\d{4})$/.exec(s);
  if (!parts) return null;
  const [a, b, rawY] = parts.slice(1).map(Number);
  const y = rawY < 100 ? 2000 + rawY : rawY;
  const [m, d] = locale === "en-GB" ? [b, a] : [a, b];
  return isRealDate(y, m, d) ? toISO({ y, m, d }) : null;
}

/** How many week rows a month needs in the grid (4–6), so short months don't show an empty row. */
export function rowsNeeded(y: number, m: number, locale: DateLocale) {
  const lead = (weekday(toISO({ y, m, d: 1 })) - weekStart(locale) + 7) % 7;
  return Math.ceil((lead + daysInMonth(y, m)) / 7);
}
