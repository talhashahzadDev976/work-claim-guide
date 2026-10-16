const money = {
  USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  GBP: new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2, maximumFractionDigits: 2 }),
};

export type Currency = keyof typeof money;

/** Money always shows 2 decimals and its currency (CR-1). */
export const formatMoney = (n: number, currency: Currency = "USD") => money[currency].format(n);
export const formatUSD = (n: number) => money.USD.format(n);
export const formatGBP = (n: number) => money.GBP.format(n);

const number1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
export const formatMiles = (n: number) => `${number1.format(n)} ${n === 1 ? "mile" : "miles"}`;

/** Round half away from zero to 2 decimals, avoiding float drift (CR-1). */
export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Parse what people type into money fields ("$1,200", "1200.50"). NaN when it isn't a number. */
export function parseMoney(s: string) {
  const n = Number(s.replace(/[$£,\s]/g, ""));
  return s.trim() === "" ? NaN : n;
}

/** Today's date in the visitor's time zone, as YYYY-MM-DD. Call from effects or handlers only. */
export function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

/** Show a rule value, or a visible placeholder while the official figure is still to be filled in. */
export function placeholder<T>(value: T | null, label: string, show: (v: T) => string = String) {
  return value === null ? `[${label}]` : show(value);
}

export function formatDate(iso: string | null, label = "DATE", locale: "en-US" | "en-GB" = "en-US") {
  if (!iso) return `[${label}]`;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
