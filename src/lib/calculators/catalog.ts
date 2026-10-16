/** Every US state calculator, in the order shown on hubs and "More calculators" lists. */
export type CalculatorEntry = {
  slug: string;
  title: string;
  blurb: string;
  live: boolean;
};

export const US_CALCULATORS: CalculatorEntry[] = [
  { slug: "weekly-benefit-calculator", title: "Weekly benefit", blurb: "What you get each week while off work", live: true },
  { slug: "mileage-reimbursement-calculator", title: "Medical mileage", blurb: "Claim your travel to appointments", live: true },
  { slug: "settlement-calculator", title: "Settlement range", blurb: "From your impairment rating", live: true },
  { slug: "average-weekly-wage-calculator", title: "Average weekly wage", blurb: "The pay figure your benefit is based on", live: false },
  { slug: "back-pay-calculator", title: "Back pay and waiting period", blurb: "What you are owed for missed weeks", live: false },
];

export const UK_CALCULATORS: (CalculatorEntry & { href: string })[] = [
  {
    slug: "injury-compensation-calculator",
    href: "/uk/injury-compensation-calculator/",
    title: "Injury compensation",
    blurb: "Personal injury estimate",
    live: true,
  },
  { slug: "statutory-sick-pay-calculator", href: "/uk/statutory-sick-pay-calculator/", title: "Statutory Sick Pay", blurb: "What your employer must pay while you're off sick", live: false },
  { slug: "industrial-injuries-benefit-calculator", href: "/uk/industrial-injuries-benefit-calculator/", title: "Industrial Injuries Disablement Benefit", blurb: "Weekly benefit by disablement %", live: false },
];

export function stateCalculatorHref(state: string, slug: string) {
  return `/workers-comp/${state}/${slug}/`;
}
