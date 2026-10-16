import type { Metadata } from "next";
import { CalculatorBelow } from "@/components/calculators/page/CalculatorBelow";
import { CalculatorHeader } from "@/components/calculators/page/CalculatorHeader";
import { CalculatorPageShell } from "@/components/calculators/page/CalculatorPageShell";
import { InjuryCompensationCalculator } from "@/components/calculators/uk-compensation/InjuryCompensationCalculator";
import { UK_CALCULATORS } from "@/lib/calculators/catalog";
import { formatDate } from "@/lib/format";
import { YEAR } from "@/lib/rules/facts";
import { ukCompensationData } from "@/lib/rules/uk.server";

const PATH = "/uk/injury-compensation-calculator/";

export const metadata: Metadata = {
  title: `UK Personal Injury Compensation Calculator (${YEAR})`,
  description:
    "Estimate personal injury compensation in the UK: general damages for your injury plus your lost earnings, costs and care, with every step shown.",
  alternates: { canonical: PATH },
};

export default function UkCompensationPage() {
  const data = ukCompensationData();

  return (
    <CalculatorPageShell lang="en-GB">
      <CalculatorHeader
        crumbs={[{ href: "/", label: "Home" }, { href: "/uk/", label: "UK" }, { label: "Injury compensation" }]}
        title={`UK Personal Injury Compensation Calculator (${YEAR})`}
        intro="See what an injury claim could be worth: compensation for the injury itself, plus the money it has cost you, and how each part is worked out."
        trust={`Updated ${formatDate(data.last_reviewed, "DATE", "en-GB")} · Source: ${data.source.name} · Reviewed by [NAME]`}
        path={PATH}
        currency="GBP"
      />
      <InjuryCompensationCalculator data={data}>
        <CalculatorBelow
          placeName="UK"
          related={UK_CALCULATORS.filter((c) => c.href !== PATH).map((c) => ({
            title: c.title,
            href: c.live ? c.href : null,
          }))}
          hub={{ href: "/uk/", label: "All UK tools" }}
          explainerTitle="How UK injury compensation is worked out"
          explainer={
            <p>
              [300–600 word explainer: general damages for pain and suffering, special damages for financial losses,
              how care from family is valued, what affects the amount, and time limits for making a claim.]
            </p>
          }
          faq={[
            { q: "How long do I have to make a claim?", a: "[Answer]" },
            { q: "Is compensation taxed in the UK?", a: "[Answer]" },
            { q: "Can I claim if I was partly to blame?", a: "[Answer]" },
          ]}
        />
      </InjuryCompensationCalculator>
    </CalculatorPageShell>
  );
}
