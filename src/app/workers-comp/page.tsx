import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { StateDirectory } from "@/components/places/StateDirectory";
import { allJurisdictions, hasRates } from "@/lib/rules/server";
import { YEAR } from "@/lib/rules/facts";

export const metadata: Metadata = {
  title: `Workers' Comp Calculators by State (${YEAR})`,
  description:
    "Pick your state to see its workers' comp rules and free calculators: weekly benefit, average weekly wage, mileage and more.",
  alternates: { canonical: "/workers-comp/" },
};

export default function UsHubPage() {
  const states = allJurisdictions().map((j) => ({
    slug: j.slug,
    name: j.name,
    abbr: j.short_name,
    ready: hasRates(j),
  }));

  return (
    <main id="main">
      <Container className="pt-4 pb-12 sm:pt-6 lg:pb-16">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Workers' comp" }]} />
        <header className="mt-2 max-w-[720px]">
          <h1 className="text-[30px] leading-[1.15] lg:text-[40px]">Workers&apos; comp by state</h1>
          <p className="mt-3 text-lg text-ink/85">
            Every state sets its own benefit rate, weekly limits and deadlines. Pick the state where you were
            injured.
          </p>
        </header>
        <div className="mt-8">
          <StateDirectory states={states} />
        </div>
      </Container>
    </main>
  );
}
