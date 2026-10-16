import type { Metadata } from "next";
import { US_CALCULATORS, stateCalculatorHref } from "@/lib/calculators/catalog";
import { formatDate } from "@/lib/format";
import { agencyName, YEAR } from "@/lib/rules/facts";
import type { Jurisdiction } from "@/lib/rules/jurisdiction";
import { allJurisdictionSlugs } from "@/lib/rules/server";

// Shared helpers for the /workers-comp/[state]/<calculator>/ routes, so each page file stays short.

export function stateStaticParams() {
  return allJurisdictionSlugs().map((state) => ({ state }));
}

export function calculatorPath(j: Jurisdiction, slug: string) {
  return stateCalculatorHref(j.slug, slug);
}

export function calculatorMetadata(j: Jurisdiction | undefined, slug: string, title: string, description: string): Metadata {
  if (!j) return {};
  return { title: `${j.name} ${title} (${YEAR})`, description, alternates: { canonical: calculatorPath(j, slug) } };
}

export function stateCrumbs(j: Jurisdiction, label: string) {
  return [
    { href: "/", label: "Home" },
    { href: "/workers-comp/", label: "Workers' comp" },
    { href: `/workers-comp/${j.slug}/`, label: j.name },
    { label },
  ];
}

export function stateTrust(j: Jurisdiction) {
  return `Updated ${formatDate(j.last_reviewed)} · Source: ${agencyName(j)} · Reviewed by [NAME]`;
}

/** The other calculators for this state (IL-1); live ones link, the rest say "coming soon". */
export function relatedCalculators(j: Jurisdiction, currentSlug: string) {
  return US_CALCULATORS.filter((c) => c.slug !== currentSlug).map((c) => ({
    title: c.title,
    href: c.live ? stateCalculatorHref(j.slug, c.slug) : null,
  }));
}

export function stateHubLink(j: Jurisdiction) {
  return { href: `/workers-comp/${j.slug}/`, label: `All ${j.name} rules` };
}
