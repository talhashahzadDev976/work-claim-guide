import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MileageCalculator } from "@/components/calculators/mileage/MileageCalculator";
import { CalculatorBelow } from "@/components/calculators/page/CalculatorBelow";
import { CalculatorHeader } from "@/components/calculators/page/CalculatorHeader";
import { CalculatorPageShell } from "@/components/calculators/page/CalculatorPageShell";
import { formatUSD, placeholder } from "@/lib/format";
import { agencyName, YEAR } from "@/lib/rules/facts";
import { latestRateTable } from "@/lib/rules/jurisdiction";
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

type Props = PageProps<"/workers-comp/[state]/mileage-reimbursement-calculator">;

const SLUG = "mileage-reimbursement-calculator";

export const generateStaticParams = stateStaticParams;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const j = getJurisdiction((await params).state);
  return calculatorMetadata(
    j,
    SLUG,
    "Workers' Comp Mileage Reimbursement Calculator",
    `Log your trips to medical appointments in ${j?.name} and work out what to claim, with a printable log for your adjuster.`,
  );
}

export default function MileagePage({ params }: Props) {
  return (
    <CalculatorPageShell streamed>
      <Content params={params} />
    </CalculatorPageShell>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const j = getJurisdiction((await params).state);
  if (!j) notFound();

  const rate = latestRateTable(j)?.mileage_rate_per_mile ?? null;

  return (
    <>
      <CalculatorHeader
        crumbs={stateCrumbs(j, "Medical mileage")}
        title={`${j.name} Workers' Comp Mileage Reimbursement Calculator (${YEAR})`}
        intro="Log every trip to a doctor, therapist or medical exam, see what you can claim, and print a clean log for your adjuster."
        trust={stateTrust(j)}
        path={calculatorPath(j, SLUG)}
      />
      <MileageCalculator jurisdiction={j}>
        <CalculatorBelow
          placeName={j.name}
          related={relatedCalculators(j, SLUG)}
          hub={stateHubLink(j)}
          rules={[{ label: "Mileage rate", value: placeholder(rate, "RATE", (r) => `${formatUSD(r)} a mile`) }]}
          rulesSource={agencyName(j)}
          explainerTitle={`How medical mileage works in ${j.name}`}
          explainer={
            <p>
              [300–600 word explainer: which trips count (doctor, therapy, pharmacy, medical exams), how miles are
              measured, the state rate per mile and when it changes, parking and tolls, and how to submit the log.]
            </p>
          }
          faq={[
            { q: `Can I claim mileage for medical appointments in ${j.name}?`, a: "[Answer]" },
            { q: "Do trips to the pharmacy count?", a: "[Answer]" },
            { q: "How often should I send my mileage log?", a: "[Answer]" },
          ]}
        />
      </MileageCalculator>
    </>
  );
}
