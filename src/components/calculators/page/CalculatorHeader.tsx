import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import { SITE_URL } from "@/lib/site";

/** Breadcrumb, H1, one-line intro and trust bar (§9.3 step 1), plus WebApplication schema (NFR-04). */
export function CalculatorHeader({
  crumbs,
  title,
  intro,
  trust,
  path,
  currency = "USD",
}: {
  crumbs: Crumb[];
  title: string;
  intro: string;
  trust: React.ReactNode;
  /** Canonical path, for structured data. */
  path: string;
  currency?: "USD" | "GBP";
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    url: SITE_URL + path,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: currency },
  };

  return (
    <>
      <Breadcrumbs items={crumbs} />
      <header className="mt-2 mb-5 max-w-[720px] sm:mb-6">
        <h1 className="text-[30px] leading-[1.15] lg:text-[40px]">{title}</h1>
        <p className="mt-3 hidden text-lg text-ink/85 sm:block">{intro}</p>
        <p className="mt-2 text-sm text-muted">{trust}</p>
      </header>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
