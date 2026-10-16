import Link from "next/link";
import { Faq, type FaqItem } from "@/components/ui/Faq";
import { RuleChip } from "@/components/ui/RuleChip";

export type RelatedCalculator = { title: string; href: string | null };

/**
 * Everything under the calculator (§9.3 steps 6–7): related calculators (IL-1), rules at a glance,
 * the explainer and the FAQ.
 */
export function CalculatorBelow({
  placeName,
  related,
  hub,
  rules,
  rulesSource,
  explainerTitle,
  explainer,
  faq,
}: {
  placeName: string;
  related: RelatedCalculator[];
  hub: { href: string; label: string };
  rules?: { label: string; value: string }[];
  rulesSource?: string;
  explainerTitle: string;
  explainer: React.ReactNode;
  faq: FaqItem[];
}) {
  return (
    <div className="max-w-[720px] pt-4 lg:pt-6">
      {/* Phones: a tappable list right after the result. Desktop: pills at the end. */}
      <section aria-labelledby="more-heading" className="lg:hidden">
        <h2 id="more-heading" className="font-sans text-xl font-semibold">
          More {placeName} calculators
        </h2>
        <ul className="mt-3 border-t border-line">
          {related.map((c) => (
            <li key={c.title} className="border-b border-line">
              {c.href ? (
                <Link href={c.href} className="flex items-center justify-between py-3.5 text-lg hover:text-brand">
                  {c.title}
                  <span aria-hidden className="text-muted">
                    ›
                  </span>
                </Link>
              ) : (
                <span className="flex items-center justify-between py-3.5 text-lg">
                  {c.title}
                  <span className="text-sm text-muted">Coming soon</span>
                </span>
              )}
            </li>
          ))}
          <li className="border-b border-line">
            <Link href={hub.href} className="flex items-center justify-between py-3.5 text-lg text-brand">
              {hub.label}
              <span aria-hidden>›</span>
            </Link>
          </li>
        </ul>
      </section>

      {rules && rules.length > 0 && (
        <section aria-labelledby="rules-heading" className="mt-10 lg:mt-6">
          <h2 id="rules-heading" className="text-2xl lg:text-[28px]">
            {placeName} rules at a glance
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {rules.map((r) => (
              <RuleChip key={r.label} label={r.label} value={r.value} source={rulesSource} />
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="how-heading" className="mt-10">
        <h2 id="how-heading" className="text-2xl lg:text-[28px]">
          {explainerTitle}
        </h2>
        <div className="mt-3 max-w-[70ch] text-ink/85">{explainer}</div>
      </section>

      <section aria-labelledby="faq-heading" className="mt-10">
        <h2 id="faq-heading" className="text-2xl lg:text-[28px]">
          Questions people ask
        </h2>
        <div className="mt-4">
          <Faq items={faq} />
        </div>
      </section>

      <section aria-labelledby="more-heading-lg" className="mt-10 hidden lg:block">
        <h2 id="more-heading-lg" className="font-sans text-xl font-semibold">
          More {placeName} calculators
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {related.map((c) => (
            <li key={c.title}>
              {c.href ? (
                <Link
                  href={c.href}
                  className="block rounded-full border border-line bg-surface px-4 py-2 text-[15px] hover:border-brand hover:text-brand"
                >
                  {c.title}
                </Link>
              ) : (
                <span className="block rounded-full border border-line bg-surface px-4 py-2 text-[15px]">
                  {c.title} <span className="text-muted">· soon</span>
                </span>
              )}
            </li>
          ))}
          <li>
            <Link
              href={hub.href}
              className="block rounded-full border border-brand px-4 py-2 text-[15px] font-semibold text-brand hover:bg-brand-soft"
            >
              {hub.label} ›
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
