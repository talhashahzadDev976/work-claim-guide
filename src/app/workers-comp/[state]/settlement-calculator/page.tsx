import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalculatorBelow } from "@/components/calculators/page/CalculatorBelow";
import { CalculatorHeader } from "@/components/calculators/page/CalculatorHeader";
import { CalculatorPageShell } from "@/components/calculators/page/CalculatorPageShell";
import { SettlementCalculator } from "@/components/calculators/settlement/SettlementCalculator";
import { settlementAvailable } from "@/lib/calculators/settlement";
import { formatUSD, placeholder } from "@/lib/format";
import { agencyName, YEAR } from "@/lib/rules/facts";
import { getJurisdiction } from "@/lib/rules/server";
import {
  calculatorMetadata,
  calculatorPath,
  relatedCalculators,
  stateCrumbs,
  stateHubLink,
  stateStaticParams,
  stateTrust,
} from "../_lib/calculator-page";

type Props = PageProps<"/workers-comp/[state]/settlement-calculator">;

const SLUG = "settlement-calculator";

export const generateStaticParams = stateStaticParams;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const j = getJurisdiction((await params).state);
  return calculatorMetadata(
    j,
    SLUG,
    "Workers' Comp Settlement Calculator",
    `See a low-to-high settlement range for a ${j?.name} workers' comp claim from your impairment rating, and what moves it up or down.`,
  );
}

export default function SettlementPage({ params }: Props) {
  return (
    <CalculatorPageShell streamed>
      <Content params={params} />
    </CalculatorPageShell>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const j = getJurisdiction((await params).state);
  if (!j) notFound();

  const r = j.settlement_rules;

  return (
    <>
      <CalculatorHeader
        crumbs={stateCrumbs(j, "Settlement range")}
        title={`${j.name} Workers' Comp Settlement Calculator (${YEAR})`}
        intro="See a low-to-high range for a permanent disability settlement, worked out from your rating, and what pushes it up or down."
        trust={stateTrust(j)}
        path={calculatorPath(j, SLUG)}
      />
      {!settlementAvailable(j) && (
        <p className="mb-5 max-w-[720px] rounded-card border border-line bg-surface p-4 text-[15px]">
          <strong>Settlement ranges for {j.name} are coming soon.</strong>{" "}
          <span className="text-muted">
            We will only show a range after {j.name}&apos;s rules are checked and a licensed professional has reviewed
            the calculator. You can still see what affects a settlement below.
          </span>
        </p>
      )}
      <SettlementCalculator jurisdiction={j}>
        <CalculatorBelow
          placeName={j.name}
          related={relatedCalculators(j, SLUG)}
          hub={stateHubLink(j)}
          rules={[
            { label: "Permanent disability rate", value: placeholder(r.ppd_rate, "RATE", (v) => `${v * 100}% of wage`) },
            { label: "Weekly max", value: placeholder(r.weekly_max, "AMOUNT", formatUSD) },
            { label: "Weekly min", value: placeholder(r.weekly_min, "AMOUNT", formatUSD) },
          ]}
          rulesSource={agencyName(j)}
          explainerTitle={`How ${j.name} values a permanent disability`}
          explainer={
            <p>
              [300–600 word explainer: what an impairment rating is, how {j.name} turns it into weeks of benefits, how
              future medical care is handled, and how a settlement differs from the formula value.]
            </p>
          }
          faq={[
            { q: `What is the average workers' comp settlement in ${j.name}?`, a: "[Answer]" },
            { q: "Do I have to accept the first offer?", a: "[Answer]" },
            { q: "Is a settlement taxable?", a: "[Answer]" },
          ]}
        />
      </SettlementCalculator>
    </>
  );
}
