"use client";

import { useState } from "react";

/**
 * Phase 1 demand test: "Get the full report — coming soon". Pro is built only if enough
 * people show interest, so a click is the signal. There is no backend yet, so this only
 * thanks the visitor and emits an event for analytics to count once it is wired up.
 */
export function WaitlistButton({
  source,
  label = "Get the full report — coming soon",
  variant = "solid",
}: {
  /** Where the click came from, e.g. "calculator" or "pro-tracker". */
  source: string;
  label?: string;
  variant?: "solid" | "outline";
}) {
  const [clicked, setClicked] = useState(false);

  if (clicked) {
    return (
      <p role="status" className="mt-4 rounded-card bg-surface p-3 text-[15px]">
        <strong>Thanks for your interest.</strong>{" "}
        <span className="text-muted">
          Pro isn&apos;t available yet. We&apos;re counting interest to decide whether to build it.
        </span>
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("wcg:waitlist", { detail: { source } }));
        setClicked(true);
      }}
      className={`mt-4 flex min-h-12 w-full items-center justify-center rounded-card px-5 py-2 text-center font-semibold ${
        variant === "solid"
          ? "bg-brand text-on-brand hover:bg-brand-hover"
          : "border border-brand text-brand hover:bg-brand-soft"
      }`}
    >
      {label}
    </button>
  );
}
