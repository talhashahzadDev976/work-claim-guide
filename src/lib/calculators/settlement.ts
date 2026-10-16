import { round2 } from "@/lib/format";
import type { Jurisdiction, SettlementRules } from "@/lib/rules/jurisdiction";

// CALC-05: each state has its own permanent disability formula module, named by
// `settlement_module` in its rule file. The output is always a low–high range, never one number.

export const BODY_PARTS = [
  { value: "back", label: "Back" },
  { value: "neck", label: "Neck" },
  { value: "shoulder", label: "Shoulder" },
  { value: "arm", label: "Arm" },
  { value: "hand", label: "Hand or fingers" },
  { value: "hip", label: "Hip" },
  { value: "leg", label: "Leg" },
  { value: "knee", label: "Knee" },
  { value: "foot", label: "Foot or toes" },
  { value: "eye", label: "Eye (vision)" },
  { value: "hearing", label: "Hearing" },
  { value: "other", label: "Other or whole body" },
] as const;

export const OCCUPATION_GROUPS = [
  { value: "office", label: "Office or desk work" },
  { value: "light", label: "Light physical work" },
  { value: "medium", label: "Medium physical work" },
  { value: "heavy", label: "Heavy physical work" },
] as const;

export type SettlementInput = {
  rating: number; // impairment %, 0–100
  bodyPart: string;
  age: number;
  occupation: string;
  aww: number;
  futureMedical: boolean;
};

export type SettlementStep = { label: string; value: string };

export type SettlementResult =
  | { status: "unavailable"; reason: "no-module" | "not-reviewed" | "missing-data" | "no-body-part" }
  | {
      status: "ok";
      low: number;
      high: number;
      weeklyRate: number;
      weeks: number;
      base: number;
      steps: SettlementStep[];
      rules: SettlementRules;
    };

type Module = (input: SettlementInput, rules: SettlementRules) => SettlementResult;

/**
 * Scheduled-loss formula: weeks = schedule weeks for the body part × rating;
 * weekly rate = AWW × PPD rate within the weekly min/max; range from the reviewed factors.
 */
const schedule: Module = (input, r) => {
  if (
    r.ppd_rate === null ||
    r.body_part_weeks === null ||
    r.range_low_factor === null ||
    r.range_high_factor === null
  ) {
    return { status: "unavailable", reason: "missing-data" };
  }
  const scheduleWeeks = r.body_part_weeks[input.bodyPart];
  if (scheduleWeeks === undefined) return { status: "unavailable", reason: "no-body-part" };

  let weeklyRate = round2(input.aww * r.ppd_rate);
  if (r.weekly_max !== null) weeklyRate = Math.min(weeklyRate, r.weekly_max);
  if (r.weekly_min !== null) weeklyRate = Math.max(weeklyRate, r.weekly_min);

  const weeks = round2((scheduleWeeks * input.rating) / 100);
  const base = round2(weeklyRate * weeks);

  return {
    status: "ok",
    low: round2(base * r.range_low_factor),
    high: round2(base * r.range_high_factor),
    weeklyRate,
    weeks,
    base,
    rules: r,
    steps: [
      { label: "Weekly rate", value: `AWW × ${r.ppd_rate}, within the weekly limits` },
      { label: "Weeks payable", value: `${scheduleWeeks} weeks × ${input.rating}% rating = ${weeks} weeks` },
      { label: "Formula value", value: "Weekly rate × weeks payable" },
      { label: "Range", value: `× ${r.range_low_factor} to × ${r.range_high_factor}, set during expert review` },
    ],
  };
};

/** Formula modules by `settlement_module` id. A state whose module isn't here can't be estimated yet. */
const MODULES: Record<string, Module> = { schedule };

export function settlementRange(j: Jurisdiction, input: SettlementInput): SettlementResult {
  const formula = j.settlement_module ? MODULES[j.settlement_module] : undefined;
  if (!formula) return { status: "unavailable", reason: "no-module" };
  if (!j.settlement_rules.reviewed_by) return { status: "unavailable", reason: "not-reviewed" };
  return formula(input, j.settlement_rules);
}

/** Can this state show a settlement range at all? Used to set expectations before the form is filled. */
export function settlementAvailable(j: Jurisdiction) {
  return Boolean(j.settlement_module && MODULES[j.settlement_module] && j.settlement_rules.reviewed_by);
}

/** Plain-language factors that push a settlement up or down, tailored to the inputs. */
export function settlementFactors(input: Partial<SettlementInput>) {
  const f: { direction: "up" | "down" | "depends"; text: string }[] = [];
  if (input.rating !== undefined) {
    f.push({
      direction: input.rating >= 20 ? "up" : "depends",
      text: "Your impairment rating. A higher rating usually means more weeks of benefits.",
    });
  }
  f.push({
    direction: "depends",
    text: "Your average weekly wage. Benefits are usually a share of it, up to the state's weekly maximum.",
  });
  if (input.futureMedical !== undefined) {
    f.push({
      direction: input.futureMedical ? "up" : "down",
      text: input.futureMedical
        ? "You may need future medical care. Settling it, or keeping it open, changes the value."
        : "No future medical care is expected, so there is less to settle.",
    });
  }
  f.push({
    direction: "depends",
    text: "Your age and type of work. Some states adjust for these; others do not.",
  });
  f.push({
    direction: "depends",
    text: "Disputes over the rating or whether the injury is work-related can lower what is offered.",
  });
  return f;
}
