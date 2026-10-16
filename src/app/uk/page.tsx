import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { UK_CALCULATORS } from "@/lib/calculators/catalog";
import { YEAR } from "@/lib/rules/facts";

export const metadata: Metadata = {
  title: `UK Injury Compensation and Sick Pay Calculators (${YEAR})`,
  description:
    "Free UK tools for people injured at work: personal injury compensation, Statutory Sick Pay and Industrial Injuries Disablement Benefit.",
  alternates: { canonical: "/uk/" },
};

export default function UkHubPage() {
  return (
    <main id="main" lang="en-GB">
      <Container className="pt-4 pb-12 sm:pt-6 lg:pb-16">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "UK" }]} />
        <header className="mt-2 max-w-[720px]">
          <h1 className="text-[30px] leading-[1.15] lg:text-[40px]">Injured at work in the UK</h1>
          <p className="mt-3 text-lg text-ink/85">
            Free tools to estimate compensation and the benefits you may be owed, with each step explained.
          </p>
        </header>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {UK_CALCULATORS.map((c) => {
            const inner = (
              <>
                <span className="block text-lg font-semibold">{c.title}</span>
                <span className="mt-1 block text-muted">{c.blurb}</span>
                {c.live ? (
                  <span className="mt-3 inline-block font-semibold text-brand">Open calculator ›</span>
                ) : (
                  <span className="mt-3 inline-block rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand">
                    Coming soon
                  </span>
                )}
              </>
            );
            const box = "block h-full rounded-card border border-line bg-surface p-5";
            return (
              <li key={c.slug}>
                {c.live ? (
                  <Link href={c.href} className={`${box} transition-colors hover:border-brand`}>
                    {inner}
                  </Link>
                ) : (
                  <div className={box}>{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </main>
  );
}
