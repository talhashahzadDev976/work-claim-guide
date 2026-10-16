"use client";

import Link from "next/link";
import { stateCalculatorHref } from "@/lib/calculators/catalog";
import { DEFAULT_PLACE } from "@/lib/places/places";
import { usePlace } from "@/lib/places/store";

/** Home "Popular calculators" (§9.1): US cards open the visitor's remembered state (FR-02). */
export function PopularCalculators() {
  const place = usePlace();
  const state = place === "uk" ? DEFAULT_PLACE : place;

  const cards = [
    { title: "Weekly benefit", blurb: "What you get while off work", href: stateCalculatorHref(state, "weekly-benefit-calculator") },
    { title: "Settlement range", blurb: "From your impairment rating", href: stateCalculatorHref(state, "settlement-calculator") },
    { title: "Medical mileage", blurb: "Claim your travel to appointments", href: stateCalculatorHref(state, "mileage-reimbursement-calculator") },
    { title: "UK compensation", blurb: "Personal injury estimate", href: "/uk/injury-compensation-calculator/" },
  ];

  return (
    <ul className="mt-5 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {cards.map((c) => (
        <li key={c.title}>
          <Link
            href={c.href}
            className="group flex h-full min-h-[132px] flex-col rounded-card border border-line bg-surface p-5 transition-colors hover:border-brand sm:min-h-[150px]"
          >
            <span className="block text-lg font-semibold">{c.title}</span>
            <span className="mt-1 block text-muted">{c.blurb}</span>
            <span className="mt-auto pt-3 font-semibold text-brand">
              Open <span aria-hidden className="inline-block transition-transform group-hover:translate-x-0.5">›</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
