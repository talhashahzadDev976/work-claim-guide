import { round2 } from "@/lib/format";
import { rateTableFor, type Jurisdiction, type RateTable } from "@/lib/rules/jurisdiction";

export type PayType = "weekly" | "hourly" | "yearly";

export type WeeklyBenefitInput = {
  payType: PayType;
  amount: number;
  hoursPerWeek?: number;
  injuryDate: string;
};

export type WeeklyBenefitResult =
  | { status: "no-rates" }
  | { status: "not-covered"; earliest: string }
  | {
      status: "ok";
      aww: number;
      rate: number;
      raw: number;
      weekly: number;
      monthly: number;
      applied: "max" | "min" | "actual-wage" | null;
      table: RateTable;
    };

export function averageWeeklyWage({ payType, amount, hoursPerWeek }: WeeklyBenefitInput) {
  if (payType === "hourly") return round2(amount * (hoursPerWeek ?? 0));
  if (payType === "yearly") return round2(amount / 52);
  return round2(amount);
}

/** TTD = min(max(AWW × r, min_week), max_week), CALC-02. */
export function weeklyBenefit(j: Jurisdiction, input: WeeklyBenefitInput): WeeklyBenefitResult {
  if (j.rate_tables.length === 0) return { status: "no-rates" };
  const table = rateTableFor(j, input.injuryDate);
  if (!table) {
    const earliest = j.rate_tables.map((t) => t.effective_from).sort()[0];
    return { status: "not-covered", earliest };
  }

  const aww = averageWeeklyWage(input);
  const raw = round2(aww * table.ttd_rate);
  let weekly = raw;
  let applied: "max" | "min" | "actual-wage" | null = null;

  if (table.weekly_max !== null && raw > table.weekly_max) {
    weekly = table.weekly_max;
    applied = "max";
  } else if (table.weekly_min !== null && raw < table.weekly_min) {
    if (j.pays_actual_wage_below_min && aww < table.weekly_min) {
      weekly = aww;
      applied = "actual-wage";
    } else {
      weekly = table.weekly_min;
      applied = "min";
    }
  }

  return {
    status: "ok",
    aww,
    rate: table.ttd_rate,
    raw,
    weekly,
    monthly: round2((weekly * 52) / 12),
    applied,
    table,
  };
}
