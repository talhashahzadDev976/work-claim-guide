import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalculatorBelow } from "@/components/calculators/page/CalculatorBelow";
import { CalculatorHeader } from "@/components/calculators/page/CalculatorHeader";
import { CalculatorPageShell } from "@/components/calculators/page/CalculatorPageShell";
import { WeeklyBenefitCalculator } from "@/components/calculators/weekly-benefit/WeeklyBenefitCalculator";
import { agencyName, ruleChips, YEAR } from "@/lib/rules/facts";
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

type Props = PageProps<"/workers-comp/[state]/weekly-benefit-calculator">;

const SLUG = "weekly-benefit-calculator";

export const generateStaticParams = stateStaticParams;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const j = getJurisdiction((await params).state);
  return calculatorMetadata(
    j,
    SLUG,
    "Workers' Comp Weekly Benefit Calculator",
    `Estimate your ${j?.name} temporary disability payment each week, with every step shown and the official state rates.`,
  );
}

export default function WeeklyBenefitPage({ params }: Props) {
  return (
    <CalculatorPageShell streamed>
      <Content params={params} />
    </CalculatorPageShell>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const j = getJurisdiction((await params).state);
  if (!j) notFound();

  return (
    <>
      <CalculatorHeader
        crumbs={stateCrumbs(j, "Weekly benefit")}
        title={`${j.name} Workers' Comp Weekly Benefit Calculator (${YEAR})`}
        intro="See how much temporary disability you can expect each week while you are off work, and exactly how it is worked out."
        trust={stateTrust(j)}
        path={calculatorPath(j, SLUG)}
      />
      <WeeklyBenefitCalculator jurisdiction={j}>
        <CalculatorBelow
          placeName={j.name}
          related={relatedCalculators(j, SLUG)}
          hub={stateHubLink(j)}
          rules={ruleChips(j)}
          rulesSource={agencyName(j)}
          explainerTitle={`How ${j.name} calculates your weekly benefit`}
          explainer={
            <p>
              [300–600 word explainer: what temporary total disability is, how average weekly wage is found, how the
              cap and floor work, and when payments start.]
            </p>
          }
          faq={[
            { q: `Is workers' comp taxable in ${j.name}?`, a: "[Answer]" },
            { q: "When does my first payment arrive?", a: "[Answer]" },
            { q: "What if I had two jobs?", a: "[Answer]" },
          ]}
        />
      </WeeklyBenefitCalculator>
    </>
  );
}
