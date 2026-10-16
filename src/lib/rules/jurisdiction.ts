// Types and pure helpers for jurisdiction rule data. Safe to import from client components;
// loading the data files lives in ./server.ts.

/** Permanent disability parameters for the settlement estimator (CALC-05). */
export type SettlementRules = {
  effective_from: string | null;
  /** Share of AWW paid for each week of permanent disability. */
  ppd_rate: number | null;
  weekly_max: number | null;
  weekly_min: number | null;
  /** Weeks payable at a 100% rating, per body part (the state's schedule). */
  body_part_weeks: Record<string, number> | null;
  /** Range around the formula value, set during expert review. */
  range_low_factor: number | null;
  range_high_factor: number | null;
  source_url: string | null;
  /** The spec only allows settlement estimates after a licensed professional has reviewed them. */
  reviewed_by: string | null;
};

export type RateTable = {
  effective_from: string;
  ttd_rate: number;
  weekly_max: number | null;
  weekly_min: number | null;
  mileage_rate_per_mile: number | null;
  source_url: string | null;
};

export type Jurisdiction = {
  jurisdiction: string;
  slug: string;
  name: string;
  short_name: string;
  agency: { name: string | null; short_name: string | null; url: string | null };
  /** Empty until the state's official rates have been checked and entered. */
  rate_tables: RateTable[];
  pays_actual_wage_below_min: boolean | null;
  waiting_period_days: number | null;
  retroactive_after_days: number | null;
  aww_lookback_weeks: number | null;
  reporting_deadline_days: number | null;
  settlement_module: string | null;
  settlement_rules: SettlementRules;
  last_reviewed: string | null;
};

function newestFirst(tables: RateTable[]) {
  return [...tables].sort((a, b) => b.effective_from.localeCompare(a.effective_from));
}

/** The rate table in effect on `date` (YYYY-MM-DD), or undefined when the date predates our data. */
export function rateTableFor(j: Jurisdiction, date: string): RateTable | undefined {
  return newestFirst(j.rate_tables).find((t) => t.effective_from <= date);
}

export function latestRateTable(j: Jurisdiction): RateTable | undefined {
  return newestFirst(j.rate_tables)[0];
}

export function rateWords(rate: number) {
  return Math.abs(rate - 2 / 3) < 0.001 ? "two-thirds" : `${(rate * 100).toFixed(2).replace(/\.?0+$/, "")}%`;
}
