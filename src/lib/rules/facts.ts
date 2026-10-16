import { formatUSD, placeholder } from "@/lib/format";
import { latestRateTable, rateWords, type Jurisdiction } from "@/lib/rules/jurisdiction";

export const YEAR = 2026;

/** Agency name, or a visible placeholder until it is filled in from the official source. */
export function agencyName(j: Jurisdiction, short = false) {
  return (short ? j.agency.short_name : null) ?? j.agency.name ?? "[STATE AGENCY]";
}

/** Rule chips shown on the state hub and every calculator (FR-04). */
export function ruleChips(j: Jurisdiction, withDeadline = false) {
  const t = latestRateTable(j);
  const chips = [
    { label: "Benefit rate", value: t ? `${rateWords(t.ttd_rate)} of wage` : "[RATE]" },
    { label: "Weekly max", value: placeholder(t?.weekly_max ?? null, "AMOUNT", formatUSD) },
    { label: "Weekly min", value: placeholder(t?.weekly_min ?? null, "AMOUNT", formatUSD) },
    { label: "Waiting period", value: placeholder(j.waiting_period_days, "DAYS", (d) => `${d} days`) },
  ];
  if (withDeadline) {
    chips.push({
      label: "Report injury within",
      value: placeholder(j.reporting_deadline_days, "DAYS", (d) => `${d} days`),
    });
  }
  return chips;
}
