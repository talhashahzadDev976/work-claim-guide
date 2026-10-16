import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdSlot } from "@/components/ads/AdSlot";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { Faq } from "@/components/ui/Faq";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { RuleChip } from "@/components/ui/RuleChip";
import { formatDate, placeholder } from "@/lib/format";
import { allJurisdictionSlugs, getJurisdiction, hasRates } from "@/lib/rules/server";
import { US_CALCULATORS } from "@/lib/calculators/catalog";
import { agencyName, ruleChips, YEAR } from "@/lib/rules/facts";

type Props = PageProps<"/workers-comp/[state]">;

export function generateStaticParams() {
  return allJurisdictionSlugs().map((state) => ({ state }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const j = getJurisdiction((await params).state);
  if (!j) return {};
  return {
    title: `${j.name} Workers' Comp Benefits (${YEAR})`,
    description: `${j.name} workers' comp rules in plain English: benefit rate, weekly max and min, waiting period and deadlines, with free calculators.`,
    alternates: { canonical: `/workers-comp/${j.slug}/` },
  };
}

const JUMP = [
  { id: "rules", label: "Key rules" },
  { id: "calculators", label: "Calculators" },
  { id: "checklist", label: "What to do after an injury" },
  { id: "faq", label: "Questions" },
  { id: "guides", label: "Guides" },
];

// The shell renders instantly on navigation; the state's content streams in behind a skeleton.
// Every state is prerendered, so a full page load gets the complete HTML.
export default function StateHubPage({ params }: Props) {
  return (
    <main id="main">
      <Container className="pt-4 pb-12 sm:pt-6 lg:pb-16">
        <Suspense fallback={<PageSkeleton variant="hub" />}>
          <StateHubContent params={params} />
        </Suspense>
      </Container>
    </main>
  );
}

async function StateHubContent({ params }: { params: Props["params"] }) {
  const j = getJurisdiction((await params).state);
  if (!j) notFound();

  const base = `/workers-comp/${j.slug}`;
  const deadline = placeholder(j.reporting_deadline_days, "DAYS", (d) => `${d} days`);

  const steps = [
    { title: "Get medical care", body: "Tell the doctor or clinic the injury happened at work, so it is recorded that way." },
    {
      title: "Report the injury to your employer",
      body: `Do it in writing and keep a copy. In ${j.name} the deadline is ${deadline} from the injury.`,
    },
    { title: "Ask for the claim form", body: "Your employer should give you the form and tell you who their insurer is." },
    { title: "Keep every document", body: "Letters, medical bills, pay slips and anything from the insurer or adjuster." },
    { title: "Log appointments and miles", body: "Note the date, place and distance of every medical trip. Many states repay mileage." },
    {
      title: "Check your payments",
      body: "Compare each payment with your estimate, and ask the adjuster about any gap.",
      href: `${base}/weekly-benefit-calculator/`,
      cta: "Estimate your weekly benefit",
    },
  ];

  const faq = [
    { q: `Who pays workers' comp in ${j.name}?`, a: "[Answer]" },
    { q: `How much does workers' comp pay in ${j.name}?`, a: "[Answer]" },
    { q: "How long can I get weekly payments?", a: "[Answer]" },
    { q: "Is there a waiting period before payments start?", a: "[Answer]" },
    { q: "Can I choose my own doctor?", a: "[Answer]" },
    { q: "What if my claim is denied?", a: "[Answer]" },
  ];

  return (
    <>
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/workers-comp/", label: "Workers' comp" },
            { label: j.name },
          ]}
        />

        <header className="mt-2 max-w-[720px]">
          <h1 className="text-[30px] leading-[1.15] lg:text-[40px]">
            {j.name} Workers&apos; Comp Benefits ({YEAR})
          </h1>
          <p className="mt-3 text-lg text-ink/85">
            The rules that decide what you are paid after a work injury in {j.name}, and free calculators to work out
            your own numbers.
          </p>
          <p className="mt-2 text-sm text-muted">
            Updated {formatDate(j.last_reviewed)} · Source: {agencyName(j)} · Reviewed by [NAME] ·{" "}
            <Link href={`/methodology/${j.slug}/`} className="underline underline-offset-2 hover:text-brand">
              How we check these rules
            </Link>
          </p>
        </header>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
          <div className="min-w-0">
            {!hasRates(j) && (
              <p className="mb-6 rounded-card border border-line bg-surface p-4 text-[15px]">
                <strong>We are still checking {j.name}&apos;s official figures.</strong>{" "}
                <span className="text-muted">
                  Rules marked with brackets will be filled in from the state agency, with their effective dates.
                </span>
              </p>
            )}

            <section id="rules" aria-labelledby="rules-heading" className="scroll-mt-4">
              <h2 id="rules-heading" className="text-2xl lg:text-[28px]">
                Key rules
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {ruleChips(j, true).map((r) => (
                  <RuleChip key={r.label} label={r.label} value={r.value} source={agencyName(j)} />
                ))}
              </ul>
            </section>

            <section id="calculators" aria-labelledby="calc-heading" className="mt-10 scroll-mt-4">
              <h2 id="calc-heading" className="text-2xl lg:text-[28px]">
                {j.name} calculators
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
                {US_CALCULATORS.map((c) => {
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
                        <Link href={`${base}/${c.slug}/`} className={`${box} transition-colors hover:border-brand`}>
                          {inner}
                        </Link>
                      ) : (
                        <div className={box}>{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>

            <section id="checklist" aria-labelledby="check-heading" className="mt-10 scroll-mt-4">
              <h2 id="check-heading" className="text-2xl lg:text-[28px]">
                What to do after a work injury in {j.name}
              </h2>
              <ol className="mt-4 space-y-3">
                {steps.map((s, i) => (
                  <li key={s.title} className="flex gap-4 rounded-card border border-line bg-surface p-4 sm:p-5">
                    <span
                      aria-hidden
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand"
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold">{s.title}</span>
                      <span className="block text-muted">{s.body}</span>
                      {s.href && (
                        <Link href={s.href} className="mt-1 inline-block font-semibold text-brand underline underline-offset-2">
                          {s.cta}
                        </Link>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Slot C: after the checklist. */}
            <AdSlot size="rectangle" className="mx-auto mt-10 max-w-[336px]" />

            <section id="faq" aria-labelledby="faq-heading" className="mt-10 scroll-mt-4">
              <h2 id="faq-heading" className="text-2xl lg:text-[28px]">
                {j.name} workers&apos; comp questions
              </h2>
              <div className="mt-4">
                <Faq items={faq} />
              </div>
            </section>

            <section id="guides" aria-labelledby="guides-heading" className="mt-10 scroll-mt-4">
              <h2 id="guides-heading" className="text-2xl lg:text-[28px]">
                Guides
              </h2>
              <ul className="mt-4 border-t border-line">
                {[
                  `${j.name} workers' comp: complete benefits guide`,
                  "How workers' comp weekly benefits are calculated",
                  "What to do in the first 7 days after a work injury",
                ].map((g) => (
                  <li key={g} className="border-b border-line py-3.5 text-lg">
                    {g}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Desktop right rail: jump links and slot B. */}
          <aside className="hidden lg:block">
            <div className="rail-sticky flex flex-col gap-4">
              <nav aria-label="On this page" className="rounded-card border border-line bg-surface p-5">
                <p className="text-[13px] font-semibold tracking-[0.06em] text-muted uppercase">Jump to</p>
                <ul className="mt-2 space-y-1">
                  {JUMP.map((s) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="block rounded-md py-1 text-[15px] text-brand hover:underline">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <AdSlot size="rectangle" />
            </div>
          </aside>
        </div>
    </>
  );
}
