import { round2 } from "@/lib/format";

// CALC-06: general damages from guideline brackets, plus special damages (losses and costs).

export type Bracket = { low: number; high: number } | null;

export type UkCompensationData = {
  jurisdiction: string;
  name: string;
  source: { name: string; edition: string | null; url: string | null };
  effective_from: string | null;
  reviewed_by: string | null;
  last_reviewed: string | null;
  care: { hourly_rate: number | null; family_discount: number | null; source_url: string | null };
  severities: { id: string; label: string; description: string }[];
  injuries: { id: string; label: string; brackets: Record<string, Bracket> }[];
};

export type UkCompensationInput = {
  injury: string;
  severity: string;
  lostEarnings: number;
  costs: number;
  careHours: number;
};

export type UkCompensationResult = {
  /** null until the bracket figures are entered and reviewed. */
  general: Bracket;
  lostEarnings: number;
  costs: number;
  careHours: number;
  /** null until a care rate is entered. */
  careValue: number | null;
  special: number;
  /** null whenever general damages are not available. */
  combined: Bracket;
};

export function ukCompensation(data: UkCompensationData, input: UkCompensationInput): UkCompensationResult {
  const injury = data.injuries.find((i) => i.id === input.injury);
  const bracket = injury?.brackets[input.severity] ?? null;
  const general = bracket && data.reviewed_by ? bracket : null;

  const { hourly_rate, family_discount } = data.care;
  let careValue: number | null = 0;
  if (input.careHours > 0) {
    careValue = hourly_rate === null ? null : round2(input.careHours * hourly_rate * (1 - (family_discount ?? 0)));
  }

  const special = round2(input.lostEarnings + input.costs + (careValue ?? 0));

  return {
    general,
    lostEarnings: round2(input.lostEarnings),
    costs: round2(input.costs),
    careHours: input.careHours,
    careValue,
    special,
    combined: general ? { low: round2(general.low + special), high: round2(general.high + special) } : null,
  };
}
